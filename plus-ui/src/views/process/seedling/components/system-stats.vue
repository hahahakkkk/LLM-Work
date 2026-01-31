<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { fetchErAverageInfo } from '../emergenceate/api';

// 定义统计数据类型
interface StatisticItem {
  title: string;
  value: number | string;
  unit?: string;
  icon: any;
  color: string;
}

// 出苗率统计数据
interface EmergenceStats {
  averageEmergenceRate: number;
  abnormalPlots: number;
  todayNewDetections: number;
  emergencePassRate: number;
}

// 系统概述统计数据（针对出苗率模块）
const systemOverviewData = ref<StatisticItem[]>([
  {
    title: '平均出苗率',
    value: 0.0,
    unit: '%',
    icon: 'plant',
    color: '#059669'
  },
  {
    title: '出苗达标率',
    value: 0.0,
    unit: '%',
    icon: 'check-mark',
    color: '#40c9c6'
  },
  {
    title: '异常地块数',
    value: 0,
    unit: '块',
    icon: 'bug',
    color: '#f4516c'
  },
  {
    title: '今日新增检测地块数',
    value: 0,
    unit: '块',
    icon: 'monitor',
    color: '#36a3f7'
  }
]);

// 获取出苗率统计数据
const fetchEmergenceStats = async (): Promise<EmergenceStats> => {
  try {
    const res = await fetchErAverageInfo();
    const { avgEmergence, abnormalBlock, todayDetection, emergenceStandard } = res.data;
    return {
      averageEmergenceRate: avgEmergence,
      abnormalPlots: abnormalBlock,
      todayNewDetections: todayDetection,
      emergencePassRate: emergenceStandard
    };
  } catch (error) {
    console.error('获取出苗率统计数据失败:', error);
    return {
      averageEmergenceRate: 0,
      abnormalPlots: 0,
      todayNewDetections: 0,
      emergencePassRate: 0
    };
  }
};

// 更新统计数据
const updateStatisticsData = async () => {
  try {
    const stats = await fetchEmergenceStats();

    systemOverviewData.value[0].value = stats.averageEmergenceRate;
    systemOverviewData.value[1].value = stats.emergencePassRate;
    systemOverviewData.value[2].value = stats.abnormalPlots;
    systemOverviewData.value[3].value = stats.todayNewDetections;
  } catch (error) {
    console.error('更新统计数据失败:', error);
  }
};

// 初始化数据
const initializeData = async () => {
  await updateStatisticsData();
};

onMounted(async () => {
  await initializeData();
});

onActivated(async () => {
  await initializeData();
});

// 定义事件
const emit = defineEmits<{
  (e: 'abnormal-plots-click'): void;
}>();

// 点击异常地块卡片
const handleAbnormalPlotsClick = () => {
  emit('abnormal-plots-click');
};

// 暴露给父组件的方法
defineExpose({
  updateStatisticsData
});
</script>

<template>
  <div class="system-stats-container">
    <div class="stats-content">
      <div
        v-for="(item, index) in systemOverviewData"
        :key="index"
        class="statistic-item"
        :class="{ 'no-border': index === systemOverviewData.length - 1, 'clickable': index === 2 }"
        @click="index === 2 ? handleAbnormalPlotsClick() : null"
      >
        <div class="statistic-icon" :style="{ color: item.color }">
          <SvgIcon :icon-class="item.icon" class="icon" />
        </div>
        <div class="statistic-info">
          <div class="statistic-value">
            {{ item.value }}<span class="statistic-unit">{{ item.unit }}</span>
          </div>
          <div class="statistic-title">{{ item.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.system-stats-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;

  .stats-content {
    display: flex;
    height: 100%;
    padding: 10px 0;

    .statistic-item {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0 15px;
      border-right: 1px solid #eee;
      transition: all 0.3s ease;

      &.no-border {
        border-right: none;
      }

      &.clickable {
        cursor: pointer;

        &:hover {
          background-color: rgba(244, 81, 108, 0.1);
          transform: translateY(-2px);
        }
      }

      .statistic-icon {
        width: 30%;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        background-color: #f8f8f8;
        min-width: 40px;

        .icon {
          width: 40%;
          height: auto;
        }
      }

      .statistic-info {
        .statistic-value {
          font-size: clamp(16px, 2vw, 22px);
          font-weight: bold;
          color: #333;
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;

          .statistic-unit {
            font-size: clamp(12px, 1.5vw, 14px);
            color: #999;
            margin-left: 4px;
          }
        }

        .statistic-title {
          font-size: clamp(12px, 1.5vw, 13px);
          color: #999;
          margin-top: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .system-stats-container {
    .stats-content {
      flex-wrap: wrap;

      .statistic-item {
        flex: 0 0 50%;
        padding: 10px 15px;
        border-right: none;
        border-bottom: 1px solid #eee;

        &.no-border {
          border-bottom: none;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .system-stats-container {
    .stats-content {
      .statistic-item {
        flex: 0 0 100%;
        border-right: none;
        border-bottom: 1px solid #eee;

        &.no-border {
          border-bottom: none;
        }
      }
    }
  }
}

// 高分辨率屏幕优化
@media screen and (-webkit-min-device-pixel-ratio: 2), screen and (min-resolution: 192dpi) {
  .system-stats-container {
    box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.08);
  }
}
</style>
