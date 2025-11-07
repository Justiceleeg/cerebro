import { WebSocketServer, WebSocket } from 'ws';
import type { Handle } from '@sveltejs/kit';
import { StreamGenerator } from '$lib/streams/stream-generator.js';

// WebSocket server instance
let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

/**
 * Initialize WebSocket server
 */
function initWebSocketServer() {
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
 * SvelteKit handle hook
 * Handles WebSocket upgrade requests for /ws path
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Handle WebSocket upgrade requests on /ws path
	if (event.url.pathname === '/ws' && event.request.headers.get('upgrade') === 'websocket') {
		const wss = initWebSocketServer();
		
		// For adapter-node, we need to access the underlying HTTP server
		// This is a workaround for SvelteKit's adapter-node
		// @ts-ignore - Accessing internal request properties
		const req = event.request;
		// @ts-ignore - Accessing internal request properties
		const socket = req.socket;
		// @ts-ignore - Accessing internal request properties
		const head = req.head;

		if (socket && head && wss) {
			wss.handleUpgrade(req as any, socket, head, (ws) => {
				wss.emit('connection', ws, req);
			});
			return new Response(null, { status: 101, statusText: 'Switching Protocols' });
		}
	}

	return resolve(event);
};

