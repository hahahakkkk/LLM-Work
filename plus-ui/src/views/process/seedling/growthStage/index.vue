<template>
  <div class="m-0 p-4">
    <div class="grid lg:grid-cols-[420px_1fr] gap-0.5" style="height: 750px">
      <!-- 左侧：参数设置区 -->
      <div class="flex flex-col gap-0.5">
        <el-card ref="parameterCard" style="height: 465px">
          <template #header>
            <span class="font-semibold text-sm">预测参数设置</span>
          </template>

          <div class="flex flex-col -m-5">
            <!-- 品种选择 -->
            <div class="mx-5 mt-5 mb-2">
              <h3 class="text-sm font-semibold mb-1">品种选择</h3>
              <el-select v-model="selectedVariety" placeholder="请选择品种" size="default" class="w-full">
                <el-option v-for="variety in varietyOptions" :key="variety.value" :label="variety.label" :value="variety.value" />
              </el-select>
            </div>

            <!-- 日期推荐 -->
            <div class="mb-2">
              <div class="flex items-center justify-between mx-5 mb-1">
                <h3 class="text-sm font-semibold">日期推荐</h3>
                <!-- 日历图例 -->
                <div class="calendar-legend-inline">
                  <div class="legend-item">
                    <span class="legend-color experience-period"></span>
                    <span class="legend-text">经验播种期</span>
                  </div>
                </div>
              </div>
              <div class="calendar-container">
                <!-- 自定义月份导航 -->
                <div class="flex items-center justify-between p-1 border-b mx-5">
                  <el-button size="small" :icon="ArrowLeft" circle @click="prevMonth" />
                  <span class="font-medium text-sm">{{ formatCalendarMonth(currentCalendarDate) }}</span>
                  <el-button size="small" :icon="ArrowRight" circle @click="nextMonth" />
                </div>

                <el-calendar v-model="currentCalendarDate" class="compact-calendar">
                  <template #date-cell="{ data }">
                    <div
                      class="calendar-day"
                      :class="{
                        'is-best-day': isHistoricalBestDay(data.day)
                      }"
                    >
                      <span>{{ data.day.split('-').slice(2).join('-') }}</span>
                    </div>
                  </template>
                </el-calendar>
              </div>
            </div>

            <!-- 预测按钮 -->
            <div class="mx-5 mb-5 mt-2">
              <el-button type="primary" size="default" :disabled="!canPredict" :loading="isPredicting" class="w-full" @click="handlePredict">
                <el-icon class="mr-1"><TrendCharts /></el-icon>
                <span>开始预测</span>
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 播种建议 -->
        <el-card ref="suggestionCard" style="height: 283px">
          <template #header>
            <span class="font-semibold text-sm">预测规则</span>
          </template>

          <div class="-m-5 px-2 py-2 h-full">
            <div class="sowing-tips-container" style="height: 243px">
              <div class="tips-scroll-wrapper">
                <div class="tips-scroll-content">
                  <!-- 第一组内容 -->
                  <div class="tips-group">
                    <div class="tip-item">
                      1.
                      模型读取未来15天的逐日温度（最高温/最低温/平均温），并根据品种的发芽–出苗温度需求进行连续性判别。当预报温度在多日内稳定高于该品种的生理发芽阈值时，模型认为该时段已进入满足播种基本积温条件的生长阶段。
                    </div>
                    <div class="tip-item">
                      2.
                      模型利用未来墒情（干旱等级）预测曲线，筛选出落在适宜湿度范围（通常为2–4级）的稳定区段。当未来数日不存在显著湿涝或持续干旱趋势时，该连续区段被标记为具备土壤环境适宜性的播种候选窗口。
                    </div>
                    <div class="tip-item">
                      3. 模型检索预测期内是否存在暴雨（≥30–50
                      mm）、寒潮过程（温度骤降≥8℃）、连续阴雨低温等不利事件。若未来一周出现潜在致灾性天气，模型将自动排除或延后相应时间段，以规避烂种、冻害及出苗失败等重大风险。
                    </div>
                    <div class="tip-item">
                      4.
                      模型将候选窗口与品种固有物候需求、以及当地多年生产实践形成的经验适播期进行交叉匹配。最终推荐的播种期必须同时满足气象适宜性、土壤墒情、风险安全性与农时规律四项要求，以确保整体最稳健、风险最低、出苗率最佳。
                    </div>
                  </div>
                  <!-- 第二组内容（重复第一组，实现无缝循环） -->
                  <div class="tips-group">
                    <div class="tip-item">
                      1.
                      模型读取未来15天的逐日温度（最高温/最低温/平均温），并根据品种的发芽–出苗温度需求进行连续性判别。当预报温度在多日内稳定高于该品种的生理发芽阈值时，模型认为该时段已进入满足播种基本积温条件的生长阶段。
                    </div>
                    <div class="tip-item">
                      2.
                      模型利用未来墒情（干旱等级）预测曲线，筛选出落在适宜湿度范围（通常为2–4级）的稳定区段。当未来数日不存在显著湿涝或持续干旱趋势时，该连续区段被标记为具备土壤环境适宜性的播种候选窗口。
                    </div>
                    <div class="tip-item">
                      3. 模型检索预测期内是否存在暴雨（≥30–50
                      mm）、寒潮过程（温度骤降≥8℃）、连续阴雨低温等不利事件。若未来一周出现潜在致灾性天气，模型将自动排除或延后相应时间段，以规避烂种、冻害及出苗失败等重大风险。
                    </div>
                    <div class="tip-item">
                      4.
                      模型将候选窗口与品种固有物候需求、以及当地多年生产实践形成的经验适播期进行交叉匹配。最终推荐的播种期必须同时满足气象适宜性、土壤墒情、风险安全性与农时规律四项要求，以确保整体最稳健、风险最低、出苗率最佳。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：预测区域 -->
      <div ref="rightContainer" class="flex flex-col gap-0.5">
        <!-- 上部分：预测依据 -->
        <el-card v-loading="isLoadingInfo" style="height: 320px">
          <template #header>
            <span class="font-semibold text-sm">预测依据</span>
          </template>

          <div v-if="tempBarImage && moistBarImage" class="w-full flex gap-0.5 -m-5 py-2" style="height: 280px">
            <div class="flex-1 cursor-pointer">
              <el-image
                :src="tempBarImage"
                alt="温度柱状图"
                style="width: 100%; height: 100%"
                fit="fill"
                :preview-src-list="[tempBarImage]"
                :initial-index="0"
                hide-on-click-modal
              />
            </div>
            <div class="flex-1 cursor-pointer">
              <el-image
                :src="moistBarImage"
                alt="湿度柱状图"
                style="width: 100%; height: 100%"
                fit="fill"
                :preview-src-list="[moistBarImage]"
                :initial-index="0"
                hide-on-click-modal
              />
            </div>
          </div>

          <div v-else class="flex items-center justify-center -m-5" style="height: 280px">
            <el-empty description="加载中..." :image-size="50">
              <template #image>
                <el-icon :size="40" class="text-gray-400"><DataLine /></el-icon>
              </template>
            </el-empty>
          </div>
        </el-card>

        <!-- 下部分：预测结果 -->
        <el-card v-loading="isPredicting" style="height: 428px">
          <template #header>
            <span class="font-semibold text-sm">预测结果</span>
          </template>

          <div v-if="resultImage" class="w-full flex flex-col -m-5">
            <!-- 预测结论文字 - 移到图片上方 -->
            <div class="m-0 p-0.5 bg-green-50 border border-green-200 rounded">
              <p class="text-base text-green-800 font-medium text-center m-0">
                {{ predictionText || '预测结论生成中...' }}
              </p>
            </div>
            <!-- 图片容器 -->
            <div class="py-2 cursor-pointer" style="height: 350px">
              <el-image
                :src="resultImage"
                alt="预测结果图"
                style="width: 100%; height: 100%"
                fit="fill"
                :preview-src-list="[resultImage]"
                :initial-index="0"
                hide-on-click-modal
              />
            </div>
          </div>

          <div v-else class="flex items-center justify-center -m-5" style="height: 390px">
            <el-empty description="选择品种后点击开始预测查看结果" :image-size="50">
              <template #image>
                <el-icon :size="40" class="text-gray-400"><TrendCharts /></el-icon>
              </template>
            </el-empty>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { TrendCharts, DataLine, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 播种期识别API
import { identifyST, type IdentifySTRequest, getSTInfo, type GetSTInfoRequest } from '@/views/process/api/pestcontrol/identify/index';

defineOptions({
  name: 'SeedTimePrediction'
});

// 定义历史最佳播种期数据
interface HistoricalExperienceData {
  variety: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  displayText: string;
}

// 定义品种选项接口
interface VarietyOption {
  value: string;
  label: string;
  description?: string;
}

const historicalExperiences: HistoricalExperienceData[] = [
  {
    variety: '米谷一号',
    startMonth: 5,
    startDay: 10,
    endMonth: 5,
    endDay: 24,
    displayText: '5月10日至5月24日'
  },
  {
    variety: '米谷二号',
    startMonth: 5,
    startDay: 16,
    endMonth: 5,
    endDay: 30,
    displayText: '5月16日至5月30日'
  },
  {
    variety: '晋谷21号',
    startMonth: 5,
    startDay: 23,
    endMonth: 6,
    endDay: 6,
    displayText: '5月23日至6月6日'
  }
];

// 品种选项数据 - 便于扩展和管理
const varietyOptions: VarietyOption[] = [
  {
    value: '米谷一号',
    label: '米谷一号'
  },
  {
    value: '米谷二号',
    label: '米谷二号'
  },
  {
    value: '晋谷21号',
    label: '晋谷21号'
  }
];

// 状态管理
const selectedVariety = ref('米谷一号');
const currentCalendarDate = ref(new Date());
const isPredicting = ref(false);
const hasResult = ref(false);
const bestSowingTime = ref('');

// 新增的状态变量
const tempBarImage = ref(''); // 温度柱状图
const moistBarImage = ref(''); // 湿度柱状图
const resultImage = ref(''); // 预测结果图片
const startDate = ref(''); // 开始日期
const endDate = ref(''); // 结束日期
const predictionText = ref(''); // 预测文字结论
const isLoadingInfo = ref(false); // 加载播种期信息状态

// 容器引用（保留用于其他功能）
const rightContainer = ref(null); // 右侧容器引用
const suggestionCard = ref(null); // 播种建议卡片引用
const parameterCard = ref(null); // 参数设置卡片引用

// 旧的状态变量（保留兼容）
const predictionChart = ref('');
const chartContainer = ref(null);

// 清理Blob URL（防止内存泄漏）
const cleanupChartUrl = () => {
  if (predictionChart.value && predictionChart.value.startsWith('blob:')) {
    URL.revokeObjectURL(predictionChart.value);
  }
  if (tempBarImage.value && tempBarImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(tempBarImage.value);
  }
  if (moistBarImage.value && moistBarImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(moistBarImage.value);
  }
  if (resultImage.value && resultImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(resultImage.value);
  }
};

// 生成预测结论文字
const generatePredictionText = (variety: string, start: string, end: string) => {
  return `${variety}的最佳播种时间为 ${start} 至 ${end}`;
};

// 监听品种选择变化，自动跳转日历到对应月份
watch(selectedVariety, (newVariety) => {
  const experience = historicalExperiences.find((exp) => exp.variety === newVariety);
  if (experience) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 月份从0开始，所以加1

    // 计算目标年份：如果当前月份大于播种月份（例如10月 > 5月），则跳转到次年
    let targetYear = currentYear;
    if (currentMonth > experience.startMonth) {
      targetYear = currentYear + 1;
    }

    // 设置日历跳转到对应的月份
    const targetDate = new Date(targetYear, experience.startMonth - 1, 1); // 月份从0开始，所以要减1
    currentCalendarDate.value = targetDate;
  }
});

