/**
 * Sample chart data for testing the time-series chart
 * Generates 24 hours of hourly data points for a single stream
 */

import type { ChartDataPoint } from '$lib/types/dashboard.js';

/**
 * Generate sample data for customer.tutor.search stream
 * Values vary around baseline (50) to show realistic pattern
 */
export function generateSampleChartData(): ChartDataPoint[] {
	const now = new Date();
	const data: ChartDataPoint[] = [];

	// Generate 24 hours of hourly data points
	for (let i = 23; i >= 0; i--) {
		const timestamp = new Date(now);
		timestamp.setHours(timestamp.getHours() - i);
		timestamp.setMinutes(0);
		timestamp.setSeconds(0);
		timestamp.setMilliseconds(0);

		// Generate normalized value that varies around baseline (50)
		// Simulate realistic patterns: lower at night, higher during day
		const hour = timestamp.getHours();
		const baseValue = hour >= 6 && hour <= 22 ? 50 : 30; // Lower at night
		const variation = Math.sin((hour / 24) * Math.PI * 2) * 15; // Sine wave variation
		const randomNoise = (Math.random() - 0.5) * 10; // Random noise
		const normalized = Math.max(0, Math.min(100, baseValue + variation + randomNoise));

		// Raw value is normalized * 10 for demonstration (arbitrary scaling)
		const rawValue = normalized * 10;

		data.push({
			timestamp: timestamp.toISOString(),
			value: rawValue,
			normalized: Math.round(normalized * 100) / 100 // Round to 2 decimal places
		});
	}

	return data;
}

/**
 * Pre-generated sample data for customer.tutor.search stream
 */
export const sampleChartData: ChartDataPoint[] = generateSampleChartData();

