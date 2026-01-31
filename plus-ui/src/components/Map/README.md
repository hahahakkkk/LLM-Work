# MzMap 组件使用指南

MzMap是一个基于OpenLayers的地图组件，提供了丰富的地图展示和交互功能，适用于各类地理信息系统应用场景。

## 功能特点

- 支持多种GeoJSON数据图层加载和管理
- 提供图层控制面板，可切换图层可见性
- 支持基地点位定位
- 支持图层缩放和定位
- 自定义图层样式渲染
- 事件监听（点击、右键点击）
- 图例显示支持（自定义样式和位置）
- 缩放级别控制（控制图层在不同缩放级别下的显示）

## 组件属性

| 属性名   | 类型         | 描述                              | 是否必填 |
| -------- | ------------ | --------------------------------- | -------- |
| baseName | string       | 初始化时需要定位的基地名称        | 否       |
| geodata  | GeoData[]    | GeoJSON数据数组，用于加载地图图层 | 否       |
| legends  | LegendData[] | 图例数据数组，用于显示地图图例    | 否       |

## 事件

| 事件名              | 参数      | 描述                                         |
| ------------------- | --------- | -------------------------------------------- |
| map-loaded          | map实例   | 地图加载完成时触发                           |
| feature-click       | eventData | 图层元素被点击时触发，包含被点击要素信息     |
| feature-right-click | eventData | 图层元素被右键点击时触发，包含被点击要素信息 |

## 插槽

| 插槽名      | 描述               |
| ----------- | ------------------ |
| leftLegend  | 地图左下角图例内容 |
| rightLegend | 地图右下角图例内容 |

## 方法

| 方法名                 | 参数                         | 返回值 | 描述                     |
| ---------------------- | ---------------------------- | ------ | ------------------------ |
| locate                 | name: string                 | void   | 定位到指定基地名称       |
| zoomToLayer            | id: string                   | void   | 缩放至指定图层范围       |
| updateLayerVisibility  | id: string, visible: boolean | void   | 更新指定图层的可见性     |
| updateLayersVisibility | geoDataArray: GeoData[]      | void   | 批量更新图层可见性       |
| updateLayerZIndex      | id: string, zIndex: number   | void   | 更新指定图层的显示顺序   |
| updateLayersZIndex     | geoDataArray: GeoData[]      | void   | 批量更新图层显示顺序     |
| clearAllLayers         | 无                           | void   | 清除所有图层             |
| toggleLayerControl     | show?: boolean               | void   | 切换图层控制面板显示状态 |

## GeoData 数据格式

```typescript
interface GeoData {
  id: string; // 图层唯一标识
  name: string; // 图层名称
  type: string; // 图层类型，如 'point', 'line', 'polygon' 等
  data: any; // GeoJSON格式数据
  visible: boolean; // 是否可见
  zIndex?: number; // Z方向显示顺序值，可选
  emitEvent?: boolean; // 是否发射点击事件，可选，默认为false
  emitRightClickEvent?: boolean; // 是否发射右单击事件，可选，默认为false
  customStyle?: (feature: any) => Style; // 自定义渲染样式函数，可选
  updateWhileAnimating?: boolean; // 动画期间是否更新，可选，默认为false
  updateWhileInteracting?: boolean; // 交互期间是否更新，可选，默认为false
  minDisplayZoom?: number; // 图层显示的最小缩放级别，可选，低于此级别时图层不显示
}
```

## LegendData 数据格式

图例数据格式定义：

```typescript
interface LegendData {
  title?: string; // 图例标题
  items: LegendItem[]; // 图例项目数组
  position?: {
    // 图例位置，可以使用像素值或百分比
    horizontal?: string | number; // 水平位置
    vertical?: string | number; // 垂直位置
  };
  backgroundColor?: string; // 图例背景颜色
}

interface LegendItem {
  label: string; // 图例标签文本
  style: Record<string, string>; // 图例符号样式
  labelColor?: string; // 标签文字颜色
  labelStyle?: Record<string, string>; // 标签样式对象
}
```

## 使用示例

### 基本用法

```vue
<template>
  <div class="map-wrapper">
    <MzMap ref="mapRef" :geodata="mapLayers" @map-loaded="handleMapLoaded" @feature-click="handleFeatureClick">
      <template #leftLegend>
        <!-- 左侧图例内容 -->
        <div class="legend-item">
          <div class="legend-color" style="background-color: red;"></div>
          <span>重要位置</span>
        </div>
      </template>
    </MzMap>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import MzMap from '@/components/Map/MzMap.vue';
import type { GeoData } from '@/components/Map/MzMap';

const mapRef = ref(null);
const mapLayers = ref<GeoData[]>([]);

onMounted(async () => {
  // 获取GeoJSON数据
  const response = await fetch('/api/geojson/data');
  const geoJsonData = await response.json();

  // 创建图层数据
  mapLayers.value = [
    {
      id: 'layer1',
      name: '点位图层',
      type: 'point',
      data: geoJsonData,
      visible: true,
      zIndex: 10,
      emitEvent: true,
      minDisplayZoom: 14 // 设置最小显示缩放级别为14
    }
  ];
});

const handleMapLoaded = (map) => {
  console.log('地图加载完成', map);
  // 可以在这里进行地图实例的相关操作
};

const handleFeatureClick = (eventData) => {
  console.log('点击了要素:', eventData);
  // 处理要素点击事件
};
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 500px;
}
.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.legend-color {
  width: 16px;
  height: 16px;
  margin-right: 5px;
}
</style>
```

### 使用图例组件

