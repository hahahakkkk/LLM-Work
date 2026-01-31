<script setup lang="ts">
import SystemSummary from './components/summary.vue';
import AlertList from './components/alert-list-single-base.vue';
import BaseInfo from './components/base-info.vue';
import QuickAccess from './components/quick-access-all-bases.vue';
import GrowthMap from './components/map.vue';
import GrowthDiagnosis from './components/GrowthDiagnosis.vue';
import { ref, nextTick, computed, onMounted, watch } from 'vue';
import { listAlert } from '@/views/process/growth/alert/api';
import { landDictQuery, baseDictQuery } from '@/views/process/growth/api/tableDict';
import { listIntegratedData } from '@/views/process/growth/api/baseInfo/index';
import type { AlertVO } from '@/views/process/growth/alert/api/types';
import type { IntegratedDataVO } from '@/views/process/growth/api/baseInfo/types';

// 获取字典数据
const { proxy } = getCurrentInstance() as any;
const { base_id2name_map } = toRefs<any>(proxy?.useDict('base_id2name_map'));
const { growth_diagnose_period } = toRefs<any>(proxy?.useDict('growth_diagnose_period')); // 使用 growth_diagnose_period 字典

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

/** 获取基地名称标签 */
const getBaseNameLabel = (baseValue: string | undefined) => {
  if (!baseValue) return '';

  const baseOption = baseDict.value.find((option) => option.value === baseValue);
  return baseOption ? baseOption.label : baseValue;
};

// 当前选中的基地ID
const currentBaseId = ref<string | undefined>(undefined);

// 基地信息数据
const baseInfoData = ref({
  name: getBaseNameLabel(currentBaseId.value),
  lai: '4.12',
  spad: '46.8',
  growth: '正常',
  fieldCapacity: '20.5%',
  soilBulkDensity: '1.35 g/cm³'
});

// 预警信息数据
const alertData = ref<AlertItem[]>([]);

// 地块字典数据
const landDict = ref([]);

// 基地字典数据
const baseDict = ref([]);

// 格式化时间显示，去掉秒数
const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  // 如果时间字符串包含秒数，则去掉秒数部分
  return timeStr.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}):\d{2}/, '$1');
};

// 生长期映射 - 使用 growth_diagnose_period 字典
const growthPeriodMap = computed(() => {
  const map: Record<string, string> = {};
  if (growth_diagnose_period.value) {
    growth_diagnose_period.value.forEach((item: any) => {
      map[item.label] = item.value;
    });
  }
  return map;
});

// 获取真实预警数据
const fetchAlertData = async () => {
  try {
    const params: any = {
      // 使用新的API
      pageNum: 1,
      pageSize: 200,
      growthPeriod: growthPeriodMap.value[currentPeriod.value] || '3'
    };

    const res: any = await listAlert(params);
    // console.log('alert data response:', res);

    // 转换数据格式以适配前端组件
    alertData.value = res.rows.map((item: AlertVO) => ({
      id: item.id as number,
      title: item.alertType === '缺水' ? '缺水预警' : '缺肥预警',
      time: formatTime(item.actionTime),
      level: getAlertLevel(item.alertInfo),
      status: item.isProcessed === 1 ? 'handled' : 'unhandled',
      field: getPlotCodeById(item.plotId), // 使用plotId而不是baseId
      description: item.alertInfo,
      type: item.alertType === '缺水' ? 'water' : 'fertilizer'
    }));
  } catch (error) {
    console.error('获取预警数据失败:', error);
  }
};

