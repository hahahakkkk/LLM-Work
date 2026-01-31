<script setup lang="ts">
import SystemSummary from './components/summary.vue';
import AlertList from './components/alert-list-single-base.vue';
import BaseInfo from './components/base-info.vue';
import QuickAccess from './components/quick-access-all-bases.vue';
import GrowthMap1 from './components/map_1.vue';
import GrowthDiagnosis from './components/GrowthDiagnosis.vue';
import WeatherForecast from './components/weatherForecast/index.vue'; // 引入天气预报组件
import { ref, nextTick, computed, onMounted, getCurrentInstance, toRefs, ComponentInternalInstance, watch } from 'vue';
import { listWaf } from '@/views/process/maturity/alert/api';
import { landDictQuery, baseDictQuery } from '@/views/process/growth/api/tableDict';
import { addForecast, getForecast, listForecast, updateForecast } from '@/views/process/maturity/forecast/api';
import type { SupplyRecVO } from '@/views/process/growth/supplyRec/api/types';
import { WafVO } from '@/views/process/maturity/alert/api/types';
import DiagnosisResult from '@/views/process/maturity/components/DiagnosisResult.vue';
import { listWarning } from '@/api/disaster/warning';
import request from '@/utils/request';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { base_id2name_map } = toRefs<any>(proxy?.useDict('base_id2name_map'));

// 定义预警信息类型（与alert-list.vue中的AlertItem保持一致）
interface AlertItem {
  id: number;
  title: string;
  time: string;
  level: 'high' | 'medium' | 'low';
  status: 'unhandled' | 'handled';
  base: string;
  field: string;
  description: string;
  type: 'water' | 'fertilizer';
}

const mapRef = ref(null);
const growthDiagnosisRef = ref(null);

// 当前生育期
const currentPeriod = ref('抽穗期');

// 预警信息数据
const alertData = ref<AlertItem[]>([]);

// 地块字典数据
const landDict = ref([]);

// 基地字典数据
const baseDict = ref([]);

// 当前选中的基地ID
const currentBaseId = ref<string | undefined>('1880899316147232770');

// 格式化时间显示，去掉秒数
const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  // 如果时间字符串包含秒数，则去掉秒数部分
  return timeStr.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}):\d{2}/, '$1');
};

// 获取真实预警数据
const fetchAlertData = async () => {
  try {
    const params: any = {
      // 使用新的API
      pageNum: 1,
      pageSize: 10,
      orderByColumn: 'alertTime',
      isAsc: 'desc'
    };

    const res: any = await listWaf(params);

    // 通过第一条数据确定当前基地名称
    if (res.rows && res.rows.length > 0) {
      const firstRow = res.rows[0];
      // currentBaseId.value = firstRow.baseId?.toString(); // 存储当前基地ID
    }

    // 转换数据格式以适配前端组件
    alertData.value = res.rows.map((item: WafVO) => ({
      id: item.id as number,
      title: '采收预警',
      time: formatTime(item.alertTime),
      level: item.alertType,
      status: 'unhandled',
      field: item.plotId,
      description: item.alertInfo,
      type: 'water' // 统一设置为water类型
    }));

    // 处理地图定位逻辑
    if (res.rows && res.rows.length > 0) {
      const firstRow = res.rows[0];
      // currentBaseId.value = firstRow.baseId?.toString(); // 存储当前基地ID
    }
  } catch (error) {
    console.error('获取预警数据失败:', error);
  }
};

// 根据alertInfo设置预警级别
const getAlertLevel = (alertInfo: string) => {
  if (alertInfo.includes('重度')) {
    return 'high';
  } else if (alertInfo.includes('中度')) {
    return 'medium';
  } else {
    // 默认为轻微
    return 'low';
  }
};

// 地块前缀映射常量
const PLOT_PREFIX_MAP: Record<string, string> = {
  'hjgn': '侯家沟南',
  'hjg': '侯家沟'
};

