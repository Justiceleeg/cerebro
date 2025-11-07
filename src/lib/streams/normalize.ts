/**
 * Normalization function for stream values
 * Converts raw stream values to 0-100 scale based on baseline statistics
 */

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

	// Calculate z-score
	const zScore = (rawValue - mean) / stdDev;

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
 * Get hardcoded baseline stats for customer.tutor.search
 * TODO: Replace with calculated baseline stats in future slices
 */
export function getBaselineStatsForCustomerTutorSearch(): BaselineStats {
	// Hardcoded baseline stats for customer.tutor.search
	// Based on 8000 eventsPerDay from baseline-metrics.json
	return {
		mean: 8000,
		stdDev: 1000, // ~12.5% variance
		min: 5000,
		max: 12000
	};
}

