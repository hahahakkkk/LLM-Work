<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated, toRefs, nextTick } from 'vue';
import MzMap from '@/components/Map/MzMap.vue';
import { Style, Fill, Stroke, Text } from 'ol/style';
import type { GeoData } from '@/components/Map/MzMap';
import { useRouter } from 'vue-router';
import proj4 from 'proj4';
import { landGeoJSON } from '@/views/powland/api/landUnit';

// 定义坐标系统
// EPSG:32649 - WGS 84 / UTM zone 49N (原始坐标系)
proj4.defs('EPSG:32649', '+proj=utm +zone=49 +datum=WGS84 +units=m +no_defs');
// EPSG:4326 - WGS 84 经纬度 (目标坐标系)
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

// 导入出苗率检测相关的API
import { fetchErHistoryRecords } from '@/views/process/seedling/emergenceate/api';
import type { ErHistoryRecord } from '@/views/process/seedling/emergenceate/api/types';

const mapRef = ref();
const mzMapInstance = ref(null);
const localMapLayers = ref<GeoData[]>([]);
const router = useRouter();

// 当前选中的地块ID和编码
const selectedLandId = ref<string | null>(null);
const selectedLandCode = ref<string | null>(null);

// 是否高亮显示异常地块
const highlightAbnormal = ref(false);
// 异常地块列表（出苗率≤80%）
const abnormalPlotCodes = ref<Set<string>>(new Set());

// 定义emits
const emit = defineEmits(['mapLoaded', 'featureClick', 'showDetail']);

// 工具提示相关状态
const showTooltip = ref(false);
const tooltipStyle = reactive({
  left: '0px',
  top: '0px'
});
const tooltipTitle = ref('');
const tooltipItems = ref<{ label: string; value: any }[]>([]);

// 出苗率等级映射
const emergenceRateMap: Record<number, string> = {
  1: '正常',
  2: '低度缺苗',
  3: '中度缺苗',
  4: '高度缺苗'
};

// 出苗率等级数值映射（将文字转换为数字）
const emergenceRateValueMap: Record<string, number> = {
  '正常': 1,
  '低度缺苗': 2,
  '中度缺苗': 3,
  '高度缺苗': 4
};

// 图例数据 - 根据当前模式显示不同的图例
const mapLegends = computed(() => {
  // 如果是变化检测模式，只显示变化检测图例
  if (changeDetectionVisible.value) {
    return [
      {
        title: '种植区域变化检测',
        items: [
          {
            label: '2025新增',
            style: { backgroundColor: 'rgba(255, 0, 0, 0.7)' },
            labelColor: '#000'
          },
          {
            label: '2025减少',
            style: { backgroundColor: 'rgba(0, 255, 0, 0.7)' },
            labelColor: '#000'
          }
        ],
        position: {
          horizontal: '85%',
          vertical: '82%'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }
    ];
  }

  // 否则显示出苗率图例
  return [
    {
      title: '出苗等级',
      items: [
        {
          label: '正常',
          style: { backgroundColor: 'rgb(34, 139, 34)' },
          labelColor: '#000'
        },
        {
          label: '低度缺苗',
          style: { backgroundColor: 'rgb(255, 215, 0)' },
          labelColor: '#000'
        },
        {
          label: '中度缺苗',
          style: { backgroundColor: 'rgb(230, 162, 60)' },
          labelColor: '#000'
        },
        {
          label: '高度缺苗',
          style: { backgroundColor: 'rgb(245, 108, 108)' },
          labelColor: '#000'
        }
      ],
      position: {
        horizontal: '88%',
        vertical: '72%'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.8)'
    }
  ];
});

// 出苗率数据列表
const emergenceDataList = ref<any[]>([]);

// 变化检测相关
const changeDetectionVisible = ref(false);
const changeDetectionLayers = ref<GeoData[]>([]);
const mapKey = ref(0); // 用于强制刷新地图

// 定义props
const props = defineProps<{
  initialBaseName?: string;
  geoJsonUrl?: string;
}>();

// 坐标转换函数：将EPSG:32649转换为EPSG:4326
const transformCoordinates = (coordinates: any): any => {
  if (typeof coordinates[0] === 'number') {
    // 单个坐标点 [x, y]
    const [lon, lat] = proj4('EPSG:32649', 'EPSG:4326', coordinates);
    return [lon, lat];
  } else {
    // 坐标数组，递归转换
    return coordinates.map(transformCoordinates);
  }
};

// 转换整个GeoJSON对象
const transformGeoJSON = (geojson: any): any => {
  const transformed = JSON.parse(JSON.stringify(geojson)); // 深拷贝

  // 更新坐标系统信息
  if (transformed.crs) {
    transformed.crs = {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:EPSG::4326'
      }
    };
  }

  // 转换所有feature的坐标
  if (transformed.features) {
    transformed.features.forEach((feature: any) => {
      if (feature.geometry && feature.geometry.coordinates) {
        feature.geometry.coordinates = transformCoordinates(feature.geometry.coordinates);
      }
    });
  }

  return transformed;
};

