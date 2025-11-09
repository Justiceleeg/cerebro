import { WebSocketServer, WebSocket } from 'ws';
import { StreamGenerator } from '../streams/stream-generator.js';
import streamCadences from '$lib/server/config/stream-cadences.json';
import baselineMetrics from '$lib/server/config/baseline-metrics.json';
import type { StreamEvent } from '../types/core.js';

// WebSocket server instance
let wss: WebSocketServer | null = null;

// Client connection state
interface ClientState {
	ws: WebSocket;
	subscriptions: string[]; // Array of subscription patterns (e.g., ["customer.*", "session.*"])
	lastPongTime: number; // Timestamp of last pong received
	pingInterval: NodeJS.Timeout | null;
	timeoutTimer: NodeJS.Timeout | null;
	streamIntervals: Map<string, NodeJS.Timeout>; // Map of stream name to interval
	eventBuffer: StreamEvent[]; // Buffer for batching events
	batchTimer: NodeJS.Timeout | null; // Timer for batch flushing
}

const clientStates = new Map<WebSocket, ClientState>();

// Recent event buffer for catchup (stores last 5 minutes or 1000 events per stream)
interface BufferedEvent {
	event: StreamEvent;
	timestamp: number; // Unix timestamp in milliseconds
}

const recentEventBuffer = new Map<string, BufferedEvent[]>(); // Map of stream name to buffered events
const BUFFER_RETENTION_MS = 5 * 60 * 1000; // 5 minutes
const MAX_EVENTS_PER_STREAM = 1000;
const BATCH_INTERVAL_MS = 100; // 100ms batch window

// Heartbeat configuration
const PING_INTERVAL_MS = 30000; // 30 seconds
const PONG_TIMEOUT_MS = 60000; // 60 seconds

/**
 * Check if a stream matches a subscription pattern
 * Supports wildcard patterns like "customer.*", "*", or "anomalies"
 */
function matchesSubscription(stream: string, pattern: string, event?: StreamEvent): boolean {
	// Exact match
	if (pattern === stream) {
		return true;
	}

	// Match all streams
	if (pattern === '*') {
		return true;
	}

	// Anomalies pattern - matches events with warning or critical anomaly flags
	if (pattern === 'anomalies') {
		if (!event) return false;
		return event.anomalyFlag === 'warning' || event.anomalyFlag === 'critical';
	}

	// Wildcard pattern matching (e.g., "customer.*")
	if (pattern.endsWith('.*')) {
		const prefix = pattern.slice(0, -2); // Remove ".*"
		return stream.startsWith(prefix + '.');
	}

	return false;
}

/**
 * Check if a stream matches any of the client's subscription patterns
 */
function matchesAnySubscription(
	stream: string,
	subscriptions: string[],
	event?: StreamEvent
): boolean {
	return subscriptions.some((pattern) => matchesSubscription(stream, pattern, event));
}

/**
 * Get interval in milliseconds for a stream based on its cadence
 */
function getStreamInterval(stream: string): number {
	const cadence =
		streamCadences.streamCadences[stream as keyof typeof streamCadences.streamCadences];
	if (!cadence) {
		// Default to 5 seconds if cadence not found
		return 5000;
	}

	const category =
		streamCadences.cadenceCategories[
			cadence.category as keyof typeof streamCadences.cadenceCategories
		];
	if (!category) {
		return 5000;
	}

	const { min, max, unit } = category.checkInterval;
	const baseInterval = (min + max) / 2; // Average of min and max

	// Convert to milliseconds
	if (unit === 'seconds') {
		return baseInterval * 1000;
	} else if (unit === 'minutes') {
		return baseInterval * 60 * 1000;
	} else if (unit === 'hours') {
		return baseInterval * 60 * 60 * 1000;
	}

	return 5000; // Default fallback
}

/**
 * Calculate probability of generating an event based on stream cadence
 * Returns a value between 0 and 1
 */
