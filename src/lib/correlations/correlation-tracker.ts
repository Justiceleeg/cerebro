import type { ExternalEvent, StreamEvent, CorrelationData } from '$lib/types';

/**
 * Stream value observation during an active event
 */
interface StreamObservation {
	timestamp: string; // ISO 8601
	value: number; // normalizedValue or raw value
	stream: string;
}

/**
 * Active event tracking
 */
interface ActiveEvent {
	event: ExternalEvent;
	startTime: string; // ISO 8601
	endTime?: string; // ISO 8601 - when event impact period ends
	observations: Map<string, StreamObservation[]>; // stream -> observations
}

/**
 * CorrelationTracker class
 * Tracks correlations between external events and stream value changes
 */
export class CorrelationTracker {
	private activeEvents: Map<string, ActiveEvent> = new Map();
	private correlations: Map<string, CorrelationData> = new Map(); // key: `${eventId}:${stream}`

	/**
	 * Register an external event as active
	 * Called when a scenario with external events is activated
	 */
	registerEvent(event: ExternalEvent): void {
		const eventStartTime = new Date(event.timestamp);
		const eventDuration = this.parseDuration(event.expectedImpact?.duration || '0');
		const eventEndTime = eventDuration > 0
			? new Date(eventStartTime.getTime() + eventDuration).toISOString()
			: undefined;

		this.activeEvents.set(event.id, {
			event,
			startTime: event.timestamp,
			endTime: eventEndTime,
			observations: new Map()
		});
	}

	/**
	 * Record a stream value change while events are active
	 * Called when a stream event is generated
	 */
	recordStreamChange(streamEvent: StreamEvent): void {
		const eventTime = new Date(streamEvent.timestamp);
		const value = streamEvent.normalizedValue ?? 0;

		// Check all active events to see if this stream is affected
		for (const [eventId, activeEvent] of this.activeEvents.entries()) {
			// Check if event is still active (within impact period)
			const eventStartTime = new Date(activeEvent.startTime);
			const eventEndTime = activeEvent.endTime
				? new Date(activeEvent.endTime)
				: new Date(Date.now() + 86400000); // Default to 24 hours if no end time

			if (eventTime < eventStartTime || eventTime > eventEndTime) {
				continue; // Event not active at this time
			}

			// Check if this stream is expected to be affected by the event
			const expectedStreams = activeEvent.event.expectedImpact?.streams || [];
			if (expectedStreams.includes(streamEvent.stream)) {
				// Record observation for this event-stream pair
				if (!activeEvent.observations.has(streamEvent.stream)) {
					activeEvent.observations.set(streamEvent.stream, []);
				}

				const observations = activeEvent.observations.get(streamEvent.stream)!;
				observations.push({
					timestamp: streamEvent.timestamp,
					value,
					stream: streamEvent.stream
				});
			}
		}
	}

	/**
	 * Calculate correlations for an event
	 * Called periodically or when event ends
	 */
	calculateCorrelations(eventId: string): CorrelationData[] {
		const activeEvent = this.activeEvents.get(eventId);
		if (!activeEvent) {
			return [];
		}

		const correlations: CorrelationData[] = [];
		const expectedStreams = activeEvent.event.expectedImpact?.streams || [];

		for (const stream of expectedStreams) {
			const observations = activeEvent.observations.get(stream) || [];
			
			if (observations.length < 2) {
				// Need at least 2 data points for correlation
				continue;
			}

			// Calculate correlation
			const correlation = this.calculateCorrelation(observations, activeEvent);

			// Store correlation
			const key = `${eventId}:${stream}`;
			this.correlations.set(key, correlation);
			correlations.push(correlation);
		}

		return correlations;
	}

