<template>
  <div class="flex flex-col gap-2 sm:gap-3 md:gap-4">
    <!-- 顶部操作栏 -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h1 class="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
        <el-icon :size="24" class="text-blue-600"><DocumentChecked /></el-icon>
        <span class="text-base sm:text-xl">本次检查结果</span>
      </h1>
      <div class="flex gap-2 sm:gap-3 w-full sm:w-auto">
        <el-button plain size="default" class="sm:size-large flex-1 sm:flex-none" :icon="Upload" @click="back"> 返回检测 </el-button>
        <el-button type="primary" size="default" class="sm:size-large flex-1 sm:flex-none" :icon="Check" :disabled="isSaved" @click="saveAllResults">
          {{ isSaved ? '已保存' : '保存结果' }}
        </el-button>
      </div>
    </div>

    <!-- 检测结果卡片列表 -->
    <div
      v-for="(identifyResult, identifyResultIndex) in props.results"
      :key="identifyResultIndex"
      class="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden border border-gray-100"
    >
      <!-- 主要内容区域 -->
      <div class="p-0">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:h-[600px]">
          <!-- 左侧：检测结果图 -->
          <div class="lg:col-span-1 flex flex-col h-full">
            <div
              class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg p-2 sm:p-3 text-center border border-gray-200 border-b-0 flex-shrink-0"
            >
              <h3 class="font-semibold text-lg text-gray-700 flex items-center justify-center gap-2">
                <el-icon class="text-blue-600" :size="16"><Picture /></el-icon>
                <span>检测结果图</span>
              </h3>
            </div>
            <div class="flex-1 min-h-0 bg-gray-50 rounded-b-lg border border-gray-200 p-0 relative flex items-center justify-center">
              <img
                :key="`img-${identifyResultIndex}-${identifyResult.originalFileName || identifyResultIndex}-${identifyResult.timestamp || Date.now()}-${imageRefreshKey}`"
                :src="getUniqueImageUrl(identifyResult)"
                :alt="identifyResult.pestTypes"
                style="object-fit: contain; object-position: center; background: transparent"
                class="w-full h-full cursor-pointer"
                @click="openPreview(identifyResult)"
                @error="handleImageError"
                @load="handleImageLoad"
              />
            </div>
          </div>

          <!-- 中间：检测结果描述 -->
          <div class="lg:col-span-1 flex flex-col h-full">
            <div class="bg-gray-100 rounded-lg p-2 sm:p-3 text-center mb-3 sm:mb-4 border border-gray-200 flex-shrink-0">
              <h3 class="font-semibold text-lg text-gray-700 flex items-center justify-center gap-2">
                <el-icon class="text-gray-600" :size="16"><Document /></el-icon>
                <span>检测结果信息</span>
              </h3>
            </div>
            <div class="space-y-2 sm:space-y-3 flex-1 min-h-0 overflow-y-auto pr-2">
              <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2">
                  <span class="font-semibold text-gray-700 text-xs sm:text-sm">病虫害类型</span>
                </div>
                <p class="text-xs sm:text-sm text-gray-600">{{ identifyResult.pestTypes }}</p>
              </div>

              <!-- 病虫害信息 -->
              <div
                v-if="strategies[identifyResultIndex] && strategies[identifyResultIndex][0] && strategies[identifyResultIndex][0].intro"
                class="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200"
              >
                <div class="flex items-center gap-1 sm:gap-2">
                  <span class="font-semibold text-gray-700 text-xs sm:text-sm">病虫害信息</span>
                </div>
                <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ strategies[identifyResultIndex][0].intro }}</p>
              </div>

              <div class="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                <div class="flex items-center gap-1 sm:gap-2">
                  <span class="font-semibold text-gray-700 text-xs sm:text-sm">检测时间</span>
                </div>
                <p class="text-xs sm:text-sm text-gray-600">{{ formatTime(new Date()) }}</p>
              </div>
            </div>
          </div>

          <!-- 右侧：建议措施 -->
          <div class="lg:col-span-1 flex flex-col h-full">
            <div class="bg-gray-100 rounded-lg p-2 sm:p-3 text-center mb-3 sm:mb-4 border border-gray-200 flex-shrink-0">
              <h3 class="font-semibold text-lg text-gray-700 flex items-center justify-center gap-2">
                <el-icon class="text-gray-600" :size="16"><Tools /></el-icon>
                <span>建议措施</span>
              </h3>
            </div>

            <!-- 有策略数据 -->
            <div
              v-if="
                strategies[identifyResultIndex] &&
                strategies[identifyResultIndex].length > 0 &&
                strategies[identifyResultIndex][0] &&
                strategies[identifyResultIndex][0].strategy
              "
              class="flex flex-col flex-1 min-h-0 space-y-3 pr-2"
            >
              <div
                v-for="(strategiesResult, strategiesResultIndex) in strategies[identifyResultIndex]"
                :key="strategiesResultIndex"
                class="bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0"
              >
                <!-- 策略内容区域 -->
                <div class="p-1.5 sm:p-2 space-y-1 sm:space-y-1.5">
                  <!-- 对象类型策略（新接口返回格式：物理防治、生物防治等） -->
                  <div
                    v-if="strategiesResult.strategy && typeof strategiesResult.strategy === 'object' && !Array.isArray(strategiesResult.strategy)"
                    class="space-y-3"
                  >
                    <div
                      v-for="(value, key, index) in strategiesResult.strategy"
                      :key="key"
                      class="strategy-item-card p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:shadow-sm transition-all"
                    >
                      <div class="flex items-start gap-1.5 sm:gap-2">
                        <div
                          class="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-sm"
                        >
                          {{ index + 1 }}
                        </div>
                        <div class="flex-1">
                          <div class="text-xs sm:text-sm font-bold text-blue-600 mb-1 sm:mb-1.5 capitalize">{{ key }}</div>
                          <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">{{ value }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 数组类型策略（备用格式） -->
                  <div v-else-if="Array.isArray(strategiesResult.strategy)" class="space-y-3">
                    <div
                      v-for="(strategy, strategyIndex) in strategiesResult.strategy"
                      :key="strategyIndex"
                      class="strategy-item-card p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:shadow-sm transition-all"
                    >
                      <div class="flex items-start gap-1.5 sm:gap-2">
                        <div
                          class="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-sm"
                        >
                          {{ strategyIndex + 1 }}
                        </div>
                        <div class="flex-1">
                          <p class="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">{{ strategy }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 字符串类型策略（最后备用） -->
                  <div v-else class="p-1.5 sm:p-2">
                    <div class="flex items-start gap-2 sm:gap-3">
                      <div
                        class="strategy-number w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm flex-shrink-0 mt-0 sm:mt-0.5"
                      >
                        1
                      </div>
                      <div class="flex-1">
                        <p class="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">{{ strategiesResult.strategy }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 无策略数据 -->
            <div v-else class="flex flex-col space-y-3">
              <!-- 暂无防治策略提示 -->
              <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center border-2 border-dashed border-gray-300">
                <el-icon :size="40" class="text-gray-400 mb-2 mx-auto"><Document /></el-icon>
                <p class="text-gray-600 mb-1 text-base font-semibold">暂无防治策略</p>
                <p class="text-sm text-gray-500">{{ identifyResult.pestTypes }}</p>
              </div>

              <!-- 建议操作 -->
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <div class="flex items-center gap-2 mb-3">
                  <span class="font-semibold text-gray-700 text-sm">建议操作</span>
                </div>
                <ul class="text-left text-sm text-gray-600 space-y-2">
                  <li class="flex items-start gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-gray-800 mt-2 flex-shrink-0"></span>
                    <span>点击重新查询按钮获取最新防治策略</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-gray-800 mt-2 flex-shrink-0"></span>
                    <span>确认病虫害识别结果准确性</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-gray-800 mt-2 flex-shrink-0"></span>
                    <span>联系农技专家获取专业建议</span>
                  </li>
                </ul>
              </div>

              <!-- 重新查询按钮 -->
              <el-button
                type="primary"
                size="large"
                class="w-full"
                @click="queryStrategies(identifyResultIndex, identifyResult.pestTypes, identifyResult.pestTypes, true)"
              >
                <el-icon class="mr-2"><Refresh /></el-icon>
                重新查询防治策略
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <el-image-viewer v-if="previewVisible" :url-list="previewImages" :initial-index="previewIndex" @close="closePreview" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, type Ref } from 'vue';
import { getTacticsResponseVO, identifyRgbResponseVO, GetStrategyResponseVO } from '../../../api/pestcontrol/identify/types';
import { getTactics, getStrategy } from '../../../api/pestcontrol/identify';
import { addPlantResult } from '../../farmland/api';
import {
  DocumentChecked,
  Upload,
  Check,
  Search,
  ZoomIn,
  Warning,
  Clock,
  TrendCharts,
  Tools,
  Right,
  Document,
  Download,
  Refresh,
  Picture,
  MoreFilled,
  InfoFilled,
  ArrowUpBold
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, ElImageViewer } from 'element-plus';

const props = defineProps<{
  results: identifyRgbResponseVO[] | null;
  collectionInfo?: {
    location: string; // 地块ID
    locationLabel?: string; // 地块名称
    baseName?: string; // 基地名称
    collectTime: string; // 采样时间
    baseId?: string; // 基地ID
  };
}>();

const emits = defineEmits(['backto-upload']);

const strategies: Ref<GetStrategyResponseVO[][]> = ref([]);
const imageRefreshKey = ref(0); // 用于强制刷新图片
const isSaved = ref(false); // 标记是否已保存

// 检测结果展开状态
const expandedDetections: Ref<boolean[]> = ref([]);

// 图片预览相关
const previewVisible = ref(false);
const previewImages = ref<string[]>([]);
const previewIndex = ref(0);

// 打开图片预览
const openPreview = (identifyResult: identifyRgbResponseVO) => {
  const imageUrl = getUniqueImageUrl(identifyResult);
  if (imageUrl) {
    previewImages.value = [imageUrl];
    previewIndex.value = 0;
    previewVisible.value = true;
  }
};

// 关闭图片预览
const closePreview = () => {
  previewVisible.value = false;
  previewImages.value = [];
};

const back = () => {
  // 返回上传页面时重置保存状态
  isSaved.value = false;
  emits('backto-upload');
};

// 切换检测结果的展开状态
const toggleShowAllDetections = (resultIndex: number) => {
  if (expandedDetections.value[resultIndex] === undefined) {
    expandedDetections.value[resultIndex] = false;
  }
  expandedDetections.value[resultIndex] = !expandedDetections.value[resultIndex];
};

// 置信度转换为准确度的算法
// 置信度是模型输出的原始概率，准确度是经过校准后面向用户的理解指标
const convertConfidenceToAccuracy = (confidence: number): number => {
  // 使用改进的Platt缩放方法进行置信度校准
  // 对于病虫害识别模型，通常需要更保守的准确度评估
  if (confidence >= 0.95) return Math.round(confidence * 98); // 高置信度略微降低以体现实际准确度
  if (confidence >= 0.85) return Math.round(confidence * 96);
  if (confidence >= 0.7) return Math.round(confidence * 94);
  if (confidence >= 0.5) return Math.round(confidence * 90);
  return Math.round(confidence * 85); // 低置信度更大幅度调整
};

// 获取准确度级别描述
const getAccuracyLevel = (percentage: number): string => {
  if (percentage >= 90) return '非常准确';
  if (percentage >= 80) return '较为准确';
  if (percentage >= 65) return '中等准确';
  if (percentage >= 50) return '准确度偏低';
  return '准确度较低';
};

// 获取准确度颜色类
const getAccuracyColorClass = (percentage: number): string => {
  if (percentage >= 85) return 'text-green-500';
  if (percentage >= 70) return 'text-blue-500';
  if (percentage >= 55) return 'text-orange-500';
  return 'text-red-500';
};

// 保留原有的置信度函数用于内部计算
const getConfidenceLevel = (percentage: number): string => {
  if (percentage >= 90) return '极高';
  if (percentage >= 80) return '高';
  if (percentage >= 60) return '中等';
  if (percentage >= 40) return '偏低';
  return '较低';
};

const getConfidenceColorClass = (percentage: number): string => {
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 60) return 'text-blue-500';
  if (percentage >= 40) return 'text-orange-500';
  return 'text-red-500';
};

