<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';
  import type { EChartsOption, ECharts } from 'echarts';

  interface Props {
    option: EChartsOption;
    theme?: string;
    loading?: boolean;
    width?: string | number;
    height?: string | number;
  }

  let { option, theme, loading = false, width = '100%', height = '100%' }: Props = $props();

  let container: HTMLDivElement;
  let chartInstance: ECharts | null = null;

  onMount(() => {
    if (!container) return;

    // Initialize ECharts instance
    chartInstance = echarts.init(container, theme);

    // Set initial option
    if (option) {
      chartInstance.setOption(option, true);
    }

    // Handle window resize
    const handleResize = () => {
      chartInstance?.resize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on destroy
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  onDestroy(() => {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }
  });

  // Update chart when option changes
  $effect(() => {
    if (chartInstance && option) {
      chartInstance.setOption(option, true);
    }
  });

  // Handle loading state
  $effect(() => {
    if (chartInstance) {
      if (loading) {
        chartInstance.showLoading();
      } else {
        chartInstance.hideLoading();
      }
    }
  });

  // Expose chart instance and methods for external access
  export function getInstance(): ECharts | null {
    return chartInstance;
  }

  export function resize(): void {
    chartInstance?.resize();
  }
</script>

<div bind:this={container} style="width: {width}; height: {height};"></div>

<style>
  div {
    min-height: 200px;
  }
</style>

