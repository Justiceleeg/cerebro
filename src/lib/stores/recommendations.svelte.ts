/**
 * Recommendations store
 * Manages AI-generated recommendations, priority filtering, and action status tracking
 */

import type { Recommendation } from '$lib/types/dashboard.js';

export type RecommendationStatus = 'active' | 'resolved' | 'dismissed';

export interface RecommendationsStore {
	recommendations: Recommendation[];
	filter: {
		priority: 'all' | 'high' | 'medium' | 'low';
		status: 'all' | RecommendationStatus;
	};
}

const initialState: RecommendationsStore = {
	recommendations: [],
	filter: {
		priority: 'all',
		status: 'all'
	}
};

export const recommendationsStore = $state(initialState);

export function addRecommendation(recommendation: Recommendation) {
	recommendationsStore.recommendations = [...recommendationsStore.recommendations, recommendation];
}

export function addRecommendations(recommendations: Recommendation[]) {
	recommendationsStore.recommendations = [...recommendationsStore.recommendations, ...recommendations];
}

export function removeRecommendation(id: string) {
	recommendationsStore.recommendations = recommendationsStore.recommendations.filter(
		(r) => r.id !== id
	);
}

export function updateRecommendation(id: string, updates: Partial<Recommendation>) {
	recommendationsStore.recommendations = recommendationsStore.recommendations.map((r) =>
		r.id === id ? { ...r, ...updates } : r
	);
}

export function setRecommendations(recommendations: Recommendation[]) {
	recommendationsStore.recommendations = recommendations;
}

export function setPriorityFilter(priority: 'all' | 'high' | 'medium' | 'low') {
	recommendationsStore.filter.priority = priority;
}

export function setRecommendationStatusFilter(status: 'all' | RecommendationStatus) {
	recommendationsStore.filter.status = status;
}

export function getFilteredRecommendations(): Recommendation[] {
	let filtered = recommendationsStore.recommendations;

	if (recommendationsStore.filter.priority !== 'all') {
		filtered = filtered.filter((r) => r.priority === recommendationsStore.filter.priority);
	}

	if (recommendationsStore.filter.status !== 'all') {
		filtered = filtered.filter((r) => r.status === recommendationsStore.filter.status);
	}

	return filtered;
}

export function clearAllRecommendations() {
	recommendationsStore.recommendations = [];
}

