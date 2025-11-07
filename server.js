import { handler } from './build/handler.js';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

const PORT = process.env.PORT || 3000;

// Create HTTP server with SvelteKit handler
const server = http.createServer(handler);

// Initialize WebSocket server
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

// Simple event generator (minimal implementation)
function generateSimpleEvent() {
	return {
		stream: 'customer.tutor.search',
		timestamp: new Date().toISOString(),
		data: {
			user_id: `user_${Math.random().toString(36).substring(2, 11)}`,
			subject: ['Math', 'Science', 'English', 'History'][Math.floor(Math.random() * 4)],
			availability_start: new Date().toISOString(),
			availability_end: new Date(Date.now() + 3600000).toISOString(),
			keywords: ['online', 'experienced', 'one-on-one'].slice(0, Math.floor(Math.random() * 3) + 1)
		},
		normalizedValue: 40 + Math.random() * 20, // 40-60 range
		anomalyFlag: 'normal'
	};
}

wss.on('connection', (ws) => {
	clients.add(ws);
	console.log(`WebSocket client connected. Total clients: ${clients.size}`);

	// Send one customer.tutor.search event every 5 seconds
	const interval = setInterval(() => {
		if (ws.readyState === WebSocket.OPEN) {
			const event = generateSimpleEvent();
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

// Handle WebSocket upgrade requests BEFORE SvelteKit processes them
server.on('upgrade', (request, socket, head) => {
	if (request.url === '/ws') {
		wss.handleUpgrade(request, socket, head, (ws) => {
			wss.emit('connection', ws, request);
		});
	} else {
		// Not a WebSocket upgrade, let SvelteKit handle it
		socket.destroy();
	}
});

// Start the server
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
	console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});

