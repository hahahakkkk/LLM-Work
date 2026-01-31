<script setup lang="ts">
import useUserStore from '@/store/modules/user';
import { computed, ref, onMounted, onBeforeUnmount, markRaw, watch } from 'vue';
import { Warning, List, PieChart, Timer } from '@element-plus/icons-vue';
import { useDisasterInsights } from '../hooks/useDisasterInsights';

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

// 更新时间的定时器
let timeTimer: NodeJS.Timeout | null = null;
onMounted(() => {
  timeTimer = setInterval(() => {
    currentTime.value = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, 1000);
});
onBeforeUnmount(() => {
  if (timeTimer) clearInterval(timeTimer);
  if (monitorTimer) clearInterval(monitorTimer);
});

// 总区域数
const TOTAL_REGION_COUNT = 9;

// 定义统计数据
const systemOverviewData = ref([
  {
    title: '累计发送预警',
    value: 0,
    unit: '条',
    icon: markRaw(Warning),
    color: '#f78836'
  },
  {
    title: '累计发送防护方案',
    value: 0,
    unit: '条',
    icon: markRaw(List),
    color: '#40c9c6'
  },
  {
    title: '当前受灾区域占比',
    value: 0,
    unit: '%',
    icon: markRaw(PieChart),
    color: '#36a3f7'
  },
  {
    title: '系统监测时长',
    value: 0,
    unit: '天',
    icon: markRaw(Timer),
    color: '#f4516c'
  }
]);

// 计算监测时长
const calcMonitorDays = () => {
  const start = new Date('2025-06-01');
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const { warnings, protections, loadAll } = useDisasterInsights();

let monitorTimer: NodeJS.Timeout | null = null;

const updateStatsFromState = () => {
  const warningList = warnings.value || [];
  const protectionList = protections.value || [];

  const warningCount = warningList.length;
  const protectionCount = protectionList.length;

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const recentList = warningList.filter((item) => {
    if (!item?.issueTime) return false;
    const time = new Date(item.issueTime);
    return !Number.isNaN(time.getTime()) && time >= threeDaysAgo;
  });
  const uniqueRegions = new Set(recentList.map((item) => item.region).filter(Boolean));
  const resolvedPercent = Math.min(100, Math.round((uniqueRegions.size / TOTAL_REGION_COUNT) * 100));

  const monitorDays = calcMonitorDays();

  systemOverviewData.value = [
    {
      title: '累计发送预警',
      value: warningCount,
      unit: '条',
      icon: markRaw(Warning),
      color: '#f78836'
    },
    {
      title: '累计发送防护方案',
      value: protectionCount,
      unit: '条',
      icon: markRaw(List),
      color: '#40c9c6'
    },
    {
      title: '当前受灾区域占比',
      value: resolvedPercent,
      unit: '%',
      icon: markRaw(PieChart),
      color: '#36a3f7'
    },
    {
      title: '系统监测时长',
      value: monitorDays,
      unit: '天',
      icon: markRaw(Timer),
      color: '#f4516c'
    }
  ];
};

onMounted(() => {
  loadAll();
  updateStatsFromState();
  if (monitorTimer) clearInterval(monitorTimer);
  monitorTimer = setInterval(
    () => {
      systemOverviewData.value[3].value = calcMonitorDays();
    },
    60 * 60 * 1000
  );
});

watch(
  () => [warnings.value, protections.value],
  () => updateStatsFromState(),
  { immediate: true }
);
</script>

<template>
  <div class="system-summary-container">
    <div class="summary-content">
      <!-- 左侧区域：系统概述和时间 -->
      <div class="left-section">
        <div class="summary-overview">
          <div class="overview-header">
            <div class="header-title">灾害预警系统概述</div>
          </div>
        </div>

        <!-- 当前时间展示 -->
        <div class="period-section">
          <div class="current-time-display">当前时间：{{ currentTime }}</div>
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
            <component :is="item.icon" class="icon" />
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
        flex: 0 0 auto;
        padding: 5px 20px;
        background-color: #f8f9fa;

        .overview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .header-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }
        }
      }

      .period-section {
        flex: 0 0 auto;
        padding: 10px;
        background-color: #f8f9fa;
        border-top: 1px solid #eee;
        display: flex;
        align-items: center;
        justify-content: center;

        .current-time-display {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          font-family: 'Courier New', monospace;
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
}
</style>
