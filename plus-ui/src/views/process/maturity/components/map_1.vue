<template>
  <div class="container">
    <MzMap
      ref="mapRef"
      :geodata="geoDataArray"
      :base-name="baseName"
      :legends="mapLegends"
      @map-loaded="onMapLoaded"
      @feature-click="onFeatureClick"
      @feature-right-click="onRightClick"
    />

    <!--    <div class="layer-control-bar">-->
    <!--      <label>-->
    <!--        <input v-model="layerVisibility.satellite" type="checkbox" @change="toggleSatelliteLayer(layerVisibility.satellite)" />-->
    <!--        卫星数据-->
    <!--      </label>-->
    <!--      <label>-->
    <!--        <input v-model="layerVisibility.uav" type="checkbox" @change="toggleUAVLayer(layerVisibility.uav)" />-->
    <!--        无人机数据-->
    <!--      </label>-->
    <!--    </div>-->

    <!-- 右键提示框 -->
    <div v-if="showTooltip" class="tooltip" :style="tooltipStyle">
      <div class="tooltip-title">{{ tooltipTitle }}</div>
      <div v-for="(item, index) in tooltipItems" :key="index" class="tooltip-item">
        <div class="tooltip-label">{{ item.label }}:</div>
        <div class="tooltip-value">{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, defineProps, watch, nextTick } from 'vue';
import MzMap from '@/components/Map/MzMap.vue';
import type { GeoData } from '@/components/Map/MzMap';
import { Style, Fill, Stroke, Text, Circle } from 'ol/style';
import { useHeaderStore } from '@/store/headerStore';
import { addForecast, getForecast, listForecast, updateForecast } from '@/views/process/maturity/forecast/api';

const mapRef = ref(null);
const baseName = ref('侯家沟数字化种植基地');
const growthLevels = ref<Record<string, number>>({}); // 存储地块谷子成熟度数据

// 定义emits
const emit = defineEmits(['feature-click']);

// 定义props
const props = defineProps<{
  initialBaseName?: string;
}>();

// 监听initialBaseName变化
watch(
  () => props.initialBaseName,
  (newBaseName) => {
    if (newBaseName) {
      baseName.value = newBaseName;
      if (mapRef.value && typeof mapRef.value.locate === 'function') {
        // 延迟执行确保地图完全初始化
        nextTick(() => {
          setTimeout(() => {
            mapRef.value.locate(newBaseName);
          }, 200);
        });
      }
    }
  },
  { immediate: true }
);

// GeoJSON数据示例
const geoDataArray = ref<GeoData[]>([]);

const growthLevelMap = {
  1: '成熟',
  2: '未成熟'
};

// 工具提示相关状态
const showTooltip = ref(false);
const tooltipStyle = reactive({
  left: '0px',
  top: '0px',
  color: '#000'
});
const tooltipTitle = ref('');
const tooltipItems = ref<{ label: string; value: any }[]>([]);

// 在组件挂载时加载GeoJSON数据
onMounted(() => {
  loadGeoJSONData();

  // 添加点击页面其他区域隐藏tooltip的事件
  document.addEventListener('click', hideTooltip);
});

// 新增无人机数据相关变量
const uavData = ref<any[]>([]); // 存储无人机数据
const uavFeatures = ref<any[]>([]); // 存储无人机要素数据