function getEventProbability(stream: string): number {
	const cadence =
		streamCadences.streamCadences[stream as keyof typeof streamCadences.streamCadences];
	if (!cadence) {
		return 0.1; // Low probability default
	}

	const streamBaseline =
		baselineMetrics.streamBaselines[stream as keyof typeof baselineMetrics.streamBaselines];
	if (!streamBaseline || typeof streamBaseline === 'string') {
		return 0.1;
	}

	// Calculate events per second based on events per hour
	const eventsPerHour = 'eventsPerHour' in streamBaseline ? streamBaseline.eventsPerHour : 100;
	const eventsPerSecond = eventsPerHour / 3600;

	// Get interval in seconds
	const intervalSeconds = getStreamInterval(stream) / 1000;

	// Probability = events per second * interval
	// Cap at 1.0 (always generate) or 0.01 (rarely generate)
	return Math.min(1.0, Math.max(0.01, eventsPerSecond * intervalSeconds));
}

/**
 * Setup heartbeat for a client connection
 */
function setupHeartbeat(state: ClientState): void {
	// Clear any existing ping interval
	if (state.pingInterval) {
		clearInterval(state.pingInterval);
	}

	// Clear any existing timeout
	if (state.timeoutTimer) {
		clearTimeout(state.timeoutTimer);
	}

	// Initialize last pong time
	state.lastPongTime = Date.now();

	// Send ping every 30 seconds
	state.pingInterval = setInterval(() => {
		if (state.ws.readyState === WebSocket.OPEN) {
			state.ws.ping();

			// Set timeout to close connection if no pong received
			state.timeoutTimer = setTimeout(() => {
				const timeSinceLastPong = Date.now() - state.lastPongTime;
				if (timeSinceLastPong >= PONG_TIMEOUT_MS) {
					console.log('WebSocket client timeout - no pong received');
					state.ws.close();
				}
			}, PONG_TIMEOUT_MS);
		}
	}, PING_INTERVAL_MS);
}

/**
 * Setup stream generation intervals for a client
 */
function setupStreamIntervals(state: ClientState): void {
	// Clear existing intervals
	state.streamIntervals.forEach((interval) => clearInterval(interval));
	state.streamIntervals.clear();

	// If no subscriptions, don't set up any intervals
	if (state.subscriptions.length === 0) {
		return;
	}

	const generator = new StreamGenerator();
	const streamNames = Object.keys(baselineMetrics.streamBaselines);

	// Set up intervals for each stream
	for (const stream of streamNames) {
		// Check if stream matches any subscription pattern
		if (!matchesAnySubscription(stream, state.subscriptions)) {
			continue;
		}

		const intervalMs = getStreamInterval(stream);
		const probability = getEventProbability(stream);

		const interval = setInterval(() => {
			if (state.ws.readyState === WebSocket.OPEN) {
				// Generate event based on probability
				if (Math.random() < probability) {
					const event = generator.generateEvent(stream);

					// Store event in recent buffer for catchup
					storeEventInBuffer(event);

					// Send event to client (buffered for batching, checks subscription)
					sendEventToClient(state, event);
				}
			} else {
				clearInterval(interval);
			}
		}, intervalMs);

		state.streamIntervals.set(stream, interval);
	}
}

/**
 * Flush event buffer for a client
 */
function flushEventBuffer(state: ClientState): void {
	if (state.eventBuffer.length === 0) {
		return;
	}

	if (state.ws.readyState === WebSocket.OPEN) {
		const events = [...state.eventBuffer];
		state.eventBuffer = [];

		state.ws.send(
			JSON.stringify({
				type: 'batch',
				events: events
			})
		);
	}
}

/**
 * Setup batch timer for a client
 */
function setupBatchTimer(state: ClientState): void {
	// Clear existing batch timer
	if (state.batchTimer) {
		clearInterval(state.batchTimer);
	}

	// Set up batch timer to flush buffer every 100ms
	state.batchTimer = setInterval(() => {
		flushEventBuffer(state);
	}, BATCH_INTERVAL_MS);
}

/**
 * Send event to client (buffered for batching)
 */
