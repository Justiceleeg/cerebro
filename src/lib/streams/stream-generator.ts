import type { StreamEvent } from '$lib/types';
import type * as StreamEventTypes from '$lib/types/stream-events';
import baselineMetrics from '$lib/server/config/baseline-metrics.json';
import { normalizeStreamValue, getBaselineStatsForStream } from './normalize.js';
import { getScenarioEngine } from '$lib/scenarios/scenario-engine.js';

/**
 * StreamGenerator class
 * Generates stream events for all 50 stream types using baseline metrics from configuration
 * Applies active scenario modifiers, external event impacts, and temporal patterns
 */
export class StreamGenerator {
	/**
	 * Generate an event for any stream type
	 * @param stream - Stream name (e.g., "customer.tutor.search")
	 * @param timestamp - Optional timestamp (defaults to now)
	 * @returns StreamEvent
	 */
	generateEvent(stream: string, timestamp?: string): StreamEvent {
		const eventTimestamp = timestamp || new Date().toISOString();
		
		// Route to specific generator based on stream name
		const data = this.generateStreamData(stream);
		
		// Get baseline metrics for this stream
		const streamBaseline = baselineMetrics.streamBaselines[stream as keyof typeof baselineMetrics.streamBaselines];
		const eventsPerDay = streamBaseline?.eventsPerDay || 1000;

		// Calculate raw value (events per day as a simple metric)
		// Start with baseline value with some variance
		const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
		let rawValue = eventsPerDay * (1 + variance);

		// Apply time-of-day patterns
		rawValue = this.applyTimeOfDayPattern(rawValue, eventTimestamp);

		// Apply day-of-week patterns
		rawValue = this.applyDayOfWeekPattern(rawValue, eventTimestamp);

		// Apply active scenario modifiers
		const engine = getScenarioEngine();
		const activeModifiers = engine.getActiveModifiers();
		
		for (const modifier of activeModifiers) {
			if (modifier.affectedStreams[stream]) {
				const streamMod = modifier.affectedStreams[stream];
				if (streamMod.multiplier) {
					rawValue = rawValue * streamMod.multiplier;
				}
				if (streamMod.override !== undefined) {
					rawValue = streamMod.override;
				}
			}
		}

		// Apply external event impacts
		const activeEvents = engine.getActiveEvents();
		for (const event of activeEvents) {
			if (event.expectedImpact?.streams?.includes(stream)) {
				const impact = event.expectedImpact;
				if (impact.direction === 'increase') {
					const magnitude = impact.magnitude === 'high' ? 1.5 : impact.magnitude === 'medium' ? 1.25 : 1.1;
					rawValue = rawValue * magnitude;
				} else if (impact.direction === 'decrease') {
					const magnitude = impact.magnitude === 'high' ? 0.5 : impact.magnitude === 'medium' ? 0.75 : 0.9;
					rawValue = rawValue * magnitude;
				}
			}
		}

		// Normalize the value
		const baselineStats = getBaselineStatsForStream(stream);
		const { normalizedValue, anomalyFlag } = normalizeStreamValue(rawValue, baselineStats);

		return {
			stream,
			timestamp: eventTimestamp,
			data,
			normalizedValue,
			anomalyFlag
		};
	}

