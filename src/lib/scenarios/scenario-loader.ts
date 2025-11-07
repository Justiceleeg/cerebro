import type { ScenarioModifier, ExternalEvent } from '$lib/types';
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
 * ScenarioLoader class
 * Loads scenario definitions from configuration files
 */
export class ScenarioLoader {
	/**
	 * Load scenario by ID
	 * Returns scenario metadata including modifiers and external events
	 */
	async loadScenario(scenarioId: string): Promise<{
		scenario: ScenarioModifier;
		events: ExternalEvent[];
	} | null> {
		// Find scenario in index
		const scenarioInfo = scenarioIndex.scenarios.find((s) => s.id === scenarioId);
		if (!scenarioInfo) {
			return null;
		}

		// Load scenario file
		const scenarioData = scenarioFiles[scenarioId];
		if (!scenarioData) {
			return null;
		}

		// Convert to ScenarioModifier format
		const now = new Date().toISOString();
		const scenario: ScenarioModifier = {
			id: scenarioData.id,
			type: scenarioData.metadata?.category || 'unknown',
			description: scenarioData.description,
			startTime: now,
			duration: scenarioData.duration,
			affectedStreams: this.convertAffectedStreams(scenarioData.affectedStreams),
			cascadeEffects: this.convertCascadeEffects(scenarioData.cascadeEffects || []),
			relatedEvents: scenarioData.externalEvents?.map((e: any) => e.id) || [],
			status: 'active',
			settlementDuration: scenarioData.settlementDuration
		};

		// Convert external events
		const events: ExternalEvent[] = (scenarioData.externalEvents || []).map((e: any) => ({
			id: e.id,
			timestamp: e.timestamp === 'now' ? now : e.timestamp,
			type: e.type,
			title: e.title,
			description: e.description,
			severity: e.severity,
			expectedImpact: e.expectedImpact,
			icon: e.icon,
			externalLink: e.externalLink,
			injectedByAI: e.injectedByAI || false
		}));

		return { scenario, events };
	}

	/**
	 * List all available scenarios
	 */
	listScenarios(): Array<{ id: string; name: string; category: string; tags: string[] }> {
		return scenarioIndex.scenarios.map((s) => ({
			id: s.id,
			name: s.name,
			category: s.category,
			tags: s.tags
		}));
	}

	private convertAffectedStreams(affectedStreams: Record<string, any>): Record<string, any> {
		const result: Record<string, any> = {};
		for (const [stream, config] of Object.entries(affectedStreams)) {
			result[stream] = {
				multiplier: config.multiplier,
				description: config.description
			};
		}
		return result;
	}

	private convertCascadeEffects(cascadeEffects: any[]): any[] {
		return cascadeEffects.map((ce) => ({
			sourceStream: ce.trigger,
			targetStream: Object.keys(ce.effect)[0],
			effect: {
				multiplier: ce.effect[Object.keys(ce.effect)[0]].multiplier
			},
			delay: ce.effect[Object.keys(ce.effect)[0]].delay
		}));
	}
}

