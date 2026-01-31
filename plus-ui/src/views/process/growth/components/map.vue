<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, toRefs, getCurrentInstance } from 'vue';
import MzMap from '@/components/Map/MzMap.vue';
import { Style, Fill, Stroke, Text } from 'ol/style';
import type { GeoData } from '@/components/Map/MzMap';
import { listDiagnosis } from '@/views/process/growth/diagnosis/api';
import { DiagnosisVO, DiagnosisQuery, DiagnosisForm } from '@/views/process/growth/diagnosis/api/types';

const mapRef = ref();
const mzMapInstance = ref(null);
const localMapLayers = ref<GeoData[]>([]);

// 获取全局属性
const { proxy } = getCurrentInstance() as any;

// 定义emits
const emit = defineEmits(['mapLoaded', 'featureClick']);

// 工具提示相关状态
const showTooltip = ref(false);
const tooltipStyle = reactive({
  left: '0px',
  top: '0px'
});
const tooltipTitle = ref('');
const tooltipItems = ref<{ label: string; value: any }[]>([]);

// 长势等级映射
const growthLevelMap: Record<number, string> = {
  1: '良好',
  2: '正常',
  3: '较差'
};

// 长势等级数值映射（将文字转换为数字）
const growthLevelValueMap: Record<string, number> = {
  '良好': 1,
  '正常': 2,
  '较差': 3
};

// 类别到颜色的映射
const classColorMap: Record<string, string> = {
  '好': 'rgb(0,202,0)',
  '中': 'rgb(2,249,3)',
  '差': 'rgb(184,224,111)'
};

// 图例数据
const mapLegends = [
  {
    title: '长势等级',
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
      horizontal: '83%',
      vertical: '78%'
    },
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  }
];

// 诊断数据列表
const diagnosisList = ref<DiagnosisVO[]>([]);

const initFormData: DiagnosisForm = {
  id: undefined,
  baseName: undefined,
  plotId: undefined,
  originalImage: undefined,
  growthPeriod: undefined,
  diagnosisTime: undefined,
  diagnosisModel: undefined,
  laiInversionImage: undefined,
  spadInversionImage: undefined,
  laiPrediction: undefined,
  spadPrediction: undefined,
  growthLevel: undefined,
  isPredicted: 0, // 默认为未预测
  remark: undefined
};
const data = reactive<PageData<DiagnosisForm, DiagnosisQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 1000,
    baseName: undefined,
    plotId: undefined,
    growthPeriod: undefined,
    diagnosisTime: undefined,
    diagnosisModel: undefined,
    isPredicted: undefined,
    params: {}
  },
  rules: undefined
});

const { queryParams } = toRefs(data);

// 定义props
const props = defineProps<{
  initialBaseName?: string;
  geoJsonUrl?: string;
  growthPeriod?: string; // 添加生长期prop
}>();

// 添加响应式引用以跟踪当前生长期
const currentGrowthPeriod = ref(props.growthPeriod || '拔节期');

// 在组件挂载时加载GeoJSON数据
const loadGeoJsonData = async (period: string) => {
  try {
    // 获取地块单元数据
    const landUnitResponse = await fetch('/map-json/land-unit.geojson');

    // 根据生长期获取预测分类数据URL
    const periodFiles = {
      '拔节期': '/map-json/B_with_avg_period120251205030319391.geojson', // 拔节期
      '抽穗期': '/map-json/B_with_avg_period220251205031239774.geojson', // 抽穗期
      '灌浆期': '/map-json/B_with_avg_period320251205031256977.geojson' // 灌浆期
    };

    // 使用传入的生长期或默认为拔节期
    const predictionClassUrl = periodFiles[period] || periodFiles['拔节期'];

    // 获取预测分类数据
    const predictionClassResponse = await fetch(predictionClassUrl);

    // 检查响应状态
    if (!landUnitResponse.ok) {
      console.error('获取地块单元GeoJSON数据失败，HTTP状态码:', landUnitResponse.status);
      return;
    }

    if (!predictionClassResponse.ok) {
      console.error('获取预测分类GeoJSON数据失败，HTTP状态码:', predictionClassResponse.status);
      return;
    }

    const landUnitData = await landUnitResponse.json();
    const predictionClassData = await predictionClassResponse.json();

    // 从诊断接口获取真实数据
    await fetchDiagnosisData();

    // 创建图层数据
    localMapLayers.value = [
      {
        id: 'land_unit',
        name: '地块信息',
        type: 'polygon',
        data: landUnitData,
        visible: true,
        zIndex: 8,
        minDisplayZoom: 15,
        emitEvent: true,
        emitRightClickEvent: true,
        updateWhileAnimating: false,
        updateWhileInteracting: false
      },
      {
        id: 'prediction_class',
        name: '预测分类',
        type: 'polygon',
        data: predictionClassData,
        visible: true,
        zIndex: 7,
        minDisplayZoom: 15,
        emitEvent: true,
        emitRightClickEvent: true,
        updateWhileAnimating: false,
        updateWhileInteracting: false
      }
    ];

    // 触发地图更新
    // styledMapLayers.value = [...localMapLayers.value];
  } catch (error) {
    console.error('加载GeoJSON数据失败:', error);
  }
};