// 获取进度条颜色（根据准确度高低）
const getProgressColor = (percentage: number): string => {
  if (percentage >= 85) return '#67c23a'; // 绿色 - 高准确度
  if (percentage >= 70) return '#409eff'; // 蓝色 - 中等准确度
  if (percentage >= 55) return '#e6a23c'; // 橙色 - 低准确度
  return '#f56c6c'; // 红色 - 很低准确度
};

// 获取检测结果的颜色（为不同目标分配不同颜色）
const getDetectionColor = (index: number): string => {
  const colors = [
    '#409eff', // 蓝色
    '#67c23a', // 绿色
    '#e6a23c', // 橙色
    '#f56c6c', // 红色
    '#909399', // 灰色
    '#c71585', // 紫红色
    '#20b2aa', // 浅海蓝
    '#ff6347' // 番茄红
  ];
  return colors[index % colors.length];
};

// 获取置信度百分比（用于进度条显示）
const getConfidencePercentage = (identifyResult: identifyRgbResponseVO): number => {
  // 优先从 detections 中获取最高置信度（Flask返回的数据格式）
  if (identifyResult.detections && identifyResult.detections.length > 0) {
    // 获取最高置信度
    const maxConfidence = Math.max(
      ...identifyResult.detections.map((d) => {
        const conf = d.confidence || 0;
        return typeof conf === 'number' ? conf : 0;
      })
    );

    // Flask返回的置信度通常是0-1之间的小数
    return Math.round(maxConfidence * 100);
  }

  // 如果没有detections，尝试使用confidence字段
  if (identifyResult.confidence !== undefined) {
    const conf = identifyResult.confidence;
    // 如果置信度已经是百分比形式（0-100）
    if (conf > 1) {
      return Math.round(conf);
    }
    // 如果置信度是小数形式（0-1）
    return Math.round(conf * 100);
  }

  return 0; // 默认值
};

