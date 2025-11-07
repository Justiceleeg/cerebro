<!-- Example usage of ECharts wrapper component -->
<script lang="ts">
  import ECharts from './ECharts.svelte';
  import type { EChartsOption } from 'echarts';

  // Example: Time-series chart configuration
  let chartOption: EChartsOption = {
    title: {
      text: 'Stream Data Over Time'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Stream 1', 'Stream 2']
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      name: 'Normalized Value'
    },
    series: [
      {
        name: 'Stream 1',
        type: 'line',
        data: [
          ['2025-01-16T10:00:00Z', 50],
          ['2025-01-16T11:00:00Z', 55],
          ['2025-01-16T12:00:00Z', 60]
        ],
        smooth: true
      },
      {
        name: 'Stream 2',
        type: 'line',
        data: [
          ['2025-01-16T10:00:00Z', 45],
          ['2025-01-16T11:00:00Z', 50],
          ['2025-01-16T12:00:00Z', 55]
        ],
        smooth: true
      }
    ]
  };

  let loading = $state(false);
  let chartRef: { getInstance: () => any; resize: () => void } | null = $state(null);

  // Example: Update chart data reactively
  function updateChartData(newData: any[]) {
    chartOption = {
      ...chartOption,
      series: [
        {
          ...chartOption.series[0],
          data: newData
        }
      ]
    };
  }

  // Example: Access chart instance for advanced operations
  function handleResize() {
    chartRef?.resize();
  }

  // Example: Get chart instance for advanced API calls
  function getChartInstance() {
    return chartRef?.getInstance();
  }
</script>

<div class="chart-container">
  <ECharts
    bind:this={chartRef}
    {option}={chartOption}
    {loading}
    width="100%"
    height="400px"
  />
</div>

<style>
  .chart-container {
    width: 100%;
    height: 400px;
  }
</style>

