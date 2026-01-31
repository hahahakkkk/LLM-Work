<script setup lang="ts">
/**
 * DisasterWarningSeverityPie
 * 环形图展示不同预警等级的数量分布。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import type { SeverityKey } from '../hooks/useDisasterInsights';

defineOptions({ name: 'DisasterWarningSeverityPie' });

interface PieDatum {
  key: SeverityKey;
  label: string;
  value: number;
  color: string;
}

const props = withDefaults(
  defineProps<{
    data: PieDatum[];
    title?: string;
    loading?: boolean;
    height?: number;
    legendMapping?: Record<string, string> | null;
  }>(),
  {
    data: () => [],
    title: '',
    loading: false,
    height: 260,
    legendMapping: null
  }
);

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const totalValue = computed(() => props.data.reduce((sum, item) => sum + item.value, 0));

const legendData = computed(() =>
  props.data.map((item) => ({
    ...item,
    displayLabel: props.legendMapping?.[item.key] ?? item.label
  }))
);

const option = computed<EChartsOption>(() => ({
  title: props.title ? { text: props.title, left: 'center', top: 6, textStyle: { fontSize: 14, fontWeight: 500 } } : undefined,
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => `${params.marker}${params.name}：${params.value} (${params.percent}%)`
  },
  legend: { orient: 'vertical', right: 8, bottom: 8, icon: 'circle' },
  series: [
    {
      name: '预警强度',
      type: 'pie',
      radius: ['35%', '70%'],
      avoidLabelOverlap: true,
      center: ['40%', '52%'],
      label: {
        show: true,
        formatter: (p: any) => (p.value ? `${p.name}\n${p.value} (${p.percent}%)` : ''),
        color: '#303133',
        fontSize: 12,
        lineHeight: 16
      },
      labelLine: { show: true, length: 16, length2: 16 },
      data: legendData.value.map((item) => ({
        value: item.value,
        name: item.displayLabel,
        itemStyle: { color: item.color },
        label: { show: item.value > 0 },
        labelLine: { show: item.value > 0 }
      }))
    }
  ]
}));

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
  () => [props.data, props.legendMapping],
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
  <div class="pie-wrapper">
    <div v-if="loading" class="skeleton">
      <el-skeleton animated :rows="5" />
    </div>
    <template v-else>
      <div ref="chartRef" class="chart" :style="{ height: `${height}px` }" />
      <div class="center-info">
        <div class="value">{{ totalValue }}</div>
        <div class="label">总数</div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.pie-wrapper {
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

  .center-info {
    position: absolute;
    left: 40%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;

    .value {
      font-size: 26px;
      font-weight: 600;
      color: #303133;
      line-height: 1.1;
    }

    .label {
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
