import type { StreamEvent } from '$lib/types';
import streamRelationships from '$lib/server/config/stream-relationships.json';

/**
 * Pending event that requires resolution
 */
interface PendingEvent {
	triggerStream: string;
	triggerEvent: StreamEvent;
	triggerTime: Date;
	possibleOutcomes: Array<{
		stream: string;
		probability: number;
		delay: string;
		condition?: string;
	}>;
	resolved: boolean;
}

/**
 * Scheduled cascading effect
 */
interface ScheduledCascade {
	triggerStream: string;
	triggerEvent: StreamEvent;
	targetStream: string;
	multiplier: number;
	delay: string;
	scheduledTime: Date;
	condition?: string;
	description?: string;
}

/**
 * RelationshipEngine class
 * Enforces event chains, cascading effects, and temporal dependencies
 */
export class RelationshipEngine {
	private pendingEvents: Map<string, PendingEvent[]> = new Map(); // Map of stream -> pending events
	private scheduledCascades: ScheduledCascade[] = [];
	private prerequisiteState: Map<string, Date> = new Map(); // Track when prerequisites occurred

	constructor() {
		// Initialize prerequisite state
		this.initializePrerequisiteState();
	}

	/**
	 * Initialize prerequisite state tracking
	 */
	private initializePrerequisiteState(): void {
		// Initialize all prerequisites as not yet occurred
		const temporalDeps = streamRelationships.temporalDependencies || [];
		for (const dep of temporalDeps) {
			if (!this.prerequisiteState.has(dep.prerequisite)) {
				this.prerequisiteState.set(dep.prerequisite, new Date(0)); // Not yet occurred
			}
		}
	}

	/**
	 * Parse delay string (e.g., "5-30 minutes", "1-6 hours") to milliseconds
	 * Returns a random value within the range
	 */
	private parseDelay(delay: string): number {
		// Handle special cases
		if (delay === 'immediate' || delay === '0') {
			return 0;
		}

		// Handle "at scheduled time" - return 0 for now (would need session data)
		if (delay.includes('at scheduled time')) {
			return 0;
		}

		// Handle "weekly/bi-weekly batches" - return 7 days
		if (delay.includes('weekly') || delay.includes('bi-weekly')) {
			return 7 * 24 * 60 * 60 * 1000;
		}

		// Parse range format: "5-30 minutes", "1-6 hours", etc.
		const rangeMatch = delay.match(/^(\d+)\s*-\s*(\d+)\s*(second|seconds|minute|minutes|hour|hours|day|days)$/i);
		if (rangeMatch) {
			const min = parseInt(rangeMatch[1], 10);
			const max = parseInt(rangeMatch[2], 10);
			const unit = rangeMatch[3].toLowerCase();

			let minMs = 0;
			let maxMs = 0;

			if (unit.startsWith('second')) {
				minMs = min * 1000;
				maxMs = max * 1000;
			} else if (unit.startsWith('minute')) {
				minMs = min * 60 * 1000;
				maxMs = max * 60 * 1000;
			} else if (unit.startsWith('hour')) {
				minMs = min * 60 * 60 * 1000;
				maxMs = max * 60 * 60 * 1000;
			} else if (unit.startsWith('day')) {
				minMs = min * 24 * 60 * 60 * 1000;
				maxMs = max * 24 * 60 * 60 * 1000;
			}

			// Return random value within range
			return minMs + Math.random() * (maxMs - minMs);
		}

		// Parse single value format: "24 hours", "5 minutes", etc.
		const singleMatch = delay.match(/^(\d+)\s*(second|seconds|minute|minutes|hour|hours|day|days)$/i);
		if (singleMatch) {
			const value = parseInt(singleMatch[1], 10);
			const unit = singleMatch[2].toLowerCase();

			if (unit.startsWith('second')) {
				return value * 1000;
			} else if (unit.startsWith('minute')) {
				return value * 60 * 1000;
			} else if (unit.startsWith('hour')) {
				return value * 60 * 60 * 1000;
			} else if (unit.startsWith('day')) {
				return value * 24 * 60 * 60 * 1000;
			}
		}

		return 0; // Default to 0 if parsing fails
	}

	/**
	 * Check if a condition is met for an event
	 */
	private checkCondition(condition: string | undefined, event: StreamEvent): boolean {
		if (!condition) {
			return true;
		}

		// Simple condition checking (can be extended)
		// For now, just check basic equality conditions
		if (condition.includes('===')) {
			const [key, value] = condition.split('===').map(s => s.trim());
			const eventValue = (event.data as any)[key];
			return eventValue === value;
		}

		// Check rating score conditions
		if (condition.includes('rating_score <')) {
			const threshold = parseInt(condition.match(/\d+/)?.[0] || '0', 10);
			const ratingScore = (event.data as any).rating_score;
			return ratingScore !== undefined && ratingScore < threshold;
		}

		// Check status conditions
		if (condition.includes('status ===')) {
			const status = condition.match(/['"]([^'"]+)['"]/)?.[1];
			const eventStatus = (event.data as any).status || (event.data as any).new_status;
			return eventStatus === status;
		}

		return true; // Default to true if condition can't be evaluated
	}

