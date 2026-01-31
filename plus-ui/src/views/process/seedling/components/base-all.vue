<script setup lang="ts">
import { ref, onMounted, onActivated, computed } from 'vue';
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo';
import { baseDictQuery } from '@/views/process/growth/api/tableDict';
import { fetchErHistoryRecords } from '@/views/process/seedling/emergenceate/api';
import type { LandUnitVo } from '@/views/process/seedling/emergenceate/api/types';

// 定义props
const props = defineProps<{
  variety?: string; // 从播种期接口获取的品种
}>();

// 定义基地详情数据类型
interface BaseDetail {
  id: number;
  name: string;
  fullName: string;
  area: number;
  variety: string;
  growthStage: string;
  plotCount: number;
  detectionCoverage: number;
  operator: string;
  lastUpdateTime: string;
}

// 所有基地数据库
const allBasesData = ref<Record<string, BaseDetail>>({
  '侯家沟数字化种植基地': {
    id: 1,
    name: '侯家沟',
    fullName: '侯家沟数字化种植基地',
    area: 1000,
    variety: '米谷1号',
    growthStage: '出苗期',
    plotCount: 124,
    detectionCoverage: 41.7,
    operator: 'admin',
    lastUpdateTime: '2025-09-24 16:42:44'
  },
  '姜兴庄智慧引领种植基地': {
    id: 2,
    name: '姜兴庄',
    fullName: '姜兴庄智慧引领种植基地',
    area: 800,
    variety: '晋谷21号',
    growthStage: '出苗期',
    plotCount: 62,
    detectionCoverage: 85.2,
    operator: 'admin',
    lastUpdateTime: '2025-09-24 16:40:12'
  },
  '冯渠基地': {
    id: 3,
    name: '冯渠',
    fullName: '冯渠基地',
    area: 600,
    variety: '米谷1号',
    growthStage: '出苗期',
    plotCount: 48,
    detectionCoverage: 65.3,
    operator: 'admin',
    lastUpdateTime: '2025-09-24 16:35:28'
  }
});

// 根据用户权限获取当前基地信息
const getCurrentBase = (): BaseDetail => {
  // 这里可以根据用户的tenantId或其他标识来确定用户所属基地
  // 目前默认返回侯家沟基地，实际应用中可以根据用户信息来动态确定
  const userBaseName = '侯家沟数字化种植基地'; // 可以从用户store或API获取
  return allBasesData.value[userBaseName] || allBasesData.value['侯家沟数字化种植基地'];
};

// 当前基地信息
const currentBase = ref<BaseDetail>(getCurrentBase());

// 当前用户的基地ID
const currentBaseId = ref<string>('');

// 基地ID到面积的映射表
const baseAreaMap = ref<Map<string, number>>(new Map());

// 加载基地面积映射数据（从 mz-base-new.geojson）
const loadBaseAreaMapping = async () => {
  try {
    const response = await fetch('/map-json/mz-base-new.geojson');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const geojsonData = await response.json();

    // 构建 BASEID -> area 的映射表
    geojsonData.features.forEach((feature: any) => {
      const baseId = feature.properties.BASEID;
      const area = feature.properties.area;
      if (baseId && area) {
        baseAreaMap.value.set(baseId, area);
      }
    });
  } catch (error) {
    // 加载失败，静默处理
  }
};

// 从基地字典接口获取当前用户的基地ID
const initUserBase = async () => {
  try {
    // 调用基地字典接口，后端会根据用户权限返回对应的基地
    const res = await baseDictQuery();

    if (res.rows && res.rows.length > 0) {
      // 取第一个基地的value作为当前基地ID
      currentBaseId.value = String(res.rows[0].value);

      // 从映射表中获取基地面积
      if (baseAreaMap.value.size > 0) {
        const area = baseAreaMap.value.get(currentBaseId.value);
        if (area) {
          currentBase.value.area = area;
        }
      }
    }
  } catch (error) {
    // 获取失败，静默处理
  }
};

// 动态获取地块数量（根据当前用户的基地ID过滤）
const fetchPlotCount = async () => {
  if (!currentBaseId.value) {
    return;
  }

  try {
    // 使用当前用户的基地ID获取地块列表
    const response = await fetchFarmerLands({ baseId: currentBaseId.value });
    const lands = (response as any).rows || response.data || response;

    // 更新当前基地的地块数量
    currentBase.value.plotCount = lands.length;
  } catch (error) {
    // 如果获取失败，保持原有的硬编码值
  }
};

