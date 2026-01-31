<script setup lang="ts">
/**
 * DisasterWarningTypeComparison
 * 对比不同灾害类型的总预警数、高等级预警数以及最近新增情况。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import type { TypeDistributionItem } from '../hooks/useDisasterInsights';

defineOptions({ name: 'DisasterWarningTypeComparison' });

const props = withDefaults(
  defineProps<{
    data: TypeDistributionItem[];
    loading?: boolean;
    height?: number;
  }>(),
  {
    data: () => [],
    loading: false,
    height: 260
  }
);

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const option = computed<EChartsOption>(() => {
  const categories = props.data.map((item) => item.label);
  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, data: ['总预警', '高等级预警', '近7天新增'] },
    grid: { top: 20, left: 60, right: 24, bottom: 60 },
    xAxis: {
      type: 'category',
      data: categories,
      name: '灾害类型',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: '#606266', fontSize: 12 },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      name: '发生次数',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { color: '#606266', fontSize: 12 },
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    series: [
      {
        name: '总预警',
        type: 'bar',
        barWidth: 28,
        //itemStyle: { color: (params: any) => props.data[params.dataIndex].color },
        data: props.data.map((item) => item.total)
      },
      {
        name: '高等级预警',
        type: 'bar',
        barWidth: 18,
        itemStyle: {
          //color: (params: any) => props.data[params.dataIndex].color,
          opacity: 0.55
        },
        data: props.data.map((item) => item.severe)
      },
      {
        name: '近7天新增',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, type: 'dashed', color: '#2F88FF' },
        itemStyle: { color: '#2F88FF' },
        data: props.data.map((item) => item.recent)
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
  () => props.data,
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
  <div class="type-comparison">
    <div v-if="loading" class="skeleton">
      <el-skeleton animated :rows="5" />
    </div>
    <div v-else ref="chartRef" class="chart" :style="{ height: `${height}px` }" />
  </div>
</template>

<style scoped lang="scss">
.type-comparison {
  position: relative;
  width: 100%;
  height: 100%;

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
