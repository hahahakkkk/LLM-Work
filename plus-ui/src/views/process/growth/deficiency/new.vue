<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, toRefs } from 'vue';
import MzMap from '@/components/Map/MzMap.vue';
import { Style, Fill, Stroke, Text } from 'ol/style';
import type { GeoData } from '@/components/Map/MzMap';
import { listDiagnosis } from '@/views/process/growth/diagnosis/api';
import { DiagnosisVO, DiagnosisQuery, DiagnosisForm } from '@/views/process/growth/diagnosis/api/types';

const mapRef = ref();
const mzMapInstance = ref(null);
const localMapLayers = ref<GeoData[]>([]);

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

// 热力图显示状态
const showHeatmap = ref(false);

// 热力图配置
const heatmapConfig = reactive({
  radius: 8,
  blur: 6,
  opacity: 0.7,
  gradient: ['#000428', '#004e92', '#009ffd', '#00d2ff', '#7be495', '#ffcc02', '#ff6b35', '#f7931e', '#dc2430']
});

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

// 长势图例数据
const growthMapLegends = [
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

// 热力图图例数据
const heatmapLegends = [
  {
    title: 'LAI指数',
    items: [
      {
        label: '高',
        style: { backgroundColor: '#dc2430' },
        labelColor: '#000'
      },
      {
        label: '中',
        style: { backgroundColor: '#ffcc02' },
        labelStyle: {
          color: '#000'
        }
      },
      {
        label: '低',
        style: { backgroundColor: '#000428' },
        labelColor: '#fff'
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

// 添加一个用于存储从JSON文件加载的数据的引用
const jsonDataList = ref<any[]>([]);

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
  baseId?: string;
}>();

// 在组件挂载时加载GeoJSON数据
onMounted(async () => {
  try {
    // 获取地块单元数据
    const landUnitResponse = await fetch('/map-json/land-unit.geojson');

    // 获取预测分类数据
    const predictionClassResponse = await fetch('/map-json/prediction_class2.geojson');

    // 检查响应状态
    if (!landUnitResponse.ok) {
      console.error('获取地块单元GeoJSON数据失败，HTTP状态码:', landUnitResponse.status);
      return;
    }

    if (!predictionClassResponse.ok) {
      console.error('获取预测分类GeoJSON数据失败，HTTP状态码:', predictionClassResponse.status);
      return;
    }

    let landUnitData = await landUnitResponse.json();
    let predictionClassData = await predictionClassResponse.json();

    // 如果有基地ID，过滤数据
    if (props.baseId) {
      // 过滤地块单元数据
      if (landUnitData.features && Array.isArray(landUnitData.features)) {
        landUnitData.features = landUnitData.features.filter((feature) => feature.properties && feature.properties.baseId == props.baseId);
      }

      // 过滤预测分类数据
      if (predictionClassData.features && Array.isArray(predictionClassData.features)) {
        predictionClassData.features = predictionClassData.features.filter(
          (feature) => feature.properties && feature.properties.baseId == props.baseId
        );
      }
    }

    // 从诊断接口获取真实数据
    await fetchDiagnosisData();

    // 从JSON文件加载备选数据
    await loadJsonData();

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
      },
      // 热力图图层
      {
        id: 'heatmap_layer',
        name: '热力图',
        type: 'heatmap',
        data: [], // 热力图数据将在后面处理
        visible: false, // 默认隐藏
        zIndex: 9, // 热力图显示在最上层
        minDisplayZoom: 15,
        emitEvent: false,
        emitRightClickEvent: false,
        updateWhileAnimating: false,
        updateWhileInteracting: false
      }
    ];

    // 输出调试信息
    console.log('地图数据加载完成');
  } catch (error) {
    console.error('加载GeoJSON数据失败:', error);
  }
});

// 从诊断接口获取真实数据
const fetchDiagnosisData = async () => {
  try {
    console.log('查询参数:', queryParams.value);
    // 如果有基地ID，添加到查询参数中
    if (props.baseId) {
      queryParams.value.baseName = props.baseId;
    }
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

    // 输出调试信息
    console.log('处理后的生长等级数据:', levels);
  } catch (error) {
    console.error('获取诊断数据失败:', error);
    // 不再生成随机数据作为后备，保持为空
    growthLevels.value = {};
  }
};

// 从JSON文件加载备选数据
const loadJsonData = async () => {
  try {
    const response = await fetch('/map-json/lai_spad_growth_result.json');
    const data = await response.json();

    // 如果有基地ID，过滤数据
    if (data && Array.isArray(data) && props.baseId) {
      jsonDataList.value = data.filter((item) => item.baseId == props.baseId);
    } else {
      jsonDataList.value = data || [];
    }

    // 输出调试日志，便于跟踪数据
    console.log(
      '从JSON文件加载的数据:',
      jsonDataList.value.map((item) => ({
        plotId: item.plotId,
        laiValue: item.laiValue,
        spadValue: item.spadValue,
        growthLevel: item.growthLevel
      }))
    );
  } catch (error) {
    console.error('加载JSON数据失败:', error);
    jsonDataList.value = [];
  }
};

// 生长等级数据
const growthLevels = ref<Record<string, string>>({});

// 带样式的图层数据
const styledMapLayers = computed(() => {
  // 添加一个依赖于growthLevels的响应式引用，确保当growthLevels变化时重新计算
  const levels = { ...growthLevels.value };

  // 创建一个集合，包含所有有接口数据的地块ID
  const plottedLandIds = new Set(diagnosisList.value.map((item) => item.plotId));

  return localMapLayers.value.map((layer) => {
    // 处理热力图图层
    if (layer.id === 'heatmap_layer') {
      return {
        ...layer,
        visible: showHeatmap.value, // 根据状态控制显示/隐藏
        data: generateHeatmapData() // 生成热力图数据
      };
    }

    // 处理地块信息图层
    if (layer.id === 'land_unit') {
      return {
        ...layer,
        // 当显示热力图时仍然保持图层可见，以便处理点击事件
        visible: true,
        // 自定义渲染函数
        customStyle: (feature) => {
          const landCode = feature.get('landCode');
          const landId = feature.get('landId');
          // 使用地块ID(landId)进行匹配，与长势数据中的plotId对应
          const level = levels[landId];

          // 根据长势等级设置颜色
          let color;
          // 当显示热力图时，地块使用透明样式
          if (showHeatmap.value) {
            color = 'rgba(0,0,0,0)';
          } else if (level === undefined) {
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
                color = 'rgb(0,0,0,0)'; // 默认灰色
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
    }
    // 处理预测分类图层
    else if (layer.id === 'prediction_class') {
      return {
        ...layer,
        // 当显示热力图时隐藏预测分类图层
        visible: !showHeatmap.value,
        // 自定义渲染函数
        customStyle: (feature) => {
          const landId = feature.get('landId');
          // 如果该地块有接口数据，则不显示prediction_class图层（透明显示）
          if (plottedLandIds.has(landId)) {
            // 使有接口数据的地块在prediction_class图层中透明显示
            return new Style({
              fill: new Fill({ color: 'rgba(0, 0, 0, 0)' }), // 完全透明
              stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0)', // 边框也透明
                width: 0
              })
            });
          }

          const clazz = feature.get('class');
          const colorArray = feature.get('color');

          // 根据GeoJSON中的类别和颜色信息设置样式
          let color;
          if (clazz && colorArray) {
            // 使用GeoJSON中定义的颜色
            color = `rgba(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]}, 0.6)`;
          } else {
            // 没有数据时显示为灰色
            color = 'rgba(150, 150, 150, 0.6)';
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

// 生成热力图数据
const generateHeatmapData = () => {
  const heatData = [];

  // 创建地块ID映射表，便于快速查找
  const landUnitLayer = localMapLayers.value.find((layer) => layer.id === 'land_unit');
  if (!landUnitLayer || !landUnitLayer.data || !landUnitLayer.data.features) {
    return [];
  }

  // 创建地块ID到feature的映射
  const plotMap = new Map();
  landUnitLayer.data.features.forEach((feature: any) => {
    const properties = feature.properties;
    const landId = properties?.landId;
    if (landId) {
      plotMap.set(landId, feature);
    }
  });

  // 生成热力点
  diagnosisList.value.forEach((record) => {
    const plotId = record.plotId;
    if (plotMap.has(plotId)) {
      const feature = plotMap.get(plotId);
      const geometry = feature.geometry;

      // 处理不同的几何类型
      let coordinates: number[][] = [];
      if (geometry?.type === 'Polygon') {
        coordinates = geometry.coordinates[0];
      } else if (geometry?.type === 'MultiPolygon') {
        coordinates = geometry.coordinates[0][0];
      }

      if (coordinates && coordinates.length > 3) {
        // 计算地块中心点坐标
        const centerCoordinate = calculatePolygonCenter(coordinates);
        if (centerCoordinate) {
          // 使用LAI值作为热力值
          const laiValue = record.laiPrediction !== undefined ? record.laiPrediction : 0;

          heatData.push({
            coordinate: centerCoordinate,
            weight: laiValue / 5 // 假设最大值为5进行归一化
          });
        }
      }
    }
  });

  return heatData;
};

// 计算多边形的几何中心点（质心）
const calculatePolygonCenter = (coordinates: number[][]): [number, number] | null => {
  if (!coordinates || coordinates.length < 3) {
    return null;
  }

  let area = 0;
  let centroidX = 0;
  let centroidY = 0;

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
    const sumX = coordinates.reduce((sum, coord) => sum + coord[0], 0);
    const sumY = coordinates.reduce((sum, coord) => sum + coord[1], 0);
    return [sumX / coordinates.length, sumY / coordinates.length];
  }

  centroidX /= 6 * area;
  centroidY /= 6 * area;

  return [centroidX, centroidY];
};

// 切换热力图显示状态
const toggleHeatmap = () => {
  showHeatmap.value = !showHeatmap.value;
};

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
    let level = growthLevels.value[landId];

    // 查找对应的诊断数据（接口数据优先）
    let diagnosis = diagnosisList.value.find((item: DiagnosisVO) => item.plotId == landId);

    // 只有当接口数据中没有找到时，才尝试从JSON数据中查找
    if (!diagnosis) {
      diagnosis = jsonDataList.value.find((item: any) => item.plotId == landId);
      // 如果从JSON中找到了数据，且当前level为空，则从JSON数据中获取level
      if (diagnosis && !level) {
        level = diagnosis.growthLevel;
      }
    }

    tooltipItems.value = [
      { label: '地块编码', value: data.features.landCode || '无' },
      { label: '面积(亩)', value: data.features.landArea ? `${data.features.landArea} 亩` : '无' },
      { label: '长势等级', value: level || '无数据' },
      {
        label: 'LAI',
        value: diagnosis?.laiPrediction !== undefined ? diagnosis?.laiPrediction : diagnosis?.laiValue !== undefined ? diagnosis?.laiValue : '无数据'
      },
      {
        label: 'SPAD',
        value:
          diagnosis?.spadPrediction !== undefined ? diagnosis?.spadPrediction : diagnosis?.spadValue !== undefined ? diagnosis?.spadValue : '无数据'
      }
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

// 根据显示状态计算当前应显示的图例
const currentLegends = computed(() => {
  return showHeatmap.value ? heatmapLegends : growthMapLegends;
});

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
    <!-- 切换按钮 -->
    <div class="toggle-button">
      <button class="heatmap-toggle-btn" @click="toggleHeatmap">
        {{ showHeatmap ? '显示长势图' : '显示热力图' }}
      </button>
    </div>

    <!-- 地图组件 -->
    <MzMap
      ref="mapRef"
      :geodata="styledMapLayers"
      :legends="currentLegends"
      :base-name="initialBaseName"
      :heatmap-config="showHeatmap ? heatmapConfig : undefined"
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

.toggle-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.heatmap-toggle-btn {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.heatmap-toggle-btn:hover {
  background-color: #66b1ff;
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