// 获取准确度百分比（基于置信度转换）
const getAccuracyPercentage = (identifyResult: identifyRgbResponseVO): number => {
  // 先获取原始置信度
  const confidencePercentage = getConfidencePercentage(identifyResult);

  // 将百分比形式的置信度转换为0-1之间的小数
  const confidenceRatio = confidencePercentage / 100;

  // 使用转换函数得到准确度
  return convertConfidenceToAccuracy(confidenceRatio);
};

// 获取置信度显示文本
const getConfidenceDisplay = (identifyResult: identifyRgbResponseVO): string => {
  const percentage = getConfidencePercentage(identifyResult);

  if (percentage === 0) {
    return '未知';
  }

  // 如果有多个detections，显示最高置信度和检测数量
  if (identifyResult.detections && identifyResult.detections.length > 1) {
    return `${percentage}% (${identifyResult.detections.length}个目标)`;
  }

  return `${percentage}%`;
};

// 格式化时间
const formatTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 生成唯一的图片URL，避免缓存问题
const getUniqueImageUrl = (identifyResult: identifyRgbResponseVO) => {
  if (!identifyResult.imageUrl) return '';

  // 如果是blob URL，直接返回
  if (identifyResult.imageUrl.startsWith('blob:')) {
    return identifyResult.imageUrl;
  }

  // 如果是普通URL，添加时间戳参数避免缓存
  const separator = identifyResult.imageUrl.includes('?') ? '&' : '?';
  const timestamp = identifyResult.timestamp || Date.now();
  const fileName = identifyResult.originalFileName || 'image';

  return `${identifyResult.imageUrl}${separator}t=${timestamp}&f=${encodeURIComponent(fileName)}`;
};

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.error('图片加载失败:', img.src);

  // 创建一个充分利用空间的替换元素
  const placeholder = document.createElement('div');
  placeholder.className =
    'w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 rounded-lg border-2 border-dashed border-gray-300';
  placeholder.style.minHeight = '350px';
  placeholder.innerHTML = `
    <div class="text-center p-6">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <p class="text-lg font-semibold text-gray-600 mb-2">图片加载失败</p>
      <p class="text-sm text-gray-500">检测结果图像无法显示</p>
      <div class="mt-4 px-4 py-2 bg-white/80 rounded-lg border border-gray-200 shadow-sm">
        <p class="text-xs text-gray-500">请检查网络连接或重新上传图片</p>
      </div>
    </div>
  `;

  // 替换图片元素
  if (img.parentNode) {
    img.parentNode.replaceChild(placeholder, img);
  }
};