// 通过地块ID获取地块编号
const getPlotCodeById = (plotId: string | number): string | number => {
  // 优先从地块字典中查找
  if (landDict.value?.length > 0) {
    const selectedPlot = landDict.value.find((item: any) => item.value === plotId);
    if (selectedPlot) {
      plotId = selectedPlot.label;
    }
  }

  // 处理字符串类型的地块ID前缀替换
  if (typeof plotId === 'string') {
    for (const [prefix, replacement] of Object.entries(PLOT_PREFIX_MAP)) {
      if (plotId.startsWith(prefix)) {
        return plotId.replace(prefix, replacement);
      }
    }
  }

  // 默认返回原始ID
  return plotId;
};

// 当前选中的基地和地块
const selectedPlot = ref(''); // 当前选中的地块编码
const selectedPlotId = ref(''); // 当前选中的地块ID
const selectedPlotInfo = ref(null); // 完整的地块信息

// 处理生育期变化事件
const handlePeriodChange = (newPeriod: string) => {
  currentPeriod.value = newPeriod;
};

// 处理来自系统概述组件的生育期变化事件
const handleSummaryPeriodChange = (newPeriod: string) => {
  currentPeriod.value = newPeriod;
  // 如果需要，可以在这里添加其他逻辑，比如通知其他组件
};

// 处理地图刷新事件
const handleRefreshMap = async () => {
  console.log('正在刷新地图...');
  // 调用地图组件的刷新方法
  if (mapRef.value && typeof mapRef.value.refreshMap === 'function') {
    try {
      await mapRef.value.refreshMap();
      console.log('地图数据已刷新');
    } catch (error) {
      console.error('刷新地图失败:', error);
    }
  } else {
    console.warn('地图组件未提供刷新方法');
  }
};

/** 获取基地名称标签 */
const getBaseNameLabel = (baseValue: string | undefined) => {
  if (!baseValue) return '';

  const baseOption = baseDict.value.find((option) => option.value === baseValue);
  return baseOption ? baseOption.label : baseValue;
};

const selectedBase = computed(() => {
  console.log('使用字典进行转换:', currentBaseId.value);
  // 使用基地ID到跳转地点名称的专门字典进行转换
  if (currentBaseId.value && base_id2name_map.value) {
    // 在字典数组中查找匹配的基地ID
    const matchedEntry = base_id2name_map.value.find((entry) => entry.label === currentBaseId.value);
    if (matchedEntry) {
      console.log('使用字典进行转换:', currentBaseId.value, '->', matchedEntry.value);
      return matchedEntry.value;
    }
  }

  // 如果没有找到映射，则返回空字符串
  console.log('未找到基地ID对应的跳转地点名称:', currentBaseId.value);
  return '侯家沟基地';
});

// 处理长势诊断完成事件
const handleGrowthDiagnosisCompleted = () => {
  console.log('长势诊断完成，开始添加预警数据...');
  fetchAlertData();
  // 刷新地图
  handleRefreshMap();
};

// 在下一次DOM更新后，通知地图组件更新尺寸
const handleMapLoaded = () => {
  nextTick(() => {
    // 直接调用OpenLayers地图的updateSize方法
    if (mapRef.value && mapRef.value.mapRef && mapRef.value.mapRef.value) {
      const olMap = mapRef.value.mapRef.value.getMap();
      if (olMap && typeof olMap.updateSize === 'function') {
        olMap.updateSize();
      }
    }
  });
};

