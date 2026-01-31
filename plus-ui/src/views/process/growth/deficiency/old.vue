<template>
  <div class="deficiency-container">
    <!-- 左侧区域 -->
    <div class="left-panel">
      <!-- 左上：基地信息（参考diagnosis页面的基地详情） -->
      <div class="base-info-section">
        <div class="base-info-card">
          <div class="card-header">
            <i class="el-icon-office-building"></i>
            <span class="header-title">基地详情</span>
          </div>

          <div class="base-info-content">
            <div class="base-form">
              <div class="form-item">
                <span class="form-label">基地名称：</span>
                <span class="form-value">
                  <el-tag type="primary">{{ currentBaseName }}</el-tag>
                </span>
              </div>
              <div class="form-item">
                <span class="form-label">LAI：</span>
                <span class="form-value"> 4.12 </span>
              </div>
              <div class="form-item">
                <span class="form-label">SPAD：</span>
                <span class="form-value"> 46.8 </span>
              </div>
              <div class="form-item">
                <span class="form-label">长势等级：</span>
                <span class="form-value">
                  <el-tag type="success">正常</el-tag>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 左下：新增诊断组件 -->
      <div class="add-diagnosis-section">
        <div class="diagnosis-form-card">
          <div class="card-header">
            <span>长势诊断</span>
          </div>

          <div class="diagnosis-form-content">
            <!-- 直接嵌入 GrowthDiagnosis 表单，而非使用弹窗 -->
            <GrowthDiagnosisForm ref="growthDiagnosisFormRef" @completed="handleDiagnosisCompleted" />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧区域：热力地图 -->
    <div class="right-panel">
      <GrowthMzHeatmapComponent
        ref="heatmapRef"
        :heat-data="heatPoints"
        :boundary-data="boundaryData"
        :heatmap-config="heatmapConfig"
        :control-ranges="controlRanges"
        :data-range="dataRange"
        :show-controls="true"
        :show-stats="true"
        :show-legend="true"
        :use-draggable-panels="true"
        @map-loaded="onMapLoaded"
        @heat-data-changed="onHeatDataChanged"
        @config-changed="onConfigChanged"
      />
      <!-- 浮动切换按钮 -->
      <div class="floating-toggle-button">
        <el-button size="small" @click="toggleDataType">
          {{ dataType === 'lai' ? '切换为SPAD值显示' : '切换为LAI值显示' }}
        </el-button>
      </div>
    </div>
    <!-- 弹窗组件 -->
    <DiagnosisResult
      v-if="selectedCellData"
      v-model="dialogVisible"
      :diagnosis-id="selectedCellData.id"
      :plot-id="selectedCellData.plotNumber"
      :lai="selectedCellData.laiValue"
      :spad="selectedCellData.spadValue"
      :growth-level="selectedCellData.growthStatus"
      :growth-period="selectedCellData.growthPeriod"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { listDiagnosis } from '@/views/process/growth/diagnosis/api';
import { landDictQuery, baseDictQuery } from '@/views/process/growth/api/tableDict';
import DiagnosisResult from '@/views/process/growth/diagnosis/components/DiagnosisResult.vue';
import GrowthDiagnosisForm from '@/views/process/growth/components/GrowthDiagnosisForm.vue';
import GrowthMzHeatmapComponent from '@/views/process/growth/components/GrowthMzHeatmapComponent.vue';
import type { HeatPoint, BoundaryData, HeatmapConfig } from '@/components/Map/MzHeatmap';
import { getUser, getUserProfile } from '@/api/system/user';

// 定义生育期数据
const period = ref('抽穗期');
const selectedPeriod = ref('');
const periodDiagnosisData = ref<DiagnosisRecord[]>([]);

interface DiagnosisRecord {
  id: string | number;
  baseName: string;
  plotNumber: string;
  growthPeriod: string;
  diagnosisTime: string;
  laiValue: number;
  spadValue: number;
  growthStatus: string;
}
const diagnosisHistory = ref<DiagnosisRecord[]>([]);

// 全局变量：当前基地名称和基地ID
const currentBaseName = ref('侯家沟基地');
const currentBaseId = ref('');

// 引用 GrowthDiagnosisForm 组件
const growthDiagnosisFormRef = ref<InstanceType<typeof GrowthDiagnosisForm> | null>(null);

