<template>
  <div class="satellite-map-container">
    <MzMap
      ref="mapRef"
      :geodata="styledGeoData"
      :base-name="localBaseName"
      :legends="mapLegends"
      @map-loaded="onMapLoaded"
      @feature-click="onFeatureClick"
    />
    <div v-if="loading" class="map-loading">地图加载中...</div>
    <div v-if="error" class="map-error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import MzMap from '@/components/Map/MzMap.vue';
import type { GeoData } from '@/components/Map/MzMap';
import type { LegendData } from '@/components/Map/MzMap.vue';
import { Style, Fill, Stroke, Text } from 'ol/style';

// 定义组件属性
const props = defineProps<{
  geoData?: GeoData[];
  baseName?: string;
  loading?: boolean;
  error?: string;
  growthData?: Record<string, string>; // 新增属性：长势数据，key为地块ID，value为长势等级
}>();

// 定义事件发射器
const emit = defineEmits<{
  (e: 'mapLoaded', mapInstance: any): void;
  (e: 'featureClick', eventData: any): void;
}>();

const mapRef = ref();
const localGeoData = ref<GeoData[]>([]);
const localBaseName = ref(props.baseName || '侯家沟数字化种植基地');

// 定义长势等级到颜色的映射
const growthLevelColorMap = {
  '良好': 'rgb(0,128,0)',
  '正常': 'rgb(0, 200, 0)',
  '较差': 'rgb(184,224,111)'
};

// 定义长势图例，放在左下部
const mapLegends = ref<LegendData[]>([
  {
    title: '长势',
    items: [
      {
        label: '良好',
        style: { backgroundColor: 'rgb(0,128,0)' },
        labelColor: '#000'
      },
      {
        label: '正常',
        style: { backgroundColor: 'rgb(0, 200, 0)' },
        labelStyle: {
          color: '#000'
        }
      },
      {
        label: '较差',
        style: { backgroundColor: 'rgb(184,224,111)' },
        labelColor: '#000'
      }
    ],
    position: {
      horizontal: '1%',
      vertical: '75%'
    },
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  }
]);

// 计算带有长势信息的GeoData
const styledGeoData = computed<GeoData[]>(() => {
  // 如果没有传入长势数据，则使用随机颜色填充地块（演示用途）
  const hasGrowthData = props.growthData && Object.keys(props.growthData).length > 0;
  console.log('是否有长势数据:', hasGrowthData);
  if (hasGrowthData) {
    console.log('长势数据内容:', props.growthData);
  }

  return localGeoData.value.map((layer) => {
    // 特别处理地块边界图层
    if (layer.id === 'land_unit_boundary') {
      return {
        ...layer,
        customStyle: (feature: any) => {
          const landId = feature.get('landId');
          const landCode = feature.get('landCode');
          // 先尝试通过 landId 获取长势数据，如果没有则尝试通过 landCode 获取
          const growthLevel = props.growthData?.[landId] || props.growthData?.[landCode];

          // console.log('地块ID:', landId, '长势等级:', growthLevel);

          // 根据长势等级设置颜色
          let color = 'rgba(150, 150, 150, 0.6)'; // 默认颜色（改为有透明度的灰色）

          if (hasGrowthData && growthLevel && growthLevelColorMap[growthLevel as keyof typeof growthLevelColorMap]) {
            // 使用实际的长势数据颜色
            color = growthLevelColorMap[growthLevel as keyof typeof growthLevelColorMap];
            // console.log('使用长势颜色:', color, '地块ID:', landId, '地块编码:', landCode);
          }

          return new Style({
            fill: new Fill({ color }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.8)',
              width: 1.5
            }),
            text: new Text({
              font: '12px 微软雅黑',
              fill: new Fill({ color: '#000' }),
              stroke: new Stroke({ color: '#fff', width: 2 }),
              text: landCode || ''
            })
          });
        }
      };
    }
    return layer;
  });
});

// 初始化地块边界图层
const initLandUnitLayer = async () => {
  try {
    // 加载地块边界GeoJSON数据
    const landUnitResponse = await fetch('/map-json/land-unit.geojson');
    if (!landUnitResponse.ok) {
      console.error('获取地块边界GeoJSON数据失败，HTTP状态码:', landUnitResponse.status);
      return;
    }

    const landUnitData = await landUnitResponse.json();

    // 构建地块边界图层
    const landUnitLayer: GeoData = {
      id: 'land_unit_boundary',
      name: '地块边界',
      type: 'polygon',
      data: landUnitData,
      visible: true,
      zIndex: 10,
      minDisplayZoom: 15,
      emitEvent: true,
      emitRightClickEvent: true,
      updateWhileAnimating: false,
      updateWhileInteracting: false
    };

    // 合并传入的geoData和地块边界图层
    if (props.geoData && props.geoData.length > 0) {
      localGeoData.value = [...props.geoData, landUnitLayer];
    } else {
      localGeoData.value = [landUnitLayer];
    }
  } catch (error) {
    console.error('加载地块边界数据失败:', error);
  }
};

// 监听geoData变化
watch(
  () => props.geoData,
  (newVal) => {
    if (newVal) {
      // 重新初始化图层以确保地块边界图层存在
      initLandUnitLayer();
    }
  },
  { deep: true }
);

// 监听baseName变化
watch(
  () => props.baseName,
  (newVal) => {
    if (newVal) {
      localBaseName.value = newVal;
    }
  }
);

// 监听长势数据变化
watch(
  () => props.growthData,
  (newVal) => {
    // 当长势数据发生变化时，触发重新渲染
    // 由于使用了computed属性styledGeoData，这里不需要做额外处理
    console.log('长势数据变化:', newVal);
    console.log('是否有长势数据:', newVal && Object.keys(newVal).length > 0);
  },
  { deep: true }
);

// 地图加载完成回调
const onMapLoaded = (mapInstance: any) => {
  emit('mapLoaded', mapInstance);
};

// 地图要素点击回调
const onFeatureClick = (eventData: any) => {
  emit('featureClick', eventData);
};

// 组件挂载时初始化地块边界图层
onMounted(() => {
  initLandUnitLayer();
});

// 暴露方法给父组件
defineExpose({
  mapRef
});
</script>

<style scoped lang="scss">
.satellite-map-container {
  width: 100%;
  height: 100%;
  position: relative;

  :deep(.map-container) {
    width: 100%;
    height: 100%;
  }

  .map-loading,
  .map-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 100;
    background: rgba(255, 255, 255, 0.8);
    padding: 10px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .map-error {
    color: #f56c6c;
  }
}
</style>
