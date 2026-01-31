<template>
  <div class="map-legend" :style="legendStyle">
    <div class="legend-title" v-if="title">{{ title }}</div>
    <div class="legend-items">
      <div v-for="(item, index) in items" :key="index" class="legend-item">
        <div class="legend-symbol" :style="getSymbolStyle(item.style)"></div>
        <div class="legend-label" :style="getLabelStyle(item)">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

// 图例项目类型定义
export interface LegendItem {
  label: string;
  style: Record<string, string>;
  labelColor?: string; // 新增：标签文字颜色
  labelStyle?: Record<string, string>; // 新增：标签样式对象
}

// 组件属性定义
const props = defineProps<{
  // 图例标题
  title?: string;
  // 图例项目数组
  items: LegendItem[];
  // 图例位置（可以是数值或百分比）
  position?: {
    horizontal?: string | number;
    vertical?: string | number;
  };
  // 图例背景色
  backgroundColor?: string;
}>();

// 计算图例样式
const legendStyle = computed(() => {
  const style: Record<string, string> = {
    backgroundColor: props.backgroundColor || 'rgba(255, 255, 255, 0.8)'
  };

  // 设置水平位置
  if (props.position?.horizontal !== undefined) {
    const horizontal = props.position.horizontal;
    if (typeof horizontal === 'number' || /^\d+$/.test(horizontal as string)) {
      style.left = `${horizontal}px`;
    } else {
      style.left = horizontal as string;
    }
  }

  // 设置垂直位置
  if (props.position?.vertical !== undefined) {
    const vertical = props.position.vertical;
    if (typeof vertical === 'number' || /^\d+$/.test(vertical as string)) {
      style.top = `${vertical}px`;
    } else {
      style.top = vertical as string;
    }
  }

  return style;
});

// 获取图例符号样式
const getSymbolStyle = (style: Record<string, string>) => {
  // 默认样式
  const defaultStyle = {
    width: '20px',
    height: '20px',
    backgroundColor: '#3388ff'
  };

  // 合并传入的样式
  return { ...defaultStyle, ...style };
};

// 获取标签样式
const getLabelStyle = (item: LegendItem) => {
  const style: Record<string, string> = {};

  // 设置文字颜色
  if (item.labelColor) {
    style.color = item.labelColor;
  }

  // 合并其他标签样式
  if (item.labelStyle) {
    Object.assign(style, item.labelStyle);
  }

  return style;
};
</script>

<style scoped>
.map-legend {
  position: absolute;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  min-width: 100px;
  z-index: 1000;
}

.legend-title {
  color: #000;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-symbol {
  min-width: 20px;
  min-height: 20px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.legend-label {
  font-size: 12px;
}
</style>
