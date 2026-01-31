<!-- src/views/process/growth/components/DiagnosisResult.vue -->
<template>
  <el-dialog v-model="dialogVisible" :title="title" width="75%" append-to-body>
    <div v-loading="loading" class="result-container">
      <div class="result-card">
        <!-- 图片比较区域 - 仅在有诊断ID时显示 -->
        <div v-if="hasDiagnosisData" class="image-comparison">
          <div class="image-section">
            <div class="image-header">
              <h3 class="image-title">原始影像</h3>
            </div>
            <div class="image-wrapper">
              <el-image
                :src="previewOriginalImageUrl"
                :preview-src-list="[previewOriginalImageUrl, previewNdviImageUrl, previewResultImageUrl]"
                class="result-image"
              >
                <template #error>
                  <div class="image-error">
                    <i class="el-icon-picture-outline"></i>
                    <p>图片加载失败</p>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
          <div class="image-section">
            <div class="image-header">
              <h3 class="image-title">NDVI计算</h3>
            </div>
            <div class="image-wrapper">
              <el-image
                :src="previewNdviImageUrl"
                :preview-src-list="[previewNdviImageUrl, previewResultImageUrl, previewOriginalImageUrl]"
                class="result-image"
              >
                <template #error>
                  <div class="image-error">
                    <i class="el-icon-picture-outline"></i>
                    <p>图片加载失败</p>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
          <div class="image-section">
            <div class="image-header combined-header">
              <h3 class="image-title">成熟度检测结果</h3>
            </div>
            <div class="image-wrapper">
              <el-image
                :src="previewResultImageUrl"
                :preview-src-list="[previewResultImageUrl, previewOriginalImageUrl, previewNdviImageUrl]"
                class="result-image"
              >
                <template #error>
                  <div class="image-error">
                    <i class="el-icon-picture-outline"></i>
                    <p>分析结果加载失败</p>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </div>

        <div class="conclusion-section">
          <div class="indicator-grid">
            <!-- 成熟度诊断结果 -->
            <div class="indicator-section growth-diagnosis">
              <h3 class="section-title">成熟度诊断结果</h3>
              <div class="indicator-row">
                <div class="indicator-item">
                  <span class="indicator-label">
                    <el-tag :type="formData.ripenessStatus === 1 ? 'success' : 'danger'" size="large" class="custom-tag">
                      {{ formData.ripenessStatus === 1 ? '成熟' : '未成熟' }}
                    </el-tag></span
                  >
                </div>
                <div class="indicator-item button-item">
                  <div class="button-group">
                    <el-button v-if="showHarvestSuggestionResult" type="primary" size="default" @click="downloadPrescription"> 处方单下载 </el-button>
                  </div>
                </div>
              </div>
            </div>
            <!-- 采收推荐方案模块 -->
            <div class="harvest-suggestion">
              <div class="module-header">
                <h3 class="module-title">采收推荐方案</h3>
              </div>
              <div class="suggestion-section">
                <div class="suggestion-text">
                  <div class="suggestion-content" v-html="formattedHarvestSuggestion"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 隐藏的处方单组件，用于生成PDF -->
        <div v-show="showHarvestSuggestionResult" style="position: fixed; left: -9999px; top: -9999px; z-index: -1">
          <PrescriptionForm
            ref="prescriptionFormRef"
            :growth-period="'成熟期'"
            :base="getBaseLabel(formData.baseId)"
            :plot-label="getPlotLabel(formData.plotId)"
            :mature-level="formData.ripenessStatus === 1 ? '成熟' : '未成熟'"
            :weather-conditions="'晴天'"
            :variety="formData.variety"
            :disaster-situation="'无灾害'"
            :planting-area="formData.plantingArea"
          />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { getDiagnosis } from '@/views/process/growth/diagnosis/api';
