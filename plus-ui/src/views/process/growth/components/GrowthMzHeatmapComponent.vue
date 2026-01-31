<template>
  <div class="mz-heatmap-wrapper">
    <div ref="mapContainer" class="mz-heatmap-container"></div>

    <!-- 面板控制按钮组 (仅在可拖拽模式下显示) -->
    <div v-if="useDraggablePanels" class="panel-toggle-group">
      <button v-if="showControls && !controlsPanel.visible" class="toggle-btn" title="显示控制面板" @click="showPanelById('controls')">🎛️</button>
      <button v-if="showStats && !statsPanel.visible" class="toggle-btn" title="显示统计面板" @click="showPanelById('stats')">📊</button>
    </div>

    <!-- 控制面板插槽 -->
    <div v-if="showControls && !useDraggablePanels" class="heatmap-controls">
      <slot name="controls" :update-config="updateConfig" :toggle-boundary="toggleBoundary">
        <!-- 默认控制面板 -->
        <div class="default-controls">
          <h4>热力图控制</h4>

          <div class="control-group">
            <label>半径: {{ config.radius }}px</label>
            <input
              v-model.number="config.radius"
              type="range"
              :min="mergedControlRanges.radius.min"
              :max="mergedControlRanges.radius.max"
              @input="updateRadius"
            />
          </div>

          <div class="control-group">
            <label>模糊: {{ config.blur }}px</label>
            <input
              v-model.number="config.blur"
              type="range"
              :min="mergedControlRanges.blur.min"
              :max="mergedControlRanges.blur.max"
              @input="updateBlur"
            />
          </div>

          <div class="control-group">
            <label>透明度: {{ (config.opacity * 100).toFixed(0) }}%</label>
            <input
              v-model.number="config.opacity"
              type="range"
              :min="mergedControlRanges.opacity.min"
              :max="mergedControlRanges.opacity.max"
              :step="mergedControlRanges.opacity.step"
              @input="updateOpacity"
            />
          </div>

          <div class="control-group">
            <label>显示边界</label>
            <input v-model="boundaryVisible" type="checkbox" @change="toggleBoundary" />
          </div>
        </div>
      </slot>
    </div>

    <!-- 可拖拽控制面板 -->
    <div
      v-if="showControls && useDraggablePanels && controlsPanel.visible"
      class="draggable-panel"
      :style="{
        left: controlsPanel.x + 'px',
        top: controlsPanel.y + 'px'
      }"
    >
      <div class="panel-header" @mousedown="startDrag($event, 'controls')">
        <span class="panel-title">🎛️ 热力图控制</span>
        <div class="panel-controls">
          <button class="panel-btn collapse-btn" :class="{ collapsed: !controlsPanel.expanded }" @click="togglePanel('controls')">▼</button>
          <button class="panel-btn close-btn" @click="closePanel('controls')">✕</button>
        </div>
      </div>

      <div class="panel-content" :class="{ collapsed: !controlsPanel.expanded }">
        <div class="control-item">
          <label>半径: {{ config.radius }}px</label>
          <input
            v-model.number="config.radius"
            type="range"
            :min="mergedControlRanges.radius.min"
            :max="mergedControlRanges.radius.max"
            @input="updateRadius"
          />
        </div>

        <div class="control-item">
          <label>模糊: {{ config.blur }}px</label>
          <input
            v-model.number="config.blur"
            type="range"
            :min="mergedControlRanges.blur.min"
            :max="mergedControlRanges.blur.max"
            @input="updateBlur"
          />
        </div>

        <div class="control-item">
          <label>透明度: {{ Math.round(config.opacity * 100) }}%</label>
          <input
            v-model.number="config.opacity"
            type="range"
            :min="mergedControlRanges.opacity.min"
            :max="mergedControlRanges.opacity.max"
            :step="mergedControlRanges.opacity.step"
            @input="updateOpacity"
          />
        </div>

        <div class="control-item">
          <label>
            <input v-model="boundaryVisible" type="checkbox" @change="toggleBoundary" />
            显示地块边界
          </label>
        </div>

        <div class="control-item">
          <label>预设配色方案:</label>
          <select v-model="selectedGradient" @change="applyGradient">
            <option value="default">默认 (蓝-红)</option>
            <option value="viridis">翠绿色</option>
            <option value="plasma">Plasma</option>
            <option value="warm">暖色调</option>
            <option value="cool">冷色调</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 统计信息插槽 -->
    <div v-if="showStats && heatData.length > 0 && !useDraggablePanels" class="heatmap-stats">
      <slot name="stats" :stats="statistics">
        <!-- 默认统计信息 -->
        <div class="default-stats">
          <h4>统计信息</h4>
          <div class="stat-item">
            <span>数据点数: {{ statistics.pointCount }}</span>
          </div>
          <div class="stat-item">
            <span>数据范围: {{ statistics.range }}</span>
          </div>
          <div class="stat-item">
            <span>平均值: {{ statistics.average }}{{ dataRange?.unit || '' }}</span>
          </div>
          <div class="stat-item">
            <span>最大值: {{ statistics.max }}{{ dataRange?.unit || '' }}</span>
          </div>
          <div class="stat-item">
            <span>最小值: {{ statistics.min }}{{ dataRange?.unit || '' }}</span>
          </div>
        </div>
      </slot>
    </div>

    <!-- 可拖拽统计面板 -->
    <div
      v-if="showStats && heatData.length > 0 && useDraggablePanels && statsPanel.visible"
      class="draggable-panel"
      :style="{
        left: statsPanel.x + 'px',
        top: statsPanel.y + 'px'
      }"
    >
      <div class="panel-header" @mousedown="startDrag($event, 'stats')">
        <span class="panel-title">📊 数据统计</span>
        <div class="panel-controls">
          <button class="panel-btn collapse-btn" :class="{ collapsed: !statsPanel.expanded }" @click="togglePanel('stats')">▼</button>
          <button class="panel-btn close-btn" @click="closePanel('stats')">✕</button>
        </div>
      </div>

      <div class="panel-content" :class="{ collapsed: !statsPanel.expanded }">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.pointCount }}</div>
            <div class="stat-label">地块中心点</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ statistics.average }}</div>
            <div class="stat-label">平均值</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ statistics.max }}</div>
            <div class="stat-label">最大值</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ statistics.min }}</div>
            <div class="stat-label">最小值</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例插槽 -->
    <div v-if="showLegend" class="heatmap-legend">
      <slot name="legend" :gradient="config.gradient" :labels="legendLabels">
        <!-- 默认图例 -->
        <div class="default-legend">
          <div class="legend-title">
            {{ dataRange?.name || '热力强度' }}
            <span v-if="legendLabels.unit" class="legend-unit">({{ legendLabels.unit }})</span>
          </div>
          <div class="legend-bar" :style="legendGradientStyle"></div>
          <div class="legend-labels">
            <span class="legend-label-min">{{ legendLabels.min }}</span>
            <span class="legend-label-mid">{{ legendLabels.mid }}</span>
            <span class="legend-label-max">{{ legendLabels.max }}</span>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import MzHeatmap, { type HeatPoint, type HeatmapConfig, type BoundaryData } from './GrowthMzHeatmap';