// 引用 GrowthDiagnosisForm 组件
const harvestSuggestionFormRef = ref<InstanceType<typeof HarvestSuggestionForm> | null>(null);
const selectedCellData = ref<DiagnosisRecord | null>(null);
const dialogVisible = ref(false);
// 处理基地选择事件
// 处理地图点击事件：转发给成熟度诊断表单组件或者直接处理
const handleMapFeatureClick = async (featureData: any) => {
  console.log('地图点击事件:', featureData);

  if (featureData && featureData.properties && featureData.properties.landId) {
    const landId = featureData.properties.landId;

    // 查找是否有该地块的诊断记录
    try {
      const res = await listForecast({
        plotId: landId,
        pageNum: 1,
        pageSize: 1
      });
      console.log('查询的诊断记录:', res);

      if (res.rows && res.rows.length > 0) {
        // 如果找到诊断记录，显示诊断结果弹窗
        const record = res.rows[0];
        selectedCellData.value = {
          id: record.id,
          plotNumber: landId,
          ripenessStatus: record.ripenessStatus,
          growthPeriod: record.growthPeriod || '成熟期'
        };
        dialogVisible.value = true;
        // 转发给表单组件处理（用于新建诊断）
        if (harvestSuggestionFormRef.value && typeof (harvestSuggestionFormRef.value as any).handleMapFeatureClick === 'function') {
          (harvestSuggestionFormRef.value as any).handleMapFeatureClick(featureData);
        } else {
        }
      } else {
        // 转发给表单组件处理（用于新建诊断）
        if (harvestSuggestionFormRef.value && typeof (harvestSuggestionFormRef.value as any).handleMapFeatureClick === 'function') {
          (harvestSuggestionFormRef.value as any).handleMapFeatureClick(featureData);
        } else {
        }
      }
    } catch (error) {
      console.error('查询诊断数据失败:', error);
      proxy?.$modal.msgError('数据查询失败');
    }
  }
};

// 获取地块字典数据
const fetchLandDict = async () => {
  try {
    const res = await landDictQuery();
    landDict.value =
      res.rows?.map((item: any) => ({
        value: String(item.value),
        label: String(item.label)
      })) || [];
  } catch (error) {
    console.error('获取地块字典失败:', error);
    landDict.value = [];
  }
};

const getDicts = async () => {
  // 获取基地字典
  try {
    const res = await baseDictQuery();
    baseDict.value =
      res.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];
  } catch (error) {
    console.error('获取基地字典失败:', error);
    baseDict.value = [];
  }
};

// 监听currentBaseId的变化，确保及时更新selectedBase
watch(currentBaseId, (newVal) => {
  // console.log('currentBaseId changed:', newVal);
  // 当基地ID改变时也更新基地信息数据
  fetchBaseInfoData();
});

onMounted(() => {
  // 直接获取预警数据，通过预警数据确定当前基地
  getDicts();
  fetchLandDict().then(() => {
    // 获取地块字典数据
    fetchAlertData();
  });
});
</script>

<template>
  <div class="growth-dashboard">
    <div class="main-content">
      <!-- 系统概述组件 -->
      <div class="system-summary-container">
        <SystemSummary class="system-summary-card" @period-change="handleSummaryPeriodChange" />
      </div>

      <!-- 左侧：基地信息（占1行） -->
      <div class="base-info-container">
        <el-card class="base-info-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box' }">
          <div class="card-content">
            <BaseInfo
              :base-info="{
                name: getBaseNameLabel(currentBaseId)
              }"
            />
          </div>
        </el-card>
      </div>

      <!-- 左侧：快捷操作（占1行） -->
      <div class="quick-access-container">
        <el-card class="quick-access-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box' }">
          <div class="card-content">
            <!-- 添加 @period-change 和 @refresh-map 事件监听 -->
            <QuickAccess :current-period="currentPeriod" @period-change="handlePeriodChange" @refresh-map="handleRefreshMap" />
          </div>
        </el-card>
      </div>

      <!-- 中间：地图组件（占1行） -->
      <div class="map-container">
        <el-card class="map-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box' }">
          <div class="card-content">
            <GrowthMap1 ref="mapRef" :initial-base-name="selectedBase" @map-loaded="handleMapLoaded" @feature-click="handleMapFeatureClick" />
          </div>
        </el-card>
      </div>

      <!-- 右侧：预警信息列表（占1行） -->
      <div class="alert-container">
        <el-card class="alert-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box' }">
          <div class="card-content">
            <AlertList :alerts="alertData" />
          </div>
        </el-card>
      </div>

      <!-- 底部：天气预报组件（新增） -->
      <div class="weather-forecast-container">
        <el-card class="weather-forecast-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box' }">
          <div class="card-content">
            <WeatherForecast />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 长势诊断组件 -->
    <GrowthDiagnosis ref="growthDiagnosisRef" @completed="handleGrowthDiagnosisCompleted" />

    <!-- 弹窗组件 -->
    <DiagnosisResult
      v-if="selectedCellData"
      v-model="dialogVisible"
      :diagnosis-id="selectedCellData.id"
      :plot-id="selectedCellData.plotNumber"
      :ripeness-status="selectedCellData.ripenessStatus"
      :growth-period="selectedCellData.growthPeriod"
    />
  </div>
