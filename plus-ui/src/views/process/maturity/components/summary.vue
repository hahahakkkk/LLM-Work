<script setup lang="ts">
import useUserStore from '@/store/modules/user';
import { computed, ref, onMounted, onBeforeUnmount, markRaw } from 'vue';
import { Bell, Pouring, Monitor, DataAnalysis } from '@element-plus/icons-vue';
import { list } from '@/api/monitor/operlog';
import { getInfo } from '@/api/login';
// 获取用户信息
const userStore = useUserStore();
const nickName = computed(() => userStore.nickname);

// 获取种植预测次数
const fetchPlantingPredictionCount = async () => {
  try {
    // 先获取用户信息
    const userInfo = await getInfo();
    const userName = userInfo.data?.user?.userName;

    // 构造参数对象，使用获取到的用户名进行筛选
    const params: OperLogQuery = {
      businessType: '1',
      pageNum: 1,
      pageSize: 1000000,
      title: '种植预测', // 对应种植预测模块
      operIp: '',
      operName: userName, // 使用从API获取的用户名
      status: '',
      orderByColumn: '',
      isAsc: ''
    } as any;

    const response: any = await list(params);
    // 更新累计种植预测次数
    systemOverviewData.value[0].value = response.total;
  } catch (error) {
    console.error('获取种植预测统计失败:', error);
  }
};

// 获取谷子成熟度预警信息次数
const fetchMaturityWarningCount = async () => {
  try {
    // 先获取用户信息
    const userInfo = await getInfo();
    const userName = userInfo.data?.user?.userName;

    // 构造参数对象，使用获取到的用户名进行筛选
    const params: OperLogQuery = {
      businessType: '1',
      pageNum: 1,
      pageSize: 1000000,
      title: '谷子成熟预警信息记录', // 对应成熟度预警模块
      operIp: '',
      operName: userName, // 使用从API获取的用户名
      status: '',
      orderByColumn: '',
      isAsc: ''
    } as any;

    const response: any = await list(params);
    // 更新累计成熟度预警信息次数
    systemOverviewData.value[1].value = response.total;
  } catch (error) {
    console.error('获取成熟度预警统计失败:', error);
  }
};

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
let timer: NodeJS.Timeout | null = null;

// 开始定时更新时间
onMounted(() => {
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

  // 调用新的数据获取函数
  fetchPlantingPredictionCount();
  fetchMaturityWarningCount();
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

// 系统概述统计数据
const systemOverviewData = ref<StatisticItem[]>([
  {
    title: '成熟度预警次数',
    value: 0,
    unit: '次',
    icon: markRaw(DataAnalysis),
    color: '#f78836'
  },
  {
    title: '累计采收推荐次数',
    value: 0,
    unit: '次',
    icon: markRaw(Pouring),
    color: '#40c9c6'
  }
]);
</script>

<template>
  <div class="system-summary-container">
    <div class="summary-content">
      <!-- 左侧区域：系统概述和时间 -->
      <!--      <div class="left-section">-->
      <!--        &lt;!&ndash; 系统概述和时间（左右排列） &ndash;&gt;-->
      <!--        <div class="summary-overview">-->
      <!--          <div class="overview-header">-->
      <!--            <div class="system-title">系统概述</div>-->
      <!--            <div class="current-time">{{ currentTime }}</div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->

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
  border-radius: 0.8vh;
  box-shadow: 0 0.2vh 1.2vh 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  width: auto;

  .summary-content {
    display: flex;
    height: 100%;

    .left-section {
      flex: 0 0 20%;
      display: flex;
      flex-direction: column;
      border-right: 0.1vh solid #eee;

      .summary-overview {
        padding: 0.5vh 1vh 0.5vh 1vh;
        background-color: #f8f9fa;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .overview-header {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;

          .system-title {
            font-size: 14px;
            color: #333;
            margin-bottom: 1vh;
          }

          .current-time {
            font-size: 12px;
            color: #666;
            font-family: 'Courier New', monospace;
            white-space: nowrap;
          }
        }
      }
    }

    .summary-stats {
      flex: 1;
      display: flex;
      flex-direction: column;

      .statistic-item {
        flex: 1;
        display: flex;
        align-items: center;
        // padding: 0.5vh 0;
        border-bottom: 0.1vh solid #eee;

        &.no-border {
          border-bottom: none;
        }

        .statistic-icon {
          width: 30%;
          height: 90%;
          border-radius: 0.8vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.5vh;
          background-color: #f8f8f8;

          .icon {
            width: 35%;
            height: auto;
          }
        }

        .statistic-info {
          .statistic-value {
            font-size: 14px;
            color: #333;
            display: flex;
            align-items: baseline;
            flex-wrap: wrap;

            .statistic-unit {
              font-size: 12px;
              color: #999;
              margin-left: 0.4vh;
            }
          }

          .statistic-title {
            font-size: 12px;
            color: #999;
            margin-top: 0.6vh;
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
