import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SimulationState } from '$lib/types';

/**
 * GET /api/simulation/state
 * Returns the current simulation state
 */
export const GET: RequestHandler = async () => {
	const state: SimulationState = {
		baselineState: 'normal',
		activeModifiers: [],
		activeEvents: [],
		historicalMode: 'baseline',
		currentSimulationTime: new Date().toISOString(),
		lastModified: new Date().toISOString()
	};

	return json(state);
};

