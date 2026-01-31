# MzHeatmap 热力图组件

基于MzMapBase构建的专业热力图组件，提供完整的热力数据可视化解决方案，支持可拖拽面板交互和丰富的自定义功能。

## 🏗️ 组件架构

```
/src/components/Map/
├── MzMapBase.ts              # 基础地图类
├── MzHeatmap.ts              # 热力图核心类 (继承MzMapBase)
└── MzHeatmapComponent.vue    # Vue组件包装器 (支持可拖拽面板)
```

## 📦 核心组件

### 1. MzHeatmap 类 (`MzHeatmap.ts`)

**继承关系**: `MzHeatmap extends MzMapBase`

**核心功能**:

- ✅ 基于OpenLayers原生Heatmap图层
- ✅ 热力数据点管理和渲染
- ✅ 边界图层支持
- ✅ 实时配置更新
- ✅ 坐标查询和数据检索

**接口定义**:

```typescript
// 热力数据点接口
interface HeatPoint {
  id: string;
  coordinate: [number, number]; // 经纬度
  value: number; // 热力值 (0-1)
  weight?: number; // 权重
  metadata?: any; // 元数据
}

// 热力图配置接口
interface HeatmapConfig {
  radius?: number; // 半径 (默认15)
  blur?: number; // 模糊度 (默认15)
  opacity?: number; // 透明度 (默认0.7)
  gradient?: string[]; // 颜色渐变
  minOpacity?: number; // 最小透明度
  maxOpacity?: number; // 最大透明度
}

// 边界数据接口
interface BoundaryData {
  data: any; // GeoJSON数据
  visible?: boolean; // 是否显示
  strokeColor?: string; // 边界颜色
  strokeWidth?: number; // 边界宽度
  fillColor?: string; // 填充颜色
}
```

**主要方法**:

```typescript
// 数据管理
setHeatData(points: HeatPoint[]): void
setBoundaryData(boundary: BoundaryData): void
clearHeatData(): void
clearBoundary(): void

// 配置更新
updateHeatmapConfig(config: Partial<HeatmapConfig>): void
toggleBoundaryVisibility(visible: boolean): void

// 查询方法
getCurrentHeatData(): HeatPoint[]
getHeatmapConfig(): HeatmapConfig
getHeatInfoAtCoordinate(coord: [number, number], tolerance?: number): HeatPoint[]

// 生命周期
destroy(): void
```

### 2. MzHeatmapComponent Vue组件 (`MzHeatmapComponent.vue`)

**🆕 新特性**:

- ✅ **可拖拽面板** - 支持控制面板和统计面板拖拽、折叠、关闭
- ✅ **面板控制按钮** - 智能显示/隐藏面板的控制按钮
- ✅ **双模式支持** - 固定位置面板和可拖拽面板两种模式
- ✅ **预设配色方案** - 内置5种科学配色方案
- ✅ **完整的统计功能** - 自动计算数据统计和分布
- ✅ **响应式设计** - 适配不同屏幕尺寸

**组件属性**:

```typescript
interface Props {
  // 基础数据
  heatData: HeatPoint[]; // 热力数据 (必需)
  boundaryData?: BoundaryData; // 边界数据
  heatmapConfig?: Partial<HeatmapConfig>; // 热力图配置
  styleProfile?: StyleProfile; // 地图样式

  // 面板控制
  showControls?: boolean; // 显示控制面板
  showStats?: boolean; // 显示统计信息
  showLegend?: boolean; // 显示图例
  useDraggablePanels?: boolean; // 🆕 启用可拖拽面板模式

  // 高级配置
  controlRanges?: Partial<ControlRanges>; // 控制参数范围
  dataRange?: DataRange; // 数据范围信息
  disableInternalControls?: boolean; // 禁用内置控制面板
}

// 🆕 控制参数范围接口
interface ControlRanges {
  radius: { min: number; max: number; default: number };
  blur: { min: number; max: number; default: number };
  opacity: { min: number; max: number; step: number; default: number };
}

// 🆕 数据范围接口
interface DataRange {
  min: number;
  max: number;
  unit?: string; // 数据单位
  precision?: number; // 精度
  name?: string; // 🆕 数据名称，显示在图例标题
}
```

**组件事件**:

```typescript
const emit = defineEmits<{
  mapLoaded: []; // 地图加载完成
  heatDataChanged: [data: HeatPoint[]]; // 热力数据变化
  configChanged: [config: HeatmapConfig]; // 配置变化
  boundaryToggled: [visible: boolean]; // 边界切换
}>();
```

