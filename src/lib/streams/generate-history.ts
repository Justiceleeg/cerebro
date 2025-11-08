import type { StreamEvent } from '$lib/types';
import { StreamGenerator } from './stream-generator.js';
import baselineMetrics from '$lib/server/config/baseline-metrics.json';

/**
 * Generate historical baseline data for any stream
 * Generates 1 day of data with intervals based on stream frequency
 */
export function generateBaselineHistory(
	stream: string,
	startDate: Date,
	endDate: Date
): StreamEvent[] {
	const events: StreamEvent[] = [];
	const generator = new StreamGenerator();

	// Get baseline metrics for this stream
	const streamBaseline = baselineMetrics.streamBaselines[stream as keyof typeof baselineMetrics.streamBaselines];
	if (!streamBaseline) {
		// Unknown stream, return empty
		return events;
	}

	// Calculate interval based on stream frequency
	// High frequency streams: 1 hour intervals
	// Medium frequency streams: 6 hour intervals
	// Low frequency streams: 12 hour intervals
	const eventsPerDay = streamBaseline.eventsPerDay || 1000;
	let intervalHours = 12; // Default to 12 hours
	
	if (eventsPerDay > 10000) {
		intervalHours = 1; // High frequency: 1 hour
	} else if (eventsPerDay > 1000) {
		intervalHours = 6; // Medium frequency: 6 hours
	} else {
		intervalHours = 12; // Low frequency: 12 hours
	}

	const intervalMs = intervalHours * 60 * 60 * 1000;
	let currentTime = new Date(startDate);

	// Generate events for each interval
	while (currentTime < endDate) {
		// Generate an event for this interval
		const event = generator.generateEvent(stream, currentTime.toISOString());

		// The event already has the correct timestamp and patterns applied
		events.push(event);

		// Move to next interval
		currentTime = new Date(currentTime.getTime() + intervalMs);
	}

	return events;
}

/**
 * Generate historical data for all streams
 * @param startDate - Start date for historical data
 * @param endDate - End date for historical data
 * @returns Map of stream name to events
 */
export function generateAllStreamsHistory(
	startDate: Date,
	endDate: Date
): Record<string, StreamEvent[]> {
	const allStreams: Record<string, StreamEvent[]> = {};
	
	// Get all stream names from baseline metrics
	const streamNames = Object.keys(baselineMetrics.streamBaselines);
	
	for (const stream of streamNames) {
		allStreams[stream] = generateBaselineHistory(stream, startDate, endDate);
	}
	
	return allStreams;
}

