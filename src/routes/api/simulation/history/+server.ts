import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getBaselineStreamEvents,
	getBaselineStatistics,
	isBaselineDataLoaded,
	loadBaselineData
} from '$lib/data/load-baseline.js';
import type { StreamEvent } from '$lib/types';

/**
 * GET /api/simulation/history
 * Returns historical stream data for a time range from in-memory baseline data
 * Query parameters:
 *   - start: ISO 8601 timestamp (required)
 *   - end: ISO 8601 timestamp (required)
 *   - streams: comma-separated stream names (optional, defaults to all streams)
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

	// Ensure baseline data is loaded
	if (!isBaselineDataLoaded()) {
		await loadBaselineData();
	}

	// Get baseline data from memory
	const allStreamEvents = getBaselineStreamEvents();
	const statistics = getBaselineStatistics();

	// Determine which streams to return
	const requestedStreams = streamsParam
		? streamsParam.split(',').map((s) => s.trim())
		: Object.keys(allStreamEvents); // Default to all streams if not specified

	// Filter events by time range and stream
	const history: Record<string, { events: StreamEvent[]; baseline: any }> = {};

	for (const stream of requestedStreams) {
		const streamEvents = allStreamEvents[stream] || [];

		// Filter events by time range
		const filteredEvents = streamEvents.filter((event) => {
			const eventTime = new Date(event.timestamp);
			return eventTime >= start && eventTime <= end;
		});

		// Get baseline statistics for this stream
		const baseline = statistics.streams[stream] || null;

		history[stream] = {
			events: filteredEvents,
			baseline
		};
	}

	return json({
		start: start.toISOString(),
		end: end.toISOString(),
		streams: requestedStreams,
		data: history
	});
};