const fetchDiagnosisData = async () => {
  try {
    const res = await listDiagnosis({ pageNum: 1, pageSize: 1000 });
    // 生育期字典转换
    const growthPeriodMap: Record<string, string> = {
      '1': '拔节期',
      '2': '抽穗期',
      '3': '灌浆期'
    };

    // 获取基地字典
    let baseDictMap: Record<string, string> = {};
    try {
      const baseDictRes = await baseDictQuery();
      baseDictMap =
        baseDictRes.rows?.reduce(
          (acc, item) => {
            acc[String(item.value)] = String(item.label);
            return acc;
          },
          {} as Record<string, string>
        ) || {};
    } catch (error) {
      console.error('获取基地字典失败:', error);
    }

    // 从数据中判断当前基地ID和基地名称
    let currentBaseIdValue = '';
    let currentBaseNameValue = '侯家沟基地'; // 默认基地名称
    if (res.rows && res.rows.length > 0 && res.rows[0].baseName) {
      // 存储当前基地ID
      currentBaseIdValue = res.rows[0].baseName;
      // 使用基地字典转换基地ID为基地名称
      currentBaseNameValue = baseDictMap[res.rows[0].baseName] || res.rows[0].baseName || '侯家沟基地';
      console.log('当前基地ID:', currentBaseIdValue);
      console.log('当前基地名称:', currentBaseNameValue);
    } else {
      console.log('未获取到基地信息，使用默认基地名称');
    }

    // 更新全局变量
    currentBaseId.value = currentBaseIdValue;
    currentBaseName.value = currentBaseNameValue;

    let plotDictMap: Record<string, string> = {};
    try {
      const plotDictRes = await landDictQuery();
      // console.log('地块字典:', plotDictRes);
      // 将地块字典数组转换为映射对象
      plotDictMap =
        plotDictRes.rows?.reduce(
          (acc, item) => {
            acc[String(item.value)] = String(item.label);
            return acc;
          },
          {} as Record<string, string>
        ) || {};
    } catch (error) {
      console.error('获取地块字典失败:', error);
    }

    diagnosisHistory.value =
      res.rows?.map((item) => ({
        id: item.id,
        baseName: currentBaseName.value, // 使用全局变量
        // 确保 plotNumber 是字符串类型
        plotNumber: String(item.plotId),
        growthPeriod: growthPeriodMap[item.growthPeriod],
        diagnosisTime: item.diagnosisTime,
        laiValue: item.laiPrediction,
        spadValue: item.spadPrediction,
        growthStatus: item.growthLevel
      })) || [];
    initializePeriodData();
    // console.log('转换后数据:', diagnosisHistory.value);
  } catch (error) {
    console.error('获取诊断数据失败:', error);
  }
};

const initializePeriodData = () => {
  if (uniqueGrowthPeriods.value.length > 0) {
    selectedPeriod.value = uniqueGrowthPeriods.value[0];
    updatePeriodData(selectedPeriod.value);
  }
};

const updatePeriodData = (period: string) => {
  periodDiagnosisData.value = diagnosisHistory.value.filter((item) => item.growthPeriod === period);
};

const uniqueGrowthPeriods = computed(() => {
  const allPeriods = ['拔节期', '抽穗期', '灌浆期'];
  const availablePeriods = [...new Set(diagnosisHistory.value.map((item) => item.growthPeriod))];
  return allPeriods.filter((period) => availablePeriods.includes(period));
});

const uniquePlotNumbers = computed(() => {
  const plotNumbers = diagnosisHistory.value.map((item) => {
    return item.plotNumber;
  });
  return [...new Set(plotNumbers)].sort();
});

// 添加响应式数据
const selectedPeriodView = ref('地块数量');

// 计算各生育期统计数据
const periodStats = computed(() => {
  const total = diagnosisHistory.value.length;
  const counts = {
    拔节期: 0,
    抽穗期: 0,
    灌浆期: 0
  };

  diagnosisHistory.value.forEach((item) => {
    if (item.growthPeriod in counts) {
      counts[item.growthPeriod as keyof typeof counts]++;
    }
  });

  return {
    拔节期: {
      count: counts.拔节期,
      percent: total ? ((counts.拔节期 / total) * 100).toFixed(1) : '0.0'
    },
    抽穗期: {
      count: counts.抽穗期,
      percent: total ? ((counts.抽穗期 / total) * 100).toFixed(1) : '0.0'
    },
    灌浆期: {
      count: counts.灌浆期,
      percent: total ? ((counts.灌浆期 / total) * 100).toFixed(1) : '0.0'
    }
  };
});

// 切换生育期视图的方法
const switchPeriodView = (period: string) => {
  selectedPeriodView.value = period;
  if (period !== '地块数量') {
    selectedPeriod.value = period;
    updatePeriodData(period);
  }
};

// 添加响应式数据
const dialogVisible = ref(false);
const selectedCellData = ref<DiagnosisRecord | null>(null);

// 获取单元格详细信息
const getCellDetail = (plotNumber: string, growthPeriod: string) => {
  return diagnosisHistory.value.find((item) => item.plotNumber === plotNumber && item.growthPeriod === growthPeriod);
};

