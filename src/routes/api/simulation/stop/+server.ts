import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScenarioEngine } from '$lib/scenarios/scenario-engine.js';

/**
 * POST /api/simulation/stop
 * Manually stops the active scenario (transitions to settling)
 */
export const POST: RequestHandler = async () => {
	try {
		const engine = getScenarioEngine();
		const stopped = engine.stopScenario();

		if (!stopped) {
			return json({ error: 'No active scenario to stop' }, { status: 400 });
		}

		const state = engine.getState();
		const activeModifier = state.activeModifiers[0];

		return json({
			success: true,
			scenario: {
				id: activeModifier.id,
				state: activeModifier.status
			}
		});
	} catch (error) {
		console.error('Error stopping scenario:', error);
		return json({ error: 'Failed to stop scenario' }, { status: 500 });
	}
};

