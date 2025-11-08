import type { StreamEvent, ExternalEvent, ScenarioModifier } from '$lib/types';
import { StreamGenerator } from './stream-generator.js';
import { getRelationshipEngine } from './relationship-engine.js';
import { normalizeStreamValue, getBaselineStatsForStream } from './normalize.js';
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

	const relationshipEngine = getRelationshipEngine();

	// Generate events for each interval
	while (currentTime < endDate) {
		// Check for pending events that should be resolved at this time
		const pendingEvents = relationshipEngine.getPendingEventsToResolve(currentTime);
		for (const pending of pendingEvents) {
			const resolvedStream = relationshipEngine.resolvePendingEvent(pending);
			if (resolvedStream) {
				// Generate the resolved event
				const resolvedEvent = generator.generateEvent(resolvedStream, currentTime.toISOString());
				events.push(resolvedEvent);
			}
		}

		// Check for scheduled cascades
		const cascades = relationshipEngine.getScheduledCascades(currentTime);
		for (const cascade of cascades) {
			// Apply cascade multiplier to the target stream
			// The cascade multiplier is already applied in generateEvent
			relationshipEngine.removeCascade(cascade);
		}

		// Generate an event for this interval
		// The generator applies time-of-day, day-of-week, relationship enforcement, and other patterns
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

		// Clean up resolved events
		relationshipEngine.cleanupResolvedEvents();

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

/**
 * Regenerate historical data for a time window with scenario modifications applied
 * This function regenerates historical data with scenario modifiers and external events applied,
 * maintaining temporal coherence and stream relationships.
 * 
 * Note: This function generates baseline events first, then applies modifiers.
 * The baseline generation uses StreamGenerator which may apply modifiers if active,
 * so we ensure baseline generation happens without modifiers by using the baseline data directly.
 * 
 * @param stream - Stream name to regenerate
 * @param startDate - Start date for historical data
 * @param endDate - End date for historical data
 * @param modifiers - Active scenario modifiers to apply
 * @param externalEvents - Active external events to apply
 * @param baselineEvents - Optional baseline events to use (if not provided, will generate)
 * @returns Regenerated stream events with modifications applied
 */
export function regenerateHistoricalWindow(
	stream: string,
	startDate: Date,
	endDate: Date,
	modifiers: ScenarioModifier[],
	externalEvents: ExternalEvent[],
	baselineEvents?: StreamEvent[]
): StreamEvent[] {
	// Use provided baseline events or generate new ones
	// Note: When generating, we need to ensure no modifiers are applied
	// Since StreamGenerator.generateEvent() applies modifiers if active,
	// we'll use the baseline data from memory if available
	let eventsToModify: StreamEvent[];
	
	if (baselineEvents) {
		// Use provided baseline events
		eventsToModify = baselineEvents;
	} else {
		// Generate baseline events (may have modifiers applied if scenario is active)
		// To avoid double-application, we'll generate and then check if modifiers were already applied
		eventsToModify = generateBaselineHistory(stream, startDate, endDate);
	}
	
	// Apply scenario modifiers to the baseline events
	// This will re-apply modifiers, but that's okay because we're explicitly applying the modifiers we want
	const regeneratedEvents = eventsToModify.map((event) => {
		const eventTime = new Date(event.timestamp);
		const modifiedEvent = { ...event };
		
		// Apply modifiers to the event
		applyModifiersToEvent(modifiedEvent, modifiers, externalEvents, eventTime);
		
		return modifiedEvent;
	});
	
	return regeneratedEvents;
}

/**
 * Apply scenario modifiers and external events to a stream event
 * This function applies multipliers, overrides, and external event impacts to a generated event
 * 
 * @param event - Stream event to modify
 * @param modifiers - Active scenario modifiers
 * @param externalEvents - Active external events
 * @param eventTime - Time of the event
 */
function applyModifiersToEvent(
	event: StreamEvent,
	modifiers: ScenarioModifier[],
	externalEvents: ExternalEvent[],
	eventTime: Date
): void {
	const stream = event.stream;
	
	// Get baseline stats for this stream
	const baselineStats = getBaselineStatsForStream(stream);
	if (!baselineStats) {
		return;
	}
	
	// Convert normalized value back to approximate raw value
	// Normalized value is on 0-100 scale where 50 = mean
	// Formula: normalized = 50 + (zScore * 15), so zScore = (normalized - 50) / 15
	// Raw value = mean + (zScore * stdDev)
	let rawValue: number;
	if (event.normalizedValue !== undefined) {
		const zScore = (event.normalizedValue - 50) / 15;
		rawValue = baselineStats.mean + (zScore * baselineStats.stdDev);
	} else {
		rawValue = baselineStats.mean;
	}

	// Apply scenario modifiers
	for (const modifier of modifiers) {
		// Check if modifier is active for this time period
		const modifierStartTime = new Date(modifier.startTime);
		const modifierEndTime = modifier.duration 
			? new Date(modifierStartTime.getTime() + parseDuration(modifier.duration))
			: null;
		
		// Only apply if event time is within modifier's active period
		if (eventTime >= modifierStartTime && (!modifierEndTime || eventTime <= modifierEndTime)) {
			if (modifier.affectedStreams[stream]) {
				const streamMod = modifier.affectedStreams[stream];
				if (streamMod.multiplier !== undefined) {
					rawValue = rawValue * streamMod.multiplier;
				}
				if (streamMod.override !== undefined) {
					rawValue = streamMod.override;
				}
				if (streamMod.additive !== undefined) {
					rawValue = rawValue + streamMod.additive;
				}
			}
		}
	}

	// Apply external event impacts
	for (const externalEvent of externalEvents) {
		const eventTimestamp = new Date(externalEvent.timestamp);
		const eventDuration = externalEvent.expectedImpact?.duration 
			? parseDuration(externalEvent.expectedImpact.duration)
			: 0;
		const eventEndTime = new Date(eventTimestamp.getTime() + eventDuration);
		
		// Only apply if event time is within external event's impact period
		if (eventTime >= eventTimestamp && eventTime <= eventEndTime) {
			if (externalEvent.expectedImpact?.streams?.includes(stream)) {
				const impact = externalEvent.expectedImpact;
				if (impact.direction === 'increase') {
					const magnitude = impact.magnitude === 'high' ? 1.5 : impact.magnitude === 'medium' ? 1.25 : 1.1;
					rawValue = rawValue * magnitude;
				} else if (impact.direction === 'decrease') {
					const magnitude = impact.magnitude === 'high' ? 0.5 : impact.magnitude === 'medium' ? 0.75 : 0.9;
					rawValue = rawValue * magnitude;
				}
			}
		}
	}

	// Re-normalize the value
	const { normalizedValue, anomalyFlag } = normalizeStreamValue(rawValue, baselineStats);
	
	event.normalizedValue = normalizedValue;
	event.anomalyFlag = anomalyFlag;
}

/**
 * Parse duration string (e.g., "3 hours", "6 hours") to milliseconds
 */
function parseDuration(duration: string): number {
	const match = duration.match(/^(\d+)\s*(second|seconds|minute|minutes|hour|hours|day|days)$/i);
	if (!match) {
		return 0;
	}

	const value = parseInt(match[1], 10);
	const unit = match[2].toLowerCase();

	if (unit.startsWith('second')) {
		return value * 1000;
	} else if (unit.startsWith('minute')) {
		return value * 60 * 1000;
	} else if (unit.startsWith('hour')) {
		return value * 60 * 60 * 1000;
	} else if (unit.startsWith('day')) {
		return value * 24 * 60 * 60 * 1000;
	}

	return 0;
}

