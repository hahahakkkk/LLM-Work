<template>
  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
    <!-- 模型配置 -->
    <el-card>
      <template #header>
        <div class="card-header flex flex-row items-center gap-2">
          <el-icon class="text-white" :size="14"><Setting /></el-icon>
          <span>模型配置</span>
        </div>
      </template>
      <div class="flex flex-col">
        <el-form v-if="!modelsLoading" label-width="100px">
          <el-form-item label="选择模型">
            <el-select v-model="currentModelIndex" placeholder="请选择模型类型">
              <el-option v-for="(model, index) in models" :key="index" :label="model.modelName" :value="index" />
            </el-select>
          </el-form-item>
        </el-form>
        <el-alert :title="currentModel?.modelName" :description="currentModel?.description" type="success" show-icon :closable="false" />
      </div>
    </el-card>

    <!-- 历史检测记录 -->
    <el-card>
      <template #header>
        <div class="card-header flex flex-row items-center gap-2">
          <el-icon class="text-white" :size="14"><Document /></el-icon>
          <span>历史检测记录</span>
        </div>
      </template>
      <div class="space-y-1">
        <div class="grid grid-cols-3 gap-1">
          <div class="bg-white rounded-lg p-1 border border-emerald-100 text-center">
            <div class="text-base font-bold text-emerald-600">{{ areaDetectionStats.total }}</div>
            <div class="text-xs text-gray-600">总数</div>
          </div>
          <div class="bg-white rounded-lg p-1 border border-blue-100 text-center">
            <div class="text-base font-bold text-blue-600">{{ areaDetectionStats.thisWeek }}</div>
            <div class="text-xs text-gray-600">本周</div>
          </div>
          <div class="bg-white rounded-lg p-1 border border-purple-100 text-center">
            <div class="text-base font-bold text-purple-600">{{ areaDetectionStats.today }}</div>
            <div class="text-xs text-gray-600">今日</div>
          </div>
        </div>
        <el-button type="success" class="w-full font-semibold" style="height: 32px; border-radius: 8px; font-size: 12px" @click="goToHistoryRecords">
          <template #icon>
            <el-icon class="text-sm"><View /></el-icon>
          </template>
          查看全部历史记录
        </el-button>
      </div>
    </el-card>

    <!-- 数据采集信息 -->
    <el-card v-if="!showResult">
      <template #header>
        <div class="card-header flex flex-row items-center gap-2">
          <el-icon class="text-white" :size="14"><Location /></el-icon>
          <span>数据采集信息</span>
        </div>
      </template>
      <el-form :model="collectionInfo" label-width="80px" size="small" label-position="left">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <el-form-item label="地块名称" required class="m-0">
            <el-select v-model="collectionInfo.farmlandId" placeholder="请选择地块名称" filterable style="width: 100%" :loading="farmlandsLoading">
              <el-option v-for="(farmland, index) in farmlands" :key="index" :label="farmland.plotName" :value="farmland.plotId">
                <div class="flex items-center justify-between">
                  <span>{{ farmland.plotName }}</span>
                  <span v-if="farmland.area" class="text-xs text-gray-400 ml-2">{{ farmland.area }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="采集时间" required class="m-0">
            <el-date-picker
              v-model="collectionInfo.collectTime"
              type="datetime"
              placeholder="选择采集时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              :disabled-date="disabledDate"
            />
          </el-form-item>
        </div>
      </el-form>
      <div class="flex flex-col gap-2 items-center">
        <el-steps class="w-3/4" :active="currentStep" finish-status="success">
          <el-step title="上传 RGB 图像" />
          <el-step title="上传 TIFF 图像" />
          <el-step title="检测" />
        </el-steps>

        <!-- TIFF 图像上传 -->
        <div v-if="currentStep === 1" class="p-4 bg-white w-full rounded-lg border border-gray-200">
          <div class="flex items-center gap-2 mb-2">
            <el-icon class="text-black" :size="16"><Camera /></el-icon>
            <span class="text-sm font-semibold text-black">TIFF 图像上传</span>
            <el-tag size="small" type="warning" effect="plain">必需</el-tag>
          </div>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-white">
            <div class="flex flex-col items-center justify-center py-2">
              <el-icon class="text-black mb-2" :size="32"><Camera /></el-icon>
              <FileUpload
                :show-file-list="false"
                :file-type="['tiff', 'tif']"
                :file-size="5120"
                :limit="1"
                config-key="rsi"
                :file-list="tiffFileList"
                @update:model-value="handleTiffUploadChange"
              />
            </div>
          </div>
        </div>

        <!-- RGB 图像上传 -->
        <div v-if="currentStep === 0" class="p-4 bg-white w-full rounded-lg border border-gray-200">
          <div class="flex items-center gap-2 mb-2">
            <el-icon class="text-black" :size="16"><Camera /></el-icon>
            <span class="text-sm font-semibold text-black">RGB 图像上传</span>
            <el-tag size="small" type="warning" effect="plain">必需</el-tag>
          </div>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-white">
            <div class="flex flex-col items-center justify-center py-2">
              <el-icon class="text-black mb-2" :size="32"><Camera /></el-icon>
              <FileUpload
                :show-file-list="false"
                :file-type="['jpg', 'jpeg', 'png']"
                :file-size="1024"
                :limit="1"
                config-key="rsi"
                :file-list="rgbFileList"
                @update:model-value="handleRgbUploadChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 检测按钮 -->
      <div v-if="currentStep === 2" class="flex flex-row-reverse mt-4">
        <el-button type="primary" :loading="identifyLoading" @click="handleIdentify">检测</el-button>
      </div>
    </el-card>

    <!-- 已选择图片 -->
    <el-card v-if="!showResult">
      <template #header>
        <div class="card-header flex flex-row items-center gap-2">
          <el-icon class="text-white" :size="14"><Picture /></el-icon>
          <span>已选择图片: {{ totalFileCount }} 张</span>
        </div>
      </template>
      <div class="flex flex-row gap-2">
        <ImagePreview v-for="(image, index) in allFiles" :key="index" :src="image.url" />
      </div>
    </el-card>

    <!-- 任务状态卡片 -->
    <el-card v-if="isPolling && currentTask" class="lg:col-span-2">
      <template #header>
        <div class="card-header flex flex-row items-center gap-2">
          <el-icon class="text-white" :size="14"><Loading /></el-icon>
          <span>任务处理中</span>
        </div>
      </template>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">任务 ID:</span>
          <span class="font-mono text-sm">{{ currentTask.taskId }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">状态:</span>
          <el-tag :type="currentTask.status === 'completed' ? 'success' : currentTask.status === 'failed' ? 'danger' : 'warning'">
            {{ getStatusText(currentTask.status) }}
          </el-tag>
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">处理进度:</span>
            <span class="text-sm font-semibold">{{ currentTask.progress }}%</span>
          </div>
          <el-progress :percentage="currentTask.progress" :status="currentTask.status === 'completed' ? 'success' : undefined" />
        </div>
        <div v-if="currentTask.message" class="text-sm text-gray-600">
          <el-icon><InfoFilled /></el-icon>
          {{ currentTask.message }}
        </div>
      </div>
    </el-card>

    <!-- 检测结果展示 -->
    <template v-if="showResult && displayInfo">
      <!-- 基本信息 -->
      <el-card class="lg:col-span-2">
        <template #header>
          <div class="card-header flex flex-row items-center justify-between">
            <div class="flex items-center gap-2">
              <el-icon class="text-white" :size="14"><SuccessFilled /></el-icon>
              <span>检测结果</span>
            </div>
            <el-button type="primary" size="small" @click="handleBackToUpload">返回上传</el-button>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 地块信息 -->
          <div class="info-card">
            <div class="flex items-center gap-2">
              <el-icon class="text-blue-500" :size="20"><MapLocation /></el-icon>
              <h4 class="text-sm my-2 font-semibold">地块信息</h4>
            </div>
            <p class="text-xs text-gray-600 my-1">基地: {{ displayInfo.baseName }}</p>
            <p class="text-xs text-gray-600 my-1">地块: {{ displayInfo.plotName }}</p>
            <p class="text-xs text-gray-500 my-1">
              <el-icon><Location /></el-icon>
              {{ displayInfo.longitude.toFixed(6) }}, {{ displayInfo.latitude.toFixed(6) }}
            </p>
          </div>

          <!-- 检测信息 -->
          <div class="info-card">
            <div class="flex items-center gap-2">
              <el-icon class="text-green-500" :size="20"><DocumentChecked /></el-icon>
              <h4 class="text-sm my-2 font-semibold">检测信息</h4>
            </div>
            <p class="text-xs text-gray-600 my-1">任务 ID: {{ displayInfo.taskId }}</p>
            <p class="text-xs text-gray-600 my-1">检测时间: {{ displayInfo.detectionTime }}</p>
          </div>

          <!-- 检测状态 -->
          <div class="info-card">
            <div class="flex items-center gap-2">
              <el-icon class="text-orange-500" :size="20"><Clock /></el-icon>
              <h4 class="text-sm my-2 font-semibold">检测状态</h4>
            </div>
            <p class="text-xs text-gray-600 my-1">
              等级: <el-tag size="small" :type="detectionStats.levelType">{{ displayInfo.level }}</el-tag>
            </p>
            <p class="text-xs text-gray-600 my-1">发病率: {{ displayInfo.incidence.toFixed(2) }}%</p>
          </div>
        </div>
      </el-card>

      <!-- 统计信息 -->
      <el-card class="space-y-4">
        <template #header>
          <div class="card-header flex flex-row items-center gap-2">
            <el-icon class="text-white" :size="14"><DataAnalysis /></el-icon>
            <span>统计信息</span>
          </div>
        </template>
        <div class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
          <!-- 发病率环形图 -->
          <div class="flex flex-col items-center justify-center p-4">
            <div class="relative w-32 h-32">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <!-- 背景圆 -->
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="12" />
                <!-- 进度圆 -->
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  :stroke="detectionStats.incidenceRate >= 25 ? '#ef4444' : detectionStats.incidenceRate >= 5 ? '#f59e0b' : '#10b981'"
                  stroke-width="12"
                  :stroke-dasharray="`${detectionStats.incidenceRate * 3.14} 314`"
                  stroke-linecap="round"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-bold">{{ detectionStats.incidenceRate.toFixed(1) }}%</span>
                <span class="text-xs text-gray-500">发病率</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mt-4 w-full">
              <div class="text-center">
                <div class="text-lg font-semibold text-red-500">{{ detectionStats.incidenceRate.toFixed(1) }}%</div>
                <div class="text-xs text-gray-600">发病区域</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold text-green-500">{{ detectionStats.healthyRate.toFixed(1) }}%</div>
                <div class="text-xs text-gray-600">健康区域</div>
              </div>
            </div>
          </div>

          <!-- 结论 -->
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 class="text-sm font-semibold mb-2 flex items-center gap-1">
              <el-icon><InfoFilled /></el-icon>
              检测结论
            </h5>
            <p class="text-sm text-gray-700">{{ displayInfo.conclusion }}</p>
          </div>
        </div>
      </el-card>

      <!-- 防治措施 -->
      <el-card v-if="formattedMeasures.length > 0">
        <template #header>
          <div class="card-header flex flex-row items-center gap-2">
            <el-icon class="text-white" :size="14"><Tools /></el-icon>
            <span>防治措施建议</span>
          </div>
        </template>
        <div class="space-y-4">
          <div v-for="(measure, index) in formattedMeasures" :key="index" class="measure-card">
            <div class="flex items-center gap-2">
              <el-icon class="text-orange-500" :size="18"><Warning /></el-icon>
              <h4 class="text-sm my-2 font-semibold">{{ measure.type }}</h4>
            </div>
            <ul class="my-0 pl-4 space-y-2">
              <li v-for="(item, idx) in measure.items" :key="idx" class="text-sm text-gray-700 flex items-start gap-2">
                <el-icon class="mt-1 text-green-500"><Right /></el-icon>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </el-card>

      <!-- 检测结果图片和统计 -->
      <el-card class="lg:col-span-2">
        <template #header>
          <div class="card-header flex flex-row items-center gap-2">
            <el-icon class="text-white" :size="14"><DataAnalysis /></el-icon>
            <span>检测结果与分析</span>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 原始图片 -->
          <div class="result-image-wrapper">
            <el-image
              :src="displayInfo.originImageUrl"
              fit="contain"
              class="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              :preview-src-list="[displayInfo.originImageUrl]"
            >
              <template #error>
                <div class="flex items-center justify-center h-full bg-gray-100">
                  <el-icon :size="50" class="text-gray-400"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <!-- 结果图片 -->
          <div class="result-image-wrapper">
            <el-image
              :src="displayInfo.resultImageUrl"
              fit="contain"
              class="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              :preview-src-list="[displayInfo.resultImageUrl]"
            >
              <template #error>
                <div class="flex items-center justify-center h-full bg-gray-100">
                  <el-icon :size="50" class="text-gray-400"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <el-card class="lg:col-span-2">
        <div class="flex items-center justify-center gap-4">
          <el-button type="primary" @click="downloadReport">
            <el-icon><Download /></el-icon>
            下载报告
          </el-button>
          <el-button @click="handleBackToUpload">
            <el-icon><RefreshLeft /></el-icon>
            返回继续检测
          </el-button>
        </div>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import FileUpload from '@/views/four/components/fileUpload/index.vue';
import ImagePreview from '@/views/four/components/imagePreview/index.vue';
import {
  useAreaDectionStats,
  useCurrentBaseId,
  useFarmlands,
  useModels,
  useFileUpload,
  useCollectionInfo,
  useIdentifyTask,
  useTaskPolling,
  useResultDisplay,
  modelType
} from './hooks';
import type { TaskResultData } from './hooks';

const router = useRouter();

const { models, currentModelIndex, currentModel, loading: modelsLoading } = useModels(modelType.AREA);
const { data: areaDetectionStats, refetch: refetchStats } = useAreaDectionStats();
const { currentBaseId } = useCurrentBaseId();
const { farmlands, loading: farmlandsLoading } = useFarmlands(currentBaseId as Ref<string>);
const { collectionInfo, disabledDate, validateCollectionInfo, resetCollectionInfo } = useCollectionInfo();
const { tiffFileList, rgbFileList, currentStep, totalFileCount, allFiles, handleTiffUploadChange, handleRgbUploadChange, resetFiles } =
  useFileUpload();
const { loading: identifyLoading, submitTask } = useIdentifyTask();
const { currentTask, isPolling, startPolling, resetTask } = useTaskPolling();
const {
  showResult,
  detectionStats,
  displayInfo,
  formattedMeasures,
  setResultData,
  clearResult,
  downloadReport: downloadReportFromHook
} = useResultDisplay();

// 跳转至历史记录页面
const goToHistoryRecords = () => {
  router.push({
    path: '/process/pestcontrol/farmland',
    query: {
      type: 'area'
    }
  });
};

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    running: '处理中',
    completed: '已完成',
    failed: '失败'
  };
  return statusMap[status] || status;
};

