<script lang="ts">
	import ECharts from '$lib/components/ECharts.svelte';
	import type { EChartsOption } from 'echarts';
	import type { ChartDataPoint } from '$lib/types/dashboard.js';

	interface Props {
		streamName: string;
		data: ChartDataPoint[];
		loading?: boolean;
		height?: string | number;
	}

	let { streamName, data, loading = false, height = '400px' }: Props = $props();

	// Build ECharts option from data
	const chartOption = $derived<EChartsOption>({
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross'
			},
			formatter: (params: any) => {
				if (!Array.isArray(params)) return '';
				const point = params[0];
				return `
					<div style="padding: 8px;">
						<div style="font-weight: bold; margin-bottom: 4px;">${point.seriesName}</div>
						<div>Time: ${new Date(point.value[0]).toLocaleString()}</div>
						<div>Normalized: ${point.value[1].toFixed(2)}</div>
					</div>
				`;
			}
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '15%', // Increased to make room for x-axis labels and dataZoom slider
			containLabel: true
		},
		xAxis: {
			type: 'time',
			boundaryGap: [0, 0],
			axisLabel: {
				formatter: (value: number) => {
					const date = new Date(value);
					return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
				}
			}
		},
		yAxis: {
			type: 'value',
			min: 0,
			max: 100,
			name: 'Normalized Value',
			nameLocation: 'middle',
			nameGap: 50,
			axisLabel: {
				formatter: '{value}'
			}
		},
		dataZoom: [
			{
				type: 'inside',
				start: 0,
				end: 100
			},
			{
				type: 'slider',
				start: 0,
				end: 100,
				height: 30,
				bottom: 10, // Position below x-axis labels
				xAxisIndex: 0 // Associate with the x-axis
			}
		],
		series: [
			{
				name: streamName,
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 4,
				data: data.map((point) => [point.timestamp, point.normalized]),
				lineStyle: {
					color: '#3b82f6',
					width: 2
				},
				itemStyle: {
					color: '#3b82f6'
				},
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
							{ offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
						]
					}
				},
				markLine: {
					silent: true,
					lineStyle: {
						color: '#ef4444',
						type: 'dashed',
						width: 2
					},
					label: {
						show: true,
						position: 'end',
						formatter: 'Baseline (50)'
					},
					data: [
						{
							yAxis: 50,
							name: 'Baseline'
						}
					]
				}
			}
		]
	});
</script>

{#if data.length === 0}
	<div class="empty-state">
		<p class="text-gray-400">No data available</p>
	</div>
{:else}
	<ECharts option={chartOption} {loading} width="100%" {height} />
{/if}

<style>
	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 400px;
	}
</style>