// 显示单元格详细信息
const showCellDetail = (plotNumber: string, growthPeriod: string) => {
  const detail = getCellDetail(plotNumber, growthPeriod);
  if (detail) {
    selectedCellData.value = detail;
    dialogVisible.value = true;
  }
};

// 处理诊断完成事件
const handleDiagnosisCompleted = (recordId?: string | number) => {
  // 重置表单
  if (growthDiagnosisFormRef.value) {
    growthDiagnosisFormRef.value.reset();
  }

  // 如果传入了recordId，则显示对应的诊断结果弹窗
  if (recordId) {
    setTimeout(() => {
      fetchDiagnosisData().then(() => {
        const targetRecord = diagnosisHistory.value.find((record) => record.id == recordId);
        if (targetRecord) {
          selectedCellData.value = targetRecord;
          dialogVisible.value = true;
        }
      });
    }, 500);
  }
};

// 热力图相关代码
const heatmapRef = ref();
const heatPoints = ref<HeatPoint[]>([]);
const boundaryData = ref<BoundaryData>();

// 热力图配置
const heatmapConfig = ref<HeatmapConfig>({
  radius: 8,
  blur: 6,
  opacity: 0.7,
  gradient: ['#000428', '#004e92', '#009ffd', '#00d2ff', '#7be495', '#ffcc02', '#ff6b35', '#f7931e', '#dc2430']
});

// 控制参数范围配置
const controlRanges = ref({
  radius: { min: 3, max: 30, default: 8 },
  blur: { min: 2, max: 15, default: 6 },
  opacity: { min: 0, max: 1, step: 0.05, default: 0.7 }
});

// 添加响应式数据用于跟踪当前显示的数据类型 ('lai' 或 'spad')
const dataType = ref<'lai' | 'spad'>('lai');

// 数据范围配置
const dataRange = ref({
  min: 0.5,
  max: 3,
  unit: '',
  precision: 2,
  name: 'LAI指数' // 数据名称，显示在图例标题
});

// 切换数据类型的函数
const toggleDataType = () => {
  // 先切换数据类型
  if (dataType.value === 'lai') {
    dataType.value = 'spad';
    dataRange.value.name = 'SPAD指数';
  } else {
    dataType.value = 'lai';
    dataRange.value.name = 'LAI指数';
  }

  // 根据当前所有数据动态计算范围
  calculateDataRange();

  // 重新生成热力点数据
  generateHeatPointsFromDiagnosis();
};

// 根据当前数据动态计算范围
const calculateDataRange = () => {
  // 收集所有可能的数据值（包括诊断数据和JSON数据）
  const allValues: number[] = [];

  // 从诊断历史数据中提取当前数据类型的值
  if (diagnosisHistory.value.length > 0) {
    const diagnosisValues = diagnosisHistory.value
      .map((record) => (dataType.value === 'lai' ? record.laiValue : record.spadValue))
      .filter((value) => typeof value === 'number' && !isNaN(value));

    allValues.push(...diagnosisValues);
  }

  // 从JSON数据中提取当前数据类型的值
  if (laiSpadGrowthData.value && Object.keys(laiSpadGrowthData.value).length > 0) {
    const jsonValues = Object.values(laiSpadGrowthData.value)
      .map((item: any) => (dataType.value === 'lai' ? item.laiValue : item.spadValue))
      .filter((value) => typeof value === 'number' && !isNaN(value));

    allValues.push(...jsonValues);
  }

  // 如果没有任何数据，设置默认范围
  if (allValues.length === 0) {
    if (dataType.value === 'lai') {
      dataRange.value.min = 0;
      dataRange.value.max = 5;
    } else {
      dataRange.value.min = 0;
      dataRange.value.max = 100;
    }
    return;
  }

  // 计算最小值和最大值
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  // 添加一些边距，使图表不那么拥挤
  const margin = (max - min) * 0.1;
  dataRange.value.min = Math.max(0, min - margin);
  dataRange.value.max = max + margin;
};

// 添加响应式数据用于存储LAISPAGrowth数据
const laiSpadGrowthData = ref<Record<string, any>>({});

// 加载LAISPAGrowth数据
const loadLaiSpadGrowthData = async () => {
  try {
    const response = await fetch('/map-json/lai_spad_growth_result.json');
    const data = await response.json();

    // 构建以plotId为键的数据映射
    const dataMap: Record<string, any> = {};
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.plotId) {
          dataMap[item.plotId] = item;
        }
      });
    }

    laiSpadGrowthData.value = dataMap;
    console.log('LAISPADGrowth数据加载完成，数据项数量:', Object.keys(dataMap).length);
  } catch (error) {
    console.error('加载LAISPADGrowth数据失败:', error);
  }
};

