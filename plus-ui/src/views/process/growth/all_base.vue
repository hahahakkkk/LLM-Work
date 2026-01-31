<script setup lang="ts">
import SystemSummary from './components/summary.vue';
import AlertList from './components/alert-list-single-base.vue';
import BaseInfo from './components/base-info.vue';
import QuickAccess from './components/quick-access-all-bases.vue';
import GrowthMap from './components/map.vue';
import GrowthDiagnosis from './components/GrowthDiagnosis.vue';
import { ref, nextTick, computed, onMounted } from 'vue';
import { listSupplyRec } from '@/views/process/growth/supplyRec/api';
import { landDictQuery } from '@/views/process/growth/api/tableDict';
import type { SupplyRecVO } from '@/views/process/growth/supplyRec/api/types';

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

// 格式化时间显示，去掉秒数
const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  // 如果时间字符串包含秒数，则去掉秒数部分
  return timeStr.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}):\d{2}/, '$1');
};

// 获取真实预警数据
const fetchAlertData = async () => {
  try {
    const res: any = await listSupplyRec({
      pageNum: 1,
      pageSize: 20, // 增加页面大小以确保获取到足够的数据
      baseName: '侯家沟基地'
    });

    // 过滤掉采收预警，只保留补水和追肥类型的预警
    const filteredRows = res.rows.filter((item: SupplyRecVO) => item.measure === '补水' || item.measure === '追肥');

    // 将获取到的数据转换为预警列表组件所需的格式
    alertData.value = filteredRows.map((item: SupplyRecVO) => ({
      id: item.id as number,
      title: item.measure === '补水' ? '缺水预警' : '缺肥预警',
      time: formatTime(item.actionTime),
      // 根据alertInfo内容设置预警级别
      level: getAlertLevel(item.alertInfo),
      // 随机生成处理状态
      status: ['unhandled', 'handled'][Math.floor(Math.random() * 2)],
      field: getPlotCodeById(item.baseId),
      description: item.alertInfo,
      type: item.measure === '补水' ? 'water' : 'fertilizer'
    }));
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
const selectedBase = ref('侯家沟数字化种植基地'); // 默认选中侯家沟基地
const selectedBaseId = ref('1880899316147232770'); // 默认基地ID
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

// 处理基地选择事件
// 处理地块选择事件（从地图组件获取）
const handlePlotSelected = (plotInfo: any) => {
  console.log('选中的地块信息:', plotInfo);
  if (plotInfo && plotInfo.properties) {
    selectedPlotInfo.value = plotInfo;
    selectedPlot.value = plotInfo.properties.landCode || '';
    selectedPlotId.value = plotInfo.properties.landId || '';
    // 从地块信息中获取基地ID
    if (plotInfo.properties.baseId) {
      selectedBaseId.value = plotInfo.properties.baseId;
    }
  }
};

// 显示诊断表单
const showDiagnosisForm = async () => {
  if (growthDiagnosisRef.value && typeof growthDiagnosisRef.value.showAddDialog === 'function') {
    // 设置表单默认值，只传递基地ID
    await growthDiagnosisRef.value.setDefaultValues({
      baseId: selectedBaseId.value,
      plotId: selectedPlotId.value,
      growthPeriod: currentPeriod.value, // 传递当前生育期
      diagnosisTime: new Date()
        .toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
        .replace(/\//g, '-')
        .replace(', ', ' ')
    });

    growthDiagnosisRef.value.showAddDialog();
  }
};

// 计算是否可以进行诊断（必须选中基地和地块）
const canDiagnose = computed(() => {
  return selectedBase.value && selectedPlotId.value;
});

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

onMounted(() => {
  // 获取地块字典数据
  fetchLandDict();
  // 获取预警数据
  fetchAlertData();
  // 组件挂载后，确保地图定位到默认基地
  setTimeout(() => {
    if (mapRef.value && typeof mapRef.value.handleBaseSelection === 'function') {
      mapRef.value.handleBaseSelection(selectedBase.value);
    }
  }, 500);

  // 初始化基地字典数据，用于基地ID查找
  if (growthDiagnosisRef.value && typeof growthDiagnosisRef.value.getDicts === 'function') {
    growthDiagnosisRef.value.getDicts();
  }
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
            <BaseInfo :current-period="currentPeriod" />
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
            <div class="map-header">
              <div class="map-info">
                <el-tag v-if="selectedBase" type="primary" size="large">基地：{{ selectedBase }}</el-tag>
                <el-tag v-if="selectedPlot" type="success" size="large">地块：{{ selectedPlot }}</el-tag>
                <el-tag v-else type="info" size="large">地块：请点击具体地块</el-tag>
                <!-- 直接显示当前生育期，不需要下拉选择 -->
                <el-tag type="warning" size="large">生育期：{{ currentPeriod }}</el-tag>
              </div>
              <div class="map-actions">
                <el-button type="primary" size="large" :disabled="!canDiagnose" @click="showDiagnosisForm"> 长势诊断 </el-button>
              </div>
            </div>

            <!-- 地图组件 -->
            <GrowthMap ref="mapRef" :initial-base-name="selectedBase" @map-loaded="handleMapLoaded" @feature-click="handlePlotSelected" />
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
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;

  .main-content {
    margin-top: 0;
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 55% 1.2fr;
    grid-template-rows: auto auto auto;
    gap: 10px;
    height: calc(100vh - 140px);
    min-height: 0;

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
      padding: 10px 15px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #ebeef5;

      .map-info {
        display: flex;
        align-items: center;
        gap: 10px;
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

    .base-info-container {
      max-height: 50vh;
    }

    .quick-access-container {
      max-height: 30vh;
    }

    .map-container,
    .alert-container {
      max-height: 80vh;
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
