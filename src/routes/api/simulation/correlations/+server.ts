import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCorrelationTracker } from '$lib/correlations/correlation-tracker.js';

/**
 * GET /api/simulation/correlations
 * Returns correlation data between external events and stream changes
 * Query parameters:
 *   - eventId: filter by event ID (optional)
 *   - stream: filter by stream name (optional)
 *   - startTime: filter by start time (ISO 8601, optional)
 *   - endTime: filter by end time (ISO 8601, optional)
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const correlationTracker = getCorrelationTracker();
		
		// Parse query parameters
		const eventId = url.searchParams.get('eventId') || undefined;
		const stream = url.searchParams.get('stream') || undefined;
		const startTime = url.searchParams.get('startTime') || undefined;
		const endTime = url.searchParams.get('endTime') || undefined;

		// Build filters object
		const filters: {
			eventId?: string;
			stream?: string;
			startTime?: string;
			endTime?: string;
		} = {};

		if (eventId) {
			filters.eventId = eventId;
		}
		if (stream) {
			filters.stream = stream;
		}
		if (startTime) {
			filters.startTime = startTime;
		}
		if (endTime) {
			filters.endTime = endTime;
		}

		// Get correlations matching filters
		const correlations = correlationTracker.getCorrelations(filters);

		return json({
			count: correlations.length,
			correlations
		});
	} catch (error) {
		console.error('Error in /api/simulation/correlations:', error);
		return json(
			{ 
				error: 'Internal server error',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};

