<template>
  <el-dialog v-model="visible" title="检测结果报告" width="70%" :close-on-click-modal="false" class="detail-report-dialog">
    <!-- 报告容器 -->
    <div class="bg-gray-50 shadow-lg rounded-lg overflow-hidden">
      <!-- 报告内容 -->
      <!-- 分析报告文字 -->
      <div class="analysis-report-card">
        <!-- <h3 class="report-title">检测分析报告</h3> -->
        <div class="report-content">
          <p class="report-text">
            {{
              detectionData.notes ||
              '经过专业数字化管理技术系统检测，检查的地块总面积为：3.11 亩，其中出苗区域面积数为：2.43 亩，经计算出苗率为：78%，质量等级判定为"轻度缺苗"。'
            }}
          </p>
          <p class="report-suggestion">
            <span class="font-bold">建议措施：</span>{{ detectionData.recommendedAction || '根据相关标准进行评价，此区域检测全部符合标准。' }}
          </p>
        </div>
      </div>
      <!-- 检测信息表格 -->
      <div class="mb-8">
        <table class="report-table">
          <tbody>
            <tr>
              <td class="label-cell">检测编号</td>
              <td class="value-cell">{{ detectionData.id || '地块-检察000' }}</td>
            </tr>
            <tr>
              <td class="label-cell">检测时间</td>
              <td class="value-cell">{{ detectionData.detectionDate || '2025/7/21' }}</td>
            </tr>
            <tr>
              <td class="label-cell">检测基地</td>
              <td class="value-cell">{{ detectionData.baseName || '台子数字化农业试验基地' }}</td>
            </tr>
            <tr>
              <td class="label-cell">地块位置</td>
              <td class="value-cell">{{ detectionData.landCode || '(110.376224.37.766951)' }}</td>
            </tr>
            <tr>
              <td class="label-cell">出苗率</td>
              <td class="value-cell">
                <span class="font-bold text-green-600">{{ detectionData.completionRate || '75' }}%</span>
              </td>
            </tr>
            <tr>
              <td class="label-cell">质量等级</td>
              <td class="value-cell">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {{ detectionData.qualityLevel || '低度缺苗' }}
                </span>
              </td>
            </tr>
            <tr>
              <td class="label-cell">出苗数量</td>
              <td class="value-cell">{{ detectionData.totalSeedlings || '536' }} 株</td>
            </tr>
            <tr>
              <td class="label-cell">平均密度</td>
              <td class="value-cell">{{ detectionData.avgDensity || '66.4' }} 株/亩</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 检测图像区域 -->
      <div v-if="detectionData.resultImageUrl && detectionData.qualityLevel !== '正常'" class="mb-8">
        <div class="bg-black rounded-lg p-6 flex justify-center items-center detection-image-container min-h-96">
          <div class="max-w-full max-h-full">
            <img :src="detectionData.resultImageUrl" alt="检测结果图像" class="max-w-full max-h-full object-contain rounded" @error="onImageError" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-center space-x-4">
        <el-button type="primary" @click="downloadReport"> 下载报告 </el-button>
        <el-button @click="handleClose"> 关闭窗口 </el-button>
      </div>
    </template>
  </el-dialog>
</template>
!
<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import ImgPreview from '@/views/four/components/imagePreview.vue';
// 导入API函数
import { downloadErReport } from './api/index';
import type { ErReportRequest } from './api/index';

// 定义组件名
defineOptions({
  name: 'DetailInfo'
});

// Props定义
interface Props {
  modelValue: boolean;
  detectionData?: any;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  detectionData: () => ({})
});

// Emits定义
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
};

// 图片加载错误处理
const onImageError = () => {
  console.log('图片加载失败');
  // 可以设置默认图片或显示错误信息
};