import { StyleProfile } from '@/components/Map/MzMapBase';

// 控制参数范围接口
interface ControlRanges {
  radius: { min: number; max: number; default: number };
  blur: { min: number; max: number; default: number };
  opacity: { min: number; max: number; step: number; default: number };
}

// 数据范围接口
interface DataRange {
  min: number;
  max: number;
  unit?: string;
  precision?: number;
  name?: string; // 数据名称，显示在图例标题中
}

// 组件属性定义
interface Props {
  // 热力数据
  heatData: HeatPoint[];
  // 边界数据
  boundaryData?: BoundaryData;
  // 热力图配置
  heatmapConfig?: Partial<HeatmapConfig>;
  // 样式配置
  styleProfile?: StyleProfile;
  // 控制面板显示
  showControls?: boolean;
  // 统计信息显示
  showStats?: boolean;
  // 图例显示
  showLegend?: boolean;
  // 控制参数范围
  controlRanges?: Partial<ControlRanges>;
  // 数据范围信息
  dataRange?: DataRange;
  // 是否禁用内置控制面板（外部完全控制）
  disableInternalControls?: boolean;
  // 使用可拖拽面板
  useDraggablePanels?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  heatData: () => [],
  showControls: true,
  showStats: false,
  showLegend: true,
  disableInternalControls: false,
  useDraggablePanels: false,
  controlRanges: () => ({
    radius: { min: 3, max: 20, default: 8 },
    blur: { min: 2, max: 15, default: 6 },
    opacity: { min: 0, max: 1, step: 0.05, default: 0.7 }
  }),
  dataRange: () => ({
    min: 0,
    max: 5,
    unit: '',
    precision: 2,
    name: '热力强度' // 默认数据名称
  })
});

