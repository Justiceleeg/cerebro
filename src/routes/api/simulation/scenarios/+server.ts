import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ScenarioLoader } from '$lib/scenarios/scenario-loader.js';
import scenarioIndex from '$lib/server/config/scenarios/index.json';
import examSeasonSurge from '$lib/server/config/scenarios/exam-season-surge.json';
import supplyCrisis from '$lib/server/config/scenarios/supply-crisis.json';
import paymentOutage from '$lib/server/config/scenarios/payment-outage.json';
import qualityCrisis from '$lib/server/config/scenarios/quality-crisis.json';
import supportOverload from '$lib/server/config/scenarios/support-overload.json';
import churnPattern from '$lib/server/config/scenarios/churn-pattern.json';
import recruitingCrisis from '$lib/server/config/scenarios/recruiting-crisis.json';
import competitorDisruption from '$lib/server/config/scenarios/competitor-disruption.json';
import normalOperations from '$lib/server/config/scenarios/normal-operations.json';

// Map of scenario files
const scenarioFiles: Record<string, any> = {
	'exam-season-surge': examSeasonSurge,
	'supply-crisis': supplyCrisis,
	'payment-outage': paymentOutage,
	'quality-crisis': qualityCrisis,
	'support-overload': supportOverload,
	'churn-pattern': churnPattern,
	'recruiting-crisis': recruitingCrisis,
	'competitor-disruption': competitorDisruption,
	'normal-operations': normalOperations
};

/**
 * GET /api/simulation/scenarios
 * Returns list of available scenarios with metadata
 */
export const GET: RequestHandler = async () => {
	try {
		const loader = new ScenarioLoader();
		const scenarios = loader.listScenarios();

		// Enrich with metadata from scenario files
		const enrichedScenarios = scenarios.map((scenario) => {
			const scenarioFile = scenarioFiles[scenario.id];
			return {
				...scenario,
				description: scenarioFile?.description || '',
				duration: scenarioFile?.duration || '',
				settlementDuration: scenarioFile?.settlementDuration || ''
			};
		});

		return json(enrichedScenarios);
	} catch (error) {
		console.error('Error listing scenarios:', error);
		return json({ error: 'Failed to list scenarios' }, { status: 500 });
	}
};