const fetchCurrentUser = async () => {
  try {
    const response = await getUserProfile();
    const currentUser = response.data;
    console.log(currentUser);
    return currentUser;
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

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

// 加载地块边界数据
const loadLandUnitData = async () => {
  try {
    // 使用地块单元数据文件
    const response = await fetch('/map-json/land-unit.geojson');
    const data = await response.json();

    boundaryData.value = {
      data,
      visible: true,
      strokeColor: '#ffffff',
      strokeWidth: 1,
      fillColor: 'rgba(0, 0, 0, 0)',
      showLabels: true // 显示地块标签
    };

    console.log('地块边界数据加载完成，地块数量:', data.features?.length || 0);
  } catch (error) {
    console.error('加载地块数据失败:', error);
  }
};

// 加载预测分类数据
const loadPredictionClassData = async () => {
  try {
    // 加载预测分类数据（使用新的JSON格式）
    const response = await fetch('/map-json/lai_spad_growth_result.json');
    const data = await response.json();

    // 添加过滤条件 使用动态的 currentBaseId
    if (data && Array.isArray(data)) {
      const filteredData = data.filter((item: any) => {
        return item.baseId === currentBaseId.value;
      });
      // console.log(`过滤后的预测分类数据项数量: ${filteredData.length}`);
      return filteredData;
    }

    console.log('预测分类数据加载完成，数据项数量:', data?.length || 0);

    return data;
  } catch (error) {
    // console.error('加载预测分类数据失败:', error);
    return null;
  }
};

// 基于诊断历史数据生成热力点
const generateHeatPointsFromDiagnosis = async () => {
  const points: HeatPoint[] = [];

  // 检查是否已加载边界数据
  if (!boundaryData.value?.data?.features?.length) {
    console.warn('未加载地块边界数据，无法生成热力点');
    return;
  }

  const features = boundaryData.value.data.features;

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

  diagnosisHistory.value.forEach((record, index) => {
    const plotId = record.plotNumber;

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
          // 计算地块中心点坐标
          const centerCoordinate = calculatePolygonCenter(coordinates);

          if (centerCoordinate) {
            const { min, max, precision } = dataRange.value;
            const range = max - min;

            // 根据当前数据类型选择值
            const rawValue = dataType.value === 'lai' ? record.laiValue : record.spadValue;

            // 确保值在dataRange范围内
            let normalizedValue = Math.max(min, Math.min(max, rawValue));

            points.push({
              id: `diagnosis_${record.id || index}_${polyIndex}`,
              coordinate: centerCoordinate,
              value: Number(normalizedValue.toFixed(precision)), // 根据精度格式化
              weight: (normalizedValue - min) / range, // 基于dataRange归一化为0-1
              metadata: {
                fromDiagnosis: true,
                originalValue: rawValue,
                normalizedValue,
                diagnosisId: record.id,
                plotId: record.plotNumber,
                landId: properties?.landId,
                landCode: properties?.landCode,
                landArea: properties?.landArea,
                laiValue: record.laiValue,
                spadValue: record.spadValue,
                growthStatus: record.growthStatus,
                diagnosisTime: record.diagnosisTime,
                featureIndex,
                polygonIndex: polyIndex,
                centerPoint: true,
                crs: 'CRS84'
              }
            });

            matchedCount++;
          }
        }
      });
    } else {
      console.warn(`未找到匹配的地块: plotId=${plotId}`);
      unmatchedCount++;
    }
  });

  heatPoints.value = points;

  console.log(`诊断热力值加载完成:`);
  console.log(`- 成功匹配: ${matchedCount} 个地块`);
  console.log(`- 未匹配: ${unmatchedCount} 个记录`);
  console.log(`- 生成热力点: ${points.length} 个`);

  console.log(`基于诊断数据生成了 ${points.length} 个热力点`);

  // 加载并处理预测分类数据
  await loadAndProcessPredictionClassData();
};

