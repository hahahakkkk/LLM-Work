<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, toRefs } from 'vue';
import MzMap from '@/components/Map/MzMap.vue';
import { Heatmap as HeatmapLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Fill, Stroke, Text } from 'ol/style';
import type { GeoData } from '@/components/Map/MzMap';
import { listDiagnosis } from '@/views/process/growth/diagnosis/api';
import { DiagnosisVO, DiagnosisQuery, DiagnosisForm } from '@/views/process/growth/diagnosis/api/types';

const mapRef = ref();
const mzMapInstance = ref(null);
const localMapLayers = ref<GeoData[]>([]);
const laiHeatmapLayerRef = ref<any>(null);
const spadHeatmapLayerRef = ref<any>(null);

// LAI热力图配置
const laiHeatmapConfig = reactive({
  radius: 15,
  blur: 15,
  opacity: 0.7,
  gradient: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825']
});

// SPAD热力图配置
const spadHeatmapConfig = reactive({
  radius: 15,
  blur: 15,
  opacity: 0.7,
  gradient: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825']
});

// 热力图网格点生成配置
reactive({
  spacingX: 50, // X轴间距(米)
  spacingY: 50 // Y轴间距(米)
});
// 颜色方案配置
const gradientSchemes = {
  default: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],
  viridis: ['#000428', '#004e92', '#009ffd', '#00d2ff', '#7be495', '#ffcc02', '#ff6b35', '#f7931e', '#dc2430'],
  plasma: ['#0d0887', '#5302a3', '#8b0aa5', '#b83289', '#db5c68', '#f48849', '#febd2a', '#f0f921'],
  warm: ['#3e193d', '#6a1b56', '#961d5f', '#c2294f', '#e34f38', '#f97c17', '#f8b723', '#e7f023'],
  cool: ['#0096c7', '#00a6d3', '#00b7dc', '#00c7e2', '#00d6e2', '#00e3d9', '#00edc8', '#00f4b4'],
  fire: ['#000004', '#4a0243', '#9e1445', '#de413c', '#f87e3f', '#fdb863', '#fde08c', '#fcffbe']
};

const selectedLaiGradient = ref('default');
const selectedSpadGradient = ref('default');

// 热力图缩放配置（基于地理距离）
const laiHeatmapZoomConfig = reactive({
  radiusKm: 0.04, // 半径 30米
  blurKm: 0.03 // 模糊 40米
});

const spadHeatmapZoomConfig = reactive({
  radiusKm: 0.02, // 半径 30米
  blurKm: 0.03 // 模糊 40米
});

// 热力图控制面板状态
const controlsPanel = reactive({
  x: 20,
  y: 20,
  visible: false,
  expanded: true
});

// 热力图统计面板状态
const statsPanel = reactive({
  x: 300,
  y: 20,
  visible: false,
  expanded: true
});

// 拖拽状态
const dragState = reactive({
  isDragging: false,
  currentPanel: '',
  startX: 0,
  startY: 0,
  startPanelX: 0,
  startPanelY: 0
});

// LAI热力图统计数据
const laiHeatmapStats = reactive({
  pointCount: 0,
  average: 0,
  max: 0,
  min: 0
});

// SPAD热力图统计数据
const spadHeatmapStats = reactive({
  pointCount: 0,
  average: 0,
  max: 0,
  min: 0
});

// 当前激活的热力图类型 ('lai' 或 'spad')
const activeHeatmapType = ref<'lai' | 'spad' | null>(null);

// 定义emits
const emit = defineEmits(['mapLoaded', 'featureClick']);

// 射线投射算法检查点是否在多边形内
const isPointInPolygon = (point: [number, number], polygon: number[][]) => {
  const [x, y] = point;
  let inside = false;

  let j = polygon.length - 1;
  for (let i = 0; i < polygon.length; i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
    j = i;
  }

  return inside;
};

const heatmapPointConfig = reactive({
  density: 5 // 点密度（点/平方米）
});

// 修改 generateRandomPointsInPolygon 函数
const generateRandomPointsInPolygon = (coordinates: number[][], density: number): [number, number][] => {
  if (!coordinates || coordinates.length < 3) {
    return [];
  }

  // 计算多边形边界框
  const lngs = coordinates.map((coord) => coord[0]);
  const lats = coordinates.map((coord) => coord[1]);
  const minX = Math.min(...lngs);
  const maxX = Math.max(...lngs);
  const minY = Math.min(...lats);
  const maxY = Math.max(...lats);

  // 计算地块面积（简化计算，实际应使用更精确的方法）
  const width = maxX - minX;
  const height = maxY - minY;
  const area = width * height;
  console.log('area:', area);

  // 根据密度和面积计算点数量
  // 密度单位：点/单位面积
  const pointCount = Math.max(1, Math.min(50, Math.round(area * density * 1000000)));
  console.log('pointCount:', pointCount);

  const points: [number, number][] = [];
  let attempts = 0;
  const maxAttempts = pointCount * 20; // 防止无限循环

  while (points.length < pointCount && attempts < maxAttempts) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);

    if (isPointInPolygon([x, y], coordinates)) {
      points.push([x, y]);
    }
    attempts++;
  }

  return points;
};

