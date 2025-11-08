import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScenarioEngine } from '$lib/scenarios/scenario-engine.js';

/**
 * GET /api/simulation/state
 * Returns the current simulation state with lifecycle information
 */
export const GET: RequestHandler = async () => {
	const engine = getScenarioEngine();
	const state = engine.getState();

	// Enhance state with lifecycle information
	const enhancedState = {
		...state,
		activeModifiers: state.activeModifiers.map((modifier) => {
			const modifierInfo: any = {
				...modifier,
				lifecycleState: modifier.status
			};

			// Add settlement progress if in settling state
			if (modifier.status === 'settling') {
				const progress = engine.getSettlementProgress(modifier.id);
				if (progress !== null) {
					modifierInfo.settlementProgress = progress;
				}
			}

			return modifierInfo;
		})
	};

	return json(enhancedState);
};

