import type { StreamEvent } from '$lib/types';
import type { CustomerTutorSearchData } from '$lib/types/stream-events';
import baselineMetrics from '$lib/server/config/baseline-metrics.json';
import {
	normalizeStreamValue,
	getBaselineStatsForCustomerTutorSearch
} from './normalize.js';

/**
 * Minimal StreamGenerator class
 * Generates stream events using baseline metrics from configuration
 */
export class StreamGenerator {
	/**
	 * Generate a customer.tutor.search event
	 */
	generateCustomerTutorSearch(): StreamEvent {
		const stream = 'customer.tutor.search';
		const timestamp = new Date().toISOString();

		// Generate realistic search data
		const data: CustomerTutorSearchData = {
			user_id: `user_${Math.random().toString(36).substring(2, 11)}`,
			subject: this.getRandomSubject(),
			availability_start: this.getRandomAvailabilityStart(),
			availability_end: this.getRandomAvailabilityEnd(),
			keywords: this.getRandomKeywords()
		};

		// Get baseline metrics for this stream
		const streamBaseline = baselineMetrics.streamBaselines[stream as keyof typeof baselineMetrics.streamBaselines];
		const eventsPerDay = streamBaseline?.eventsPerDay || 8000;

		// Calculate raw value (events per day as a simple metric)
		// For now, use the baseline value with some variance
		const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
		const rawValue = eventsPerDay * (1 + variance);

		// Normalize the value
		const baselineStats = getBaselineStatsForCustomerTutorSearch();
		const { normalizedValue, anomalyFlag } = normalizeStreamValue(rawValue, baselineStats);

		return {
			stream,
			timestamp,
			data,
			normalizedValue,
			anomalyFlag
		};
	}

	private getRandomSubject(): string {
		const subjects = ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology'];
		return subjects[Math.floor(Math.random() * subjects.length)];
	}

	private getRandomAvailabilityStart(): string {
		const now = new Date();
		const hours = Math.floor(Math.random() * 12) + 8; // 8am to 8pm
		const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
		now.setHours(hours, minutes, 0, 0);
		return now.toISOString();
	}

	private getRandomAvailabilityEnd(): string {
		const start = new Date(this.getRandomAvailabilityStart());
		start.setHours(start.getHours() + Math.floor(Math.random() * 3) + 1); // 1-3 hours later
		return start.toISOString();
	}

	private getRandomKeywords(): string[] {
		const allKeywords = ['experienced', 'certified', 'native speaker', 'online', 'in-person', 'group', 'one-on-one'];
		const count = Math.floor(Math.random() * 3) + 1; // 1-3 keywords
		const shuffled = [...allKeywords].sort(() => 0.5 - Math.random());
		return shuffled.slice(0, count);
	}
}