function sendEventToClient(state: ClientState, event: StreamEvent): void {
	if (state.ws.readyState !== WebSocket.OPEN) {
		return;
	}

	// Check if event matches any subscription pattern
	if (!matchesAnySubscription(event.stream, state.subscriptions, event)) {
		return;
	}

	// Add event to buffer
	state.eventBuffer.push(event);

	// If this is the first event in the buffer, start the batch timer
	if (state.eventBuffer.length === 1) {
		setupBatchTimer(state);
	}
}

/**
 * Store event in recent event buffer
 */
function storeEventInBuffer(event: StreamEvent): void {
	const stream = event.stream;
	const now = Date.now();

	// Get or create buffer for this stream
	if (!recentEventBuffer.has(stream)) {
		recentEventBuffer.set(stream, []);
	}

	const buffer = recentEventBuffer.get(stream)!;

	// Add event to buffer
	buffer.push({
		event,
		timestamp: now
	});

	// Enforce max events per stream limit
	if (buffer.length > MAX_EVENTS_PER_STREAM) {
		// Remove oldest events
		buffer.shift();
	}
}

/**
 * Clean up old events from recent event buffer
 */
function cleanupEventBuffer(): void {
	const now = Date.now();
	const cutoffTime = now - BUFFER_RETENTION_MS;

	for (const [stream, buffer] of recentEventBuffer.entries()) {
		// Remove events older than retention period
		while (buffer.length > 0 && buffer[0].timestamp < cutoffTime) {
			buffer.shift();
		}

		// Remove empty buffers
		if (buffer.length === 0) {
			recentEventBuffer.delete(stream);
		}
	}
}

/**
 * Handle catchup for a client based on lastTimestamp
 */
function handleCatchup(state: ClientState, lastTimestamp: string): void {
	try {
		const lastTimestampMs = new Date(lastTimestamp).getTime();
		const now = Date.now();

		// Check if timestamp is too old (beyond buffer retention)
		if (now - lastTimestampMs > BUFFER_RETENTION_MS) {
			// Send empty catchup or error
			state.ws.send(
				JSON.stringify({
					type: 'catchup',
					events: [],
					catchUpEndTime: new Date().toISOString()
				})
			);
			return;
		}

		// Collect catchup events
		const catchupEvents: StreamEvent[] = [];

		for (const [stream, bufferedEvents] of recentEventBuffer.entries()) {
			// Filter events after lastTimestamp and matching subscriptions
			for (const buffered of bufferedEvents) {
				if (buffered.timestamp > lastTimestampMs) {
					// Check if event matches subscription patterns
					if (matchesAnySubscription(stream, state.subscriptions, buffered.event)) {
						catchupEvents.push(buffered.event);
					}
				}
			}
		}

		// Sort by timestamp
		catchupEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

		// Send catchup message
		state.ws.send(
			JSON.stringify({
				type: 'catchup',
				events: catchupEvents,
				catchUpEndTime: new Date().toISOString()
			})
		);
	} catch (error) {
		console.error('Error handling catchup:', error);
		// Send empty catchup on error
		state.ws.send(
			JSON.stringify({
				type: 'catchup',
				events: [],
				catchUpEndTime: new Date().toISOString()
			})
		);
	}
}

/**
 * Handle unsubscribe message from client
 */
function handleUnsubscribe(state: ClientState, message: { type: string; topics?: string[] }): void {
	if (!message.topics || !Array.isArray(message.topics)) {
		state.ws.send(
			JSON.stringify({
				type: 'error',
				message: 'Invalid unsubscribe message: topics must be an array'
			})
		);
		return;
	}

	// Remove topics from subscriptions
	const unsubscribedTopics: string[] = [];
	for (const topic of message.topics) {
		const index = state.subscriptions.indexOf(topic);
		if (index !== -1) {
			state.subscriptions.splice(index, 1);
			unsubscribedTopics.push(topic);
		}
	}

	// Update stream intervals based on updated subscriptions
	setupStreamIntervals(state);

	// Send confirmation
	state.ws.send(
		JSON.stringify({
			type: 'unsubscribed',
			topics: unsubscribedTopics
		})
	);

	console.log(`Client unsubscribed from topics: ${unsubscribedTopics.join(', ')}`);
}

