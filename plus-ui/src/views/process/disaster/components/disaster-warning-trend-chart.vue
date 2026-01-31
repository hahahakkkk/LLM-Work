<script setup lang="ts">
/**
 * DisasterWarningTrendChart
 * 折线展示不同灾害预警在时间维度上的数量变化，支持叠加总计趋势。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import type { TrendSeriesItem } from '../hooks/useDisasterInsights';

defineOptions({ name: 'DisasterWarningTrendChart' });

const props = withDefaults(
  defineProps<{
    categories: string[];
    series: TrendSeriesItem[];
    totalSeries?: TrendSeriesItem | null;
    loading?: boolean;
    height?: number;
  }>(),
  {
    categories: () => [],
    series: () => [],
    totalSeries: null,
    loading: false,
    height: 260
  }
);

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');
  const value =
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((c) => c + c)
          .join('')
      : sanitized;
  const num = parseInt(value, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

const buildOption = computed<EChartsOption>(() => {
  const legendNames: string[] = [];
  const seriesOptions = props.series.map((item) => {
    legendNames.push(item.name);
    return {
      name: item.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      emphasis: { focus: 'series' },
      lineStyle: { width: 2, color: item.color },
      itemStyle: { color: item.color },
      areaStyle: { color: hexToRgba(item.color, 0.18) },
      data: item.data
    };
  });

  if (props.totalSeries) {
    legendNames.push(props.totalSeries.name);
    seriesOptions.push({
      name: props.totalSeries.name,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, type: 'dashed', color: props.totalSeries.color },
      data: props.totalSeries.data,
      emphasis: { focus: 'series' }
    });
  }

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
    legend: { type: 'scroll', bottom: 0, data: legendNames },
    grid: { top: 20, left: 60, right: 24, bottom: 60 },
    xAxis: {
      type: 'category',
      data: props.categories,
      boundaryGap: false,
      name: '日期',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: '#606266', fontSize: 12 },
      axisLabel: { color: '#909399' },
      axisLine: { lineStyle: { color: '#E4E7ED' } }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      name: '指数值',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { color: '#606266', fontSize: 12 },
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { type: 'dashed', color: '#E4E7ED' } }
    },
    series: seriesOptions
  };
});

const resize = () => {
  chartInstance?.resize();
};

const renderChart = () => {
  if (!chartRef.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
    window.addEventListener('resize', resize);
  }
  chartInstance.setOption(buildOption.value, true);
};

watch(
  () => [props.series, props.categories, props.totalSeries],
  () => nextTick(renderChart),
  { deep: true }
);

onMounted(() => {
  if (!props.loading) nextTick(renderChart);
});

watch(
  () => props.loading,
  (newVal) => {
    if (!newVal) nextTick(renderChart);
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  chartInstance?.dispose();
  chartInstance = null;
});
</script>

<template>
  <div class="trend-chart">
    <div v-if="loading" class="chart-skeleton">
      <el-skeleton animated :rows="6" />
    </div>
    <div v-else ref="chartRef" class="chart-body" :style="{ height: `${height}px` }" />
  </div>
</template>

<style scoped lang="scss">
.trend-chart {
  position: relative;
  width: 100%;
  height: 100%;

  .chart-skeleton {
    position: absolute;
    inset: 0;
    padding: 12px;
    box-sizing: border-box;
  }

  .chart-body {
    width: 100%;
  }
}
</style>
