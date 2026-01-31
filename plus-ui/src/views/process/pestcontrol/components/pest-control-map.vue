<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, toRefs } from 'vue';
import MzMap from '@/components/Map/MzMap.vue';
import { Style, Fill, Stroke, Text } from 'ol/style';
import type { GeoData } from '@/components/Map/MzMap';
import { useRouter } from 'vue-router';
import { landGeoJSON } from '@/views/powland/api/landUnit';

// 导入病虫害区域检测相关的API
import { getDeskINfo } from '@/views/process/api/pestcontrol/areaDetection/index';
import type { PestDetectionMapVO } from '@/views/process/api/pestcontrol/areaDetection/types';

const mapRef = ref();
const mzMapInstance = ref(null);
const localMapLayers = ref<GeoData[]>([]);
const router = useRouter();

// 当前选中的地块ID和编码
const selectedLandId = ref<string | null>(null);
const selectedLandCode = ref<string | null>(null);

// 定义emits
const emit = defineEmits(['mapLoaded', 'featureClick', 'showDetail', 'detectionComplete']);

// 工具提示相关状态
const showTooltip = ref(false);
const tooltipStyle = reactive({
  left: '0px',
  top: '0px'
});
const tooltipTitle = ref('');
const tooltipItems = ref<{ label: string; value: any }[]>([]);

// 病虫害等级映射
const pestLevelMap: Record<number, string> = {
  1: '轻度',
  2: '中度',
  3: '重度'
};

// 病虫害等级数值映射
const pestLevelValueMap: Record<string, number> = {
  '轻度': 1,
  '中度': 2,
  '重度': 3
};

// 图例数据 - 根据监测类型动态显示
const mapLegends = computed(() => {
  // 卫星监测模式 - 显示健康/有病图例
  if (satelliteMonitorVisible.value) {
    return [
      {
        title: '卫星监测',
        items: [
          {
            label: '健康',
            style: { backgroundColor: 'rgb(0, 255, 0)' },
            labelColor: '#000'
          },
          {
            label: '有病',
            style: { backgroundColor: 'rgb(255, 0, 0)' },
            labelColor: '#000'
          }
        ],
        position: {
          horizontal: '86%',
          vertical: '83%'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.85)'
      }
    ];
  }

  // 出苗期模式 - 显示病害类型图例
  if (seedlingMonitorVisible.value) {
    return [
      {
        title: '病虫害类型',
        items: [
          {
            label: '负泥虫',
            style: { backgroundColor: 'rgb(255, 192, 0)' }, // 橙色
            labelColor: '#000'
          },
          {
            label: '叶斑病',
            style: { backgroundColor: 'rgb(255, 255, 0)' }, // 黄色
            labelColor: '#000'
          },
          {
            label: '负+叶',
            style: { backgroundColor: 'rgb(255, 0, 0)' }, // 红色
            labelColor: '#000'
          },
          {
            label: '健康',
            style: { backgroundColor: 'rgb(0, 255, 0)' }, // 绿色
            labelColor: '#000'
          }
        ],
        position: {
          horizontal: '86%',
          vertical: '75%'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.85)'
      }
    ];
  }

  // 粟灰螟模式 - 显示粟灰螟图例
  if (suHuiMingMonitorVisible.value) {
    return [
      {
        title: '虫害类型',
        items: [
          {
            label: '粟灰螟',
            style: { backgroundColor: 'rgb(255, 0, 0)' }, // 红色
            labelColor: '#000'
          },
          {
            label: '健康',
            style: { backgroundColor: 'rgb(0, 255, 0)' }, // 绿色
            labelColor: '#000'
          }
        ],
        position: {
          horizontal: '86%',
          vertical: '83%'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.85)'
      }
    ];
  }

  // 病害率模式（最终结果）- 显示病害等级图例
  if (diseaseRateMonitorVisible.value) {
    return [
      {
        title: '病害等级',
        items: [
          {
            label: '健康',
            style: { backgroundColor: '#2ecc71' },
            labelColor: '#000'
          },
          {
            label: '轻度',
            style: { backgroundColor: '#f39c12' },
            labelColor: '#000'
          },
          {
            label: '中度',
            style: { backgroundColor: '#e67e22' },
            labelColor: '#000'
          },
          {
            label: '重度',
            style: { backgroundColor: '#e74c3c' },
            labelColor: '#000'
          }
        ],
        position: {
          horizontal: '86%',
          vertical: '76%'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.85)'
      }
    ];
  }

  // 默认病害等级图例
  return [
    {
      title: '病害等级',
      items: [
        {
          label: '轻度',
          style: { backgroundColor: 'rgb(146, 208, 80)' },
          labelColor: '#000'
        },
        {
          label: '中度',
          style: { backgroundColor: 'rgb(255, 192, 0)' },
          labelColor: '#000'
        },
        {
          label: '重度',
          style: { backgroundColor: 'rgb(237, 125, 49)' },
          labelColor: '#000'
        }
      ],
      position: {
        horizontal: '86%',
        vertical: '80%'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.85)'
    }
  ];
});