// 是否可以开始预测（只需要选择品种）
const canPredict = computed(() => {
  return selectedVariety.value !== '';
});

// 月份切换函数
const prevMonth = () => {
  const date = new Date(currentCalendarDate.value);
  date.setMonth(date.getMonth() - 1);
  currentCalendarDate.value = date;
};

const nextMonth = () => {
  const date = new Date(currentCalendarDate.value);
  date.setMonth(date.getMonth() + 1);
  currentCalendarDate.value = date;
};

// 格式化日历月份显示
const formatCalendarMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}年${month}月`;
};

// 判断是否在历史最佳播种期内
const isHistoricalBestDay = (day: string) => {
  if (!selectedVariety.value) return false;

  const experience = historicalExperiences.find((exp) => exp.variety === selectedVariety.value);
  if (!experience) return false;

  const date = new Date(day);
  const year = date.getFullYear();

  // 构建历史最佳播种期的开始和结束日期
  const startDate = new Date(year, experience.startMonth - 1, experience.startDay);
  const endDate = new Date(year, experience.endMonth - 1, experience.endDay);

  // 重置时间为00:00:00以便正确比较日期
  date.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return date >= startDate && date <= endDate;
};

// 执行预测
const handlePredict = async () => {
  if (!canPredict.value) {
    ElMessage.warning('请选择品种');
    return;
  }

  isPredicting.value = true;
  hasResult.value = false;

  // 清理旧的图表URL
  cleanupChartUrl();

  try {
    // 准备播种期识别API请求数据
    const requestData: IdentifySTRequest = {
      variety: selectedVariety.value,
      variety_area: '侯家沟' // 固定为侯家沟
    };

    // 调用播种期识别API
    const response = await identifyST(requestData);

    // 更新结果 - 处理新的数据结构
    if (response.data && response.data.startDate && response.data.endDate && response.data.trendUrl) {
      const predictionData = response.data;

      // 使用新的数据结构：只使用 trendUrl 作为预测结果图片
      resultImage.value = predictionData.trendUrl;
      startDate.value = predictionData.startDate;
      endDate.value = predictionData.endDate;

      // 格式化日期显示
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      };

      predictionText.value = generatePredictionText(selectedVariety.value, formatDate(predictionData.startDate), formatDate(predictionData.endDate));

      // TODO: 调用保存接口
      // await saveSowingTimePrediction({
      //   variety: selectedVariety.value,
      //   varietyArea: '侯家沟',
      //   startDate: predictionData.startDate,
      //   endDate: predictionData.endDate,
      //   resultImageUrl: predictionData.trendUrl,
      //   predictTime: new Date().toISOString()
      // });

      hasResult.value = true;
      ElMessage.success('预测完成！');
    } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      // 兼容旧的数组格式数据结构
      const predictionData = response.data[0];
      if (predictionData.imageUrl) {
        predictionChart.value = predictionData.imageUrl;
        resultImage.value = predictionData.imageUrl;
        bestSowingTime.value = `${selectedVariety.value} - ${requestData.variety_area}`;

        // 为兼容模式生成默认的预测文字
        const experience = historicalExperiences.find((exp) => exp.variety === selectedVariety.value);
        if (experience) {
          predictionText.value = generatePredictionText(
            selectedVariety.value,
            `${experience.startMonth}月${experience.startDay}日`,
            `${experience.endMonth}月${experience.endDay}日`
          );
        } else {
          predictionText.value = `经预测，${selectedVariety.value}的播种期预测已完成，请查看上方图表了解详细信息。`;
        }

        hasResult.value = true;
        ElMessage.success('识别完成！');
      } else {
        ElMessage.error('未获取到图片URL');
      }
    } else {
      ElMessage.error('预测失败，请稍后重试');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '识别失败，请检查后端服务是否正常');
  } finally {
    isPredicting.value = false;
  }
};

// 日期格式化为YYYY-MM-DD
const formatDateToYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 加载播种期信息（温度和湿度柱状图）
const loadSTInfo = async () => {
  isLoadingInfo.value = true;
  try {
    const requestData: GetSTInfoRequest = {
      variety: selectedVariety.value,
      variety_area: '侯家沟'
    };

    const response = await getSTInfo(requestData);

    if (response.data && response.data.tempBarUrl && response.data.moistBarUrl) {
      tempBarImage.value = response.data.tempBarUrl;
      moistBarImage.value = response.data.moistBarUrl;
    } else {
      ElMessage.warning('播种期信息加载失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取播种期信息失败');
  } finally {
    isLoadingInfo.value = false;
  }
};

// 监听品种变化，重新加载播种期信息
watch(selectedVariety, () => {
  loadSTInfo();
});

// --- 生命周期钩子 ---
onMounted(() => {
  // 页面加载时自动跳转到默认品种的历史最佳播种期月份
  const experience = historicalExperiences.find((exp) => exp.variety === selectedVariety.value);
  if (experience) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let targetYear = currentYear;
    if (currentMonth > experience.startMonth) {
      targetYear = currentYear + 1;
    }

    const targetDate = new Date(targetYear, experience.startMonth - 1, 1);
    currentCalendarDate.value = targetDate;
  }

  // 加载播种期信息
  loadSTInfo();
});

onUnmounted(() => {
  // 清理Blob URL
  cleanupChartUrl();
});
</script>

<style lang="scss" scoped>
// 日历容器样式
.calendar-container {
  :deep(.el-calendar) {
    .el-calendar__header {
      display: none;
    }

    .el-calendar__body {
      padding: 1px;
    }

    .el-calendar-table thead th {
      padding: 1px 0;
      font-size: 10px;
    }

    .el-calendar-table td {
      padding: 0;
      height: 24px;
    }

    .el-calendar-table .el-calendar-day {
      padding: 0;
      height: 100%;
    }
  }
}

// 紧凑日历样式
.compact-calendar {
  :deep(.el-calendar__body) {
    padding: 1px !important;
  }

  :deep(.el-calendar-table) {
    thead th {
      padding: 1px 0 !important;
      font-size: 9px !important;
      height: 20px !important;
    }

    td {
      height: 22px !important;
      padding: 0 !important;
    }
  }
}

// 日历日期单元格
.calendar-day {
  padding: 4px;
  text-align: center;
  font-size: 12px;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; // 禁止点击
  cursor: default;

  &.is-best-day {
    background: linear-gradient(to bottom right, #86efac, #4ade80);
    color: #14532d;
    font-weight: bold;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 2px solid #22c55e;
    animation: twinkle 1.5s ease-in-out infinite;
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.05);
  }
}

// 内联日历图例样式
.calendar-legend-inline {
  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;

    .legend-color {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      border: 1px solid #d1d5db;

      &.experience-period {
        background: linear-gradient(to bottom right, #86efac, #4ade80);
        border-color: #22c55e;
      }
    }

    .legend-text {
      font-size: 11px;
      color: #4b5563;
      font-weight: 500;
    }
  }
}

// 确保 el-image 组件能够正确填充容器
:deep(.el-image) {
  width: 100%;
  height: 100%;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

// 播种建议容器样式
.sowing-tips-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; // 确保flex子元素可以收缩

  .tips-scroll-wrapper {
    flex: 1;
    overflow: hidden;
    position: relative;
    min-height: 0; // 确保可以收缩

    .tips-scroll-content {
      animation: scrollUp 20s linear infinite;
      display: flex;
      flex-direction: column;

      .tips-group {
        flex-shrink: 0;

        .tip-item {
          font-size: 13px;
          color: #333;
          line-height: 1.5;
          margin-bottom: 8px;
          padding: 6px 8px;
          background-color: #f8f9fa;
          border-radius: 4px;
          transition: all 0.3s ease;

          &:hover {
            background-color: #e9ecef;
            transform: translateX(2px);
          }

          &:last-child {
            margin-bottom: 8px;
          }
        }
      }
    }

    &:hover .tips-scroll-content {
      animation-play-state: paused;
    }
  }
}

// 固定高度布局，无需额外的flex拉伸样式

@keyframes scrollUp {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}
</style>
