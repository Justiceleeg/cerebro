import { handler } from './build/handler.js';
import http from 'http';

const PORT = process.env.PORT || 3000;

// Create HTTP server with SvelteKit handler
const server = http.createServer(handler);

// Try to import enhanced WebSocket server from build output
let wss = null;
let useEnhancedWebSocket = false;

async function tryImportWebSocketServer() {
	try {
		const fs = await import('fs');
		const path = await import('path');
		const chunksDir = path.join(process.cwd(), 'build', 'server', 'chunks');
		
		// The WebSocket server code is bundled into hooks.server chunk
		// Try to find and import from the hooks.server chunk
		try {
			const files = fs.readdirSync(chunksDir);
			const hooksServerFile = files.find(f => f.startsWith('hooks.server-') && f.endsWith('.js'));
			
			if (hooksServerFile) {
				// Try to import from hooks.server chunk
				// The initWebSocketServer function is defined in the chunk but may not be exported
				// We need to import the websocket server module directly from source
				// Let's try importing from the server-entry module if it exists
				try {
					const serverEntry = await import('./build/server/chunks/server-entry.js');
					if (serverEntry && serverEntry.initWebSocketServer) {
						wss = serverEntry.initWebSocketServer();
						useEnhancedWebSocket = true;
						console.log(`✅ Using enhanced WebSocket server from server-entry`);
						return;
					}
				} catch (e) {
					// Continue to try other methods
				}
				
				// Try importing from hooks.server chunk directly
				// Note: This may not work if the function isn't exported
				try {
					const hooksModule = await import(`./build/server/chunks/${hooksServerFile}`);
					// The function might be in the module but not exported
					// We'll need to use a different approach - import from source
				} catch (e) {
					// Continue
				}
			}
			
			// Try importing from hooks.server chunk (where the function is bundled)
			if (hooksServerFile) {
				try {
					const hooksModule = await import(`./build/server/chunks/${hooksServerFile}`);
					// The function is defined in the chunk but may not be exported
					// Try to access it directly if it's available
					if (hooksModule.initWebSocketServer) {
						wss = hooksModule.initWebSocketServer();
						useEnhancedWebSocket = true;
						console.log(`✅ Using enhanced WebSocket server from ${hooksServerFile}`);
						return;
					}
				} catch (e) {
					// Continue to try other methods
				}
			}
			
			// Try importing from the standalone websocket server file
			try {
				const wsModule = await import('./websocket-server.js');
				if (wsModule && wsModule.initWebSocketServer) {
					wss = wsModule.initWebSocketServer();
					useEnhancedWebSocket = true;
					console.log(`✅ Using enhanced WebSocket server from websocket-server.js`);
					return;
				}
			} catch (e) {
				// Continue to try other methods
			}
			
			// Try importing from the source file directly (works with ES modules)
			const possiblePaths = [
				'./src/lib/websocket/server-entry.js',
				'./src/lib/websocket/server.js',
				'./build/server/lib/websocket/server.js',
				'./build/lib/websocket/server.js'
			];
			
			for (const modulePath of possiblePaths) {
				try {
					const module = await import(modulePath);
					if (module.initWebSocketServer) {
						wss = module.initWebSocketServer();
						useEnhancedWebSocket = true;
						console.log(`✅ Using enhanced WebSocket server from ${modulePath}`);
						return;
					}
				} catch (error) {
					// Try next path
					continue;
				}
			}
		} catch (error) {
			// Continue to fallback
		}
	} catch (error) {
		console.warn('Could not import enhanced WebSocket server:', error.message);
	}
	
	// Fallback: Use simple WebSocket server
	console.warn('⚠️  Using simple WebSocket server (enhanced features not available)');
	console.warn('   The enhanced WebSocket server is bundled into hooks.server chunk');
	console.warn('   To use enhanced features, the websocket server module needs to be');
	console.warn('   built as a separate exportable module.');
	const { WebSocketServer } = await import('ws');
	wss = new WebSocketServer({ noServer: true });
}

await tryImportWebSocketServer();

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

// If not using enhanced WebSocket server, set up simple fallback
if (!useEnhancedWebSocket) {
	const { WebSocketServer, WebSocket } = await import('ws');
	const clients = new Set();
	
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
}

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

