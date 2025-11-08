import type { StreamEvent, ExternalEvent } from '$lib/types';
import { StreamGenerator } from './stream-generator.js';
import baselineMetrics from '$lib/server/config/baseline-metrics.json';
import externalEventsLibrary from '$lib/server/config/external-events-library.json';

/**
 * Generate historical baseline data for any stream
 * Generates 30 days of data with 2 intervals per day (12-hour intervals) = 60 data points per stream
 * Applies academic calendar patterns, weekday/weekend variance, and time-of-day patterns
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

	// For baseline historical data, use 12-hour intervals (2 per day)
	// This gives us 60 data points for 30 days
	const intervalHours = 12;
	const intervalMs = intervalHours * 60 * 60 * 1000;
	let currentTime = new Date(startDate);

	// Generate events for each interval
	while (currentTime < endDate) {
		// Generate an event for this interval
		// The generator applies time-of-day, day-of-week, and other patterns
		const event = generator.generateEvent(stream, currentTime.toISOString());

		// Add occasional anomalies (spikes/dips) - ~5% chance
		if (Math.random() < 0.05) {
			const anomalyType = Math.random() < 0.5 ? 'spike' : 'dip';
			const anomalyMagnitude = 1 + (Math.random() * 0.3); // 0-30% variation
			
			if (anomalyType === 'spike' && event.normalizedValue !== undefined) {
				event.normalizedValue = Math.min(100, event.normalizedValue * anomalyMagnitude);
			} else if (anomalyType === 'dip' && event.normalizedValue !== undefined) {
				event.normalizedValue = Math.max(0, event.normalizedValue / anomalyMagnitude);
			}
			
			// Mark as anomaly if significant
			if (anomalyMagnitude > 1.15) {
				event.anomalyFlag = event.normalizedValue! > 80 ? 'critical' : 'warning';
			}
		}

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
	// Filter out non-stream keys like _documentation, metadata, etc.
	const streamNames = Object.keys(baselineMetrics.streamBaselines).filter(
		(key) => !key.startsWith('_') && key !== 'metadata'
	);
	
	for (const stream of streamNames) {
		allStreams[stream] = generateBaselineHistory(stream, startDate, endDate);
	}
	
	return allStreams;
}

/**
 * Generate baseline external events for a 30-day period
 * Generates 2-5 events per day (60-150 events total) distributed realistically
 * @param startDate - Start date for historical data
 * @param endDate - End date for historical data
 * @returns Array of external events
 */
export function generateBaselineExternalEvents(
	startDate: Date,
	endDate: Date
): ExternalEvent[] {
	const events: ExternalEvent[] = [];
	
	// Collect all templates from the external events library
	const allTemplates: Array<{
		type: string;
		template: any;
	}> = [];
	
	for (const [eventType, typeData] of Object.entries(externalEventsLibrary.eventTypes)) {
		if (typeData.templates && Array.isArray(typeData.templates)) {
			for (const template of typeData.templates) {
				allTemplates.push({
					type: eventType as ExternalEvent['type'],
					template
				});
			}
		}
	}
	
	if (allTemplates.length === 0) {
		return events;
	}
	
	// Calculate number of days
	const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
	
	// Generate 2-5 events per day (60-150 events for 30 days)
	// Use weighted distribution: more events on weekdays, fewer on weekends
	let eventCount = 0;
	const targetEvents = Math.floor(daysDiff * 3.5); // Average 3.5 events per day
	
	// Distribute events across the period
	// Use a realistic distribution: more events during weekdays, fewer on weekends
	for (let day = 0; day < daysDiff; day++) {
		const currentDate = new Date(startDate);
		currentDate.setDate(currentDate.getDate() + day);
		const dayOfWeek = currentDate.getDay();
		const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
		
		// Weekdays: 3-5 events, Weekends: 2-3 events
		const eventsPerDay = isWeekend 
			? 2 + Math.floor(Math.random() * 2) // 2-3 events
			: 3 + Math.floor(Math.random() * 3); // 3-5 events
		
		for (let i = 0; i < eventsPerDay && eventCount < targetEvents; i++) {
			// Select a random template
			const templateInfo = allTemplates[Math.floor(Math.random() * allTemplates.length)];
			
			// Generate timestamp within the day (distributed throughout the day)
			const hour = Math.floor(Math.random() * 24);
			const minute = Math.floor(Math.random() * 60);
			const eventTime = new Date(currentDate);
			eventTime.setHours(hour, minute, 0, 0);
			
			// Create event from template
			const event: ExternalEvent = {
				id: `baseline_${templateInfo.template.id}_${eventCount}_${Date.now()}`,
				timestamp: eventTime.toISOString(),
				type: templateInfo.type as ExternalEvent['type'],
				title: templateInfo.template.title,
				description: templateInfo.template.description,
				severity: templateInfo.template.severity || 'info',
				expectedImpact: templateInfo.template.expectedImpact,
				icon: templateInfo.template.icon || '📌',
				injectedByAI: false
			};
			
			events.push(event);
			eventCount++;
		}
	}
	
	// Sort events by timestamp
	events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
	
	return events;
}

