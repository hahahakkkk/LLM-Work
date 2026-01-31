<template>
  <MzMap ref="map" :geodata="mapGeodata" :mz-base-stroke-color="baseStrokeColor" @map-loaded="onMapLoaded" @feature-click="getLandUnitProperty">
    <template #leftLegend>
      <!--      <button @click="locate">定位到指定基地</button>-->
      <div class="box">
        <ul>
          <li>
            <div>正常区域</div>
            <div :style="`background-color: ${WarningLevel.getColor(WarningLevel.NORMAL)}`"></div>
          </li>
          <li>
            <div>{{ levelLabels.minor }}</div>
            <div :style="`background-color: ${WarningLevel.getColor(WarningLevel.MINOR)}`"></div>
          </li>
          <li>
            <div>{{ levelLabels.medium }}</div>
            <div :style="`background-color: ${WarningLevel.getColor(WarningLevel.MEDIUM)}`"></div>
          </li>
          <li>
            <div>{{ levelLabels.severe }}</div>
            <div :style="`background-color: ${WarningLevel.getColor(WarningLevel.SEVERE)}`"></div>
          </li>
          <li>
            <div>{{ levelLabels.extreme }}</div>
            <div :style="`background-color: ${WarningLevel.getColor(WarningLevel.EXTREME)}`"></div>
          </li>
        </ul>
      </div>
    </template>
  </MzMap>
</template>

<script setup lang="ts">
/* eslint-disable */
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import MzMap from '@/components/Map/MzMap.vue';
import { Style, Fill, Stroke, Text } from '@/components/Map/MzMap';
import { regionDict, WarningLevel } from '@/components/DisasterWarning/RegionProps.ts';

// 接收父组件传递的配置
const props = defineProps({
  alertData: {
    type: Array,
    default: () => []
  },
  // 基地边界颜色
  baseStrokeColor: {
    type: String,
    default: 'rgba(0,0,0,0.5)'
  },
  // 预警级别标签配置
  levelLabels: {
    type: Object,
    default: () => ({
      minor: '轻度预警',
      medium: '中度预警',
      severe: '重度预警',
      extreme: '极度预警'
    })
  },
  // 点击事件文案配置
  clickLabels: {
    type: Object,
    default: () => ({
      levelLabel: '预警级别',
      contentLabel: '预警内容'
    })
  },
  // 调试标识
  debugPrefix: {
    type: String,
    default: 'Base'
  }
});

// 添加调试日志
console.log(`${props.debugPrefix} SoilFertilityMap 组件初始化，接收到的 props.alertData:`, props.alertData);

const map = ref(null);

// 基于预警数据创建区域-预警级别映射
const regionWarningMap = computed(() => {
  const map = {};

  // 默认所有区域为正常状态
  Object.keys(regionDict).forEach((regionId) => {
    map[regionId] = WarningLevel.NORMAL; // 使用枚举值
  });

  // 根据预警数据更新状态
  if (props.alertData && props.alertData.length > 0) {
    props.alertData.forEach((alert) => {
      if (alert.region && alert.warningLevel !== undefined) {
        // 将原始预警级别转换为WarningLevel枚举
        const warningLevelEnum = WarningLevel.fromWarningLevelInt(alert.warningLevel);

        // 如果同一区域有多个预警，取级别最高的（数字最大的）
        const currentLevel = map[alert.region] || WarningLevel.NORMAL;
        if (!map[alert.region] || warningLevelEnum > currentLevel) {
          map[alert.region] = warningLevelEnum;
        }
      }
    });
  }

  return map;
});

const normalizeRegionName = (value?: string | null) => {
  if (!value) return '';
  return value
    .replace(/[()（）]/g, '')
    .replace(/基地/g, '')
    .trim();
};

const resolveRegionIdByName = (regionName) => {
  if (!regionName) return null;
  const normalizedTarget = normalizeRegionName(regionName);
  for (const [id, name] of Object.entries(regionDict)) {
    const normalizedCandidate = normalizeRegionName(name);
    if (regionName === name || normalizedTarget === normalizedCandidate) {
      return id;
    }
  }
  return null;
};

const createFeatureStyle = (feature) => {
  const regionCode = feature.get('regionCode') ?? resolveRegionIdByName(feature.get('NAME'));
  const warningLevelEnum = regionCode ? (regionWarningMap.value[String(regionCode)] ?? WarningLevel.DEFAULT) : WarningLevel.DEFAULT;
  const fillColor = WarningLevel.getColor(warningLevelEnum);
  const label = feature.get('shortName') || feature.get('baseName') || feature.get('NAME') || '';

  const versionPayload = { regionCode, warning: warningLevelEnum };
  const currentDataVersion = JSON.stringify(versionPayload);
  const lastVersion = feature.get('__dataVersion');
  if (lastVersion !== currentDataVersion) {
    feature.set('__dataVersion', currentDataVersion);
    feature.changed();
  }

  return new Style({
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({ color: fillColor, width: 2 }),
    text: new Text({
      font: '14px 微软雅黑,Calibri,sans-serif',
      fill: new Fill({ color: '#000' }),
      stroke: new Stroke({ color: '#fff', width: 3 }),
      text: label
    })
  });
};

// 地图数据配置
const mapGeodata = ref([
  {
    id: 'base-regions',
    name: '基地区域',
    type: 'polygon',
    data: null, // 将在mounted时加载
    visible: true,
    zIndex: 1,
    emitEvent: true,
    customStyle: (feature) => createFeatureStyle(feature)
  }
]);

