import type { Handle } from '@sveltejs/kit';
import { initWebSocketServer } from '$lib/websocket/server.js';

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