// 处理图片加载成功
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // 确保图片显示正常
  img.style.backgroundColor = '';
  img.style.display = '';
  img.style.alignItems = '';
  img.style.justifyContent = '';
};

// 保存单个结果到数据库
const saveToDatabase = (result: identifyRgbResponseVO) => {
  ElMessage({
    message: '该功能暂未开放',
    type: 'warning'
  });
};

// 保存所有结果
const saveAllResults = async () => {
  if (!props.results || props.results.length === 0) {
    ElMessage({
      message: '没有检测结果可以保存',
      type: 'warning'
    });
    return;
  }

  if (!props.collectionInfo) {
    console.error('采样信息为空！');
    ElMessage({
      message: '缺少采样信息，无法保存',
      type: 'warning'
    });
    return;
  }

  if (!props.collectionInfo.baseName) {
    console.error('基地名称为空！当前采样信息:', props.collectionInfo);
    ElMessage({
      message: '缺少基地名称信息，无法保存',
      type: 'warning'
    });
    return;
  }

  ElMessageBox.confirm('是否保存所有检测结果到数据库？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        let successCount = 0;
        let failCount = 0;

        // 遍历所有检测结果并保存
        for (const result of props.results!) {
          try {
            const saveData = {
              baseId: props.collectionInfo.baseId,
              plotId: props.collectionInfo.location,
              baseName: props.collectionInfo.baseName || '侯家沟', // 基地名称
              plotCode: props.collectionInfo.locationLabel || props.collectionInfo.location, // 地块编号（如"侯家沟001"）
              diseaseType: result.pestTypes, // 病虫害类型
              resultImageUrl: result.imageUrl, // 结果图
              description: `检测时间：${props.collectionInfo.collectTime}`
            };

            await addPlantResult(saveData);
            successCount++;
          } catch (error) {
            console.error('保存单个结果失败:', error);
            failCount++;
          }
        }

        if (successCount > 0) {
          // 标记为已保存
          isSaved.value = true;
          ElMessage({
            message: `成功保存 ${successCount} 条检测结果${failCount > 0 ? `，失败 ${failCount} 条` : ''}`,
            type: 'success',
            duration: 3000
          });
        } else {
          ElMessage({
            message: '保存失败，请重试',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('保存结果失败:', error);
        ElMessage({
          message: '保存失败，请重试',
          type: 'error'
        });
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消保存'
      });
    });
};

