<script lang="ts">
	import { onMount } from 'svelte';
	import type { SimulationState, ScenarioModifier, ExternalEvent } from '$lib/types';

	interface Scenario {
		id: string;
		name: string;
		category: string;
		tags: string[];
		description: string;
		duration: string;
		settlementDuration?: string;
	}

	let state: SimulationState | null = $state(null);
	let scenarios: Scenario[] = $state([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);
	let resetConfirmOpen = $state(false);
	let activatingScenarioId: string | null = $state(null);

	async function fetchState() {
		try {
			const response = await fetch('/api/simulation/state');
			if (!response.ok) throw new Error('Failed to fetch state');
			state = await response.json();
		} catch (err) {
			console.error('Error fetching state:', err);
			error = 'Failed to load simulation state';
		}
	}

	async function fetchScenarios() {
		try {
			const response = await fetch('/api/simulation/scenarios');
			if (!response.ok) throw new Error('Failed to fetch scenarios');
			scenarios = await response.json();
		} catch (err) {
			console.error('Error fetching scenarios:', err);
			error = 'Failed to load scenarios';
		}
	}

	async function activateScenario(scenarioId: string) {
		loading = true;
		activatingScenarioId = scenarioId;
		error = null;
		success = null;

		try {
			const response = await fetch('/api/simulation/scenario', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ scenarioId })
			});

			if (!response.ok) {
				const data = await response.json();
				// Handle conflict errors with more detail
				if (response.status === 409) {
					throw new Error(data.message || data.error || 'Scenario conflict: another scenario is already active');
				}
				throw new Error(data.error || 'Failed to activate scenario');
			}

			success = 'Scenario activated successfully';
			await fetchState();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to activate scenario';
		} finally {
			loading = false;
			activatingScenarioId = null;
		}
	}

	async function resetSimulation() {
		loading = true;
		error = null;
		success = null;
		resetConfirmOpen = false;

		try {
			const response = await fetch('/api/simulation/reset', {
				method: 'POST'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to reset simulation');
			}

			success = 'Simulation reset to baseline';
			await fetchState();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to reset simulation';
		} finally {
			loading = false;
		}
	}

	async function stopScenario() {
		loading = true;
		error = null;
		success = null;

		try {
			const response = await fetch('/api/simulation/stop', {
				method: 'POST'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to stop scenario');
			}

			success = 'Scenario stopped, settling phase started';
			await fetchState();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to stop scenario';
		} finally {
			loading = false;
		}
	}

	function isScenarioActive(scenarioId: string): boolean {
		return state?.activeModifiers.some((m) => m.id === scenarioId && (m.status === 'active' || m.status === 'settling')) ?? false;
	}

	function hasActiveScenario(): boolean {
		return state?.activeModifiers.some((m) => m.status === 'active' || m.status === 'settling') ?? false;
	}

	function getActiveScenario(): ScenarioModifier | null {
		return state?.activeModifiers[0] ?? null;
	}

	onMount(() => {
		fetchState();
		fetchScenarios();
		// Poll for state updates every 2 seconds
		const interval = setInterval(fetchState, 2000);
		return () => clearInterval(interval);
	});
</script>

<div class="container mx-auto p-6 max-w-6xl">
	<h1 class="text-3xl font-bold mb-6">Simulation Admin</h1>

	<!-- Messages -->
	{#if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}

	{#if success}
		<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
			{success}
		</div>
	{/if}

	<!-- Current State -->
	<div class="bg-white rounded-lg shadow p-6 mb-6">
		<h2 class="text-xl font-semibold mb-4">Current Simulation State</h2>

		{#if state}
			<div class="space-y-3">
				<div>
					<strong>Mode:</strong> {state.historicalMode === 'baseline' ? 'Baseline' : 'Modified'}
				</div>
				<div>
					<strong>Baseline State:</strong> {state.baselineState}
				</div>

				{#if state.activeModifiers.length > 0}
					<div class="mt-4">
						<strong>Active Scenario:</strong>
						{#each state.activeModifiers as modifier}
							<div class="ml-4 mt-2 p-3 bg-blue-50 rounded">
								<div><strong>{modifier.id}</strong></div>
								<div class="text-sm text-gray-600">{modifier.description}</div>
								<div class="text-sm mt-1">
									<span class="inline-block px-2 py-1 bg-blue-200 rounded text-xs">
										Status: {modifier.status}
									</span>
									{#if modifier.status === 'settling' && modifier.settlementProgress !== undefined}
										<span class="inline-block px-2 py-1 bg-yellow-200 rounded text-xs ml-2">
											Settlement: {Math.round(modifier.settlementProgress * 100)}%
										</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}

				{#if state.activeEvents.length > 0}
					<div class="mt-4">
						<strong>Active Events:</strong>
						<ul class="ml-4 mt-2 space-y-2">
							{#each state.activeEvents as event}
								<li class="p-2 bg-yellow-50 rounded text-sm">
									<strong>{event.title}</strong> - {event.description}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{:else}
			<div class="text-gray-500">Loading state...</div>
		{/if}
	</div>

	<!-- Control Buttons -->
	<div class="flex gap-4 mb-6">
		<button
			onclick={() => (resetConfirmOpen = true)}
			disabled={loading}
			class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Reset to Baseline
		</button>

		<button
			onclick={stopScenario}
			disabled={loading || !hasActiveScenario()}
			class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Stop Current Scenario
		</button>
	</div>

	<!-- Reset Confirmation Dialog -->
	{#if resetConfirmOpen}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-lg p-6 max-w-md">
				<h3 class="text-lg font-semibold mb-4">Confirm Reset</h3>
				<p class="mb-4">Are you sure you want to reset the simulation to baseline? This will clear all active scenarios and events.</p>
				<div class="flex gap-4">
					<button
						onclick={resetSimulation}
						disabled={loading}
						class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
					>
						Yes, Reset
					</button>
					<button
						onclick={() => (resetConfirmOpen = false)}
						disabled={loading}
						class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Scenarios List -->
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-xl font-semibold mb-4">Available Scenarios</h2>

		{#if scenarios.length === 0}
			<div class="text-gray-500">Loading scenarios...</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each scenarios as scenario}
					<div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
						<h3 class="font-semibold text-lg mb-2">{scenario.name}</h3>
						<p class="text-sm text-gray-600 mb-3">{scenario.description}</p>
						<div class="text-xs text-gray-500 mb-3">
							<div>Duration: {scenario.duration || 'N/A'}</div>
							{#if scenario.settlementDuration}
								<div>Settlement: {scenario.settlementDuration}</div>
							{/if}
						</div>
						<div class="flex flex-wrap gap-1 mb-3">
							{#each scenario.tags as tag}
								<span class="px-2 py-1 bg-gray-100 text-xs rounded">{tag}</span>
							{/each}
						</div>
						<button
							onclick={() => activateScenario(scenario.id)}
							disabled={loading || hasActiveScenario()}
							class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{#if activatingScenarioId === scenario.id}
								Activating...
							{:else if isScenarioActive(scenario.id)}
								Active
							{:else}
								Activate
							{/if}
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		font-family: system-ui, -apple-system, sans-serif;
	}
</style>