// 在 loadGeoJSONData 函数中添加获取无人机数据的逻辑
async function loadUAVData(landUnitData: any) {
  try {
    // 从 listForecast API 获取无人机数据
    const response = await listForecast(); // 可根据需要添加查询参数
    console.log('无人机数据:', response.rows);
    uavData.value = response.rows || [];

    // 将无人机数据转换为地图要素格式，并关联地块坐标
    const features = uavData.value.map((item) => {
      let coordinates = [
        [
          [0, 0],
          [0, 1],
          [1, 1],
          [1, 0],
          [0, 0]
        ]
      ];
      let landCode = ''; // 地块编码

      if (landUnitData && landUnitData.features) {
        // 根据plotId查找对应的地块
        const matchingLand = landUnitData.features.find((feature: any) => feature.properties && feature.properties.landId == item.plotId);

        if (matchingLand) {
          landCode = matchingLand.properties.landCode || '';

          // 加强数据验证，确保坐标数据符合Polygon要求
          if (matchingLand.geometry && matchingLand.geometry.coordinates) {
            const coords = matchingLand.geometry.coordinates;
            // 验证是否为有效的面坐标数据（三维数组）
            if (coords && Array.isArray(coords) && coords.length > 0) {
              // 确保是最外层数组包含一个或多个线性环
              if (Array.isArray(coords[0]) && coords[0].length > 0) {
                coordinates = coords;
              }
            }
          }
        }
      }
      return {
        type: 'Feature',
        properties: {
          id: item.id,
          landId: item.plotId,
          ripenessStatus: item.ripenessStatus,
          maturity: item.ripenessStatus === 1 ? '成熟' : '未成熟', // 根据 ripenessStatus 判断成熟度
          diagnosisTime: item.diagnosisTime,
          harvestTime: item.ripenessStatus === 1 ? '5-7天内' : '无',
          variety: item.variety,
          landArea: item.plantingArea,
          landCode: landCode
        },
        geometry: {
          type: 'Polygon',
          coordinates: coordinates
        }
      };
    });

    uavFeatures.value = features;
  } catch (error) {
    console.error('加载无人机数据失败:', error);
  }
}
// 在 map.vue 的 script setup 中添加
const refreshUAVData = async () => {
  try {
    // 重新加载地块数据（用于坐标匹配）
    const landuUnitResponse = await fetch('/map-json/land-unit.geojson');
    const landuUnitData = await landuUnitResponse.json();

    // 重新加载无人机数据
    await loadUAVData(landuUnitData);

    // 更新 geoDataArray 中的 uav_data 图层
    const uavLayerIndex = geoDataArray.value.findIndex((layer) => layer.id === 'uav_data');
    if (uavLayerIndex !== -1) {
      geoDataArray.value[uavLayerIndex] = {
        ...geoDataArray.value[uavLayerIndex],
        data: {
          type: 'FeatureCollection',
          features: uavFeatures.value
        }
      };
    }

    console.log('无人机数据图层已刷新');
  } catch (error) {
    console.error('刷新无人机数据失败:', error);
  }
};

