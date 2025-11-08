import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getBaselineStreamEvents,
	getBaselineStatistics,
	isBaselineDataLoaded,
	loadBaselineData
} from '$lib/data/load-baseline.js';
import { regenerateHistoricalWindow } from '$lib/streams/generate-history.js';
import { getScenarioEngine } from '$lib/scenarios/scenario-engine.js';
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

	// Check if a scenario is active
	const engine = getScenarioEngine();
	const hasActiveScenario = engine.hasActiveScenario();
	const activeModifiers = hasActiveScenario ? engine.getActiveModifiers() : [];
	const activeEvents = hasActiveScenario ? engine.getActiveEvents() : [];

	// Determine which streams to return
	const allStreamEvents = getBaselineStreamEvents();
	const requestedStreams = streamsParam
		? streamsParam.split(',').map((s) => s.trim())
		: Object.keys(allStreamEvents); // Default to all streams if not specified

	// Filter events by time range and stream
	const history: Record<string, { events: StreamEvent[]; baseline: any }> = {};
	const statistics = getBaselineStatistics();

	for (const stream of requestedStreams) {
		let streamEvents: StreamEvent[];

		if (hasActiveScenario && activeModifiers.length > 0) {
			// Get baseline events for this stream and time range
			const baselineStreamEvents = allStreamEvents[stream] || [];
			const baselineEventsInRange = baselineStreamEvents.filter((event) => {
				const eventTime = new Date(event.timestamp);
				return eventTime >= start && eventTime <= end;
			});
			
			// Regenerate historical data with scenario modifications applied
			// Pass baseline events to avoid double-generation
			streamEvents = regenerateHistoricalWindow(
				stream,
				start,
				end,
				activeModifiers,
				activeEvents,
				baselineEventsInRange
			);
		} else {
			// Use baseline data
			const baselineStreamEvents = allStreamEvents[stream] || [];
			
			// Filter events by time range
			streamEvents = baselineStreamEvents.filter((event) => {
				const eventTime = new Date(event.timestamp);
				return eventTime >= start && eventTime <= end;
			});
		}

		// Get baseline statistics for this stream
		const baseline = statistics.streams[stream] || null;

		history[stream] = {
			events: streamEvents,
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

