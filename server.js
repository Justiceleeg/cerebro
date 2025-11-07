import { handler } from './build/handler.js';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

const PORT = process.env.PORT || 3000;

// Import StreamGenerator from build output
let StreamGenerator;
try {
	const streamsModule = await import('./build/lib/streams/stream-generator.js');
	StreamGenerator = streamsModule.StreamGenerator;
} catch (error) {
	console.error('Failed to import StreamGenerator:', error);
	process.exit(1);
}

// Create HTTP server with SvelteKit handler
const server = http.createServer(handler);

// Initialize WebSocket server
const wss = new WebSocketServer({ noServer: true });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
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