// 加载GeoJSON数据
async function loadGeoJSONData() {
  try {
    // 加载地块数据
    const landuUnitResponse = await fetch('/map-json/land-unit.geojson');
    const landuUnitData = await landuUnitResponse.json();

    const levels: Record<string, number> = {};
    growthLevels.value = levels;

    // 加载采样点数据
    const pointResponse = await fetch('/map-json/point.geojson');
    const pointData = await pointResponse.json();

    // 加载卫星数据
    const satelliteResponse = await fetch('/map-json/B_filled.geojson');
    const satelliteData = await satelliteResponse.json();

    // 加载无人机数据，传入地块数据用于坐标匹配
    await loadUAVData(landuUnitData);

    // 更新数据
    geoDataArray.value = [
      {
        id: 'land_unit',
        name: '地块信息',
        type: 'polygon',
        data: landuUnitData,
        visible: true,
        zIndex: 9,
        minDisplayZoom: 15,
        emitEvent: true,
        emitRightClickEvent: true, //设置是否触发右单击
        updateWhileAnimating: false, // 动画期间不更新，提高性能
        updateWhileInteracting: false, // 交互期间不更新，提高性能
        //自定义渲染函数
        customStyle: (feature) => {
          const landCode = feature.get('landCode');
          const level = growthLevels.value[landCode] || 1;

          // 根据谷子成熟度设置颜色
          let color;
          switch (level) {
            case 1:
              color = 'rgb(240,159,36,0)'; // 成熟
              break;
            case 2:
              color = 'rgb(211,204,50, 0)'; // 未成熟
              break;
            case 3:
              color = 'rgba(150, 150, 150, 0)'; // 无数据
              break;
            default:
              color = 'rgba(150, 150, 150, 0)'; // 默认灰色
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
      },
      {
        id: 'satellite_data',
        name: '卫星数据',
        type: 'polygon',
        data: satelliteData,
        visible: true,
        zIndex: 10,
        minDisplayZoom: 10,
        emitEvent: false,
        emitRightClickEvent: false,
        updateWhileAnimating: false,
        updateWhileInteracting: false,
        customStyle: (feature) => {
          // 根据卫星数据中的maturity属性设置颜色
          const maturity = feature.get('maturity');
          let color;

          switch (maturity) {
            case '成熟':
              color = 'rgb(240,159,36,0.6)';
              break;
            case '未成熟':
              color = 'rgb(211,204,50, 0.6)';
              break;
            default:
              color = 'rgba(150, 150, 150, 0.6)';
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
              text: feature.get('block_name') || ''
            })
          });
        }
      },
      // 修改无人机数据图层配置
      {
        id: 'uav_data',
        name: '无人机数据',
        type: 'polygon', // 改为面类型以使用全部坐标
        data: {
          type: 'FeatureCollection',
          features: uavFeatures.value
        },
        visible: true,
        zIndex: 11,
        minDisplayZoom: 12,
        emitEvent: false,
        emitRightClickEvent: true,
        updateWhileAnimating: false,
        updateWhileInteracting: false,
        customStyle: (feature) => {
          console.log('无人机数据:', feature);
          // 添加保护性检查
          if (!feature) {
            return new Style({
              fill: new Fill({ color: 'rgba(150, 150, 150, 0.3)' }),
              stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.8)', width: 1 })
            });
          }

          // 根据无人机数据中的成熟度设置颜色
          const maturity = feature.get('maturity') || '';
          let color;

          switch (maturity) {
            case '成熟':
              color = 'rgb(240,159,36, 0.6)'; // 成熟 - 橙色带透明度
              break;
            case '未成熟':
              color = 'rgb(211,204,50, 0.6)'; // 未成熟 - 黄色带透明度
              break;
            default:
              color = 'rgba(150, 150, 150, 0.3)'; // 默认灰色带透明度
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
              text: feature.get('landCode')
            })
          });
        }
      }
    ];
  } catch (error) {
    console.error('加载GeoJSON数据失败', error);
  }
}

/*图例数据 */
const mapLegends = ref([
  {
    title: '谷子成熟度',
    items: [
      {
        label: '成熟',
        style: { backgroundColor: 'rgb(240,159,36)' },
        labelColor: '#000'
      },
      {
        label: '未成熟',
        style: { backgroundColor: 'rgb(211,204,50)' },
        labelStyle: {
          color: '#000'
        }
      }
    ],
    position: {
      horizontal: '83%',
      vertical: '80%'
    },
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  }
]);

function onMapLoaded(mapInstance) {
  // 地图加载完成后定位到指定基地
  if (baseName.value && mapRef.value && typeof mapRef.value.locate === 'function') {
    // 延迟执行确保地图完全初始化
    setTimeout(() => {
      mapRef.value.locate(baseName.value);
    }, 300);
  }
}

function onFeatureClick(eventData) {
  console.log('点击了地图要素:', eventData);

  // 根据不同图层类型处理点击事件
  if (eventData.layerId === 'land_unit') {
    // 处理地块点击，向父组件发送事件
    emit('feature-click', eventData);
    if (eventData.properties) {
      console.log('点击了地块:', eventData.properties.landCode);
    }
  } else if (eventData.layerId === 'uav_data') {
    // 处理无人机数据点击，向父组件发送事件
    emit('feature-click', eventData);
    if (eventData.features && eventData.features.properties) {
      console.log('点击了无人机数据:', eventData.features.properties);
    }
  }
  // satellite_data 图层由于 emitEvent: false 不会触发点击事件
}

/**
 * 右键处理
 * @param data 要素feature
 */
