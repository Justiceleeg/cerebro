import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { StreamGenerator } from '$lib/streams/stream-generator.js';
import baselineMetrics from '$lib/server/config/baseline-metrics.json';

/**
 * GET /api/simulation/events
 * Returns a single generated stream event
 * Query parameters:
 *   - stream: stream name (optional, defaults to customer.tutor.search)
 *   - all: if "true", returns events for all streams
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const generator = new StreamGenerator();
		const streamParam = url.searchParams.get('stream');
		const allParam = url.searchParams.get('all');

		// If "all" parameter is set, generate events for all streams
		if (allParam === 'true') {
			const allStreams: Record<string, any> = {};
			const streamNames = Object.keys(baselineMetrics.streamBaselines);
			
			for (const stream of streamNames) {
				try {
					allStreams[stream] = generator.generateEvent(stream);
				} catch (error) {
					console.error(`Error generating event for stream ${stream}:`, error);
					allStreams[stream] = { error: `Failed to generate event: ${error instanceof Error ? error.message : String(error)}` };
				}
			}
			
			return json({
				count: streamNames.length,
				streams: streamNames,
				events: allStreams
			});
		}

		// Generate single event for specified stream (or default)
		const stream = streamParam || 'customer.tutor.search';
		const event = generator.generateEvent(stream);

		return json(event);
	} catch (error) {
		console.error('Error in /api/simulation/events:', error);
		return json(
			{ 
				error: 'Internal server error',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};