	/**
	 * Generate stream-specific data based on stream name
	 */
	private generateStreamData(stream: string): Record<string, any> {
		// Customer streams
		if (stream === 'customer.signup.started') {
			return this.generateCustomerSignupStarted();
		} else if (stream === 'customer.signup.completed') {
			return this.generateCustomerSignupCompleted();
		} else if (stream === 'customer.login.success') {
			return this.generateCustomerLoginSuccess();
		} else if (stream === 'customer.login.failure') {
			return this.generateCustomerLoginFailure();
		} else if (stream === 'customer.profile.update') {
			return this.generateCustomerProfileUpdate();
		} else if (stream === 'customer.subscription.plan_changed') {
			return this.generateCustomerSubscriptionPlanChanged();
		} else if (stream === 'customer.subscription.payment_success') {
			return this.generateCustomerSubscriptionPaymentSuccess();
		} else if (stream === 'customer.subscription.payment_failure') {
			return this.generateCustomerSubscriptionPaymentFailure();
		} else if (stream === 'customer.page.view') {
			return this.generateCustomerPageView();
		} else if (stream === 'customer.tutor.search') {
			return this.generateCustomerTutorSearchData();
		}
		// Tutor streams
		else if (stream === 'tutor.application.received') {
			return this.generateTutorApplicationReceived();
		} else if (stream === 'tutor.onboarding.step_completed') {
			return this.generateTutorOnboardingStepCompleted();
		} else if (stream === 'tutor.onboarding.approved') {
			return this.generateTutorOnboardingApproved();
		} else if (stream === 'tutor.onboarding.rejected') {
			return this.generateTutorOnboardingRejected();
		} else if (stream === 'tutor.availability.set') {
			return this.generateTutorAvailabilitySet();
		} else if (stream === 'tutor.availability.batch_updated') {
			return this.generateTutorAvailabilityBatchUpdated();
		} else if (stream === 'tutor.login.event') {
			return this.generateTutorLoginEvent();
		} else if (stream === 'tutor.profile.viewed_by_student') {
			return this.generateTutorProfileViewedByStudent();
		} else if (stream === 'tutor.payout.initiated') {
			return this.generateTutorPayoutInitiated();
		} else if (stream === 'tutor.status.changed') {
			return this.generateTutorStatusChanged();
		}
		// Session streams
		else if (stream === 'session.booking.requested') {
			return this.generateSessionBookingRequested();
		} else if (stream === 'session.booking.confirmed') {
			return this.generateSessionBookingConfirmed();
		} else if (stream === 'session.booking.declined_by_tutor') {
			return this.generateSessionBookingDeclinedByTutor();
		} else if (stream === 'session.booking.expired') {
			return this.generateSessionBookingExpired();
		} else if (stream === 'session.cancellation.by_student') {
			return this.generateSessionCancellationByStudent();
		} else if (stream === 'session.cancellation.by_tutor') {
			return this.generateSessionCancellationByTutor();
		} else if (stream === 'session.started') {
			return this.generateSessionStarted();
		} else if (stream === 'session.completed') {
			return this.generateSessionCompleted();
		} else if (stream === 'session.no_show.student') {
			return this.generateSessionNoShowStudent();
		} else if (stream === 'session.no_show.tutor') {
			return this.generateSessionNoShowTutor();
		} else if (stream === 'session.rating.submitted_by_student') {
			return this.generateSessionRatingSubmittedByStudent();
		} else if (stream === 'session.feedback.submitted_by_tutor') {
			return this.generateSessionFeedbackSubmittedByTutor();
		}
		// Support streams
		else if (stream === 'support.call.inbound') {
			return this.generateSupportCallInbound();
		} else if (stream === 'support.call.outbound') {
			return this.generateSupportCallOutbound();
		} else if (stream === 'support.ticket.created') {
			return this.generateSupportTicketCreated();
		} else if (stream === 'support.ticket.updated') {
			return this.generateSupportTicketUpdated();
		} else if (stream === 'support.ticket.resolved') {
			return this.generateSupportTicketResolved();
		} else if (stream === 'support.live_chat.started') {
			return this.generateSupportLiveChatStarted();
		} else if (stream === 'support.live_chat.message') {
			return this.generateSupportLiveChatMessage();
		} else if (stream === 'support.refund.requested') {
			return this.generateSupportRefundRequested();
		}
		// Marketing streams
		else if (stream === 'marketing.ad.spend') {
			return this.generateMarketingAdSpend();
		} else if (stream === 'marketing.ad.impression') {
			return this.generateMarketingAdImpression();
		} else if (stream === 'marketing.ad.click') {
			return this.generateMarketingAdClick();
		} else if (stream === 'marketing.ad.conversion') {
			return this.generateMarketingAdConversion();
		} else if (stream === 'seo.organic.traffic') {
			return this.generateSeoOrganicTraffic();
		}
		// System streams
		else if (stream === 'api.request.log') {
			return this.generateApiRequestLog();
		} else if (stream === 'system.error.log') {
			return this.generateSystemErrorLog();
		} else if (stream === 'database.query.performance') {
			return this.generateDatabaseQueryPerformance();
		} else if (stream === 'platform.concurrent.users') {
			return this.generatePlatformConcurrentUsers();
		} else if (stream === 'payment_gateway.transaction.status') {
			return this.generatePaymentGatewayTransactionStatus();
		}

		// Fallback for unknown streams
		return { error: `Unknown stream: ${stream}` };
	}