// 事件定义
const emit = defineEmits<{
  mapLoaded: [];
  heatDataChanged: [data: HeatPoint[]];
  configChanged: [config: HeatmapConfig];
  boundaryToggled: [visible: boolean];
}>();

// 响应式数据
const mapContainer = ref<HTMLElement>();
let heatmapInstance: MzHeatmap | null = null;

// 可拖拽面板状态管理
const controlsPanel = ref({
  x: 20,
  y: 20,
  visible: true,
  expanded: true
});

const statsPanel = ref({
  x: 300,
  y: 20,
  visible: true,
  expanded: true
});

// 拖拽状态
const dragState = ref({
  isDragging: false,
  currentPanel: '',
  startX: 0,
  startY: 0,
  startPanelX: 0,
  startPanelY: 0
});

// 合并控制范围配置
const mergedControlRanges = computed(() => ({
  radius: { min: 3, max: 20, default: 8, ...(props.controlRanges?.radius || {}) },
  blur: { min: 2, max: 15, default: 6, ...(props.controlRanges?.blur || {}) },
  opacity: { min: 0, max: 1, step: 0.05, default: 0.7, ...(props.controlRanges?.opacity || {}) }
}));

const config = ref<HeatmapConfig>({
  radius: mergedControlRanges.value.radius.default,
  blur: mergedControlRanges.value.blur.default,
  opacity: mergedControlRanges.value.opacity.default,
  gradient: ['#000428', '#004e92', '#009ffd', '#00d2ff', '#7be495', '#ffcc02', '#ff6b35', '#f7931e', '#dc2430']
});

const boundaryVisible = ref(props.boundaryData?.visible !== false);
const selectedGradient = ref('default');

// 颜色方案配置
const gradientSchemes = {
  default: ['#000428', '#004e92', '#009ffd', '#00d2ff', '#7be495', '#ffcc02', '#ff6b35', '#f7931e', '#dc2430'],
  viridis: ['#cdfdc6', '#75fc4d', '#67df43', '#5ac53a', '#4dab31', '#3c8725', '#296118', '#163b0b', '#041502'],
  plasma: ['#0c0887', '#4b03a1', '#7d03a8', '#a82296', '#cc4778', '#e56b5d', '#f89441', '#fdc328', '#f0f921'],
  warm: ['#ff4500', '#ff6347', '#ff7f50', '#ffa500', '#ffb347', '#ffd700', '#ffff00', '#adff2f', '#7fff00'],
  cool: ['#000080', '#0000cd', '#4169e1', '#1e90ff', '#00bfff', '#87ceeb', '#b0e0e6', '#afeeee', '#e0ffff']
};

// 计算属性：统计信息
const statistics = computed(() => {
  if (props.heatData.length === 0) {
    return {
      pointCount: 0,
      average: '0.00',
      max: '0.00',
      min: '0.00',
      range: `${props.dataRange?.min.toFixed(props.dataRange?.precision || 2)} - ${props.dataRange?.max.toFixed(props.dataRange?.precision || 2)}${props.dataRange?.unit || ''}`
    };
  }

  const values = props.heatData.map((point) => point.value);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const precision = props.dataRange?.precision || 2;

  return {
    pointCount: props.heatData.length,
    average: (sum / values.length).toFixed(precision),
    max: Math.max(...values).toFixed(precision),
    min: Math.min(...values).toFixed(precision),
    range: `${props.dataRange?.min.toFixed(precision)} - ${props.dataRange?.max.toFixed(precision)}${props.dataRange?.unit || ''}`
  };
});