// 病虫害检测数据列表
const pestDetectionDataList = ref<any[]>([]);

// 卫星监测相关
const satelliteMonitorVisible = ref(false);

// 出苗期监测相关
const seedlingMonitorVisible = ref(false);

// 粟灰螟监测相关
const suHuiMingMonitorVisible = ref(false);

// 病害率监测相关（最终结果）
const diseaseRateMonitorVisible = ref(false);

// 定义props
const props = defineProps<{
  initialBaseName?: string;
  geoJsonUrl?: string;
  monitorType?: string; // 监测类型：卫星监测、出苗期、拔节期、抽穗期
  subType?: string; // 二级类型：白发病、粟灰螟、中间过程、最终结果
  seedlingDiseaseData?: any[]; // 出苗期病害数据
  suHuiMingData?: any[]; // 粟灰螟检测数据
  diseaseRateData?: any[]; // 病害率数据（最终结果）
}>();

// 窗口 resize 监听处理函数
const handleResize = () => {
  if (mzMapInstance.value && mzMapInstance.value.map && typeof mzMapInstance.value.map.updateSize === 'function') {
    mzMapInstance.value.map.updateSize();
    console.log('窗口大小变化，地图尺寸已更新');
  }
};

// 加载卫星监测数据
const loadSatelliteMonitorData = async () => {
  try {
    const response = await fetch('/map-json/disease_pixels_with_landunit.geojson');
    if (!response.ok) {
      console.error('获取卫星监测数据失败，HTTP状态码:', response.status);
      return null;
    }
    const data = await response.json();
    console.log('卫星监测数据加载成功');
    return data;
  } catch (error) {
    console.error('加载卫星监测数据失败:', error);
    return null;
  }
};

// 在组件挂载时加载GeoJSON数据
onMounted(async () => {
  try {
    // 使用接口获取地块数据
    const landUnitData = await landGeoJSON();

    // 加载卫星监测数据
    const diseasePixelsData = await loadSatelliteMonitorData();

    // 获取病虫害检测数据
    await fetchPestDetectionData();

    // 创建图层数据
    localMapLayers.value = [
      {
        id: 'land_unit',
        name: '地块信息',
        type: 'polygon',
        data: landUnitData,
        visible: true,
        zIndex: 9,
        minDisplayZoom: 15,
        emitEvent: true,
        emitRightClickEvent: true,
        updateWhileAnimating: false,
        updateWhileInteracting: false
      }
    ];

    // 如果卫星监测数据加载成功，添加卫星监测图层
    if (diseasePixelsData) {
      localMapLayers.value.push({
        id: 'disease_pixels',
        name: '卫星监测-病害像素',
        type: 'polygon',
        data: diseasePixelsData,
        visible: false, // 默认不可见
        zIndex: 7, // 在地块图层下方（land_unit 是 zIndex: 9）
        minDisplayZoom: 15,
        emitEvent: false,
        updateWhileAnimating: false,
        updateWhileInteracting: false
      });
    }

    // 添加窗口 resize 监听
    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('加载GeoJSON数据失败:', error);
  }
});

// 组件卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', hideTooltip);
});

