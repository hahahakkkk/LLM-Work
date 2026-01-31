<script setup lang="ts">
import SystemTitle from './components/system-title.vue';
import SystemStats from './components/system-stats.vue';
import BaseAll from './components/base-all.vue';
import QuickAccess from './components/quick-access.vue';
import EmergenceMap from './components/map.vue';
import SowingPeriod from './components/sowing-period.vue';
import DetailInfo from './emergenceate/detailInfo.vue';
import { ref, nextTick, onMounted, onActivated, onBeforeUnmount, computed } from 'vue';
import { fetchErHistoryRecords } from '@/views/process/seedling/emergenceate/api';
import { baseDictQuery } from '@/views/process/growth/api/tableDict';

// 定义预警信息类型
interface AlertItem {
  id: number;
  title: string;
  time: string;
  level: 'high' | 'medium' | 'low';
  status: 'unhandled' | 'handled';
  base: string;
  field: string;
  description: string;
  type: 'emergence' | 'growth';
}

const mapRef = ref(null);
// const emergenceDetectionRef = ref(null); // 已移除

// 详情对话框相关
const detailInfoVisible = ref(false);
const selectedDetectionData = ref<any>({});

// 基地ID到NAME的映射表
const baseIdToNameMap = ref<Map<string, string>>(new Map());

// 当前基地的准确名称（从GeoJSON映射表获取）
const currentBaseName = ref<string>('');

// 变化检测相关
const changeDetectionVisible = ref(false);
const changeAreaData = ref<any>(null); // 变化检测面积数据

// 当前生育期
const currentPeriod = ref('出苗期');

// 预警信息数据
const alertData = ref<AlertItem[]>([]);

// 格式化时间显示，去掉秒数
const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  return timeStr.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}):\d{2}/, '$1');
};

// 获取出苗率预警数据
const fetchAlertData = async () => {
  try {
    // 模拟获取出苗率相关的预警数据
    const mockData: AlertItem[] = [
      {
        id: 1,
        title: '出苗率偏低预警',
        time: '2025-09-23 14:30',
        level: 'high',
        status: 'unhandled',
        base: '侯家沟基地',
        field: '004',
        description: '监测到004号地块出苗率为46%，低于正常标准，建议检查土壤水分和种子质量',
        type: 'emergence'
      },
      {
        id: 2,
        title: '出苗不均匀预警',
        time: '2025-09-23 13:45',
        level: 'medium',
        status: 'unhandled',
        base: '姜兴庄基地',
        field: '009',
        description: '009号地块出苗不均匀，局部区域出苗率差异较大，建议进行补种',
        type: 'emergence'
      },
      {
        id: 3,
        title: '生长异常预警',
        time: '2025-09-23 12:15',
        level: 'low',
        status: 'handled',
        base: '冯渠基地',
        field: '021',
        description: '021号地块幼苗生长速度偏慢，已安排技术人员现场查看',
        type: 'growth'
      }
    ];

    alertData.value = mockData;
  } catch (error) {
    // 获取失败，静默处理
  }
};

// 记录检测完成事件的ID，防止重复处理
const processedCompletionIds = new Set<number>();