// 加载变化检测数据
const loadChangeDetectionData = async () => {
  try {
    // 加载变化数据 (guzi_change.geojson)
    const changeResponse = await fetch('/map-json/guzi_change.geojson');
    // 加载分类数据 (guzi_classification.geojson)
    const classificationResponse = await fetch('/map-json/guzi_classification.geojson');

    if (!changeResponse.ok || !classificationResponse.ok) {
      console.error('获取变化检测GeoJSON数据失败');
      return;
    }

    const changeDataOriginal = await changeResponse.json();
    const classificationDataOriginal = await classificationResponse.json();

    // 🔄 转换坐标系统：EPSG:32649 → EPSG:4326
    const changeData = transformGeoJSON(changeDataOriginal);
    const classificationData = transformGeoJSON(classificationDataOriginal);

    // 创建变化检测图层 - 只显示变化数据，不显示2024年种植区域
    changeDetectionLayers.value = [
      {
        id: 'guzi_change',
        name: '谷子变化检测',
        type: 'polygon',
        data: changeData,
        visible: changeDetectionVisible.value,
        zIndex: 6, // 在地块图层下方
        minDisplayZoom: 10, // 降低最小显示缩放级别，确保更容易看到
        emitEvent: false,
        emitRightClickEvent: false,
        updateWhileAnimating: true,
        updateWhileInteracting: true
      }
    ];
  } catch (error) {
    console.error('加载变化检测数据失败:', error);
  }
};

