import { WebSocketServer, WebSocket } from 'ws';
import { StreamGenerator } from '../streams/stream-generator.js';
import streamCadences from '$lib/server/config/stream-cadences.json';
import baselineMetrics from '$lib/server/config/baseline-metrics.json';

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
}

const clientStates = new Map<WebSocket, ClientState>();

// Heartbeat configuration
const PING_INTERVAL_MS = 30000; // 30 seconds
const PONG_TIMEOUT_MS = 60000; // 60 seconds

/**
 * Check if a stream matches a subscription pattern
 * Supports wildcard patterns like "customer.*" or "*"
 */
function matchesSubscription(stream: string, pattern: string): boolean {
	// Exact match
	if (pattern === stream) {
		return true;
	}

	// Match all streams
	if (pattern === '*') {
		return true;
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
function matchesAnySubscription(stream: string, subscriptions: string[]): boolean {
	return subscriptions.some(pattern => matchesSubscription(stream, pattern));
}

/**
 * Get interval in milliseconds for a stream based on its cadence
 */
function getStreamInterval(stream: string): number {
	const cadence = streamCadences.streamCadences[stream as keyof typeof streamCadences.streamCadences];
	if (!cadence) {
		// Default to 5 seconds if cadence not found
		return 5000;
	}

	const category = streamCadences.cadenceCategories[cadence.category as keyof typeof streamCadences.cadenceCategories];
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
	const cadence = streamCadences.streamCadences[stream as keyof typeof streamCadences.streamCadences];
	if (!cadence) {
		return 0.1; // Low probability default
	}

	const streamBaseline = baselineMetrics.streamBaselines[stream as keyof typeof baselineMetrics.streamBaselines];
	if (!streamBaseline) {
		return 0.1;
	}

	// Calculate events per second based on events per hour
	const eventsPerSecond = (streamBaseline.eventsPerHour || 100) / 3600;
	
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
	state.streamIntervals.forEach(interval => clearInterval(interval));
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
				// Double-check subscription before sending (in case subscriptions changed)
				if (matchesAnySubscription(stream, state.subscriptions)) {
					// Generate event based on probability
					if (Math.random() < probability) {
						const event = generator.generateEvent(stream);
						const message = {
							type: 'event',
							data: event
						};
						state.ws.send(JSON.stringify(message));
					}
				}
			} else {
				clearInterval(interval);
			}
		}, intervalMs);

		state.streamIntervals.set(stream, interval);
	}
}

/**
 * Handle subscription message from client
 */
function handleSubscribe(state: ClientState, message: { type: string; topics?: string[] }): void {
	if (!message.topics || !Array.isArray(message.topics)) {
		state.ws.send(JSON.stringify({
			type: 'error',
			message: 'Invalid subscribe message: topics must be an array'
		}));
		return;
	}

	// Update subscriptions (replace previous subscriptions)
	state.subscriptions = message.topics;

	// Setup stream intervals based on new subscriptions
	setupStreamIntervals(state);

	// Send confirmation
	state.ws.send(JSON.stringify({
		type: 'subscribed',
		topics: state.subscriptions
	}));

	console.log(`Client subscribed to topics: ${state.subscriptions.join(', ')}`);
}

/**
 * Clean up client state
 */
function cleanupClient(ws: WebSocket): void {
	const state = clientStates.get(ws);
	if (!state) return;

	// Clear intervals
	if (state.pingInterval) {
		clearInterval(state.pingInterval);
	}
	if (state.timeoutTimer) {
		clearTimeout(state.timeoutTimer);
	}
	state.streamIntervals.forEach(interval => clearInterval(interval));
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
			streamIntervals: new Map()
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
				} else {
					ws.send(JSON.stringify({
						type: 'error',
						message: `Unknown message type: ${message.type}`
					}));
				}
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
				ws.send(JSON.stringify({
					type: 'error',
					message: 'Invalid JSON message'
				}));
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

	return wss;
}

/**
 * Get the WebSocket server instance
 */
export function getWebSocketServer(): WebSocketServer | null {
	return wss;
}