	/**
	 * Apply time-of-day patterns (peak 8am-10pm, low 11pm-7am)
	 */
	private applyTimeOfDayPattern(rawValue: number, timestamp: string): number {
		const date = new Date(timestamp);
		const hour = date.getHours();
		
		// Peak hours: 8am-10pm (8-22)
		if (hour >= 8 && hour < 22) {
			return rawValue * 1.5;
		}
		// Off hours: 11pm-7am (23, 0-7)
		if (hour >= 23 || hour < 7) {
			return rawValue * 0.2;
		}
		
		return rawValue;
	}

	/**
	 * Apply day-of-week patterns (weekend ~35% more)
	 */
	private applyDayOfWeekPattern(rawValue: number, timestamp: string): number {
		const date = new Date(timestamp);
		const dayOfWeek = date.getDay();
		
		// Weekend (Saturday=6, Sunday=0)
		if (dayOfWeek === 0 || dayOfWeek === 6) {
			return rawValue * 1.35;
		}
		
		return rawValue;
	}

	// ============================================================================
	// Customer Stream Generators
	// ============================================================================

	private generateCustomerSignupStarted(): StreamEventTypes.CustomerSignupStartedData {
		return {
			temp_user_id: `temp_${Math.random().toString(36).substring(2, 11)}`,
			source: this.getRandomItem(['google', 'facebook', 'direct', 'referral', 'organic']),
			medium: this.getRandomItem(['cpc', 'organic', 'email', 'social', 'referral']),
			campaign: `campaign_${Math.random().toString(36).substring(2, 8)}`
		};
	}

	private generateCustomerSignupCompleted(): StreamEventTypes.CustomerSignupCompletedData {
		return {
			user_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			registration_source: this.getRandomItem(['web', 'mobile_ios', 'mobile_android']),
			device_type: this.getRandomItem(['desktop', 'mobile', 'tablet']),
			cohort_id: this.getRandomItem(['2024_q1', '2024_q2', '2024_q3', '2024_q4', '2025_q1'])
		};
	}

	private generateCustomerLoginSuccess(): StreamEventTypes.CustomerLoginSuccessData {
		return {
			user_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			ip_address: this.generateRandomIP(),
			device_type: this.getRandomItem(['desktop', 'mobile', 'tablet'])
		};
	}

	private generateCustomerLoginFailure(): StreamEventTypes.CustomerLoginFailureData {
		return {
			username_or_email: `user${Math.floor(Math.random() * 10000)}@example.com`,
			ip_address: this.generateRandomIP(),
			reason: this.getRandomItem(['wrong_password', 'account_not_found', 'account_locked'])
		};
	}

	private generateCustomerProfileUpdate(): StreamEventTypes.CustomerProfileUpdateData {
		return {
			user_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			updated_fields: this.getRandomItems(['subjects', 'education_level', 'goals', 'availability', 'preferences'], 1, 3)
		};
	}

	private generateCustomerSubscriptionPlanChanged(): StreamEventTypes.CustomerSubscriptionPlanChangedData {
		const plans = ['basic_monthly', 'premium_monthly', 'basic_yearly', 'premium_yearly'];
		const oldPlan = this.getRandomItem(plans);
		const newPlan = this.getRandomItem(plans.filter(p => p !== oldPlan));
		return {
			user_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			old_plan_id: oldPlan,
			new_plan_id: newPlan,
			event_type: this.getRandomItem(['upgrade', 'downgrade', 'lateral'])
		};
	}

