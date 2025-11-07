/**
 * TypeScript interfaces for all 50 stream event types
 * Reference: docs/STREAM_DEFINITIONS.md
 */

// ============================================================================
// Customer (Student) Streams (10)
// ============================================================================

export interface CustomerSignupStartedData {
	temp_user_id: string;
	source: string;
	medium: string;
	campaign: string;
}

export interface CustomerSignupCompletedData {
	user_id: string;
	registration_source: string;
	device_type: string;
	cohort_id: string;
}

export interface CustomerLoginSuccessData {
	user_id: string;
	ip_address: string;
	device_type: string;
}

export interface CustomerLoginFailureData {
	username_or_email: string;
	ip_address: string;
	reason: string;
}

export interface CustomerProfileUpdateData {
	user_id: string;
	updated_fields: string[];
}

export interface CustomerSubscriptionPlanChangedData {
	user_id: string;
	old_plan_id: string;
	new_plan_id: string;
	event_type: string;
}

export interface CustomerSubscriptionPaymentSuccessData {
	user_id: string;
	amount: number;
	plan_id: string;
	next_billing_date: string;
}

export interface CustomerSubscriptionPaymentFailureData {
	user_id: string;
	amount: number;
	failure_reason_code: string;
}

export interface CustomerPageViewData {
	user_id: string;
	page_url: string;
	duration_seconds: number;
}

export interface CustomerTutorSearchData {
	user_id: string;
	subject: string;
	availability_start: string;
	availability_end: string;
	keywords: string[];
}

// ============================================================================
// Tutor (Supplier) Streams (10)
// ============================================================================

export interface TutorApplicationReceivedData {
	applicant_id: string;
	subject: string;
	region: string;
	source_campaign_id: string;
}

export interface TutorOnboardingStepCompletedData {
	applicant_id: string;
	step_name: string;
	status: string;
}

export interface TutorOnboardingApprovedData {
	applicant_id: string;
	tutor_id: string;
	approved_by_operator_id: string;
}

export interface TutorOnboardingRejectedData {
	applicant_id: string;
	rejection_reason: string;
}

export interface TutorAvailabilitySetData {
	tutor_id: string;
	block_start: string;
	block_end: string;
	status: string;
}

export interface TutorAvailabilityBatchUpdatedData {
	tutor_id: string;
	template: Record<string, Array<{ start: string; end: string }>>;
}

export interface TutorLoginEventData {
	tutor_id: string;
	device_type: string;
}

export interface TutorProfileViewedByStudentData {
	tutor_id: string;
	viewing_student_id: string;
}

export interface TutorPayoutInitiatedData {
	tutor_id: string;
	amount_usd: number;
	session_count: number;
	payout_method: string;
}

export interface TutorStatusChangedData {
	tutor_id: string;
	old_status: string;
	new_status: string;
}

// ============================================================================
// Session (Marketplace Transaction) Streams (12)
// ============================================================================

export interface SessionBookingRequestedData {
	request_id: string;
	student_id: string;
	tutor_id: string;
	subject: string;
	requested_time: string;
}

export interface SessionBookingConfirmedData {
	session_id: string;
	request_id: string;
	student_id: string;
	tutor_id: string;
	scheduled_time: string;
}

export interface SessionBookingDeclinedByTutorData {
	request_id: string;
	student_id: string;
	tutor_id: string;
	reason: string;
}

export interface SessionBookingExpiredData {
	request_id: string;
	student_id: string;
	subject: string;
}

export interface SessionCancellationByStudentData {
	session_id: string;
	student_id: string;
	reason_code: string;
	cancellation_fee_charged: number;
}

export interface SessionCancellationByTutorData {
	session_id: string;
	tutor_id: string;
	reason_code: string;
}

export interface SessionStartedData {
	session_id: string;
	student_join_time: string;
	tutor_join_time: string;
}

export interface SessionCompletedData {
	session_id: string;
	student_id: string;
	tutor_id: string;
	duration_minutes: number;
	subject: string;
}

export interface SessionNoShowStudentData {
	session_id: string;
	student_id: string;
	tutor_id: string;
	scheduled_time: string;
}

export interface SessionNoShowTutorData {
	session_id: string;
	student_id: string;
	tutor_id: string;
	scheduled_time: string;
}

export interface SessionRatingSubmittedByStudentData {
	session_id: string;
	student_id: string;
	tutor_id: string;
	rating_score: number;
	comment?: string;
}

export interface SessionFeedbackSubmittedByTutorData {
	session_id: string;
	tutor_id: string;
	student_id: string;
	notes: string;
	student_progress: string;
}

