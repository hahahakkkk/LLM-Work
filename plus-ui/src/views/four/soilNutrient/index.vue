<script setup>
import SplitBox from '@/views/powland/commponents/SplitBox.vue';
import PointList from './PointList.vue';
import { useMap } from '@/views/powland/hooks/map';
import { geoList } from '@/views/powland/api/point';

import { onMounted, onUnmounted } from 'vue';

const { initMap, locate, collectPoint } = useMap();

onMounted(async () => {
  initMap();
  const points = await geoList();
  collectPoint.addPointLayer(points);
});

/**
 * 添加采样点完成后将采样点添加到地图
 * @param lng 经度
 * @param lat 纬度
 * @param id
 * @param name
 */
function addPointHandle(lng, lat, id, code) {
  collectPoint.addPoint([lng, lat], id, code);
}

/**
 * 删除采样点完成后将采样点添加到地图
 * @param lng
 * @param lat
 * @param id
 */
function delPointHandle(id) {
  collectPoint.removePoint(id);
}

/**
 * 定位
 * @param id 采样点ID
 */
function locateHandle(id) {
  locate(id, 'point');
}
</script>
<template>
  <SplitBox asideWidth="50%">
    <template v-slot:aside>
      <PointList @addPoint="addPointHandle" @delPoint="delPointHandle" @pointLocate="locateHandle" />
    </template>
    <template v-slot:main>
      <div id="map"></div>
    </template>
  </SplitBox>
</template>
<style scoped>
#map {
  width: 100%;
  height: 100%;
}
</style>
