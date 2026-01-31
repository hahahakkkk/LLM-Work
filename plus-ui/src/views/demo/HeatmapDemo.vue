<template>
  <div class="heatmap-demo-container">
    <div class="demo-header">
      <h2>MzHeatmap 组件演示</h2>
      <div class="demo-controls">
        <button @click="generateRandomData" class="btn btn-primary">生成地块中心热力点 ({{ heatPoints.length }} 个)</button>
        <button @click="loadLandUnitData" class="btn btn-secondary">加载地块数据 (CRS84)</button>
        <button @click="clearData" class="btn btn-danger">清空数据</button>
        <button @click="loadValueFromJson" class="btn btn-success">从JSON加载热力值</button>

        <!-- 数据信息面板控制按钮 -->
        <div class="panel-toggle-buttons">
          <button v-if="!dataInfoPanel.visible" @click="showPanel('dataInfo')" class="btn btn-info btn-sm">🔍 信息面板</button>
        </div>
      </div>
    </div>

    <div class="demo-content">
      <!-- 热力图组件 -->
      <MzHeatmapComponent
        ref="heatmapRef"
        :heat-data="heatPoints"
        :boundary-data="boundaryData"
        :heatmap-config="heatmapConfig"
        :control-ranges="controlRanges"
        :data-range="dataRange"
        :show-controls="true"
        :show-stats="false"
        :show-legend="true"
        :use-draggable-panels="true"
        @map-loaded="onMapLoaded"
        @heat-data-changed="onHeatDataChanged"
        @config-changed="onConfigChanged"
      >
      </MzHeatmapComponent>

      <!-- 数据信息面板 -->
      <div
        class="data-info-panel draggable-panel"
        :style="{
          left: dataInfoPanel.x + 'px',
          top: dataInfoPanel.y + 'px',
          display: dataInfoPanel.visible ? 'block' : 'none'
        }"
      >
        <div class="panel-header" @mousedown="startDrag($event, 'dataInfo')">
          <span class="panel-title">🔍 数据信息</span>
          <div class="panel-controls">
            <button @click="togglePanel('dataInfo')" class="panel-btn collapse-btn" :class="{ collapsed: !dataInfoPanel.expanded }">▼</button>
            <button @click="closePanel('dataInfo')" class="panel-btn close-btn">✕</button>
          </div>
        </div>

        <div class="panel-content" :class="{ collapsed: !dataInfoPanel.expanded }">
          <div class="info-item"><strong>数据类型:</strong> {{ dataRange.name || '未命名数据' }}</div>
          <div class="info-item"><strong>生成策略:</strong> {{ dataGenerationStrategy }}</div>
          <div class="info-item">
            <strong>数据范围:</strong> {{ dataRange.min.toFixed(dataRange.precision) }} - {{ dataRange.max.toFixed(dataRange.precision)
            }}{{ dataRange.unit }}
          </div>
          <div class="info-item">
            <strong>坐标范围:</strong>
            <br />经度: 109.69° - 110.57° <br />纬度: 37.62° - 38.14°
          </div>
          <div class="info-item"><strong>最后更新:</strong> {{ lastUpdateTime }}</div>

          <!-- JSON数据源配置 -->
          <div class="json-data-config">
            <h5>JSON数据源:</h5>
            <div class="config-item">
              <label>数据URL:</label>
              <input type="text" v-model="jsonDataUrl" placeholder="JSON数据文件URL" class="url-input" />
            </div>
            <div class="config-item">
              <button @click="loadValueFromJson" class="btn btn-sm btn-primary">加载JSON热力值</button>
            </div>
            <div class="config-note">
              <small>格式: [{"id", "baseId", "plotId", "value"}]</small>
            </div>
          </div>

          <!-- 数据生成选项 -->
          <div class="generation-options">
            <h5>数据生成选项:</h5>
            <div class="option-item">
              <label>
                <input type="radio" v-model="dataGenerationStrategy" value="random" />
                完全随机
              </label>
            </div>
            <div class="option-item">
              <label>
                <input type="radio" v-model="dataGenerationStrategy" value="clustered" />
                聚集分布
              </label>
            </div>
            <div class="option-item">
              <label>
                <input type="radio" v-model="dataGenerationStrategy" value="gradient" />
                梯度分布
              </label>
            </div>

            <div class="option-item">
              <label>数据点数量:</label>
              <input type="range" :min="50" :max="2000" :step="50" v-model="pointCount" />
              <span>{{ pointCount }}</span>
            </div>

            <div class="option-item">
              <label>分布区间数量:</label>
              <input type="range" :min="3" :max="10" :step="1" v-model="dataRange.intervals" />
              <span>{{ dataRange.intervals }}</span>
            </div>

            <div class="option-item">
              <label>
                <input type="checkbox" v-model="autoAdjustRange" />
                自动调整数据范围
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import MzHeatmapComponent from '@/components/Map/MzHeatmapComponent.vue';
import type { HeatPoint, BoundaryData, HeatmapConfig } from '@/components/Map/MzHeatmap';