// ============================================================================
// Support & Operations Streams (8)
// ============================================================================

export interface SupportCallInboundData {
	call_id: string;
	customer_id?: string;
	phone_number: string;
	queue: string;
}

export interface SupportCallOutboundData {
	call_id: string;
	customer_id: string;
	operator_id: string;
	reason: string;
}

export interface SupportTicketCreatedData {
	ticket_id: string;
	customer_id: string;
	category: string;
	priority: string;
}

export interface SupportTicketUpdatedData {
	ticket_id: string;
	update_type: string;
	agent_id?: string;
}

export interface SupportTicketResolvedData {
	ticket_id: string;
	agent_id: string;
	resolution_time_hours: number;
}

export interface SupportLiveChatStartedData {
	chat_id: string;
	customer_id: string;
	initial_query: string;
	wait_time_seconds: number;
}

export interface SupportLiveChatMessageData {
	chat_id: string;
	sender_type: string;
	message_length: number;
}

export interface SupportRefundRequestedData {
	refund_request_id: string;
	customer_id: string;
	session_id?: string;
	amount: number;
	reason: string;
}

// ============================================================================
// Marketing (Tutor Recruiting) Streams (5)
// ============================================================================

export interface MarketingAdSpendData {
	campaign_id: string;
	platform: string;
	spend_usd: number;
}

export interface MarketingAdImpressionData {
	campaign_id: string;
	platform: string;
	ad_group_id: string;
}

export interface MarketingAdClickData {
	campaign_id: string;
	platform: string;
	cost_per_click: number;
}

export interface MarketingAdConversionData {
	campaign_id: string;
	click_id: string;
	conversion_type: string;
}

export interface SeoOrganicTrafficData {
	landing_page_url: string;
	search_engine: string;
	keyword?: string;
}

// ============================================================================
// System & Platform Health Streams (5)
// ============================================================================

export interface ApiRequestLogData {
	endpoint: string;
	status_code: number;
	latency_ms: number;
	user_id?: string;
}

export interface SystemErrorLogData {
	service_name: string;
	error_message: string;
	severity: string;
}

export interface DatabaseQueryPerformanceData {
	db_host: string;
	query_hash: string;
	duration_ms: number;
	query_text: string;
}

export interface PlatformConcurrentUsersData {
	active_student_count: number;
	active_tutor_count: number;
}

export interface PaymentGatewayTransactionStatusData {
	transaction_id: string;
	gateway: string;
	status: string;
	amount: number;
}

// ============================================================================
// Union type for all stream event data
// ============================================================================

export type StreamEventData =
	| CustomerSignupStartedData
	| CustomerSignupCompletedData
	| CustomerLoginSuccessData
	| CustomerLoginFailureData
	| CustomerProfileUpdateData
	| CustomerSubscriptionPlanChangedData
	| CustomerSubscriptionPaymentSuccessData
	| CustomerSubscriptionPaymentFailureData
	| CustomerPageViewData
	| CustomerTutorSearchData
	| TutorApplicationReceivedData
	| TutorOnboardingStepCompletedData
	| TutorOnboardingApprovedData
	| TutorOnboardingRejectedData
	| TutorAvailabilitySetData
	| TutorAvailabilityBatchUpdatedData
	| TutorLoginEventData
	| TutorProfileViewedByStudentData
	| TutorPayoutInitiatedData
	| TutorStatusChangedData
	| SessionBookingRequestedData
	| SessionBookingConfirmedData
	| SessionBookingDeclinedByTutorData
	| SessionBookingExpiredData
	| SessionCancellationByStudentData
	| SessionCancellationByTutorData
	| SessionStartedData
	| SessionCompletedData
	| SessionNoShowStudentData
	| SessionNoShowTutorData
	| SessionRatingSubmittedByStudentData
	| SessionFeedbackSubmittedByTutorData
	| SupportCallInboundData
	| SupportCallOutboundData
	| SupportTicketCreatedData
	| SupportTicketUpdatedData
	| SupportTicketResolvedData
	| SupportLiveChatStartedData
	| SupportLiveChatMessageData
	| SupportRefundRequestedData
	| MarketingAdSpendData
	| MarketingAdImpressionData
	| MarketingAdClickData
	| MarketingAdConversionData
	| SeoOrganicTrafficData
	| ApiRequestLogData
	| SystemErrorLogData
	| DatabaseQueryPerformanceData
	| PlatformConcurrentUsersData
	| PaymentGatewayTransactionStatusData;