// 加载并处理预测分类数据
const loadAndProcessPredictionClassData = async () => {
  try {
    const predictionClassData = await loadPredictionClassData();

    if (!predictionClassData || !Array.isArray(predictionClassData)) {
      console.warn('预测分类数据为空或格式不正确');
      return;
    }

    console.log(`开始处理预测分类数据，共 ${predictionClassData.length} 个数据项`);

    // 创建地块ID到边界面的映射
    const plotMap = new Map<string, any>();
    if (boundaryData.value?.data?.features) {
      boundaryData.value.data.features.forEach((feature: any, featureIndex: number) => {
        const properties = feature.properties;
        const landId = properties?.landId;

        if (landId) {
          plotMap.set(landId, { feature, featureIndex, properties });
        }
      });
    }

    // 处理预测分类数据，生成热力点
    const additionalPoints: HeatPoint[] = [];

    // 使用通用的 min、max 和 range 值
    const { min, max, precision } = dataRange.value;
    const range = max - min;
    // console.log(predictionClassData)
    for (const item of predictionClassData) {
      const plotId = item.plotId;

      // 查找对应的地块面
      if (!plotMap.has(plotId)) {
        console.warn(`未找到匹配的地块: plotId=${plotId}`);
        continue;
      }

      const { feature, featureIndex, properties } = plotMap.get(plotId);
      const geometry = feature.geometry;

      // 处理不同的几何类型
      let polygons: number[][][] = [];
      if (geometry?.type === 'Polygon') {
        polygons = [geometry.coordinates[0]];
      } else if (geometry?.type === 'MultiPolygon') {
        polygons = geometry.coordinates.map((polygon: number[][][]) => polygon[0]);
      }

      // 为每个多边形生成热力点
      for (let polyIndex = 0; polyIndex < polygons.length; polyIndex++) {
        const coordinates = polygons[polyIndex];
        if (!coordinates || coordinates.length <= 3) continue;

        // 计算多边形中心点坐标
        const centerCoordinate = calculatePolygonCenter(coordinates);
        if (!centerCoordinate) continue;

        // 根据当前数据类型选择值
        const rawValue = dataType.value === 'lai' ? item.laiValue || 0 : item.spadValue || 0;

        // 使用通用的范围值进行归一化
        let normalizedValue = Math.max(min, Math.min(max, rawValue));
        const weight = (normalizedValue - min) / range;
        additionalPoints.push({
          id: `prediction_${item.id || Date.now()}_${polyIndex}`,
          coordinate: centerCoordinate,
          value: Number(normalizedValue.toFixed(precision)),
          weight: weight,
          metadata: {
            fromPrediction: true,
            value: rawValue,
            id: item.id,
            baseId: item.baseId,
            plotId: item.plotId,
            properties: properties,
            featureIndex: featureIndex,
            polygonIndex: polyIndex,
            centerPoint: true,
            crs: 'CRS84',
            originalValue: rawValue,
            normalizedValue,
            landId: properties?.landId,
            landCode: properties?.landCode,
            landArea: properties?.landArea,
            laiValue: item.laiValue,
            spadValue: item.spadValue,
            growthStatus: item.growthLevel
          }
        });
      }
    }

    // 将预测分类数据点添加到热力点中
    if (additionalPoints.length > 0) {
      heatPoints.value = [...heatPoints.value, ...additionalPoints];
      console.log(`添加了 ${additionalPoints.length} 个预测分类热力点`);
    }
  } catch (error) {
    console.error('处理预测分类数据时出错:', error);
  }
};

