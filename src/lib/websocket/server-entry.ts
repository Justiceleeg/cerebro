/**
 * Entry point for WebSocket server that can be imported by server.js
 * This file re-exports the WebSocket server functions so they can be
 * imported from the build output.
 */

export { initWebSocketServer, getWebSocketServer } from './server.js';