```vue
<template>
  <div class="map-wrapper">
    <MzMap ref="mapRef" :geodata="mapLayers" :legends="mapLegends" @map-loaded="handleMapLoaded" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import MzMap from '@/components/Map/MzMap.vue';
import type { GeoData, LegendData } from '@/components/Map/MzMap';

const mapRef = ref(null);
const mapLayers = ref<GeoData[]>([
  // ...地图图层数据
]);

// 定义图例数据
const mapLegends = ref<LegendData[]>([
  {
    title: '土壤类型图例',
    items: [
      {
        label: '红壤',
        style: { backgroundColor: '#ff0000' },
        labelColor: '#ff0000' // 红色文本
      },
      {
        label: '黄壤',
        style: { backgroundColor: '#ffff00' }
      },
      {
        label: '黑土',
        style: { backgroundColor: '#333333' },
        labelStyle: {
          color: '#444444',
          fontWeight: 'bold'
        }
      }
    ],
    position: {
      horizontal: 10,
      vertical: 10
    },
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  },
  {
    title: '耕地利用图例',
    items: [
      {
        label: '耕地',
        style: { backgroundColor: '#00ff00', borderRadius: '50%' }
      },
      {
        label: '建设用地',
        style: { backgroundColor: '#888888', borderRadius: '50%' }
      }
    ],
    position: {
      horizontal: '80%',
      vertical: 10
    }
  }
]);
</script>
```

### 使用自定义样式

```typescript
// 创建一个带有自定义渲染函数的图层
const populationLayer = {
  id: 'population',
  name: '人口密度',
  type: 'polygon',
  data: populationGeoJson,
  visible: true,
  zIndex: 5,
  minDisplayZoom: 10, // 设置最小显示缩放级别
  // 自定义渲染函数
  customStyle: (feature) => {
    // 根据人口密度值设置不同颜色
    const density = feature.get('population') / feature.get('area');
    let color;

    if (density > 1000) {
      color = 'rgba(255, 0, 0, 0.6)'; // 红色 - 高密度
    } else if (density > 500) {
      color = 'rgba(255, 165, 0, 0.6)'; // 橙色 - 中高密度
    } else if (density > 200) {
      color = 'rgba(255, 255, 0, 0.6)'; // 黄色 - 中密度
    } else if (density > 50) {
      color = 'rgba(144, 238, 144, 0.6)'; // 浅绿色 - 中低密度
    } else {
      color = 'rgba(0, 128, 0, 0.6)'; // 绿色 - 低密度
    }

    return new Style({
      fill: new Fill({ color }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.8)',
        width: 1
      }),
      text: new Text({
        font: '12px 微软雅黑',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#fff', width: 2 }),
        text: feature.get('name') || '',
        offsetY: -15
      })
    });
  }
};

// 将图层添加到图层数组中
mapLayers.value.push(populationLayer);
```

### 使用缩放级别控制图层显示

```typescript
// 创建一个采样点图层，只在高缩放级别显示
const samplingPointLayer = {
  id: 'sampling_point',
  name: '采样点',
  type: 'point',
  data: samplingPointData,
  visible: true,
  zIndex: 10,
  emitEvent: true,
  emitRightClickEvent: true,
  minDisplayZoom: 16, // 只在缩放级别大于等于16时显示
  customStyle: (feature) => {
    return new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.7)'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      }),
      text: new Text({
        font: '12px 微软雅黑',
        text: feature.get('pointCode') || '',
        offsetY: -15,
        fill: new Fill({
          color: '#333'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 3
        })
      })
    });
  }
};

// 创建一个地块图层，在所有缩放级别显示
const landUnitLayer = {
  id: 'land_unit',
  name: '地块信息',
  type: 'polygon',
  data: landUnitData,
  visible: true,
  zIndex: 9,
  emitEvent: true,
  emitRightClickEvent: true,
  // 未设置minDisplayZoom，表示所有缩放级别都显示
  customStyle: (feature) => {
    // 自定义样式...
  }
};

// 将图层添加到图层数组中
mapLayers.value.push(samplingPointLayer);
mapLayers.value.push(landUnitLayer);
```

### 方法调用示例

```typescript
// 引用MzMap组件
const mapRef = ref(null);

// 定位到指定基地
function locateToBase(baseName) {
  mapRef.value.locate(baseName);
}

// 缩放到指定图层
function focusOnLayer(layerId) {
  mapRef.value.zoomToLayer(layerId);
}

// 更新图层可见性
function toggleLayerVisibility(layerId, visible) {
  mapRef.value.updateLayerVisibility(layerId, visible);
}

// 清除所有图层
function clearMap() {
  mapRef.value.clearAllLayers();
}

// 显示/隐藏图层控制面板
function showLayerPanel(show) {
  mapRef.value.toggleLayerControl(show);
}
```

## 注意事项

1. 确保在使用前引入所需的OpenLayers样式
2. GeoJSON数据应使用WGS84坐标系统 (EPSG:4326)
3. 图层ID必须唯一，用于图层标识和操作
4. 对于大量数据的图层，建议设置 `updateWhileAnimating` 和 `updateWhileInteracting` 为 false，以提高性能
5. 自定义样式渲染函数应返回有效的OpenLayers Style对象
6. 图例位置可以使用像素值（如：10）或百分比值（如："80%"）来设置
7. 使用 `minDisplayZoom` 属性可以控制图层在不同缩放级别下的显示，帮助优化地图性能
8. 地图缩放级别通常在0-19之间，值越大表示缩放越深（地图显示越详细）
9. 当用户放大地图至设定的 `minDisplayZoom` 级别或更高时，图层才会显示
