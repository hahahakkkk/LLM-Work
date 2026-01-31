<!-- src/views/process/growth/components/DiagnosisResult.vue -->
<template>
  <el-dialog v-model="dialogVisible" :title="title" width="80%" append-to-body>
    <div v-loading="loading" class="result-container">
      <div class="result-card">
        <!-- 图片比较区域 - 仅在有诊断ID时显示 -->
        <div v-if="hasDiagnosisData" class="image-comparison">
          <div class="image-section">
            <div class="image-header">
              <h3 class="image-title">{{ getPlotLabel(formData.plotId) }}号</h3>
            </div>
            <div class="image-wrapper">
              <el-image
                :src="previewOriginalImageUrl"
                :preview-src-list="[previewOriginalImageUrl, previewLaiInversionImageUrl, previewSpadInversionImageUrl]"
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
              <h3 class="image-title">LAI反演结果</h3>
            </div>
            <div class="image-wrapper">
              <el-image
                :src="previewLaiInversionImageUrl"
                :preview-src-list="[previewOriginalImageUrl, previewLaiInversionImageUrl, previewSpadInversionImageUrl]"
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
              <h3 class="image-title">SPAD反演结果</h3>
            </div>
            <div class="image-wrapper">
              <el-image
                :src="previewSpadInversionImageUrl"
                :preview-src-list="[previewOriginalImageUrl, previewLaiInversionImageUrl, previewSpadInversionImageUrl]"
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
          <div class="growth-metrics">
            <div class="indicator-group">
              <div class="indicator-item">
                <span class="indicator-label">长势等级：</span>
                <el-tag :type="getGrowthLevelType(formData.growthLevel)" size="large" class="custom-tag">
                  {{ formData.growthLevel }}
                </el-tag>
              </div>
              <div class="indicator-item">
                <span class="indicator-label">LAI值：</span>
                <el-tag size="large" class="custom-tag">
                  {{ formData.laiPrediction }}
                </el-tag>
              </div>
              <div class="indicator-item">
                <span class="indicator-label">SPAD值：</span>
                <el-tag size="large" class="custom-tag"> {{ formData.spadPrediction }} </el-tag>
              </div>
            </div>
          </div>
          <div class="water-fertilizer-button-container">
            <el-button v-if="showWaterFertilizerResult" type="primary" size="default" @click="downloadPrescription"> 处方单下载 </el-button>
          </div>
        </div>

        <!-- 水肥诊断结果 -->
        <div v-if="showWaterFertilizerResult" class="water-fertilizer-diagnosis">
          <!-- 水肥监测结果模块 -->
          <div class="water-fertilizer-monitor">
            <h2 class="module-title"></h2>
          </div>
          <div class="water-fertilizer-status">
            <div class="module-header">
              <h3 class="module-title">水肥亏缺诊断结果</h3>
            </div>
            <div class="indicators-grid">
              <!-- 4列显示区域 -->
              <div class="four-column-grid">
                <div class="indicator-item">
                  <span class="indicator-label">缺水等级：</span>
                  <el-tag :type="getWaterDeficitType(wfResult.waterLevel)" size="large" class="custom-tag highlight-tag">
                    {{ wfResult.waterLevel }}
                  </el-tag>
                </div>
                <div class="indicator-item">
                  <span class="indicator-label">缺肥等级：</span>
                  <el-tag :type="getFertilizerDeficitType(wfResult.nutrientLevel)" size="large" class="custom-tag highlight-tag">
                    {{ wfResult.nutrientLevel }}
                  </el-tag>
                </div>
                <div class="indicator-item">
                  <span class="indicator-label">灌溉上限值：</span>
                  <el-tag size="large" class="custom-tag"> {{ wfResult.upperReal }} </el-tag>
                </div>
                <div class="indicator-item">
                  <span class="indicator-label">灌溉下限值：</span>
                  <el-tag size="large" class="custom-tag"> {{ wfResult.lowerReal }} </el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 水肥补给方案模块 -->
          <div class="harvest-suggestion">
            <div class="module-header">
              <h3 class="module-title">水肥补给方案</h3>
            </div>
            <div class="suggestion-section">
              <div class="suggestion-text">
                <div class="suggestion-content">{{ computedWaterSuggestion }}</div>
              </div>
              <div class="suggestion-text">
                <div class="suggestion-content">{{ computedFertilizerSuggestion }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 隐藏的处方单组件，用于生成PDF -->
        <div v-show="showWaterFertilizerResult" style="position: fixed; left: -9999px; top: -9999px; z-index: -1">
          <PrescriptionForm
            ref="prescriptionFormRef"
            :growth-period="formData.growthPeriod"
            :base="getBaseLabel(formData.baseName)"
            :lai="parseFloat(formData.laiPrediction)"
            :spad="parseFloat(formData.spadPrediction)"
            :growth-level="formData.growthLevel"
            :fertilizer-deficit-level="wfResult.nutrientLevel"
            :water-deficit-level="wfResult.waterLevel"
            :millet-water-trait="'中等'"
            :field-water-info="0.205"
            :soil-moisture-level="'轻旱'"
            :irrigation-upper-limit="wfResult.upperReal"
            :irrigation-lower-limit="wfResult.lowerReal"
            :irrigation-water-amount="wfResult.applyM3PerMu.toString()"
            :plot-label="getPlotLabel(formData.plotId)"
          />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { getDiagnosis } from '@/views/process/growth/diagnosis/api';
import { landDictQuery, baseDictQuery } from '@/views/process/growth/api/tableDict';
import { waterFertilizerAssessment } from '@/views/process/growth/waf/api';
import { getWaterSuggestion, getFertilizerSuggestion } from '@/views/process/growth/utils/waterFertilizerSuggestion';
import PrescriptionForm from '@/views/process/growth/components/PrescriptionForm.vue';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getCurrentInstance } from 'vue';
// 获取当前实例，以便使用proxy
const { proxy } = getCurrentInstance() as any;

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
  growthPeriod: {
    type: String,
    default: ''
  },
  lai: {
    type: [String, Number],
    default: null
  },
  spad: {
    type: [String, Number],
    default: null
  },
  growthLevel: {
    type: String,
    default: ''
  }
});

