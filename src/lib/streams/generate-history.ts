import type { StreamEvent } from '$lib/types';
import { StreamGenerator } from './stream-generator.js';

/**
 * Generate minimal historical baseline data for a stream
 * Generates 1 day of data with 2 intervals (12-hour blocks)
 */
export function generateBaselineHistory(
	stream: string,
	startDate: Date,
	endDate: Date
): StreamEvent[] {
	const events: StreamEvent[] = [];
	const generator = new StreamGenerator();

	// For now, only support customer.tutor.search
	if (stream !== 'customer.tutor.search') {
		return events;
	}

	// Calculate number of 12-hour intervals
	const intervalMs = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
	let currentTime = new Date(startDate);

	// Generate events for each 12-hour interval
	while (currentTime < endDate) {
		// Generate an event for this interval
		const event = generator.generateCustomerTutorSearch();

		// Set the timestamp to the interval time
		event.timestamp = currentTime.toISOString();

		// Apply weekday/weekend variance
		const dayOfWeek = currentTime.getDay();
		const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

		// Adjust normalized value based on weekday/weekend
		// Weekends have ~35% more activity (from baseline-metrics.json)
		if (isWeekend && event.normalizedValue !== undefined) {
			event.normalizedValue = Math.min(100, event.normalizedValue * 1.35);
		}

		events.push(event);

		// Move to next interval
		currentTime = new Date(currentTime.getTime() + intervalMs);
	}

	return events;
}