// 响应式数据
const heatmapRef = ref();
const heatPoints = ref<HeatPoint[]>([]);
const boundaryData = ref<BoundaryData>();
const lastUpdateTime = ref('');
const showBoundaries = ref(true);
const dataGenerationStrategy = ref('random');
const pointCount = ref(500);

const autoAdjustRange = ref(false);
const jsonDataUrl = ref('/map-json/lai_value_demo.json');

// 数据信息面板状态管理
const dataInfoPanel = ref({
  x: 600,
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

const currentConfig = ref<HeatmapConfig>({
  radius: 8,
  blur: 6,
  opacity: 0.7,
  gradient: ['#000428', '#004e92', '#009ffd', '#00d2ff', '#7be495', '#ffcc02', '#ff6b35', '#f7931e', '#dc2430']
});

// 热力图配置 - 传递给组件的配置
const heatmapConfig = ref<HeatmapConfig>({
  radius: 8,
  blur: 6,
  opacity: 0.7,
  gradient: ['#000428', '#004e92', '#009ffd', '#00d2ff', '#7be495', '#ffcc02', '#ff6b35', '#f7931e', '#dc2430']
});

// 控制参数范围配置
const controlRanges = ref({
  radius: { min: 3, max: 50, default: 8 },
  blur: { min: 2, max: 30, default: 6 },
  opacity: { min: 0, max: 1, step: 0.05, default: 0.7 }
});

// 数据范围配置
const dataRange = ref({
  min: 0,
  max: 4,
  unit: '',
  precision: 2,
  intervals: 6, // 分布区间数量
  name: 'LAI指数' // 数据名称，显示在图例标题
});

// 计算属性：数值分布统计
const valueDistribution = computed(() => {
  if (heatPoints.value.length === 0) {
    return {};
  }

  const { min, max, precision, intervals = 5 } = dataRange.value;

  // 如果min等于max，返回单个区间
  if (Math.abs(max - min) < 1e-10) {
    const key = `${min.toFixed(precision)}`;
    return { [key]: heatPoints.value.length };
  }

  const step = (max - min) / intervals;

  // 动态生成分布区间
  const distribution: { [key: string]: number } = {};
  const ranges: { key: string; minVal: number; maxVal: number }[] = [];

  for (let i = 0; i < intervals; i++) {
    const rangeMin = min + i * step;
    const rangeMax = min + (i + 1) * step;

    // 格式化区间标签
    let key: string;
    if (i === intervals - 1) {
      // 最后一个区间显示为 [min, max]
      key = `${rangeMin.toFixed(precision)}-${rangeMax.toFixed(precision)}`;
    } else {
      key = `${rangeMin.toFixed(precision)}-${rangeMax.toFixed(precision)}`;
    }

    distribution[key] = 0;
    ranges.push({ key, minVal: rangeMin, maxVal: rangeMax });
  }

  // 统计每个热力点落在哪个区间
  heatPoints.value.forEach((point) => {
    const value = point.value;

    // 确保值在有效范围内
    if (value < min || value > max) {
      return;
    }

    // 找到对应的区间
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];

      if (i === ranges.length - 1) {
        // 最后一个区间包含最大值 [min, max]
        if (value >= range.minVal && value <= range.maxVal) {
          distribution[range.key]++;
          break;
        }
      } else {
        // 其他区间不包含上界 [min, max)
        if (value >= range.minVal && value < range.maxVal) {
          distribution[range.key]++;
          break;
        }
      }
    }
  });

  return distribution;
});

// 面板拖拽和折叠功能
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
    case 'dataInfo':
      return dataInfoPanel.value;
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

const showPanel = (panelType: string) => {
  const panel = getPanelRef(panelType);
  if (panel) {
    panel.visible = true;
  }
};