// 监听 monitorType 和 subType 变化，切换监测模式
watch(
  [() => props.monitorType, () => props.subType],
  ([newType, newSubType]) => {
    // 重置所有模式
    satelliteMonitorVisible.value = false;
    seedlingMonitorVisible.value = false;
    suHuiMingMonitorVisible.value = false;
    diseaseRateMonitorVisible.value = false;

    if (newType === '卫星监测') {
      if (newSubType === '最终结果') {
        diseaseRateMonitorVisible.value = true;
        console.log('切换到病害率模式（最终结果）');
      } else {
        satelliteMonitorVisible.value = true;
        console.log('切换到卫星监测模式（中间过程）');
      }
    } else if (newType === '出苗期') {
      seedlingMonitorVisible.value = true;
      console.log('切换到出苗期模式');
    } else if (newType === '拔节期' && newSubType === '粟灰螟') {
      suHuiMingMonitorVisible.value = true;
      console.log('切换到粟灰螟模式');
    } else {
      console.log('切换到病害等级模式');
    }

    // 强制刷新图层
    setTimeout(() => {
      if (mzMapInstance.value) {
        const diseaseLayer = mzMapInstance.value.getLayerById?.('disease_pixels');
        const landLayer = mzMapInstance.value.getLayerById?.('land_unit');
        if (diseaseLayer) diseaseLayer.changed();
        if (landLayer) landLayer.changed();
      }
    }, 100);
  },
  { immediate: true }
);

// 监听出苗期数据变化，数据加载完成后刷新地图
watch(
  () => props.seedlingDiseaseData,
  (newData) => {
    if (newData && newData.length > 0 && seedlingMonitorVisible.value) {
      console.log('出苗期数据已更新，刷新地图');
      setTimeout(() => {
        if (mzMapInstance.value) {
          const landLayer = mzMapInstance.value.getLayerById?.('land_unit');
          if (landLayer) landLayer.changed();
        }
      }, 50);
    }
  },
  { deep: true }
);

// 监听粟灰螟数据变化，数据加载完成后刷新地图
watch(
  () => props.suHuiMingData,
  (newData) => {
    if (newData && newData.length > 0 && suHuiMingMonitorVisible.value) {
      console.log('粟灰螟数据已更新，刷新地图');
      setTimeout(() => {
        if (mzMapInstance.value) {
          const landLayer = mzMapInstance.value.getLayerById?.('land_unit');
          if (landLayer) landLayer.changed();
        }
      }, 50);
    }
  },
  { deep: true }
);

// 监听病害率数据变化，数据加载完成后刷新地图
watch(
  () => props.diseaseRateData,
  (newData) => {
    if (newData && newData.length > 0 && diseaseRateMonitorVisible.value) {
      console.log('病害率数据已更新，刷新地图');
      setTimeout(() => {
        if (mzMapInstance.value) {
          const landLayer = mzMapInstance.value.getLayerById?.('land_unit');
          if (landLayer) landLayer.changed();
        }
      }, 50);
    }
  },
  { deep: true }
);

// 根据病虫害等级获取等级文本
const getPestLevelText = (level: number): string => {
  return pestLevelMap[level] || '未知';
};

// 生成防治建议
const generateNotes = (type: string, level: number, incidenceRate: number): string => {
  if (type === '粟灰螟') {
    return level === 1
      ? '发现轻度粟灰螟危害，建议人工摘除卵块，释放卵寄生蜂。'
      : level === 2
        ? '发现中度粟灰螟危害，建议化学防治喷洒杀虫剂，生物防治释放天敌。'
        : '发现重度粟灰螟危害，需要立即采取综合防治措施。';
  } else if (type.startsWith('白发病')) {
    const stage = type.split('-')[1] || type;
    return level === 1
      ? `发现轻度白发病（${stage}），建议及时摘除病叶，增强通风透光，喷施保护性杀菌剂。`
      : level === 2
        ? `发现中度白发病（${stage}），建议使用甲霜·霜霉威 25% 100g/亩做叶面防治。`
        : `发现重度白发病（${stage}），需要立即使用高效杀菌剂进行防治。`;
  } else if (type === '负泥虫') {
    return level === 1
      ? '发现轻度负泥虫危害，建议人工捕捉，震落收集。'
      : level === 2
        ? '发现中度负泥虫危害，建议生物农药防治，保护天敌，适时用药。'
        : '发现重度负泥虫危害，需要立即进行化学防治。';
  } else if (type === '叶斑病') {
    return level === 1
      ? '发现轻度叶斑病，建议施用充分腐熟有机肥，改善田间条件。'
      : level === 2
        ? '发现中度叶斑病，建议选用 36% 甲基硫菌灵 500-600 倍做全株喷雾。'
        : '发现重度叶斑病，需要立即进行药剂防治并加强田间管理。';
  }
  return `发现${getPestLevelText(level)}${type}，建议及时防治。发病率：${incidenceRate.toFixed(2)}%`;
};

