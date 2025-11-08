/**
 * Core data type definitions for the simulator
 */

/**
 * Stream event data structure
 */
export interface StreamEvent {
	stream: string; // e.g., "customer.tutor.search"
	timestamp: string; // ISO 8601
	data: Record<string, any>; // Stream-specific payload
	normalizedValue?: number; // 0-100 scale
	anomalyFlag?: 'normal' | 'warning' | 'critical';
}

/**
 * External marketplace event
 */
export interface ExternalEvent {
	id: string;
	timestamp: string; // ISO 8601
	type: 'marketing' | 'product' | 'infrastructure' | 'academic' | 'competitive' | 'operational';
	title: string;
	description: string;
	severity: 'info' | 'warning' | 'critical';
	expectedImpact: {
		streams: string[];
		direction: 'increase' | 'decrease' | 'mixed';
		magnitude: 'low' | 'medium' | 'high';
		duration: string;
	};
	icon: string;
	externalLink?: string;
	injectedByAI?: boolean;
}

/**
 * Stream modification configuration
 */
export interface StreamModification {
	multiplier?: number;
	additive?: number;
	override?: number;
	probabilityShift?: Record<string, number>;
}

/**
 * Cascade rule for stream relationships
 */
export interface CascadeRule {
	sourceStream: string;
	targetStream: string;
	delay?: string; // e.g., "5 minutes", "1 hour"
	effect: StreamModification;
	condition?: string; // Optional condition for cascade
}

/**
 * Scenario modifier configuration
 */
export interface ScenarioModifier {
	id: string;
	type: string;
	description: string;
	startTime: string; // ISO 8601
	duration?: string;
	affectedStreams: Record<string, StreamModification>;
	cascadeEffects: CascadeRule[];
	relatedEvents: string[];
	status: 'active' | 'settling' | 'settled';
	settlementDuration?: string;
	settlementType?: 'linear' | 'exponential';
	settlementStartTime?: string; // ISO 8601 - when settling phase started
}

/**
 * Stream baseline statistics
 */
export interface StreamBaseline {
	name: string;
	mean: number;
	median: number;
	stdDev: number;
	min: number;
	max: number;
	percentiles: {
		p25: number;
		p50: number;
		p75: number;
		p90: number;
		p95: number;
	};
	patterns: {
		weekdayAvg: number;
		weekendAvg: number;
		trend: string;
		seasonality: string;
	};
}

/**
 * Baseline statistics collection
 */
export interface BaselineStatistics {
	calculatedFrom: string;
	streams: Record<string, StreamBaseline>;
}

/**
 * Simulation state
 */
export interface SimulationState {
	baselineState: 'normal' | 'custom';
	activeModifiers: ScenarioModifier[];
	activeEvents: ExternalEvent[];
	historicalMode: 'baseline' | 'modified';
	currentSimulationTime: string; // ISO 8601
	lastModified: string; // ISO 8601
}

/**
 * Correlation data for a single event-stream pair
 */
export interface CorrelationData {
	eventId: string;
	stream: string;
	strength: number; // -1 to 1 (Pearson correlation coefficient)
	direction: 'positive' | 'negative' | 'none';
	confidence: number; // 0 to 1 (statistical significance)
	sampleSize: number; // Number of data points used
	startTime: string; // ISO 8601
	endTime: string; // ISO 8601
	baselineMean: number; // Mean value before event
	eventMean: number; // Mean value during event
	changeMagnitude: number; // Percentage change
}