// 生成随机热力数据
const generateRandomData = () => {
  // 检查是否已加载边界数据
  if (!boundaryData.value?.data?.features?.length) {
    ElMessage.warning('请先加载地块数据后再生成热力点');
    return;
  }

  const points: HeatPoint[] = [];
  const count = pointCount.value;
  const features = boundaryData.value.data.features;

  // 将总点数分配到各个地块
  const pointsPerFeature = Math.ceil(count / features.length);
  let generatedCount = 0;

  features.forEach((feature: any, featureIndex: number) => {
    if (generatedCount >= count) return;

    const geometry = feature.geometry;
    const properties = feature.properties;

    // 处理不同的几何类型
    let polygons: number[][][] = [];

    if (geometry?.type === 'Polygon') {
      polygons = [geometry.coordinates[0]];
    } else if (geometry?.type === 'MultiPolygon') {
      polygons = geometry.coordinates.map((polygon: number[][][]) => polygon[0]);
    }

    polygons.forEach((coordinates, polyIndex) => {
      if (coordinates && coordinates.length > 3 && generatedCount < count) {
        // 每个地块生成一个热力点，放在地块中心
        const coordinate = calculatePolygonCenter(coordinates);

        if (coordinate) {
          let value: number;

          const { min, max } = dataRange.value;
          const range = max - min;

          switch (dataGenerationStrategy.value) {
            case 'clustered':
              // 聚集分布 - 某些地块热力值较高
              const isHotspot = Math.random() < 0.3; // 30%概率成为热点
              if (isHotspot) {
                // 热点区域: 在上60%的范围内生成
                value = min + range * 0.6 + Math.random() * range * 0.4;
              } else {
                // 普通区域: 在下40%的范围内生成
                value = min + Math.random() * range * 0.4;
              }
              break;

            case 'gradient':
              // 梯度分布 - 根据经度位置计算热力值
              const lonRatio = (coordinate[0] - 109.6875) / (110.56640625 - 109.6875);
              value = min + lonRatio * range + (Math.random() - 0.5) * range * 0.3;
              value = Math.max(min, Math.min(max, value)); // 确保在范围内
              break;

            default: // random
              value = min + Math.random() * range;
              break;
          }

          points.push({
            id: `point_${generatedCount}`,
            coordinate,
            value: Number(value.toFixed(dataRange.value.precision)), // 根据精度格式化
            weight: (value - min) / range, // 基于dataRange归一化为0-1
            metadata: {
              generated: true,
              strategy: dataGenerationStrategy.value,
              timestamp: Date.now(),
              landId: properties?.landId,
              landCode: properties?.landCode,
              landArea: properties?.landArea,
              baseId: properties?.baseId,
              featureIndex,
              polygonIndex: polyIndex,
              centerPoint: true, // 标记为中心点
              crs: 'CRS84'
            }
          });

          generatedCount++;
        }
      }
    });
  });

  heatPoints.value = points;

  // 根据用户选择验证或调整数据范围
  if (autoAdjustRange.value) {
    autoAdjustDataRange(points);
  } else {
    validateDataRange(points);
  }

  lastUpdateTime.value = new Date().toLocaleString();
  console.log(`生成了 ${points.length} 个地块中心热力点，策略: ${dataGenerationStrategy.value}`);
};

// 加载地块边界数据
const loadLandUnitData = async () => {
  try {
    // 使用地块单元数据文件
    const response = await fetch('/map-json/land-unit.geojson');
    const data = await response.json();

    boundaryData.value = {
      data,
      visible: showBoundaries.value,
      strokeColor: '#ffffff',
      strokeWidth: 1,
      fillColor: 'rgba(0, 0, 0, 0)'
    };

    // 基于地块数据生成热力点
    generateHeatPointsFromLandUnits(data);

    console.log('地块边界数据加载完成，地块数量:', data.features?.length || 0);
    console.log('坐标系:', data.crs?.properties?.name || 'CRS84');
  } catch (error) {
    console.error('加载地块数据失败:', error);
    // 如果加载失败，生成随机数据
    generateRandomData();
  }
};

// 射线投射算法检查点是否在多边形内
const isPointInPolygon = (point: [number, number], polygon: number[][]) => {
  const [x, y] = point;
  let inside = false;

  let j = polygon.length - 1;
  for (let i = 0; i < polygon.length; i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
    j = i;
  }

  return inside;
};