// 从病虫害检测接口获取数据
const fetchPestDetectionData = async () => {
  try {
    console.log('开始获取病虫害检测数据（真实API）...');

    // 调用真实接口获取病虫害地图展示数据
    const response = await getDeskINfo();

    if (!response) {
      console.error('接口返回数据为空');
      pestLevels.value = {};
      return;
    }

    // 检查数据在哪里：可能在 response.data 或直接在 response 上
    let apiData: PestDetectionMapVO[];

    // 优先检查 response.data
    if (response.data) {
      if (Array.isArray(response.data)) {
        apiData = response.data;
      } else {
        console.error('response.data 不是数组格式');
        pestLevels.value = {};
        return;
      }
    } else if (Array.isArray(response)) {
      apiData = response as any;
    } else {
      console.error('无法找到数据或数据格式错误');
      pestLevels.value = {};
      return;
    }

    if (!apiData || apiData.length === 0) {
      console.log('暂无病虫害检测数据');
      pestLevels.value = {};
      return;
    }

    console.log(`获取到 ${apiData.length} 条病虫害检测记录`);

    const processedData = [];

    // 处理接口返回的数据
    apiData.forEach((item) => {
      const pestLevel = item.leval || 1; // 等级：1-轻度 2-中度 3-重度
      const pestLevelText = getPestLevelText(pestLevel);
      const pestType = item.diseaseType || '未知病害';
      const incidenceRate = item.incidenceRate || 0;

      // 生成防治建议
      const notes = generateNotes(pestType, pestLevel, incidenceRate);

      // 根据发病率计算影响面积（简化处理）
      const affectedArea = `${incidenceRate.toFixed(1)}%`;

      // 根据发病率估算病虫害数量（简化计算）
      const totalPests = Math.round(incidenceRate * 10);

      const landCode = item.landCode;
      const plotId = item.plotId?.toString() || ''; // 使用 plotId 而不是 id

      processedData.push({
        plotId: plotId,
        landCode: landCode,
        pestLevel: pestLevel,
        pestLevelText: pestLevelText,
        pestType: pestType,
        detectionDate: new Date().toISOString().split('T')[0], // API中没有检测日期，使用当前日期
        baseName: item.baseName || '侯家沟基地',
        resultImageUrl: item.imageUrl || '/temp_images/result1.jpg',
        id: `${landCode}-病虫害检测${item.id}`,
        totalPests: totalPests,
        affectedArea: affectedArea,
        incidenceRate: incidenceRate,
        notes: notes
      });
    });

    pestDetectionDataList.value = processedData;

    // 处理病虫害数据，将其转换为地块ID和landCode到病虫害等级的映射
    const rates: Record<string, { status: string; level: number; data: any }> = {};
    processedData.forEach((item) => {
      const rateInfo = {
        status: item.pestLevelText,
        level: item.pestLevel,
        data: item // 保存完整数据用于详情页面
      };

      // 使用 plotId 作为主键（优先）
      if (item.plotId) {
        rates[item.plotId] = rateInfo;
      }
      // 同时使用 landCode 作为备用键
      if (item.landCode) {
        rates[item.landCode] = rateInfo;
      }
    });

    // 更新病虫害数据
    pestLevels.value = rates;

    // 强制刷新地图图层以应用新数据
    setTimeout(() => {
      if (mzMapInstance.value) {
        const layer = mzMapInstance.value.getLayerById?.('land_unit');
        if (layer) {
          layer.changed();
        }
      }
    }, 100);

    console.log(`病虫害数据已加载（真实API）: ${processedData.length}个地块`, rates);
  } catch (error) {
    console.error('获取病虫害数据失败:', error);
    pestLevels.value = {};
  }
};

// 病虫害数据
const pestLevels = ref<Record<string, { status: string; level: number; data: any }>>({});

