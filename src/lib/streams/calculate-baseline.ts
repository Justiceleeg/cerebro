import type { StreamBaseline, BaselineStatistics } from '$lib/types';
import type { StreamEvent } from '$lib/types';
import baselineMetrics from '$lib/server/config/baseline-metrics.json';

/**
 * Calculate baseline statistics from historical stream events
 * Minimal implementation for 2 data points
 */
export function calculateBaseline(streamName: string, events: StreamEvent[]): StreamBaseline {
	// Extract normalized values (or use raw values if normalized not available)
	const values = events
		.map((e) => e.normalizedValue ?? 50) // Default to 50 if not normalized
		.filter((v) => v !== undefined) as number[];

	// Calculate statistics
	const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
	const sorted = [...values].sort((a, b) => a - b);
	const median = sorted.length % 2 === 0
		? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
		: sorted[Math.floor(sorted.length / 2)];

	// Calculate standard deviation
	const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
	const stdDev = Math.sqrt(variance);

	const min = Math.min(...values);
	const max = Math.max(...values);

	// Calculate percentiles (simplified for small datasets)
	const p25 = sorted[Math.floor(sorted.length * 0.25)] || median;
	const p50 = median;
	const p75 = sorted[Math.floor(sorted.length * 0.75)] || median;
	const p90 = sorted[Math.floor(sorted.length * 0.9)] || max;
	const p95 = sorted[Math.floor(sorted.length * 0.95)] || max;

	// Calculate weekday/weekend averages from actual events
	const weekdayValues: number[] = [];
	const weekendValues: number[] = [];
	
	for (const event of events) {
		const date = new Date(event.timestamp);
		const dayOfWeek = date.getDay();
		const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
		const value = event.normalizedValue ?? 50;
		
		if (isWeekend) {
			weekendValues.push(value);
		} else {
			weekdayValues.push(value);
		}
	}
	
	const weekdayAvg = weekdayValues.length > 0
		? weekdayValues.reduce((sum, v) => sum + v, 0) / weekdayValues.length
		: mean;
	const weekendAvg = weekendValues.length > 0
		? weekendValues.reduce((sum, v) => sum + v, 0) / weekendValues.length
		: mean * 1.35; // Fallback to ~35% more on weekends

	return {
		name: streamName,
		mean,
		median,
		stdDev,
		min,
		max,
		percentiles: {
			p25,
			p50,
			p75,
			p90,
			p95
		},
		patterns: {
			weekdayAvg,
			weekendAvg,
			trend: 'stable', // Minimal implementation
			seasonality: 'none' // Minimal implementation
		}
	};
}

/**
 * Calculate baseline statistics for all streams
 * @param allStreamEvents - Map of stream name to events
 * @returns BaselineStatistics with all stream baselines
 */
export function calculateAllStreamBaselines(
	allStreamEvents: Record<string, StreamEvent[]>
): BaselineStatistics {
	const streams: Record<string, StreamBaseline> = {};
	
	// Get all stream names from baseline metrics
	const streamNames = Object.keys(baselineMetrics.streamBaselines);
	
	for (const streamName of streamNames) {
		const events = allStreamEvents[streamName] || [];
		if (events.length > 0) {
			streams[streamName] = calculateBaseline(streamName, events);
		}
	}
	
	return {
		calculatedFrom: 'historical_data',
		streams
	};
}