// 计算属性：图例渐变样式
const legendGradientStyle = computed(() => {
  const colors = config.value.gradient || [];

  // 如果没有颜色数组或为空，使用默认颜色
  if (!colors || colors.length === 0) {
    const defaultColors = ['#000428', '#004e92', '#009ffd', '#00d2ff', '#7be495', '#ffcc02', '#ff6b35', '#f7931e', '#dc2430'];
    const gradientStops = defaultColors.map((color, index) => `${color} ${(index / (defaultColors.length - 1)) * 100}%`).join(', ');

    return {
      background: `linear-gradient(to right, ${gradientStops})`
    };
  }

  // 确保至少有两个颜色才能创建渐变
  if (colors.length < 2) {
    return {
      background: colors[0] || '#409eff'
    };
  }

  const gradientStops = colors.map((color, index) => `${color} ${(index / (colors.length - 1)) * 100}%`).join(', ');

  return {
    background: `linear-gradient(to right, ${gradientStops})`
  };
});

// 计算属性：图例数值标签
const legendLabels = computed(() => {
  const precision = props.dataRange?.precision || 2;
  const unit = props.dataRange?.unit || '';

  if (props.heatData.length === 0) {
    const minVal = props.dataRange?.min || 0;
    const maxVal = props.dataRange?.max || 1;
    const midVal = (minVal + maxVal) / 2;

    return {
      min: minVal.toFixed(precision),
      mid: midVal.toFixed(precision),
      max: maxVal.toFixed(precision),
      unit
    };
  }

  try {
    const values = props.heatData.map((point) => point.value).filter((val) => !isNaN(val));

    if (values.length === 0) {
      return {
        min: '0.00',
        mid: '0.50',
        max: '1.00',
        unit
      };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const mid = (min + max) / 2;

    return {
      min: min.toFixed(precision),
      mid: mid.toFixed(precision),
      max: max.toFixed(precision),
      unit
    };
  } catch (error) {
    console.error('计算图例标签时出错:', error);
    return {
      min: '0.00',
      mid: '0.50',
      max: '1.00',
      unit
    };
  }
});

// 初始化配置
const initializeConfig = () => {
  const defaultGradient = ['#000428', '#004e92', '#009ffd', '#00d2ff', '#7be495', '#ffcc02', '#ff6b35', '#f7931e', '#dc2430'];

  const initialConfig = {
    radius: mergedControlRanges.value.radius.default,
    blur: mergedControlRanges.value.blur.default,
    opacity: mergedControlRanges.value.opacity.default,
    gradient: defaultGradient,
    ...props.heatmapConfig
  };

  // 确保gradient不为空
  if (!initialConfig.gradient || initialConfig.gradient.length === 0) {
    initialConfig.gradient = defaultGradient;
  }

  config.value = initialConfig;
  console.log('热力图配置初始化完成:', initialConfig);
  return initialConfig;
};

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return;

  await nextTick();

  try {
    const finalConfig = initializeConfig();

    // 创建热力图实例
    heatmapInstance = new MzHeatmap(
      mapContainer.value,
      () => {
        console.log('热力图加载完成');
        emit('mapLoaded');
      },
      props.styleProfile,
      finalConfig
    );

    // 设置初始数据
    if (props.heatData.length > 0) {
      heatmapInstance.setHeatData(props.heatData);
    }

    // 设置边界数据
    if (props.boundaryData) {
      heatmapInstance.setBoundaryData(props.boundaryData);
    }

    console.log('MzHeatmap 初始化完成');
  } catch (error) {
    console.error('热力图初始化失败:', error);
  }
};

// 更新热力数据
watch(
  () => props.heatData,
  (newData) => {
    if (heatmapInstance && newData) {
      heatmapInstance.setHeatData(newData);
      emit('heatDataChanged', newData);
    }
  },
  { deep: true }
);