onMounted(async () => {
  await loadGeoJsonData(currentGrowthPeriod.value);
});

// 监听生长期变化并在变化时重新加载地图数据
watch(
  () => props.growthPeriod,
  (newPeriod) => {
    if (newPeriod) {
      currentGrowthPeriod.value = newPeriod;
      loadGeoJsonData(newPeriod);
    } else {
      // 即使没有新的生长期，也要确保加载默认的生长期数据
      loadGeoJsonData(currentGrowthPeriod.value);
    }
  }
);

// 从诊断接口获取真实数据
const fetchDiagnosisData = async () => {
  try {
    // 设置生长期参数 - 使用 growth_diagnose_period 字典进行转换
    if (currentGrowthPeriod.value) {
      // 先尝试直接匹配值，如果匹配不到则通过字典转换
      if (proxy) {
        const dictData = proxy.useDict('growth_diagnose_period');
        const { growth_diagnose_period } = toRefs<any>(dictData);
        if (growth_diagnose_period && growth_diagnose_period.value) {
          const matchedPeriod = growth_diagnose_period.value.find(
            (item: any) => item.label === currentGrowthPeriod.value || item.value === currentGrowthPeriod.value
          );
          if (matchedPeriod) {
            queryParams.value.growthPeriod = matchedPeriod.value;
          }
        }
      } else {
        // fallback方案，直接使用当前值
        queryParams.value.growthPeriod = currentGrowthPeriod.value;
      }
    }

    console.log('查询参数:', queryParams.value);
    // 从诊断接口获取数据，使用与诊断页面完全相同的模式
    const response = await listDiagnosis(queryParams.value);

    console.log('诊断数据:', response);

    // 存储诊断数据
    diagnosisList.value = response.rows || [];

    // 处理诊断数据，将其转换为地块ID到长势等级的映射
    const levels: Record<string, string> = {};
    if (response.rows && response.rows.length > 0) {
      response.rows.forEach((item: DiagnosisVO) => {
        // 使用 plotId 作为键来存储长势等级
        if (item.plotId) {
          // 直接存储文字等级
          levels[item.plotId] = item.growthLevel;
        }
      });
    } else {
      console.log('未获取到诊断数据，使用默认值');
    }

    // 更新生长等级数据
    growthLevels.value = levels;
  } catch (error) {
    console.error('获取诊断数据失败:', error);
    // 不再生成随机数据作为后备，保持为空
    growthLevels.value = {};
  }
};

// 生长等级数据
const growthLevels = ref<Record<string, string>>({});

// 带样式的图层数据
const styledMapLayers = ref([]);

