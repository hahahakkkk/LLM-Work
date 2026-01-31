<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, markRaw } from 'vue';
import { Bell, Pouring, Monitor, DataAnalysis } from '@element-plus/icons-vue';
import { list } from '@/api/monitor/operlog';
import type { OperLogQuery } from '@/api/monitor/operlog/types';
import { getInfo } from '@/api/login';

// 定义 emits
const emit = defineEmits(['period-change']);
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

// 当前选中的生育期
const currentPeriod = ref('抽穗期');

// 生育期选项（按生长顺序排列）
const growthPeriods = [
  { value: '拔节期', label: '拔节期 >' },
  { value: '抽穗期', label: '抽穗期 >' },
  { value: '灌浆期', label: '灌浆期  ' }
];

// 处理生育期变化
const handlePeriodChange = (period: string) => {
  if (period !== currentPeriod.value) {
    currentPeriod.value = period;
    emit('period-change', period);
  }
};

// 更新时间的定时器
let timer: NodeJS.Timeout | null = null;

// 获取累计水肥推荐次数
const fetchFertilizerRecommendationCount = async () => {
  try {
    // 先获取用户信息
    const userInfo = await getInfo();
    const userName = userInfo.data?.user?.userName;

    // 构造参数对象，使用获取到的用户名进行筛选
    const params: OperLogQuery = {
      businessType: '1',
      pageNum: 1,
      pageSize: 1000000,
      title: '水肥诊断数据', // 对应水肥推荐模块
      operIp: '',
      operName: userName, // 使用从API获取的用户名
      status: '',
      orderByColumn: '',
      isAsc: ''
    } as any;

    const response: any = await list(params);
    // 更新累计水肥推荐次数
    systemOverviewData.value[1].value = response.total;
  } catch (error) {
    console.error('获取水肥推荐统计失败:', error);
  }
};

// 获取土壤墒情评估次数
const fetchSoilMoistureAssessmentCount = async () => {
  try {
    // 先获取用户信息
    const userInfo = await getInfo();
    const userName = userInfo.data?.user?.userName;

    // 构造参数对象，使用获取到的用户名进行筛选
    const params: OperLogQuery = {
      businessType: '',
      pageNum: 1,
      pageSize: 1000000,
      title: '土壤墒情监测数据', // 对应土壤墒情评估模块
      operIp: '',
      operName: userName, // 使用从API获取的用户名
      status: '',
      orderByColumn: '',
      isAsc: ''
    } as any;

    const response: any = await list(params);
    // 更新土壤墒情评估次数
    systemOverviewData.value[2].value = response.total;
  } catch (error) {
    console.error('获取土壤墒情评估统计失败:', error);
  }
};

// 获取预警信息处理次数
const fetchWarningProcessCount = async () => {
  try {
    // 先获取用户信息
    const userInfo = await getInfo();
    const userName = userInfo.data?.user?.userName;

    // 构造参数对象，使用获取到的用户名进行筛选
    const params: OperLogQuery = {
      businessType: '1',
      pageNum: 1,
      pageSize: 1000000,
      title: '水肥预警信息', // 对应预警信息处理模块
      operIp: '',
      operName: userName, // 使用从API获取的用户名
      status: '',
      orderByColumn: '',
      isAsc: ''
    } as any;

    const response: any = await list(params);
    // 更新预警信息处理次数
    systemOverviewData.value[3].value = response.total;
  } catch (error) {
    console.error('获取预警信息处理统计失败:', error);
  }
};

// 修改原有的 fetchGrowthWarningCount 函数名以更准确反映其功能
const fetchGrowthWarningCount = async () => {
  try {
    // 先获取用户信息
    const userInfo = await getInfo();
    const userName = userInfo.data?.user?.userName;

    // 构造参数对象，使用获取到的用户名进行筛选
    const params: OperLogQuery = {
      businessType: '1',
      pageNum: 1,
      pageSize: 1000000,
      title: '长势模型诊断结果',
      operIp: '',
      operName: userName, // 使用从API获取的用户名
      status: '',
      orderByColumn: '',
      isAsc: ''
    } as any;

    const response: any = await list(params);
    console.log('获取操作日志统计成功:', response);
    // 更新累计长势预警次数
    systemOverviewData.value[0].value = response.total;
  } catch (error) {
    console.error('获取操作日志统计失败:', error);
  }
};

// 修改 onMounted 中的调用
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

  // 调用所有数据获取函数
  fetchGrowthWarningCount();
  fetchFertilizerRecommendationCount();
  fetchSoilMoistureAssessmentCount();
  fetchWarningProcessCount();
});

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
  fetchGrowthWarningCount();
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
    title: '累计长势预警次数',
    value: 0,
    unit: '次',
    icon: markRaw(DataAnalysis),
    color: '#f78836'
  },
  {
    title: '累计水肥推荐次数',
    value: 0,
    unit: '次',
    icon: markRaw(Pouring),
    color: '#40c9c6'
  },
  {
    title: '土壤墒情评估次数',
    value: 0,
    unit: '次',
    icon: markRaw(Monitor),
    color: '#36a3f7'
  },
  {
    title: '预警信息处理次数',
    value: 0,
    unit: '次',
    icon: markRaw(Bell),
    color: '#f4516c'
  }
]);
</script>

<template>
  <div class="system-summary-container">
    <div class="summary-content">
      <!-- 左侧区域：系统概述和生育期选择（上下排列） -->
      <div class="left-section">
        <!-- 生育期选择 -->
        <div class="period-section">
          <el-steps :active="growthPeriods.findIndex((p) => p.value === currentPeriod)" simple finish-status="success" class="growth-steps">
            <el-step
              v-for="period in growthPeriods"
              :key="period.value"
              :title="period.label"
              class="period-step"
              @click="handlePeriodChange(period.value)"
            />
          </el-steps>
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
  width: auto;

  .summary-content {
    display: flex;
    height: 100%;

    .left-section {
      flex: 0 0 17.5%;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #eee;

      :deep(.el-steps--simple) {
        padding: 16px;
      }

      .period-section {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f9fa;

        .growth-steps {
          width: 100%;

          :deep(.el-step) {
            .el-step__head {
              display: none;
            }

            .el-step__arrow {
              display: none;
            }

            .el-step__title {
              font-size: 16px;
              padding: 0 4px;
              line-height: 1.2;
              white-space: nowrap;
              font-weight: normal;
            }

            &:hover {
              cursor: pointer;

              .el-step__title {
                color: #409eff;
              }
            }
          }
        }
      }
    }

    .summary-stats {
      flex: 1;
      display: flex;

      .statistic-item {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 0 8px;
        border-right: 1px solid #eee;
        font-size: 16px;
        font-weight: normal;

        &.no-border {
          border-right: none;
        }

        .statistic-icon {
          width: 60px;
          height: 90%;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 4px;
          background-color: #f8f8f8;

          .icon {
            width: 50%;
            height: auto;
          }
        }

        .statistic-info {
          .statistic-value {
            font-size: 16px;
            font-weight: normal;
            color: #333;
            display: flex;
            align-items: baseline;
            flex-wrap: wrap;

            .statistic-unit {
              font-size: 16px;
              color: #999;
              margin-left: 4px;
            }
          }

          .statistic-title {
            font-size: 14px;
            color: #999;
            margin-top: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: normal;
          }
        }
      }
    }
  }
}
</style>
