/**
 * UI state store
 * Manages filter state, selection state, and time range state
 */

import type { TimeRange } from '$lib/types/dashboard.js';

export type StatusFilter = 'all' | 'normal' | 'warning' | 'critical';
export type DomainFilter = 'all' | string; // 'all' or specific domain
export type EventTypeFilter = 'all' | string[]; // 'all' or array of event types

export interface FilterState {
	status: StatusFilter;
	domain: DomainFilter;
	eventTypes: EventTypeFilter;
	timeRange: TimeRange;
}

export interface SelectionState {
	selectedStreams: string[];
	selectedEvents: string[]; // External event IDs
}

export interface UIStateStore {
	filter: FilterState;
	selection: SelectionState;
}

const initialState: UIStateStore = {
	filter: {
		status: 'all',
		domain: 'all',
		eventTypes: 'all',
		timeRange: {
			start: null,
			end: null,
			preset: '1h'
		}
	},
	selection: {
		selectedStreams: [],
		selectedEvents: []
	}
};

export const uiStore = $state(initialState);

// Filter actions
export function setStatusFilter(status: StatusFilter) {
	uiStore.filter.status = status;
}

export function setDomainFilter(domain: DomainFilter) {
	uiStore.filter.domain = domain;
}

export function setEventTypesFilter(eventTypes: EventTypeFilter) {
	uiStore.filter.eventTypes = eventTypes;
}

export function setTimeRange(timeRange: TimeRange) {
	uiStore.filter.timeRange = timeRange;
}

export function resetFilters() {
	uiStore.filter = {
		status: 'all',
		domain: 'all',
		eventTypes: 'all',
		timeRange: {
			start: null,
			end: null,
			preset: '1h'
		}
	};
}

// Selection actions
export function selectStream(streamName: string) {
	if (!uiStore.selection.selectedStreams.includes(streamName)) {
		uiStore.selection.selectedStreams = [...uiStore.selection.selectedStreams, streamName];
	}
}

export function deselectStream(streamName: string) {
	uiStore.selection.selectedStreams = uiStore.selection.selectedStreams.filter(
		(s) => s !== streamName
	);
}

export function setSelectedStreams(streams: string[]) {
	uiStore.selection.selectedStreams = streams;
}

export function selectEvent(eventId: string) {
	if (!uiStore.selection.selectedEvents.includes(eventId)) {
		uiStore.selection.selectedEvents = [...uiStore.selection.selectedEvents, eventId];
	}
}

export function deselectEvent(eventId: string) {
	uiStore.selection.selectedEvents = uiStore.selection.selectedEvents.filter(
		(e) => e !== eventId
	);
}

export function setSelectedEvents(events: string[]) {
	uiStore.selection.selectedEvents = events;
}

export function clearSelection() {
	uiStore.selection.selectedStreams = [];
	uiStore.selection.selectedEvents = [];
}