	/**
	 * Find event chain definitions for a stream
	 */
	private findEventChains(stream: string): Array<{
		stream: string;
		next: Array<{
			stream: string;
			probability: number;
			delay: string;
			condition?: string;
		}>;
	}> {
		const chains: Array<{
			stream: string;
			next: Array<{
				stream: string;
				probability: number;
				delay: string;
				condition?: string;
			}>;
		}> = [];

		const eventChains = streamRelationships.eventChains || [];
		for (const chain of eventChains) {
			for (const step of chain.chain || []) {
				if (step.stream === stream && step.next && step.next.length > 0) {
					chains.push(step);
				}
			}
		}

		return chains;
	}

	/**
	 * Find probability matrix for a stream
	 */
	private findProbabilityMatrix(stream: string): Array<{
		stream: string;
		probability: number;
		weight: number;
		condition?: string;
		delay?: string;
	}> | null {
		const matrices = streamRelationships.probabilityMatrices || {};
		
		for (const [matrixId, matrix] of Object.entries(matrices)) {
			if ((matrix as any).trigger === stream) {
				return (matrix as any).outcomes || [];
			}
		}

		return null;
	}

	/**
	 * Find cascading effects for a stream
	 */
	private findCascadingEffects(stream: string): Array<{
		stream: string;
		multiplier: number;
		delay: string;
		condition?: string;
		description?: string;
	}> {
		const effects: Array<{
			stream: string;
			multiplier: number;
			delay: string;
			condition?: string;
			description?: string;
		}> = [];

		const cascades = streamRelationships.cascadingEffects || [];
		for (const cascade of cascades) {
			if (cascade.trigger === stream) {
				effects.push(...(cascade.effects || []));
			}
		}

		return effects;
	}