// 带样式的图层数据
const styledMapLayers = computed(() => {
  const levels = { ...pestLevels.value };

  return localMapLayers.value.map((layer) => {
    // 卫星监测图层 - disease_pixels
    if (layer.id === 'disease_pixels') {
      return {
        ...layer,
        visible: satelliteMonitorVisible.value, // 卫星监测模式下可见
        customStyle: (feature) => {
          const classValue = feature.get('class');
          const colorArray = feature.get('color'); // [R, G, B]

          // 根据 GeoJSON 中的 color 属性渲染
          let color = 'rgba(200, 200, 200, 0.5)'; // 默认颜色
          if (colorArray && Array.isArray(colorArray) && colorArray.length === 3) {
            color = `rgba(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]}, 0.7)`;
          }

          return new Style({
            fill: new Fill({ color }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.3)',
              width: 0.5
            })
          });
        }
      };
    }

    // 地块图层 - land_unit
    if (layer.id === 'land_unit') {
      return {
        ...layer,
        visible: true, // 始终可见
        // 自定义渲染函数
        customStyle: (feature) => {
          const landCode = feature.get('landCode');
          const landId = feature.get('landId');

          // 卫星监测模式下，只显示边界和地块编码
          if (satelliteMonitorVisible.value) {
            return new Style({
              fill: new Fill({ color: 'rgba(0, 0, 0, 0)' }), // 完全透明填充
              stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.8)', // 黑色边界
                width: 2
              }),
              text: new Text({
                font: '12px 微软雅黑',
                fill: new Fill({ color: '#000' }),
                stroke: new Stroke({ color: '#fff', width: 2 }),
                text: landCode || ''
              })
            });
          }

          // 出苗期模式下，根据病害数据渲染
          if (seedlingMonitorVisible.value) {
            // 查找当前地块的病害数据
            const diseaseRecord = props.seedlingDiseaseData?.find((record) => record.plotId === landId);

            let color = 'rgba(0, 255, 0, 0.6)'; // 默认健康 - 绿色
            let strokeColor = 'rgba(0, 255, 0, 1)';
            let strokeWidth = 2;

            if (diseaseRecord) {
              // 根据 diseaseCode 设置颜色
              switch (diseaseRecord.diseaseCode) {
                case 1: // 负泥虫
                  color = 'rgba(255, 192, 0, 0.7)'; // 橙色
                  strokeColor = 'rgba(255, 192, 0, 1)';
                  break;
                case 2: // 叶斑病
                  color = 'rgba(255, 255, 0, 0.7)'; // 黄色
                  strokeColor = 'rgba(255, 255, 0, 1)';
                  break;
                case 3: // 负+叶
                  color = 'rgba(255, 0, 0, 0.7)'; // 红色
                  strokeColor = 'rgba(255, 0, 0, 1)';
                  strokeWidth = 2.5;
                  break;
              }
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

          // 粟灰螟模式下，根据检测数据渲染
          if (suHuiMingMonitorVisible.value) {
            // 查找当前地块是否有粟灰螟检测记录
            const hasSuHuiMing = props.suHuiMingData?.some((record) => record.plotId === landId);

            let color = 'rgba(0, 255, 0, 0.6)'; // 默认健康 - 绿色
            let strokeColor = 'rgba(0, 255, 0, 1)';
            let strokeWidth = 2;

            if (hasSuHuiMing) {
              // 有粟灰螟 - 红色
              color = 'rgba(255, 0, 0, 0.7)';
              strokeColor = 'rgba(255, 0, 0, 1)';
              strokeWidth = 2.5;
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

          // 病害率模式（最终结果）下，根据 land_disease_rate.json 数据渲染
          if (diseaseRateMonitorVisible.value) {
            // 查找当前地块的病害率数据
            const diseaseRecord = props.diseaseRateData?.find((record) => record.landId === landId || record.landCode === landCode);

            let color = 'rgba(200, 200, 200, 0.3)'; // 默认灰色
            let strokeColor = 'rgba(0, 0, 0, 0.8)';
            let strokeWidth = 1.5;

            if (diseaseRecord) {
              // 使用 JSON 文件中的 color 字段
              const hexColor = diseaseRecord.color;
              // 将十六进制颜色转换为 rgba
              const r = parseInt(hexColor.slice(1, 3), 16);
              const g = parseInt(hexColor.slice(3, 5), 16);
              const b = parseInt(hexColor.slice(5, 7), 16);

              color = `rgba(${r}, ${g}, ${b}, 0.7)`;
              strokeColor = `rgba(${r}, ${g}, ${b}, 1)`;
              strokeWidth = 2;
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

          // 非卫星监测、非出苗期模式下，显示病害等级颜色
          // 优先用landId匹配，如果没有则用landCode匹配
          let levelData = levels[landId] || levels[landCode];

          // 检查当前地块是否被选中
          const isSelected = selectedLandId.value === landId || selectedLandCode.value === landCode;

          // 根据病虫害等级设置颜色
          let color;
          let strokeColor = 'rgba(0, 0, 0, 0.8)';
          let strokeWidth = 1.5;

          if (levelData === undefined) {
            // 没有检测数据时显示为默认颜色（浅灰色透明）
            color = 'rgba(200, 200, 200, 0.3)';
          } else {
            // 有检测数据的地块根据病虫害等级着色
            switch (levelData.status) {
              case '轻度':
                color = 'rgba(146, 208, 80, 0.7)'; // 轻度 - 绿色
                strokeColor = 'rgba(146, 208, 80, 1)';
                strokeWidth = 2;
                break;
              case '中度':
                color = 'rgba(255, 192, 0, 0.7)'; // 中度 - 黄色
                strokeColor = 'rgba(255, 192, 0, 1)';
                strokeWidth = 2;
                break;
              case '重度':
                color = 'rgba(237, 125, 49, 0.7)'; // 重度 - 橙红色
                strokeColor = 'rgba(237, 125, 49, 1)';
                strokeWidth = 2.5;
                break;
              default:
                color = 'rgba(200, 200, 200, 0.3)'; // 默认颜色
            }
          }

          // 如果地块被选中，使用红色描边高亮
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

  // 延迟调用 updateSize 确保容器尺寸稳定（500-800ms）
  setTimeout(() => {
    if (mapInstance && mapInstance.map && typeof mapInstance.map.updateSize === 'function') {
      mapInstance.map.updateSize();
      console.log('地图尺寸已更新（延迟500ms）');
    }
  }, 500);

  // 再次延迟更新，确保布局完全稳定
  setTimeout(() => {
    if (mapInstance && mapInstance.map && typeof mapInstance.map.updateSize === 'function') {
      mapInstance.map.updateSize();
      console.log('地图尺寸已更新（延迟800ms）');
    }
  }, 800);

  // 添加地图空白区域点击监听，清除地块选择
  if (mapInstance && mapInstance.map) {
    mapInstance.map.on('click', (event: any) => {
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
  console.log('点击了要素:', featureData);
  if (featureData.layerId === 'land_unit') {
    const landId = featureData.properties.landId;
    const landCode = featureData.properties.landCode;

    console.log('点击了地块:', landCode, 'ID:', landId);

    // 设置当前选中的地块
    selectedLandId.value = landId;
    selectedLandCode.value = landCode;

    // 强制刷新图层以应用新的样式
    const layer = mzMapInstance.value?.getLayerById?.('land_unit');
    if (layer) {
      layer.changed();
    }

    // 检查该地块是否有病虫害检测数据
    const levelData = pestLevels.value[landId] || pestLevels.value[landCode];

    if (levelData && levelData.data) {
      // 有检测数据，触发显示详情对话框
      console.log('显示病虫害详情对话框，数据:', levelData.data);
      emit('showDetail', {
        plotId: landId,
        landCode: landCode,
        detectionData: levelData.data
      });
    } else {
      // 没有检测数据，可以提示用户或跳转到检测页面
      console.log('该地块暂无病虫害检测数据');
    }
  }

  // 仍然发射原有事件供父组件使用
  emit('featureClick', featureData);
};

// 处理右键点击事件
const handleRightClick = (data: any) => {
  const event = window.event as MouseEvent;

  // 只有在"拔节期 → 白发病"模式下才显示详细信息
  if (props.monitorType !== '拔节期' || props.subType !== '白发病') {
    // 阻止默认右键菜单
    event.preventDefault();
    return;
  }

  if (data.layerId === 'land_unit') {
    const landId = data.features.landId;
    const landCode = data.features.landCode;
    const levelData = pestLevels.value[landId] || pestLevels.value[landCode];

    tooltipItems.value = [
      { label: '地块编码', value: data.features.landCode || '无' },
      { label: '面积(亩)', value: data.features.landArea ? `${data.features.landArea} 亩` : '无' },
      { label: '病虫害等级', value: levelData?.status || '暂无数据' },
      { label: '病虫害类型', value: levelData?.data?.pestType || '暂无数据' },
      { label: '病害发生率', value: levelData?.data?.affectedArea || '暂无数据' },
      { label: '检测时间', value: levelData?.data?.detectionDate || '暂无数据' },
      { label: '状态', value: levelData ? '已检测' : '待检测' }
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
  console.log('在地图组件中接收到基地选择:', baseName);
  if (mapRef.value && typeof mapRef.value.locate === 'function') {
    console.log(`通过mapRef定位到基地: ${baseName}`);
    mapRef.value.locate(baseName);
  } else {
    console.warn('地图实例未准备好或不支持locate方法');
  }
};

// 刷新地图数据的方法
const refreshMap = async () => {
  console.log('刷新病虫害地图数据');
  await fetchPestDetectionData();

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
  min-height: 400px;
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