// 处理识别
const handleIdentify = async () => {
  if (!validateCollectionInfo()) {
    return;
  }
  const taskId = await submitTask({
    farmlandId: collectionInfo.value.farmlandId,
    collectTime: collectionInfo.value.collectTime,
    tiffFileList: tiffFileList.value,
    rgbFileList: rgbFileList.value,
    farmlands: farmlands.value
  });
  if (taskId) {
    startPolling(taskId);
  }
};

watch(
  () => currentTask.value?.status,
  (status) => {
    if (status === 'completed' && currentTask.value) {
      // 任务结果中可能缺少基地/地块ID，这里用已选地块信息补齐
      const selectedFarmland = farmlands.value.find((f) => f.plotId === collectionInfo.value.farmlandId);
      const enrichedTask: TaskResultData = {
        ...currentTask.value,
        baseId: selectedFarmland?.baseId ?? currentTask.value.baseId,
        plotId: selectedFarmland?.plotId ?? currentTask.value.plotId
      };
      setResultData(enrichedTask);
      refetchStats();
    }
  }
);

const handleBackToUpload = () => {
  clearResult();
  resetTask();
  resetFiles();
  resetCollectionInfo();
  currentStep.value = 0;
};

const downloadReport = () => {
  downloadReportFromHook();
};
</script>

<style scoped>
.card-header {
  font-weight: 600;
}

.info-card {
  padding: 0 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-image-wrapper {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.measure-card {
  padding: 16px;
  background: #fef3c7;
  border-radius: 8px;
  border: 1px solid #fbbf24;
}

.measure-card:hover {
  background: #fde68a;
}

@media (max-width: 768px) {
  .info-card {
    padding: 0 12px;
  }
}
</style>
