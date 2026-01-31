<template>
  <div ref="chartContainer" class="growth-period-pie-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

interface ChartDataItem {
  name: string;
  value: number;
}

const props = defineProps<{
  chartData: ChartDataItem[];
  title?: string;
}>();

const chartContainer = ref<HTMLElement | null>(null);
let pieChart: echarts.ECharts | null = null;

// 为不同状态定义美观的颜色
const statusColors: Record<string, string> = {
  '良好': '#53783a',
  '正常': '#84bc5d',
  '较差': '#c3d48d'
};

const initChart = () => {
  if (chartContainer.value) {
    pieChart = echarts.init(chartContainer.value);
    updateChart();
  }
};

const updateChart = () => {
  if (!pieChart || !props.chartData) return;

  // 计算总值用于百分比计算
  const total = props.chartData.reduce((sum, item) => sum + item.value, 0);

  // 处理数据，添加颜色
  const processedData = props.chartData.map((item) => ({
    ...item,
    itemStyle: {
      color: statusColors[item.name] || '#73c0de'
    }
  }));

  const option: echarts.EChartsOption = {
    title: {
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      show: true,
      orient: 'vertical',
      right: 10,
      top: 'middle',
      itemWidth: 15,
      itemHeight: 15,
      textStyle: {
        fontSize: 15
      },
      formatter: (name) => {
        // 查找对应的数据项
        const item = props.chartData.find((data) => data.name === name);
        if (item) {
          // 图例显示名称和具体数值
          return `${name} ${item.value}`;
        }
        return name;
      }
    },
    series: [
      {
        name: '长势状态',
        type: 'pie',
        radius: ['20%', '90%'],
        center: ['35%', '50%'], // 调整饼图中心位置，为右侧图例留出空间
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true, // 显示标签
          formatter: (params) => {
            // 扇形图上显示百分比
            if (total > 0) {
              const percentage = (((params.value as number) / total) * 100).toFixed(1);
              return `${percentage}%`;
            }
            return params.name;
          },
          fontSize: 12,
          position: 'inside'
        },
        labelLine: {
          show: true // 显示标签线
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: processedData
      }
    ]
  };

  pieChart.setOption(option);
};

onMounted(() => {
  nextTick(() => {
    initChart();
    window.addEventListener('resize', () => {
      if (pieChart) {
        pieChart.resize();
      }
    });
  });
});

watch(
  () => props.chartData,
  () => {
    updateChart();
  },
  { deep: true }
);
</script>

<style scoped>
.growth-period-pie-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
