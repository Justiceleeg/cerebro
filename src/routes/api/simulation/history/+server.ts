import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateBaselineHistory } from '$lib/streams/generate-history.js';
import { calculateBaseline } from '$lib/streams/calculate-baseline.js';

/**
 * GET /api/simulation/history
 * Returns historical stream data for a time range
 * Query parameters:
 *   - start: ISO 8601 timestamp (required)
 *   - end: ISO 8601 timestamp (required)
 *   - streams: comma-separated stream names (optional, defaults to customer.tutor.search)
 */
export const GET: RequestHandler = async ({ url }) => {
	const startParam = url.searchParams.get('start');
	const endParam = url.searchParams.get('end');
	const streamsParam = url.searchParams.get('streams');

	if (!startParam || !endParam) {
		return json({ error: 'Missing required parameters: start and end' }, { status: 400 });
	}

	const start = new Date(startParam);
	const end = new Date(endParam);

	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		return json({ error: 'Invalid date format. Use ISO 8601 format.' }, { status: 400 });
	}

	if (start >= end) {
		return json({ error: 'Start date must be before end date' }, { status: 400 });
	}

	// Default to customer.tutor.search if no streams specified
	const streams = streamsParam ? streamsParam.split(',') : ['customer.tutor.search'];

	// Generate historical data for each stream
	const history: Record<string, any> = {};

	for (const stream of streams) {
		const events = generateBaselineHistory(stream, start, end);
		const baseline = calculateBaseline(stream, events);

		history[stream] = {
			events,
			baseline
		};
	}

	return json({
		start: start.toISOString(),
		end: end.toISOString(),
		streams,
		data: history
	});
};