</template>

<style scoped lang="scss">
.growth-dashboard {
  padding: 16px;
  background-color: #f5f7fa;
  height: 90vh;
  display: flex;
  flex-direction: column;

  .main-content {
    margin-top: 0;
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 60% 1.2fr;
    grid-template-rows: 1fr 4fr 24%; // 修改行高比例，保持3行
    gap: 1vh;
    height: 80vh;

    /* 系统概述组件占据第一行全部宽度 */
    .system-summary-container {
      grid-row: 1;
      grid-column: 1;
    }

    /* 基地信息占据第一列的第一行 */
    .base-info-container {
      grid-row: 2;
      grid-column: 1;
    }

    /* 快捷操作占据第一列的第二行 */
    .quick-access-container {
      grid-row: 3;
      grid-column: 1;
    }

    /* 地图组件占据中间列的第二行 */
    .map-container {
      grid-row: 1 / span 2;
      grid-column: 2;
    }

    /* 预警信息占据右侧列的第二行 */
    .alert-container {
      grid-row: 1 / span 2;
      grid-column: 3;
    }

    /* 天气预报组件占据第三行的二三列 */
    .weather-forecast-container {
      grid-row: 3;
      grid-column: 2 / span 2;
    }

    /* 地图标题栏样式 */
    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1vh 1.5vh;
      background-color: #f5f7fa;
      border-bottom: 0.1vh solid #ebeef5;

      .map-info {
        display: flex;
        align-items: center;
        gap: 1vh;
      }

      .period-tag {
        cursor: pointer;
        display: flex;
        align-items: center;

        &:hover {
          opacity: 0.8;
        }
      }

      .map-actions {
        flex-shrink: 0;
      }
    }

    /* 系统概述容器样式 */
    .system-summary-container,
    .base-info-container,
    .quick-access-container,
    .map-container,
    .alert-container,
    .weather-forecast-container {
      min-height: 0;

      .system-summary-card,
      .base-info-card,
      .quick-access-card,
      .map-card,
      .alert-card,
      .weather-forecast-card {
        height: 100%;
        border-radius: 0.8vh;
        border: none;
        box-shadow: 0 0.2vh 1.2vh 0 rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .card-content {
          flex: 1;
          position: relative;
          overflow: hidden;
          height: 100%;
          padding: 0;
          display: flex;
          flex-direction: column;

          :deep(.alert-list-container),
          :deep(.base-info-container),
          :deep(.quick-access-container),
          :deep(.map-wrapper),
          :deep(.system-summary-container),
          :deep(.base-all-container) {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            max-height: 100%;
          }

          :deep(.base-info-content),
          :deep(.quick-access-content),
          :deep(.alert-list-content),
          :deep(.system-summary-content),
          :deep(.base-all-content) {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            max-height: 100%;

            // 隐藏滚动条但保持滚动功能
            overflow-y: auto;

            // 针对不同浏览器隐藏滚动条
            &::-webkit-scrollbar {
              display: none; /* 隐藏WebKit浏览器的滚动条 */
            }

            -ms-overflow-style: none; /* 隐藏IE/Edge的滚动条 */
            scrollbar-width: none; /* 隐藏Firefox的滚动条 */
          }
        }
      }
    }
  }
}
</style>