// 事件处理
const onMapLoaded = () => {
  console.log('热力图地图加载完成');

  // 地图加载完成后定位到当前基地
  if (heatmapRef.value && currentBaseName.value) {
    // 基于基地名称确定要定位的基地全称
    let fullBaseName = currentBaseName.value;
    // 去掉基地名称最后两个字"基地"
    if (fullBaseName.endsWith('基地') && fullBaseName.length > 2) {
      fullBaseName = fullBaseName.substring(0, fullBaseName.length - 2);
    }

    if (fullBaseName === '侯家沟') {
      fullBaseName = '侯家沟数字化种植基地';
    } else if (fullBaseName === '姜兴庄') {
      fullBaseName = '姜兴庄智慧引领种植基地';
    }

    // 延迟执行确保地图完全初始化
    setTimeout(() => {
      // 获取热力图内部的地图实例并定位到基地
      const heatmapInstance = heatmapRef.value.getHeatmapInstance();
      if (heatmapInstance && typeof heatmapInstance.basePointLocate === 'function') {
        heatmapInstance.basePointLocate(fullBaseName);
        console.log(`地图已定位到基地: ${fullBaseName}`);
      }
    }, 500);
  }

  // 获取热力图实例并添加点击事件处理
  if (heatmapRef.value) {
    heatmapRef.value.addClickListener((heatPoint, coordinate) => {
      if (heatPoint) {
        console.log('点击的热力点信息:', heatPoint);
        console.log(`坐标: [${coordinate[0]}, ${coordinate[1]}]`);

        // 显示热力点详细信息
        if (heatPoint.metadata) {
          // 自动选择左侧表单中的地块编号
          if (growthDiagnosisFormRef.value && heatPoint.metadata.landId) {
            // 通过 setDefaultValues 方法设置表单中的地块编号
            growthDiagnosisFormRef.value.setDefaultValues({
              plotId: heatPoint.metadata.landId
            });
          }

          if (heatPoint.metadata.fromDiagnosis) {
            // 来自诊断数据的热力点
            console.log('=== 诊断数据信息 ===');
            console.log(`地块ID: ${heatPoint.metadata.landId}`);
            console.log(`地块编号: ${heatPoint.metadata.landCode}`);
            console.log(`LAI值: ${heatPoint.metadata.laiValue}`);
            console.log(`SPAD值: ${heatPoint.metadata.spadValue}`);
            console.log(`长势等级: ${heatPoint.metadata.growthStatus}`);
            console.log(`诊断时间: ${heatPoint.metadata.diagnosisTime}`);

            // 显示诊断结果弹窗
            if (heatPoint.metadata.diagnosisId) {
              selectedCellData.value = {
                id: heatPoint.metadata.diagnosisId,
                baseName: currentBaseName.value,
                plotNumber: heatPoint.metadata.landId,
                growthPeriod: '', // 需要从诊断数据中获取
                diagnosisTime: heatPoint.metadata.diagnosisTime,
                laiValue: heatPoint.metadata.laiValue,
                spadValue: heatPoint.metadata.spadValue,
                growthStatus: heatPoint.metadata.growthStatus
              };
              dialogVisible.value = true;
            } else if (heatPoint.metadata.landId) {
              // 如果没有诊断ID，但有地块ID，则尝试从laiSpadGrowthData中获取数据
              const growthData = laiSpadGrowthData.value[heatPoint.metadata.landId];
              if (growthData) {
                console.log('=== 从JSON读取的诊断数据信息 ===');
                console.log(`地块ID: ${heatPoint.metadata.landId}`);
                console.log(`LAI值: ${growthData.laiValue}`);
                console.log(`SPAD值: ${growthData.spadValue}`);
                console.log(`长势等级: ${growthData.growthLevel}`);

                selectedCellData.value = {
                  id: '', // 没有诊断ID
                  baseName: currentBaseName.value,
                  plotNumber: heatPoint.metadata.landId,
                  growthPeriod: '1', // 默认抽穗期
                  diagnosisTime: '', // 没有诊断时间
                  laiValue: growthData.laiValue,
                  spadValue: growthData.spadValue,
                  growthStatus: growthData.growthLevel
                };
                dialogVisible.value = true;
              }
            }
          } else if (heatPoint.metadata.fromPrediction) {
            // 对于预测数据，也尝试从laiSpadGrowthData中获取数据并显示弹窗
            if (heatPoint.metadata.plotId) {
              const growthData = laiSpadGrowthData.value[heatPoint.metadata.plotId];
              if (growthData) {
                console.log('=== 从JSON读取的预测数据信息 ===');
                console.log(`地块ID: ${heatPoint.metadata.plotId}`);
                console.log(`LAI值: ${growthData.laiValue}`);
                console.log(`SPAD值: ${growthData.spadValue}`);
                console.log(`长势等级: ${growthData.growthLevel}`);

                selectedCellData.value = {
                  id: '', // 没有诊断IDu
                  baseName: currentBaseName.value,
                  plotNumber: heatPoint.metadata.plotId,
                  growthPeriod: '拔节期', // 默认抽穗期
                  diagnosisTime: '', // 没有诊断时间
                  laiValue: growthData.laiValue,
                  spadValue: growthData.spadValue,
                  growthStatus: growthData.growthLevel
                };
                dialogVisible.value = true;
              }
            }
          }
          console.log(`权重: ${heatPoint.weight}`);
          console.log(`值: ${heatPoint.value}`);
        }
      } else {
        console.log(`点击位置附近没有热力点: [${coordinate[0]}, ${coordinate[1]}]`);
      }
    });
  }
};

const onHeatDataChanged = (data: HeatPoint[]) => {
  console.log('热力数据已更新:', data.length, '个数据点');
};

const onConfigChanged = (config: HeatmapConfig) => {
  console.log('热力图配置已更新:', config);
};

// 组件挂载时初始化
onMounted(async () => {
  await fetchDiagnosisData();

  // 加载地块数据
  await loadLandUnitData();
  // 基于诊断数据生成热力点，并加载预测分类数据
  await generateHeatPointsFromDiagnosis();
  // 加载LAISPAGrowth数据
  await loadLaiSpadGrowthData();
  // 初始化 GrowthDiagnosisForm 组件
  if (growthDiagnosisFormRef.value) {
    await growthDiagnosisFormRef.value.getDicts();
  }

  // 初始化数据范围
  calculateDataRange();
});
</script>

<style scoped lang="scss">
.deficiency-container {
  display: flex;
  width: auto;
  height: 90vh;
  padding: 2vh;
  box-sizing: border-box;
  gap: 2vh;
  font-size: 2vh;
}