**🆕 暴露的方法**:

```typescript
// 基础方法
getHeatmapInstance(): MzHeatmap | null
getCurrentData(): HeatPoint[]
getConfig(): HeatmapConfig
updateConfig(config: Partial<HeatmapConfig>): void
toggleBoundary(): void

// 🆕 面板控制方法
showPanelById(panelType: string): void    // 显示指定面板
closePanel(panelType: string): void       // 关闭指定面板
togglePanel(panelType: string): void      // 切换面板展开状态
```

**插槽支持**:

- `#controls`: 自定义控制面板 (仅在非拖拽模式)
- `#stats`: 自定义统计信息显示 (仅在非拖拽模式)
- `#legend`: 自定义图例

## 🚀 使用示例

### 基础用法 (固定面板模式)

```vue
<template>
  <MzHeatmapComponent :heat-data="heatPoints" :show-controls="true" :show-stats="true" :show-legend="true" @map-loaded="onMapLoaded" />
</template>

<script setup>
import MzHeatmapComponent from '@/components/Map/MzHeatmapComponent.vue';

const heatPoints = ref([
  {
    id: 'point1',
    coordinate: [110.2, 37.8],
    value: 0.8,
    metadata: { name: '热点1' }
  },
  {
    id: 'point2',
    coordinate: [110.3, 37.9],
    value: 0.6,
    metadata: { name: '热点2' }
  }
]);

const onMapLoaded = () => {
  console.log('热力图加载完成');
};
</script>
```

### 🆕 可拖拽面板模式

```vue
<template>
  <MzHeatmapComponent
    :heat-data="heatPoints"
    :boundary-data="boundaryData"
    :use-draggable-panels="true"
    :show-controls="true"
    :show-stats="true"
    :show-legend="true"
    :control-ranges="controlRanges"
    :data-range="dataRange"
    @config-changed="onConfigChanged"
  />
</template>

<script setup>
const controlRanges = ref({
  radius: { min: 3, max: 30, default: 8 },
  blur: { min: 2, max: 15, default: 6 },
  opacity: { min: 0, max: 1, step: 0.05, default: 0.7 }
});

const dataRange = ref({
  min: 0,
  max: 10,
  unit: '%',
  precision: 2,
  name: 'LAI指数' // 🆕 数据名称，显示在图例标题
});

const onConfigChanged = (config) => {
  console.log('配置更新:', config);
};
</script>
```

### 🆕 编程控制面板

```vue
<template>
  <div>
    <!-- 外部控制按钮 -->
    <div class="external-controls">
      <button @click="showControlPanel">显示控制面板</button>
      <button @click="showStatsPanel">显示统计面板</button>
      <button @click="hideAllPanels">隐藏所有面板</button>
    </div>

    <MzHeatmapComponent ref="heatmapRef" :heat-data="heatPoints" :use-draggable-panels="true" />
  </div>
</template>

<script setup>
const heatmapRef = ref();

const showControlPanel = () => {
  heatmapRef.value?.showPanelById('controls');
};

const showStatsPanel = () => {
  heatmapRef.value?.showPanelById('stats');
};

const hideAllPanels = () => {
  heatmapRef.value?.closePanel('controls');
  heatmapRef.value?.closePanel('stats');
};
</script>
```

### 高级用法 (自定义插槽) - 固定模式

```vue
<template>
  <MzHeatmapComponent :heat-data="heatPoints" :boundary-data="boundaryData" @config-changed="onConfigChanged">
    <!-- 自定义控制面板 -->
    <template #controls="{ updateConfig }">
      <div class="custom-controls">
        <h4>热力图设置</h4>
        <input type="range" :min="5" :max="50" v-model="radius" @input="updateConfig({ radius })" />
      </div>
    </template>

    <!-- 自定义统计面板 -->
    <template #stats="{ stats }">
      <div class="custom-stats">
        <div>总计: {{ stats.pointCount }} 个数据点</div>
        <div>平均值: {{ stats.average }}</div>
      </div>
    </template>
  </MzHeatmapComponent>
</template>
```

## 🎨 可拖拽面板特性

### 🎛️ 热力控制面板

- **默认位置**: 左上角 (20, 20)
- **功能**:
  - 半径控制 (3-30px)
  - 模糊控制 (2-15px)
  - 透明度控制 (0-100%)
  - 边界显示切换
  - 预设配色方案选择 (5种方案)
