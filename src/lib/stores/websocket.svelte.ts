/**
 * WebSocket connection store
 * Manages WebSocket connection state, subscriptions, and reconnection logic
 */

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface WebSocketStore {
	connectionState: ConnectionState;
	topics: string[];
	error: string | null;
	reconnectAttempts: number;
	maxReconnectAttempts: number;
}

const initialState: WebSocketStore = {
	connectionState: 'disconnected',
	topics: [],
	error: null,
	reconnectAttempts: 0,
	maxReconnectAttempts: 5
};

export const websocketStore = $state(initialState);

export function setConnectionState(state: ConnectionState) {
	websocketStore.connectionState = state;
}

export function setError(error: string | null) {
	websocketStore.error = error;
}

export function addTopic(topic: string) {
	if (!websocketStore.topics.includes(topic)) {
		websocketStore.topics = [...websocketStore.topics, topic];
	}
}

export function removeTopic(topic: string) {
	websocketStore.topics = websocketStore.topics.filter((t) => t !== topic);
}

export function setTopics(topics: string[]) {
	websocketStore.topics = topics;
}

export function clearTopics() {
	websocketStore.topics = [];
}

export function incrementReconnectAttempts() {
	websocketStore.reconnectAttempts += 1;
}

export function resetReconnectAttempts() {
	websocketStore.reconnectAttempts = 0;
}

export function resetWebSocket() {
	websocketStore.connectionState = 'disconnected';
	websocketStore.topics = [];
	websocketStore.error = null;
	websocketStore.reconnectAttempts = 0;
}

