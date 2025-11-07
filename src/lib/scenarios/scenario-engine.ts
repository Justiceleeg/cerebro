import type { SimulationState, ScenarioModifier, ExternalEvent } from '$lib/types';

/**
 * ScenarioEngine class
 * Tracks active scenario state and manages scenario lifecycle
 */
export class ScenarioEngine {
	private state: SimulationState;

	constructor() {
		this.state = {
			baselineState: 'normal',
			activeModifiers: [],
			activeEvents: [],
			historicalMode: 'baseline',
			currentSimulationTime: new Date().toISOString(),
			lastModified: new Date().toISOString()
		};
	}

	/**
	 * Activate a scenario
	 * Stores scenario modifiers and external events in state
	 */
	activateScenario(scenario: ScenarioModifier, events: ExternalEvent[]): void {
		// For minimal implementation, just store the scenario and events
		// Don't apply to generation yet (that's in Slice 6)
		this.state.activeModifiers = [scenario];
		this.state.activeEvents = events;
		this.state.historicalMode = 'modified';
		this.state.lastModified = new Date().toISOString();
	}

	/**
	 * Get current simulation state
	 */
	getState(): SimulationState {
		return {
			...this.state,
			currentSimulationTime: new Date().toISOString()
		};
	}

	/**
	 * Reset to baseline
	 */
	reset(): void {
		this.state = {
			baselineState: 'normal',
			activeModifiers: [],
			activeEvents: [],
			historicalMode: 'baseline',
			currentSimulationTime: new Date().toISOString(),
			lastModified: new Date().toISOString()
		};
	}

	/**
	 * Get active scenario modifiers
	 */
	getActiveModifiers(): ScenarioModifier[] {
		return this.state.activeModifiers;
	}

	/**
	 * Get active external events
	 */
	getActiveEvents(): ExternalEvent[] {
		return this.state.activeEvents;
	}
}

// Singleton instance
let engineInstance: ScenarioEngine | null = null;

/**
 * Get the singleton ScenarioEngine instance
 */
export function getScenarioEngine(): ScenarioEngine {
	if (!engineInstance) {
		engineInstance = new ScenarioEngine();
	}
	return engineInstance;
}

