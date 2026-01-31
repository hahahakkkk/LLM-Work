<template>
  <div class="map-container" ref="mapRef">
    <div class="layer-control-wrapper" v-if="showLayerControl">
      <LayerControl
        :geodata="geodata"
        @toggle-visibility="handleToggleVisibility"
        @zoom-to-layer="handleZoomToLayer"
        @update-z-index="handleUpdateZIndex"
      />
    </div>
    <!-- <div class="map-control-buttons">
            <el-button
                type="primary"
                circle
                size="small"
                title="图层"
                @click="showLayerControl = !showLayerControl"
            >
                <i class="el-icon-menu"></i>
            </el-button>
        </div> -->
    <div class="legend left">
      <slot name="leftLegend"></slot>
    </div>
    <div class="legend right">
      <slot name="rightLegend"></slot>
    </div>
    <!-- 地图图例组件 -->
    <MapLegend
      v-for="(legendData, index) in legends"
      :key="index"
      :title="legendData.title"
      :items="legendData.items"
      :position="legendData.position"
      :backgroundColor="legendData.backgroundColor"
    />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useMzMap, StyleProfile } from './MzMap';
import { Stroke } from 'ol/style';
import type { GeoData } from './MzMap';
import LayerControl from './LayerControl.vue';
import MapLegend from './MapLegend.vue';
import type { LegendItem } from './MapLegend.vue';
import { useHeaderStore } from '@/store/headerStore';

// 图例数据类型定义
export interface LegendData {
  title?: string;
  items: LegendItem[];
  position?: {
    horizontal?: string | number;
    vertical?: string | number;
  };
  backgroundColor?: string;
}

const headerStore = useHeaderStore();
const mapRef = ref(null);
const showLayerControl = ref(false);

// 定义组件属性
const props = defineProps<{
  baseName?: string;
  // GeoJSON数据数组
  geodata?: GeoData[];
  // 图例数据数组
  legends?: LegendData[];
  // 基地图层边界颜色
  mzBaseStrokeColor?: string;
  // 基地图层边界宽度
  mzBaseStrokeWidth?: number;
}>();

// 暴露可被调用的方法
/*
            updateLayerEmitEvent,
        updateLayersEmitEvent,
    */
defineExpose({
  locate,
  zoomToLayer,
  updateLayerVisibility,
  updateLayersVisibility,
  updateLayerZIndex,
  updateLayersZIndex,
  clearAllLayers,
  toggleLayerControl,
  getLayerById
});

// 声明事件
const emit = defineEmits(['map-loaded', 'feature-click', 'feature-right-click']);

let mzMap: ReturnType<typeof useMzMap>;

/**
 * 定位到指定基地
 * @param name 基地名
 */
function locate(name: string) {
  mzMap.basePointLocate(name);
}

/**
 * 定位到指定图层
 * @param id 图层ID
 */
function zoomToLayer(id: string) {
  mzMap.zoomToLayer(id);
}

/**
 * 更新图层可见性
 * @param id 图层ID
 * @param visible 是否可见
 */
function updateLayerVisibility(id: string, visible: boolean) {
  mzMap.updateLayerVisibility(id, visible);
}

/**
 * 更新所有图层可见性
 */
function updateLayersVisibility(geoDataArray: GeoData[]) {
  mzMap.updateLayersVisibility(geoDataArray);
}

/**
 * 更新图层的zIndex
 * @param id 图层ID
 * @param zIndex zIndex值
 */
function updateLayerZIndex(id: string, zIndex: number) {
  mzMap.updateLayerZIndex(id, zIndex);
}

/**
 * 更新所有图层的zIndex
 */
function updateLayersZIndex(geoDataArray: GeoData[]) {
  mzMap.updateLayersZIndex(geoDataArray);
}

/**
 * 清除所有图层
 */
function clearAllLayers() {
  mzMap.clearAllLayers();
}

/**
 * 切换图层控制面板显示状态
 */
function toggleLayerControl(show?: boolean) {
  if (show !== undefined) {
    showLayerControl.value = show;
  } else {
    showLayerControl.value = !showLayerControl.value;
  }
}

/**
 * 根据ID获取图层
 * @param id 图层ID
 */
function getLayerById(id: string) {
  return mzMap.getLayerById(id);
}

/**
 * 处理图层可见性切换事件
 */
function handleToggleVisibility(event: { id: string; visible: boolean }) {
  updateLayerVisibility(event.id, event.visible);
}

/**
 * 处理图层定位事件
 */
function handleZoomToLayer(id: string) {
  zoomToLayer(id);
}

/**
 * 处理图层zIndex更新事件
 */
function handleUpdateZIndex(event: { id: string; zIndex: number }) {
  updateLayerZIndex(event.id, event.zIndex);
}

// 监听GeoJSON数据变化
watch(
  () => props.geodata,
  (newGeoData) => {
    if (mzMap && newGeoData && newGeoData.length > 0) {
      mzMap.loadGeoData(newGeoData);
    }
  },
  { deep: true }
);
const maploaded = () => {
  // console.log("###################");
  if (props.baseName) mzMap.basePointLocate(props.baseName);
  emit('map-loaded', mzMap);
  //切换加
  // console.log(headerStore.baseName)
  if (headerStore.baseName) {
    mzMap.basePointLocate(headerStore.baseName);
  }
};

onMounted(() => {
  // 创建自定义样式配置
  let customStyleProfile: StyleProfile | null = null;
  if (props.mzBaseStrokeColor || props.mzBaseStrokeWidth !== undefined) {
    customStyleProfile = new StyleProfile();
    customStyleProfile.mzBaseStroke = new Stroke({
      color: props.mzBaseStrokeColor || 'rgba(255,0,0,0.9)',
      width: props.mzBaseStrokeWidth !== undefined ? props.mzBaseStrokeWidth : 1 // 默认宽度1
    });
  }

  // 使用自定义样式配置初始化地图
  mzMap = useMzMap(mapRef.value, maploaded, customStyleProfile);

  // 设置点击监听
  mzMap.setClickListener((eventData) => {
    // 直接发射点击事件，eventData已经包含所有需要的信息
    emit('feature-click', eventData);
  });

  // 加载初始GeoJSON数据
  if (props.geodata && props.geodata.length > 0) {
    mzMap.loadGeoData(props.geodata);
  }

  //设置右单击
  mzMap.setRightClickListener((data) => {
    emit('feature-right-click', data);
  });
});
</script>
<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.legend {
  position: absolute;
  bottom: 30px;
  z-index: 100000;
  color: #000;
}
.left {
  left: 10px;
}
.right {
  right: 10px;
}
.legend {
  font-size: 8pt;
}
.layer-control-wrapper {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}
.map-control-buttons {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
}
.map-control-buttons .el-button {
  margin-right: 5px;
}
</style>