import { landDictQuery, baseDictQuery } from '@/views/process/growth/api/tableDict';
import { waterFertilizerAssessment } from '@/views/process/growth/waf/api';
import { getHarvestSuggestion } from '@/views/process/maturity/utils/harvestingRecommendations';
import PrescriptionForm from '@/views/process/maturity/components/PrescriptionForm.vue';
import html2canvas from 'html2canvas';
import { queryWeather } from '@/views/process/maturity/api/index';
import jsPDF from 'jspdf';
import { getForecast } from '@/views/process/maturity/forecast/api';
import { listWarning } from '@/api/disaster/warning';
import dayjs from 'dayjs';

// 定义组件props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  diagnosisId: {
    type: [String, Number],
    default: null
  },
  // 新增的直接传入参数
  plotId: {
    type: [String, Number],
    default: null
  },
  disasterSituation: {
    type: String,
    default: '无灾害'
  },
  matureLevel: {
    type: String,
    default: '成熟'
  },
  ripenessStatus: {
    type: Number,
    default: 0
  }
});

const warningLevelMap: Record<string | number, string> = {
  0: '轻度冰雹',
  1: '中度冰雹',
  2: '重度冰雹',
  3: '极重冰雹',
  4: '轻旱',
  5: '中旱',
  6: '重旱',
  7: '极旱',
  8: '一般洪涝',
  9: '特大洪涝',
  10: '一般特大洪涝',
  11: '特别重大洪涝',
  99: '无灾害风险'
};

// 定义组件emits
const emit = defineEmits(['update:modelValue']);

// 组件内部状态
const showHarvestSuggestionResult = ref(false);
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const wfLoading = ref(false); // 水肥诊断加载状态
const formData = ref({
  id: undefined,
  baseId: undefined,
  plotId: undefined,
  diagnosisTime: undefined,
  ndviImageUrl: undefined,
  diagnosisModel: undefined,
  ripenessStatus: undefined,
  originalImageUrl: undefined,
  resultImageUrl: undefined,
  variety: undefined,
  plantingArea: undefined,
  plantingYear: undefined,
  originalImageOss: undefined
});

// 处方单组件引用
const prescriptionFormRef = ref<InstanceType<typeof PrescriptionForm> | null>(null);

// 判断是否有诊断数据（用于决定是否显示图片）
const hasDiagnosisData = computed(() => {
  return !!props.diagnosisId;
});

const title = computed(() => {
  return `${getPlotLabel(formData.value.plotId)}号成熟度诊断结果`;
});

// 字典数据
const allLandDict = ref([]);
const baseDict = ref([]);

// 计算属性
const previewOriginalImageUrl = computed(() => {
  return formData.value.originalImageUrl || '';
});

// 计算属性
const previewNdviImageUrl = computed(() => {
  return formData.value.ndviImageUrl || '';
});

const previewResultImageUrl = computed(() => {
  return formData.value.resultImageUrl || '';
});

// 响应式数据存储天气数据
const weatherData = ref([]);

// 使用普通响应式变量存储建议
const harvestSuggestion = ref('');

// 动态采收推荐建议
const fetchHarvestSuggestion = async () => {
  try {
    const res = await queryWeather();
    console.log('API响应:', res);

    if (res.code === 200) {
      // 获取7天的预报数据
      weatherData.value = res.data.forecast.forecastData.slice(0, 7);
      console.log('处理后的天气预报数据:', weatherData.value);

      // 基于天气数据生成收割建议
      const maturityLevel = formData.value.ripenessStatus === 1 ? '成熟' : '未成熟';
      const response1 = await listWarning({ pageNum: 1, pageSize: 10 });
      const disaster = response1.rows[0];
      const issueTime = dayjs(disaster.issueTime);
      const now = dayjs();
      const diffInHours = now.diff(issueTime, 'hour');
      const disasterStatus = diffInHours <= 48 ? warningLevelMap[disaster.warningLevel] : '无灾害';

      // 获取当前天气（可以是今天或未来几天的天气）
      const currentWeather = weatherData.value[0]?.weatherLabel || '';

      console.log('当前天气:', currentWeather);
      console.log('成熟度：', maturityLevel);
      console.log('灾害情况：', disasterStatus);
      console.log('7天天气', weatherData.value);
      // 生成收割建议
      const suggestion = getHarvestSuggestion(
        maturityLevel,
        currentWeather,
        disasterStatus,
        weatherData.value // 传递7天天气预报数据用于模式判断
      );
      harvestSuggestion.value = suggestion;
      console.log('生成的收割建议:', harvestSuggestion);
    } else {
      console.error('API返回错误状态码:', res.code);
    }
  } catch (error) {
    console.error('获取天气数据失败:', error);
  }
};

