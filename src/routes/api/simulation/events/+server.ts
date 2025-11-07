import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { StreamGenerator } from '$lib/streams/stream-generator.js';

/**
 * GET /api/simulation/events
 * Returns a single generated stream event
 */
export const GET: RequestHandler = async () => {
	const generator = new StreamGenerator();
	const event = generator.generateCustomerTutorSearch();

	return json(event);
};

