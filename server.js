import { handler } from './build/handler.js';
import { initWebSocketServer } from './build/lib/websocket/server.js';
import { WebSocketServer } from 'ws';
import http from 'http';

const PORT = process.env.PORT || 3000;

// Create HTTP server with SvelteKit handler
const server = http.createServer(handler);

// Initialize WebSocket server
const wss = initWebSocketServer();

// Handle WebSocket upgrade requests BEFORE SvelteKit processes them
server.on('upgrade', (request, socket, head) => {
	if (request.url === '/ws') {
		if (wss) {
			wss.handleUpgrade(request, socket, head, (ws) => {
				wss.emit('connection', ws, request);
			});
		} else {
			socket.destroy();
		}
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

