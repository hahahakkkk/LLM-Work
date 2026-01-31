<script setup lang="ts">
import useUserStore from '@/store/modules/user';
import { computed, ref, onMounted, onActivated, onBeforeUnmount, markRaw } from 'vue';
import { TrendCharts, Warning, Monitor, SuccessFilled } from '@element-plus/icons-vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

// 定义 emits (暂时不需要发射任何事件)
// const emit = defineEmits(['period-change']);

// 获取用户信息
const userStore = useUserStore();
const nickName = computed(() => userStore.nickname);

// 当前时间
const currentTime = ref(
  new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
);

// 移除生育期相关的代码，因为这个功能已经删除

// 更新时间的定时器
let timer: NodeJS.Timeout | null = null;

// 初始化数据的通用方法
const initializeData = async () => {
  console.log('系统概述组件 - 初始化数据');
  // 加载统计数据
  await updateStatisticsData();

  // 确保定时器只有一个
  if (timer) {
    clearInterval(timer);
  }

  // 定时更新时间
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, 1000);
};

// 开始定时更新时间
onMounted(async () => {
  console.log('系统概述组件 - onMounted 执行');
  await initializeData();
});

// 添加 activated 钩子
onActivated(async () => {
  console.log('系统概述组件 - onActivated 执行');
  await initializeData();
});

// 清除定时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});

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
    value: 78.5,
    unit: '%',
    icon: 'plant',
    color: '#059669'
  },
  {
    title: '出苗达标率',
    value: 85.2,
    unit: '%',
    icon: 'check-mark',
    color: '#40c9c6'
  },
  {
    title: '异常地块数',
    value: 12,
    unit: '块',
    icon: 'bug',
    color: '#f4516c'
  },
  {
    title: '今日新增检测地块数',
    value: 5,
    unit: '块',
    icon: 'monitor',
    color: '#36a3f7'
  }
]);

// 获取出苗率统计数据
const fetchEmergenceStats = async (): Promise<EmergenceStats> => {
  try {
    // 这里应该调用实际的API接口
    // const response = await getEmergenceStatistics();

    // 目前使用模拟数据
    return {
      averageEmergenceRate: 78.5,
      abnormalPlots: 12,
      todayNewDetections: 5,
      emergencePassRate: 85.2
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
    systemOverviewData.value[1].value = stats.abnormalPlots;
    systemOverviewData.value[2].value = stats.todayNewDetections;
    systemOverviewData.value[3].value = stats.emergencePassRate;
  } catch (error) {
    console.error('更新统计数据失败:', error);
  }
};

// 暴露给父组件的方法
defineExpose({
  updateStatisticsData
});
</script>

<template>
  <div class="system-summary-container">
    <div class="summary-content">
      <!-- 左侧区域：系统概述和生育期选择（上下排列） -->
      <div class="left-section">
        <!-- 系统概述和时间（上下排列） -->
        <div class="summary-overview">
          <div class="overview-header">
            <div class="header-title">苗情监测与诊断系统</div>
            <div class="header-time">{{ currentTime }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧统计卡片 -->
      <div class="summary-stats">
        <div
          v-for="(item, index) in systemOverviewData"
          :key="index"
          class="statistic-item"
          :class="{ 'no-border': index === systemOverviewData.length - 1 }"
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
  </div>
</template>

<style scoped lang="scss">
.system-summary-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;

  .summary-content {
    display: flex;
    height: 100%;

    .left-section {
      flex: 0 0 20%;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #eee;

      .summary-overview {
        flex: 1;
        padding: 20px;
        background-color: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;

        .overview-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          text-align: center;

          .header-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
          }

          .header-time {
            font-size: 16px;
            color: #333;
            font-family: 'Courier New', monospace;
            font-weight: 600;
          }
        }
      }
    }

    .summary-stats {
      flex: 1;
      display: flex;
      padding: 10px 0;

      .statistic-item {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 0 15px;
        border-right: 1px solid #eee;

        &.no-border {
          border-right: none;
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
    .summary-content {
      flex-direction: column;

      .left-section {
        flex: 0 0 auto;
        flex-direction: row;
        border-right: none;
        border-bottom: 1px solid #eee;

        .summary-overview,
        .period-section {
          flex: 1;
          border-top: none;
          border-right: 1px solid #eee;
        }

        .summary-overview {
          padding: 12px 15px;

          .overview-header {
            .header-title {
              font-size: 14px;
            }

            .header-time {
              font-size: 11px;
            }
          }
        }
      }

      .summary-stats {
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
    .summary-content {
      .summary-stats {
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
}
</style>
