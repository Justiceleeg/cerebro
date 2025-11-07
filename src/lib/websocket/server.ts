import { WebSocketServer, WebSocket } from 'ws';
import { StreamGenerator } from '../streams/stream-generator.js';

// WebSocket server instance
let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

/**
 * Initialize WebSocket server
 */
export function initWebSocketServer(): WebSocketServer {
	if (wss) return wss;

	wss = new WebSocketServer({ noServer: true });

	wss.on('connection', (ws: WebSocket) => {
		clients.add(ws);
		console.log(`WebSocket client connected. Total clients: ${clients.size}`);

		// Send one customer.tutor.search event every 5 seconds
		const generator = new StreamGenerator();
		const interval = setInterval(() => {
			if (ws.readyState === WebSocket.OPEN) {
				const event = generator.generateCustomerTutorSearch();
				const message = {
					type: 'event',
					data: event
				};
				ws.send(JSON.stringify(message));
			} else {
				clearInterval(interval);
			}
		}, 5000); // 5 seconds

		ws.on('close', () => {
			clients.delete(ws);
			clearInterval(interval);
			console.log(`WebSocket client disconnected. Total clients: ${clients.size}`);
		});

		ws.on('error', (error) => {
			console.error('WebSocket error:', error);
			clients.delete(ws);
			clearInterval(interval);
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