// 根据生育期更新基地信息数据
const fetchBaseInfoData = async () => {
  try {
    if (!currentBaseId.value) return;

    // 调用API获取集成数据
    const params = {
      baseId: currentBaseId.value,
      period: growthPeriodMap.value[currentPeriod.value] || '3'
    };

    const res: any = await listIntegratedData(params);

    // 解析返回的数据并更新基地信息
    // 更安全地处理API响应数据
    let dataArray = [];
    if (res && typeof res === 'object' && Array.isArray(res.data)) {
      // 如果res有data字段且data是数组
      dataArray = res.data;
    }

    // 确保数组至少有一项数据
    if (dataArray.length > 0) {
      const data: IntegratedDataVO = dataArray[0];

      // 提取需要的字段
      const lai = data.avgLai !== undefined ? data.avgLai.toFixed(2) : 'N/A';
      const spad = data.avgSpad !== undefined ? data.avgSpad.toFixed(1) : 'N/A';
      // 简单处理长势等级，实际应该根据具体业务逻辑确定
      let growth = '正常'; // 默认值
      if (data.growthDistribution) {
        // 解析"良好:正常:较差"格式的比例数据
        const parts = data.growthDistribution.split(':');
        if (parts.length === 3) {
          const good = parseInt(parts[0]) || 0;
          const normal = parseInt(parts[1]) || 0;
          const poor = parseInt(parts[2]) || 0;

          // 选择数值最大的作为主要长势，如果一样则以前面的为准
          if (good >= normal && good >= poor) {
            growth = '良好';
          } else if (normal >= poor) {
            growth = '正常';
          } else {
            growth = '较差';
          }
        }
      }

      // 更新基地信息数据
      baseInfoData.value = {
        ...baseInfoData.value,
        lai: String(lai),
        spad: String(spad),
        growth: growth
      };
    }
  } catch (error) {
    console.error('获取基地信息数据失败:', error);
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
  // 更新地图组件显示的生育期数据
  updateMapWithPeriod(newPeriod);
  // 重新获取预警数据
  fetchAlertData();
  // 重新获取基地信息数据
  fetchBaseInfoData();
};

// 处理来自系统概述组件的生育期变化事件
const handleSummaryPeriodChange = (newPeriod: string) => {
  currentPeriod.value = newPeriod;
  // 更新地图组件显示的生育期数据
  updateMapWithPeriod(newPeriod);
  // 重新获取预警数据
  fetchAlertData();
  // 重新获取基地信息数据
  fetchBaseInfoData();
};

// 根据生育期更新地图显示
const updateMapWithPeriod = (period: string) => {
  if (mapRef.value && typeof mapRef.value.updateMapByGrowthPeriod === 'function') {
    mapRef.value.updateMapByGrowthPeriod(period);
  }
};

// 处理地图刷新事件
const handleRefreshMap = async () => {
  // console.log('正在刷新地图...');
  // 调用地图组件的刷新方法
  if (mapRef.value && typeof mapRef.value.refreshMap === 'function') {
    try {
      await mapRef.value.refreshMap();
      // console.log('地图数据已刷新');
    } catch (error) {
      console.error('刷新地图失败:', error);
    }
  } else {
    console.warn('地图组件未提供刷新方法');
  }
};

const selectedBase = computed(() => {
  // 使用基地ID到跳转地点名称的专门字典进行转换
  if (currentBaseId.value && base_id2name_map.value) {
    // 在字典数组中查找匹配的基地ID
    const matchedEntry = base_id2name_map.value.find((entry) => entry.label === currentBaseId.value);
    if (matchedEntry) {
      // console.log('使用字典进行转换:', currentBaseId.value, '->', matchedEntry.value);
      return matchedEntry.value;
    }
  }

  // 如果没有找到映射，则返回空字符串
  console.log('未找到基地ID对应的跳转地点名称:', currentBaseId.value);
  return '';
});

// 监听currentBaseId的变化，确保及时更新selectedBase
watch(currentBaseId, (newVal) => {
  // console.log('currentBaseId changed:', newVal);
  // 当基地ID改变时也更新基地信息数据
  fetchBaseInfoData();
});

// 处理长势诊断完成事件
const handleGrowthDiagnosisCompleted = () => {
  // console.log('长势诊断完成，开始添加预警数据...');
  fetchAlertData();
  // 刷新地图
  handleRefreshMap();
  // 重新获取基地信息数据
  fetchBaseInfoData();
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

// 处理基地选择事件
// 处理地块选择事件（从地图组件获取）
const handlePlotSelected = (plotInfo: any) => {
  // console.log('选中的地块信息:', plotInfo);
  if (plotInfo && plotInfo.properties) {
    selectedPlotInfo.value = plotInfo;
    selectedPlot.value = plotInfo.properties.landCode || '';
    selectedPlotId.value = plotInfo.properties.landId || '';
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
    // console.log('获取基地字典成功:', res);
    baseDict.value =
      res.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];

    // 将基地字典的第一项存储为当前基地id和名称
    if (res.rows && res.rows.length > 0) {
      const firstBase = res.rows[0];
      currentBaseId.value = String(firstBase.value);
      baseInfoData.value.name = firstBase.label;
    }
  } catch (error) {
    console.error('获取基地字典失败:', error);
    baseDict.value = [];
  }
};

// 初始化时获取字典和执行转换
onMounted(() => {
  // 获取基地字典和设置当前基地
  getDicts();
  fetchLandDict().then(() => {
    // 获取地块字典数据
    fetchAlertData();
    // 获取基地信息数据
    fetchBaseInfoData();
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

      <!-- 左侧：基地信息（占2行） -->
      <div class="base-info-container">
        <el-card class="base-info-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box' }">
          <div class="card-content">
            <BaseInfo :base-info="baseInfoData" />
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

      <!-- 中间：地图组件（占3行3列） -->
      <div class="map-container">
        <el-card class="map-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box' }">
          <div class="card-content">
            <!-- 地图标题栏 -->
            <!--            <div class="map-header">-->
            <!--              <div class="map-info">-->
            <!--                <el-tag v-if="selectedBase" type="primary" size="large">基地：{{ selectedBase }}</el-tag>-->
            <!--                <el-tag v-if="selectedPlot" type="success" size="large">地块：{{ selectedPlot }}</el-tag>-->
            <!--                <el-tag v-else type="info" size="large">地块：请点击具体地块</el-tag>-->
            <!--                &lt;!&ndash; 直接显示当前生育期，不需要下拉选择 &ndash;&gt;-->
            <!--                <el-tag type="warning" size="large">生育期：{{ currentPeriod }}</el-tag>-->
            <!--              </div>-->
            <!--              <div class="map-actions">-->
            <!--                <el-button type="primary" size="large" :disabled="!canDiagnose" @click="showDiagnosisForm"> 长势诊断 </el-button>-->
            <!--              </div>-->
            <!--            </div>-->

            <!-- 地图组件 -->
            <GrowthMap
              ref="mapRef"
              :initial-base-name="selectedBase"
              :growth-period="currentPeriod"
              @map-loaded="handleMapLoaded"
              @feature-click="handlePlotSelected"
            />
          </div>
        </el-card>
      </div>

      <!-- 右侧：预警信息列表（占3行） -->
      <div class="alert-container">
        <el-card class="alert-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box' }">
          <div class="card-content">
            <AlertList :alerts="alertData" />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 长势诊断组件 -->
    <GrowthDiagnosis ref="growthDiagnosisRef" @completed="handleGrowthDiagnosisCompleted" />
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
    grid-template-rows: 8% 62% 26%;
    gap: 1vh;
    height: calc(90vh - 32px);

    /* 系统概述组件占据第一行全部宽度 */
    .system-summary-container {
      grid-row: 1;
      grid-column: 1 / span 3;
    }

    /* 基地信息占据第一列的前两行 */
    .base-info-container {
      grid-row: 2;
      grid-column: 1;
    }

    /* 快捷操作占据第一列的第三行 */
    .quick-access-container {
      grid-row: 3;
      grid-column: 1;
    }

    /* 地图组件占据中间三行三列 */
    .map-container {
      grid-row: 2 / span 2;
      grid-column: 2;
    }

    /* 预警信息占据右侧三行 */
    .alert-container {
      grid-row: 2 / span 2;
      grid-column: 3;
    }

    /* 地图标题栏样式 */
    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #ebeef5;
      font-size: 14px;

      .map-info {
        display: flex;
        align-items: center;
        gap: 16px;
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
    .alert-container {
      min-height: 0;

      .system-summary-card,
      .base-info-card,
      .quick-access-card,
      .map-card,
      .alert-card {
        height: 100%;
        border-radius: 8px;
        border: none;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-size: 14px;
        font-weight: normal;

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
            font-size: 14px;
            font-weight: normal;
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
            font-size: 14px;
            font-weight: normal;

            // 仪表盘、图表等内容使用12px字体
            :deep(.dashboard-item),
            :deep(.chart-container),
            :deep(canvas),
            :deep(.echarts) {
              font-size: 12px;
            }

            // 隐藏滚动条但保持滚动功能
            overflow-y: auto;

            // 针对不同浏览器隐藏滚动条
            &::-webkit-scrollbar {
              display: none; /* 隐藏WebKit浏览器的滚动条 */
            }

            -ms-overflow-style: none; /* 隐藏IE/Edge的滚动条 */
            scrollbar-width: none; /* 隐藏Firefox的滚动条 */
          }

          :deep(.component-title) {
            font-size: 16px;
            font-weight: bold;
          }
        }
      }
    }
  }
}
</style>