// 定义组件emits
const emit = defineEmits(['update:modelValue']);

// 组件内部状态
const showWaterFertilizerResult = ref(false);
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 添加一个标志来跟踪组件是否已完全挂载
const isComponentMounted = ref(false);

const loading = ref(false);
const wfLoading = ref(false); // 水肥诊断加载状态
const hasAutoPredicted = ref(false); // 添加一个标志，防止重复自动预测
const isWfProcessing = ref(false); // 添加防重复提交标志
const isWfRequestPending = ref(false); // 添加请求状态标志
const formData = ref({
  id: undefined,
  baseName: '侯家沟基地', // 默认基地名称
  plotId: undefined,
  originalImage: undefined,
  growthPeriod: undefined,
  diagnosisTime: undefined,
  diagnosisModel: undefined,
  laiInversionImage: undefined,
  spadInversionImage: undefined,
  laiPrediction: undefined,
  spadPrediction: undefined,
  growthLevel: undefined,
  isPredicted: undefined,
  remark: undefined
});

// 水肥诊断结果数据
const wfResult = ref({
  waterLevel: '',
  nutrientLevel: '',
  applyM3PerMu: 0,
  upperReal: 0,
  lowerReal: 0,
  growthPeriod: '' // 添加生长时期属性
});

// 处方单组件引用
const prescriptionFormRef = ref<InstanceType<typeof PrescriptionForm> | null>(null);

// 判断是否有诊断数据（用于决定是否显示图片）
const hasDiagnosisData = computed(() => {
  return !!props.diagnosisId;
});

const title = computed(() => {
  return `${getPlotLabel(formData.value.plotId)}号诊断详情`;
});

// 字典数据
const allLandDict = ref([]);
const baseDict = ref([]);

// 计算属性
const previewOriginalImageUrl = computed(() => {
  return formData.value.originalImage || '';
});

const previewLaiInversionImageUrl = computed(() => {
  return formData.value.laiInversionImage || '';
});

const previewSpadInversionImageUrl = computed(() => {
  return formData.value.spadInversionImage || '';
});

// 标签类型判断方法
const getWaterDeficitType = (level: string) => {
  if (level.includes('重度')) return 'danger';
  if (level.includes('中度')) return 'warning';
  return 'info';
};

const getFertilizerDeficitType = (level: string) => {
  if (level.includes('重度')) return 'danger';
  if (level.includes('中度')) return 'warning';
  return 'info';
};

