:src/views/process/growth/dynamics/components/Result2Map.vue
<template>
  <div id="map" ref="mapContainer"></div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, onMounted } from 'vue';
import { useMap } from '@/views/powland/hooks/map';
const { initMap, collectPoint } = useMap(); // 使用 collectPoint 接口

const props = defineProps({
  result: {
    type: Array as PropType<ModelProcessResult[]>,
    default: () => []
  },
  locationTarget: {
    type: Object as PropType<{ lng: number; lat: number } | null>,
    default: null
  }
});

const mapContainer = ref<HTMLElement | null>(null);
const mapInitialized = ref(false);
const tempPointId = ref<string | null>(null); // 临时点ID

// 初始化地图
onMounted(() => {
  if (mapContainer.value) {
    initMap();
    mapInitialized.value = true;
    console.log('地图初始化完成');
  }
});

// 定位函数
function locateToCoordinates(coords: [number, number]) {
  if (!mapInitialized.value) {
    console.warn('定位失败：地图未初始化');
    return;
  }

  try {
    // 清除上一次的临时点
    if (tempPointId.value) {
      collectPoint.removePoint(tempPointId.value);
      tempPointId.value = null;
    }

    // 创建新的临时点ID
    const newPointId = `temp-location-${Date.now()}`;

    // 添加临时点实现定位
    collectPoint.addPoint(coords, newPointId, '定位点');
    tempPointId.value = newPointId;

    console.log('定位成功', coords);
  } catch (error) {
    console.error('定位过程中出错:', error);
  }
}

// 监听定位目标变化
watch(
  () => props.locationTarget,
  (newTarget) => {
    if (newTarget) {
      locateToCoordinates([newTarget.lng, newTarget.lat]);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
  min-height: 500px;
  min-width: 200px;
}
</style>