// 添加出苗率预警
const addEmergenceAlerts = () => {
  const eventId = Date.now();

  if (processedCompletionIds.has(eventId)) {
    return;
  }

  processedCompletionIds.add(eventId);

  const tenSecondsAgo = Date.now() - 10000;
  for (const id of processedCompletionIds) {
    if (id < tenSecondsAgo) {
      processedCompletionIds.delete(id);
    }
  }

  const currentTime = new Date()
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    .replace(/\//g, '-')
    .replace(', ', ' ');

  // 创建出苗率预警
  const emergenceAlert: AlertItem = {
    id: Date.now(),
    title: '出苗率检测完成',
    time: currentTime,
    level: 'medium',
    status: 'unhandled',
    base: '',
    field: selectedPlot.value.replace('hjg', '侯家沟'),
    description: '出苗率检测已完成，请查看详细结果',
    type: 'emergence'
  };

  alertData.value.unshift(emergenceAlert);
};

// 生育期选项
const growthPeriods = ref([
  { value: '播种期', label: '播种期' },
  { value: '出苗期', label: '出苗期' },
  { value: '分蘖期', label: '分蘖期' }
]);

// 当前选中的基地和地块
const currentBaseId = ref<string | undefined>(undefined);
const baseDict = ref<any[]>([]);
const selectedPlot = ref('');
const selectedPlotId = ref('');
const selectedPlotInfo = ref(null);

// 从播种期接口获取的品种信息
const currentVariety = ref<string>('');

/** 获取基地名称标签 */
const getBaseNameLabel = (baseValue: string | undefined) => {
  if (!baseValue) return '';
  const baseOption = baseDict.value.find((option) => option.value === baseValue);
  return baseOption ? baseOption.label : baseValue;
};

// 计算当前选中的基地名称
const selectedBase = computed(() => {
  let baseName = getBaseNameLabel(currentBaseId.value);

  // 去除末尾的"基地"两个字
  if (baseName && baseName.endsWith('基地')) {
    baseName = baseName.slice(0, -2);
  }

  // 根据基地名称添加后缀
  if (baseName.includes('姜兴庄')) {
    return baseName + '智慧引领种植基地';
  } else if (baseName === '侯家沟') {
    return baseName + '数字化种植基地';
  } else {
    // 对于其他基地，只显示基地名称
    return baseName || '侯家沟数字化种植基地'; // 默认值
  }
});

// 处理生育期变化事件
const handlePeriodChange = (newPeriod: string) => {
  currentPeriod.value = newPeriod;
};

// 处理地图刷新事件
const handleRefreshMap = async () => {
  if (mapRef.value && typeof mapRef.value.refreshMap === 'function') {
    try {
      await mapRef.value.refreshMap();
    } catch (error) {
      // 刷新失败，静默处理
    }
  }
};

// 处理异常地块点击事件
const handleAbnormalPlotsClick = () => {
  if (mapRef.value && typeof mapRef.value.highlightAbnormalPlots === 'function') {
    mapRef.value.highlightAbnormalPlots();
  }
};

// 出苗率检测完成事件处理已移除

// 加载基地映射数据（从 mz-base-new.geojson）
const loadBaseMapping = async () => {
  try {
    const response = await fetch('/map-json/mz-base-new.geojson');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const geojsonData = await response.json();

    // 🔑 构建 BASEID -> NAME 的映射表
    geojsonData.features.forEach((feature: any) => {
      const baseId = feature.properties.BASEID;
      const baseName = feature.properties.NAME;
      if (baseId && baseName) {
        baseIdToNameMap.value.set(baseId, baseName);
      }
    });

    // 如果已经有基地ID，立即设置基地名称
    if (currentBaseId.value) {
      const baseName = baseIdToNameMap.value.get(currentBaseId.value);
      if (baseName) {
        currentBaseName.value = baseName;
      }
    }
  } catch (error) {
    // 提供默认映射作为兜底
    baseIdToNameMap.value.set('1880899316147232770', '侯家沟数字化种植基地');
    baseIdToNameMap.value.set('1886244367296888833', '姜兴庄智慧引领种植基地');
  }
};

// 根据基地ID定位地图
const locateMapToBase = () => {
  if (!currentBaseId.value) {
    return;
  }

  if (baseIdToNameMap.value.size === 0) {
    return;
  }

  // 🔑 关键步骤：从映射表中查找基地ID对应的NAME
  const baseName = baseIdToNameMap.value.get(currentBaseId.value);

  if (!baseName) {
    return;
  }

  // 更新当前基地名称
  currentBaseName.value = baseName;

  // 调用地图定位方法（使用NAME）
  if (mapRef.value && typeof mapRef.value.handleBaseSelection === 'function') {
    mapRef.value.handleBaseSelection(baseName);
  }
};

// 在下一次DOM更新后，通知地图组件更新尺寸
const handleMapLoaded = () => {
  nextTick(() => {
    if (mapRef.value && mapRef.value.mapRef && mapRef.value.mapRef.value) {
      const olMap = mapRef.value.mapRef.value.getMap();
      if (olMap && typeof olMap.updateSize === 'function') {
        olMap.updateSize();
      }
    }

    // 地图加载完成后，如果已有基地ID和映射表，立即定位
    if (currentBaseId.value && baseIdToNameMap.value.size > 0) {
      setTimeout(() => {
        locateMapToBase();
      }, 300);
    }
  });
};

// 获取基地字典
const getDicts = async () => {
  try {
    const res = await baseDictQuery();
    baseDict.value =
      res.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];
  } catch (error) {
    baseDict.value = [];
  }
};

