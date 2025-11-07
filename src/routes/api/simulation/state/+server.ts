import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScenarioEngine } from '$lib/scenarios/scenario-engine.js';

/**
 * GET /api/simulation/state
 * Returns the current simulation state
 */
export const GET: RequestHandler = async () => {
	const engine = getScenarioEngine();
	const state = engine.getState();

	return json(state);
};

