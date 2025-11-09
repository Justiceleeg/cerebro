<script lang="ts">
	// Hardcoded connection status for now
	const connectionStatus = 'Connected';
</script>

<div class="container mx-auto p-6 max-w-7xl">
	<!-- Header -->
	<header class="mb-6">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">Operations Dashboard</h1>
			<div class="flex items-center gap-2">
				<div
					class="h-3 w-3 rounded-full {connectionStatus === 'Connected'
						? 'bg-green-500'
						: 'bg-red-500'}"
				></div>
				<span class="text-sm text-gray-600">{connectionStatus}</span>
			</div>
		</div>
	</header>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left Column: Chart (2/3 width) -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Chart Section -->
			<section class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold mb-4">Time Series Chart</h2>
				<div class="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
					<p>Chart placeholder - will display normalized stream data</p>
				</div>
			</section>

			<!-- Heatmap Section -->
			<section class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold mb-4">Stream Heatmap</h2>
				<div class="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
					<p>Heatmap placeholder - will display 50 streams with normalized values</p>
				</div>
			</section>
		</div>

		<!-- Right Column: Events & Recommendations (1/3 width) -->
		<div class="space-y-6">
			<!-- Events Timeline Section -->
			<section class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold mb-4">External Events</h2>
				<div class="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
					<p>Events timeline placeholder - will display external marketplace events</p>
				</div>
			</section>

			<!-- Recommendations Section -->
			<section class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold mb-4">AI Recommendations</h2>
				<div class="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
					<p>Recommendations placeholder - will display AI-generated insights</p>
				</div>
			</section>
		</div>
	</div>
</div>

<style>
	.container {
		font-family: system-ui, -apple-system, sans-serif;
	}
</style>