- **交互**: 拖拽、折叠、关闭、重新显示

### 📊 数据统计面板

- **默认位置**: 右上角 (300, 20)
- **功能**:
  - 数据点数量统计
  - 平均值/最大值/最小值
  - 统计卡片网格布局
- **交互**: 拖拽、折叠、关闭、重新显示

### 📈 图例面板

- **位置**: 左下角固定
- **功能**: 热力强度渐变显示
- **状态**: 始终显示 (可通过 `showLegend` 控制)

### 🔧 面板控制按钮组

- **位置**: 右上角浮动
- **显示逻辑**: 仅在面板被关闭时显示对应按钮
- **样式**: 现代化设计，悬停效果，半透明背景

## 🎨 预设配色方案

组件内置多种科学配色方案:

```typescript
const gradientSchemes = {
  default: ['#000428', '#004e92', '#009ffd', '#00d2ff', '#7be495', '#ffcc02', '#ff6b35', '#f7931e', '#dc2430'],
  viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],
  plasma: ['#0c0887', '#4b03a1', '#7d03a8', '#a82296', '#cc4778', '#e56b5d', '#f89441', '#fdc328', '#f0f921'],
  warm: ['#ff4500', '#ff6347', '#ff7f50', '#ffa500', '#ffb347', '#ffd700', '#ffff00', '#adff2f', '#7fff00'],
  cool: ['#000080', '#0000cd', '#4169e1', '#1e90ff', '#00bfff', '#87ceeb', '#b0e0e6', '#afeeee', '#e0ffff']
};
```

## 📊 数据生成策略 (演示功能)

演示组件支持多种数据生成模式:

### 1. 完全随机分布

```typescript
// 在指定边界内随机生成热力点
coordinate = [bounds.minLon + Math.random() * (bounds.maxLon - bounds.minLon), bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat)];
value = Math.random();
```

### 2. 聚集分布

```typescript
// 创建多个热点中心，周围聚集分布
const centers = [
  [110.1, 37.9],
  [110.3, 37.8],
  [110.0, 38.0]
];
const center = centers[Math.floor(Math.random() * centers.length)];
coordinate = [center[0] + (Math.random() - 0.5) * 0.1, center[1] + (Math.random() - 0.5) * 0.1];
value = Math.max(0.3, Math.random()); // 聚集区域热力值偏高
```

### 3. 梯度分布

```typescript
// 根据地理位置创建渐变效果 (如西→东递增)
const lonRatio = (coordinate[0] - bounds.minLon) / (bounds.maxLon - bounds.minLon);
value = Math.max(0, Math.min(1, lonRatio + (Math.random() - 0.5) * 0.3));
```

### 4. 🆕 基于地块中心数据

```typescript
// 从GeoJSON地块数据生成热力点
geojsonData.features.forEach((feature) => {
  // 计算地块几何中心点 (质心算法)
  const center = calculatePolygonCenter(feature.geometry.coordinates);

  // 在地块中心生成热力点
  const point = {
    id: `land_${feature.properties.landId}`,
    coordinate: center,
    value: generateValueInRange(dataRange),
    metadata: {
      landId: feature.properties.landId,
      landArea: feature.properties.landArea,
      centerPoint: true,
      crs: 'CRS84'
    }
  };
  heatPoints.push(point);
});
```

### 5. 🆕 JSON数据源加载

```typescript
// 从外部JSON文件加载热力值
const jsonData = await fetch('/map-json/lai_value_demo.json');
const data = await jsonData.json();

// 根据baseId和plotId匹配地块
data.forEach((item) => {
  const { baseId, plotId, value } = item;
  const matchedFeature = findFeatureByIds(baseId, plotId);

  if (matchedFeature) {
    const center = calculatePolygonCenter(matchedFeature.geometry);
    heatPoints.push({
      id: `json_${item.id}`,
      coordinate: center,
      value: normalizeValue(value, dataRange),
      metadata: { fromJson: true, originalValue: value }
    });
  }
});
```

## ⚙️ 技术特性

### 🏗️ 架构设计

- **组件分离**: 控制面板与数据信息面板独立管理
- **双模式支持**: 固定位置 + 可拖拽模式
- **响应式设计**: 适配不同屏幕尺寸
- **状态管理**: 面板位置、显示状态、展开状态统一管理