// 构建报告请求体
const buildReportPayload = (): ErReportRequest | null => {
  const d = props.detectionData || {};

  const baseId = d.baseId ?? d.base_id;
  const plotId = d.plotId ?? d.plot_id;

  if (baseId === undefined || baseId === null || plotId === undefined || plotId === null) {
    ElMessage.warning('缺少基地或地块信息，无法生成报告');
    return null;
  }

  const createTime = d.createTime || d.detectionDate || new Date().toISOString();
  const toNumber = (value: any) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  return {
    baseId,
    plotId,
    baseName: d.baseName || d.base_name || '',
    plotName: d.plotName || d.landCode || '',
    inspectorUser: d.inspectorUser || d.inspector || '',
    longitude: toNumber(d.longitude ?? d.plotLongitude),
    latitude: toNumber(d.latitude ?? d.plotLatitude),
    emergenceRate: Number(d.completionRate ?? d.emergenceRate ?? 0),
    totalSeedlings: Number(d.totalSeedlings ?? 0),
    plotArea: Number(d.plotArea ?? d.landAreaMu ?? 0),
    seedlingDensity: Number(d.seedlingDensity ?? d.avgDensity ?? 0),
    originImage: d.originImage || d.originImageUrl || '',
    resultImage: d.resultImage || d.resultImageUrl || '',
    createTime
  };
};

// 下载报告
const downloadReport = async () => {
  try {
    const payload = buildReportPayload();
    if (!payload) return;

    const blob = await downloadErReport(payload);

    if (!(blob instanceof Blob)) {
      throw new Error('下载失败：响应数据不是有效的 Blob');
    }

    if (blob.size === 0) {
      throw new Error('下载的文件为空，请检查后端数据');
    }

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `EmergenceRate_Report_${payload.plotName || payload.plotId}.pdf`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    ElMessage.success('报告下载成功');
  } catch (error: any) {
    console.error('下载失败:', error);
    ElMessage.error(`报告下载失败: ${error.message || '请稍后重试'}`);
  }
};

// 打印报告
const printReport = () => {
  // 实现打印功能
  window.print();
};

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
};
</script>

<style scoped>
/* 报告容器 */
.report-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0;
}

/* 弹窗样式 */
.detail-report-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.detail-report-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 24px;
  border-bottom: none;
}

.detail-report-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.detail-report-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 20px;
}

.detail-report-dialog :deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #f0f0f0;
}

.detail-report-dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-report-dialog :deep(.el-dialog__footer) {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 16px 24px;
}

/* 表格样式增强 */
.report-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 14px;
}

.report-table td {
  border: 1px solid #d1d5db;
  padding: 8px 16px;
}

.report-table .label-cell {
  background-color: #f9fafb;
  font-weight: 500;
  color: #374151;
  border-right: 1px solid #d1d5db;
  width: 33.333333%;
}

.report-table .value-cell {
  color: #111827;
}

/* 分析报告卡片样式 */
.analysis-report-card {
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 16px 24px;
  margin-bottom: 16px;
}

.report-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.report-content {
  color: #374151;
  line-height: 1.6;
}

.report-text {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.report-suggestion {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #374151;
}

/* 图像容器样式 */
.detection-image-container {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .detail-report-dialog :deep(.el-dialog) {
    width: 85% !important;
  }
}

@media (max-width: 768px) {
  .detail-report-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 0 auto;
  }

  .detail-report-dialog :deep(.el-dialog__header) {
    padding: 16px 20px;
  }

  .detail-report-dialog :deep(.el-dialog__title) {
    font-size: 16px;
  }

  .report-table {
    font-size: 12px;
  }

  .report-table td {
    padding: 8px 12px;
  }

  .detection-image-container {
    min-height: 300px !important;
  }
}

@media (max-width: 480px) {
  .detail-report-dialog :deep(.el-dialog) {
    width: 98% !important;
  }

  .report-table {
    font-size: 11px;
  }

  .report-table td {
    padding: 6px 8px;
  }
}
</style>