// 监听 formData 变化时获取建议
watch(
  () => formData.value.ripenessStatus,
  (newRipenessStatus) => {
    if (newRipenessStatus !== null && newRipenessStatus !== undefined) {
      fetchHarvestSuggestion();
    }
  },
  { immediate: true }
);

// 处理采收建议，将 <br> 后的文字标为红色
const formattedHarvestSuggestion = computed(() => {
  const suggestion = harvestSuggestion.value;
  console.log('处理前的采收建议:', suggestion);
  if (!suggestion) return '';

  // 如果包含 <br>，则将 <br> 后的内容用红色标签包裹
  if (suggestion.includes('<br>')) {
    const parts = suggestion.split('<br>');
    if (parts.length > 1) {
      // 第一部分正常显示，后面的部分用红色标签包裹，与第一行对齐
      return parts[0] + '<br>' + '<span style="color: red;">' + parts.slice(1).join('<br>') + '</span>';
    }
  }
  return suggestion;
});

const getBaseLabel = (baseCode) => {
  if (!baseCode) return '';

  const baseOption = baseDict.value.find((option) => option.value == baseCode);
  return baseOption ? baseOption.label : baseCode;
};

const getPlotLabel = (plotId) => {
  // 使用所有地块字典来获取标签
  const plotOption = allLandDict.value.find((option) => option.value == plotId);
  let label = plotOption ? plotOption.label : plotId;

  // 特殊处理：替换特定编码前缀为中文名称
  if (typeof label === 'string') {
    if (label.startsWith('hjg') && !label.startsWith('hjgn')) {
      return label.replace('hjg', '侯家沟');
    }
    if (label.startsWith('hjgn')) {
      return label.replace('hjgn', '侯家沟南');
    }
  }

  // 对于数字类型的ID，尝试在字典中查找对应的标签
  if (typeof label === 'string' && /^\d+$/.test(label)) {
    // 如果label是纯数字，再次确认是否能在字典中找到对应的标签
    const dictOption = allLandDict.value.find((option) => option.value == label);
    if (dictOption) {
      label = dictOption.label;
    }
  }

  return label;
};

/**
 * 获取诊断详情
 */
const getDiagnosisDetail = async (id) => {
  if (!id) return;

  loading.value = true;
  try {
    // console.log('获取诊断详情:', id);
    const res = await getForecast(id);
    // console.log('获取诊断详情成功:', res);
    if (res && res.data) {
      formData.value = {
        id: res.data.id,
        baseId: res.data.baseId,
        plotId: res.data.plotId,
        diagnosisTime: res.data.diagnosisTime,
        ndviImageUrl: res.data.ndviImageUrl,
        diagnosisModel: res.data.diagnosisModel,
        ripenessStatus: res.data.ripenessStatus,
        originalImageUrl: res.data.originalImageUrl,
        resultImageUrl: res.data.resultImageUrl,
        variety: res.data.variety,
        plantingArea: res.data.plantingArea,
        plantingYear: res.data.plantingYear,
        originalImageOss: res.data.originalImageOss
      };
      showHarvestSuggestionResult.value = true;
      // 在获取诊断详情后立即更新采收建议
      await fetchHarvestSuggestion();
    }
  } catch (error) {
    console.error('获取诊断详情失败:', error);
  } finally {
    loading.value = false;
  }
};