	private generateCustomerSubscriptionPaymentSuccess(): StreamEventTypes.CustomerSubscriptionPaymentSuccessData {
		const amounts = [29.99, 49.99, 79.99, 99.99, 199.99];
		const plans = ['basic_monthly', 'premium_monthly', 'basic_yearly', 'premium_yearly'];
		const nextBilling = new Date();
		nextBilling.setMonth(nextBilling.getMonth() + 1);
		return {
			user_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			amount: this.getRandomItem(amounts),
			plan_id: this.getRandomItem(plans),
			next_billing_date: nextBilling.toISOString().split('T')[0]
		};
	}

	private generateCustomerSubscriptionPaymentFailure(): StreamEventTypes.CustomerSubscriptionPaymentFailureData {
		return {
			user_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			amount: this.getRandomItem([29.99, 49.99, 79.99, 99.99]),
			failure_reason_code: this.getRandomItem(['insufficient_funds', 'expired_card', 'declined', 'card_not_found'])
		};
	}

	private generateCustomerPageView(): StreamEventTypes.CustomerPageViewData {
		const pages = ['/tutors/search', '/dashboard', '/profile', '/sessions', '/settings', '/help'];
		return {
			user_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			page_url: this.getRandomItem(pages),
			duration_seconds: Math.floor(Math.random() * 300) + 10 // 10-310 seconds
		};
	}

	private generateCustomerTutorSearchData(): StreamEventTypes.CustomerTutorSearchData {
		return {
			user_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			subject: this.getRandomSubject(),
			availability_start: this.getRandomAvailabilityStart(),
			availability_end: this.getRandomAvailabilityEnd(),
			keywords: this.getRandomKeywords()
		};
	}

	// ============================================================================
	// Tutor Stream Generators
	// ============================================================================

	private generateTutorApplicationReceived(): StreamEventTypes.TutorApplicationReceivedData {
		return {
			applicant_id: `applicant_${Math.random().toString(36).substring(2, 11)}`,
			subject: this.getRandomSubject(),
			region: this.getRandomItem(['northeast_us', 'southeast_us', 'midwest_us', 'west_us', 'international']),
			source_campaign_id: `linkedin_${new Date().getFullYear()}_${Math.floor(Math.random() * 12) + 1}`
		};
	}

	private generateTutorOnboardingStepCompleted(): StreamEventTypes.TutorOnboardingStepCompletedData {
		return {
			applicant_id: `applicant_${Math.random().toString(36).substring(2, 11)}`,
			step_name: this.getRandomItem(['application_review', 'background_check', 'demo_session', 'training', 'certification']),
			status: this.getRandomItem(['pending', 'completed', 'failed'])
		};
	}

	private generateTutorOnboardingApproved(): StreamEventTypes.TutorOnboardingApprovedData {
		return {
			applicant_id: `applicant_${Math.random().toString(36).substring(2, 11)}`,
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			approved_by_operator_id: `operator_${Math.floor(Math.random() * 100)}`
		};
	}

	private generateTutorOnboardingRejected(): StreamEventTypes.TutorOnboardingRejectedData {
		return {
			applicant_id: `applicant_${Math.random().toString(36).substring(2, 11)}`,
			rejection_reason: this.getRandomItem(['failed_background_check', 'insufficient_qualifications', 'failed_demo', 'application_incomplete'])
		};
	}