/**
 * Handle subscription message from client
 */
function handleSubscribe(
	state: ClientState,
	message: { type: string; topics?: string[]; lastTimestamp?: string }
): void {
	if (!message.topics || !Array.isArray(message.topics)) {
		state.ws.send(
			JSON.stringify({
				type: 'error',
				message: 'Invalid subscribe message: topics must be an array'
			})
		);
		return;
	}

	// Update subscriptions (replace previous subscriptions)
	state.subscriptions = message.topics;

	// Setup stream intervals based on new subscriptions
	setupStreamIntervals(state);

	// Send confirmation
	state.ws.send(
		JSON.stringify({
			type: 'subscribed',
			topics: state.subscriptions
		})
	);

	// Handle catchup if lastTimestamp is provided
	if (message.lastTimestamp) {
		handleCatchup(state, message.lastTimestamp);
	}

	console.log(`Client subscribed to topics: ${state.subscriptions.join(', ')}`);
}

/**
 * Clean up client state
 */
function cleanupClient(ws: WebSocket): void {
	const state = clientStates.get(ws);
	if (!state) return;

	// Flush any remaining buffered events before disconnect
	flushEventBuffer(state);

	// Clear intervals
	if (state.pingInterval) {
		clearInterval(state.pingInterval);
	}
	if (state.timeoutTimer) {
		clearTimeout(state.timeoutTimer);
	}
	if (state.batchTimer) {
		clearInterval(state.batchTimer);
	}
	state.streamIntervals.forEach((interval) => clearInterval(interval));
	state.streamIntervals.clear();

	clientStates.delete(ws);
}

/**
 * Initialize WebSocket server
 */
export function initWebSocketServer(): WebSocketServer {
	if (wss) return wss;

	wss = new WebSocketServer({ noServer: true });

	wss.on('connection', (ws: WebSocket) => {
		// Create client state
		const state: ClientState = {
			ws,
			subscriptions: [], // Default: no subscriptions
			lastPongTime: Date.now(),
			pingInterval: null,
			timeoutTimer: null,
			streamIntervals: new Map(),
			eventBuffer: [],
			batchTimer: null
		};

		clientStates.set(ws, state);

		console.log(`WebSocket client connected. Total clients: ${clientStates.size}`);

		// Setup heartbeat
		setupHeartbeat(state);

		// Handle pong messages
		ws.on('pong', () => {
			state.lastPongTime = Date.now();
			// Clear timeout since we received pong
			if (state.timeoutTimer) {
				clearTimeout(state.timeoutTimer);
				state.timeoutTimer = null;
			}
		});

		// Handle incoming messages
		ws.on('message', (data: Buffer) => {
			try {
				const message = JSON.parse(data.toString());

				if (message.type === 'subscribe') {
					handleSubscribe(state, message);
				} else if (message.type === 'unsubscribe') {
					handleUnsubscribe(state, message);
				} else {
					ws.send(
						JSON.stringify({
							type: 'error',
							message: `Unknown message type: ${message.type}`
						})
					);
				}
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
				ws.send(
					JSON.stringify({
						type: 'error',
						message: 'Invalid JSON message'
					})
				);
			}
		});

		// Handle connection close
		ws.on('close', () => {
			cleanupClient(ws);
			console.log(`WebSocket client disconnected. Total clients: ${clientStates.size}`);
		});

		// Handle errors
		ws.on('error', (error) => {
			console.error('WebSocket error:', error);
			cleanupClient(ws);
		});
	});

	// Setup buffer cleanup interval (run every minute)
	setInterval(() => {
		cleanupEventBuffer();
	}, 60 * 1000);

	return wss;
}

/**
 * Get the WebSocket server instance
 */
export function getWebSocketServer(): WebSocketServer | null {
	return wss;
}
