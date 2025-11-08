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
		let result;
		try {
			result = await loader.loadScenario(scenarioId);
		} catch (error) {
			// Handle validation errors
			if (error instanceof Error && error.message.includes('Invalid scenario definition')) {
				return json({ error: error.message }, { status: 400 });
			}
			throw error;
		}

		if (!result) {
			return json({ error: `Scenario not found: ${scenarioId}` }, { status: 404 });
		}

		const { scenario, events } = result;
		const engine = getScenarioEngine();

		try {
			engine.activateScenario(scenario, events);
		} catch (error) {
			// Handle scenario conflict
			if (error instanceof Error && error.message.includes('already active')) {
				const activeScenario = engine.getActiveScenario();
				return json(
					{
						error: 'Scenario conflict',
						message: error.message,
						activeScenario: activeScenario?.id
					},
					{ status: 409 }
				);
			}
			// Re-throw other errors
			throw error;
		}

		return json({
			success: true,
			scenario,
			events
		});
	} catch (error) {
		console.error('Error activating scenario:', error);
		// Return conflict error if already handled
		if (error instanceof Error && error.message.includes('already active')) {
			return json(
				{
					error: 'Scenario conflict',
					message: error.message
				},
				{ status: 409 }
			);
		}
		return json({ error: 'Failed to activate scenario' }, { status: 500 });
	}
};