// 初始化地图数据
const initMapData = async () => {
  try {
    // 使用接口获取地块数据
    const landUnitData = await landGeoJSON();

    // 获取出苗率数据
    await fetchEmergenceData();

    // 加载变化检测数据
    await loadChangeDetectionData();

    // 创建图层数据 - 按zIndex从小到大排列
    localMapLayers.value = [
      ...changeDetectionLayers.value, // zIndex: 6
      // 出苗率模式的地块图层
      {
        id: 'land_unit',
        name: '地块信息（出苗率）',
        type: 'polygon',
        data: landUnitData,
        visible: true,
        zIndex: 9,
        minDisplayZoom: 15,
        emitEvent: true,
        emitRightClickEvent: true,
        updateWhileAnimating: false,
        updateWhileInteracting: false
      },
      // 变化检测模式的地块图层（边框 + 地块编号）
      {
        id: 'land_unit_border',
        name: '地块信息（边框）',
        type: 'polygon',
        data: landUnitData,
        visible: false,
        zIndex: 10, // 在变化检测图层上方
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
};

// 移除路由监听器，改为依赖onActivated钩子

// 在组件挂载时加载GeoJSON数据
onMounted(async () => {
  await initMapData();
});

// 添加 activated 钩子
onActivated(async () => {
  await nextTick();
  await initMapData();
});

// 根据出苗率动态生成检测分析报告（与历史记录保持一致）
const generateAnalysisReport = (rate: number, seedlings: number, status: string) => {
  return `经检测，该地块出苗率为 ${rate.toFixed(2)}%，检测到的出苗数量为 ${seedlings} 株，质量等级判定为"${status}"。`;
};

// 根据出苗率生成建议措施（与历史记录保持一致）
const generateRecommendation = (rate: number) => {
  if (rate >= 90) {
    return '该地块出苗情况正常，继续保持当前管理水平，注意后期生长监测。';
  } else if (rate >= 75) {
    return '该地块轻度缺苗，建议加强田间管理，确保苗期正常生长。适当增加水肥供应，关注苗情发展。';
  } else if (rate >= 60) {
    return '该地块中度缺苗，建议进行补种，检查种子质量和播种条件。加强土壤湿度和温度管理，适当补充水分和养分。';
  } else {
    return '该地块高度缺苗，建议重新播种，检查土壤条件和种子质量问题。必要时进行土壤改良和重新整地。';
  }
};

// 从出苗率检测接口获取数据
const fetchEmergenceData = async () => {
  try {
    // 调用真实API接口获取出苗率历史记录
    const response = await fetchErHistoryRecords();

    // 注意：响应拦截器已经返回了 res.data，所以 response 直接就是后端返回的数据对象
    // 后端返回格式：{ code: 200, msg: "查询成功", rows: [...], total: 65 }
    const apiData: ErHistoryRecord[] = (response as any).rows || [];

    if (!apiData || apiData.length === 0) {
      console.warn('出苗率数据为空');
      emergenceRates.value = {};
      emergenceDataList.value = [];
      return;
    }

    // 将API数据映射到地图所需的格式
    const mappedData = apiData.map((item: ErHistoryRecord) => {
      const emergenceRate = item.emergenceRate;

      // 根据出苗率确定等级
      let status: string;
      let qualityLevel: string;

      if (emergenceRate > 80) {
        status = '正常';
        qualityLevel = '正常';
      } else if (emergenceRate >= 65) {
        status = '低度缺苗';
        qualityLevel = '低度缺苗';
      } else if (emergenceRate >= 50) {
        status = '中度缺苗';
        qualityLevel = '中度缺苗';
      } else {
        status = '高度缺苗';
        qualityLevel = '高度缺苗';
      }

      // 使用统一的生成函数
      const notes = generateAnalysisReport(emergenceRate, item.totalSeedlings, status);
      const recommendedAction = generateRecommendation(emergenceRate);

      return {
        plotId: item.plotId || item.id.toString(), // 优先使用 plotId，兼容旧数据
        landCode: item.plotName, // plotName 作为 landCode
        emergenceRate: emergenceRate,
        status: status,
        detectionDate: item.createTime,
        baseName: item.baseName,
        resultImageUrl: item.resultImage,
        id: item.id,
        completionRate: emergenceRate,
        qualityLevel: qualityLevel,
        totalSeedlings: item.totalSeedlings,
        avgDensity: item.seedlingDensity,
        notes: notes,
        recommendedAction: recommendedAction, // 添加建议措施
        // 保留原始API数据
        originImage: item.originImage,
        inspectorUser: item.inspectorUser,
        plotArea: item.plotArea,
        longitude: item.longitude,
        latitude: item.latitude,
        baseId: item.baseId // 保留基地ID
      };
    });

    emergenceDataList.value = mappedData;

    // 处理出苗率数据，将其转换为地块ID和landCode到出苗率等级的映射
    const rates: Record<string, { status: string; rate: number; data: any }> = {};
    const abnormalCodes = new Set<string>();

    mappedData.forEach((item) => {
      const rateInfo = {
        status: item.status,
        rate: item.emergenceRate,
        data: item // 保存完整数据用于详情页面
      };

      // 优先使用 plotId 作为主键
      if (item.plotId) {
        rates[item.plotId] = rateInfo;
      }

      // 同时使用 landCode 作为备用键（如 "hjg001"）
      if (item.landCode) {
        rates[item.landCode] = rateInfo;

        // 记录异常地块（出苗率≤80%）
        if (item.emergenceRate <= 80) {
          abnormalCodes.add(item.landCode);
        }
      }
    });

    // 更新出苗率数据
    emergenceRates.value = rates;
    abnormalPlotCodes.value = abnormalCodes;
  } catch (error) {
    console.error('获取出苗率数据失败:', error);
    emergenceRates.value = {};
    emergenceDataList.value = [];
  }
};

// 出苗率数据
const emergenceRates = ref<Record<string, { status: string; rate: number; data: any }>>({});

// 带样式的图层数据 - 根据模式切换显示不同的图层
const styledMapLayers = computed(() => {
  const rates = { ...emergenceRates.value };

  return localMapLayers.value.map((layer) => {
    // 2024年谷子种植区域图层样式（蓝色）- 只在变化检测模式下显示
    if (layer.id === 'guzi_classification') {
      return {
        ...layer,
        visible: changeDetectionVisible.value, // 只在变化检测模式下可见
        customStyle: (feature) => {
          // 2024年种植区域显示为蓝色
          const color = 'rgba(100, 150, 255, 0.6)'; // 蓝色半透明
          const strokeColor = 'rgba(100, 150, 255, 0.8)';

          return new Style({
            fill: new Fill({ color }),
            stroke: new Stroke({
              color: strokeColor,
              width: 1.5
            })
          });
        }
      };
    }

    // 谷子变化检测图层样式 - 只在变化检测模式下显示
    if (layer.id === 'guzi_change') {
      return {
        ...layer,
        visible: changeDetectionVisible.value, // 只在变化检测模式下可见
        customStyle: (feature) => {
          const R = feature.get('R');
          const G = feature.get('G');
          const B = feature.get('B');

          let color, strokeColor;

          // 绿色 (0, 255, 0) = 24年种植了，25年没种植（减少的区域）
          if (R === 0 && G === 255 && B === 0) {
            color = 'rgba(0, 255, 0, 0.7)';
            strokeColor = 'rgba(0, 255, 0, 1)';
          }
          // 红色 (255, 0, 0) = 25年种植了，24年没种植（新增的区域）
          else if (R === 255 && G === 0 && B === 0) {
            color = 'rgba(255, 0, 0, 0.7)';
            strokeColor = 'rgba(255, 0, 0, 1)';
          }
          // 其他颜色使用原始RGB值
          else {
            color = `rgba(${R}, ${G}, ${B}, 0.7)`;
            strokeColor = `rgba(${R}, ${G}, ${B}, 1)`;
          }

          return new Style({
            fill: new Fill({ color }),
            stroke: new Stroke({
              color: strokeColor,
              width: 2
            })
          });
        }
      };
    }

    // 地块信息图层样式（出苗率模式）
    if (layer.id === 'land_unit') {
      return {
        ...layer,
        visible: !changeDetectionVisible.value, // 只在出苗率模式下可见
        // 自定义渲染函数
        customStyle: (feature) => {
          const landCode = feature.get('landCode');
          const landId = feature.get('landId');

          // 优先用 landId 匹配（对应 plotId），如果没有则用 landCode 匹配
          let rateData = rates[landId] || rates[landCode];

          // 检查当前地块是否被选中
          const isSelected = selectedLandId.value === landId || selectedLandCode.value === landCode;
          // 检查当前地块是否为异常地块
          const isAbnormal = abnormalPlotCodes.value.has(landCode);

          // 根据出苗率等级设置颜色
          let color;
          let strokeColor = 'rgba(0, 0, 0, 0.8)';
          let strokeWidth = 1.5;

          if (rateData === undefined) {
            // 没有检测数据时显示为默认颜色（浅灰色透明）
            color = 'rgba(200, 200, 200, 0.3)';
          } else {
            // 有检测数据的地块根据出苗率等级着色
            switch (rateData.status) {
              case '正常':
                color = 'rgba(34, 139, 34, 0.7)'; // 正常 - 森林绿
                strokeColor = 'rgba(34, 139, 34, 1)';
                strokeWidth = 2;
                break;
              case '低度缺苗':
                color = 'rgba(255, 215, 0, 0.7)'; // 低度缺苗 - 金黄色
                strokeColor = 'rgba(255, 215, 0, 1)';
                strokeWidth = 2;
                break;
              case '中度缺苗':
                color = 'rgba(230, 162, 60, 0.7)'; // 中度缺苗 - 橙色
                strokeColor = 'rgba(230, 162, 60, 1)';
                strokeWidth = 2;
                break;
              case '高度缺苗':
                color = 'rgba(245, 108, 108, 0.7)'; // 高度缺苗 - 红色
                strokeColor = 'rgba(245, 108, 108, 1)';
                strokeWidth = 2;
                break;
              default:
                color = 'rgba(200, 200, 200, 0.3)'; // 默认颜色
            }
          }

          // 如果开启了异常地块高亮模式，且当前地块是异常地块
          if (highlightAbnormal.value && isAbnormal) {
            strokeColor = 'rgba(255, 0, 0, 1)'; // 红色描边
            strokeWidth = 4; // 加大描边宽度
          }

          // 如果地块被选中，使用红色描边高亮（优先级最高）
          if (isSelected) {
            strokeColor = 'rgba(255, 0, 0, 0.9)'; // 红色描边
            strokeWidth = 4; // 加大描边宽度
          }

          return new Style({
            fill: new Fill({ color }),
            stroke: new Stroke({
              color: strokeColor,
              width: strokeWidth
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

    // 地块边框图层样式（变化检测模式）
    if (layer.id === 'land_unit_border') {
      return {
        ...layer,
        visible: changeDetectionVisible.value, // 只在变化检测模式下可见
        customStyle: (feature) => {
          const landCode = feature.get('landCode');

          // 变化检测模式下，统一样式，不需要选中和异常高亮
          // 半透明灰色填充 + 深灰色边框
          const fillColor = 'rgba(200, 200, 200, 0.1)'; // 极浅灰色，几乎透明
          const strokeColor = 'rgba(0, 0, 0, 0.6)'; // 深灰色边框
          const strokeWidth = 1.5;

          return new Style({
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({
              color: strokeColor,
              width: strokeWidth
            }),
            text: new Text({
              font: '12px 微软雅黑',
              fill: new Fill({ color: '#333' }),
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

// 处理地图加载完成事件
const handleMapLoaded = (mapInstance: any) => {
  mzMapInstance.value = mapInstance;
  emit('mapLoaded', mapInstance);

  // 地图加载完成后定位到指定基地
  if (props.initialBaseName && mapInstance && typeof mapInstance.locate === 'function') {
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

  // 添加地图空白区域点击监听，清除地块选择（仅在出苗率模式下）
  if (mapInstance && mapInstance.map) {
    mapInstance.map.on('click', (event: any) => {
      // 变化检测模式下不处理地块选择
      if (changeDetectionVisible.value) {
        return;
      }

      // 检查点击位置是否有要素
      const pixel = mapInstance.map.getEventPixel(event.originalEvent);
      const features: any[] = [];
      mapInstance.map.forEachFeatureAtPixel(pixel, (feature: any) => {
        features.push(feature);
      });

      // 如果没有要素被点击，则清除选择
      if (features.length === 0) {
        selectedLandId.value = null;
        selectedLandCode.value = null;

        // 强制刷新图层以移除高亮
        const layer = mzMapInstance.value?.getLayerById?.('land_unit');
        if (layer) {
          layer.changed();
        }
      }
    });
  }
};

// 处理要素点击事件
const handleFeatureClick = (featureData: any) => {
  // 变化检测模式下，禁用地块点击交互
  if (changeDetectionVisible.value && featureData.layerId === 'land_unit_border') {
    // 变化检测模式下不处理地块点击，只发射基础事件
    emit('featureClick', featureData);
    return;
  }

  // 出苗率模式下，处理 land_unit 图层的点击
  if (!changeDetectionVisible.value && featureData.layerId === 'land_unit') {
    const landId = featureData.properties.landId;
    const landCode = featureData.properties.landCode;

    // 设置当前选中的地块
    selectedLandId.value = landId;
    selectedLandCode.value = landCode;

    // 强制刷新图层以应用新的样式
    const landUnitLayer = mzMapInstance.value?.getLayerById?.('land_unit');
    if (landUnitLayer) {
      landUnitLayer.changed();
    }

    // 检查该地块是否有出苗率检测数据
    const rateData = emergenceRates.value[landId] || emergenceRates.value[landCode];

    if (rateData && rateData.data) {
      // 有检测数据，触发显示详情对话框
      emit('showDetail', {
        plotId: landId,
        landCode: landCode,
        detectionData: rateData.data
      });
    }
  }

  // 仍然发射原有事件供父组件使用
  emit('featureClick', featureData);
};

// 处理右键点击事件
const handleRightClick = (data: any) => {
  const event = window.event as MouseEvent;

  // 变化检测模式下，禁用右键详情显示
  if (changeDetectionVisible.value && data.layerId === 'land_unit_border') {
    // 变化检测模式下不显示出苗率相关信息
    event.preventDefault();
    return;
  }

  // 出苗率模式下，处理 land_unit 图层的右键点击
  if (!changeDetectionVisible.value && data.layerId === 'land_unit') {
    const landId = data.features.landId;
    const landCode = data.features.landCode;
    const rateData = emergenceRates.value[landId] || emergenceRates.value[landCode];

    tooltipItems.value = [
      { label: '地块编码', value: data.features.landCode || '无' },
      { label: '面积(亩)', value: data.features.landArea ? `${data.features.landArea} 亩` : '无' },
      { label: '出苗率等级', value: rateData?.status || '暂无数据' },
      { label: '出苗率', value: rateData?.rate !== undefined ? `${rateData.rate}%` : '暂无数据' },
      { label: '检测时间', value: rateData?.data?.detectionDate || '暂无数据' },
      { label: '状态', value: rateData ? '已检测' : '待检测' }
    ];
  } else {
    return;
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
  if (mapRef.value && typeof mapRef.value.locate === 'function') {
    mapRef.value.locate(baseName);
  }
};

// 刷新地图数据的方法
const refreshMap = async () => {
  await fetchEmergenceData();

  if (mapRef.value && typeof mapRef.value.refresh === 'function') {
    mapRef.value.refresh();
  }
};

// 切换变化检测显示模式
const toggleChangeDetection = (visible: boolean) => {
  // 切换模式
  changeDetectionVisible.value = visible;

  // 强制刷新地图 - 递增key让Vue完全重新渲染组件
  mapKey.value++;

  // 等待Vue更新后刷新地图
  nextTick(() => {
    if (mapRef.value) {
      // 尝试多种刷新方法
      if (typeof mapRef.value.refresh === 'function') {
        mapRef.value.refresh();
      }

      // 尝试直接操作OpenLayers地图实例
      if (mapRef.value.map) {
        // 强制重新渲染所有图层
        mapRef.value.map.render();
        // 更新地图尺寸
        mapRef.value.map.updateSize();
      }
    }
  });
};

// 高亮显示异常地块（出苗率≤80%）
const highlightAbnormalPlots = () => {
  // 切换高亮状态
  highlightAbnormal.value = !highlightAbnormal.value;

  // 强制刷新两个图层以应用新的样式
  const landUnitLayer = mzMapInstance.value?.getLayerById?.('land_unit');
  if (landUnitLayer) {
    landUnitLayer.changed();
  }

  const borderLayer = mzMapInstance.value?.getLayerById?.('land_unit_border');
  if (borderLayer) {
    borderLayer.changed();
  }

  if (!landUnitLayer && !borderLayer) {
    console.warn('未找到地块图层');
  }
};

// 暴露方法给父组件
defineExpose({
  mapRef,
  locate,
  handleBaseSelection,
  refreshMap,
  toggleChangeDetection,
  highlightAbnormalPlots
});
</script>

<template>
  <div class="map-wrapper">
    <MzMap
      :key="mapKey"
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