// 更新边界数据
watch(
  () => props.boundaryData,
  (newBoundaryData) => {
    if (heatmapInstance && newBoundaryData) {
      heatmapInstance.setBoundaryData(newBoundaryData);
      // 同步边界显示状态
      boundaryVisible.value = newBoundaryData.visible !== false;
    }
  },
  { deep: true }
);

// 监听边界显示状态变化
watch(
  () => props.boundaryData?.visible,
  (visible) => {
    if (visible !== undefined) {
      boundaryVisible.value = visible;
      if (heatmapInstance) {
        heatmapInstance.toggleBoundaryVisibility(visible);
      }
    }
  }
);

// 监听外部配置变化
watch(
  () => props.heatmapConfig,
  (newConfig) => {
    if (newConfig && heatmapInstance) {
      // 更新内部配置
      config.value = { ...config.value, ...newConfig };
      // 应用到热力图实例
      heatmapInstance.updateHeatmapConfig(newConfig);
    }
  },
  { deep: true }
);

// 监听控制范围变化，重新初始化配置
watch(
  () => props.controlRanges,
  () => {
    if (heatmapInstance) {
      const newConfig = initializeConfig();
      heatmapInstance.updateHeatmapConfig(newConfig);
    }
  },
  { deep: true }
);

// 监听config.gradient的变化，确保图例及时更新
watch(
  () => config.value.gradient,
  (newGradient) => {
    console.log('图例颜色方案变化:', newGradient);
  },
  { deep: true }
);

// 可拖拽面板功能
const startDrag = (event: MouseEvent, panelType: string) => {
  event.preventDefault();

  dragState.value.isDragging = true;
  dragState.value.currentPanel = panelType;
  dragState.value.startX = event.clientX;
  dragState.value.startY = event.clientY;

  const panel = getPanelRef(panelType);
  if (panel) {
    dragState.value.startPanelX = panel.x;
    dragState.value.startPanelY = panel.y;
  }

  // 添加全局事件监听
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', endDrag);
};

const handleDrag = (event: MouseEvent) => {
  if (!dragState.value.isDragging) return;

  const deltaX = event.clientX - dragState.value.startX;
  const deltaY = event.clientY - dragState.value.startY;

  const panel = getPanelRef(dragState.value.currentPanel);
  if (panel) {
    panel.x = dragState.value.startPanelX + deltaX;
    panel.y = dragState.value.startPanelY + deltaY;

    // 确保面板不会拖出可视区域
    panel.x = Math.max(0, Math.min(panel.x, window.innerWidth - 300));
    panel.y = Math.max(0, Math.min(panel.y, window.innerHeight - 200));
  }
};

const endDrag = () => {
  dragState.value.isDragging = false;
  dragState.value.currentPanel = '';

  // 移除全局事件监听
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', endDrag);
};

const getPanelRef = (panelType: string) => {
  switch (panelType) {
    case 'controls':
      return controlsPanel.value;
    case 'stats':
      return statsPanel.value;
    default:
      return null;
  }
};

const togglePanel = (panelType: string) => {
  const panel = getPanelRef(panelType);
  if (panel) {
    panel.expanded = !panel.expanded;
  }
};

const closePanel = (panelType: string) => {
  const panel = getPanelRef(panelType);
  if (panel) {
    panel.visible = false;
  }
};

const showPanelById = (panelType: string) => {
  const panel = getPanelRef(panelType);
  if (panel) {
    panel.visible = true;
  }
};

// 控制方法
const updateConfig = (newConfig: Partial<HeatmapConfig>) => {
  config.value = { ...config.value, ...newConfig };
  if (heatmapInstance) {
    heatmapInstance.updateHeatmapConfig(newConfig);
    emit('configChanged', config.value);
  }
};

const updateRadius = () => {
  updateConfig({ radius: config.value.radius });
};

const updateBlur = () => {
  updateConfig({ blur: config.value.blur });
};

const updateOpacity = () => {
  updateConfig({ opacity: config.value.opacity });
};