### 🎯 核心功能

- **热力图渲染**: 基于 OpenLayers Heatmap 层
- **实时控制**: 动态调整半径、模糊、透明度参数
- **数据可视化**: 图例显示、统计信息展示
- **边界叠加**: GeoJSON 矢量图层支持
- **交互体验**: 流畅的拖拽、折叠、展开动画

### 🎨 UI/UX 特性

- **现代化设计**: Element Plus + 自定义样式
- **动画效果**: CSS transition 平滑过渡
- **响应反馈**: 悬停、激活状态视觉反馈
- **无障碍支持**: 键盘导航、ARIA 标签

### 🔧 开发体验

- **TypeScript**: 完整类型定义，开发时智能提示
- **Vue 3 Composition API**: 清晰的逻辑组织和复用
- **组件插槽**: 灵活的内容定制能力
- **事件系统**: 丰富的生命周期和交互事件

## 🚀 性能优化

### 📊 数据处理优化

```typescript
// 大数据量优化策略
const optimizeHeatPoints = (points: HeatPoint[]) => {
  // 1. 空间聚合：合并相近点位
  const clustered = spatialCluster(points, 50); // 50米聚合半径

  // 2. 数量限制：防止渲染卡顿
  const limited = clustered.slice(0, 5000); // 最大5000点

  // 3. 精度优化：坐标精度控制
  return limited.map((point) => ({
    ...point,
    coordinate: [parseFloat(point.coordinate[0].toFixed(6)), parseFloat(point.coordinate[1].toFixed(6))]
  }));
};
```

### 🎨 渲染性能优化

```typescript
// 热力图层优化配置
const heatmapLayerOptions = {
  blur: 15, // 适中的模糊值平衡效果与性能
  radius: 8, // 合理的渲染半径
  weight: 'value', // 使用权重字段
  opacity: 0.8, // 避免过度重绘
  // 性能优化选项
  renderMode: 'webgl', // 使用 WebGL 加速
  declutter: true, // 自动避免重叠
  updateWhileAnimating: false, // 动画时暂停更新
  updateWhileInteracting: false // 交互时暂停更新
};
```

### 💾 内存管理

```typescript
// 组件销毁时清理资源
onUnmounted(() => {
  // 清理地图图层
  if (map.value && heatmapLayer.value) {
    map.value.removeLayer(heatmapLayer.value);
  }

  // 清理事件监听
  removeEventListeners();

  // 清理定时器
  if (updateTimer.value) {
    clearInterval(updateTimer.value);
  }

  // 重置引用
  map.value = null;
  heatmapLayer.value = null;
});
```

## 🎨 可扩展性与定制

### 🔌 插槽系统

```vue
<!-- 完全自定义控制面板 (仅非拖拽模式) -->
<MzHeatmapComponent>
  <template #controls>
    <div class="custom-controls">
      <MyCustomSlider v-model="radius" label="半径" />
      <MyCustomColorPicker v-model="colors" />
      <MyCustomButton @click="resetView">重置视图</MyCustomButton>
    </div>
  </template>
  
  <!-- 自定义统计信息显示 (仅非拖拽模式) -->
  <template #stats>
    <div class="custom-stats">
      <MyDataChart :data="heatmapStats" />
      <MyMetricCards :metrics="customMetrics" />
    </div>
  </template>
  
  <!-- 自定义图例样式 -->
  <template #legend="{ gradient, labels }">
    <div class="custom-legend">
      <h4 class="legend-title">{{ dataRange.name || '数据强度' }}</h4>
      <MyGradientBar :colors="gradient" />
      <MyLegendLabels :labels="labels" />
      <div class="legend-unit">{{ dataRange.unit }}</div>
    </div>
  </template>
</MzHeatmapComponent>
```

### 🎛️ 事件系统

```typescript
// 监听热力图状态变化
const handleHeatmapReady = (config: HeatmapConfig) => {
  console.log('热力图已就绪:', config);
  // 执行初始化逻辑
};

const handleDataUpdate = (data: HeatPoint[]) => {
  console.log('数据已更新:', data.length, '个点');
  // 更新外部统计信息
  updateExternalStats(data);
};

const handleConfigChange = (newConfig: HeatmapConfig) => {
  console.log('配置已更改:', newConfig);
  // 同步配置到其他组件
  syncConfigToOtherComponents(newConfig);
};

// 拖拽模式下的面板事件
const handlePanelStateChange = (panelType: string, state: PanelState) => {
  console.log(`面板 ${panelType} 状态变更:`, state);
  // 保存面板状态到本地存储
  savePanelState(panelType, state);
};
```

