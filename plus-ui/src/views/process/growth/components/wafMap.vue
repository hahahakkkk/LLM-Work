<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, toRefs } from 'vue';
import MzMap from '@/components/Map/MzMap.vue';
import { Style, Fill, Stroke, Text, Circle } from 'ol/style';
import { circular } from 'ol/geom/Polygon';
import { fromLonLat } from 'ol/proj';

import type { GeoData } from '@/components/Map/MzMap';
import { listWaf } from '@/views/process/growth/waf/api';
import { WafVO, WafQuery } from '@/views/process/growth/waf/api/types';
import { listFacility } from '@/views/four/api/facility';
import { FacilityVO } from '@/views/four/api/facility/types';
import { listSoilMoisture } from '@/views/process/growth/api/soilMoisture';
import { SoilMoistureVO, SoilMoistureQuery } from '@/views/process/growth/api/soilMoisture/types';

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

// 诊断结果弹窗相关状态
const showDiagnosisResult = ref(false);
const diagnosisData = ref({
  plotId: null,
  growthPeriod: '',
  lai: null,
  spad: null,
  growthLevel: ''
});

// 显示模式：'water' 表示缺水分布，'fertilizer' 表示缺肥分布
const displayMode = ref<'water' | 'fertilizer'>('water');

// 控制土壤墒情图层显示（包括设备和湿度数据）
const showSoilMoistureLayer = ref(false);

// 墒情监测站数据
const soilMoistureStations = ref<FacilityVO[]>([]);

// 土壤湿度数据
const soilMoistureData = ref<SoilMoistureVO[]>([]);

// 缺水等级映射
const waterLevelMap: Record<number, string> = {
  1: '轻微',
  2: '中度',
  3: '重度'
};

// 缺肥等级映射
const fertilizerLevelMap: Record<number, string> = {
  1: '轻微',
  2: '中度',
  3: '重度'
};

// 类别到颜色的映射（水肥等级）
const levelColorMap: Record<string, string> = {
  '轻微': 'rgb(144,238,144)', // 浅绿色
  '中度': 'rgb(255,165,0)', // 橙色
  '重度': 'rgb(255,0,0)' // 红色
};

// 土壤湿度等级颜色映射
const moistureLevelColors: Record<string, string> = {
  'low': 'rgb(255,0,0)', // 红色 - 重旱/中旱/轻旱
  'normal': 'rgb(144,238,144)', // 浅绿色 - 适宜
  'high': 'rgb(0,191,255)' // 蓝色 - 过湿
};

// 图例数据
const waterMapLegends = [
  {
    title: '缺水等级',
    items: [
      {
        label: '轻微',
        style: { backgroundColor: 'rgb(144,238,144)' },
        labelColor: '#000'
      },
      {
        label: '中度',
        style: { backgroundColor: 'rgb(255,165,0)' },
        labelStyle: {
          color: '#000'
        }
      },
      {
        label: '重度',
        style: { backgroundColor: 'rgb(255,0,0)' },
        labelColor: '#000'
      }
    ],
    position: {
      horizontal: '85%',
      vertical: '70%' // 调整位置避免与缺肥等级图例重叠
    },
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  }
];

const fertilizerMapLegends = [
  {
    title: '缺肥等级',
    items: [
      {
        label: '轻微',
        style: { backgroundColor: 'rgb(144,238,144)' },
        labelColor: '#000'
      },
      {
        label: '中度',
        style: { backgroundColor: 'rgb(255,165,0)' },
        labelStyle: {
          color: '#000'
        }
      },
      {
        label: '重度',
        style: { backgroundColor: 'rgb(255,0,0)' },
        labelColor: '#000'
      }
    ],
    position: {
      horizontal: '85%',
      vertical: '70%' // 调整位置避免与缺水等级图例重叠
    },
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  }
];

// 土壤湿度图例
const moistureMapLegends = [
  {
    title: '土壤墒情',
    items: [
      {
        label: '过湿',
        style: { backgroundColor: 'rgba(0,191,255,0.6)' },
        labelColor: '#000'
      },
      {
        label: '适宜',
        style: { backgroundColor: 'rgba(144,238,144,0.6)' },
        labelColor: '#000'
      },
      {
        label: '轻旱',
        style: { backgroundColor: 'rgba(255,165,0,0.6)' },
        labelColor: '#000'
      },
      {
        label: '中旱',
        style: { backgroundColor: 'rgba(255,140,0,0.6)' },
        labelColor: '#000'
      },
      {
        label: '重旱',
        style: { backgroundColor: 'rgba(255,0,0,0.6)' },
        labelColor: '#000'
      }
    ],
    position: {
      horizontal: '2%', // 放在左侧
      vertical: '70%'
    },
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  }
];

