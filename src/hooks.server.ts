import type { Handle } from '@sveltejs/kit';
import { initWebSocketServer, getWebSocketServer } from '$lib/websocket/server.js';
import { loadBaselineData } from '$lib/data/load-baseline.js';

// Export WebSocket server functions so they can be imported by server.js
export { initWebSocketServer, getWebSocketServer };

// Initialize baseline data on module load (runs once on startup)
// This is non-blocking - the endpoint will wait if needed
let baselineDataLoading: Promise<void> | null = null;
if (!baselineDataLoading) {
	baselineDataLoading = loadBaselineData().catch((error) => {
		console.error('Failed to load baseline data:', error);
	});
}

/**
 * SvelteKit handle hook
 * In development, this can handle WebSocket upgrades
 * In production, WebSocket upgrades are handled by server.js
 */
export const handle: Handle = async ({ event, resolve }) => {
	// In development (Vite), we can try to handle WebSocket upgrades here
	// In production, server.js handles WebSocket upgrades at the HTTP server level
	if (event.url.pathname === '/ws' && event.request.headers.get('upgrade') === 'websocket') {
		// Try to initialize WebSocket server for dev mode
		// This may not work in production, which is why we have server.js
		try {
			const wss = initWebSocketServer();
			// @ts-ignore - Accessing internal request properties (dev only)
			const req = event.request;
			// @ts-ignore
			const socket = req.socket;
			// @ts-ignore
			const head = req.head;

			if (socket && head && wss) {
				wss.handleUpgrade(req as any, socket, head, (ws) => {
					wss.emit('connection', ws, req);
				});
				return new Response(null, { status: 101, statusText: 'Switching Protocols' });
			}
		} catch (error) {
			// If this fails, server.js will handle it in production
			console.warn('WebSocket upgrade failed in hooks, will be handled by server.js:', error);
		}
	}

	return resolve(event);
};