// 查询防治策略
const queryStrategies = async (index: number, chinesePestTypes: string, originalPestTypes?: string, showMessage: boolean = true) => {
  try {
    // diseaseId接口返回的pestTypes可以直接作为getStrategy接口的class参数
    const res = await getStrategy(chinesePestTypes);

    // 确保strategies数组有足够的长度
    while (strategies.value.length <= index) {
      strategies.value.push([]);
    }

    // 处理响应数据：如果res直接是数组，使用res；否则使用res.data
    const responseData = Array.isArray(res) ? res : res.data || [];
    strategies.value[index] = responseData;

    // 检查是否有有效的策略数据
    const hasValidStrategy =
      responseData && responseData.length > 0 && responseData[0] && responseData[0].strategy && Object.keys(responseData[0].strategy).length > 0;

    if (showMessage && hasValidStrategy) {
      ElMessage({
        message: `成功获取 ${chinesePestTypes} 的防治策略`,
        type: 'success',
        duration: 2000
      });
    } else if (showMessage) {
      ElMessage({
        message: `暂无 ${chinesePestTypes} 的防治策略数据`,
        type: 'warning',
        duration: 2000
      });
    }
  } catch (error: any) {
    // 确保strategies数组有足够的长度
    while (strategies.value.length <= index) {
      strategies.value.push([]);
    }

    strategies.value[index] = [];

    if (showMessage) {
      const errorMsg = error.response?.data?.message || error.message || '未知错误';
      ElMessage({
        message: `获取 ${chinesePestTypes} 防治策略失败: ${errorMsg}`,
        type: 'error',
        duration: 3000
      });
    }
  }
};