function onRightClick(data: any) {
  // 获取鼠标事件，用于定位tooltip
  const event = window.event as MouseEvent;

  // 根据图层类型显示不同的数据
  if (data.layerId === 'land_unit') {
    tooltipTitle.value = '地块信息';

    // 从B_filled.geojson数据中获取maturity属性
    // 需要先找到对应地块的卫星数据
    let maturityValue = '无';
    if (geoDataArray.value && geoDataArray.value.length > 1) {
      const satelliteLayer = geoDataArray.value.find((layer) => layer.id === 'satellite_data');
      if (satelliteLayer && satelliteLayer.data && satelliteLayer.data.features) {
        // 查找相同地块编码的卫星数据
        const matchingFeature = satelliteLayer.data.features.find(
          (feature: any) => feature.properties && feature.properties.block_name === data.features.landCode
        );

        if (matchingFeature && matchingFeature.properties && matchingFeature.properties.maturity) {
          maturityValue = matchingFeature.properties.maturity;
        }
      }
    }

    tooltipItems.value = [
      { label: '地块编码', value: data.features.landCode || '无' },
      { label: '面积(亩)', value: data.features.landArea ? `${data.features.landArea} 亩` : '无' },
      {
        label: '谷子成熟度',
        value: maturityValue
      }
    ];
  } else if (data.layerId === 'uav_data') {
    // 处理无人机数据图层右键点击
    tooltipTitle.value = '地块信息';

    tooltipItems.value = [
      { label: '地块编码', value: data.features.landCode || '无' },
      { label: '作物品种', value: data.features.variety || '无' },
      { label: '种植面积', value: data.features.landArea ? `${data.features.landArea} 亩` : '无' },
      { label: '成熟度状态', value: data.features.maturity || '无' },
      { label: '诊断时间', value: data.features.diagnosisTime || '无' },
      { label: '最佳采收时间', value: data.features.harvestTime || '无' }
    ];
  } else {
    return; // 如果不是地块图层，不显示tooltip
  }

  // 设置tooltip位置
  tooltipStyle.left = `${event.clientX - 20}px`;
  tooltipStyle.top = `${event.clientY + 10}px`;

  // 显示tooltip
  showTooltip.value = true;

  // 阻止默认右键菜单
  event.preventDefault();
}

/**
 * 隐藏tooltip
 */
function hideTooltip() {
  showTooltip.value = false;
}

// 定位到指定基地
const locate = (baseName: string) => {
  if (mapRef.value && typeof mapRef.value.locate === 'function') {
    mapRef.value.locate(baseName);
  } else {
    console.warn('地图实例未准备好或不支持locate方法');
  }
};

// 在 script setup 中添加
const layerVisibility = ref({
  satellite: true,
  uav: true
});

// 创建切换图层可见性的方法
const toggleLayerVisibility = (layerId: string, visible: boolean) => {
  const layerIndex = geoDataArray.value.findIndex((layer) => layer.id === layerId);
  if (layerIndex !== -1) {
    geoDataArray.value[layerIndex] = {
      ...geoDataArray.value[layerIndex],
      visible: visible
    };
  }
};

// 修正后的实现
const toggleSatelliteLayer = (visible: boolean) => {
  layerVisibility.value.satellite = visible; // 更新状态
  toggleLayerVisibility('satellite_data', visible);
};

const toggleUAVLayer = (visible: boolean) => {
  layerVisibility.value.uav = visible; // 更新状态
  toggleLayerVisibility('uav_data', visible);
};

// 在 defineExpose 中添加新方法
defineExpose({
  locate,
  refreshUAVData,
  toggleSatelliteLayer,
  toggleUAVLayer
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;
}

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

.map-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

/* Tooltip样式 */
.tooltip {
  position: fixed;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  min-width: 240px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  font-size: 14px;
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.tooltip-item {
  display: flex;
  margin-bottom: 5px;
}

.tooltip-label {
  font-weight: bold;
  width: 100px;
}

/* 图层控制栏样式 */
.layer-control-bar {
  position: absolute;
  top: 10px;
  left: 50px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 15px;
}

.layer-control-bar label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  cursor: pointer;
}

.tooltip-value {
  flex: 1;
}
</style>
