<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="90%" top="5vh" :close-on-click-modal="false" class="detail-dialog">
    <div v-loading="loading" class="detail-content">
      <!-- 检测信息概览 -->
      <el-card class="mb-4 shadow-md border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <el-icon class="text-white" :size="20"><InfoFilled /></el-icon>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">检测基本信息</h3>
            </div>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="info-item">
            <div class="flex items-center gap-2 mb-2">
              <el-icon class="text-blue-600"><Location /></el-icon>
              <span class="text-sm text-gray-600">区域名称</span>
            </div>
            <p class="text-base font-semibold text-gray-900">{{ `${detailData.baseName} - ${detailData.plotName}` || '-' }}</p>
          </div>

          <div class="info-item">
            <div class="flex items-center gap-2 mb-2">
              <el-icon class="text-red-600"><Warning /></el-icon>
              <span class="text-sm text-gray-600">病害类别</span>
            </div>
            <el-tag v-if="detailData.diseaseType" type="danger" size="small">{{ detailData.diseaseType }}</el-tag>
            <span v-else class="text-gray-400">-</span>
          </div>

          <div class="info-item">
            <div class="flex items-center gap-2 mb-2">
              <el-icon class="text-green-600"><DataAnalysis /></el-icon>
              <span class="text-sm text-gray-600">病害程度</span>
            </div>
            <el-tag :type="DiseaseSeverityMap[useDiseaseState(detailData.incidenceRate)].btnType" size="small">
              {{ DiseaseSeverityMap[useDiseaseState(detailData.incidenceRate)].label }}
            </el-tag>
          </div>

          <div class="info-item">
            <div class="flex items-center gap-2 mb-2">
              <el-icon class="text-purple-600"><Clock /></el-icon>
              <span class="text-sm text-gray-600">检测时间</span>
            </div>
            <p class="text-sm font-semibold text-gray-900">{{ formatTime(detailData.createTime) }}</p>
          </div>
        </div>
      </el-card>

      <!-- 图像对比展示 -->
      <el-card class="mb-4 shadow-lg border-0">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <el-icon class="text-white" :size="20"><Picture /></el-icon>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">检测结果图像对比</h3>
              <p class="text-xs text-gray-500">原始图像与检测结果对比</p>
            </div>
          </div>
        </template>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 原始图像 -->
          <div class="image-section">
            <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <el-icon class="text-blue-600"><Picture /></el-icon>
              原始全景图像
            </h4>
            <div class="image-wrapper">
              <el-image
                v-if="detailData.rgbOriginalImage"
                :src="detailData.rgbOriginalImage"
                :preview-src-list="[detailData.rgbOriginalImage]"
                fit="contain"
                class="detection-image"
                :preview-teleported="true"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon :size="60"><Picture /></el-icon>
                    <p class="mt-2">图像加载失败</p>
                  </div>
                </template>
              </el-image>
              <div v-else class="image-error">
                <el-icon :size="60"><Picture /></el-icon>
                <p class="mt-2">暂无原始图像</p>
              </div>
            </div>
          </div>

          <!-- 检测结果图像 -->
          <div class="image-section">
            <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <el-icon class="text-green-600"><DataAnalysis /></el-icon>
              检测结果图像
            </h4>
            <div class="image-wrapper border-2 border-green-400">
              <el-image
                v-if="detailData.rgbResultImage"
                :src="detailData.rgbResultImage"
                :preview-src-list="[detailData.rgbResultImage]"
                fit="contain"
                class="detection-image"
                :preview-teleported="true"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon :size="60"><Picture /></el-icon>
                    <p class="mt-2">图像加载失败</p>
                  </div>
                </template>
              </el-image>
              <div v-else class="image-error">
                <el-icon :size="60"><Picture /></el-icon>
                <p class="mt-2">暂无检测结果图像</p>
              </div>

              <!-- 图例说明 -->
              <div v-if="detailData.rgbResultImage" class="legend-overlay">
                <h5 class="text-xs font-bold text-gray-900 mb-2">图例说明</h5>
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-red-500 rounded"></div>
                    <span class="text-xs font-medium">病害区域</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-green-500 rounded"></div>
                    <span class="text-xs font-medium">健康区域</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 防治策略 TODO -->
      <!-- <el-card v-if="detailData.pestTactics" class="shadow-md border-0 bg-gradient-to-br from-amber-50 to-orange-50">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <el-icon class="text-white" :size="20"><DocumentChecked /></el-icon>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">病害防治策略</h3>
              <p class="text-xs text-gray-500">Prevention and Control Strategy</p>
            </div>
          </div>
        </template>

        <div class="p-4 bg-white rounded-lg">
          <p class="text-sm text-gray-700 leading-relaxed">{{ detailData.pestTactics }}</p>
        </div>
      </el-card> -->
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="success" icon="Download" @click="handleDownloadReport">下载报告</el-button>
        <el-button type="primary" icon="Printer" @click="handlePrint">打印</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { InfoFilled, Location, Warning, DataAnalysis, Clock, Picture, DocumentChecked } from '@element-plus/icons-vue';
import type { AreaDetectionRecord } from '../api/types';
import { DiseaseSeverityMap } from '../const';
import { useDiseaseState } from '../hooks';

interface Props {
  modelValue: boolean;
  data: AreaDetectionRecord | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  data: null
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const loading = ref(false);
const detailData = ref<AreaDetectionRecord>({} as AreaDetectionRecord);

const dialogTitle = computed(() => {
  return `病害区域检测详情 - ${detailData.value.baseName + '-' + detailData.value.plotName || '未命名区域'}`;
});

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    if (newData) {
      detailData.value = { ...newData };
    }
  },
  { immediate: true }
);

/** 获取病害程度标签类型 */
const getSeverityType = (version: number) => {
  if (version >= 3) return 'danger';
  if (version >= 2) return 'warning';
  return 'success';
};

/** 获取病害程度标签文本 */
const getSeverityLabel = (version: number) => {
  if (version >= 3) return '重度';
  if (version >= 2) return '中度';
  return '轻度';
};

/** 格式化时间 */
const formatTime = (time: string) => {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/** 下载报告 */
const handleDownloadReport = () => {
  ElMessage.success('报告下载功能开发中...');
  // TODO: 实现下载报告功能
};

/** 打印 */
const handlePrint = () => {
  window.print();
};
</script>

<style lang="scss" scoped>
.detail-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 75vh;
    overflow-y: auto;
  }
}

.detail-content {
  .info-item {
    padding: 16px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .image-section {
    .image-wrapper {
      position: relative;
      background: #f9fafb;
      border-radius: 8px;
      overflow: hidden;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e5e7eb;

      .detection-image {
        width: 100%;
        height: 100%;
        max-height: 500px;
      }

      .image-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        padding: 40px;
      }

      .legend-overlay {
        position: absolute;
        top: 12px;
        left: 12px;
        background: rgba(255, 255, 255, 0.95);
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
      }
    }
  }
}
</style>