// 加载GeoJSON数据
const loadGeoJsonData = async () => {
  try {
    const response = await fetch('/map-json/base-boundaries.geojson');
    const geoJsonData = await response.json();

    if (mapGeodata.value && mapGeodata.value[0]) {
      mapGeodata.value[0].data = geoJsonData;
    }
  } catch (error) {
    console.error('加载GeoJSON数据失败:', error);
  }
};

// 监听预警数据变化，重新渲染地图
watch(
  () => props.alertData,
  (newData, oldData) => {
    console.log(`${props.debugPrefix} SoilFertilityMap props.alertData 数据变化:`, {
      oldData,
      newData,
      length: newData?.length || 0
    });

    // 延迟执行地图更新，确保组件完全渲染
    nextTick(() => {
      updateMapLayers();
    });
  },
  { deep: true, immediate: false } // 改为 immediate: false，避免初始化时就触发
);

// 监听regionWarningMap计算属性的变化
watch(
  regionWarningMap,
  (newMap, oldMap) => {
    console.log(`${props.debugPrefix} regionWarningMap 变化:`, {
      oldMap,
      newMap
    });

    nextTick(() => {
      updateMapLayers();
    });
  },
  { deep: true }
);

// 添加对数据长度变化的监听，确保地图能响应查询结果变化
watch(
  () => props.alertData?.length,
  (newLength, oldLength) => {
    console.log(`${props.debugPrefix} alertData 长度变化:`, {
      oldLength,
      newLength
    });

    if (newLength !== oldLength) {
      // 数据长度变化时强制更新地图
      nextTick(() => {
        updateMapLayers();
      });
    }
  }
);

// 添加地图初始化状态标记
const mapInitialized = ref(false);

// 封装地图更新逻辑
const updateMapLayers = () => {
  // 检查地图是否已经初始化
  if (!mapInitialized.value) {
    console.log(`${props.debugPrefix} 地图尚未初始化完成，跳过更新`);
    return;
  }

  // 检查地图组件实例是否存在
  if (!map.value) {
    console.warn(`${props.debugPrefix} 地图组件实例不存在`);
    return;
  }

  try {
    // 通过组件的暴露方法获取图层
    // 由于 map.value 是 Vue 组件实例，我们需要通过它的暴露方法来操作地图
    const layer = map.value.getLayerById('base-regions');
    if (!layer) {
      console.warn(`${props.debugPrefix} 未找到图层 base-regions`);
      return;
    }

    console.log(`${props.debugPrefix} 开始更新地图图层样式`);

    // 方法1: 重新设置样式函数 - 这是最有效的方法
    const source = layer.getSource();
    if (source) {
      // 创建新的样式函数引用
      const newStyleFunction = (feature) => createFeatureStyle(feature);

      // 重新设置图层样式 - 这会强制重新渲染
      layer.setStyle(newStyleFunction);

      console.log(`${props.debugPrefix} 已重新设置图层样式函数`);
    }

    // 方法2: 强制刷新图层
    layer.changed();

    // 方法3: 强制刷新所有features
    if (source) {
      source.getFeatures().forEach((feature) => {
        feature.changed();
      });
    }

    // 方法4: 触发地图渲染
    if (map.value && map.value.map) {
      map.value.map.render();
    }
  } catch (error) {
    console.error(`${props.debugPrefix} 更新地图图层时发生错误:`, error);
    console.log(`${props.debugPrefix} map.value 类型:`, typeof map.value);
    console.log(`${props.debugPrefix} map.value 可用方法:`, Object.getOwnPropertyNames(map.value));
  }
};

const onMapLoaded = () => {
  console.log(`${props.debugPrefix}地图加载完成`);
  // 设置地图初始化完成标记
  mapInitialized.value = true;

  // 地图加载完成后，立即更新一次图层样式
  nextTick(() => {
    updateMapLayers();
  });
};

/**
 * 定位到基地
 */
function locate() {
  if (map.value) {
    map.value.locate('姜兴庄');
  }
}

/**
 * 点击地块时，返回地块属性
 */
function getLandUnitProperty(eventData) {
  const properties = eventData.properties || {};
  const regionCode = properties.regionCode || resolveRegionIdByName(properties.NAME);
  const baseName = properties.baseName || properties.shortName || properties.NAME || '未知基地';

  let alertInfo = '当前状态：正常';
  if (regionCode && props.alertData) {
    const alerts = props.alertData.filter((alert) => String(alert.region) === String(regionCode));
    if (alerts.length > 0) {
      const latest = alerts[0];
      const warningLevelEnum = WarningLevel.fromWarningLevelInt(latest.warningLevel);
      const warningLevelName = WarningLevel.getDisplayName(warningLevelEnum);
      alertInfo = `${props.clickLabels.levelLabel} ${warningLevelName}\n${props.clickLabels.contentLabel} ${latest.warningContent}`;
    }
  }

  const areaText = properties.area ? `\n面积 ${properties.area} 公顷` : '';
  alert(`区域 ${baseName}${areaText}\n${alertInfo}`);
}

onMounted(async () => {
  await loadGeoJsonData();
  setTimeout(() => {
    locate();
  }, 1000);
});
</script>

<style scoped>
.box {
  width: 150px;
  line-height: 2;
  background-color: rgba(255, 255, 255, 0.5);
  border: 5px solid rgba(134, 134, 134, 0.8);
  padding: 10px;
}

li {
  display: flex;
  padding: 5px;
}

li div:first-child {
  width: 50px;
}

li div:last-child {
  flex-grow: 1;
}

button {
  padding: 10px 20px;
}

ul {
  margin: 0 0 0 0 !important;
  padding: 0 0 0 0 !important;
}
</style>
