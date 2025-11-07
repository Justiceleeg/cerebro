import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ScenarioLoader } from '$lib/scenarios/scenario-loader.js';
import { getScenarioEngine } from '$lib/scenarios/scenario-engine.js';

/**
 * POST /api/simulation/scenario
 * Activates a scenario by ID
 * Body: { scenarioId: string }
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { scenarioId } = body;

		if (!scenarioId || typeof scenarioId !== 'string') {
			return json({ error: 'Missing or invalid scenarioId' }, { status: 400 });
		}

		const loader = new ScenarioLoader();
		const result = await loader.loadScenario(scenarioId);

		if (!result) {
			return json({ error: `Scenario not found: ${scenarioId}` }, { status: 404 });
		}

		const { scenario, events } = result;
		const engine = getScenarioEngine();
		engine.activateScenario(scenario, events);

		return json({
			success: true,
			scenario,
			events
		});
	} catch (error) {
		console.error('Error activating scenario:', error);
		return json({ error: 'Failed to activate scenario' }, { status: 500 });
	}
};