// 水肥数据列表
const wafList = ref<WafVO[]>([]);

const initQueryParams: WafQuery = {
  pageNum: 1,
  pageSize: 1000,
  baseId: undefined,
  plotId: undefined,
  growthPeriod: undefined,
  waterLevel: undefined,
  nutrientLevel: undefined,
  params: {}
};

const data = reactive<{
  queryParams: WafQuery;
}>({
  queryParams: { ...initQueryParams }
});

const { queryParams } = toRefs(data);

// 定义props
const props = defineProps<{
  initialBaseName?: string;
  geoJsonUrl?: string;
}>();

// 当前显示的等级数据（根据显示模式决定）
const currentLevels = computed(() => {
  return displayMode.value === 'water' ? growthLevels.value : nutrientLevels.value;
});

// 当前图例数据（根据显示模式决定）
const currentLegends = computed(() => {
  // 同时显示多个图例
  const legends = [];

  // 根据显示模式添加水肥图例（放在右侧）
  if (displayMode.value === 'water') {
    legends.push(waterMapLegends[0]);
  } else {
    legends.push(fertilizerMapLegends[0]);
  }

  // 如果显示土壤墒情图层，添加土壤湿度图例（放在左侧）
  if (showSoilMoistureLayer.value) {
    legends.push(moistureMapLegends[0]);
  }

  return legends;
});

// 获取墒情监测站数据
const fetchSoilMoistureStations = async () => {
  try {
    const res = await listFacility({
      facilityType: '2',
      pageNum: 1,
      pageSize: 1000
    }); // 2 代表墒情监测站
    soilMoistureStations.value = res.rows || [];

    // 获取最新的土壤湿度数据
    await fetchLatestSoilMoistureData();
  } catch (err) {
    console.error('获取墒情监测站数据失败:', err);
    soilMoistureStations.value = [];
  }
};

// 获取最新的土壤湿度数据（使用随机数据）
const fetchLatestSoilMoistureData = async () => {
  try {
    // 生成随机土壤湿度数据而不是从API获取
    const randomMoistureData: SoilMoistureVO[] = soilMoistureStations.value.map((station, index) => ({
      fourId: station.fourId || `mock_${index}`, // 使用设备的fourId或者生成一个
      baseId: station.baseId || '',
      facilityId: station.facilityId,
      shallowWater: parseFloat((Math.random() * 10 + 10).toFixed(2)), // 15-25之间的随机数，保留两位小数
      middleWater: parseFloat((Math.random() * 100).toFixed(2)),
      deepWater: parseFloat((Math.random() * 100).toFixed(2)),
      shallowTemperature: parseFloat((Math.random() * 40).toFixed(2)), // 0-40之间的随机数
      middleTemperature: parseFloat((Math.random() * 40).toFixed(2)),
      deepTemperature: parseFloat((Math.random() * 40).toFixed(2)),
      soilWd: '',
      soilDdl: '',
      soilPh: '',
      growthPeriod: 1,
      collectTime: new Date().toISOString(),
      remark: ''
    }));

    soilMoistureData.value = randomMoistureData;
  } catch (err) {
    console.error('生成随机土壤湿度数据失败:', err);
    soilMoistureData.value = [];
  }
};

// 根据土壤湿度值判断等级
const getMoistureLevel = (moisture: number): string => {
  // 田间持水量为20.5%
  const fieldCapacity = 20.5;
  // 计算土壤相对含水量
  const relativeWater = (moisture / fieldCapacity) * 100;

  // 根据陕西省和榆林市标准进行判断
  if (relativeWater > 80) return 'high'; // 过湿
  if (relativeWater >= 60) return 'normal'; // 适宜
  if (relativeWater >= 50) return 'low'; // 轻旱
  if (relativeWater >= 40) return 'low'; // 中旱
  return 'low'; // 重旱
};

