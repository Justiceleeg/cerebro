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

		// Validate scenario definition
		const validation = this.validateScenario(scenarioId);
		if (!validation.valid) {
			throw new Error(
				`Invalid scenario definition for "${scenarioId}": ${validation.errors.join(', ')}`
			);
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
			settlementDuration: scenarioData.settlementDuration,
			settlementType: scenarioData.settlementType || 'linear'
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

	/**
	 * Validate a scenario definition
	 * Returns validation errors if any, or null if valid
	 */
	validateScenario(scenarioId: string): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		// Check if scenario exists in index
		const scenarioInfo = scenarioIndex.scenarios.find((s) => s.id === scenarioId);
		if (!scenarioInfo) {
			errors.push(`Scenario "${scenarioId}" not found in index`);
			return { valid: false, errors };
		}

		// Check if scenario file exists
		const scenarioData = scenarioFiles[scenarioId];
		if (!scenarioData) {
			errors.push(`Scenario file not found for "${scenarioId}"`);
			return { valid: false, errors };
		}

		// Validate required fields
		if (!scenarioData.id) {
			errors.push(`Scenario "${scenarioId}" missing required field: id`);
		}
		if (!scenarioData.description) {
			errors.push(`Scenario "${scenarioId}" missing required field: description`);
		}
		// Allow empty affectedStreams for baseline scenarios (e.g., normal-operations)
		if (scenarioData.affectedStreams === undefined || scenarioData.affectedStreams === null) {
			errors.push(`Scenario "${scenarioId}" missing required field: affectedStreams`);
		}

		// Validate affectedStreams structure
		if (scenarioData.affectedStreams) {
			for (const [stream, config] of Object.entries(scenarioData.affectedStreams)) {
				if (!config || typeof config !== 'object') {
					errors.push(`Scenario "${scenarioId}" has invalid affectedStreams entry for "${stream}"`);
				} else {
					// Stream modification must have at least one of: multiplier, override, additive, or probabilityShift
					const hasModifier =
						config.multiplier !== undefined ||
						config.override !== undefined ||
						config.additive !== undefined ||
						config.probabilityShift !== undefined;
					if (!hasModifier) {
						errors.push(
							`Scenario "${scenarioId}" affectedStreams["${stream}"] missing modifier (multiplier, override, additive, or probabilityShift)`
						);
					}
				}
			}
		}

		// Validate external events if present
		if (scenarioData.externalEvents && Array.isArray(scenarioData.externalEvents)) {
			for (const event of scenarioData.externalEvents) {
				if (!event.id) {
					errors.push(`Scenario "${scenarioId}" has external event missing id`);
				}
				if (!event.type) {
					errors.push(`Scenario "${scenarioId}" external event "${event.id || 'unknown'}" missing type`);
				}
				if (!event.title) {
					errors.push(`Scenario "${scenarioId}" external event "${event.id || 'unknown'}" missing title`);
				}
				if (!event.description) {
					errors.push(
						`Scenario "${scenarioId}" external event "${event.id || 'unknown'}" missing description`
					);
				}
			}
		}

		return { valid: errors.length === 0, errors };
	}

	/**
	 * Validate all scenarios
	 * Returns a map of scenario IDs to validation results
	 */
	validateAllScenarios(): Record<string, { valid: boolean; errors: string[] }> {
		const results: Record<string, { valid: boolean; errors: string[] }> = {};

		for (const scenarioInfo of scenarioIndex.scenarios) {
			results[scenarioInfo.id] = this.validateScenario(scenarioInfo.id);
		}

		return results;
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

