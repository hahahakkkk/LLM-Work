<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { Calendar, ArrowLeft, ArrowRight, Warning, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getSowingInfo } from '../sowingInfo/api';
import type { SowingInfoData } from '../sowingInfo/api/types';

// 定义props
const props = defineProps<{
  selectedBase: string; // 基地名称（用于显示）
  baseId?: string; // 基地ID（用于接口调用）
}>();

// 定义 emits，向父组件发送品种信息
const emit = defineEmits<{
  (e: 'variety-loaded', variety: string): void;
}>();

// 接口数据类型定义
interface SowingTimeInfo {
  variety: string;
  predictStartDate: string;
  predictEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  lastUpdateTime: string;
}

// 加载状态
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');

// 接口数据缓存
const apiSowingData = ref<Record<string, SowingTimeInfo>>({});

// 品种信息（从接口获取）
const varietyName = ref('');

// 当前显示的年月（默认显示2025年5月，播种期数据所在月份）
const currentDate = ref(new Date(2025, 4, 1)); // 2025年5月

// 从接口获取播种期信息
const fetchSowingTimeInfo = async (baseId: string): Promise<SowingTimeInfo | null> => {
  try {
    // 调用真实的接口（使用 baseId 参数）
    const response: any = await getSowingInfo(baseId);

    if (response.code === 200 && response.data) {
      const data: SowingInfoData = response.data;

      // 将接口数据转换为组件需要的格式
      return {
        variety: data.variety,
        predictStartDate: data.sowingStartDate,
        predictEndDate: data.sowingEndDate,
        actualStartDate: data.sowingRealDate,
        actualEndDate: data.sowingRealDate,
        lastUpdateTime: new Date().toLocaleString('zh-CN')
      };
    }

    return null;
  } catch (error) {
    console.error('获取播种期信息失败:', error);
    throw error;
  }
};

// 加载播种期数据
const loadSowingTimeData = async () => {
  // 使用 baseId，如果没有则不加载
  const baseId = props.baseId;
  if (!baseId) {
    return;
  }

  isLoading.value = true;
  hasError.value = false;
  errorMessage.value = '';

  try {
    const data = await fetchSowingTimeInfo(baseId);
    if (data) {
      // 使用 baseId 作为缓存键
      apiSowingData.value[baseId] = data;
      // 更新品种名称
      varietyName.value = data.variety;
      // 向父组件发送品种信息
      emit('variety-loaded', data.variety);
    }
  } catch (error: any) {
    hasError.value = true;
    errorMessage.value = error.message || '获取播种期信息失败';
    ElMessage.error('获取播种期信息失败');
  } finally {
    isLoading.value = false;
  }
};

// 获取当前基地和品种的播种数据
const currentSowingInfo = computed(() => {
  // 使用 baseId
  const baseId = props.baseId;
  if (!baseId) {
    return null;
  }

  // 使用接口数据
  const apiData = apiSowingData.value[baseId];
  if (apiData) {
    return {
      predictedStart: apiData.predictStartDate,
      predictedEnd: apiData.predictEndDate,
      actualStart: apiData.actualStartDate,
      actualEnd: apiData.actualEndDate,
      lastUpdateTime: apiData.lastUpdateTime
    };
  }

  return null;
});

// 生成日历数据
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 获取当月第一天是星期几（0=周日，1=周一...）
  const firstDayOfWeek = firstDay.getDay();

  // 获取当月天数
  const daysInMonth = lastDay.getDate();

  const days = [];

  // 填充上个月的空白天数
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: '', isCurrentMonth: false, type: '' });
  }

  // 填充当月天数
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let type = '';
    let isPredicted = false;
    let isActual = false;

    if (currentSowingInfo.value) {
      const info = currentSowingInfo.value;

      // 检查是否在预测播种期内
      if (dateStr >= info.predictedStart && dateStr <= info.predictedEnd) {
        isPredicted = true;
        type = 'predicted';
      }

      // 检查是否在实际播种期内（优先级更高）
      if (dateStr >= info.actualStart && dateStr <= info.actualEnd) {
        isActual = true;
        type = 'actual';
      }
    }

    days.push({
      day: day,
      isCurrentMonth: true,
      type: type,
      isPredicted: isPredicted,
      isActual: isActual,
      date: dateStr
    });
  }

  return days;
});

// 上一个月
const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

// 下一个月
const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

// 格式化当前年月
const currentYearMonth = computed(() => {
  return `${currentDate.value.getFullYear()}年${currentDate.value.getMonth() + 1}月`;
});

// 监听 baseId 变化，重新加载数据
watch(
  () => props.baseId,
  (newBaseId) => {
    if (newBaseId) {
      loadSowingTimeData();
    }
  }
);

// 组件加载时初始化数据
onMounted(() => {
  // 如果有 baseId，加载播种信息
  if (props.baseId) {
    loadSowingTimeData();
  }
});
</script>