// 动态计算补水建议
const computedWaterSuggestion = computed(() => {
  return getWaterSuggestion(wfResult.value.growthPeriod, wfResult.value.waterLevel, wfResult.value.applyM3PerMu);
});

// 动态计算补肥建议
const computedFertilizerSuggestion = computed(() => {
  return getFertilizerSuggestion(wfResult.value.growthPeriod, wfResult.value.nutrientLevel);
});

const getGrowthLevelType = (level) => {
  if (level === '良好') return 'success';
  if (level === '正常') return 'info';
  return 'danger';
};

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
    const res = await getDiagnosis(id);
    // console.log('获取诊断详情成功:', res);
    if (res) {
      formData.value = {
        baseName: res.data.baseName,
        diagnosisModel: res.data.diagnosisModel,
        diagnosisTime: res.data.diagnosisTime,
        growthLevel: res.data.growthLevel,
        growthPeriod: convertGrowthPeriod(res.data.growthPeriod), // 转换生长期格式
        id: res.data.id,
        isPredicted: res.data.isPredicted,
        laiInversionImage: res.data.laiInversionImage,
        laiPrediction: res.data.laiPrediction,
        originalImage: res.data.originalImage,
        plotId: res.data.plotId,
        remark: res.data.remark,
        spadInversionImage: res.data.spadInversionImage,
        spadPrediction: res.data.spadPrediction
      };
    }
  } catch (error) {
    console.error('获取诊断详情失败:', error);
  } finally {
    loading.value = false;
  }
};

/**
 * 转换生长期格式
 * @param periodNum 数字形式的生长期 (1:拔节期, 2:抽穗期, 3:灌浆期)
 * @returns 中文形式的生长期
 */
const convertGrowthPeriod = (periodNum) => {
  switch (periodNum) {
    case '1':
      return '拔节期';
    case '2':
      return '抽穗期';
    case '3':
      return '灌浆期';
    default:
      return periodNum || ''; // 如果没有值则返回空字符串
  }
};

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
    showWaterFertilizerResult.value = false;
    hasAutoPredicted.value = false; // 重置自动预测标志
  }
});

// 监听诊断ID变化
watch(
  () => [props.diagnosisId, props.plotId, props.lai, props.spad, props.growthLevel],
  async ([newId, newPlotId, newLai, newSpad, newGrowthLevel]) => {
    if (newId) {
      getDiagnosisDetail(newId);
    } else if (newPlotId && newLai !== null && newSpad !== null) {
      // 如果没有诊断ID但有直接传入的参数，则使用这些参数
      // 长势等级默认为"较差"
      const growthLevelValue = newGrowthLevel || '较差';

      formData.value = {
        id: undefined,
        baseName: '侯家沟基地', // 默认基地名称
        plotId: newPlotId,
        originalImage: undefined,
        growthPeriod: props.growthPeriod || '抽穗期', // 使用传入的生长期或默认值
        diagnosisTime: undefined,
        diagnosisModel: undefined,
        laiInversionImage: undefined,
        spadInversionImage: undefined,
        laiPrediction: newLai,
        spadPrediction: newSpad,
        growthLevel: growthLevelValue,
        isPredicted: undefined,
        remark: undefined
      };

      // 直接进行水肥诊断，增加延迟确保数据完全设置完成
      hasAutoPredicted.value = true;
      // 首次加载时增加更长的延迟时间，确保所有依赖项完全初始化
      // 添加安全检查，确保变量已初始化
      const delay = isComponentMounted.value !== undefined ? (isComponentMounted.value ? 300 : 600) : 600;
      await new Promise((resolve) => setTimeout(resolve, delay));
      await showWaterFertilizerDiagnosis();
    } else {
      // 重置表单数据
      formData.value = {
        id: undefined,
        baseName: undefined,
        plotId: undefined,
        originalImage: undefined,
        growthPeriod: undefined,
        diagnosisTime: undefined,
        diagnosisModel: undefined,
        laiInversionImage: undefined,
        spadInversionImage: undefined,
        laiPrediction: undefined,
        spadPrediction: undefined,
        growthLevel: undefined,
        isPredicted: undefined,
        remark: undefined
      };
      // 重置自动预测标志
      hasAutoPredicted.value = false;
    }
  },
  { immediate: true }
);

// 组件挂载时加载字典数据
onMounted(() => {
  isComponentMounted.value = true;
  getDicts();
});

getDicts();

