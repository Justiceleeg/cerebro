import { handler } from './build/handler.js';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

const PORT = process.env.PORT || 3000;

// Create HTTP server with SvelteKit handler
const server = http.createServer(handler);

// Initialize WebSocket server
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

// Try to import StreamGenerator from build output, fallback to simple generator
let StreamGenerator = null;
let useStreamGenerator = false;

// Async function to try importing StreamGenerator from multiple paths
async function tryImportStreamGenerator() {
	const fs = await import('fs');
	const path = await import('path');
	
	// Try to find stream-generator chunk file in build/server/chunks/
	const chunksDir = path.join(process.cwd(), 'build', 'server', 'chunks');
	
	try {
		const files = fs.readdirSync(chunksDir);
		const streamGeneratorFile = files.find(f => f.startsWith('stream-generator-') && f.endsWith('.js'));
		
		if (streamGeneratorFile) {
			const modulePath = `./build/server/chunks/${streamGeneratorFile}`;
			try {
				const module = await import(modulePath);
				// The chunk exports might be different, try to find StreamGenerator
				// Chunk files may export as 'S' (minified) or 'StreamGenerator'
				if (module.StreamGenerator) {
					StreamGenerator = module.StreamGenerator;
					useStreamGenerator = true;
					console.log(`Successfully imported StreamGenerator from ${modulePath}`);
					return;
				}
				// Try minified export name 'S'
				if (module.S) {
					StreamGenerator = module.S;
					useStreamGenerator = true;
					console.log(`Successfully imported StreamGenerator from ${modulePath} (as S)`);
					return;
				}
				// Try default export or other patterns
				if (module.default) {
					if (module.default.StreamGenerator) {
						StreamGenerator = module.default.StreamGenerator;
						useStreamGenerator = true;
						console.log(`Successfully imported StreamGenerator from ${modulePath} (default export)`);
						return;
					}
					if (module.default.S) {
						StreamGenerator = module.default.S;
						useStreamGenerator = true;
						console.log(`Successfully imported StreamGenerator from ${modulePath} (default.S)`);
						return;
					}
				}
			} catch (error) {
				console.warn(`Failed to import from ${modulePath}:`, error.message);
			}
		}
	} catch (error) {
		// Chunks directory doesn't exist or can't be read
		console.warn('Could not read chunks directory:', error.message);
	}
	
	// Try alternative paths
	const possiblePaths = [
		'./build/server/lib/streams/stream-generator.js',
		'./build/lib/streams/stream-generator.js',
		'./build/server/streams/stream-generator.js'
	];

	for (const modulePath of possiblePaths) {
		try {
			const module = await import(modulePath);
			if (module.StreamGenerator) {
				StreamGenerator = module.StreamGenerator;
				useStreamGenerator = true;
				console.log(`Successfully imported StreamGenerator from ${modulePath}`);
				return;
			}
		} catch (error) {
			// Try next path
			continue;
		}
	}

	console.warn('Could not import StreamGenerator from build output. Using simple event generator (scenario modifiers will not be applied).');
}

// Try to import StreamGenerator (non-blocking, will use fallback if it fails)
await tryImportStreamGenerator();

// Simple event generator (fallback implementation)
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

	// Create generator instance if using StreamGenerator
	const generator = useStreamGenerator ? new StreamGenerator() : null;

	// Send one customer.tutor.search event every 5 seconds
	const interval = setInterval(() => {
		if (ws.readyState === WebSocket.OPEN) {
			const event = useStreamGenerator && generator
				? generator.generateCustomerTutorSearch()
				: generateSimpleEvent();
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