### 🎨 样式定制

```scss
// 自定义拖拽面板样式
.mz-heatmap {
  // 控制面板样式
  .draggable-control-panel {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    .panel-header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }
  }

  // 统计面板样式
  .draggable-stats-panel {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

    .stat-card {
      background: rgba(255, 255, 255, 0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      }
    }
  }

  // 面板控制按钮样式
  .panel-control-buttons {
    .control-btn {
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);

      &:hover {
        background: linear-gradient(45deg, #ff5252, #26c6da);
        transform: scale(1.05);
      }
    }
  }
}
```

### 🔧 高级配置

```typescript
// 高级热力图配置
const advancedConfig: HeatmapConfig = {
  // 渲染参数
  radius: 15,
  blur: 8,
  opacity: 0.85,

  // 数据范围配置
  dataRange: {
    min: 0,
    max: 100,
    unit: 'kg/ha',
    precision: 1,
    name: '作物产量' // 🆕 自定义图例标题
  },

  // 渐变配色
  gradient: {
    0.0: '#000428',
    0.2: '#004e92',
    0.4: '#009ffd',
    0.6: '#00d2ff',
    0.8: '#7be495',
    1.0: '#ffcc02'
  },

  // 性能优化
  maxPoints: 5000, // 最大渲染点数
  clustering: true, // 启用聚合
  clusterRadius: 50, // 聚合半径(米)
  updateThrottle: 100, // 更新节流(毫秒)

  // 交互配置
  enableZoomControl: true, // 启用缩放控制
  enablePanControl: true, // 启用平移控制
  mouseWheelZoom: true, // 鼠标滚轮缩放

  // 图层配置
  layerZIndex: 100, // 图层层级
  preload: true, // 预加载数据
  cacheSize: 1000 // 缓存大小
};
```

## � 演示页面功能

### 🎮 完整演示体验

**@/views/demo/HeatmapDemo.vue** 页面包含全部功能，请在RuoYi菜单管理中配置路由访问，功能包括：

#### 📱 可拖拽面板模式

- **🎛️ 热力控制面板**: 左上角默认位置，可拖拽到任意位置
  - 半径滑块控制 (3-30px)
  - 模糊程度调节 (2-15px)
  - 透明度设置 (0-100%)
  - 边界显示开关
  - 5种预设配色方案切换
- **📊 数据统计面板**: 右上角默认位置，可拖拽移动
  - 实时数据点计数
  - 数值分布统计 (最大值/最小值/平均值)
  - 卡片式信息展示
- **🎨 面板控制按钮**: 右上角浮动位置
  - 当面板被关闭时显示对应控制按钮
  - 一键恢复已关闭的面板
  - 现代化按钮设计，悬停动效

#### 📍 数据信息面板 (演示页面独有)

- **数据源管理**:
  - 5种数据生成策略选择
  - 数据点数量控制 (50-2000)
  - 实时数据重新生成
- **地理数据集成**:
  - 米脂县真实地块边界加载
  - GeoJSON 数据可视化
  - 地块中心点热力值映射

#### 🎨 视觉效果展示

- **配色方案对比**: 5种科学配色同时预览
- **参数实时调节**: 滑块控制，即时视觉反馈
- **全屏展示支持**: 完整地图视图，所有面板功能保持可用

## 🛠️ 技术栈与依赖

### 核心技术

- **Vue 3.4+** - 响应式框架，Composition API
- **TypeScript 5.0+** - 类型安全开发
- **OpenLayers 8.0+** - 专业地图渲染引擎
- **Element Plus** - UI 组件库

### 地图相关

- **ol/layer/Heatmap** - 热力图图层
- **ol/source/Vector** - 矢量数据源
- **ol/format/GeoJSON** - 地理数据格式
- **ol/proj** - 坐标投影转换

### 开发工具

- **Vite** - 构建工具
- **UnoCSS** - 原子化 CSS
- **ESLint** - 代码质量
- **Prettier** - 代码格式化

---

🎯 **总结**: MzHeatmapComponent 为米脂县地理数据可视化提供了热力图解决方案。通过可拖拽面板系统、丰富的自定义选项和优秀的性能表现，满足了从简单展示到复杂分析的各种应用场景。