const showWaterFertilizerDiagnosis = async () => {
  // 添加防重复提交检查
  if (isWfProcessing.value) {
    console.log('水肥诊断已在处理中，请稍候...');
    // 确保即使在自动预测中也能正确提示
    setTimeout(() => {
      if (proxy && proxy.$modal) {
        proxy.$modal.msgWarning('水肥诊断已在处理中，请稍候...');
      } else {
        console.warn('Modal服务不可用');
      }
    }, 0);
    return;
  }

  // 检查是否所有必需的数据都已提供
  if (!formData.value.laiPrediction || !formData.value.spadPrediction || !formData.value.growthLevel) {
    setTimeout(() => {
      if (proxy && proxy.$modal) {
        proxy.$modal.msgError('缺少必要的诊断参数，无法进行水肥诊断');
      } else {
        console.error('缺少必要的诊断参数，无法进行水肥诊断');
      }
    }, 0);
    return;
  }

  // 检查依赖项是否已完全初始化
  if (!proxy || !waterFertilizerAssessment) {
    console.warn('依赖项未完全初始化，延迟执行');
    // 如果依赖项未完全初始化，则延迟执行
    setTimeout(() => {
      showWaterFertilizerDiagnosis();
    }, 200);
    return;
  }

  if (!showWaterFertilizerResult.value) {
    wfLoading.value = true;
    isWfProcessing.value = true; // 设置处理状态
    try {
      const testData = {
        lai: parseFloat(formData.value.laiPrediction.toString()),
        spadValue: parseFloat(formData.value.spadPrediction.toString()),
        growthLevel: formData.value.growthLevel
      };
      console.log('水肥测试数据:', testData);

      const res = await waterFertilizerAssessment(testData);

      const waterData = res.data.data.water_assess;
      const fertilizerData = res.data.data.fertilization_assess;
      if (res.data) {
        wfResult.value = {
          waterLevel: waterData.water_level,
          nutrientLevel: fertilizerData.deficit_level,
          applyM3PerMu: parseFloat(waterData.irrigation_amount_m3_per_mu),
          upperReal: parseFloat(waterData.upper_limit_actual),
          lowerReal: parseFloat(waterData.lower_limit_actual),
          growthPeriod: formData.value.growthPeriod // 添加生长时期属性
        };
      }
      showWaterFertilizerResult.value = true;
    } catch (error) {
      console.error('水肥诊断失败:', error);
      // 显示错误消息给用户
      setTimeout(() => {
        if (error.message.includes('请勿重复提交')) {
          if (proxy && proxy.$modal) {
            proxy.$modal.msgError('水肥诊断已在处理中，请稍候...');
          } else {
            console.error('水肥诊断已在处理中，请稍候...');
          }
        } else {
          if (proxy && proxy.$modal) {
            proxy.$modal.msgError('水肥诊断失败: ' + error.message);
          } else {
            console.error('水肥诊断失败: ' + error.message);
          }
        }
      }, 0);

      // 出错时立即重置状态，避免阻塞后续操作
      isWfProcessing.value = false;
    } finally {
      wfLoading.value = false;
      // 延迟重置处理状态，避免快速重复触发
      if (!isWfProcessing.value) {
        // 只有在没有出错时才设置延迟
        setTimeout(() => {
          isWfProcessing.value = false;
        }, 500);
      }
    }
  } else {
    showWaterFertilizerResult.value = false;
  }
};

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
      // 内容未超过一页，居中显示
      const yOffset = Math.max(0, (pageHeight - imgHeight) / 2);
      // 确保yOffset是有效值
      const validYOffset = isNaN(yOffset) || !isFinite(yOffset) ? 0 : yOffset;
      pdf.addImage(imgData, 'PNG', x, validYOffset, width, height);
    }

    // 生成文件名并下载
    const plotLabel = getPlotLabel(formData.value.plotId);
    pdf.save(`${plotLabel}号地水肥亏缺诊断处方单.pdf`);
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
  width: 98%;
  margin-left: 1.5%;
}

.indicator-group {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 60px;
  width: 70%;
}

.indicator-item {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.indicator-label {
  font-weight: bold;
  font-size: 14px;
  color: #606266;
  width: 90px;
  text-align: right;
  margin-right: 10px;
}

.custom-tag {
  font-size: 14px;
  padding: 4px 8px;
  height: auto;
  width: 80px;
  text-align: center;
}

.water-fertilizer-button-container {
  margin-left: auto;
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
</style>