// 生成多边形内的网格点（自适应密度）
// 综合生成策略，根据地块特征选择最适合的方法
// 计算多边形的几何中心点（质心）
const calculatePolygonCenter = (coordinates: number[][]): [number, number] | null => {
  if (!coordinates || coordinates.length < 3) {
    return null;
  }

  let area = 0;
  let centroidX = 0;
  let centroidY = 0;

  // 使用多边形质心算法
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
    // 如果面积为0，返回算术中心
    const sumX = coordinates.reduce((sum, coord) => sum + coord[0], 0);
    const sumY = coordinates.reduce((sum, coord) => sum + coord[1], 0);
    return [sumX / coordinates.length, sumY / coordinates.length];
  }

  centroidX /= 6 * area;
  centroidY /= 6 * area;

  // 验证质心是否在多边形内部，如果不在则使用边界框中心
  if (!isPointInPolygon([centroidX, centroidY], coordinates)) {
    const lngs = coordinates.map((coord) => coord[0]);
    const lats = coordinates.map((coord) => coord[1]);
    return [(Math.min(...lngs) + Math.max(...lngs)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
  }

  return [centroidX, centroidY];
};

// 图层控制状态
const layerControl = reactive({
  boundary: true, // 边界信息图层
  uavGrowth: true, // 无人机长势结果图层
  satelliteGrowth: true, // 遥感卫星长势结果图层
  laiHeatmap: false, // LAI热力图图层
  spadHeatmap: false // SPAD热力图图层
});

// 工具提示相关状态
const showTooltip = ref(false);
const tooltipStyle = reactive({
  left: '0px',
  top: '0px'
});
const tooltipTitle = ref('');
const tooltipItems = ref<{ label: string; value: any }[]>([]);

// 长势等级映射
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

// 长势等级图例数据
const growthLegends = [
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

// 切换图层显示状态
const toggleLayer = (layerId: string, visible: boolean) => {
  if (mapRef.value) {
    mapRef.value.updateLayerVisibility(layerId, visible);
  }
};

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
    // 无人机长势数据使用地块单元数据作为基础
    let uavGrowthData = JSON.parse(JSON.stringify(landUnitData));
    let predictionClassData = await predictionClassResponse.json();

    // 如果有基地ID，过滤数据
    if (props.baseId) {
      // 过滤地块单元数据
      if (landUnitData.features && Array.isArray(landUnitData.features)) {
        landUnitData.features = landUnitData.features.filter((feature) => feature.properties && feature.properties.baseId == props.baseId);
      }

      // 过滤无人机长势数据
      if (uavGrowthData.features && Array.isArray(uavGrowthData.features)) {
        uavGrowthData.features = uavGrowthData.features.filter((feature) => feature.properties && feature.properties.baseId == props.baseId);
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

    // 根据无人机长势数据对地块边界进行二次过滤，只显示存在无人机长势的地块边界
    if (uavGrowthData.features && uavGrowthData.features && diagnosisList.value.length > 0) {
      // 创建一个包含所有无人机长势数据plotId的集合
      const uavPlotIds = new Set(diagnosisList.value.map((item) => item.plotId));

      // 过滤地块单元数据，只保留存在无人机长势数据的地块
      if (uavGrowthData.features && Array.isArray(uavGrowthData.features)) {
        uavGrowthData.features = uavGrowthData.features.filter((feature) => feature.properties && uavPlotIds.has(feature.properties.landId));
      }
    }

    // 从JSON文件加载备选数据
    await loadJsonData();

    // 创建图层数据
    localMapLayers.value = [
      {
        id: 'land_unit',
        name: '边界信息',
        type: 'polygon',
        data: landUnitData,
        visible: layerControl.boundary,
        zIndex: 9,
        minDisplayZoom: 15,
        emitEvent: true,
        emitRightClickEvent: true,
        updateWhileAnimating: false,
        updateWhileInteracting: false
      },
      {
        id: 'uav_growth',
        name: '无人机长势结果',
        type: 'polygon',
        data: uavGrowthData,
        visible: layerControl.uavGrowth,
        zIndex: 8,
        minDisplayZoom: 15,
        emitEvent: true,
        emitRightClickEvent: true,
        updateWhileAnimating: false,
        updateWhileInteracting: false
      },
      {
        id: 'prediction_class',
        name: '遥感卫星长势结果',
        type: 'polygon',
        data: predictionClassData,
        visible: layerControl.satelliteGrowth,
        zIndex: 7,
        minDisplayZoom: 15,
        emitEvent: true,
        emitRightClickEvent: true,
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

// 根据长势等级获取颜色
const getColorByLevel = (level: string | undefined) => {
  if (level === undefined) {
    return 'rgba(0,0,0,0)';
  }

  switch (level) {
    case '良好':
      return 'rgb(0,128,0, 0.6)'; // 良好 - 绿色
    case '正常':
      return 'rgb(0, 200, 0, 0.6)'; // 正常 - 浅绿
    case '较差':
      return 'rgb(184,224,111, 0.6)'; // 较差 - 黄绿
    default:
      return 'rgba(0,0,0,0)'; // 默认透明
  }
};

// 带样式的图层数据
const styledMapLayers = computed(() => {
  // 添加一个依赖于growthLevels的响应式引用，确保当growthLevels变化时重新计算
  const levels = { ...growthLevels.value };

  // 创建一个集合，包含所有有接口数据的地块ID
  const plottedLandIds = new Set(diagnosisList.value.map((item) => item.plotId));

  return localMapLayers.value.map((layer) => {
    if (layer.id === 'land_unit') {
      return {
        ...layer,
        visible: layerControl.boundary,
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
                color = 'rgb(0,0,0,0)'; // 默认灰色
            }
          }

          return new Style({
            fill: new Fill({
              color: 'rgba(0,0,0,0)' // 地块图层始终透明，不根据长势数据变色
            }),
            stroke: new Stroke({
              color: 'rgba(255, 255, 255, 0.3)', // 将地块边界颜色改为白色
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
    } else if (layer.id === 'uav_growth') {
      return {
        ...layer,
        visible: layerControl.uavGrowth,
        // 自定义渲染函数
        customStyle: (feature) => {
          const landId = feature.get('landId');
          // 使用地块ID(landId)进行匹配，与长势数据中的plotId对应
          const level = levels[landId];

          // 根据长势等级设置颜色
          const color = layerControl.uavGrowth && level ? getColorByLevel(level) : 'rgba(0,0,0,0)';

          return new Style({
            fill: new Fill({
              color: color
            }),
            stroke: new Stroke({
              color: 'rgba(255, 255, 255, 0)', // 将地块边界颜色改为白色
              width: 1.5
            })
          });
        }
      };
    } else if (layer.id === 'prediction_class') {
      return {
        ...layer,
        visible: layerControl.satelliteGrowth,
        // 自定义渲染函数
        customStyle: (feature) => {
          const landId = feature.get('landId');

          // 只有在卫星长势结果图层开启时才显示预测数据
          if (layerControl.satelliteGrowth) {
            // 检查该地块是否有接口数据（无人机数据）
            const hasUavData = plottedLandIds.has(landId);

            // 当卫星和无人机图层同时开启时，如果地块有无人机数据，则不显示卫星数据
            if (layerControl.uavGrowth && hasUavData) {
              return new Style({
                fill: new Fill({ color: 'rgba(0, 0, 0, 0)' }),
                stroke: new Stroke({
                  color: 'rgba(0, 0, 0, 0)',
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
                color: 'rgba(255, 255, 255, 0.8)', // 将预测分类图层的边界也改为白色
                width: 0.1
              })
            });
          } else {
            // 卫星长势结果图层关闭时，不显示任何内容
            return new Style({
              fill: new Fill({ color: 'rgba(0, 0, 0, 0)' }),
              stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0)',
                width: 0
              })
            });
          }
        }
      };
    }
    return layer;
  });
});

// 计算当前应该显示的图例
const currentLegends = computed(() => {
  // 只有当无人机长势结果或卫星长势结果被选中时，才显示长势图例
  if (layerControl.uavGrowth || layerControl.satelliteGrowth) {
    return growthLegends;
  }

  // 默认不显示图例
  return [];
});

// 计算图例渐变样式
const legendGradientStyle = computed(() => {
  const colors = activeHeatmapType.value === 'spad' ? spadHeatmapConfig.gradient : laiHeatmapConfig.gradient;

  // 如果没有颜色数组或为空，使用默认颜色
  if (!colors || colors.length === 0) {
    const defaultColors = ['#cdfdc6', '#75fc4d', '#67df43', '#5ac53a', '#4dab31', '#3c8725', '#296118', '#163b0b', '#041502'];
    const gradientStops = defaultColors.map((color, index) => `${color} ${(index / (defaultColors.length - 1)) * 100}%`).join(', ');

    return {
      background: `linear-gradient(to right, ${gradientStops})`
    };
  }

  // 确保至少有两个颜色才能创建渐变
  if (colors.length < 2) {
    return {
      background: colors[0] || '#1aaa28'
    };
  }

  const gradientStops = colors.map((color, index) => `${color} ${(index / (colors.length - 1)) * 100}%`).join(', ');

  return {
    background: `linear-gradient(to right, ${gradientStops})`
  };
});

// 计算图例数值标签
const legendLabels = computed(() => {
  const precision = 2;
  let stats = laiHeatmapStats;

  // 根据当前激活的热力图类型选择统计数据
  if (activeHeatmapType.value === 'spad') {
    stats = spadHeatmapStats;
  }

  if (stats.pointCount === 0) {
    const minVal = 0;
    const maxVal = 1;
    const midVal = (minVal + maxVal) / 2;

    return {
      min: minVal.toFixed(precision),
      mid: midVal.toFixed(precision),
      max: maxVal.toFixed(precision),
      unit: ''
    };
  }

  try {
    const min = stats.min;
    const max = stats.max;
    const mid = (min + max) / 2;

    return {
      min: min.toFixed(precision),
      mid: mid.toFixed(precision),
      max: max.toFixed(precision),
      unit: ''
    };
  } catch (error) {
    console.error('计算图例标签时出错:', error);
    return {
      min: '0.00',
      mid: '0.50',
      max: '1.00',
      unit: ''
    };
  }
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

  // 初始化热力图图层
  initHeatmapLayer(mapInstance);
};

// 初始化热力图图层
const initHeatmapLayer = (mapInstance: any) => {
  if (!mapInstance || !mapInstance.getMap) return;

  const map = mapInstance.getMap();
  if (!map) return;

  // 创建LAI热力图数据源
  const laiVectorSource = new VectorSource<Point>();
  // 创建SPAD热力图数据源
  const spadVectorSource = new VectorSource<Point>();

  // 创建LAI热力图图层
  const laiHeatmapLayer = new HeatmapLayer({
    source: laiVectorSource,
    blur: laiHeatmapConfig.blur,
    radius: laiHeatmapConfig.radius,
    opacity: laiHeatmapConfig.opacity,
    gradient: laiHeatmapConfig.gradient,
    weight: function (feature: Feature) {
      return feature.get('weight') || 0;
    }
  });

  // 创建SPAD热力图图层
  const spadHeatmapLayer = new HeatmapLayer({
    source: spadVectorSource,
    blur: spadHeatmapConfig.blur,
    radius: spadHeatmapConfig.radius,
    opacity: spadHeatmapConfig.opacity,
    gradient: spadHeatmapConfig.gradient,
    weight: function (feature: Feature) {
      return feature.get('weight') || 0;
    }
  });

  // 设置图层属性以便后续操作
  (laiHeatmapLayer as any).set('id', 'lai_heatmap_layer');
  (spadHeatmapLayer as any).set('id', 'spad_heatmap_layer');

  // 将热力图图层添加到地图
  map.addLayer(laiHeatmapLayer);
  map.addLayer(spadHeatmapLayer);

  // 保存热力图图层引用
  laiHeatmapLayerRef.value = laiHeatmapLayer;
  spadHeatmapLayerRef.value = spadHeatmapLayer;

  // 监听地图视图变化事件，用于动态调整热力图参数
  map.getView().on('change:resolution', () => {
    updateHeatmapStyleByResolution();
  });

  // 默认隐藏热力图图层
  laiHeatmapLayer.setVisible(false);
  spadHeatmapLayer.setVisible(false);

  console.log('热力图图层初始化完成');
};

// 切换LAI热力图显示状态
const toggleLaiHeatmapLayer = (visible: boolean) => {
  layerControl.laiHeatmap = visible;

  if (laiHeatmapLayerRef.value) {
    laiHeatmapLayerRef.value.setVisible(visible);

    // 如果是显示热力图，加载热力图数据
    if (visible) {
      activeHeatmapType.value = 'lai';
      loadLaiHeatmapData();
    } else if (!layerControl.spadHeatmap) {
      // 如果两个热力图都关闭，则隐藏面板
      activeHeatmapType.value = null;
      controlsPanel.visible = false;
      statsPanel.visible = false;
    }
  }
};

// 切换SPAD热力图显示状态
const toggleSpadHeatmapLayer = (visible: boolean) => {
  layerControl.spadHeatmap = visible;

  if (spadHeatmapLayerRef.value) {
    spadHeatmapLayerRef.value.setVisible(visible);

    // 如果是显示热力图，加载热力图数据
    if (visible) {
      activeHeatmapType.value = 'spad';
      loadSpadHeatmapData();
    } else if (!layerControl.laiHeatmap) {
      // 如果两个热力图都关闭，则隐藏面板
      activeHeatmapType.value = null;
      controlsPanel.visible = false;
      statsPanel.visible = false;
    }
  }
};

// 加载LAI热力图数据
const loadLaiHeatmapData = async () => {
  if (!laiHeatmapLayerRef.value) return;

  // 从诊断历史数据和预测分类数据中获取热力图数据
  let heatPoints: any[] = [];

  // 检查是否已加载边界数据
  if (!localMapLayers.value || localMapLayers.value.length === 0) {
    console.warn('未加载地图图层数据，无法生成热力点');
    return;
  }

  // 查找地块边界图层
  const landUnitLayer = localMapLayers.value.find((layer) => layer.id === 'land_unit');
  if (!landUnitLayer || !landUnitLayer.data || !landUnitLayer.data.features) {
    console.warn('未找到地块边界数据，无法生成热力点');
    return;
  }

  const features = landUnitLayer.data.features;

  // 创建地块ID映射表，便于快速查找
  const plotMap = new Map<string, any>();

  features.forEach((feature: any, featureIndex: number) => {
    const properties = feature.properties;
    const landId = properties?.landId;

    if (landId) {
      plotMap.set(landId, { feature, featureIndex, properties });
    }
  });

  console.log(`地块映射表构建完成，包含 ${plotMap.size} 个地块`);

  // 生成热力点
  let matchedCount = 0;
  let unmatchedCount = 0;

  // 处理诊断历史数据
  if (diagnosisList.value && diagnosisList.value.length > 0) {
    diagnosisList.value.forEach((record: any, index: number) => {
      const plotId = record.plotId;

      if (plotMap.has(plotId)) {
        const { feature, featureIndex, properties } = plotMap.get(plotId);
        const geometry = feature.geometry;

        // 处理不同的几何类型
        let polygons: number[][][] = [];

        if (geometry?.type === 'Polygon') {
          polygons = [geometry.coordinates[0]];
        } else if (geometry?.type === 'MultiPolygon') {
          polygons = geometry.coordinates.map((polygon: number[][][]) => polygon[0]);
        }

        polygons.forEach((coordinates, polyIndex) => {
          if (coordinates && coordinates.length > 3) {
            // 生成地块内的网格点

            // 使用LAI值作为热力图数据
            const rawValue = record.laiPrediction !== undefined ? record.laiPrediction : record.laiValue !== undefined ? record.laiValue : 0;

            // 确保值在合理范围内
            let normalizedValue = Math.max(0, Math.min(5, rawValue));
            const gridPoints = generateRandomPointsInPolygon(coordinates, heatmapPointConfig.density);
            // 为每个网格点创建热力点
            gridPoints.forEach((coordinate, pointIndex) => {
              heatPoints.push({
                id: `diagnosis_${record.id || index}_${polyIndex}_${pointIndex}`,
                coordinate: coordinate,
                value: normalizedValue,
                weight: normalizedValue / 5 // 基于0-10范围归一化为0-1
              });
            });

            matchedCount += gridPoints.length;
          }
        });
      } else {
        console.warn(`未找到匹配的地块: plotId=${plotId}`);
        unmatchedCount++;
      }
    });
  }

  // 处理JSON数据
  if (jsonDataList.value && jsonDataList.value.length > 0) {
    jsonDataList.value.forEach((record: any, index: number) => {
      const plotId = record.plotId;

      // 检查是否已经添加过该地块的数据（避免重复）
      const alreadyExists = heatPoints.some(
        (point) => point.id.startsWith(`diagnosis_${record.id}`) || point.id.startsWith(`prediction_${record.id}`)
      );
      if (alreadyExists) return;

      if (plotMap.has(plotId)) {
        const { feature, featureIndex, properties } = plotMap.get(plotId);
        const geometry = feature.geometry;

        // 处理不同的几何类型
        let polygons: number[][][] = [];

        if (geometry?.type === 'Polygon') {
          polygons = [geometry.coordinates[0]];
        } else if (geometry?.type === 'MultiPolygon') {
          polygons = geometry.coordinates.map((polygon: number[][][]) => polygon[0]);
        }

        polygons.forEach((coordinates, polyIndex) => {
          if (coordinates && coordinates.length > 3) {
            // 使用LAI值作为热力图数据
            const rawValue = record.laiPrediction !== undefined ? record.laiPrediction : record.laiValue !== undefined ? record.laiValue : 0;

            // 确保值在合理范围内
            let normalizedValue = Math.max(0, Math.min(10, rawValue));
            // 生成地块内的网格点
            const gridPoints = generateRandomPointsInPolygon(coordinates, heatmapPointConfig.density);
            // 为每个网格点创建热力点
            gridPoints.forEach((coordinate, pointIndex) => {
              heatPoints.push({
                id: `prediction_${record.id || index}_${polyIndex}_${pointIndex}`,
                coordinate: coordinate,
                value: normalizedValue,
                weight: normalizedValue / 10 // 基于0-10范围归一化为0-1
              });
            });

            matchedCount += gridPoints.length;
          }
        });
      } else {
        console.warn(`未找到匹配的地块: plotId=${plotId}`);
        unmatchedCount++;
      }
    });
  }

  const featuresHeatmap: Feature[] = heatPoints.map((point) => {
    const feature = new Feature({
      geometry: new Point(point.coordinate),
      weight: point.weight || point.value,
      value: point.value,
      id: point.id
    });
    return feature;
  });

  const source = laiHeatmapLayerRef.value.getSource();
  source.clear();
  source.addFeatures(featuresHeatmap);

  // 更新统计数据
  updateLaiHeatmapStats(heatPoints);

  console.log(`LAI热力图数据加载完成，共 ${featuresHeatmap.length} 个热力点`);
  console.log(`- 成功匹配: ${matchedCount} 个地块`);
  console.log(`- 未匹配: ${unmatchedCount} 个记录`);
};

// 加载SPAD热力图数据
const loadSpadHeatmapData = async () => {
  if (!spadHeatmapLayerRef.value) return;

  // 从诊断历史数据和预测分类数据中获取热力图数据
  let heatPoints: any[] = [];

  // 检查是否已加载边界数据
  if (!localMapLayers.value || localMapLayers.value.length === 0) {
    console.warn('未加载地图图层数据，无法生成热力点');
    return;
  }

  // 查找地块边界图层
  const landUnitLayer = localMapLayers.value.find((layer) => layer.id === 'land_unit');
  if (!landUnitLayer || !landUnitLayer.data || !landUnitLayer.data.features) {
    console.warn('未找到地块边界数据，无法生成热力点');
    return;
  }

  const features = landUnitLayer.data.features;

  // 创建地块ID映射表，便于快速查找
  const plotMap = new Map<string, any>();

  features.forEach((feature: any, featureIndex: number) => {
    const properties = feature.properties;
    const landId = properties?.landId;

    if (landId) {
      plotMap.set(landId, { feature, featureIndex, properties });
    }
  });

  console.log(`地块映射表构建完成，包含 ${plotMap.size} 个地块`);

  // 生成热力点
  let matchedCount = 0;
  let unmatchedCount = 0;

  // 处理诊断历史数据
  if (diagnosisList.value && diagnosisList.value.length > 0) {
    diagnosisList.value.forEach((record: any, index: number) => {
      const plotId = record.plotId;

      if (plotMap.has(plotId)) {
        const { feature, featureIndex, properties } = plotMap.get(plotId);
        const geometry = feature.geometry;

        // 处理不同的几何类型
        let polygons: number[][][] = [];

        if (geometry?.type === 'Polygon') {
          polygons = [geometry.coordinates[0]];
        } else if (geometry?.type === 'MultiPolygon') {
          polygons = geometry.coordinates.map((polygon: number[][][]) => polygon[0]);
        }

        polygons.forEach((coordinates, polyIndex) => {
          if (coordinates && coordinates.length > 3) {
            // 使用SPAD值作为热力图数据
            const rawValue = record.spadPrediction !== undefined ? record.spadPrediction : record.spadValue !== undefined ? record.spadValue : 0;

            // 确保值在合理范围内
            let normalizedValue = Math.max(0, Math.min(100, rawValue)); // SPAD值范围通常更大
            // 生成地块内的网格点
            const gridPoints = generateRandomPointsInPolygon(coordinates, heatmapPointConfig.density);
            // 为每个网格点创建热力点
            gridPoints.forEach((coordinate, pointIndex) => {
              heatPoints.push({
                id: `diagnosis_${record.id || index}_${polyIndex}_${pointIndex}`,
                coordinate: coordinate,
                value: normalizedValue,
                weight: normalizedValue / 100 // 基于0-100范围归一化为0-1
              });
            });

            matchedCount += gridPoints.length;
          }
        });
      } else {
        console.warn(`未找到匹配的地块: plotId=${plotId}`);
        unmatchedCount++;
      }
    });
  }

  // 处理JSON数据
  if (jsonDataList.value && jsonDataList.value.length > 0) {
    jsonDataList.value.forEach((record: any, index: number) => {
      const plotId = record.plotId;

      // 检查是否已经添加过该地块的数据（避免重复）
      const alreadyExists = heatPoints.some(
        (point) => point.id.startsWith(`diagnosis_${record.id}`) || point.id.startsWith(`prediction_${record.id}`)
      );
      if (alreadyExists) return;

      if (plotMap.has(plotId)) {
        const { feature, featureIndex, properties } = plotMap.get(plotId);
        const geometry = feature.geometry;

        // 处理不同的几何类型
        let polygons: number[][][] = [];

        if (geometry?.type === 'Polygon') {
          polygons = [geometry.coordinates[0]];
        } else if (geometry?.type === 'MultiPolygon') {
          polygons = geometry.coordinates.map((polygon: number[][][]) => polygon[0]);
        }

        polygons.forEach((coordinates, polyIndex) => {
          if (coordinates && coordinates.length > 3) {
            // 使用SPAD值作为热力图数据
            const rawValue = record.spadPrediction !== undefined ? record.spadPrediction : record.spadValue !== undefined ? record.spadValue : 0;

            // 确保值在合理范围内
            let normalizedValue = Math.max(0, Math.min(100, rawValue)); // SPAD值范围通常更大
            // 生成地块内的网格点
            const gridPoints = generateRandomPointsInPolygon(coordinates, heatmapPointConfig.density);

            // 为每个网格点创建热力点
            gridPoints.forEach((coordinate, pointIndex) => {
              heatPoints.push({
                id: `prediction_${record.id || index}_${polyIndex}_${pointIndex}`,
                coordinate: coordinate,
                value: normalizedValue,
                weight: normalizedValue / 100 // 基于0-100范围归一化为0-1
              });
            });

            matchedCount += gridPoints.length;
          }
        });
      } else {
        console.warn(`未找到匹配的地块: plotId=${plotId}`);
        unmatchedCount++;
      }
    });
  }

  const featuresHeatmap: Feature[] = heatPoints.map((point) => {
    const feature = new Feature({
      geometry: new Point(point.coordinate),
      weight: point.weight || point.value,
      value: point.value,
      id: point.id
    });
    return feature;
  });

  const source = spadHeatmapLayerRef.value.getSource();
  source.clear();
  source.addFeatures(featuresHeatmap);

  // 更新统计数据
  updateSpadHeatmapStats(heatPoints);

  console.log(`SPAD热力图数据加载完成，共 ${featuresHeatmap.length} 个热力点`);
  console.log(`- 成功匹配: ${matchedCount} 个地块`);
  console.log(`- 未匹配: ${unmatchedCount} 个记录`);
};

// 更新LAI热力图统计数据
const updateLaiHeatmapStats = (heatPoints: any[]) => {
  if (heatPoints.length === 0) {
    laiHeatmapStats.pointCount = 0;
    laiHeatmapStats.average = 0;
    laiHeatmapStats.max = 0;
    laiHeatmapStats.min = 0;
    return;
  }

  const values = heatPoints.map((point) => point.value);
  laiHeatmapStats.pointCount = heatPoints.length;
  laiHeatmapStats.max = Math.max(...values);
  laiHeatmapStats.min = Math.min(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  laiHeatmapStats.average = sum / values.length;
};

// 更新SPAD热力图统计数据
const updateSpadHeatmapStats = (heatPoints: any[]) => {
  if (heatPoints.length === 0) {
    spadHeatmapStats.pointCount = 0;
    spadHeatmapStats.average = 0;
    spadHeatmapStats.max = 0;
    spadHeatmapStats.min = 0;
    return;
  }

  const values = heatPoints.map((point) => point.value);
  spadHeatmapStats.pointCount = heatPoints.length;
  spadHeatmapStats.max = Math.max(...values);
  spadHeatmapStats.min = Math.min(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  spadHeatmapStats.average = sum / values.length;
};

// 更新LAI热力图半径
// 更新SPAD热力图半径
// 根据地图分辨率动态调整热力图参数（基于地理距离）
const updateHeatmapStyleByResolution = () => {
  if ((!laiHeatmapLayerRef.value && !spadHeatmapLayerRef.value) || !mzMapInstance.value) return;

  const map = mzMapInstance.value.getMap();
  if (!map) return;

  const view = map.getView();
  const resolution = view.getResolution();

  if (resolution === undefined) return;

  // 获取投影单位与米的转换关系
  const projection = view.getProjection();
  const metersPerUnit = projection.getMetersPerUnit();

  // 计算转换因子
  const factor = resolution * metersPerUnit;

  // LAI热力图参数调整
  if (laiHeatmapLayerRef.value) {
    // 根据基准地理距离计算像素值
    const laiAdjustedBlur = (laiHeatmapZoomConfig.blurKm * 1000) / factor;
    const laiAdjustedRadius = (laiHeatmapZoomConfig.radiusKm * 1000) / factor;

    // 更新热力图样式
    laiHeatmapLayerRef.value.setRadius(laiAdjustedRadius);
    laiHeatmapLayerRef.value.setBlur(laiAdjustedBlur);

    // 同步更新配置
    laiHeatmapConfig.radius = laiAdjustedRadius;
    laiHeatmapConfig.blur = laiAdjustedBlur;
  }

  // SPAD热力图参数调整
  if (spadHeatmapLayerRef.value) {
    // 根据基准地理距离计算像素值
    const spadAdjustedBlur = (spadHeatmapZoomConfig.blurKm * 1000) / factor;
    const spadAdjustedRadius = (spadHeatmapZoomConfig.radiusKm * 1000) / factor;

    // 更新热力图样式
    spadHeatmapLayerRef.value.setRadius(spadAdjustedRadius);
    spadHeatmapLayerRef.value.setBlur(spadAdjustedBlur);

    // 同步更新配置
    spadHeatmapConfig.radius = spadAdjustedRadius;
    spadHeatmapConfig.blur = spadAdjustedBlur;
  }
};
// 添加监听器
watch(
  () => heatmapPointConfig.density,
  () => {
    // 当密度改变时，自动重新加载热力图数据
    if (layerControl.laiHeatmap || layerControl.spadHeatmap) {
      reloadHeatmapData();
    }
  }
);
// 更新LAI热力图模糊
// 更新SPAD热力图模糊
// 更新LAI热力图透明度
const updateLaiHeatmapOpacity = () => {
  if (laiHeatmapLayerRef.value) {
    laiHeatmapLayerRef.value.setOpacity(laiHeatmapConfig.opacity);
  }
};

// 更新SPAD热力图透明度
const updateSpadHeatmapOpacity = () => {
  if (spadHeatmapLayerRef.value) {
    spadHeatmapLayerRef.value.setOpacity(spadHeatmapConfig.opacity);
  }
};

// 更新LAI热力图渐变色
const updateLaiHeatmapGradient = () => {
  if (laiHeatmapLayerRef.value) {
    laiHeatmapLayerRef.value.setGradient(laiHeatmapConfig.gradient);
  }
};

// 更新SPAD热力图渐变色
const updateSpadHeatmapGradient = () => {
  if (spadHeatmapLayerRef.value) {
    spadHeatmapLayerRef.value.setGradient(spadHeatmapConfig.gradient);
  }
};

// 应用LAI颜色方案
const applyLaiGradient = () => {
  const gradient = gradientSchemes[selectedLaiGradient.value as keyof typeof gradientSchemes];
  if (gradient && gradient.length > 0) {
    laiHeatmapConfig.gradient = gradient;
    updateLaiHeatmapGradient();
  }
};

// 应用SPAD颜色方案
const applySpadGradient = () => {
  const gradient = gradientSchemes[selectedSpadGradient.value as keyof typeof gradientSchemes];
  if (gradient && gradient.length > 0) {
    spadHeatmapConfig.gradient = gradient;
    updateSpadHeatmapGradient();
  }
};

// 获取面板引用
const getPanelRef = (panelType: string) => {
  switch (panelType) {
    case 'controls':
      return controlsPanel;
    case 'stats':
      return statsPanel;
    default:
      return null;
  }
};

// 开始拖拽
const startDrag = (event: MouseEvent, panelType: string) => {
  event.preventDefault();

  dragState.isDragging = true;
  dragState.currentPanel = panelType;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;

  const panel = getPanelRef(panelType);
  if (panel) {
    dragState.startPanelX = panel.x;
    dragState.startPanelY = panel.y;
  }

  // 添加全局事件监听
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', endDrag);
};

// 处理拖拽
const handleDrag = (event: MouseEvent) => {
  if (!dragState.isDragging) return;

  const deltaX = event.clientX - dragState.startX;
  const deltaY = event.clientY - dragState.startY;

  const panel = getPanelRef(dragState.currentPanel);
  if (panel) {
    panel.x = dragState.startPanelX + deltaX;
    panel.y = dragState.startPanelY + deltaY;

    // 确保面板不会拖出可视区域
    panel.x = Math.max(0, Math.min(panel.x, window.innerWidth - 300));
    panel.y = Math.max(0, Math.min(panel.y, window.innerHeight - 200));
  }
};

// 结束拖拽
const endDrag = () => {
  dragState.isDragging = false;
  dragState.currentPanel = '';

  // 移除全局事件监听
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', endDrag);
};

// 切换面板展开状态
const togglePanel = (panelType: string) => {
  const panel = getPanelRef(panelType);
  if (panel) {
    panel.expanded = !panel.expanded;
  }
};

// 关闭面板
const closePanel = (panelType: string) => {
  const panel = getPanelRef(panelType);
  if (panel) {
    panel.visible = false;
  }
};

// 显示面板
const showPanelById = (panelType: string) => {
  const panel = getPanelRef(panelType);
  if (panel) {
    panel.visible = true;
  }
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

// 重新加载热力图数据
const reloadHeatmapData = () => {
  if (layerControl.laiHeatmap) {
    loadLaiHeatmapData();
  }
  if (layerControl.spadHeatmap) {
    loadSpadHeatmapData();
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

  // 刷新热力图数据
  if (layerControl.laiHeatmap) {
    loadLaiHeatmapData();
  }
  if (layerControl.spadHeatmap) {
    loadSpadHeatmapData();
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
    <!-- 图层控制栏 -->
    <div class="layer-control-bar">
      <label>
        <input v-model="layerControl.boundary" type="checkbox" @change="toggleLayer('land_unit', layerControl.boundary)" />
        地块边界
      </label>
      <label>
        <input
          v-model="layerControl.uavGrowth"
          type="checkbox"
          @change="
            () => {
              // 无人机长势结果即显示地块，又通过接口改变地块颜色
              toggleLayer('uav_growth', layerControl.uavGrowth);
            }
          "
        />
        无人机长势
      </label>
      <label>
        <input
          v-model="layerControl.satelliteGrowth"
          type="checkbox"
          @change="
            () => {
              // 遥感卫星长势结果显示预测json的结果
              toggleLayer('prediction_class', layerControl.satelliteGrowth);
            }
          "
        />
        遥感卫星长势
      </label>
      <label>
        <input v-model="layerControl.laiHeatmap" type="checkbox" @change="toggleLaiHeatmapLayer(layerControl.laiHeatmap)" />
        LAI热力图
      </label>
      <label>
        <input v-model="layerControl.spadHeatmap" type="checkbox" @change="toggleSpadHeatmapLayer(layerControl.spadHeatmap)" />
        SPAD热力图
      </label>
    </div>

    <MzMap
      ref="mapRef"
      :geodata="styledMapLayers"
      :legends="currentLegends"
      :base-name="initialBaseName"
      @map-loaded="handleMapLoaded"
      @feature-click="handleFeatureClick"
      @feature-right-click="handleRightClick"
    >
    </MzMap>

    <!-- 面板控制按钮组 -->
    <div v-if="layerControl.laiHeatmap || layerControl.spadHeatmap" class="panel-toggle-group">
      <button v-if="!controlsPanel.visible" class="toggle-btn" title="显示控制面板" @click="showPanelById('controls')">🎛️</button>
      <button v-if="!statsPanel.visible" class="toggle-btn" title="显示统计面板" @click="showPanelById('stats')">📊</button>
    </div>

    <!-- 可拖拽控制面板 -->
    <div
      v-if="(layerControl.laiHeatmap || layerControl.spadHeatmap) && controlsPanel.visible"
      class="draggable-panel"
      :style="{
        left: controlsPanel.x + 'px',
        top: controlsPanel.y + 'px'
      }"
    >
      <div class="panel-header" @mousedown="startDrag($event, 'controls')">
        <span class="panel-title">🎛️ 热力图控制</span>
        <div class="panel-controls">
          <button class="panel-btn collapse-btn" :class="{ collapsed: !controlsPanel.expanded }" @click.stop="togglePanel('controls')">▼</button>
          <button class="panel-btn close-btn" @click.stop="closePanel('controls')">✕</button>
        </div>
      </div>

      <div class="panel-content" :class="{ collapsed: !controlsPanel.expanded }">
        <div v-if="activeHeatmapType === 'lai'" class="control-item">
          <label>基准半径: {{ Math.round(laiHeatmapZoomConfig.radiusKm * 1000) }}米</label>
          <input
            v-model.number="laiHeatmapZoomConfig.radiusKm"
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            @input="updateHeatmapStyleByResolution"
          />
          <div class="control-hint">当前半径: {{ Math.round(laiHeatmapConfig.radius) }}px (随地图缩放自动调整)</div>
        </div>

        <div v-if="activeHeatmapType === 'spad'" class="control-item">
          <label>基准半径: {{ Math.round(spadHeatmapZoomConfig.radiusKm * 1000) }}米</label>
          <input
            v-model.number="spadHeatmapZoomConfig.radiusKm"
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            @input="updateHeatmapStyleByResolution"
          />
          <div class="control-hint">当前半径: {{ Math.round(spadHeatmapConfig.radius) }}px (随地图缩放自动调整)</div>
        </div>

        <div v-if="activeHeatmapType === 'lai'" class="control-item">
          <label>基准模糊: {{ Math.round(laiHeatmapZoomConfig.blurKm * 1000) }}米</label>
          <input
            v-model.number="laiHeatmapZoomConfig.blurKm"
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            @input="updateHeatmapStyleByResolution"
          />
          <div class="control-hint">当前模糊: {{ Math.round(laiHeatmapConfig.blur) }}px (随地图缩放自动调整)</div>
        </div>

        <div v-if="activeHeatmapType === 'spad'" class="control-item">
          <label>基准模糊: {{ Math.round(spadHeatmapZoomConfig.blurKm * 1000) }}米</label>
          <input
            v-model.number="spadHeatmapZoomConfig.blurKm"
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            @input="updateHeatmapStyleByResolution"
          />
          <div class="control-hint">当前模糊: {{ Math.round(spadHeatmapConfig.blur) }}px (随地图缩放自动调整)</div>
        </div>

        <div v-if="activeHeatmapType === 'lai'" class="control-item">
          <label>透明度: {{ Math.round(laiHeatmapConfig.opacity * 100) }}%</label>
          <input v-model.number="laiHeatmapConfig.opacity" type="range" min="0" max="1" step="0.05" @input="updateLaiHeatmapOpacity" />
        </div>

        <div v-if="activeHeatmapType === 'spad'" class="control-item">
          <label>透明度: {{ Math.round(spadHeatmapConfig.opacity * 100) }}%</label>
          <input v-model.number="spadHeatmapConfig.opacity" type="range" min="0" max="1" step="0.05" @input="updateSpadHeatmapOpacity" />
        </div>

        <div v-if="activeHeatmapType === 'lai'" class="control-item">
          <label>颜色方案:</label>
          <select v-model="selectedLaiGradient" @change="applyLaiGradient">
            <option value="default">默认</option>
            <option value="viridis">Viridis</option>
            <option value="plasma">Plasma</option>
            <option value="warm">暖色</option>
            <option value="cool">冷色</option>
            <option value="fire">火焰</option>
          </select>
        </div>

        <div v-if="activeHeatmapType === 'spad'" class="control-item">
          <label>颜色方案:</label>
          <select v-model="selectedSpadGradient" @change="applySpadGradient">
            <option value="default">默认</option>
            <option value="viridis">Viridis</option>
            <option value="plasma">Plasma</option>
            <option value="warm">暖色</option>
            <option value="cool">冷色</option>
            <option value="fire">火焰</option>
          </select>
        </div>

        <!-- 在控制面板中添加密度控制 -->
        <div class="control-item">
          <label>热力点密度: {{ heatmapPointConfig.density }} 点/平方千米</label>
          <input v-model.number="heatmapPointConfig.density" type="range" min="1" max="20" step="1" />
        </div>
      </div>
    </div>

    <!-- 可拖拽统计面板 -->
    <div
      v-if="(layerControl.laiHeatmap || layerControl.spadHeatmap) && statsPanel.visible"
      class="draggable-panel"
      :style="{
        left: statsPanel.x + 'px',
        top: statsPanel.y + 'px'
      }"
    >
      <div class="panel-header" @mousedown="startDrag($event, 'stats')">
        <span class="panel-title">📊 数据统计</span>
        <div class="panel-controls">
          <button class="panel-btn collapse-btn" :class="{ collapsed: !statsPanel.expanded }" @click.stop="togglePanel('stats')">▼</button>
          <button class="panel-btn close-btn" @click.stop="closePanel('stats')">✕</button>
        </div>
      </div>

      <div class="panel-content" :class="{ collapsed: !statsPanel.expanded }">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ activeHeatmapType === 'spad' ? spadHeatmapStats.pointCount : laiHeatmapStats.pointCount }}</div>
            <div class="stat-label">热力点</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              {{ activeHeatmapType === 'spad' ? spadHeatmapStats.average.toFixed(2) : laiHeatmapStats.average.toFixed(2) }}
            </div>
            <div class="stat-label">平均值</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ activeHeatmapType === 'spad' ? spadHeatmapStats.max.toFixed(2) : laiHeatmapStats.max.toFixed(2) }}</div>
            <div class="stat-label">最大值</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ activeHeatmapType === 'spad' ? spadHeatmapStats.min.toFixed(2) : laiHeatmapStats.min.toFixed(2) }}</div>
            <div class="stat-label">最小值</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热力图图例 -->
    <div v-if="layerControl.laiHeatmap || layerControl.spadHeatmap" class="heatmap-legend">
      <div class="legend-title">{{ activeHeatmapType === 'spad' ? 'SPAD指数' : 'LAI指数' }}</div>
      <div class="legend-bar" :style="legendGradientStyle"></div>
      <div class="legend-labels">
        <span class="legend-label-min">{{ legendLabels.min }}</span>
        <span class="legend-label-mid">{{ legendLabels.mid }}</span>
        <span class="legend-label-max">{{ legendLabels.max }}</span>
      </div>
    </div>

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

/* 面板控制按钮组 */
.panel-toggle-group {
  position: absolute;
  top: 10px;
  right: 50px;
  z-index: 1001;
  display: flex;
  gap: 5px;
}

.toggle-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover {
  background: #409eff;
  color: white;
  border-color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 可拖拽面板样式 */
.draggable-panel {
  position: absolute;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e4e7ed;
  min-width: 280px;
  max-width: 400px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.draggable-panel:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.panel-header {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: white;
  padding: 10px 15px;
  height: 40px;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header:hover {
  background: linear-gradient(135deg, #337ecc, #5a9dff);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.panel-controls {
  display: flex;
  gap: 5px;
}

.panel-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background-color 0.2s;
}

.panel-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.collapse-btn {
  transition: transform 0.3s ease;
}

.collapse-btn.collapsed {
  transform: rotate(-90deg);
}

.close-btn:hover {
  background: rgba(244, 67, 54, 0.8);
}

.panel-content {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.panel-content.collapsed {
  max-height: 0;
  padding: 0 20px;
  overflow: hidden;
}

.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 控制项样式 */
.control-item {
  margin-bottom: 15px;
}

.control-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.control-item input[type='range'] {
  width: 100%;
  margin-bottom: 5px;
}

.control-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.control-item select {
  width: 100%;
  padding: 4px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

/* 统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-card {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

/* 图例样式 */
.heatmap-legend {
  position: absolute;
  bottom: 30px;
  left: 30px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.legend-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
  text-align: center;
}

.legend-bar {
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-bottom: 5px;
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.legend-label-min,
.legend-label-mid,
.legend-label-max {
  font-weight: 500;
  color: #303133;
  text-align: center;
  flex: 1;
}

.legend-label-min {
  text-align: left;
}

.legend-label-max {
  text-align: right;
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