.left-panel {
  display: flex;
  flex-direction: column;
  width: 25%;
  height: 100%;
  gap: 2vh;
}

.base-info-section {
  flex: 1;
  min-height: 40%;
  background: #fff;
  border-radius: 1vh;
  padding: 1vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.diagnosis-form-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.diagnosis-form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.add-diagnosis-section {
  flex: 2;
  height: auto;
  background: #fff;
  border-radius: 1vh;
  padding: 2vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.right-panel {
  flex: 1;
  width: 70%;
  height: 100%;
  background: #fff;
  border-radius: 1vh;
  padding: 0; /* 移除内边距，让地图组件占满整个区域 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 基地信息样式（参考diagnosis页面） */
.base-info-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1.2vh;
  font-weight: bold;
  color: #333;
  padding: 1.5vh 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 2vh;
}

.base-info-content {
  flex: 1;
  overflow-y: auto;
}

.base-form {
  padding-bottom: 2.25vh;
  margin-bottom: 2.25vh;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 2vh;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  width: 16vh;
  font-weight: bold;
  color: #606266;
  text-align: right;
  margin-right: 1vh;
}

.form-value {
  flex: 1;
  :deep(.el-tag) {
    height: 3vh;
    font-size: 2vh;
  }

  :deep(.el-select) {
    height: 3vh;
    font-size: 2vh;
  }

  :deep(.el-select .el-select__wrapper) {
    height: 3vh;
    min-height: 0;
    font-size: 2vh;
  }

  :deep(.el-select-dropdown__item) {
    font-size: 2vh;
    height: 2vh;
    line-height: 2vh;
  }

  // 确保下拉菜单整体大小适配
  :deep(.el-select-dropdown) {
    font-size: 2wh;
  }
  // 添加上传组件提示文字的字体大小调整
  :deep(.el-upload__tip) {
    font-size: 2vh;
  }
}

:deep(.el-button) {
  height: 3vh;
  font-size: 2vh;
}

.base-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.8vh;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-label {
  color: #606266;
  white-space: nowrap;
}

.detail-value {
  color: #303133;
  font-weight: 500;

  :deep(.el-tag) {
    height: 3vh;
    font-size: 2vh;
  }
}

.base-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.8vh;
}

.result-buttons {
  display: flex;
  gap: 1vh;
  justify-content: center;
  margin-top: 2vh;
  flex: 1;
  align-items: flex-end;
}

.result-buttons :deep(.el-button) {
  flex: 1;
}

/* 历史诊断记录样式 */
.history-diagnosis-container {
  //height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 2vh;
}

.history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 1vh 0;

  :deep(.el-pager li) {
    font-size: 1.8vh;
    min-width: 2.5vh;
    height: 2.5vh;
    line-height: 2.5vh;
  }

  :deep(.btn-prev),
  :deep(.btn-next) {
    font-size: 1.8vh;
    min-width: 2.5vh;
    height: 2.5vh;
    line-height: 2.5vh;
  }

  :deep(.el-pagination__sizes) {
    display: none;
  }

  :deep(.el-pagination__jump) {
    display: none;
  }
}

.data-analysis-section {
  margin-bottom: 2vh;
  padding-bottom: 2vh;
  border-bottom: 1px solid #eee;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2vh;

  .section-title {
    font-weight: bold;
    font-size: 2.2vh;
    color: #333;
  }

  :deep(.el-select) {
    height: 3vh;
    font-size: 1.8vh;
  }

  :deep(.el-select .el-select__wrapper) {
    height: 3vh;
    min-height: 0;
  }
}

.analysis-card {
  display: flex;
  background: #fafafa;
  border-radius: 1vh;
  padding: 1.5vh;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  }

  .card-icon {
    width: 8vh;
    height: 8vh;
    border-radius: 1vh;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1.5vh;
    transition: all 0.2s ease-in-out;
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .card-value {
      font-size: 2vh;
      font-weight: bold;
      color: #333;
      margin-bottom: 0.5vh;
    }

    .card-label {
      font-size: 1.6vh;
    }
  }
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2vh;
}

.chart-item {
  background: #fafafa;
  border-radius: 1vh;
  padding: 2vh;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .chart-placeholder {
    height: 15vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 1vh;
    border: 1px dashed #dcdfe6;
  }
}

.growth-period-charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2vh;
  margin-top: 2vh;
}

.period-chart-item {
  background: #fafafa;
  border-radius: 1vh;
  padding: 2vh;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .chart-title {
    font-size: 2vh;
    font-weight: bold;
    color: #333;
    margin-bottom: 1.5vh;
  }

  .chart-placeholder {
    height: 12vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 1vh;
    border: 1px dashed #dcdfe6;
  }
}