// 获取当前基地ID（从基地字典中，根据用户权限）
const fetchCurrentBaseId = async () => {
  try {
    // 🔑 直接从基地字典获取当前用户的基地（后端会根据用户权限返回）
    if (baseDict.value && baseDict.value.length > 0) {
      // 取第一个基地作为当前基地（后端已根据用户权限过滤）
      currentBaseId.value = baseDict.value[0].value;
    } else {
      return;
    }

    // 可选：尝试从出苗率数据中验证基地信息
    try {
      const response = await fetchErHistoryRecords();
      const apiData = (response as any).rows || [];

      if (apiData && apiData.length > 0) {
        const firstRecord = apiData[0];
        const baseName = firstRecord.baseName;
      }
    } catch (error) {
      // 获取失败不影响地图定位
    }

    // 获取到基地ID后，立即从映射表中获取基地名称
    if (currentBaseId.value && baseIdToNameMap.value.size > 0) {
      const baseName = baseIdToNameMap.value.get(currentBaseId.value);
      if (baseName) {
        currentBaseName.value = baseName;
      }

      // 如果地图已就绪，立即定位
      if (mapRef.value) {
        setTimeout(() => {
          locateMapToBase();
        }, 300);
      }
    }
  } catch (error) {
    // 出错时使用默认基地
    const hjgBase = baseDict.value.find((option) => option.label.includes('侯家沟'));
    if (hjgBase) {
      currentBaseId.value = hjgBase.value;
    }
  }
};

// 处理基地选择事件
const handleBaseSelected = (baseName: string) => {
  if (mapRef.value && typeof mapRef.value.handleBaseSelection === 'function') {
    mapRef.value.handleBaseSelection(baseName);
  }

  // 重置地块选择
  selectedPlot.value = '';
  selectedPlotId.value = '';
  selectedPlotInfo.value = null;

  // 基地字典查找功能已简化
};

// 处理品种加载事件
const handleVarietyLoaded = (variety: string) => {
  currentVariety.value = variety;
};

// 处理地块选择事件（从地图组件获取）
const handlePlotSelected = (plotInfo: any) => {
  if (plotInfo && plotInfo.properties) {
    selectedPlotInfo.value = plotInfo;
    selectedPlot.value = plotInfo.properties.landCode || '';
    selectedPlotId.value = plotInfo.properties.landId || '';
    if (plotInfo.properties.baseId) {
      currentBaseId.value = plotInfo.properties.baseId;
    }
  }
};

// 出苗率检测相关功能已移除

// 处理地图详情显示事件
const handleShowDetail = (detailData: any) => {
  selectedDetectionData.value = detailData.detectionData;
  detailInfoVisible.value = true;
};

// 加载变化检测面积数据
const loadChangeAreaData = async () => {
  try {
    const response = await fetch('/map-json/guzi_change_area.json');
    if (!response.ok) {
      console.error('获取变化检测面积数据失败');
      return;
    }
    const data = await response.json();
    changeAreaData.value = data;
  } catch (error) {
    console.error('加载变化检测面积数据失败:', error);
  }
};

