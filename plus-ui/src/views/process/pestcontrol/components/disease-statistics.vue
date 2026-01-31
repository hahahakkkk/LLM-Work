<template>
  <div class="disease-statistics-container">
    <div class="statistics-grid">
      <!-- 监测地块数 -->
      <div class="stat-card overall">
        <div class="stat-content">
          <div class="stat-value">{{ totalPlotCount }}</div>
          <div class="stat-label">监测地块数</div>
        </div>
      </div>

      <!-- 轻度病害 -->
      <div class="stat-card light">
        <div class="stat-content">
          <div class="stat-value">{{ lightDiseaseCount }}</div>
          <div class="stat-label">轻度病害</div>
        </div>
      </div>

      <!-- 中度病害 -->
      <div class="stat-card medium">
        <div class="stat-content">
          <div class="stat-value">{{ mediumDiseaseCount }}</div>
          <div class="stat-label">中度病害</div>
        </div>
      </div>

      <!-- 重度病害 -->
      <div class="stat-card heavy">
        <div class="stat-content">
          <div class="stat-value">{{ heavyDiseaseCount }}</div>
          <div class="stat-label">重度病害</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { baseDictQuery } from '@/views/process/growth/api/tableDict';
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo';

// 定义接口数据类型（根据实际API返回的数据结构）
interface ApiDetectionData {
  leval: number; // 1: 轻度, 2: 中度, 3: 重度
  incidenceRate: number; // 病害发生率
  [key: string]: any;
}

// 接收父组件传递的API数据
const props = defineProps<{
  apiData?: ApiDetectionData[];
}>();

// 统计数据
const lightDiseaseCount = ref(0);
const mediumDiseaseCount = ref(0);
const heavyDiseaseCount = ref(0);
const totalPlotCount = ref(0);

// 当前用户的基地ID
const currentBaseId = ref<string>('');

// 从基地字典接口获取当前用户的基地ID
const initUserBase = async () => {
  try {
    const res = await baseDictQuery();
    if (res.rows && res.rows.length > 0) {
      currentBaseId.value = String(res.rows[0].value);
      console.log(`✅ 当前用户基地: ${res.rows[0].label}, ID: ${currentBaseId.value}`);
    }
  } catch (error) {
    console.error('❌ 获取基地信息失败:', error);
  }
};

// 获取当前基地的地块总数
const fetchTotalPlotCount = async () => {
  if (!currentBaseId.value) {
    console.warn('基地ID为空，无法获取地块总数');
    return;
  }

  try {
    const response = await fetchFarmerLands({ baseId: currentBaseId.value });
    const lands = (response as any).rows || response.data || response;
    totalPlotCount.value = lands.length;
    console.log(`✅ 当前基地地块总数: ${totalPlotCount.value}`);
  } catch (error) {
    console.error('❌ 获取地块总数失败:', error);
  }
};

// 根据level统计病害数量
const calculateStatistics = () => {
  if (!props.apiData || props.apiData.length === 0) {
    lightDiseaseCount.value = 0;
    mediumDiseaseCount.value = 0;
    heavyDiseaseCount.value = 0;
    return;
  }

  let light = 0;
  let medium = 0;
  let heavy = 0;

  props.apiData.forEach((record) => {
    // 统计各等级数量 (1: 轻度, 2: 中度, 3: 重度)
    switch (record.leval) {
      case 1:
        light++;
        break;
      case 2:
        medium++;
        break;
      case 3:
        heavy++;
        break;
    }
  });

  lightDiseaseCount.value = light;
  mediumDiseaseCount.value = medium;
  heavyDiseaseCount.value = heavy;
};

// 监听API数据变化
watch(
  () => props.apiData,
  () => {
    calculateStatistics();
  },
  { deep: true }
);

onMounted(async () => {
  // 先获取用户基地ID
  await initUserBase();
  // 再获取该基地的地块总数
  await fetchTotalPlotCount();
  // 最后计算病害统计
  calculateStatistics();
});
</script>

<style scoped lang="scss">
.disease-statistics-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  min-height: 0;
  overflow: hidden;

  // 调试：添加一个基于vh的边框来验证vh是否工作
  // border: clamp(1px, 0.2vh, 3px) solid rgba(255, 0, 0, 0.3);

  .statistics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: clamp(1px, 0.4vh, 6px);
    height: 100%;
    min-height: 0;

    .stat-card {
      background: var(--el-bg-color);
      border-radius: clamp(3px, 0.4vh, 6px);
      border: 1px solid var(--el-border-color-light);
      padding: clamp(3px, 0.8vh, 10px);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      min-height: 0;
      overflow: hidden;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .stat-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;

        .stat-value {
          font-size: clamp(12px, 3.5vmin, 28px);
          font-weight: 600;
          line-height: 1;
          margin-bottom: clamp(1px, 0.3vmin, 4px);
        }

        .stat-label {
          font-size: clamp(7px, 1.8vmin, 14px);
          color: var(--el-text-color-regular);
          line-height: 1.1;
        }
      }

      // 平均病害发生率样式
      &.overall {
        .stat-value {
          color: #667eea;
        }
      }

      // 轻度病害样式
      &.light {
        .stat-value {
          color: #52c41a;
        }
      }

      // 中度病害样式
      &.medium {
        .stat-value {
          color: #faad14;
        }
      }

      // 重度病害样式
      &.heavy {
        .stat-value {
          color: #ff4d4f;
        }
      }
    }
  }
}

// 仅在极小屏幕时改变布局方向
@media (max-width: 768px), (max-height: 600px) {
  .disease-statistics-container {
    .statistics-grid {
      .stat-card {
        flex-direction: column;
        text-align: center;

        .stat-content {
          .stat-label {
            word-break: break-all;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>