// 监听 localMapLayers 和 growthLevels 的变化，更新带样式的图层数据
watch([localMapLayers, growthLevels], () => {
  // 添加一个依赖于growthLevels的响应式引用，确保当growthLevels变化时重新计算
  const levels = { ...growthLevels.value };

  styledMapLayers.value = localMapLayers.value.map((layer) => {
    if (layer.id === 'land_unit') {
      return {
        ...layer,
        // 自定义渲染函数
        customStyle: (feature) => {
          const landCode = feature.get('landCode');
          const landId = feature.get('landId');
          // 使用地块ID(landId)进行匹配，与长势数据中的plotId对应
          const level = levels[landId];

          // 根据长势等级设置颜色
          let color;
          if (level === undefined) {
            // 没有数据时显示为灰色
            color = 'rgba(0,0,0,0)';
          } else {
            // 直接使用文字等级进行判断
            switch (level) {
              case '良好':
                color = 'rgb(0,128,0, 0.6)'; // 良好 - 绿色
                break;
              case '正常':
                color = 'rgb(0, 200, 0, 0.6)'; // 正常 - 浅绿
                break;
              case '较差':
                color = 'rgb(184,224,111, 0.6)'; // 较差 - 黄绿
                break;
              default:
                color = 'rgba(0,0,0,0)'; // 默认灰色
            }
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
    } else if (layer.id === 'prediction_class') {
      return {
        ...layer,
        // 自定义渲染函数
        customStyle: (feature) => {
          const clazz = feature.get('class');
          let color;
          if (clazz === undefined) {
            // 没有数据时显示为灰色
            color = 'rgba(0,0,0,0)';
          } else {
            // 直接使用文字等级进行判断
            switch (clazz) {
              case '好':
                color = 'rgb(0,128,0, 0.6)'; // 良好 - 绿色
                break;
              case '中':
                color = 'rgb(0, 200, 0, 0.6)'; // 正常 - 浅绿
                break;
              case '差':
                color = 'rgb(184,224,111, 0.6)'; // 较差 - 黄绿
                break;
              default:
                color = 'rgba(0,0,0,0)'; // 默认灰色
            }
          }

          return new Style({
            fill: new Fill({ color }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.9)',
              width: 0.1
            })
            // text: new Text({
            //   font: '12px 微软雅黑',
            //   fill: new Fill({ color: '#000' }),
            //   stroke: new Stroke({ color: '#fff', width: 2 }),
            //   text: clazz || ''
            // })
          });
        }
      };
    }
    return layer;
  });
});

// 处理地图加载完成事件
const handleMapLoaded = (mapInstance: any) => {
  mzMapInstance.value = mapInstance;
  emit('mapLoaded', mapInstance);

  // 地图加载完成后定位到侯家沟基地
  if (props.initialBaseName && mapInstance && typeof mapInstance.locate === 'function') {
    // 延迟执行确保地图完全初始化
    setTimeout(() => {
      mapInstance.locate(props.initialBaseName);
    }, 200);
  }

  // 确保在地图加载完成后调整大小
  setTimeout(() => {
    if (mapInstance && mapInstance.map && typeof mapInstance.map.updateSize === 'function') {
      mapInstance.map.updateSize();
    }
  }, 100);
};

// 处理要素点击事件
const handleFeatureClick = (featureData: any) => {
  console.log('点击了要素:', featureData);
  if (featureData.layerId === 'land_unit') {
    console.log('点击了地块:', featureData.properties.landCode);
  }
  // 确保传递完整的featureData，包括基地ID
  emit('featureClick', featureData);
};

// 处理右键点击事件
const handleRightClick = (data: any) => {
  // 获取鼠标事件，用于定位tooltip
  const event = window.event as MouseEvent;

  // 根据图层类型显示不同的数据
  if (data.layerId === 'land_unit') {
    const landId = data.features.landId;
    const level = growthLevels.value[landId];

    // 查找对应的诊断数据
    const diagnosis = diagnosisList.value.find((item: DiagnosisVO) => item.plotId == landId);

    tooltipItems.value = [
      { label: '地块编码', value: data.features.landCode || '无' },
      { label: '面积(亩)', value: data.features.landArea ? `${data.features.landArea} 亩` : '无' },
      { label: '长势等级', value: level || '无数据' },
      { label: 'LAI', value: diagnosis?.laiPrediction !== undefined ? diagnosis?.laiPrediction : '无数据' },
      { label: 'SPAD', value: diagnosis?.spadPrediction !== undefined ? diagnosis?.spadPrediction : '无数据' }
    ];
  } else {
    return; // 如果不是地块图层，不显示tooltip
  }

  // 设置tooltip位置
  tooltipStyle.left = `${event.clientX + 10}px`;
  tooltipStyle.top = `${event.clientY + 10}px`;

  // 显示tooltip
  showTooltip.value = true;

  // 阻止默认右键菜单
  event.preventDefault();
};

// 隐藏tooltip
const hideTooltip = () => {
  showTooltip.value = false;
};

// 添加点击页面其他区域隐藏tooltip的事件
document.addEventListener('click', hideTooltip);

// 定位到指定基地
const locate = (baseName: string) => {
  if (mapRef.value && typeof mapRef.value.locate === 'function') {
    mapRef.value.locate(baseName);
  } else {
    console.warn('地图实例未准备好或不支持locate方法');
  }
};

// 处理从父组件传来的基地选择
const handleBaseSelection = (baseName: string) => {
  console.log('在地图组件中接收到基地选择:', baseName);
  // 直接在地图组件内部调用定位方法
  if (mapRef.value && typeof mapRef.value.locate === 'function') {
    console.log(`通过mapRef定位到基地: ${baseName}`);
    mapRef.value.locate(baseName);
  } else {
    console.warn('地图实例未准备好或不支持locate方法');
  }
};

// 刷新地图数据的方法
const refreshMap = async () => {
  console.log('刷新地图数据');
  await fetchDiagnosisData();

  // 如果需要强制刷新地图视图，可以添加以下代码
  if (mapRef.value && typeof mapRef.value.refresh === 'function') {
    mapRef.value.refresh();
  }
};

// 暴露方法给父组件
defineExpose({
  mapRef,
  locate,
  handleBaseSelection,
  refreshMap
});
</script>

<template>
  <div class="map-wrapper">
    <MzMap
      ref="mapRef"
      :geodata="styledMapLayers"
      :legends="mapLegends"
      :base-name="initialBaseName"
      @map-loaded="handleMapLoaded"
      @feature-click="handleFeatureClick"
      @feature-right-click="handleRightClick"
    >
    </MzMap>

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

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Tooltip样式 */
.tooltip {
  position: fixed;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  min-width: 200px;
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
  width: 80px;
}

.tooltip-value {
  flex: 1;
}
</style>