// 监听诊断ID变化
watch(
  () => [props.diagnosisId, props.plotId, props.ripenessStatus],
  ([newId, newPlotId, newRipenessStatus]) => {
    if (newId) {
      getDiagnosisDetail(newId);
    } else if (newPlotId && newRipenessStatus !== null && newRipenessStatus !== undefined) {
      // 如果没有诊断ID但有直接传入的参数，则使用这些参数
      formData.value = {
        id: undefined,
        baseId: undefined,
        plotId: newPlotId,
        diagnosisTime: undefined,
        ndviImageUrl: undefined,
        diagnosisModel: undefined,
        ripenessStatus: newRipenessStatus,
        originalImageUrl: undefined,
        resultImageUrl: undefined,
        variety: undefined,
        plantingArea: undefined,
        plantingYear: undefined,
        originalImageOss: undefined
      };
      // 有数据时显示处方单组件
      showHarvestSuggestionResult.value = true;
    } else {
      // 重置表单数据
      formData.value = {
        id: undefined,
        baseId: undefined,
        plotId: undefined,
        diagnosisTime: undefined,
        ndviImageUrl: undefined,
        diagnosisModel: undefined,
        ripenessStatus: undefined,
        originalImageUrl: undefined,
        resultImageUrl: undefined,
        variety: undefined,
        plantingArea: undefined,
        plantingYear: undefined,
        originalImageOss: undefined
      };
      // 无数据时隐藏处方单组件
      showHarvestSuggestionResult.value = false;
    }
  },
  { immediate: true }
);

/**
 * 基地、地块字典
 */
const getDicts = async () => {
  // 获取基地字典
  try {
    const res = await baseDictQuery();
    baseDict.value =
      res.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];
  } catch (error) {
    console.error('获取基地字典失败:', error);
    baseDict.value = [];
  }

  // 初始化时获取所有地块数据
  try {
    const res = await landDictQuery();
    allLandDict.value =
      res.rows?.map((item) => ({
        value: String(item.value),
        label: String(item.label)
      })) || [];
  } catch (error) {
    console.error('获取地块字典失败:', error);
    allLandDict.value = [];
  }
};

watch(dialogVisible, (newVal) => {
  if (!newVal) {
    showHarvestSuggestionResult.value = false;
  }
});

// 组件挂载时加载字典数据
getDicts();

