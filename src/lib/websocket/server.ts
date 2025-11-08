import { WebSocketServer, WebSocket } from 'ws';
import { StreamGenerator } from '../streams/stream-generator.js';
import streamCadences from '$lib/server/config/stream-cadences.json';
import baselineMetrics from '$lib/server/config/baseline-metrics.json';

// WebSocket server instance
let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

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
 * Initialize WebSocket server
 */
export function initWebSocketServer(): WebSocketServer {
	if (wss) return wss;

	wss = new WebSocketServer({ noServer: true });

	wss.on('connection', (ws: WebSocket) => {
		clients.add(ws);
		console.log(`WebSocket client connected. Total clients: ${clients.size}`);

		const generator = new StreamGenerator();
		const intervals: NodeJS.Timeout[] = [];
		
		// Get all stream names from baseline metrics
		const streamNames = Object.keys(baselineMetrics.streamBaselines);
		
		// Set up intervals for each stream based on its cadence
		for (const stream of streamNames) {
			const intervalMs = getStreamInterval(stream);
			const probability = getEventProbability(stream);
			
			const interval = setInterval(() => {
				if (ws.readyState === WebSocket.OPEN) {
					// Generate event based on probability
					if (Math.random() < probability) {
						const event = generator.generateEvent(stream);
						const message = {
							type: 'event',
							data: event
						};
						ws.send(JSON.stringify(message));
					}
				} else {
					clearInterval(interval);
				}
			}, intervalMs);
			
			intervals.push(interval);
		}

		ws.on('close', () => {
			clients.delete(ws);
			intervals.forEach(interval => clearInterval(interval));
			console.log(`WebSocket client disconnected. Total clients: ${clients.size}`);
		});

		ws.on('error', (error) => {
			console.error('WebSocket error:', error);
			clients.delete(ws);
			intervals.forEach(interval => clearInterval(interval));
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

