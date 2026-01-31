<template>
  <el-card shadow="never">
    <template #header>
      <div class="flex justify-between items-center">
        <span>灾害分布地图</span>
        <el-select v-model="activeDisasterType" placeholder="选择灾害类型" @change="loadDisasterPoints">
          <el-option label="旱灾" value="drought" />
          <el-option label="洪涝" value="flood" />
          <el-option label="冰雹灾害" value="hail" />
        </el-select>
      </div>
    </template>
    <div id="disasterMap" style="height: 500px"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fromLonLat } from 'ol/proj';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import { Style, Fill, Stroke, Text, Circle as CircleStyle } from 'ol/style';
//import { useAxios } from '@/hooks/useAxios';

const { proxy } = getCurrentInstance();
const activeDisasterType = ref('drought');
let baseMap: Map;
let disasterLayer: VectorLayer<VectorSource>;

const disasterColorMap: Record<string, Record<string, string>> = {
  drought: {
    '轻旱': '#ffffcc',
    '中旱': '#ffcc00',
    '重旱': '#ff6600',
    '极旱': '#cc0000'
  },
  flood: {
    '一般洪涝': '#cceeff',
    '较大洪涝': '#3399ff',
    '重大洪涝': '#0033cc',
    '特别重大洪涝': '#800080'
  },
  hail: {
    '轻度冰雹': '#e0e0e0',
    '中度冰雹': '#a0a0a0',
    '重度冰雹': '#606060',
    '特重冰雹': '#000000'
  }
};

function initDisasterMap() {
  disasterLayer = new VectorLayer({
    source: new VectorSource()
  });

  baseMap = new Map({
    target: 'disasterMap',
    layers: [new TileLayer({ source: new OSM() }), disasterLayer],
    view: new View({
      center: fromLonLat([110.3, 37.75]),
      zoom: 10
    })
  });
}
import axios from 'axios';

async function loadDisasterPoints() {
  const res = await axios.get('/api/disaster/map-points', {
    params: { type: activeDisasterType.value }
  });

  const source = disasterLayer.getSource();
  source.clear();

  res.data.forEach((base: any) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([base.lon, base.lat]))
    });

    const color = disasterColorMap[activeDisasterType.value]?.[base.level] || '#999999';

    feature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        }),
        text: new Text({
          text: `${base.name}\n(${base.level})`,
          font: '12px 微软雅黑',
          offsetY: -20,
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 3 })
        })
      })
    );

    source.addFeature(feature);
  });
}

onMounted(() => {
  initDisasterMap();
  loadDisasterPoints();
});
</script>

<style scoped>
#disasterMap {
  width: 100%;
  border: 1px solid #ccc;
}
</style>