// 自动查询所有检测结果的防治策略
const autoQueryAllStrategies = async (results: identifyRgbResponseVO[]) => {
  if (!results || results.length === 0) return;

  try {
    // 清理之前的策略数据
    strategies.value = [];

    // 为每个检测结果查询策略
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.pestTypes) {
        await queryStrategies(i, result.pestTypes, result.pestTypes);
        // 添加延迟避免请求过于频繁
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  } catch (error) {
    console.error('自动查询策略失败:', error);
  }
};

// 监听props.results的变化，强制刷新图片并自动查询策略
watch(
  () => props.results,
  (newResults, oldResults) => {
    if (newResults && newResults !== oldResults) {
      // 强制刷新图片
      imageRefreshKey.value++;

      // 自动查询所有防治策略
      autoQueryAllStrategies(newResults);
    }
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
/* 自定义滚动条样式 */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: background 0.2s;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 进度条动画效果 */
@keyframes progressGlow {
  0% {
    box-shadow: 0 0 5px currentColor;
  }
  50% {
    box-shadow: 0 0 15px currentColor;
  }
  100% {
    box-shadow: 0 0 5px currentColor;
  }
}

/* 检测结果卡片悬停效果 */
.hover\:shadow-sm:hover {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 准确度数值动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-gradient-to-r {
  animation: fadeInUp 0.3s ease-out;
}

/* 图片预览弹窗层级 */
:deep(.el-image-viewer__wrapper) {
  z-index: 3000 !important;
}

/* 图片容器优化 */
.image-container {
  transition: all 0.3s ease;
}

.image-container:hover {
  transform: scale(1.02);
}

/* 悬停时的图片放大预览按钮 */
.group:hover .group-hover\\:opacity-100 {
  animation: bounceIn 0.3s ease;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 响应式布局优化 */
@media (max-width: 1024px) {
  .flex-col.lg\\:flex-row {
    flex-direction: column;
  }

  .flex-1 {
    max-width: 100% !important;
    min-width: 100% !important;
  }
}

/* 卡片阴影优化 */
.shadow-lg {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 加载动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 策略卡片优化 */
.strategy-card {
  transition: all 0.3s ease;
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.strategy-card:hover {
  box-shadow: 0 8px 25px -8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

/* 策略内容优化 */
.strategy-item {
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.strategy-item:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

/* 策略编号样式 */
.strategy-number {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 防治策略标题优化 */
.strategy-header {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
}

/* 三栏布局优化 */
@media (min-width: 1024px) {
  .grid-cols-3 > div {
    min-height: 360px;
    max-height: 480px;
  }

  .grid-cols-3 > div:nth-child(1) {
    /* 左侧图片区域 - 充分利用空间 */
    max-width: 380px;
  }

  .grid-cols-3 > div:nth-child(2) {
    /* 中间信息区域 */
    max-width: none;
  }

  .grid-cols-3 > div:nth-child(3) {
    /* 右侧建议区域 */
    min-width: 280px;
  }
}

/* 大屏优化 */
@media (min-width: 1280px) {
  .grid-cols-3 > div {
    min-height: 400px;
    max-height: 500px;
  }

  .grid-cols-3 > div:nth-child(1) {
    max-width: 420px;
  }

  .grid-cols-3 > div:nth-child(3) {
    min-width: 300px;
  }
}

/* 超大屏优化 */
@media (min-width: 1536px) {
  .grid-cols-3 > div {
    min-height: 420px;
    max-height: 520px;
  }

  .grid-cols-3 > div:nth-child(1) {
    max-width: 450px;
  }

  .grid-cols-3 > div:nth-child(3) {
    min-width: 320px;
  }
}

/* 小屏优化 */
@media (max-width: 1023px) {
  .grid-cols-1 > div {
    min-height: auto !important;
    max-height: none !important;
  }
}

/* 移动端优化 */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

/* 图片区域优化 */
@media (min-width: 1024px) {
  .grid-cols-3 > div:nth-child(1) .flex-1 {
    min-height: 300px;
    max-height: 400px;
  }
}

@media (min-width: 1280px) {
  .grid-cols-3 > div:nth-child(1) .flex-1 {
    min-height: 340px;
    max-height: 440px;
  }
}

@media (min-width: 1536px) {
  .grid-cols-3 > div:nth-child(1) .flex-1 {
    min-height: 360px;
    max-height: 460px;
  }
}

@media (max-width: 1023px) {
  .grid-cols-3 > div:nth-child(1) .flex-1 {
    min-height: 250px;
    max-height: none;
  }
}

/* 图片容器美化 */
.grid-cols-3 > div:nth-child(1) .bg-gradient-to-br {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

/* 图片悬停效果增强 */
@keyframes imageZoom {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.02);
  }
}

.group:hover img {
  animation: imageZoom 0.3s ease-out forwards;
  filter: brightness(1.05) contrast(1.02);
}

/* 图片边框优化 */
img {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 策略内容区域滚动条 */
.strategy-content::-webkit-scrollbar {
  width: 4px;
}

.strategy-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.strategy-content::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 2px;
}

.strategy-content::-webkit-scrollbar-thumb:hover {
  background: #059669;
}

/* 卡片淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}

/* 卡片网格动画优化 */
.grid .animate-fadeIn:nth-child(1) {
  animation-delay: 0ms;
}
.grid .animate-fadeIn:nth-child(2) {
  animation-delay: 50ms;
}
.grid .animate-fadeIn:nth-child(3) {
  animation-delay: 100ms;
}
.grid .animate-fadeIn:nth-child(4) {
  animation-delay: 150ms;
}
.grid .animate-fadeIn:nth-child(5) {
  animation-delay: 200ms;
}
.grid .animate-fadeIn:nth-child(6) {
  animation-delay: 250ms;
}
.grid .animate-fadeIn:nth-child(7) {
  animation-delay: 300ms;
}
.grid .animate-fadeIn:nth-child(8) {
  animation-delay: 350ms;
}
.grid .animate-fadeIn:nth-child(9) {
  animation-delay: 400ms;
}

/* 策略项卡片样式 */
.strategy-item-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.strategy-item-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px -4px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

/* 策略项卡片优化 */
.strategy-item-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.strategy-item-card:hover {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  transform: translateY(-1px);
}

/* 增强的圆形编号 */
.strategy-item-card .w-6.h-6 {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
