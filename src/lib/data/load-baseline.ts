import type { StreamEvent, ExternalEvent, BaselineStatistics } from '$lib/types';
import { generateAllStreamsHistory, generateBaselineExternalEvents } from '$lib/streams/generate-history.js';
import { calculateAllStreamBaselines } from '$lib/streams/calculate-baseline.js';

/**
 * In-memory storage for baseline historical data
 */
interface BaselineData {
	streamEvents: Record<string, StreamEvent[]>;
	externalEvents: ExternalEvent[];
	statistics: BaselineStatistics;
	aggregations: {
		dailyTotals: Record<string, Record<string, number>>; // stream -> date -> total
		weeklyAverages: Record<string, number>; // stream -> average
	};
	loaded: boolean;
}

let baselineData: BaselineData | null = null;

/**
 * Generate and load baseline historical data into memory
 * Generates 30 days of data for all 50 streams
 * Pre-calculates aggregations for efficient querying
 */
export async function loadBaselineData(): Promise<void> {
	if (baselineData?.loaded) {
		return; // Already loaded
	}

	console.log('Loading baseline historical data...');
	const startTime = Date.now();

	// Calculate 30 days ago from now
	const endDate = new Date();
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 30);

	// Generate 30-day historical data for all streams
	const streamEvents = generateAllStreamsHistory(startDate, endDate);

	// Generate baseline external events
	const externalEvents = generateBaselineExternalEvents(startDate, endDate);

	// Calculate baseline statistics
	const statistics = calculateAllStreamBaselines(streamEvents);

	// Pre-calculate aggregations
	const aggregations = calculateAggregations(streamEvents);

	baselineData = {
		streamEvents,
		externalEvents,
		statistics,
		aggregations,
		loaded: true
	};

	const loadTime = Date.now() - startTime;
	const totalEvents = Object.values(streamEvents).reduce((sum, events) => sum + events.length, 0);
	const memoryEstimate = estimateMemoryUsage(baselineData);
	
	console.log(`Baseline data loaded in ${loadTime}ms`);
	console.log(`- ${Object.keys(streamEvents).length} streams`);
	console.log(`- ${totalEvents} stream events`);
	console.log(`- ${externalEvents.length} external events`);
	console.log(`- Estimated memory: ${memoryEstimate}MB`);
}

/**
 * Get baseline stream events (returns copy to prevent mutation)
 */
export function getBaselineStreamEvents(): Record<string, StreamEvent[]> {
	if (!baselineData?.loaded) {
		throw new Error('Baseline data not loaded. Call loadBaselineData() first.');
	}
	return { ...baselineData.streamEvents };
}

/**
 * Get baseline external events (returns copy to prevent mutation)
 */
export function getBaselineExternalEvents(): ExternalEvent[] {
	if (!baselineData?.loaded) {
		throw new Error('Baseline data not loaded. Call loadBaselineData() first.');
	}
	return [...baselineData.externalEvents];
}

/**
 * Get baseline statistics
 */
export function getBaselineStatistics(): BaselineStatistics {
	if (!baselineData?.loaded) {
		throw new Error('Baseline data not loaded. Call loadBaselineData() first.');
	}
	return baselineData.statistics;
}

/**
 * Get pre-calculated aggregations
 */
export function getBaselineAggregations() {
	if (!baselineData?.loaded) {
		throw new Error('Baseline data not loaded. Call loadBaselineData() first.');
	}
	return baselineData.aggregations;
}

/**
 * Check if baseline data is loaded
 */
export function isBaselineDataLoaded(): boolean {
	return baselineData?.loaded === true;
}

/**
 * Pre-calculate aggregations for efficient querying
 */
function calculateAggregations(streamEvents: Record<string, StreamEvent[]>): {
	dailyTotals: Record<string, Record<string, number>>;
	weeklyAverages: Record<string, number>;
} {
	const dailyTotals: Record<string, Record<string, number>> = {};
	const weeklyAverages: Record<string, number> = {};

	for (const [streamName, events] of Object.entries(streamEvents)) {
		// Calculate daily totals
		const streamDailyTotals: Record<string, number> = {};
		const weeklyValues: number[] = [];

		for (const event of events) {
			const date = new Date(event.timestamp);
			const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

			if (!streamDailyTotals[dateKey]) {
				streamDailyTotals[dateKey] = 0;
			}
			streamDailyTotals[dateKey] += event.normalizedValue || 0;

			// Collect values for weekly average
			weeklyValues.push(event.normalizedValue || 0);
		}

		dailyTotals[streamName] = streamDailyTotals;

		// Calculate weekly average
		const weeklyAvg = weeklyValues.length > 0
			? weeklyValues.reduce((sum, v) => sum + v, 0) / weeklyValues.length
			: 0;
		weeklyAverages[streamName] = weeklyAvg;
	}

	return { dailyTotals, weeklyAverages };
}

/**
 * Estimate memory usage of baseline data
 */
function estimateMemoryUsage(data: BaselineData): number {
	// Rough estimation: each event ~500 bytes, each external event ~1KB
	let totalBytes = 0;

	// Stream events
	for (const events of Object.values(data.streamEvents)) {
		totalBytes += events.length * 500;
	}

	// External events
	totalBytes += data.externalEvents.length * 1000;

	// Statistics and aggregations
	totalBytes += 10 * 1024 * 1024; // ~10MB for stats and aggregations

	return Math.round(totalBytes / (1024 * 1024)); // Convert to MB
}