// 根据土壤湿度值获取等级标签和颜色
const getMoistureLevelInfo = (moisture: number): { label: string; color: string } => {
  // 田间持水量为20.5%
  const fieldCapacity = 20.5;
  // 计算土壤相对含水量
  const relativeWater = (moisture / fieldCapacity) * 100;

  // 根据陕西省和榆林市标准进行判断
  if (relativeWater > 80) return { label: '过湿', color: 'rgba(0,191,255,0.2)' }; // 蓝色
  if (relativeWater >= 60) return { label: '适宜', color: 'rgba(144,238,144,0.2)' }; // 浅绿色
  if (relativeWater >= 50) return { label: '轻旱', color: 'rgba(255,165,0,0.2)' }; // 橙色
  if (relativeWater >= 40) return { label: '中旱', color: 'rgba(255,140,0,0.2)' }; // 深橙色
  return { label: '重旱', color: 'rgba(255,0,0,0.2)' }; // 红色
};

// 带样式的图层数据
const styledMapLayers = computed(() => {
  // 添加一个依赖于currentLevels的响应式引用，确保当currentLevels变化时重新计算
  const levels = { ...currentLevels.value };

  const layers = localMapLayers.value.map((layer) => {
    if (layer.id === 'land_unit') {
      return {
        ...layer,
        // 自定义渲染函数
        customStyle: (feature) => {
          const landCode = feature.get('landCode');
          const landId = feature.get('landId');
          // 使用地块ID(landId)进行匹配，与水肥数据中的plotId对应
          const level = levels[landId];

          // 根据等级设置颜色
          let color;
          if (level === undefined || level === '无数据') {
            // 没有数据时显示为灰色
            color = 'rgba(0,0,0,0)';
          } else {
            // 直接使用文字等级进行判断
            switch (level) {
              case '轻微':
                color = 'rgb(144,238,144, 0.6)'; // 轻微 - 浅绿色
                break;
              case '中度':
                color = 'rgb(255,165,0, 0.6)'; // 中度 - 橙色
                break;
              case '重度':
                color = 'rgb(255,0,0, 0.6)'; // 重度 - 红色
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
    } else if (layer.id === 'prediction_class') {
      return {
        ...layer,
        // 自定义渲染函数
        customStyle: (feature) => {
          const clazz = feature.get('class');
          const colorArray = feature.get('color');

          // 根据GeoJSON中的类别和颜色信息设置样式
          let color;
          if (clazz && colorArray) {
            // 使用GeoJSON中定义的颜色
            color = `rgba(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]}, 0.1)`;
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

  // 添加土壤墒情图层（包括设备和湿度数据）
  if (showSoilMoistureLayer.value && soilMoistureStations.value.length > 0) {
    // 添加设备点图层（显示设备编号）
    layers.push({
      id: 'soil_moisture_stations',
      name: '墒情监测站',
      type: 'point',
      data: {
        type: 'FeatureCollection',
        features: soilMoistureStations.value.map((station) => ({
          type: 'Feature',
          properties: {
            id: station.fourId,
            name: station.facilityId,
            type: '墒情监测站'
          },
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(station.facilityLongitude || '0'), parseFloat(station.facilityLatitude || '0')]
          }
        }))
      },
      visible: true,
      zIndex: 10,
      minDisplayZoom: 10,
      emitEvent: true,
      emitRightClickEvent: true,
      customStyle: (feature) => {
        return new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({
              color: 'rgba(0, 191, 255, 0.8)' // 深天蓝色
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 2
            })
          }),
          text: new Text({
            font: '12px 微软雅黑',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
            text: feature.get('name') || '' // 显示设备编号
          })
        });
      }
    });

    // 添加土壤湿度数据图层（根据墒情等级显示不同颜色的圆圈，具有实际地理尺寸）
    if (soilMoistureData.value.length > 0) {
      layers.push({
        id: 'soil_moisture_area',
        name: '土壤湿度区域',
        type: 'polygon', // 使用polygon类型来显示圆形区域
        data: {
          type: 'FeatureCollection',
          features: soilMoistureData.value.map((data, index) => {
            // 查找对应的监测站以获取坐标
            const station = soilMoistureStations.value.find((s) => s.facilityId === data.facilityId);

            // 获取坐标
            const center = station ? [parseFloat(station.facilityLongitude || '0'), parseFloat(station.facilityLatitude || '0')] : [0, 0];

            // 创建一个近似圆形的多边形（使用32个点）
            const sides = 32;
            const radius = 0.001; // 增大半径到约30米的近似值
            const coordinates = [[]];
            for (let i = 0; i < sides; i++) {
              const angle = (i * 2 * Math.PI) / sides;
              const dx = radius * Math.cos(angle);
              const dy = radius * Math.sin(angle);
              coordinates[0].push([center[0] + dx, center[1] + dy]);
            }
            // 闭合多边形
            coordinates[0].push(coordinates[0][0]);

            return {
              type: 'Feature',
              properties: {
                id: data.fourId || `soil_moisture_${index}`,
                facilityId: data.facilityId,
                shallowWater: data.shallowWater,
                collectTime: data.collectTime
              },
              geometry: {
                type: 'Polygon',
                coordinates: coordinates
              }
            };
          })
        },
        visible: true,
        zIndex: 11,
        minDisplayZoom: 10,
        emitEvent: true,
        emitRightClickEvent: true,
        customStyle: (feature) => {
          const shallowWater = Number(feature.get('shallowWater')) || 0;
          const levelInfo = getMoistureLevelInfo(shallowWater);
          const color = levelInfo.color;

          // 返回填充样式，使用统一颜色填充整个区域
          return new Style({
            fill: new Fill({
              color: color // 直接使用预定义的带透明度的颜色
            }),
            stroke: new Stroke({
              color: color, // 边框使用相同颜色
              width: 2
            })
          });
        }
      });
    }
  }

  return layers;
});

// 切换显示模式
const toggleDisplayMode = () => {
  displayMode.value = displayMode.value === 'water' ? 'fertilizer' : 'water';
};

// 切换土壤墒情图层显示
const toggleSoilMoistureLayer = () => {
  showSoilMoistureLayer.value = !showSoilMoistureLayer.value;
  // 如果开启土壤墒情图层，则获取最新数据
  if (showSoilMoistureLayer.value && soilMoistureStations.value.length === 0) {
    fetchSoilMoistureStations();
  }
};

// 在组件挂载时加载GeoJSON数据
onMounted(async () => {
  try {
    // 获取地块单元数据
    const landUnitResponse = await fetch('/map-json/land-unit.geojson');

    // 获取预测分类数据
    const predictionClassResponse = await fetch('/map-json/prediction_class2.geojson');

    // 获取墒情监测站数据
    await fetchSoilMoistureStations();

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

    // 从水肥接口获取真实数据
    await fetchWafData();

    // 创建图层数据，prediction_class图层在最下层，zIndex设为6
    localMapLayers.value = [
      {
        id: 'prediction_class',
        name: '预测分类',
        type: 'polygon',
        data: predictionClassData,
        visible: true,
        zIndex: 6,
        minDisplayZoom: 15,
        emitEvent: true,
        emitRightClickEvent: true,
        updateWhileAnimating: false,
        updateWhileInteracting: false
      },
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
      }
    ];
  } catch (error) {
    console.error('加载GeoJSON数据失败:', error);
  }
});

// 从水肥接口获取真实数据
const fetchWafData = async () => {
  try {
    console.log('查询参数:', queryParams.value);
    // 从水肥接口获取数据
    const response: any = await listWaf(queryParams.value);

    console.log('水肥数据:', response);

    // 存储水肥数据
    wafList.value = response.rows || [];

    // 处理水肥数据，将其转换为地块ID到缺水等级的映射
    const waterLevels: Record<string, string> = {};
    const fertilizerLevels: Record<string, string> = {};
    if (response.rows && response.rows.length > 0) {
      response.rows.forEach((item: WafVO) => {
        // 使用 plotId 作为键来存储缺水等级和缺肥等级
        if (item.plotId) {
          // 直接存储文字等级
          waterLevels[item.plotId] = item.waterLevel || '无数据';
          fertilizerLevels[item.plotId] = item.nutrientLevel || '无数据';
        }
      });
    } else {
      console.log('未获取到水肥数据，使用默认值');
    }

    // 更新缺水等级和缺肥等级数据
    growthLevels.value = waterLevels;
    nutrientLevels.value = fertilizerLevels;
  } catch (error) {
    console.error('获取水肥数据失败:', error);
    // 不再生成随机数据作为后备，保持为空
    growthLevels.value = {};
    nutrientLevels.value = {};
  }
};

// 缺水等级数据
const growthLevels = ref<Record<string, string>>({});

// 缺肥等级数据
const nutrientLevels = ref<Record<string, string>>({});

// 处理右键点击事件
const handleRightClick = (data: any) => {
  // 获取鼠标事件，用于定位tooltip
  const event = window.event as MouseEvent;

  // 根据图层类型显示不同的数据
  if (data.layerId === 'land_unit') {
    const landId = data.features.landId;
    const waterLevel = growthLevels.value[landId];
    const fertilizerLevel = nutrientLevels.value[landId];

    // 查找对应的水肥数据
    const waf = wafList.value.find((item: WafVO) => item.plotId == landId);

    tooltipItems.value = [
      { label: '地块编码', value: data.features.landCode || '无' },
      { label: '面积(亩)', value: data.features.landArea ? `${data.features.landArea} 亩` : '无' },
      { label: '缺水等级', value: waterLevel || '无数据' },
      { label: '缺肥等级', value: fertilizerLevel || '无数据' },
      { label: '建议灌水量', value: waf?.applyM3PerMu !== undefined ? `${waf?.applyM3PerMu} m³/亩` : '无数据' }
    ];
  } else if (data.layerId === 'soil_moisture_stations') {
    // 增加墒情监测站的tooltip处理
    tooltipItems.value = [
      { label: '设备编号', value: data.features.name || '无' },
      { label: '设备类型', value: '墒情监测站' },
      { label: '经度', value: data.features.coordinates?.[0]?.toFixed(6) || '无' },
      { label: '纬度', value: data.features.coordinates?.[1]?.toFixed(6) || '无' }
    ];
  } else if (data.layerId === 'soil_moisture_area') {
    // 增加土壤湿度数据的tooltip处理
    const shallowWater = Number(data.features.shallowWater) || 0;
    const levelInfo = getMoistureLevelInfo(shallowWater);

    tooltipItems.value = [
      { label: '设备编号', value: data.features.facilityId || '无' },
      { label: '土壤湿度', value: shallowWater.toFixed(1) + '%' },
      { label: '土壤墒情', value: levelInfo.label },
      { label: '采集时间', value: data.features.collectTime ? data.features.collectTime.substring(0, 10) : '无' }
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

    // 查找对应的水肥数据
    const waf = wafList.value.find((item: WafVO) => item.plotId == featureData.properties.landId);

    if (waf) {
      // 设置诊断数据
      diagnosisData.value = {
        plotId: waf.plotId,
        growthPeriod: waf.growthPeriod,
        lai: waf.lai,
        spad: waf.spad,
        growthLevel: waf.growthLevel
      };

      // 显示诊断结果弹窗
      showDiagnosisResult.value = true;
    } else {
      // 即使没有找到水肥数据，也触发事件让父组件处理
      emit('featureClick', featureData);
      return;
    }
  }
  // 确保传递完整的featureData，包括基地ID
  emit('featureClick', featureData);
};

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
  await fetchWafData();

  // 如果开启了土壤墒情图层，也需要刷新这部分数据
  if (showSoilMoistureLayer.value) {
    await fetchSoilMoistureStations();
  }

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
      :legends="currentLegends"
      :base-name="initialBaseName"
      @map-loaded="handleMapLoaded"
      @feature-click="handleFeatureClick"
      @feature-right-click="handleRightClick"
    >
    </MzMap>

    <!-- 右上角切换按钮 -->
    <div class="toggle-button" @click="toggleDisplayMode">
      {{ displayMode === 'water' ? '切换为肥亏缺分布' : '切换为水亏缺分布' }}
    </div>

    <!-- 土壤墒情图层切换图标按钮 -->
    <div class="icon-button soil-moisture-toggle" @click="toggleSoilMoistureLayer">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2C8.5 2 6 4.5 6 8C6 12 12 19 12 19C12 19 18 12 18 8C18 4.5 15.5 2 12 2Z"
          :fill="showSoilMoistureLayer ? '#409EFF' : 'none'"
          :stroke="showSoilMoistureLayer ? '#409EFF' : '#666'"
          stroke-width="1.5"
        />
        <circle cx="12" cy="8" r="2" :fill="showSoilMoistureLayer ? '#fff' : '#666'" />
      </svg>
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

/* 切换按钮样式 */
.toggle-button {
  position: absolute;
  top: 10px;
  right: 30px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
}

.toggle-button:hover {
  background-color: #f0f0f0;
}

/* 图标按钮样式 */
.icon-button {
  position: absolute;
  top: 10px;
  right: 170px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
}

.icon-button:hover {
  background-color: #f0f0f0;
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
