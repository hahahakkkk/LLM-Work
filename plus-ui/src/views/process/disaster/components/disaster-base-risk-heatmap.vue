<script setup lang="ts">
/**
 * DisasterBaseRiskHeatmap
 * 热力图呈现基地×灾害类型的最新风险等级，用于快速锁定重点区域。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { SEVERITY_META } from '../hooks/useDisasterInsights';
import type { HeatmapDataset, HeatmapCellMeta } from '../hooks/useDisasterInsights';

defineOptions({ name: 'DisasterBaseRiskHeatmap' });

const props = withDefaults(
  defineProps<{
    dataset: HeatmapDataset | null;
    loading?: boolean;
    height?: number;
  }>(),
  {
    dataset: null,
    loading: false,
    height: 320
  }
);

const emit = defineEmits<{
  (event: 'cell-click', meta: HeatmapCellMeta): void;
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const pieces = computed(() =>
  ['extreme', 'severe', 'medium', 'minor', 'safe', 'unknown'].map((key) => {
    const meta = SEVERITY_META[key as keyof typeof SEVERITY_META];
    return { value: meta.value, label: meta.label, color: meta.color };
  })
);

const option = computed<EChartsOption>(() => {
  if (!props.dataset) {
    return { title: { text: '暂无数据', left: 'center', top: 'middle' } };
  }

  const richStyles = Object.entries(SEVERITY_META).reduce<Record<string, { color: string; fontWeight?: number }>>((acc, [key, meta]) => {
    acc[key] = {
      color: meta.color,
      fontWeight: key === 'unknown' ? 500 : 600
    };
    return acc;
  }, {});

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const meta = params.data?.[3] as HeatmapCellMeta | undefined;
        if (!meta) return '';
        const statusText = meta.label || meta.severityLabel;
        const parts = [
          `<div style="font-weight:600;margin-bottom:4px">${meta.baseName} · ${meta.hazardLabel}</div>`,
          `<div>风险状态：<span style="color:${meta.severityColor}">${statusText}</span></div>`
        ];
        if (meta.warningLevel) {
          parts.push(`<div>预警等级：${meta.warningLevel}</div>`);
        }
        if (meta.warningContent && meta.warningContent !== statusText) {
          parts.push(`<div>预警信息：${meta.warningContent}</div>`);
        }
        if (meta.updatedAt) {
          parts.push(`<div>更新时间：${meta.updatedAt}</div>`);
        }
        return parts.join('');
      }
    },
    grid: { top: 40, left: 120, right: 20, bottom: 60 },
    xAxis: {
      type: 'category',
      data: props.dataset.xLabels,
      axisLabel: { color: '#000' },
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: props.dataset.yLabels,
      axisLabel: { color: '#000' },
      splitArea: { show: true }
    },
    visualMap: {
      type: 'piecewise',
      orient: 'horizontal',
      bottom: 10,
      left: 'center',
      pieces: pieces.value,
      itemWidth: 18,
      itemHeight: 10,
      textStyle: { fontSize: 12 }
    },
    series: [
      {
        name: '基地风险矩阵',
        type: 'heatmap',
        data: props.dataset.cells.map((cell) => [cell.x, cell.y, cell.value, cell.meta]),
        label: {
          show: true,
          formatter: (params: any) => {
            const meta = params.data?.[3] as HeatmapCellMeta | undefined;
            if (!meta || !meta.label) return '';
            const key = meta.severity || 'unknown';
            return `{${key}|${meta.label}}`;
          },
          rich: richStyles
        },
        emphasis: { focus: 'series', label: { color: '#000', fontWeight: 'bold' } }
      }
    ]
  };
});

const resize = () => chartInstance?.resize();

const renderChart = () => {
  if (!chartRef.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
    chartInstance.on('click', (params: any) => {
      const meta = params?.data?.[3] as HeatmapCellMeta | undefined;
      if (meta) emit('cell-click', meta);
    });
    window.addEventListener('resize', resize);
  }
  chartInstance.setOption(option.value, true);
};

watch(
  () => props.dataset,
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
  <div class="heatmap-wrapper">
    <div v-if="loading" class="skeleton">
      <el-skeleton animated :rows="8" />
    </div>
    <div v-else ref="chartRef" class="chart" :style="{ height: `${height}px` }" />
  </div>
</template>

<style scoped lang="scss">
.heatmap-wrapper {
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
