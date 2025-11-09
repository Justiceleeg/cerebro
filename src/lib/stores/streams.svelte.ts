/**
 * Stream data store
 * Manages stream events aggregation, historical data, and normalized value calculations
 */

import type { StreamEvent } from '$lib/types/core.js';

export interface StreamDataStore {
	events: Map<string, StreamEvent[]>; // Map<streamName, events[]>
	historicalData: Map<string, StreamEvent[]>; // Map<streamName, historicalEvents[]>
	lastUpdate: string | null; // ISO 8601 timestamp
}

const initialState: StreamDataStore = {
	events: new Map(),
	historicalData: new Map(),
	lastUpdate: null
};

export const streamDataStore = $state(initialState);

export function addEvent(streamName: string, event: StreamEvent) {
	const currentEvents = streamDataStore.events.get(streamName) || [];
	streamDataStore.events.set(streamName, [...currentEvents, event]);
	streamDataStore.lastUpdate = new Date().toISOString();
}

export function addEvents(streamName: string, events: StreamEvent[]) {
	const currentEvents = streamDataStore.events.get(streamName) || [];
	streamDataStore.events.set(streamName, [...currentEvents, ...events]);
	streamDataStore.lastUpdate = new Date().toISOString();
}

export function setEvents(streamName: string, events: StreamEvent[]) {
	streamDataStore.events.set(streamName, events);
	streamDataStore.lastUpdate = new Date().toISOString();
}

export function addHistoricalData(streamName: string, events: StreamEvent[]) {
	const currentHistorical = streamDataStore.historicalData.get(streamName) || [];
	streamDataStore.historicalData.set(streamName, [...currentHistorical, ...events]);
}

export function setHistoricalData(streamName: string, events: StreamEvent[]) {
	streamDataStore.historicalData.set(streamName, events);
}

export function getStreamEvents(streamName: string): StreamEvent[] {
	return streamDataStore.events.get(streamName) || [];
}

export function getHistoricalEvents(streamName: string): StreamEvent[] {
	return streamDataStore.historicalData.get(streamName) || [];
}

export function getAllStreamNames(): string[] {
	return Array.from(streamDataStore.events.keys());
}

export function clearStream(streamName: string) {
	streamDataStore.events.delete(streamName);
	streamDataStore.historicalData.delete(streamName);
}

export function clearAll() {
	streamDataStore.events.clear();
	streamDataStore.historicalData.clear();
	streamDataStore.lastUpdate = null;
}