	/**
	 * Check if temporal dependencies are satisfied
	 */
	private checkTemporalDependencies(stream: string, timestamp: Date): boolean {
		const deps = streamRelationships.temporalDependencies || [];
		for (const dep of deps) {
			if (dep.dependent === stream) {
				const prerequisiteTime = this.prerequisiteState.get(dep.prerequisite);
				if (!prerequisiteTime || prerequisiteTime.getTime() === 0) {
					// Prerequisite not yet occurred
					return false;
				}

				// Check if enough time has passed
				const minDelay = this.parseDelay(dep.minDelay || '0');
				const timeSincePrerequisite = timestamp.getTime() - prerequisiteTime.getTime();
				if (timeSincePrerequisite < minDelay) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Select outcome based on probability matrix
	 */
	private selectOutcome(outcomes: Array<{
		stream: string;
		probability: number;
		weight: number;
		condition?: string;
		delay?: string;
	}>, event: StreamEvent): {
		stream: string;
		delay: string;
	} | null {
		// Filter outcomes by condition
		const validOutcomes = outcomes.filter(outcome => this.checkCondition(outcome.condition, event));
		
		if (validOutcomes.length === 0) {
			return null;
		}

		// Use weighted random selection
		const totalWeight = validOutcomes.reduce((sum, outcome) => sum + outcome.weight, 0);
		let random = Math.random() * totalWeight;

		for (const outcome of validOutcomes) {
			random -= outcome.weight;
			if (random <= 0) {
				return {
					stream: outcome.stream,
					delay: outcome.delay || '0'
				};
			}
		}

		// Fallback to first outcome
		return {
			stream: validOutcomes[0].stream,
			delay: validOutcomes[0].delay || '0'
		};
	}

	/**
	 * Process a generated event
	 * Returns additional events that should be generated due to relationships
	 */
	processEvent(event: StreamEvent): StreamEvent[] {
		const additionalEvents: StreamEvent[] = [];
		const eventTime = new Date(event.timestamp);

		// Update prerequisite state
		this.prerequisiteState.set(event.stream, eventTime);

		// Check for event chains
		const chains = this.findEventChains(event.stream);
		for (const chain of chains) {
			for (const next of chain.next) {
				// Check condition if present
				if (!this.checkCondition(next.condition, event)) {
					continue;
				}

				// Check probability
				if (Math.random() > next.probability) {
					continue;
				}

				// Calculate delay
				const delayMs = this.parseDelay(next.delay);
				const scheduledTime = new Date(eventTime.getTime() + delayMs);

				// Add to pending events
				const pendingKey = next.stream;
				if (!this.pendingEvents.has(pendingKey)) {
					this.pendingEvents.set(pendingKey, []);
				}

				const pending: PendingEvent = {
					triggerStream: event.stream,
					triggerEvent: event,
					triggerTime: eventTime,
					possibleOutcomes: [{
						stream: next.stream,
						probability: 1.0,
						delay: next.delay
					}],
					resolved: false
				};

				this.pendingEvents.get(pendingKey)!.push(pending);
			}
		}

		// Check for probability matrices
		const matrix = this.findProbabilityMatrix(event.stream);
		if (matrix) {
			const outcome = this.selectOutcome(matrix, event);
			if (outcome) {
				const delayMs = this.parseDelay(outcome.delay);
				const scheduledTime = new Date(eventTime.getTime() + delayMs);

				// Add to pending events
				const pendingKey = outcome.stream;
				if (!this.pendingEvents.has(pendingKey)) {
					this.pendingEvents.set(pendingKey, []);
				}

				const pending: PendingEvent = {
					triggerStream: event.stream,
					triggerEvent: event,
					triggerTime: eventTime,
					possibleOutcomes: [{
						stream: outcome.stream,
						probability: 1.0,
						delay: outcome.delay
					}],
					resolved: false
				};

				this.pendingEvents.get(pendingKey)!.push(pending);
			}
		}

		// Check for cascading effects
		const cascades = this.findCascadingEffects(event.stream);
		for (const cascade of cascades) {
			// Check condition if present
			if (!this.checkCondition(cascade.condition, event)) {
				continue;
			}

			const delayMs = this.parseDelay(cascade.delay);
			const scheduledTime = new Date(eventTime.getTime() + delayMs);

			// Schedule cascade effect
			this.scheduledCascades.push({
				triggerStream: event.stream,
				triggerEvent: event,
				targetStream: cascade.stream,
				multiplier: cascade.multiplier,
				delay: cascade.delay,
				scheduledTime,
				condition: cascade.condition,
				description: cascade.description
			});
		}

		return additionalEvents;
	}

	/**
	 * Get pending events that should be resolved now
	 */
	getPendingEventsToResolve(now: Date): PendingEvent[] {
		const toResolve: PendingEvent[] = [];

		for (const [stream, pendings] of this.pendingEvents.entries()) {
			for (const pending of pendings) {
				if (pending.resolved) {
					continue;
				}

				// Check if enough time has passed
				const maxDelay = Math.max(
					...pending.possibleOutcomes.map(outcome => this.parseDelay(outcome.delay))
				);
				const timeSinceTrigger = now.getTime() - pending.triggerTime.getTime();

				if (timeSinceTrigger >= maxDelay) {
					toResolve.push(pending);
				}
			}
		}

		return toResolve;
	}

	/**
	 * Resolve a pending event
	 * Returns the resolved event stream name
	 */
	resolvePendingEvent(pending: PendingEvent): string | null {
		if (pending.resolved || pending.possibleOutcomes.length === 0) {
			return null;
		}

		// Select outcome based on probability
		const totalProbability = pending.possibleOutcomes.reduce((sum, outcome) => sum + outcome.probability, 0);
		let random = Math.random() * totalProbability;

		for (const outcome of pending.possibleOutcomes) {
			random -= outcome.probability;
			if (random <= 0) {
				pending.resolved = true;
				return outcome.stream;
			}
		}

		// Fallback to first outcome
		if (pending.possibleOutcomes.length > 0) {
			pending.resolved = true;
			return pending.possibleOutcomes[0].stream;
		}

		return null;
	}

	/**
	 * Get scheduled cascades that should be applied now
	 */
	getScheduledCascades(now: Date): ScheduledCascade[] {
		return this.scheduledCascades.filter(cascade => now >= cascade.scheduledTime);
	}

	/**
	 * Remove resolved cascades
	 */
	removeCascade(cascade: ScheduledCascade): void {
		const index = this.scheduledCascades.indexOf(cascade);
		if (index >= 0) {
			this.scheduledCascades.splice(index, 1);
		}
	}

	/**
	 * Clean up resolved pending events
	 */
	cleanupResolvedEvents(): void {
		for (const [stream, pendings] of this.pendingEvents.entries()) {
			const unresolved = pendings.filter(p => !p.resolved);
			if (unresolved.length === 0) {
				this.pendingEvents.delete(stream);
			} else {
				this.pendingEvents.set(stream, unresolved);
			}
		}
	}

	/**
	 * Check if a stream can be generated (temporal dependencies satisfied)
	 */
	canGenerateStream(stream: string, timestamp: Date): boolean {
		return this.checkTemporalDependencies(stream, timestamp);
	}

	/**
	 * Get cascade multiplier for a stream at a given time
	 */
	getCascadeMultiplier(stream: string, now: Date): number {
		const activeCascades = this.getScheduledCascades(now);
		let multiplier = 1.0;

		for (const cascade of activeCascades) {
			if (cascade.targetStream === stream) {
				multiplier *= cascade.multiplier;
			}
		}

		return multiplier;
	}
}

// Singleton instance
let engineInstance: RelationshipEngine | null = null;

/**
 * Get the singleton RelationshipEngine instance
 */
export function getRelationshipEngine(): RelationshipEngine {
	if (!engineInstance) {
		engineInstance = new RelationshipEngine();
	}
	return engineInstance;
}

