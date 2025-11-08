import type { SimulationState, ScenarioModifier, ExternalEvent, StreamModification } from '$lib/types';

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
	 * Parse duration string (e.g., "3 hours", "6 hours") to milliseconds
	 */
	private parseDuration(duration: string): number {
		const match = duration.match(/^(\d+)\s*(second|seconds|minute|minutes|hour|hours|day|days)$/i);
		if (!match) {
			return 0;
		}

		const value = parseInt(match[1], 10);
		const unit = match[2].toLowerCase();

		if (unit.startsWith('second')) {
			return value * 1000;
		} else if (unit.startsWith('minute')) {
			return value * 60 * 1000;
		} else if (unit.startsWith('hour')) {
			return value * 60 * 60 * 1000;
		} else if (unit.startsWith('day')) {
			return value * 24 * 60 * 60 * 1000;
		}

		return 0;
	}

	/**
	 * Calculate settlement progress (0.0 to 1.0)
	 * Linear: progress increases linearly
	 * Exponential: progress increases exponentially (ease-out)
	 */
	private calculateSettlementProgress(
		settlementStartTime: string,
		settlementDuration: string,
		settlementType: 'linear' | 'exponential' = 'linear'
	): number {
		const startTime = new Date(settlementStartTime).getTime();
		const now = Date.now();
		const durationMs = this.parseDuration(settlementDuration);

		if (durationMs === 0) {
			return 1.0; // No settlement duration, consider settled
		}

		const elapsed = now - startTime;
		let progress = Math.min(1.0, elapsed / durationMs);

		// Apply settlement type
		if (settlementType === 'exponential') {
			// Exponential ease-out: 1 - (1 - t)^2
			progress = 1 - Math.pow(1 - progress, 2);
		}

		return progress;
	}

	/**
	 * Interpolate multiplier during settling
	 * Multiplier gradually returns to 1.0 based on settlement progress
	 */
	private interpolateMultiplier(originalMultiplier: number, progress: number): number {
		// Interpolate from originalMultiplier to 1.0
		return originalMultiplier + (1.0 - originalMultiplier) * progress;
	}

	/**
	 * Update scenario lifecycle states
	 * Checks if scenarios should transition from active -> settling -> settled
	 */
	private updateScenarioLifecycle(): void {
		const now = new Date().toISOString();

		for (const modifier of this.state.activeModifiers) {
			if (modifier.status === 'active') {
				// Check if duration has expired
				if (modifier.duration) {
					const startTime = new Date(modifier.startTime).getTime();
					const durationMs = this.parseDuration(modifier.duration);
					const elapsed = Date.now() - startTime;

					if (elapsed >= durationMs) {
						// Transition to settling
						modifier.status = 'settling';
						modifier.settlementStartTime = now;
					}
				}
			} else if (modifier.status === 'settling') {
				// Check if settlement duration has expired
				if (modifier.settlementDuration && modifier.settlementStartTime) {
					const progress = this.calculateSettlementProgress(
						modifier.settlementStartTime,
						modifier.settlementDuration,
						modifier.settlementType || 'linear'
					);

					if (progress >= 1.0) {
						// Transition to settled
						modifier.status = 'settled';
					}
				} else {
					// No settlement duration, immediately settle
					modifier.status = 'settled';
				}
			}
		}
	}

	/**
	 * Get effective modifiers with settlement interpolation applied
	 * Returns modifiers with multipliers adjusted based on settlement progress
	 */
	getEffectiveModifiers(): ScenarioModifier[] {
		this.updateScenarioLifecycle();

		return this.state.activeModifiers.map((modifier) => {
			if (modifier.status !== 'settling') {
				return modifier;
			}

			// Calculate settlement progress
			if (!modifier.settlementStartTime || !modifier.settlementDuration) {
				return modifier;
			}

			const progress = this.calculateSettlementProgress(
				modifier.settlementStartTime,
				modifier.settlementDuration,
				modifier.settlementType || 'linear'
			);

			// Create a copy with interpolated multipliers
			const effectiveModifier: ScenarioModifier = {
				...modifier,
				affectedStreams: { ...modifier.affectedStreams }
			};

			// Interpolate multipliers for each affected stream
			for (const [stream, streamMod] of Object.entries(modifier.affectedStreams)) {
				if (streamMod.multiplier !== undefined) {
					effectiveModifier.affectedStreams[stream] = {
						...streamMod,
						multiplier: this.interpolateMultiplier(streamMod.multiplier, progress)
					};
				}
			}

			return effectiveModifier;
		});
	}

	/**
	 * Get settlement progress for a scenario (0.0 to 1.0)
	 * Returns null if scenario is not in settling state
	 */
	getSettlementProgress(modifierId: string): number | null {
		this.updateScenarioLifecycle();

		const modifier = this.state.activeModifiers.find((m) => m.id === modifierId);
		if (!modifier || modifier.status !== 'settling') {
			return null;
		}

		if (!modifier.settlementStartTime || !modifier.settlementDuration) {
			return null;
		}

		return this.calculateSettlementProgress(
			modifier.settlementStartTime,
			modifier.settlementDuration,
			modifier.settlementType || 'linear'
		);
	}

	/**
	 * Check if a scenario is currently active
	 * Returns true if any scenario is in 'active' or 'settling' state
	 */
	hasActiveScenario(): boolean {
		this.updateScenarioLifecycle();
		return this.state.activeModifiers.some(
			(m) => m.status === 'active' || m.status === 'settling'
		);
	}

	/**
	 * Get the currently active scenario (if any)
	 * Returns the active scenario modifier or null
	 */
	getActiveScenario(): ScenarioModifier | null {
		this.updateScenarioLifecycle();
		const active = this.state.activeModifiers.find(
			(m) => m.status === 'active' || m.status === 'settling'
		);
		return active || null;
	}

	/**
	 * Activate a scenario
	 * Stores scenario modifiers and external events in state
	 * Throws an error if a scenario is already active
	 */
	activateScenario(scenario: ScenarioModifier, events: ExternalEvent[]): void {
		this.updateScenarioLifecycle();

		// Check for active scenario conflict
		if (this.hasActiveScenario()) {
			const activeScenario = this.getActiveScenario();
			throw new Error(
				`Cannot activate scenario "${scenario.id}": scenario "${activeScenario?.id}" is already active`
			);
		}

		this.state.activeModifiers = [scenario];
		this.state.activeEvents = events;
		this.state.historicalMode = 'modified';
		this.state.lastModified = new Date().toISOString();
	}

	/**
	 * Stop active scenario (transition to settling)
	 */
	stopScenario(): boolean {
		this.updateScenarioLifecycle();

		const activeModifier = this.state.activeModifiers.find((m) => m.status === 'active');
		if (!activeModifier) {
			return false;
		}

		activeModifier.status = 'settling';
		activeModifier.settlementStartTime = new Date().toISOString();
		this.state.lastModified = new Date().toISOString();

		return true;
	}

	/**
	 * Get current simulation state
	 */
	getState(): SimulationState {
		this.updateScenarioLifecycle();

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
	 * Get active scenario modifiers (with settlement interpolation)
	 */
	getActiveModifiers(): ScenarioModifier[] {
		return this.getEffectiveModifiers();
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

