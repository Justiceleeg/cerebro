/**
 * Normalization function for stream values
 * Converts raw stream values to 0-100 scale based on baseline statistics
 */

import baselineMetrics from '$lib/server/config/baseline-metrics.json';

interface BaselineStats {
	mean: number;
	stdDev: number;
	min: number;
	max: number;
}

/**
 * Normalize a raw stream value to 0-100 scale
 * @param rawValue - The raw stream value
 * @param baselineStats - Baseline statistics for the stream
 * @returns Object with normalized value (0-100) and anomaly flag
 */
export function normalizeStreamValue(
	rawValue: number,
	baselineStats: BaselineStats
): { normalizedValue: number; anomalyFlag: 'normal' | 'warning' | 'critical' } {
	const { mean, stdDev, min, max } = baselineStats;

	// Calculate z-score (handle division by zero)
	const safeStdDev = stdDev || 1; // Avoid division by zero
	const zScore = (rawValue - mean) / safeStdDev;

	// Normalize to 0-100 scale where 50 = mean
	// Using a sigmoid-like function to map z-scores to 0-100
	// z-score of 0 (mean) maps to 50
	// z-score of ±2 maps to ~27 and ~73
	// z-score of ±3 maps to ~12 and ~88
	const normalizedValue = Math.max(
		0,
		Math.min(100, 50 + (zScore * 15)) // Scale factor of 15 gives reasonable spread
	);

	// Determine anomaly flag based on z-score
	let anomalyFlag: 'normal' | 'warning' | 'critical';
	if (Math.abs(zScore) < 1) {
		anomalyFlag = 'normal';
	} else if (Math.abs(zScore) < 2) {
		anomalyFlag = 'warning';
	} else {
		anomalyFlag = 'critical';
	}

	return { normalizedValue, anomalyFlag };
}

/**
 * Get baseline stats for any stream
 * Uses baseline metrics from configuration
 */
export function getBaselineStatsForStream(stream: string): BaselineStats {
	const streamBaseline = baselineMetrics.streamBaselines[stream as keyof typeof baselineMetrics.streamBaselines];
	
	if (!streamBaseline) {
		// Fallback for unknown streams
		return {
			mean: 1000,
			stdDev: 200,
			min: 500,
			max: 2000
		};
	}

	const eventsPerDay = streamBaseline.eventsPerDay || 1000;
	const stdDev = eventsPerDay * 0.125; // ~12.5% variance
	const min = eventsPerDay * 0.625; // ~62.5% of mean
	const max = eventsPerDay * 1.5; // ~150% of mean

	return {
		mean: eventsPerDay,
		stdDev,
		min,
		max
	};
}

/**
 * Get hardcoded baseline stats for customer.tutor.search
 * @deprecated Use getBaselineStatsForStream('customer.tutor.search') instead
 */
export function getBaselineStatsForCustomerTutorSearch(): BaselineStats {
	return getBaselineStatsForStream('customer.tutor.search');
}