.growth-period-chart {
  width: 100%;
  height: 100%;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 3vh;
  margin-bottom: 2vh;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 1vh;
    font-size: 1.8vh;
  }

  .legend-color {
    width: 2vh;
    height: 2vh;
    border-radius: 0.5vh;

    &.lai {
      background-color: #409eff;
    }

    &.spad {
      background-color: #67c23a;
    }
  }
}

.chart-area {
  display: flex;
  height: 20vh;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 4vh;
  margin-right: 1vh;

  .y-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 1vh;
    font-size: 1.6vh;
    color: #606266;
    /* 修改这里：确保高度与热力图行高一致 */
    height: 6vh;
    box-sizing: border-box;
  }
}

.chart-content {
  flex: 1;
  position: relative;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .grid-line {
    height: 1px;
    background-color: #ebeef5;
  }
}

.chart-data {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.data-series {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.data-point {
  position: absolute;
  width: 1.5vh;
  height: 1.5vh;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  z-index: 2;

  &.lai-point {
    background-color: #409eff;
    border: 0.3vh solid #fff;
  }

  &.spad-point {
    background-color: #67c23a;
    border: 0.3vh solid #fff;
  }
}

.data-line {
  position: absolute;
  height: 0.5vh;
  transform-origin: left center;

  &.lai-line {
    background-color: #409eff;
  }

  &.spad-line {
    background-color: #67c23a;
  }
}

.x-axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3vh;
  display: flex;

  .x-label {
    position: absolute;
    transform: translateX(-50%);
    font-size: 1.6vh;
    color: #606266;
    white-space: nowrap;
  }
}

.value-labels {
  position: relative;
  height: 5vh;
  margin-top: 2vh;
  display: flex;

  .value-label {
    position: absolute;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5vh;
  }

  .value-item {
    display: flex;
    align-items: center;
    gap: 0.5vh;
    font-size: 1.4vh;
    color: #606266;
  }

  .value-color {
    width: 1vh;
    height: 1vh;
    border-radius: 50%;

    &.lai {
      background-color: #409eff;
    }

    &.spad {
      background-color: #67c23a;
    }
  }
}

.heatmap-container {
  display: flex;
  margin-top: 2vh;
}

.y-axis-labels {
  display: flex;
  flex-direction: column;
  width: 8vh;
  margin-right: 1vh;

  .y-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 1vh;
    font-size: 1.6vh;
    color: #606266;
    height: 6vh;
    box-sizing: border-box;
  }
}

.heatmap-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.x-axis-labels {
  display: flex;
  height: 3vh;
  margin-bottom: 1vh;
  flex-shrink: 0; // 防止被压缩

  .x-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4vh;
    color: #606266;

    // 默认横着放
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    // 如果宽度不够则竖着放
    @media screen and (max-width: 1200px) {
      writing-mode: vertical-lr;
      text-orientation: mixed;
    }
  }
}

.heatmap-grid {
  border: 1px solid #dcdfe6;
  border-radius: 0.5vh;
  overflow: hidden;
  flex: 1;
}

.heatmap-row {
  display: flex;
  height: 6vh;
  min-height: 6vh;

  &:not(:last-child) {
    border-bottom: 1px solid #dcdfe6;
  }
}

.heatmap-cell {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #dcdfe6;
  position: relative;

  &:last-child {
    border-right: none;
  }

  .cell-text {
    font-size: 1.4vh;
    color: #fff;
    font-weight: bold;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
  }
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 3vh;
  margin-bottom: 2vh;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 1vh;
    font-size: 1.8vh;
  }

  .legend-color {
    width: 2vh;
    height: 2vh;
    border-radius: 0.5vh;
  }
}

.diagnosis-result-section {
  margin-top: 2vh;
  padding-top: 2vh;
  border-top: 1px solid #eee;
}

.no-data-placeholder {
  text-align: center;
  color: #909399;
  font-size: 2vh;
  padding: 4vh 0;
}

.data-analysis-layout {
  display: flex;
  gap: 2vh;
  margin-bottom: 3vh;
}

.analysis-left {
  flex: 1;
  .period-analysis-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2vh;
  }
}

.analysis-right {
  flex: 1;
  background: #fafafa;
  border-radius: 1vh;
  padding: 2vh;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .chart-title {
    font-size: 2vh;
    font-weight: bold;
    color: #333;
    margin-bottom: 1.5vh;
    text-align: center;
  }

  .pie-chart-container {
    height: 20vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.x-axis-title {
  text-align: center;
  font-size: 1.6vh;
  color: #606266;
  margin-top: 1vh;
  margin-right: 10vh;
}

.floating-toggle-button {
  position: absolute;
  top: 3%;
  right: 100px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