// 动态获取检测记录总数并计算检测完成率
const fetchDetectionStats = async () => {
  try {
    // 调用API获取检测记录统计数据
    const response = await fetchErHistoryRecords();
    const detectionTotal = response.total || 0;

    // 计算检测完成率：检测记录总数 / 地块总数 * 100
    if (currentBase.value.plotCount > 0) {
      const completionRate = Math.min((detectionTotal / currentBase.value.plotCount) * 100, 100);
      currentBase.value.detectionCoverage = Math.round(completionRate * 10) / 10; // 保留一位小数
    }
  } catch (error) {
    // 如果获取失败，保持原有的硬编码值
  }
};

// 发送事件到父组件
const emit = defineEmits<{
  (e: 'base-selected', name: string): void;
}>();

// 初始化基地选择的通用方法
const initializeBaseSelection = () => {
  setTimeout(() => {
    emit('base-selected', currentBase.value.fullName);
  }, 100);
};

// 在组件挂载时自动选择当前基地，延迟执行确保地图组件已经初始化
onMounted(async () => {
  initializeBaseSelection();
  await loadBaseAreaMapping(); // 先加载基地面积映射
  await initUserBase(); // 再获取用户基地ID并更新面积
  await fetchPlotCount(); // 获取该基地的地块数量
  await fetchDetectionStats(); // 最后获取检测统计并计算完成率
});

// 添加 activated 钩子
onActivated(async () => {
  initializeBaseSelection();
  await loadBaseAreaMapping(); // 先加载基地面积映射
  await initUserBase(); // 再获取用户基地ID并更新面积
  await fetchPlotCount(); // 获取最新的地块数量
  await fetchDetectionStats(); // 最后获取检测统计并计算完成率
});

// 计算属性：优先使用从播种期接口获取的品种，否则使用默认品种
const displayVariety = computed(() => {
  return props.variety || currentBase.value.variety;
});
</script>

<template>
  <div class="base-info-container">
    <div class="base-info-header">
      <h3 class="header-title">基地信息</h3>
    </div>

    <div class="base-info-content">
      <div class="info-row">
        <span class="info-label">基地面积(亩)：</span>
        <span class="info-value">{{ currentBase.area }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">作物品种：</span>
        <span class="info-value">{{ displayVariety }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">当前生育期：</span>
        <span class="info-value highlight">{{ currentBase.growthStage }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">地块数量(块)：</span>
        <span class="info-value">{{ currentBase.plotCount }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">检测完成率(%)：</span>
        <span class="info-value coverage-value">{{ currentBase.detectionCoverage }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-info-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5vh;
  justify-content: center;
  background-color: #fafbfc;

  .base-info-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 2vh;
    padding-bottom: 1.5vh;
    border-bottom: 0.1vh solid #e8e9ea;

    .header-title {
      margin: 0;
      font-size: 2vh;
      font-weight: bold;
      color: #333;
    }
  }

  .base-info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow-y: auto;

    /* 隐藏滚动条但保持滚动功能 */
    &::-webkit-scrollbar {
      display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;

    .info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2.5vh 0;
      border-bottom: 0.1vh solid #f5f7fa;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(64, 158, 255, 0.05);
        border-radius: 0.4vh;
        margin: 0 -0.8vh;
        padding: 2.5vh 0.8vh;
      }

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        font-size: 1.8vh;
        color: #666;
        font-weight: 500;
        min-width: 95px;
        flex-shrink: 0;
        text-align: left;
      }

      .info-value {
        font-size: 1.8vh;
        color: #333;
        font-weight: 500;
        text-align: right;
        flex: 1;

        &.highlight {
          color: #409eff;
          font-weight: normal;
        }

        &.coverage-value {
          color: #67c23a;
          font-weight: normal;
        }

        &.time-value {
          font-size: 12px;
          color: #999;
          font-weight: normal;
          font-family: 'Courier New', monospace;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .base-info-container {
    padding: 8px;

    .base-info-header {
      .header-title {
        font-size: 14px;
      }
    }

    .base-info-content {
      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        text-align: center;

        .info-label {
          min-width: auto;
          font-size: 12px;
          text-align: left;
        }

        .info-value {
          font-size: 12px;
          text-align: left;

          &.time-value {
            font-size: 10px;
          }
        }
      }
    }
  }
}
</style>