// 计算当前基地的面积变化信息
const changeAreaInfo = computed(() => {
  if (!changeDetectionVisible.value || !changeAreaData.value || !currentBaseId.value) {
    return null;
  }

  // 从数据中查找当前基地的信息
  const baseData = changeAreaData.value.results?.find((item: any) => item.baseId === currentBaseId.value);

  if (!baseData) {
    return null;
  }

  return {
    newArea: baseData.new_2025_area_mu?.toFixed(2) || '0.00',
    reducedArea: baseData.reduced_2025_area_mu?.toFixed(2) || '0.00'
  };
});

// 切换变化检测显示
const toggleChangeDetection = () => {
  changeDetectionVisible.value = !changeDetectionVisible.value;
  if (mapRef.value && typeof mapRef.value.toggleChangeDetection === 'function') {
    mapRef.value.toggleChangeDetection(changeDetectionVisible.value);
  }
};

// 页面数据刷新函数
const refreshPageData = async () => {
  try {
    // 获取预警数据
    await fetchAlertData();
  } catch (error) {
    // 刷新失败，静默处理
  }

  setTimeout(() => {
    // 🔑 使用新的定位逻辑：通过基地ID定位
    if (currentBaseId.value && baseIdToNameMap.value.size > 0) {
      locateMapToBase();
    } else if (mapRef.value && typeof mapRef.value.handleBaseSelection === 'function') {
      // 兜底方案：使用旧的方式
      mapRef.value.handleBaseSelection(selectedBase.value);
    }

    // 刷新地图数据
    if (mapRef.value && typeof mapRef.value.refreshMap === 'function') {
      mapRef.value.refreshMap();
    }

    // 刷新地图尺寸
    nextTick(() => {
      if (mapRef.value && mapRef.value.mapRef && mapRef.value.mapRef.value) {
        const olMap = mapRef.value.mapRef.value.getMap();
        if (olMap && typeof olMap.updateSize === 'function') {
          olMap.updateSize();
        }
      }
    });
  }, 300);
};

// 移除复杂的路由监听器，改为依赖onActivated钩子

// 页面焦点处理函数
const handlePageFocus = () => {
  const currentPath = window.location.pathname;
  if (currentPath.includes('/process/seedling') && !currentPath.includes('/emergenceate')) {
    setTimeout(() => {
      refreshPageData();
    }, 100);
  }
};

// 页面可见性变化处理
const handleVisibilityChange = () => {
  if (!document.hidden) {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/process/seedling') && !currentPath.includes('/emergenceate')) {
      setTimeout(() => {
        refreshPageData();
      }, 100);
    }
  }
};