// 计算多边形的几何中心点（质心）
const calculatePolygonCenter = (coordinates: number[][]): [number, number] | null => {
  if (!coordinates || coordinates.length < 3) {
    return null;
  }

  let area = 0;
  let centroidX = 0;
  let centroidY = 0;

  // 使用多边形质心算法
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [x0, y0] = coordinates[i];
    const [x1, y1] = coordinates[i + 1];
    const a = x0 * y1 - x1 * y0;
    area += a;
    centroidX += (x0 + x1) * a;
    centroidY += (y0 + y1) * a;
  }

  area *= 0.5;
  if (Math.abs(area) < 1e-10) {
    // 如果面积为0，返回算术中心
    const sumX = coordinates.reduce((sum, coord) => sum + coord[0], 0);
    const sumY = coordinates.reduce((sum, coord) => sum + coord[1], 0);
    return [sumX / coordinates.length, sumY / coordinates.length];
  }

  centroidX /= 6 * area;
  centroidY /= 6 * area;

  // 验证质心是否在多边形内部，如果不在则使用边界框中心
  if (!isPointInPolygon([centroidX, centroidY], coordinates)) {
    const lngs = coordinates.map((coord) => coord[0]);
    const lats = coordinates.map((coord) => coord[1]);
    return [(Math.min(...lngs) + Math.max(...lngs)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
  }

  return [centroidX, centroidY];
};

// 在多边形内生成随机点
const generatePointInPolygon = (coordinates: number[][], maxAttempts = 100): [number, number] | null => {
  // 计算多边形边界框
  const lngs = coordinates.map((coord) => coord[0]);
  const lats = coordinates.map((coord) => coord[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // 尝试在边界框内随机生成点
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const lng = minLng + Math.random() * (maxLng - minLng);
    const lat = minLat + Math.random() * (maxLat - minLat);

    if (isPointInPolygon([lng, lat], coordinates)) {
      return [lng, lat];
    }
  }

  // 如果无法生成合适的点，返回中心点
  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;
  return [centerLng, centerLat];
};

// 验证数据范围是否合理，可选择性调整
const validateDataRange = (points: HeatPoint[]) => {
  if (points.length === 0) {
    return;
  }

  const values = points.map((p) => p.value);
  const actualMin = Math.min(...values);
  const actualMax = Math.max(...values);

  console.log(`生成数据范围: ${actualMin.toFixed(dataRange.value.precision)} - ${actualMax.toFixed(dataRange.value.precision)}`);
  console.log(`预设数据范围: ${dataRange.value.min.toFixed(dataRange.value.precision)} - ${dataRange.value.max.toFixed(dataRange.value.precision)}`);

  // 检查是否所有数据都在预设范围内
  const outOfRange = points.filter((p) => p.value < dataRange.value.min || p.value > dataRange.value.max);
  if (outOfRange.length > 0) {
    console.warn(`有 ${outOfRange.length} 个数据点超出预设范围`);
  }
};

// 自动调整数据范围（仅在需要时使用）
const autoAdjustDataRange = (points: HeatPoint[]) => {
  if (points.length === 0) {
    return;
  }

  const values = points.map((p) => p.value);
  const actualMin = Math.min(...values);
  const actualMax = Math.max(...values);

  // 添加一些缓冲，使分布更均匀
  const range = actualMax - actualMin;
  const buffer = range * 0.05; // 5% 缓冲

  dataRange.value.min = Math.max(0, actualMin - buffer);
  dataRange.value.max = actualMax + buffer;

  console.log(
    `数据范围自动调整为: ${dataRange.value.min.toFixed(dataRange.value.precision)} - ${dataRange.value.max.toFixed(dataRange.value.precision)}`
  );
};

// 基于地块数据生成热力点
const generateHeatPointsFromLandUnits = (geojsonData: any) => {
  const points: HeatPoint[] = [];

  if (geojsonData.features) {
    geojsonData.features.forEach((feature: any, index: number) => {
      const geometry = feature.geometry;
      const properties = feature.properties;

      // 处理不同的几何类型
      let polygons: number[][][] = [];

      if (geometry?.type === 'Polygon') {
        polygons = [geometry.coordinates[0]]; // 只使用外环
      } else if (geometry?.type === 'MultiPolygon') {
        // 对于多重多边形，处理每个子多边形
        polygons = geometry.coordinates.map((polygon: number[][][]) => polygon[0]);
      }

      polygons.forEach((coordinates, polyIndex) => {
        if (coordinates && coordinates.length > 3) {
          const area = properties?.landArea || 1;

          // 计算地块中心点坐标
          const centerCoordinate = calculatePolygonCenter(coordinates);

          if (centerCoordinate) {
            // 根据dataRange生成随机值
            const { min, max, precision } = dataRange.value;
            const range = max - min;
            const randomValue = min + Math.random() * range;

            points.push({
              id: `land_${properties?.landId || index}_${polyIndex}`,
              coordinate: centerCoordinate,
              value: Number(randomValue.toFixed(precision)), // 根据dataRange范围和精度
              weight: (randomValue - min) / range, // 基于dataRange归一化
              metadata: {
                landId: properties?.landId,
                landCode: properties?.landCode,
                landArea: area,
                baseId: properties?.baseId,
                fromLandUnit: true,
                polygonIndex: polyIndex,
                centerPoint: true, // 标记为中心点
                crs: 'CRS84'
              }
            });
          }
        }
      });
    });
  }

  heatPoints.value = points;

  // 根据用户选择验证或调整数据范围
  if (autoAdjustRange.value) {
    autoAdjustDataRange(points);
  } else {
    validateDataRange(points);
  }

  lastUpdateTime.value = new Date().toLocaleString();
  console.log(`基于地块数据生成了 ${points.length} 个中心热力点`);
};

// 从JSON数据加载热力值
const loadValueFromJson = async () => {
  try {
    // 检查是否已加载边界数据
    if (!boundaryData.value?.data?.features?.length) {
      ElMessage.warning('请先加载地块数据后再从JSON加载热力值');
      return;
    }

    console.log(`开始从 ${jsonDataUrl.value} 加载热力值数据...`);

    // 加载JSON数据
    const response = await fetch(jsonDataUrl.value);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const jsonData = await response.json();
    console.log(`成功加载JSON数据，包含 ${jsonData.length} 条记录`);

    // 创建地块ID映射表，便于快速查找
    const plotMap = new Map<string, any>();

    boundaryData.value.data.features.forEach((feature: any, featureIndex: number) => {
      const properties = feature.properties;
      const baseId = properties?.baseId;
      const plotId = properties?.landId; // 假设landId对应plotId

      if (baseId && plotId) {
        const key = `${baseId}_${plotId}`;
        plotMap.set(key, { feature, featureIndex, properties });
      }
    });

    console.log(`地块映射表构建完成，包含 ${plotMap.size} 个地块`);

    // 生成热力点
    const points: HeatPoint[] = [];
    let matchedCount = 0;
    let unmatchedCount = 0;

    jsonData.forEach((item: any, index: number) => {
      const { baseId, plotId, value } = item;
      const key = `${baseId}_${plotId}`;

      if (plotMap.has(key)) {
        const { feature, featureIndex, properties } = plotMap.get(key);
        const geometry = feature.geometry;

        // 处理不同的几何类型
        let polygons: number[][][] = [];

        if (geometry?.type === 'Polygon') {
          polygons = [geometry.coordinates[0]];
        } else if (geometry?.type === 'MultiPolygon') {
          polygons = geometry.coordinates.map((polygon: number[][][]) => polygon[0]);
        }

        polygons.forEach((coordinates, polyIndex) => {
          if (coordinates && coordinates.length > 3) {
            // 计算地块中心点坐标
            const centerCoordinate = calculatePolygonCenter(coordinates);

            if (centerCoordinate) {
              const { min, max, precision } = dataRange.value;
              const range = max - min;

              // 确保值在dataRange范围内
              let normalizedValue = value;
              if (autoAdjustRange.value) {
                // 如果自动调整范围，则直接使用原值
                normalizedValue = value;
              } else {
                // 如果不自动调整，则将值限制在dataRange范围内
                normalizedValue = Math.max(min, Math.min(max, value));
              }

              points.push({
                id: `json_${item.id || index}_${polyIndex}`,
                coordinate: centerCoordinate,
                value: Number(normalizedValue.toFixed(precision)),
                weight: range > 0 ? (normalizedValue - min) / range : 0.5, // 避免除零
                metadata: {
                  fromJson: true,
                  originalValue: value,
                  normalizedValue,
                  jsonItemId: item.id,
                  baseId,
                  plotId,
                  landId: properties?.landId,
                  landCode: properties?.landCode,
                  landArea: properties?.landArea,
                  featureIndex,
                  polygonIndex: polyIndex,
                  centerPoint: true,
                  crs: 'CRS84'
                }
              });

              matchedCount++;
            }
          }
        });
      } else {
        console.warn(`未找到匹配的地块: baseId=${baseId}, plotId=${plotId}`);
        unmatchedCount++;
      }
    });

    heatPoints.value = points;

    // 根据用户选择验证或调整数据范围
    if (autoAdjustRange.value) {
      autoAdjustDataRange(points);
    } else {
      validateDataRange(points);
    }

    lastUpdateTime.value = new Date().toLocaleString();

    console.log(`JSON热力值加载完成:`);
    console.log(`- 成功匹配: ${matchedCount} 个地块`);
    console.log(`- 未匹配: ${unmatchedCount} 个记录`);
    console.log(`- 生成热力点: ${points.length} 个`);

    ElMessage.success(`成功加载 ${matchedCount} 个地块的热力值数据`);
  } catch (error) {
    console.error('从JSON加载热力值失败:', error);
    ElMessage.error(`加载失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 清空数据
const clearData = () => {
  heatPoints.value = [];
  lastUpdateTime.value = '';
};

// 事件处理
const onMapLoaded = () => {
  console.log('热力图地图加载完成');
};

const onHeatDataChanged = (data: HeatPoint[]) => {
  console.log('热力数据已更新:', data.length, '个数据点');
};

const onConfigChanged = (config: HeatmapConfig) => {
  currentConfig.value = { ...config };
  heatmapConfig.value = { ...heatmapConfig.value, ...config };
  console.log('热力图配置已更新:', config);
};

// 更新配置方法
const updateConfig = (newConfig: Partial<HeatmapConfig>) => {
  currentConfig.value = { ...currentConfig.value, ...newConfig };
  heatmapConfig.value = { ...heatmapConfig.value, ...newConfig };
  console.log('配置更新:', newConfig);
};

// 切换边界显示
const toggleBoundary = () => {
  if (heatmapRef.value) {
    heatmapRef.value.toggleBoundary();
  }
};

// 处理边界显示切换
const handleToggleBoundary = () => {
  // 更新边界数据的visible属性
  if (boundaryData.value) {
    boundaryData.value.visible = showBoundaries.value;
  }

  // 调用组件的切换方法
  if (heatmapRef.value) {
    // 获取热力图实例并直接调用toggleBoundaryVisibility方法
    const instance = heatmapRef.value.getHeatmapInstance();
    if (instance) {
      instance.toggleBoundaryVisibility(showBoundaries.value);
    }
  }

  console.log(`边界显示状态切换为: ${showBoundaries.value}`);
};

// 组件挂载时初始化
onMounted(() => {
  // 首先尝试加载地块数据，失败则生成随机数据
  loadLandUnitData();
});
</script>

<style scoped>
.heatmap-demo-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.demo-header {
  background: #fff;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-header h2 {
  margin: 0;
  color: #303133;
}

.demo-controls {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #409eff;
  color: white;
}

.btn-primary:hover {
  background: #66b1ff;
}

.btn-secondary {
  background: #909399;
  color: white;
}

.btn-secondary:hover {
  background: #a6a9ad;
}

.btn-danger {
  background: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background: #f78989;
}

.btn-success {
  background: #67c23a;
  color: white;
}

.btn-success:hover {
  background: #85ce61;
}

.btn-info {
  background: #909399;
  color: white;
}

.btn-info:hover {
  background: #a6a9ad;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.panel-toggle-buttons {
  display: flex;
  gap: 5px;
  margin-left: 15px;
}

.demo-content {
  flex: 1;
  position: relative;
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
  height: 40px;
  padding: 5px 15px;
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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin: 0;
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

/* 面板内容样式 */
.custom-controls {
  min-width: 250px;
}

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

/* 统计面板样式 */
.custom-stats {
  min-width: 280px;
}

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

.data-distribution h5 {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.distribution-bars {
  display: flex;
  height: 40px;
  gap: 2px;
  align-items: flex-end;
}

.distribution-bar {
  flex: 1;
  background: linear-gradient(to top, #409eff, #66b1ff);
  border-radius: 2px 2px 0 0;
  min-height: 5px;
  cursor: pointer;
}

/* 数据信息面板 */
.info-item {
  margin-bottom: 10px;
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

.generation-options {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.generation-options h5 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.option-item {
  margin-bottom: 8px;
  font-size: 13px;
}

.option-item input[type='radio'] {
  margin-right: 6px;
}

.option-item input[type='range'] {
  width: 60%;
  margin: 0 8px;
}

/* JSON数据源配置样式 */
.json-data-config {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.json-data-config h5 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.config-item {
  margin-bottom: 10px;
}

.config-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.url-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
}

.url-input:focus {
  outline: none;
  border-color: #409eff;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.config-note {
  margin-top: 5px;
}

.config-note small {
  color: #909399;
  font-size: 11px;
}
</style>
