<script setup lang="ts">
import QuickAccess from './components/quick-access.vue';
import BaseDetails from './components/base-details.vue';
import PestMonitoring from './components/pest-monitoring.vue';
import PestControlMap from './components/pest-control-map.vue';
import WarningAlerts from './components/warning-alerts.vue';
import PestDiseaseDisplay from './components/pest-disease-display.vue';
import { ref, nextTick, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Refresh } from '@element-plus/icons-vue';
import { getDeskINfo, getMultipleDiseaseRecords, getSuHuiMingDetectionRecords } from '@/views/process/api/pestcontrol/areaDetection';
import { baseDictQuery } from '@/views/process/growth/api/tableDict';

// 定义地块数据类型
interface PlotData {
  plotId: string;
  plotCode: string;
  pestIndex: number;
  diseaseIndex: number;
  status: string;
}

// 定义病虫害信息类型
interface PestDiseaseInfo {
  name: string;
  level: 'light' | 'medium' | 'heavy';
  image?: string;
  description?: string;
}

const mapRef = ref(null);
const router = useRouter();

// 详情对话框相关
const detailInfoVisible = ref(false);
const selectedDetectionData = ref<any>({});

// 当前基地信息
const currentBaseId = ref<string | undefined>(undefined);
const baseDict = ref<any[]>([]);
const selectedPlot = ref('');
const selectedPlotId = ref('');
const selectedPlotInfo = ref(null);

// 地图监测类型和生育期选择
const selectedMonitorType = ref('卫星监测'); // 卫星监测、出苗期、拔节期、抽穗期
const selectedSubType = ref(''); // 拔节期的二级选项：白发病、粟灰螟

// 出苗期病害数据
const seedlingDiseaseData = ref<any[]>([]);

// 粟灰螟检测数据
const suHuiMingData = ref<any[]>([]);

// 病害率数据（最终结果）
const diseaseRateData = ref<any[]>([]);

// 基地ID到NAME的映射表
const baseIdToNameMap = ref<Map<string, string>>(new Map());

// 当前基地的准确名称（从GeoJSON映射表获取）
const currentBaseName = ref<string>('');

/** 获取基地名称标签 */
const getBaseNameLabel = (baseValue: string | undefined) => {
  if (!baseValue) return '';
  const baseOption = baseDict.value.find((option) => option.value === baseValue);
  return baseOption ? baseOption.label : baseValue;
};