	/**
	 * Calculate Pearson correlation coefficient for stream observations
	 */
	private calculateCorrelation(
		observations: StreamObservation[],
		activeEvent: ActiveEvent
	): CorrelationData {
		const eventStartTime = new Date(activeEvent.startTime);
		const eventEndTime = activeEvent.endTime
			? new Date(activeEvent.endTime)
			: new Date(Date.now());

		// Get baseline observations (before event)
		// For simplicity, we'll use the first observation as baseline reference
		// In a real system, we'd need baseline data from before the event
		const baselineValue = observations[0]?.value || 50; // Default to 50 (middle of 0-100 scale)

		// Calculate statistics during event
		const values = observations.map(o => o.value);
		const eventMean = values.reduce((a, b) => a + b, 0) / values.length;
		const baselineMean = baselineValue;

		// Calculate change magnitude
		const changeMagnitude = baselineMean !== 0
			? ((eventMean - baselineMean) / baselineMean) * 100
			: 0;

		// Calculate correlation strength
		// For time-series correlation, we use a simplified approach:
		// - Positive correlation if values increase during event
		// - Negative correlation if values decrease during event
		// - Strength based on consistency of change
		let strength = 0;
		let direction: 'positive' | 'negative' | 'none' = 'none';

		if (values.length >= 2) {
			// Calculate trend (increasing or decreasing)
			let increasing = 0;
			let decreasing = 0;

			for (let i = 1; i < values.length; i++) {
				if (values[i] > values[i - 1]) {
					increasing++;
				} else if (values[i] < values[i - 1]) {
					decreasing++;
				}
			}

			// Determine direction based on overall change
			if (eventMean > baselineMean) {
				direction = 'positive';
				// Strength based on consistency and magnitude
				const consistency = increasing / (increasing + decreasing || 1);
				const magnitudeRatio = Math.min(1, Math.abs(changeMagnitude) / 50); // Normalize to 0-1
				strength = (consistency * 0.6 + magnitudeRatio * 0.4);
			} else if (eventMean < baselineMean) {
				direction = 'negative';
				const consistency = decreasing / (increasing + decreasing || 1);
				const magnitudeRatio = Math.min(1, Math.abs(changeMagnitude) / 50);
				strength = -(consistency * 0.6 + magnitudeRatio * 0.4);
			}
		}

		// Calculate confidence (statistical significance)
		// Simplified: based on sample size and consistency
		const sampleSize = observations.length;
		const confidence = Math.min(1, sampleSize / 10); // More samples = higher confidence

		return {
			eventId: activeEvent.event.id,
			stream: observations[0]?.stream || '',
			strength,
			direction,
			confidence,
			sampleSize,
			startTime: activeEvent.startTime,
			endTime: activeEvent.endTime || new Date().toISOString(),
			baselineMean,
			eventMean,
			changeMagnitude
		};
	}

	/**
	 * Get correlations matching query parameters
	 * Calculates correlations on-demand for active events if not already calculated
	 */
	getCorrelations(filters: {
		eventId?: string;
		stream?: string;
		startTime?: string;
		endTime?: string;
	}): CorrelationData[] {
		// Calculate correlations for all active events that haven't been calculated yet
		for (const eventId of this.activeEvents.keys()) {
			// Check if correlations already exist for this event
			const hasCorrelation = Array.from(this.correlations.keys()).some(k => k.startsWith(`${eventId}:`));
			
			// If we have observations but no correlation yet, calculate it
			const activeEvent = this.activeEvents.get(eventId);
			if (activeEvent && activeEvent.observations.size > 0 && !hasCorrelation) {
				this.calculateCorrelations(eventId);
			}
		}

		const results: CorrelationData[] = [];

		for (const correlation of this.correlations.values()) {
			// Apply filters
			if (filters.eventId && correlation.eventId !== filters.eventId) {
				continue;
			}
			if (filters.stream && correlation.stream !== filters.stream) {
				continue;
			}
			if (filters.startTime && correlation.endTime < filters.startTime) {
				continue;
			}
			if (filters.endTime && correlation.startTime > filters.endTime) {
				continue;
			}

			results.push(correlation);
		}

		return results;
	}

	/**
	 * Unregister an event (when scenario ends)
	 * Calculate final correlations before removing
	 */
	unregisterEvent(eventId: string): CorrelationData[] {
		const correlations = this.calculateCorrelations(eventId);
		this.activeEvents.delete(eventId);
		return correlations;
	}

	/**
	 * Clear all correlations (reset)
	 */
	reset(): void {
		this.activeEvents.clear();
		this.correlations.clear();
	}

	/**
	 * Parse duration string (e.g., "3 hours", "6 hours") to milliseconds
	 */
	private parseDuration(duration: string): number {
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
}

// Singleton instance
let trackerInstance: CorrelationTracker | null = null;

/**
 * Get the singleton CorrelationTracker instance
 */
export function getCorrelationTracker(): CorrelationTracker {
	if (!trackerInstance) {
		trackerInstance = new CorrelationTracker();
	}
	return trackerInstance;
}

