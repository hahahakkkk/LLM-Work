<script setup lang="ts">
/**
 * DisasterWarningTimeline
 * 气泡散点图展示预警事件在时间维度与等级维度的分布。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import type { TimelinePoint } from '../hooks/useDisasterInsights';
import { SEVERITY_META } from '../hooks/useDisasterInsights';

defineOptions({ name: 'DisasterWarningTimeline' });

const props = withDefaults(
  defineProps<{
    points: TimelinePoint[];
    height?: number;
    loading?: boolean;
  }>(),
  {
    points: () => [],
    height: 260,
    loading: false
  }
);

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const severityLevels = ['extreme', 'severe', 'medium', 'minor', 'safe'] as const;
const severityLabels = severityLevels.map((key) => SEVERITY_META[key].label);
const severityIndex = (key: string) => {
  const idx = severityLevels.indexOf(key as any);
  return idx === -1 ? severityLevels.length - 1 : idx;
};

const option = computed<EChartsOption>(() => {
  const data = props.points.map((point) => ({
    value: [point.timestamp, severityIndex(point.severity)],
    itemStyle: { color: SEVERITY_META[point.severity].color },
    name: point.regionLabel,
    raw: point
  }));

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const raw: TimelinePoint | undefined = params.data?.raw;
        if (!raw) return '';
        return [
          `<div style="font-weight:600;margin-bottom:4px">${raw.regionLabel}</div>`,
          `<div>${new Date(raw.timestamp).toLocaleString()}</div>`,
          `<div>灾害类型：${raw.hazardLabel}</div>`,
          `<div>预警等级：<span style="color:${raw.severityColor}">${raw.severityLabel}</span></div>`,
          `<div style="margin-top:4px">${raw.content}</div>`
        ].join('');
      }
    },
    grid: { top: 20, left: 60, right: 20, bottom: 30 },
    xAxis: {
      type: 'time',
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: severityLabels,
      inverse: true,
      axisLabel: { color: '#909399' },
      splitLine: { show: false }
    },
    series: [
      {
        name: '预警事件',
        type: 'scatter',
        symbolSize: 14,
        data,
        emphasis: { focus: 'series' }
      }
    ]
  };
});

const resize = () => chartInstance?.resize();

const renderChart = () => {
  if (!chartRef.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
    window.addEventListener('resize', resize);
  }
  chartInstance.setOption(option.value, true);
};

watch(
  () => props.points,
  () => nextTick(renderChart),
  { deep: true }
);

onMounted(() => {
  if (!props.loading) nextTick(renderChart);
});

watch(
  () => props.loading,
  (val) => {
    if (!val) nextTick(renderChart);
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  chartInstance?.dispose();
  chartInstance = null;
});
</script>

<template>
  <div class="timeline-chart">
    <div v-if="loading" class="skeleton">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else ref="chartRef" class="chart" :style="{ height: `${height}px` }" />
  </div>
</template>

<style scoped lang="scss">
.timeline-chart {
  position: relative;
  width: 100%;

  .skeleton {
    position: absolute;
    inset: 0;
    padding: 12px;
    box-sizing: border-box;
  }

  .chart {
    width: 100%;
  }
}
</style>
