/**
 * Dashboard-specific type definitions
 * Extends core types with dashboard-specific interfaces
 */

// Import types for use in this file
import type {
	StreamEvent,
	ExternalEvent,
	ScenarioModifier,
	StreamBaseline,
	SimulationState,
	StreamModification,
	CascadeRule
} from '$lib/types/core.js';

// Re-export core types from backend
export type {
	StreamEvent,
	ExternalEvent,
	ScenarioModifier,
	StreamBaseline,
	SimulationState,
	StreamModification,
	CascadeRule
} from '$lib/types/core.js';

/**
 * Heatmap cell data structure
 */
export interface HeatmapCell {
	streamName: string;
	normalizedValue: number; // 0-100 scale
	status: 'normal' | 'warning' | 'critical';
	domain: string; // e.g., 'customer', 'tutor', 'session'
}

/**
 * AI-generated recommendation
 */
export interface Recommendation {
	id: string;
	priority: 'high' | 'medium' | 'low';
	title: string;
	description: string;
	actions: RecommendationAction[];
	confidence: number; // 0-1 scale
	status: 'active' | 'resolved' | 'dismissed';
	createdAt: string; // ISO 8601
	resolvedAt?: string; // ISO 8601
	relatedStreams: string[];
	relatedEvents: string[]; // External event IDs
}

/**
 * Recommendation action
 */
export interface RecommendationAction {
	id: string;
	label: string;
	type: 'primary' | 'secondary' | 'danger';
	handler: () => void | Promise<void>;
}

/**
 * Chart series data
 */
export interface ChartSeries {
	streamName: string;
	dataPoints: ChartDataPoint[];
	color: string;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
	timestamp: string; // ISO 8601
	value: number; // Raw value
	normalized: number; // 0-100 scale
}

/**
 * Time range configuration
 */
export interface TimeRange {
	start: string | null; // ISO 8601 timestamp or null
	end: string | null; // ISO 8601 timestamp or null
	preset: '1h' | '6h' | '24h' | '7d' | '30d' | 'custom';
}

/**
 * Filter state
 */
export interface FilterState {
	status: 'all' | 'normal' | 'warning' | 'critical';
	domain: 'all' | string; // 'all' or specific domain
	eventTypes: 'all' | string[]; // 'all' or array of event types
	timeRange: TimeRange;
}

/**
 * WebSocket message types
 */
export type WebSocketMessage =
	| { type: 'subscribe'; topics: string[]; lastTimestamp?: string }
	| { type: 'unsubscribe'; topics: string[] }
	| { type: 'event'; data: StreamEvent }
	| { type: 'batch'; events: StreamEvent[] }
	| { type: 'subscribed'; topics: string[] }
	| { type: 'catchup'; events: StreamEvent[]; catchUpEndTime: string }
	| { type: 'error'; code: string; message: string };

/**
 * Stream name type - union of all stream names
 * Based on the 50 streams defined in baseline-metrics.json
 */
export type StreamName =
	// Customer streams (10)
	| 'customer.signup.started'
	| 'customer.signup.completed'
	| 'customer.login.success'
	| 'customer.login.failure'
	| 'customer.profile.update'
	| 'customer.subscription.plan_changed'
	| 'customer.subscription.payment_success'
	| 'customer.subscription.payment_failure'
	| 'customer.page.view'
	| 'customer.tutor.search'
	// Tutor streams (10)
	| 'tutor.application.received'
	| 'tutor.onboarding.step_completed'
	| 'tutor.onboarding.approved'
	| 'tutor.onboarding.rejected'
	| 'tutor.availability.set'
	| 'tutor.availability.batch_updated'
	| 'tutor.login.event'
	| 'tutor.profile.viewed_by_student'
	| 'tutor.payout.initiated'
	| 'tutor.status.changed'
	// Session streams (12)
	| 'session.booking.requested'
	| 'session.booking.confirmed'
	| 'session.booking.declined_by_tutor'
	| 'session.booking.expired'
	| 'session.started'
	| 'session.completed'
	| 'session.cancelled_by_student'
	| 'session.cancelled_by_tutor'
	| 'session.no_show_by_tutor'
	| 'session.no_show_by_student'
	| 'session.rating.submitted_by_student'
	| 'session.feedback.submitted_by_tutor'
	// Support streams (8)
	| 'support.call.inbound'
	| 'support.call.outbound'
	| 'support.ticket.created'
	| 'support.ticket.updated'
	| 'support.ticket.resolved'
	| 'support.live_chat.started'
	| 'support.live_chat.message'
	| 'support.refund.requested'
	// Marketing streams (5)
	| 'marketing.ad.spend'
	| 'marketing.ad.impression'
	| 'marketing.ad.click'
	| 'marketing.ad.conversion'
	| 'seo.organic.traffic'
	// System streams (5)
	| 'api.request.log'
	| 'system.error.log'
	| 'database.query.performance'
	| 'platform.concurrent.users'
	| 'payment_gateway.transaction.status';

/**
 * Event type - union of external event types
 */
export type EventType =
	| 'marketing'
	| 'product'
	| 'infrastructure'
	| 'academic'
	| 'competitive'
	| 'operational';

/**
 * Priority type - union of priority levels
 */
export type Priority = 'high' | 'medium' | 'low';