const toggleBoundary = () => {
  if (heatmapInstance) {
    heatmapInstance.toggleBoundaryVisibility(boundaryVisible.value);
    emit('boundaryToggled', boundaryVisible.value);
  }
};

// 应用颜色方案
const applyGradient = () => {
  const gradient = gradientSchemes[selectedGradient.value as keyof typeof gradientSchemes];
  if (gradient && gradient.length > 0) {
    console.log('应用新的颜色方案:', selectedGradient.value, gradient);
    updateConfig({ gradient });
  } else {
    console.warn('无效的颜色方案:', selectedGradient.value);
  }
};

// 暴露方法给父组件
const getHeatmapInstance = () => heatmapInstance;
const getCurrentData = () => heatmapInstance?.getCurrentHeatData() || [];
const getConfig = () => heatmapInstance?.getHeatmapConfig() || config.value;
const addClickListener = (callback: (heatPoint: any, coordinate: [number, number]) => void) => {
  if (heatmapInstance) {
    heatmapInstance.addClickListener(callback);
  }
};

defineExpose({
  getHeatmapInstance,
  getCurrentData,
  getConfig,
  updateConfig,
  toggleBoundary,
  showPanelById,
  closePanel,
  togglePanel,
  addClickListener
});

// 生命周期
onMounted(() => {
  initMap();

  // 调试信息：检查初始配置
  nextTick(() => {
    console.log('组件挂载完成，当前配置:', {
      config: config.value,
      legendGradientStyle: legendGradientStyle.value,
      legendLabels: legendLabels.value,
      showLegend: props.showLegend
    });
  });
});

onUnmounted(() => {
  if (heatmapInstance) {
    heatmapInstance.destroy();
  }
});
</script>

<style scoped>
.mz-heatmap-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.mz-heatmap-container {
  width: 100%;
  height: 100%;
}

/* 面板控制按钮组 */
.panel-toggle-group {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1001;
  display: flex;
  gap: 5px;
}

.toggle-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover {
  background: #409eff;
  color: white;
  border-color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 控制面板样式 */
.heatmap-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.default-controls h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 14px;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: #606266;
}

.control-group input[type='range'] {
  width: 100%;
}

.control-group input[type='checkbox'] {
  margin-left: 10px;
}

/* 统计信息样式 */
.heatmap-stats {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-width: 150px;
}

.default-stats h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.stat-item {
  margin-bottom: 5px;
  font-size: 12px;
  color: #606266;
}

/* 图例样式 */
.heatmap-legend {
  position: absolute;
  bottom: 30px;
  left: 30px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.legend-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
  text-align: center;
}

.legend-unit {
  font-weight: normal;
  font-size: 12px;
  color: #666;
  margin-left: 4px;
}

.legend-bar {
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-bottom: 5px;
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.legend-label-min,
.legend-label-mid,
.legend-label-max {
  font-weight: 500;
  color: #303133;
  text-align: center;
  flex: 1;
}

.legend-label-min {
  text-align: left;
}

.legend-label-max {
  text-align: right;
}

/* 可拖拽面板样式 */
.draggable-panel {
  position: absolute;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e4e7ed;
  min-width: 280px;
  max-width: 400px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.draggable-panel:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.panel-header {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: white;
  padding: 10px 15px;
  height: 40px;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header:hover {
  background: linear-gradient(135deg, #337ecc, #5a9dff);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.panel-controls {
  display: flex;
  gap: 5px;
}

.panel-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background-color 0.2s;
}

.panel-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.collapse-btn {
  transition: transform 0.3s ease;
}

.collapse-btn.collapsed {
  transform: rotate(-90deg);
}

.close-btn:hover {
  background: rgba(244, 67, 54, 0.8);
}

.panel-content {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.panel-content.collapsed {
  max-height: 0;
  padding: 0 20px;
  overflow: hidden;
}

.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 控制项样式 */
.control-item {
  margin-bottom: 15px;
}

.control-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.control-item input[type='range'] {
  width: 100%;
  margin-bottom: 5px;
}

.control-item select {
  width: 100%;
  padding: 4px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

/* 统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-card {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}
</style>