	private generateTutorAvailabilitySet(): StreamEventTypes.TutorAvailabilitySetData {
		const start = this.getRandomAvailabilityStart();
		const endDate = new Date(start);
		endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 3) + 1);
		return {
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			block_start: start,
			block_end: endDate.toISOString(),
			status: this.getRandomItem(['available', 'booked', 'unavailable'])
		};
	}

	private generateTutorAvailabilityBatchUpdated(): StreamEventTypes.TutorAvailabilityBatchUpdatedData {
		const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
		const template: Record<string, Array<{ start: string; end: string }>> = {};
		for (const day of days.slice(0, 5)) { // Monday-Friday
			template[day] = [{ start: '14:00', end: '18:00' }];
		}
		return {
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			template
		};
	}

	private generateTutorLoginEvent(): StreamEventTypes.TutorLoginEventData {
		return {
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			device_type: this.getRandomItem(['desktop', 'mobile', 'tablet'])
		};
	}

	private generateTutorProfileViewedByStudent(): StreamEventTypes.TutorProfileViewedByStudentData {
		return {
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			viewing_student_id: `student_${Math.random().toString(36).substring(2, 11)}`
		};
	}

	private generateTutorPayoutInitiated(): StreamEventTypes.TutorPayoutInitiatedData {
		return {
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			amount_usd: Math.floor(Math.random() * 1000) + 100, // $100-$1100
			session_count: Math.floor(Math.random() * 20) + 5, // 5-25 sessions
			payout_method: this.getRandomItem(['bank_transfer', 'paypal', 'stripe'])
		};
	}

	private generateTutorStatusChanged(): StreamEventTypes.TutorStatusChangedData {
		const statuses = ['active', 'paused', 'inactive', 'on_vacation'];
		const oldStatus = this.getRandomItem(statuses);
		const newStatus = this.getRandomItem(statuses.filter(s => s !== oldStatus));
		return {
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			old_status: oldStatus,
			new_status: newStatus
		};
	}

	// ============================================================================
	// Session Stream Generators
	// ============================================================================

	private generateSessionBookingRequested(): StreamEventTypes.SessionBookingRequestedData {
		const requestedTime = new Date();
		requestedTime.setDate(requestedTime.getDate() + Math.floor(Math.random() * 7) + 1);
		requestedTime.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 4) * 15, 0, 0);
		return {
			request_id: `req_${Math.random().toString(36).substring(2, 11)}`,
			student_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			subject: this.getRandomSubject(),
			requested_time: requestedTime.toISOString()
		};
	}

	private generateSessionBookingConfirmed(): StreamEventTypes.SessionBookingConfirmedData {
		return {
			session_id: `session_${Math.random().toString(36).substring(2, 11)}`,
			request_id: `req_${Math.random().toString(36).substring(2, 11)}`,
			student_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			scheduled_time: this.getRandomAvailabilityStart()
		};
	}

	private generateSessionBookingDeclinedByTutor(): StreamEventTypes.SessionBookingDeclinedByTutorData {
		return {
			request_id: `req_${Math.random().toString(36).substring(2, 11)}`,
			student_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			reason: this.getRandomItem(['scheduling_conflict', 'subject_mismatch', 'unavailable', 'overbooked'])
		};
	}

	private generateSessionBookingExpired(): StreamEventTypes.SessionBookingExpiredData {
		return {
			request_id: `req_${Math.random().toString(36).substring(2, 11)}`,
			student_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			subject: this.getRandomSubject()
		};
	}

	private generateSessionCancellationByStudent(): StreamEventTypes.SessionCancellationByStudentData {
		return {
			session_id: `session_${Math.random().toString(36).substring(2, 11)}`,
			student_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			reason_code: this.getRandomItem(['schedule_conflict', 'found_other_tutor', 'no_longer_needed', 'emergency']),
			cancellation_fee_charged: Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 20) + 5 // $5-$25 or $0
		};
	}

	private generateSessionCancellationByTutor(): StreamEventTypes.SessionCancellationByTutorData {
		return {
			session_id: `session_${Math.random().toString(36).substring(2, 11)}`,
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			reason_code: this.getRandomItem(['emergency', 'illness', 'technical_issue', 'personal'])
		};
	}

	private generateSessionStarted(): StreamEventTypes.SessionStartedData {
		const now = new Date();
		const studentJoin = new Date(now.getTime() - Math.floor(Math.random() * 5) * 60000); // 0-5 min before
		const tutorJoin = new Date(now.getTime() - Math.floor(Math.random() * 3) * 60000); // 0-3 min before
		return {
			session_id: `session_${Math.random().toString(36).substring(2, 11)}`,
			student_join_time: studentJoin.toISOString(),
			tutor_join_time: tutorJoin.toISOString()
		};
	}

	private generateSessionCompleted(): StreamEventTypes.SessionCompletedData {
		return {
			session_id: `session_${Math.random().toString(36).substring(2, 11)}`,
			student_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			duration_minutes: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
			subject: this.getRandomSubject()
		};
	}

	private generateSessionNoShowStudent(): StreamEventTypes.SessionNoShowStudentData {
		const scheduledTime = new Date();
		scheduledTime.setHours(scheduledTime.getHours() - 1);
		return {
			session_id: `session_${Math.random().toString(36).substring(2, 11)}`,
			student_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			scheduled_time: scheduledTime.toISOString()
		};
	}

	private generateSessionNoShowTutor(): StreamEventTypes.SessionNoShowTutorData {
		const scheduledTime = new Date();
		scheduledTime.setHours(scheduledTime.getHours() - 1);
		return {
			session_id: `session_${Math.random().toString(36).substring(2, 11)}`,
			student_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			scheduled_time: scheduledTime.toISOString()
		};
	}

	private generateSessionRatingSubmittedByStudent(): StreamEventTypes.SessionRatingSubmittedByStudentData {
		return {
			session_id: `session_${Math.random().toString(36).substring(2, 11)}`,
			student_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			rating_score: Math.floor(Math.random() * 5) + 1, // 1-5
			comment: Math.random() > 0.5 ? `Great session! Really helped me understand ${this.getRandomSubject()}.` : undefined
		};
	}

	private generateSessionFeedbackSubmittedByTutor(): StreamEventTypes.SessionFeedbackSubmittedByTutorData {
		return {
			session_id: `session_${Math.random().toString(36).substring(2, 11)}`,
			tutor_id: `tutor_${Math.random().toString(36).substring(2, 11)}`,
			student_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			notes: `Student needs help with ${this.getRandomSubject()} concepts.`,
			student_progress: this.getRandomItem(['improving', 'struggling', 'advanced', 'on_track'])
		};
	}

	// ============================================================================
	// Support Stream Generators
	// ============================================================================

	private generateSupportCallInbound(): StreamEventTypes.SupportCallInboundData {
		return {
			call_id: `call_${Math.random().toString(36).substring(2, 11)}`,
			customer_id: Math.random() > 0.2 ? `student_${Math.random().toString(36).substring(2, 11)}` : undefined,
			phone_number: this.generateRandomPhone(),
			queue: this.getRandomItem(['billing', 'technical', 'general', 'booking'])
		};
	}

	private generateSupportCallOutbound(): StreamEventTypes.SupportCallOutboundData {
		return {
			call_id: `call_${Math.random().toString(36).substring(2, 11)}`,
			customer_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			operator_id: `operator_${Math.floor(Math.random() * 100)}`,
			reason: this.getRandomItem(['churn_followup', 'payment_retry', 'satisfaction_check', 'technical_issue'])
		};
	}

	private generateSupportTicketCreated(): StreamEventTypes.SupportTicketCreatedData {
		return {
			ticket_id: `ticket_${Math.random().toString(36).substring(2, 11)}`,
			customer_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			category: this.getRandomItem(['technical_issue', 'billing', 'booking_problem', 'quality_complaint']),
			priority: this.getRandomItem(['low', 'medium', 'high', 'urgent'])
		};
	}

	private generateSupportTicketUpdated(): StreamEventTypes.SupportTicketUpdatedData {
		return {
			ticket_id: `ticket_${Math.random().toString(36).substring(2, 11)}`,
			update_type: this.getRandomItem(['agent_reply', 'status_change', 'customer_reply', 'escalation']),
			agent_id: Math.random() > 0.3 ? `agent_${Math.floor(Math.random() * 50)}` : undefined
		};
	}

	private generateSupportTicketResolved(): StreamEventTypes.SupportTicketResolvedData {
		return {
			ticket_id: `ticket_${Math.random().toString(36).substring(2, 11)}`,
			agent_id: `agent_${Math.floor(Math.random() * 50)}`,
			resolution_time_hours: Math.floor(Math.random() * 24) + 1 // 1-24 hours
		};
	}

	private generateSupportLiveChatStarted(): StreamEventTypes.SupportLiveChatStartedData {
		return {
			chat_id: `chat_${Math.random().toString(36).substring(2, 11)}`,
			customer_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			initial_query: this.getRandomItem(['Can\'t find available tutors', 'Payment issue', 'Session problem', 'Account question']),
			wait_time_seconds: Math.floor(Math.random() * 120) + 10 // 10-130 seconds
		};
	}

	private generateSupportLiveChatMessage(): StreamEventTypes.SupportLiveChatMessageData {
		return {
			chat_id: `chat_${Math.random().toString(36).substring(2, 11)}`,
			sender_type: this.getRandomItem(['customer', 'agent', 'bot']),
			message_length: Math.floor(Math.random() * 200) + 10 // 10-210 characters
		};
	}

	private generateSupportRefundRequested(): StreamEventTypes.SupportRefundRequestedData {
		return {
			refund_request_id: `refund_${Math.random().toString(36).substring(2, 11)}`,
			customer_id: `student_${Math.random().toString(36).substring(2, 11)}`,
			session_id: Math.random() > 0.3 ? `session_${Math.random().toString(36).substring(2, 11)}` : undefined,
			amount: Math.floor(Math.random() * 100) + 20, // $20-$120
			reason: this.getRandomItem(['tutor_no_show', 'quality_issue', 'technical_problem', 'billing_error'])
		};
	}

	// ============================================================================
	// Marketing Stream Generators
	// ============================================================================

	private generateMarketingAdSpend(): StreamEventTypes.MarketingAdSpendData {
		return {
			campaign_id: `linkedin_${new Date().getFullYear()}_${Math.floor(Math.random() * 12) + 1}`,
			platform: this.getRandomItem(['linkedin', 'google_ads', 'facebook', 'indeed']),
			spend_usd: Math.floor(Math.random() * 500) + 50 // $50-$550
		};
	}

	private generateMarketingAdImpression(): StreamEventTypes.MarketingAdImpressionData {
		return {
			campaign_id: `linkedin_${new Date().getFullYear()}_${Math.floor(Math.random() * 12) + 1}`,
			platform: this.getRandomItem(['linkedin', 'google_ads', 'facebook', 'indeed']),
			ad_group_id: `${this.getRandomSubject()}_tutors_${this.getRandomItem(['northeast', 'southeast', 'midwest', 'west'])}`
		};
	}

	private generateMarketingAdClick(): StreamEventTypes.MarketingAdClickData {
		return {
			campaign_id: `linkedin_${new Date().getFullYear()}_${Math.floor(Math.random() * 12) + 1}`,
			platform: this.getRandomItem(['linkedin', 'google_ads', 'facebook', 'indeed']),
			cost_per_click: Math.floor(Math.random() * 5) + 1 // $1-$6
		};
	}

	private generateMarketingAdConversion(): StreamEventTypes.MarketingAdConversionData {
		return {
			campaign_id: `linkedin_${new Date().getFullYear()}_${Math.floor(Math.random() * 12) + 1}`,
			click_id: `click_${Math.random().toString(36).substring(2, 11)}`,
			conversion_type: this.getRandomItem(['application_start', 'application_complete'])
		};
	}

	private generateSeoOrganicTraffic(): StreamEventTypes.SeoOrganicTrafficData {
		return {
			landing_page_url: '/become-a-tutor',
			search_engine: this.getRandomItem(['google', 'bing', 'duckduckgo']),
			keyword: Math.random() > 0.5 ? this.getRandomItem(['online tutoring jobs', 'tutor application', 'teach online']) : undefined
		};
	}

	// ============================================================================
	// System Stream Generators
	// ============================================================================

	private generateApiRequestLog(): StreamEventTypes.ApiRequestLogData {
		const endpoints = ['/v1/book_session', '/v1/search_tutors', '/v1/get_sessions', '/v1/update_profile', '/v1/login'];
		return {
			endpoint: this.getRandomItem(endpoints),
			status_code: Math.random() > 0.05 ? (Math.random() > 0.8 ? 201 : 200) : (Math.random() > 0.5 ? 400 : 500),
			latency_ms: Math.floor(Math.random() * 500) + 50, // 50-550ms
			user_id: Math.random() > 0.3 ? `student_${Math.random().toString(36).substring(2, 11)}` : undefined
		};
	}

	private generateSystemErrorLog(): StreamEventTypes.SystemErrorLogData {
		return {
			service_name: this.getRandomItem(['payment_processor', 'booking_service', 'auth_service', 'notification_service']),
			error_message: this.getRandomItem([
				'Connection timeout to payment gateway',
				'Database connection pool exhausted',
				'Rate limit exceeded',
				'Invalid session token'
			]),
			severity: this.getRandomItem(['info', 'warning', 'error', 'critical'])
		};
	}

	private generateDatabaseQueryPerformance(): StreamEventTypes.DatabaseQueryPerformanceData {
		return {
			db_host: `primary-db-${Math.floor(Math.random() * 3) + 1}`,
			query_hash: Math.random().toString(36).substring(2, 14),
			duration_ms: Math.floor(Math.random() * 5000) + 1000, // 1000-6000ms (slow queries)
			query_text: 'SELECT * FROM sessions WHERE...'
		};
	}

	private generatePlatformConcurrentUsers(): StreamEventTypes.PlatformConcurrentUsersData {
		return {
			active_student_count: Math.floor(Math.random() * 2000) + 500, // 500-2500
			active_tutor_count: Math.floor(Math.random() * 500) + 100 // 100-600
		};
	}

	private generatePaymentGatewayTransactionStatus(): StreamEventTypes.PaymentGatewayTransactionStatusData {
		return {
			transaction_id: `txn_${Math.random().toString(36).substring(2, 11)}`,
			gateway: this.getRandomItem(['stripe', 'paypal', 'braintree']),
			status: Math.random() > 0.05 ? 'success' : (Math.random() > 0.5 ? 'failed' : 'pending'),
			amount: Math.floor(Math.random() * 200) + 20 // $20-$220
		};
	}

	// ============================================================================
	// Helper Methods
	// ============================================================================

	private getRandomSubject(): string {
		const subjects = ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology', 'Calculus', 'Algebra'];
		return subjects[Math.floor(Math.random() * subjects.length)];
	}

	private getRandomAvailabilityStart(): string {
		const now = new Date();
		const hours = Math.floor(Math.random() * 12) + 8; // 8am to 8pm
		const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
		now.setHours(hours, minutes, 0, 0);
		return now.toISOString();
	}

	private getRandomAvailabilityEnd(): string {
		const start = new Date(this.getRandomAvailabilityStart());
		start.setHours(start.getHours() + Math.floor(Math.random() * 3) + 1); // 1-3 hours later
		return start.toISOString();
	}

	private getRandomKeywords(): string[] {
		const allKeywords = ['experienced', 'certified', 'native speaker', 'online', 'in-person', 'group', 'one-on-one'];
		const count = Math.floor(Math.random() * 3) + 1; // 1-3 keywords
		const shuffled = [...allKeywords].sort(() => 0.5 - Math.random());
		return shuffled.slice(0, count);
	}

	private getRandomItem<T>(items: T[]): T {
		return items[Math.floor(Math.random() * items.length)];
	}

	private getRandomItems<T>(items: T[], min: number, max: number): T[] {
		const count = Math.floor(Math.random() * (max - min + 1)) + min;
		const shuffled = [...items].sort(() => 0.5 - Math.random());
		return shuffled.slice(0, count);
	}

	private generateRandomIP(): string {
		return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
	}

	private generateRandomPhone(): string {
		return `+1-555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
	}

	/**
	 * Legacy method for backward compatibility
	 * @deprecated Use generateEvent('customer.tutor.search') instead
	 */
	generateCustomerTutorSearch(): StreamEvent {
		return this.generateEvent('customer.tutor.search');
	}
}