// 处方单下载功能
const downloadPrescription = async () => {
  if (!prescriptionFormRef.value) {
    console.error('处方单组件未找到');
    return;
  }

  // 正确获取处方单元素的方式
  const element = prescriptionFormRef.value.prescriptionRef;
  if (!element) {
    console.error('处方单内容未找到');
    return;
  }

  // 检查元素是否可见和有内容
  if (!element.offsetHeight || !element.offsetWidth) {
    console.error('处方单内容为空或不可见');
    proxy?.$modal.msgError('处方单内容为空，无法生成PDF');
    return;
  }

  try {
    // 使用html2canvas截图
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff'
    });

    // 检查canvas是否有效
    if (!canvas.width || !canvas.height) {
      console.error('canvas尺寸无效');
      proxy?.$modal.msgError('无法生成处方单图像');
      return;
    }

    // 创建PDF (A4尺寸: 210mm x 297mm)
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 计算图像在PDF中的尺寸，添加保护措施
    const imgWidth = 210; // A4宽度
    const pageHeight = 297; // A4高度

    // 确保计算结果有效，添加更多保护措施
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    console.log('canvas.height:', canvas.height, 'canvas.width:', canvas.width);
    console.log('计算的imgHeight:', imgHeight);

    // 检查并修复NaN或无效值
    if (isNaN(imgHeight) || imgHeight <= 0 || !isFinite(imgHeight)) {
      console.warn('imgHeight无效，使用默认值');
      imgHeight = pageHeight;
    }

    // 确保所有坐标参数有效
    const x = 0;
    const y = 0;
    const width = Math.max(1, imgWidth); // 确保至少为1
    const height = Math.max(1, Math.min(imgHeight, pageHeight)); // 确保在有效范围内

    // 只有当内容高度超过一页时才分页
    if (imgHeight > pageHeight) {
      pdf.addImage(imgData, 'PNG', x, y, width, height);
      let heightLeft = imgHeight - pageHeight;

      // 如果内容高度超过一页，则添加新页面
      while (heightLeft > 0) {
        pdf.addPage();
        const currentPageHeight = Math.min(heightLeft, pageHeight);
        pdf.addImage(imgData, 'PNG', x, y, width, Math.max(1, currentPageHeight));
        heightLeft -= pageHeight;
      }
    } else {
      // // 内容未超过一页，居中显示
      // const yOffset = Math.max(0, (pageHeight - imgHeight) / 2);
      // // 确保yOffset是有效值
      // const validYOffset = isNaN(yOffset) || !isFinite(yOffset) ? 0 : yOffset;
      // pdf.addImage(imgData, 'PNG', x, validYOffset, width, height);
      // 内容未超过一页，设置上边距 10mm
      const topPadding = 10; // 你想要多少就改多少（单位是 mm）
      pdf.addImage(imgData, 'PNG', 0, topPadding, width, height);
    }

    // 生成文件名并下载
    const plotLabel = getPlotLabel(formData.value.plotId);
    pdf.save(`${plotLabel}号成熟度诊断处方单.pdf`);
  } catch (error) {
    console.error('下载处方单失败:', error);
    proxy?.$modal.msgError('下载处方单失败: ' + error.message);
  }
};
</script>

<style scoped>
.result-container {
  padding: 10px;
  margin: 0 auto;
}

.result-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.image-comparison {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
}

.image-section {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.image-header {
  background: #f5f7fa;
  padding: 10px;
  font-size: 16px;
}

.image-title {
  margin: 0;
  text-align: center;
}

.image-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  min-height: 400px;
}

.result-image {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.image-error {
  color: #909399;
  text-align: center;
}

.conclusion-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.indicator-grid {
  width: 100%;
}

.indicator-section {
  margin-bottom: 20px;
}

.section-title {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  color: #409eff;
  font-weight: 500;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.indicator-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.indicator-item.button-item {
  grid-column: 4 / 5; /* 放到第 4 列 */
  justify-self: end; /* 靠右 */
}

.indicator-item {
  display: flex;
  align-items: center;
  min-width: 0;
}

.button-item {
  justify-content: center;
}

.indicator-label {
  font-weight: bold;
  font-size: 14px;
  color: #606266;
  width: 90px;
  text-align: right;
  flex-shrink: 0;
}

.custom-tag {
  font-size: 14px;
  padding: 4px 8px;
  height: auto;
  width: 80px;
  text-align: center;
}

/* 水肥监测结果模块 */
.water-fertilizer-status {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-title {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  color: #409eff;
  font-weight: 500;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

/* 指标网格布局 */
.indicators-grid {
  display: flex;
  flex-direction: column;
}

.four-column-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.indicator-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-label {
  font-weight: bold;
  font-size: 14px;
  color: #606266;
  min-width: 100px;
  text-align: left;
}

.custom-tag {
  font-size: 14px;
  padding: 4px 8px;
  height: auto;
  width: auto;
  min-width: 80px;
}

.highlight-tag {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 采收建议模块 */
.harvest-suggestion {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.suggestion-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-line;
}

.suggestion-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.suggestion-content {
  text-indent: 2em;
}

.growth-diagnosis {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.water-fertilizer-diagnosis-result {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.button-group {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.button-item {
  display: flex;
  justify-content: flex-end;
}
</style>