<template>
  <div class="sowing-period-container">
    <div class="sowing-header">
      <h3 class="module-title">
        <!-- <el-icon><Calendar /></el-icon> -->
        最佳播种期
      </h3>
    </div>

    <!-- 品种信息显示 -->
    <div v-if="varietyName" class="variety-info">
      <span class="variety-label">品种：</span>
      <span class="variety-value">{{ varietyName }}</span>
    </div>

    <!-- 基地信息 -->
    <!-- <div v-if="selectedBase" class="base-info">
      <span class="base-name">当前基地：{{ selectedBase }}</span>
    </div>
    <div v-else class="base-info">
      <span class="no-base">请选择基地查看播种期信息</span>
    </div> -->

    <!-- 日历区域 -->
    <div class="calendar-section">
      <!-- 日历头部 -->
      <div class="calendar-header">
        <el-button size="small" type="text" @click="prevMonth">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="current-month">{{ currentYearMonth }}</span>
        <el-button size="small" type="text" @click="nextMonth">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <!-- 星期标题 -->
      <div class="calendar-weekdays">
        <div class="weekday">日</div>
        <div class="weekday">一</div>
        <div class="weekday">二</div>
        <div class="weekday">三</div>
        <div class="weekday">四</div>
        <div class="weekday">五</div>
        <div class="weekday">六</div>
      </div>

      <!-- 日历天数 -->
      <div class="calendar-days">
        <div
          v-for="(dayInfo, index) in calendarDays"
          :key="index"
          :class="[
            'calendar-day',
            {
              'current-month': dayInfo.isCurrentMonth,
              'predicted-day': dayInfo.type === 'predicted',
              'actual-day': dayInfo.type === 'actual',
              'empty-day': !dayInfo.isCurrentMonth
            }
          ]"
          :title="
            dayInfo.isCurrentMonth && (dayInfo.isPredicted || dayInfo.isActual)
              ? `${dayInfo.isPredicted ? '预测播种期 ' : ''}${dayInfo.isActual ? '实际播种期' : ''}`
              : ''
          "
        >
          {{ dayInfo.day }}
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载播种期信息中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-state">
      <el-icon class="error-icon"><Warning /></el-icon>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- 播种期信息 -->
    <div v-else-if="currentSowingInfo" class="sowing-info">
      <div class="info-section">
        <h4>播种期信息</h4>
        <div class="info-item">
          <span class="info-label predicted-label">预测播种期：</span>
          <span class="info-value">{{ currentSowingInfo.predictedStart }} 至 {{ currentSowingInfo.predictedEnd }}</span>
        </div>
        <div class="info-item">
          <span class="info-label actual-label">实际播种期：</span>
          <span class="info-value">{{ currentSowingInfo.actualStart }} 至 {{ currentSowingInfo.actualEnd }}</span>
        </div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="no-data-state">
      <span>请选择基地和品种查看播种期信息</span>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <div class="legend-item">
        <span class="legend-color predicted-color"></span>
        <span class="legend-text">预测播种期</span>
      </div>
      <div class="legend-item">
        <span class="legend-color actual-color"></span>
        <span class="legend-text">实际播种期</span>
      </div>
    </div>

    <!-- 播种建议滚动区域 -->
    <div class="seedling-tips-container">
      <h4>播种建议</h4>
      <div class="tips-scroll-wrapper">
        <div ref="scrollContent" class="tips-scroll-content">
          <!-- 第一组内容 -->
          <div class="tips-group">
            <div class="tip-item">1. 细整地并保墒播种，做到上虚下实、地平土细利于齐苗</div>
            <div class="tip-item">2. 控制播量与密度，一般每亩0.5–1.0公斤，水肥好则稀、瘠薄地稍密</div>
            <div class="tip-item">3. 拌种或包衣处理，用杀菌剂和微量元素提高抗病性和出苗率</div>
            <div class="tip-item">4. 掌握播深2–3厘米，并尽量采用机械精量播种以保证均匀</div>
            <div class="tip-item">5. 播后及时镇压，稳墒提温促进整齐出苗</div>
            <div class="tip-item">6. 播后重视防鸟害和查苗补苗，确保苗全苗齐</div>
            <div class="tip-item">7. 选择适宜的播种方式，条播或穴播均可，行距30–40厘米</div>
            <div class="tip-item">8. 播种前晒种1–2天，提高种子活力和发芽率</div>
            <div class="tip-item">9. 根据土壤墒情确定播种时间，土壤含水量18–20%为宜</div>
            <div class="tip-item">10. 播种后覆土厚度均匀，避免露籽或覆土过厚影响出苗</div>
          </div>
          <!-- 第二组内容（重复第一组，实现无缝循环） -->
          <div class="tips-group">
            <div class="tip-item">1. 细整地并保墒播种，做到上虚下实、地平土细利于齐苗</div>
            <div class="tip-item">2. 控制播量与密度，一般每亩0.5–1.0公斤，水肥好则稀、瘠薄地稍密</div>
            <div class="tip-item">3. 拌种或包衣处理，用杀菌剂和微量元素提高抗病性和出苗率</div>
            <div class="tip-item">4. 掌握播深2–3厘米，并尽量采用机械精量播种以保证均匀</div>
            <div class="tip-item">5. 播后及时镇压，稳墒提温促进整齐出苗</div>
            <div class="tip-item">6. 播后重视防鸟害和查苗补苗，确保苗全苗齐</div>
            <div class="tip-item">7. 选择适宜的播种方式，条播或穴播均可，行距30–40厘米</div>
            <div class="tip-item">8. 播种前晒种1–2天，提高种子活力和发芽率</div>
            <div class="tip-item">9. 根据土壤墒情确定播种时间，土壤含水量18–20%为宜</div>
            <div class="tip-item">10. 播种后覆土厚度均匀，避免露籽或覆土过厚影响出苗</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sowing-period-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .sowing-header {
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;

    .module-title {
      margin: 0;
      font-size: 16px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: bold;
    }
  }

  .variety-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;

    .variety-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
      white-space: nowrap;
    }

    .variety-value {
      font-size: 14px;
      color: #333;
      font-weight: normal;
    }
  }

  .base-info {
    margin-bottom: 8px;
    padding: 6px 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-size: 12px;

    .base-name {
      color: #409eff;
      font-weight: 500;
    }

    .no-base {
      color: #999;
    }
  }

  .calendar-section {
    flex: 0 0 auto;
    min-height: 180px;

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;

      .current-month {
        font-size: 14px;
        font-weight: normal;
        color: #333;
      }
    }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: 4px;

      .weekday {
        text-align: center;
        font-size: 11px;
        color: #666;
        font-weight: 600;
        padding: 3px 0;
      }
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;

      .calendar-day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        border-radius: 3px;
        cursor: pointer;
        transition: all 0.2s;

        &.current-month {
          color: #333;
          background-color: #f8f9fa;

          &:hover {
            background-color: #e6f7ff;
          }
        }

        &.empty-day {
          color: transparent;
          cursor: default;
        }

        &.predicted-day {
          background-color: rgba(64, 158, 255, 0.3);
          color: #409eff;
          font-weight: 600;
        }

        &.actual-day {
          background-color: rgba(67, 194, 35, 0.3);
          color: #43c223;
          font-weight: 600;
        }
      }
    }
  }

  .loading-state,
  .error-state,
  .no-data-state {
    margin: 8px 0;
    padding: 12px 8px;
    text-align: center;
    font-size: 12px;
    border-radius: 4px;

    .loading-icon {
      animation: rotate 1s linear infinite;
      color: #409eff;
      margin-right: 6px;
    }

    .error-icon {
      color: #f56c6c;
      margin-right: 6px;
    }
  }

  .loading-state {
    background-color: #e6f7ff;
    color: #409eff;
  }

  .error-state {
    background-color: #fef0f0;
    color: #f56c6c;
  }

  .no-data-state {
    background-color: #f8f9fa;
    color: #999;
  }

  .sowing-info {
    margin: 8px 0;
    padding: 8px;
    background-color: #f8f9fa;
    border-radius: 4px;

    h4 {
      margin: 0 0 6px 0;
      font-size: 12px;
      color: #333;
    }

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      font-size: 11px;

      .info-label {
        min-width: 70px;
        font-weight: 500;

        &.predicted-label {
          color: #409eff;
        }

        &.actual-label {
          color: #43c223;
        }
      }

      .info-value {
        color: #333;
      }
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .legend {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px solid #eee;
    justify-content: flex-end;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;

      .legend-color {
        width: 10px;
        height: 10px;
        border-radius: 2px;

        &.predicted-color {
          background-color: rgba(64, 158, 255, 0.3);
          border: 1px solid #409eff;
        }

        &.actual-color {
          background-color: rgba(67, 194, 35, 0.3);
          border: 1px solid #43c223;
        }
      }

      .legend-text {
        color: #666;
      }
    }
  }

  .seedling-tips-container {
    margin: 8px 0;
    padding: 8px;
    background-color: #f8f9fa;
    border-radius: 4px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    h4 {
      margin: 0 0 6px 0;
      font-size: 16px;
      color: #333;
      font-weight: bold;
    }

    .tips-scroll-wrapper {
      flex: 1;
      overflow: hidden;
      min-height: 60px;
      position: relative;

      .tips-scroll-content {
        animation: scrollUp 30s linear infinite;
        display: flex;
        flex-direction: column;

        .tips-group {
          flex-shrink: 0;

          .tip-item {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            margin-bottom: 8px;

            &:last-child {
              margin-bottom: 8px; // 保持间距，避免组之间的空白
            }
          }
        }
      }

      &:hover .tips-scroll-content {
        animation-play-state: paused;
      }
    }
  }

  @keyframes scrollUp {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-50%);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .sowing-period-container {
    padding: 10px;

    .variety-info {
      width: 100%;

      .variety-label,
      .variety-value {
        font-size: 13px;
      }
    }

    .calendar-days {
      .calendar-day {
        font-size: 11px;
      }
    }

    .legend {
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>
