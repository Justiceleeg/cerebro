import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScenarioEngine } from '$lib/scenarios/scenario-engine.js';

/**
 * POST /api/simulation/reset
 * Resets simulation to baseline state
 */
export const POST: RequestHandler = async () => {
	try {
		const engine = getScenarioEngine();
		engine.reset();

		return json({ success: true });
	} catch (error) {
		console.error('Error resetting simulation:', error);
		return json({ error: 'Failed to reset simulation' }, { status: 500 });
	}
};