onMounted(async () => {
  // 1. 加载GeoJSON映射表
  await loadBaseMapping();

  // 2. 获取基地字典
  await getDicts();

  // 3. 从出苗率数据中获取当前基地ID
  await fetchCurrentBaseId();

  // 4. 加载变化检测面积数据
  await loadChangeAreaData();

  // 4. 刷新页面数据
  refreshPageData();

  // 添加全局事件监听器
  window.addEventListener('focus', handlePageFocus);
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

// 添加 activated 钩子处理 keep-alive 缓存组件重新激活的情况
onActivated(async () => {
  // 强制等待一下，确保组件完全激活
  await new Promise((resolve) => setTimeout(resolve, 200));

  // 重新初始化所有数据
  await refreshPageData();
});

onBeforeUnmount(() => {
  // 清理事件监听器
  window.removeEventListener('focus', handlePageFocus);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <div class="seedling-dashboard">
    <div class="main-content">
      <!-- 系统标题组件 -->
      <!-- <div class="system-title-container">
        <SystemTitle />
      </div> -->

      <!-- 系统统计组件 -->
      <div class="system-stats-container">
        <SystemStats @abnormal-plots-click="handleAbnormalPlotsClick" />
      </div>

      <!-- 左侧容器 -->
      <div class="left-sidebar-container">
        <!-- 基地信息 -->
        <div class="base-info-container">
          <el-card class="base-info-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box' }">
            <div class="card-content">
              <BaseAll :variety="currentVariety" @base-selected="handleBaseSelected" />
            </div>
          </el-card>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-access-container">
          <el-card class="quick-access-card" shadow="hover" :body-style="{ height: 'auto', width: '100%', boxSizing: 'border-box' }">
            <div class="card-content">
              <QuickAccess :current-period="currentPeriod" @period-change="handlePeriodChange" @refresh-map="handleRefreshMap" />
            </div>
          </el-card>
        </div>
      </div>

      <!-- 中间：地图组件（占3行3列） -->
      <div class="map-container">
        <el-card class="map-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box' }">
          <div class="card-content">
            <!-- 地图标题栏 -->
            <div class="map-header">
              <div class="map-info">
                <!-- 只在非变化检测模式下显示地块点击提示 -->
                <template v-if="!changeDetectionVisible">
                  <el-tag v-if="selectedPlot" type="success" size="large">地块：{{ selectedPlot }}</el-tag>
                  <el-tag v-else type="info" size="large">地块：请点击具体地块</el-tag>
                </template>
                <!-- 变化检测模式下显示面积变化信息 -->
                <template v-else-if="changeAreaInfo">
                  <div class="change-area-info">
                    <span class="change-text">
                      当前基地 2025 年相比2024年谷子种植变化情况：
                      <span class="new-area">新增 {{ changeAreaInfo.newArea }} 亩</span>，
                      <span class="reduced-area">减少 {{ changeAreaInfo.reducedArea }} 亩</span>
                    </span>
                  </div>
                </template>
              </div>
              <div class="map-actions">
                <el-button type="primary" :icon="changeDetectionVisible ? 'Hide' : 'View'" @click="toggleChangeDetection">
                  {{ changeDetectionVisible ? '隐藏变化检测' : '变化检测' }}
                </el-button>
              </div>
            </div>

            <!-- 地图组件 -->
            <EmergenceMap
              ref="mapRef"
              :initial-base-name="currentBaseName || selectedBase"
              @map-loaded="handleMapLoaded"
              @feature-click="handlePlotSelected"
              @show-detail="handleShowDetail"
            />
          </div>
        </el-card>
      </div>

      <!-- 播种期模块（独占右侧） -->
      <div class="sowing-period-container">
        <SowingPeriod :selected-base="selectedBase" :base-id="currentBaseId" @variety-loaded="handleVarietyLoaded" />
      </div>
    </div>

    <!-- 出苗率检测组件已移除 -->

    <!-- 检测详情对话框 -->
    <DetailInfo v-model="detailInfoVisible" :detection-data="selectedDetectionData" />
  </div>
</template>

<style scoped lang="scss">
.seedling-dashboard {
  padding: 0.5vw;
  background-color: #f5f7fa;
  height: calc(100vh - 84px);
  max-height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;

  .main-content {
    margin-top: 0;
    flex: 1;
    display: grid;
    grid-template-columns: 1.2fr 3.5fr 1fr;
    grid-template-rows: auto auto;
    gap: 8px;
    min-height: 0;
    height: 100%;
    max-height: 100%;

    /* 系统标题组件占据第一列第一行 */
    /* .system-title-container {
        grid-row: 1;
        grid-column: 1;
        max-height: 20vh;
        overflow: hidden;
      } */

    /* 系统统计组件占据第二、三列第一行 */
    .system-stats-container {
      grid-row: 1;
      grid-column: 1 / span 3;
      max-height: 20vh;
      overflow: hidden;
    }

    /* 左侧容器占据第一列的第二行 */
    .left-sidebar-container {
      grid-row: 2;
      grid-column: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5vh;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;

      /* 隐藏滚动条但保持滚动功能 */
      &::-webkit-scrollbar {
        display: none;
      }

      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    /* 基地信息容器 */
    .base-info-container {
      flex: 1;
      min-height: 0;
      overflow: visible;
    }

    /* 快捷操作组件 */
    .quick-access-container {
      flex: 0 0 auto;
      min-height: 0;
      overflow: visible;
    }

    /* 地图组件占据第二列的第二行 */
    .map-container {
      grid-row: 2;
      grid-column: 2;
      min-height: 0;
      max-height: 100%;
      overflow: hidden;
    }

    /* 播种期组件独占第三列的第二行 */
    .sowing-period-container {
      grid-row: 2;
      grid-column: 3;
      min-height: 0;
      max-height: 100%;
      overflow: hidden;
    }

    /* 地图标题栏样式 */
    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5vh 1vw;
      background-color: #f5f7fa;
      border-bottom: 1px solid #ebeef5;
      flex-shrink: 0;

      .map-info {
        display: flex;
        align-items: center;
        gap: 0.5vw;
        flex-wrap: wrap;

        .el-tag {
          font-size: clamp(12px, 0.8vw, 14px);
          padding: 0.3vh 0.5vw;
        }

        // 变化检测面积信息样式
        .change-area-info {
          display: flex;
          align-items: center;
          padding: 0.4vh 0.8vw;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
          border-radius: 6px;
          border: 1px solid #dcdfe6;

          .change-text {
            font-size: clamp(13px, 0.9vw, 15px);
            color: #606266;
            font-weight: 500;

            .new-area {
              color: #f56c6c;
              font-weight: 600;
              margin: 0 4px;
            }

            .reduced-area {
              color: #67c23a;
              font-weight: 600;
              margin: 0 4px;
            }
          }
        }
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

    /* 系统标题和统计容器样式 */
    .system-stats-container {
      min-height: 0;
    }

    /* 左侧容器和其他主要容器样式 */
    .left-sidebar-container,
    .map-container,
    .sowing-period-container {
      min-height: 0;
    }

    /* 卡片通用样式 */
    .base-info-card,
    .quick-access-card,
    .map-card {
      height: 100%;
      border-radius: clamp(4px, 0.4vw, 8px);
      border: none;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .card-content {
        flex: 1;
        position: relative;
        height: 100%;
        padding: 0;
        display: flex;
        flex-direction: column;

        :deep(.map-wrapper) {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          max-height: 100%;
        }
      }
    }

    /* 基地信息卡片填充容器 */
    .base-info-card {
      height: 100%;

      .card-content {
        flex: 1;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;

        /* 隐藏滚动条但保持滚动功能 */
        &::-webkit-scrollbar {
          display: none;
        }

        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    }

    /* 快捷操作卡片根据内容自适应 */
    .quick-access-card {
      height: auto;

      .card-content {
        flex: none;
        height: auto;
        overflow: visible;
      }
    }

    /* 地图卡片保持overflow hidden */
    .map-card {
      .card-content {
        overflow: hidden;
      }
    }
  }
}

// 超大屏幕适配 (>1920px)
@media screen and (min-width: 1920px) {
  .seedling-dashboard {
    .main-content {
      grid-template-columns: 1fr 4fr 1fr;
      gap: 10px;

      /* .system-title-container,
      .system-stats-container { */
      .system-stats-container {
        grid-column: 1 / span 3;
        max-height: 18vh;
      }
    }

    .left-sidebar-container {
      gap: 10px;
    }
  }
}

// 大屏幕适配 (1440px - 1920px)
@media screen and (min-width: 1440px) and (max-width: 1919px) {
  .seedling-dashboard {
    .main-content {
      grid-template-columns: 1.1fr 3.8fr 1fr;
      gap: 8px;

      /* .system-title-container,
      .system-stats-container { */
      .system-stats-container {
        grid-column: 1 / span 3;
        max-height: 18vh;
      }
    }

    .left-sidebar-container {
      gap: 8px;
    }
  }
}

// 中等屏幕适配 (1280px - 1439px)
@media screen and (min-width: 1280px) and (max-width: 1439px) {
  .seedling-dashboard {
    padding: 0.4vw;

    .main-content {
      grid-template-columns: 1.3fr 3.4fr 1fr;
      gap: 6px;

      /* .system-title-container,
      .system-stats-container { */
      .system-stats-container {
        grid-column: 1 / span 3;
        max-height: 22vh;
      }

      .left-sidebar-container {
        gap: 6px;
      }

      .map-header {
        padding: 0.4vh 0.8vw;

        .map-info {
          gap: 4px;

          .el-tag {
            font-size: clamp(11px, 0.75vw, 13px);
          }
        }
      }
    }
  }
}

// 小屏幕适配 (1024px - 1279px)
@media screen and (max-width: 1279px) {
  .seedling-dashboard {
    padding: 0.3vw;
    height: calc(100vh - 70px);
    max-height: calc(100vh - 70px);

    .main-content {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto 1fr;
      gap: 4px;

      /* .system-title-container {
        grid-row: 1;
        grid-column: 1;
        max-height: 10vh;
      } */

      .system-stats-container {
        grid-row: 1;
        grid-column: 1;
        max-height: 15vh;
      }

      .left-sidebar-container {
        grid-row: 2;
        grid-column: 1;
        flex-direction: row;
        gap: 4px;
        max-height: 25vh;
        min-height: 200px;

        .base-info-container {
          flex: 2;
          min-height: 180px;
          max-height: 100%;
        }

        .quick-access-container {
          flex: 1;
          min-height: 150px;
          max-height: 100%;
        }
      }

      .map-container {
        grid-row: 3;
        grid-column: 1;
      }

      .sowing-period-container {
        display: none; // 小屏幕隐藏播种期模块
      }

      .map-header {
        padding: 0.3vh 0.6vw;

        .map-info {
          width: 100%;
          gap: 0.3vw;

          .el-tag {
            font-size: clamp(10px, 0.7vw, 12px);
            padding: 0.2vh 0.4vw;
          }
        }

        .map-actions {
          flex-shrink: 0;
        }
      }
    }
  }
}

// 超小屏幕适配 (<1024px)
@media screen and (max-width: 1023px) {
  .seedling-dashboard {
    padding: 0.2vw;

    .main-content {
      gap: 3px;

      /* .system-title-container {
        grid-row: 1;
        max-height: 8vh;
      } */

      .system-stats-container {
        grid-row: 1;
        max-height: 12vh;
      }

      .left-sidebar-container {
        grid-row: 2;
        max-height: 25vh;
        min-height: 180px;
        gap: 3px;

        .base-info-container {
          flex: 2;
          min-height: 160px;
        }

        .quick-access-container {
          flex: 1;
          min-height: 140px;
        }
      }

      .map-container {
        grid-row: 3;
        grid-column: 1;
      }

      .sowing-period-container {
        display: none;
      }

      .map-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5vh;
        padding: 0.5vh;

        .map-info {
          width: 100%;
          gap: 0.2vw;
        }

        .map-actions {
          width: 100%;
        }
      }
    }
  }
}

// 高分辨率屏幕优化（高DPI）
@media screen and (-webkit-min-device-pixel-ratio: 2), screen and (min-resolution: 192dpi) {
  .seedling-dashboard {
    .main-content {
      .base-info-card,
      .quick-access-card,
      .map-card {
        box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.08);
      }
    }
  }
}

// 竖屏适配
@media screen and (orientation: portrait) {
  .seedling-dashboard {
    .main-content {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto 1fr;
      gap: 4px;

      /* .system-title-container {
        grid-row: 1;
        grid-column: 1;
        max-height: 8vh;
      } */

      .system-stats-container {
        grid-row: 1;
        grid-column: 1;
        max-height: 12vh;
      }

      .left-sidebar-container {
        grid-row: 2;
        grid-column: 1;
        flex-direction: row;
        gap: 4px;
        max-height: 25vh;
        min-height: 200px;

        .base-info-container {
          flex: 2;
          min-height: 180px;
        }

        .quick-access-container {
          flex: 1;
          min-height: 150px;
        }
      }

      .map-container {
        grid-row: 3;
        grid-column: 1;
      }

      .sowing-period-container {
        display: none;
      }
    }
  }
}
</style>