// 计算当前选中的基地名称（兼容旧逻辑，作为兜底）
const selectedBase = computed(() => {
  let baseName = getBaseNameLabel(currentBaseId.value);

  // 去除末尾的“基地”两个字
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

// 地块数据 - 模拟从地图获取
const plotsData = ref<PlotData[]>([]);

// API检测数据 - 用于病害统计
const apiDetectionData = ref<any[]>([]);

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

// 获取地块数据 - 模拟从地图组件获取
const fetchPlotsData = async () => {
  try {
    // 模拟地块数据，实际应该从地图组件或API获取
    const mockData: PlotData[] = [
      { plotId: '004', plotCode: '004', pestIndex: 85, diseaseIndex: 45, status: 'monitored' },
      { plotId: '007', plotCode: '007', pestIndex: 35, diseaseIndex: 80, status: 'monitored' },
      { plotId: '009', plotCode: '009', pestIndex: 25, diseaseIndex: 55, status: 'monitored' },
      { plotId: '012', plotCode: '012', pestIndex: 65, diseaseIndex: 30, status: 'monitored' },
      { plotId: '015', plotCode: '015', pestIndex: 40, diseaseIndex: 75, status: 'monitored' },
      { plotId: '018', plotCode: '018', pestIndex: 92, diseaseIndex: 35, status: 'monitored' },
      { plotId: '021', plotCode: '021', pestIndex: 20, diseaseIndex: 40, status: 'monitored' },
      { plotId: '001', plotCode: '001', pestIndex: 45, diseaseIndex: 78, status: 'monitored' }
    ];

    plotsData.value = mockData;
  } catch (error) {
    // 获取失败，静默处理
  }
};

// 获取API检测数据 - 用于病害统计
const fetchApiDetectionData = async () => {
  try {
    // 调用病虫害检测API
    const response = await getDeskINfo();
    const data = response.data || [];

    // 直接使用API返回的数据，不需要转换
    apiDetectionData.value = data;
  } catch (error) {
    // 使用模拟数据作为fallback
    apiDetectionData.value = [
      { leval: 1, incidenceRate: 25.5 },
      { leval: 2, incidenceRate: 45.8 },
      { leval: 3, incidenceRate: 78.2 },
      { leval: 1, incidenceRate: 32.1 },
      { leval: 2, incidenceRate: 56.7 }
    ];
  }
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

// 在下一次DOM更新后，通知地图组件更新尺寸
const handleMapLoaded = () => {
  nextTick(() => {
    // 使用 requestAnimationFrame 确保在下一帧渲染时更新地图尺寸
    window.requestAnimationFrame(() => {
      if (mapRef.value && mapRef.value.mapRef && mapRef.value.mapRef.value) {
        const olMap = mapRef.value.mapRef.value.getMap();
        if (olMap && typeof olMap.updateSize === 'function') {
          olMap.updateSize();
        }
      }
    });

    // 再次延迟更新，确保完全稳定
    setTimeout(() => {
      window.requestAnimationFrame(() => {
        if (mapRef.value && mapRef.value.mapRef && mapRef.value.mapRef.value) {
          const olMap = mapRef.value.mapRef.value.getMap();
          if (olMap && typeof olMap.updateSize === 'function') {
            olMap.updateSize();
          }
        }
      });
    }, 1000);

    // 地图加载完成后，如果已有基地ID和映射表，立即定位
    if (currentBaseId.value && baseIdToNameMap.value.size > 0) {
      setTimeout(() => {
        locateMapToBase();
      }, 300);
    }
  });
};

// 处理基地选择事件
const handleBaseSelected = (baseName: string) => {
  if (mapRef.value && typeof mapRef.value.handleBaseSelection === 'function') {
    mapRef.value.handleBaseSelection(baseName);
  }
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

    // 可选：尝试从病虫害数据中验证基地信息
    try {
      const response = await getDeskINfo();
      const apiData = response.data || [];

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

// 处理地图详情显示事件
const handleShowDetail = (detailData: any) => {
  selectedDetectionData.value = detailData.detectionData;
  detailInfoVisible.value = true;
};

// 处理预警列表中地块点击事件
const handlePlotClick = (plotId: string) => {
  // 这里可以与地图联动，高亮显示对应地块
  selectedPlot.value = plotId;
  selectedPlotId.value = plotId;

  // 通知地图组件高亮显示该地块
  if (mapRef.value && typeof mapRef.value.highlightPlot === 'function') {
    mapRef.value.highlightPlot(plotId);
  }
};

// 处理病虫害检测完成事件
const handleDetectionComplete = (detectionResult: any) => {
  // 刷新地块数据，模拟检测后数据更新
  fetchPlotsData();
};

// 加载出苗期病害数据
const loadSeedlingDiseaseData = async () => {
  try {
    console.log('开始加载出苗期病害数据...');
    const response = await getMultipleDiseaseRecords();
    if (response && response.data) {
      seedlingDiseaseData.value = response.data;
      console.log('出苗期病害数据加载成功:', seedlingDiseaseData.value);
    } else {
      seedlingDiseaseData.value = [];
      console.warn('出苗期病害数据为空');
    }
  } catch (error) {
    console.error('加载出苗期病害数据失败:', error);
    seedlingDiseaseData.value = [];
  }
};

// 加载粟灰螟检测数据
const loadSuHuiMingData = async () => {
  try {
    console.log('开始加载粟灰螟检测数据...');
    const response = await getSuHuiMingDetectionRecords();
    if (response && response.data) {
      suHuiMingData.value = response.data;
      console.log('粟灰螟检测数据加载成功:', suHuiMingData.value);
    } else {
      suHuiMingData.value = [];
      console.warn('粟灰螟检测数据为空');
    }
  } catch (error) {
    console.error('加载粟灰螟检测数据失败:', error);
    suHuiMingData.value = [];
  }
};

// 选择监测类型
const selectMonitorType = async (type: string) => {
  selectedMonitorType.value = type;
  selectedSubType.value = ''; // 重置二级选项
  console.log('选择监测类型:', type);

  // 如果选择出苗期，加载出苗期病害数据
  if (type === '出苗期') {
    await loadSeedlingDiseaseData();
    // 等待数据传递到子组件后，触发地图刷新
    await nextTick();
  }
};

// 选择二级类型（拔节期的子选项）
const selectSubType = async (subType: string) => {
  selectedMonitorType.value = '拔节期'; // 确保主类型为拔节期
  selectedSubType.value = subType;
  console.log('选择拔节期子类型:', subType);

  // 如果选择粟灰螟，加载粟灰螟检测数据
  if (subType === '粟灰螟') {
    await loadSuHuiMingData();
    // 等待数据传递到子组件后，触发地图刷新
    await nextTick();
  }
};

// 选择卫星监测二级类型
const selectSatelliteSubType = async (subType: string) => {
  selectedMonitorType.value = '卫星监测'; // 确保主类型为卫星监测
  selectedSubType.value = subType;
  console.log('选择卫星监测子类型:', subType);

  // 如果选择最终结果，加载病害率数据
  if (subType === '最终结果') {
    await loadDiseaseRateData();
    await nextTick();
  }
};

// 加载病害率数据（从land_disease_rate.json）
const loadDiseaseRateData = async () => {
  try {
    console.log('开始加载病害率数据...');
    const response = await fetch('/map-json/land_disease_rate.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    diseaseRateData.value = data;
    console.log('病害率数据加载成功:', diseaseRateData.value);
  } catch (error) {
    console.error('加载病害率数据失败:', error);
    diseaseRateData.value = [];
  }
};

onMounted(async () => {
  // 1. 先加载基地映射表（从 GeoJSON）
  await loadBaseMapping();

  // 2. 获取基地字典
  await getDicts();

  // 3. 从基地字典中获取当前基地ID
  await fetchCurrentBaseId();

  // 4. 获取地块数据
  fetchPlotsData();

  // 5. 获取API检测数据
  fetchApiDetectionData();
});
</script>

<template>
  <div class="pestcontrol-dashboard">
    <div class="main-content">
      <!-- 左上：病虫害展示（第一行） -->
      <div class="pest-disease-display-container">
        <el-card class="pest-disease-display-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">病虫害展示</span>
            </div>
          </template>
          <div class="card-content">
            <PestDiseaseDisplay />
          </div>
        </el-card>
      </div>

      <!-- 左下：快捷操作（第二行） -->
      <div class="environment-factors-container">
        <el-card class="quick-access-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box', padding: '0' }">
          <div class="card-content">
            <QuickAccess />
          </div>
        </el-card>
      </div>

      <!-- 中间：地图组件（占满中间区域） -->
      <div class="map-container">
        <el-card class="map-card" shadow="hover">
          <template #header>
            <div class="map-header">
              <div class="map-info">
                <el-tag v-if="selectedPlot" type="success" size="large">地块：{{ selectedPlot }}</el-tag>
                <el-tag v-else type="info" size="large">地块：请点击具体地块</el-tag>
              </div>
              <!-- 监测类型选择按钮 -->
              <div class="monitor-type-buttons">
                <div class="buttons-grid">
                  <!-- 卫星监测（带二级按钮） -->
                  <div class="button-wrapper">
                    <el-button :type="selectedMonitorType === '卫星监测' ? 'primary' : 'default'" size="small" @click="selectMonitorType('卫星监测')">
                      卫星监测
                    </el-button>
                    <!-- 卫星监测二级按钮 -->
                    <div class="sub-buttons">
                      <el-button type="warning" size="small" @click="selectSatelliteSubType('中间过程')"> 中间过程 </el-button>
                      <el-button type="warning" size="small" @click="selectSatelliteSubType('最终结果')"> 最终结果 </el-button>
                    </div>
                  </div>

                  <!-- 出苗期 -->
                  <el-button :type="selectedMonitorType === '出苗期' ? 'primary' : 'default'" size="small" @click="selectMonitorType('出苗期')">
                    出苗期
                  </el-button>

                  <!-- 拔节期（带二级按钮） -->
                  <div class="button-wrapper">
                    <el-button :type="selectedMonitorType === '拔节期' ? 'primary' : 'default'" size="small" @click="selectMonitorType('拔节期')">
                      拔节期
                    </el-button>
                    <!-- 拔节期二级按钮 -->
                    <div class="sub-buttons">
                      <el-button type="warning" size="small" @click="selectSubType('白发病')"> 白发病 </el-button>
                      <el-button type="warning" size="small" @click="selectSubType('粟灰螟')"> 粟灰螟 </el-button>
                    </div>
                  </div>

                  <!-- 抽穗期 -->
                  <el-button :type="selectedMonitorType === '抽穗期' ? 'primary' : 'default'" size="small" @click="selectMonitorType('抽穗期')">
                    抽穗期
                  </el-button>
                </div>
              </div>
            </div>
          </template>
          <div class="card-content">
            <!-- 地图组件 -->
            <PestControlMap
              ref="mapRef"
              :initial-base-name="currentBaseName || selectedBase"
              :monitor-type="selectedMonitorType"
              :sub-type="selectedSubType"
              :seedling-disease-data="seedlingDiseaseData"
              :su-hui-ming-data="suHuiMingData"
              :disease-rate-data="diseaseRateData"
              @map-loaded="handleMapLoaded"
              @feature-click="handlePlotSelected"
              @show-detail="handleShowDetail"
              @detection-complete="handleDetectionComplete"
            />
          </div>
        </el-card>
      </div>

      <!-- 右侧容器 -->
      <div class="right-side-container">
        <!-- 预警区域（占满整个右侧） -->
        <div class="warning-alerts-container">
          <el-card class="warning-alerts-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="header-title">预警列表</span>
              </div>
            </template>
            <div class="card-content">
              <WarningAlerts
                :base-name="selectedBase"
                :monitor-type="selectedMonitorType"
                :sub-type="selectedSubType"
                :seedling-disease-data="seedlingDiseaseData"
                :su-hui-ming-data="suHuiMingData"
                @plot-click="handlePlotClick"
              />
            </div>
          </el-card>
        </div>

        <!-- 虫情信息监测 - 暂时注释 -->
        <!-- <div class="pest-monitoring-container">
          <el-card class="pest-monitoring-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="header-title">虫情信息监测</span>
              </div>
            </template>
            <div class="card-content">
              <PestMonitoring :selected-base="selectedBase" />
            </div>
          </el-card>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pestcontrol-dashboard {
  padding: 0;
  background-color: var(--el-bg-color-page);
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;

  .main-content {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(280px, 1.2fr) minmax(400px, 2.8fr) minmax(250px, 1fr);
    grid-template-rows: 1.5fr 0.5fr;
    gap: 6px;
    height: 100%;
    min-height: 0;
    padding: 6px;

    /* 左上：病虫害展示（第一行） */
    .pest-disease-display-container {
      grid-row: 1;
      grid-column: 1;
      min-height: 0;
      overflow: hidden;
    }

    /* 左下：环境因素展示（第二行） */
    .environment-factors-container {
      grid-row: 2;
      grid-column: 1;
      min-height: 0;
      overflow: hidden;
    }

    /* 中间：地图组件（占据两行） */
    .map-container {
      grid-row: 1 / span 2;
      grid-column: 2;
      min-height: 0;
      overflow: hidden;
    }

    /* 右侧容器 */
    .right-side-container {
      grid-row: 1 / span 2;
      grid-column: 3;
      display: flex;
      flex-direction: column;
      min-height: 0;

      .warning-alerts-container {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
    }

    /* 地图标题栏样式 */
    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: clamp(6px, 0.8vw, 10px) clamp(10px, 1vw, 15px);
      background-color: var(--el-fill-color-lighter);
      border-bottom: 1px solid var(--el-border-color-light);
      flex-wrap: wrap;
      gap: 8px;

      .map-info {
        display: flex;
        align-items: center;
        gap: clamp(6px, 0.8vw, 10px);
        flex-wrap: wrap;

        :deep(.el-tag) {
          font-size: clamp(12px, 0.9vw, 14px);
          padding: clamp(4px, 0.5vw, 6px) clamp(8px, 0.8vw, 12px);
        }
      }

      // 监测类型按钮区域
      .monitor-type-buttons {
        display: flex;
        justify-content: flex-end;

        .buttons-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          width: auto;

          .button-wrapper {
            position: relative;
            min-width: 0;

            :deep(.el-button) {
              width: 100%;
              height: 32px;
              border-radius: 6px;
              transition: all 0.3s ease;
              font-size: 13px;
            }

            .sub-buttons {
              position: absolute;
              top: calc(100% + 4px);
              left: 0;
              right: 0;
              z-index: 100;
              background: transparent;
              display: none;
              flex-direction: column;
              gap: 4px;
              padding: 0;
              margin: 0;

              // 保持悬浮状态的关键：添加连接区域
              &::before {
                content: '';
                position: absolute;
                top: -8px;
                left: 0;
                right: 0;
                height: 8px;
                background: transparent;
              }

              :deep(.el-button) {
                width: 100% !important;
                height: 28px;
                font-size: 12px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                margin: 0 !important;
                padding: 0 12px !important;
              }
            }

            // 当悬浮在wrapper上时，显示sub-buttons并添加动画
            &:hover .sub-buttons {
              display: flex;
              animation: slideDown 0.2s ease;
            }

            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-8px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          }

          > :deep(.el-button) {
            min-width: 0;
            height: 32px;
            border-radius: 6px;
            transition: all 0.3s ease;
            font-size: 13px;
          }
        }
      }
    }

    /* 卡片头部样式 */
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: clamp(6px, 0.8vw, 8px);
      flex-wrap: wrap;

      .header-icon {
        color: var(--el-color-primary);
        font-size: clamp(14px, 1vw, 16px);
      }

      .header-title {
        font-weight: 600;
        color: var(--el-text-color-primary);
        flex: 1;
        font-size: clamp(13px, 1vw, 15px);
        white-space: nowrap;
      }

      :deep(.el-button) {
        font-size: clamp(12px, 0.9vw, 14px);
        padding: clamp(5px, 0.5vw, 7px) clamp(10px, 0.9vw, 12px);
      }
    }

    /* 所有容器的通用样式 */
    .environment-factors-container,
    .base-details-container,
    .pest-monitoring-container,
    .map-container,
    .warning-alerts-container,
    .pest-disease-display-container,
    .disease-statistics-container {
      min-height: 0;
      overflow: hidden;

      .environment-factors-card,
      .quick-access-card,
      .base-details-card,
      .pest-monitoring-card,
      .map-card,
      .warning-alerts-card,
      .pest-disease-display-card,
      .disease-statistics-card {
        height: 100%;
        border-radius: clamp(4px, 0.6vw, 8px);
        border: none;
        box-shadow: var(--el-box-shadow-light);
        display: flex;
        flex-direction: column;
        overflow: hidden;

        :deep(.el-card__header) {
          padding: clamp(6px, 0.8vw, 10px);
          border-bottom: 1px solid var(--el-border-color-light);
        }

        :deep(.el-card__body) {
          padding: clamp(6px, 0.8vw, 10px);
          height: 100%;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;

          :deep(.environment-factors-container),
          :deep(.base-details-container),
          :deep(.pest-monitoring-container),
          :deep(.map-wrapper),
          :deep(.warning-alerts-container),
          :deep(.pest-disease-display-container),
          :deep(.disease-statistics-container) {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            max-height: 100%;
            overflow: hidden;
          }

          :deep(.environment-factors-content),
          :deep(.base-details-content),
          :deep(.pest-monitoring-content),
          :deep(.warning-alerts-content),
          :deep(.pest-disease-display-content),
          :deep(.disease-statistics-content) {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            max-height: 100%;
            overflow-y: auto;
            overflow-x: hidden;

            // 自定义滚动条样式
            &::-webkit-scrollbar {
              width: 6px;
            }

            &::-webkit-scrollbar-thumb {
              background-color: var(--el-border-color);
              border-radius: 3px;

              &:hover {
                background-color: var(--el-border-color-dark);
              }
            }

            &::-webkit-scrollbar-track {
              background-color: var(--el-fill-color-lighter);
            }

            scrollbar-width: thin;
            scrollbar-color: var(--el-border-color) var(--el-fill-color-lighter);
          }
        }
      }
    }

    /* 快捷操作卡片特殊处理 */
    .quick-access-card {
      height: 100%;

      .card-content {
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;

        /* 自定义滚动条样式 */
        &::-webkit-scrollbar {
          width: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background-color: var(--el-border-color);
          border-radius: 2px;

          &:hover {
            background-color: var(--el-border-color-dark);
          }
        }

        &::-webkit-scrollbar-track {
          background-color: transparent;
        }

        scrollbar-width: thin;
        scrollbar-color: var(--el-border-color) transparent;
      }
    }
  }
}

/* 超大屏幕优化（1920px 及以上） */
@media (min-width: 1920px) {
  .pestcontrol-dashboard {
    height: calc(100vh - 60px);
  }

  .pestcontrol-dashboard .main-content {
    grid-template-columns: minmax(320px, 1.3fr) minmax(600px, 2.6fr) minmax(280px, 1.1fr);
    grid-template-rows: 1.5fr 0.5fr;
    gap: 6px;
    padding: 8px;
  }
}

/* 大屏幕优化（1600px - 1919px） */
@media (min-width: 1600px) and (max-width: 1919px) {
  .pestcontrol-dashboard {
    height: calc(100vh - 60px);
  }

  .pestcontrol-dashboard .main-content {
    grid-template-columns: minmax(300px, 1.25fr) minmax(500px, 2.7fr) minmax(260px, 1.05fr);
    grid-template-rows: 1.5fr 0.5fr;
    gap: 6px;
    padding: 6px;
  }
}

/* 中等屏幕优化（1366px - 1599px） */
@media (min-width: 1366px) and (max-width: 1599px) {
  .pestcontrol-dashboard {
    height: calc(100vh - 60px);
  }

  .pestcontrol-dashboard .main-content {
    grid-template-columns: minmax(260px, 1.15fr) minmax(450px, 2.85fr) minmax(240px, 1fr);
    grid-template-rows: 1.5fr 0.5fr;
    gap: 6px;
    padding: 6px;
  }
}

/* 小屏幕优化（1200px - 1365px） */
@media (min-width: 1200px) and (max-width: 1365px) {
  .pestcontrol-dashboard {
    height: calc(100vh - 60px);
  }

  .pestcontrol-dashboard .main-content {
    grid-template-columns: minmax(240px, 1.1fr) minmax(400px, 2.7fr) minmax(240px, 1.2fr);
    grid-template-rows: 1.5fr 0.5fr;
    gap: 6px;
    padding: 6px;
  }
}

/* 平板横屏布局（1024px - 1199px） */
@media (min-width: 1024px) and (max-width: 1199px) {
  .pestcontrol-dashboard {
    height: calc(100vh - 60px);
  }

  .pestcontrol-dashboard .main-content {
    grid-template-columns: 1fr 2fr;
    grid-template-rows: 2.5fr auto auto;
    gap: 6px;
    padding: 6px;
    height: 100%;
    max-height: none;

    .pest-disease-display-container {
      grid-row: 1;
      grid-column: 1;
      min-height: 300px;
    }

    .environment-factors-container {
      grid-row: 2;
      grid-column: 1;
      min-height: 200px;
    }

    .map-container {
      grid-row: 1 / span 2;
      grid-column: 2;
      min-height: 500px;
    }

    .right-side-container {
      grid-row: 3;
      grid-column: 1 / span 2;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
      gap: 6px;

      .disease-statistics-container {
        grid-row: 1;
        grid-column: 1;
        min-height: 300px;
      }

      .warning-alerts-container {
        grid-row: 1;
        grid-column: 2;
        min-height: 300px;
      }

      .pest-monitoring-container {
        display: none; /* 在这个布局中隐藏 */
      }
    }
  }
}

/* 平板竖屏布局（768px - 1023px） */
@media (min-width: 768px) and (max-width: 1023px) {
  .pestcontrol-dashboard {
    padding: 6px;
    height: auto;
  }

  .pestcontrol-dashboard .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: 2.5fr repeat(4, auto);
    gap: 6px;
    height: auto;
    max-height: none;

    .pest-disease-display-container {
      grid-row: 1;
      grid-column: 1;
      min-height: 280px;
    }

    .environment-factors-container {
      grid-row: 2;
      grid-column: 1;
      min-height: 200px;
    }

    .map-container {
      grid-row: 3;
      grid-column: 1;
      min-height: 450px;
    }

    .right-side-container {
      grid-row: 4 / span 2;
      grid-column: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .disease-statistics-container {
        min-height: 280px;
      }

      .warning-alerts-container {
        min-height: 280px;
      }

      .pest-monitoring-container {
        display: none; /* 在这个布局中隐藏 */
      }
    }
  }
}

/* 手机布局（小于 768px） */
@media (max-width: 767px) {
  .pestcontrol-dashboard {
    padding: 6px;
    height: auto;
  }

  .pestcontrol-dashboard .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: 2.5fr repeat(4, auto);
    gap: 4px;
    height: auto;
    max-height: none;

    .pest-disease-display-container {
      grid-row: 1;
      grid-column: 1;
      min-height: 250px;
    }

    .environment-factors-container {
      grid-row: 2;
      grid-column: 1;
      min-height: 180px;
    }

    .map-container {
      grid-row: 3;
      grid-column: 1;
      min-height: 400px;
    }

    .right-side-container {
      grid-row: 4 / span 2;
      grid-column: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .disease-statistics-container {
        min-height: 250px;
      }

      .warning-alerts-container {
        min-height: 250px;
      }

      .pest-monitoring-container {
        display: none; /* 在这个布局中隐藏 */
      }
    }

    .map-header {
      flex-direction: column;
      align-items: flex-start;

      .map-info {
        width: 100%;
      }
    }
  }
}
</style>
