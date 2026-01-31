<template>
  <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-3">
    <!-- 左侧 -->
    <div class="flex flex-col gap-3 h-full">
      <!-- 数据上传 -->
      <el-card class="h-full">
        <template #header>
          <div class="flex items-center gap-2">
            <el-icon><Upload /></el-icon>
            <span>数据上传</span>
          </div>
        </template>
        <div class="flex flex-col gap-3">
          <!-- 左侧：采样信息表单卡片 -->
          <div class="w-[280px] flex-shrink-0" :body-style="{ padding: '12px' }">
            <el-form :model="collectionInfo" label-width="0" size="small" class="space-y-4">
              <!-- 采集地点 -->
              <div class="space-y-2">
                <div class="flex items-center gap-1.5 text-gray-700">
                  <el-icon :size="14" class="text-blue-500"><MapLocation /></el-icon>
                  <span class="text-xs font-medium">采集地点</span>
                  <span class="text-red-500 text-xs">*</span>
                </div>
                <el-select
                  v-model="collectionInfo.location"
                  placeholder="请选择采集地点"
                  style="width: 100%"
                  :loading="loadingLocations"
                  :prefix-icon="Location"
                >
                  <el-option v-for="location in availableLocations" :key="location.value" :label="location.label" :value="location.value" />
                </el-select>
              </div>

              <!-- 采集时间 -->
              <div class="space-y-2">
                <div class="flex items-center gap-1.5 text-gray-700">
                  <el-icon :size="14" class="text-green-500"><Clock /></el-icon>
                  <span class="text-xs font-medium">采集时间</span>
                  <span class="text-red-500 text-xs">*</span>
                </div>
                <el-date-picker
                  v-model="collectionInfo.collectTime"
                  type="datetime"
                  placeholder="选择采集时间"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                  :disabled-date="disabledDate"
                />
              </div>
            </el-form>
          </div>

          <!-- 右侧：图片上传区域 -->
          <div class="flex items-center gap-1.5 text-gray-700">
            <el-icon :size="14" class="text-blue-500"><Picture /></el-icon>
            <span class="text-xs font-medium">图片上传</span>
            <span class="text-red-500 text-xs">*</span>
          </div>
          <div
            :class="[
              'flex-1 flex flex-col py-4 px-4 rounded-lg border-2 border-dashed justify-center items-center select-none transition-all duration-300 bg-white shadow-sm',
              images.length >= MAX_IMAGES
                ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
            ]"
            @click="handleUploadClick"
          >
            <input
              ref="imageSelector"
              type="file"
              accept="image/png, image/jpeg"
              class="hidden"
              :disabled="images.length >= MAX_IMAGES"
              @change="handleInputChange"
            />
            <el-icon :size="32" class="text-gray-400 mb-2"><Upload /></el-icon>
            <span class="text-sm font-medium text-gray-700 mb-1">上传图片</span>
            <span class="text-xs text-gray-500 mb-2">点击上传图片（最多{{ MAX_IMAGES }}张）</span>
            <div class="text-xs text-gray-400 space-y-0.5 text-center">
              <div>支持 PNG、JPEG 格式</div>
              <div>建议图片大小不超过 10MB</div>
              <div v-if="images.length > 0" class="text-blue-500 font-medium">已选择 {{ images.length }}/{{ MAX_IMAGES }} 张</div>
            </div>

            <!-- 上传进度条 -->
            <div v-if="isProcessing" class="w-full mt-3 px-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-blue-600">处理中...</span>
                <span class="text-xs text-blue-500">{{ uploadProgress }}%</span>
              </div>
              <el-progress :percentage="uploadProgress" :stroke-width="4" color="#409eff" :show-text="false" />
            </div>
          </div>
        </div>
      </el-card>
    </div>
    <!-- 右侧 -->
    <div class="flex flex-col gap-3 w-full">
      <div
        class="relative p-4 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-300 group overflow-hidden"
      >
        <!-- 装饰性背景图案 -->
        <div
          class="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-8 translate-x-8 opacity-30 group-hover:scale-110 transition-transform duration-500"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-16 h-16 bg-green-100 rounded-full translate-y-6 -translate-x-4 opacity-40 group-hover:scale-125 transition-transform duration-500"
        ></div>

        <!-- 内容区域 -->
        <div class="relative z-10">
          <!-- 标题区域 -->
          <div class="flex items-center gap-3 mb-4">
            <div class="relative">
              <div
                class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
              >
                <el-icon class="text-white" :size="20"><Document /></el-icon>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-base font-bold text-emerald-900 m-0">病害历史检测记录</h3>
            </div>
            <el-icon class="text-emerald-400 text-lg group-hover:text-emerald-600 group-hover:translate-x-1 transition-all"><ArrowRight /></el-icon>
          </div>

          <!-- 统计信息卡片 -->
          <div class="grid grid-cols-3 gap-3 mb-4">
            <!-- 总数 -->
            <div
              class="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-emerald-100 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
            >
              <div class="text-2xl font-bold text-emerald-600 mb-1">{{ historyStats.total }}</div>
              <div class="text-xs font-medium text-gray-500">总数</div>
            </div>

            <!-- 本周 -->
            <div
              class="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-blue-100 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
            >
              <div class="text-2xl font-bold text-blue-600 mb-1">{{ historyStats.thisWeek }}</div>
              <div class="text-xs font-medium text-gray-500">本周</div>
            </div>

            <!-- 今日 -->
            <div
              class="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-purple-100 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
            >
              <div class="text-2xl font-bold text-purple-600 mb-1">{{ historyStats.today }}</div>
              <div class="text-xs font-medium text-gray-500">今日</div>
            </div>
          </div>

          <!-- 查看更多按钮 -->
          <el-button
            type="success"
            class="w-full group-hover:shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] font-semibold"
            style="height: 38px; border-radius: 10px"
            @click="goToHistoryRecords"
          >
            <template #icon>
              <el-icon class="text-lg"><View /></el-icon>
            </template>
            查看全部历史记录
            <el-icon class="ml-2 group-hover:translate-x-1 transition-transform"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
      <el-card class="shadow-sm border-gray-200 flex flex-col min-h-[280px]">
        <template #header>
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-gray-700 m-0">已选择图片 ({{ images.length }})</h4>
            <el-button v-if="images.length > 0" size="small" type="danger" text @click="clearSelectedImages"> 清空 </el-button>
          </div>
        </template>

        <div class="flex-1 flex flex-col min-h-0">
          <!-- 缩略图网格 -->
          <div v-if="images.length > 0" class="flex-1 overflow-y-auto min-h-0">
            <div class="grid grid-cols-3 gap-2 auto-rows-max">
              <div v-for="(item, index) in previews" :key="index" class="relative group aspect-square">
                <img
                  :src="item"
                  :alt="`图片 ${index + 1}`"
                  class="w-full h-full object-cover rounded border border-gray-200 group-hover:border-blue-400 transition-colors"
                />
                <button
                  class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeImage(index)"
                >
                  ×
                </button>
                <div class="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                  {{ index + 1 }}
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="flex-1 flex items-center justify-center min-h-[200px]">
            <div class="text-center text-gray-400">
              <el-icon :size="32" class="mb-2"><Picture /></el-icon>
              <p class="text-sm">暂无图片</p>
            </div>
          </div>
        </div>

        <!-- 滑动检测按钮 -->
        <transition
          name="slide-in-from-right"
          enter-active-class="transition-all duration-700 ease-out"
          leave-active-class="transition-all duration-500 ease-in"
          enter-from-class="transform translate-x-full opacity-0"
          enter-to-class="transform translate-x-0 opacity-100"
          leave-from-class="transform translate-x-0 opacity-100"
          leave-to-class="transform translate-x-full opacity-0"
        >
          <div v-if="images.length > 0" class="mt-3 flex justify-end">
            <el-button
              type="primary"
              size="default"
              :disabled="isUploading"
              :loading="isUploading"
              class="shadow-lg hover:shadow-xl transition-shadow"
              @click="upload"
            >
              <el-icon v-if="!isUploading" class="mr-1"><Search /></el-icon>
              {{ isUploading ? `识别中... ${uploadProgress}%` : `开始识别 (${images.length})` }}
            </el-button>
          </div>
        </transition>
      </el-card>
    </div>
    <div class="flex flex-col gap-3"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { identifyRgb, identifyWithFlask, identifyDiseaseId, identifyPestId } from '@/views/process/api/pestcontrol/identify';
import { identifyRgbResponseVO } from '@/views/process/api/pestcontrol/identify/types';
import { getModelList } from '@/views/process/api';
import { type ModelVO } from '@/views/process/api/types';
import { getBackPestInfo } from '@/views/process/pestcontrol/farmland/api';
import { type BackPestInfo } from '@/views/process/pestcontrol/farmland/api/types';
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo';
import { baseDictQuery } from '@/views/process/growth/api/tableDict';
import {
  Upload,
  Picture,
  Search,
  InfoFilled,
  Document,
  Setting,
  DataAnalysis,
  Select,
  ArrowRight,
  Location,
  MapLocation,
  Clock
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  initImages?: File[];
  initPreviews?: string[];
}>();

const emits = defineEmits<{
  (
    e: 'upload',
    res: identifyRgbResponseVO[],
    collectionInfo: { location: string; locationLabel?: string; baseName?: string; collectTime: string; baseId?: string }
  );
  (e: 'images', images: File[], previews: string[]);
}>();

const router = useRouter();

const upload = () => {
  identify();
  emits('images', images.value, previews.value);
};

const options: Ref<ModelVO[]> = ref([]);
const selectedModelType = ref<'disease' | 'pest'>('disease'); // 当前选中的模型类型
const selectedModelId = ref();

// 历史检测统计数据
const historyStats = ref<BackPestInfo>({
  total: 0,
  thisWeek: 0,
  today: 0
});

// 获取历史检测统计数据
const fetchHistoryStats = async () => {
  try {
    const response = await getBackPestInfo();
    if (response.data) {
      historyStats.value = response.data;
    }
  } catch (error) {
    console.error('获取历史检测统计数据失败:', error);
    ElMessage.error('获取统计数据失败');
  }
};

// 选择模型类型
const selectModel = (type: 'disease' | 'pest') => {
  selectedModelType.value = type;
  // 根据类型设置对应的固定模型ID
  if (type === 'disease') {
    selectedModelId.value = 1;
  } else {
    selectedModelId.value = 2;
  }
};

// 跳转到历史记录页面
const goToHistoryRecords = () => {
  router.push({
    path: '/process/pestcontrol/farmland',
    query: {
      type: 'plant' // 跳转到植株检测记录
    }
  });
};

// 分类后的模型列表(已废弃,保留兼容性)
const diseaseModels = computed(() => {
  return options.value.filter(
    (model) =>
      model.modelType === '病害检测模型' || model.modelName.includes('病害') || model.modelName.includes('病') || model.modelName.includes('叶')
  );
});

const pestModels = computed(() => {
  return options.value.filter(
    (model) =>
      model.modelType === '虫害检测模型' || model.modelName.includes('虫害') || model.modelName.includes('虫') || model.modelName.includes('蛀')
  );
});

// 当前选中的模型
const selectedModel = computed(() => {
  const allModels = [...diseaseModels.value, ...pestModels.value];
  const model = allModels.find((option) => {
    return option.modelId === selectedModelId.value;
  });

  console.log('selectedModel计算属性执行:');
  console.log('  selectedModelId.value:', selectedModelId.value);
  console.log('  allModels:', allModels);
  console.log('  找到的model:', model);
  console.log('  model.description:', model?.description);

  return model;
});
const images: Ref<File[]> = ref(props.initImages || []);
const previews: Ref<string[]> = ref(props.initPreviews || []);
const imageSelector: Ref<HTMLInputElement | null> = ref(null);
const result: Ref<identifyRgbResponseVO[] | null> = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const isProcessing = ref(false);
const MAX_IMAGES = 1;

// 采样信息
const collectionInfo = ref({
  location: '', // 采样地点（地块ID）
  collectTime: '' // 采样时间
});

// 可用的采样地点列表（从API获取）
const availableLocations = ref<Array<{ label: string; value: string; baseName?: string; area?: string; baseId?: string }>>([]);
const loadingLocations = ref(false);

// 当前用户的基地ID
const currentBaseId = ref<string>('');

// 禁用未来日期
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now();
};

// 从基地字典接口获取当前用户的基地ID
const initUserBase = async () => {
  try {
    // 调用基地字典接口，后端会根据用户权限返回对应的基地
    const res = await baseDictQuery();

    if (res.rows && res.rows.length > 0) {
      // 取第一个基地的value作为当前基地ID
      currentBaseId.value = String(res.rows[0].value);
      console.log(`✅ 当前用户基地: ${res.rows[0].label}, ID: ${currentBaseId.value}`);
    } else {
      console.warn('⚠️ 未获取到基地信息');
    }
  } catch (error) {
    console.error('❌ 获取基地信息失败:', error);
  }
};

// 从后端获取采样地点列表（根据当前用户的基地ID过滤）
const fetchCollectionLocations = async () => {
  if (!currentBaseId.value) {
    console.warn('基地ID为空，无法获取地块列表');
    return;
  }

  loadingLocations.value = true;

  try {
    // 使用当前用户的基地ID获取地块列表
    const response = await fetchFarmerLands({ baseId: currentBaseId.value });
    const lands = (response as any).rows || response.data || response;

    // 将地块数据转换为下拉选项格式
    availableLocations.value = lands.map((land: any) => ({
      label: land.landCode || land.landName, // 地块编号或名称
      value: String(land.landId), // 地块ID
      baseName: land.baseName, // 基地名称
      baseId: land.baseId || '', // 基地ID
      area: land.area ? `${land.area}亩` : undefined // 地块面积
    }));

    console.log(`✅ 成功获取 ${availableLocations.value.length} 个地块`);
  } catch (error) {
    console.error('❌ 获取地块列表失败:', error);
    ElMessage({
      message: '获取地块列表失败，请刷新页面重试',
      type: 'error'
    });
    availableLocations.value = [];
  } finally {
    loadingLocations.value = false;
  }
};

// 验证采样信息是否完整
const validateCollectionInfo = (): boolean => {
  if (!collectionInfo.value.location) {
    ElMessage({
      message: '请先选择采集地点',
      type: 'warning',
      duration: 2000
    });
    return false;
  }

  if (!collectionInfo.value.collectTime) {
    ElMessage({
      message: '请先选择采集时间',
      type: 'warning',
      duration: 2000
    });
    return false;
  }

  return true;
};

// 处理上传区域点击事件
const handleUploadClick = () => {
  // 如果已达到最大图片数量，不做任何操作
  if (images.value.length >= MAX_IMAGES) {
    return;
  }

  // 验证采样信息
  if (!validateCollectionInfo()) {
    return;
  }

  // 验证通过，触发文件选择
  imageSelector.value?.click();
};

const handleInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const newFiles = Array.from(target.files);

    // 检查是否超过最大图片数量限制
    const totalCount = images.value.length + newFiles.length;
    if (totalCount > MAX_IMAGES) {
      ElMessage({
        message: `最多只能上传${MAX_IMAGES}张图片，当前已选择${images.value.length}张，只能再添加${MAX_IMAGES - images.value.length}张`,
        type: 'warning'
      });

      // 只取允许的数量
      const allowedCount = MAX_IMAGES - images.value.length;
      if (allowedCount <= 0) {
        // 清空文件输入框
        if (imageSelector.value) {
          imageSelector.value.value = '';
        }
        return;
      }

      // 截取允许的文件数量
      const allowedFiles = newFiles.slice(0, allowedCount);
      processFiles(allowedFiles);
    } else {
      processFiles(newFiles);
    }

    // 清空文件输入框，确保可以重新选择相同文件
    if (imageSelector.value) {
      imageSelector.value.value = '';
    }
  }
};

const processFiles = (files: File[]) => {
  if (files.length === 0) return;

  isProcessing.value = true;
  uploadProgress.value = 0;

  let processedCount = 0;
  const totalFiles = files.length;

  files.forEach((file, index) => {
    // 检查文件大小（10MB限制）
    if (file.size > 10 * 1024 * 1024) {
      ElMessage({
        message: `文件 "${file.name}" 大小超过10MB，已跳过`,
        type: 'warning'
      });
      processedCount++;
      updateProgress(processedCount, totalFiles);
      return;
    }

    // 模拟文件处理进度
    setTimeout(() => {
      const previewUrl = URL.createObjectURL(file);

      // 添加新文件和预览URL
      images.value = [...images.value, file];
      previews.value = [...previews.value, previewUrl];

      processedCount++;
      updateProgress(processedCount, totalFiles);

      if (processedCount === totalFiles) {
        setTimeout(() => {
          isProcessing.value = false;
          uploadProgress.value = 0;
        }, 300);
      }
    }, index * 200); // 每个文件间隔200ms处理，模拟真实上传场景
  });
};

const updateProgress = (processed: number, total: number) => {
  uploadProgress.value = Math.round((processed / total) * 100);
};

const clearSelectedImages = () => {
  // 释放之前创建的URL对象，避免内存泄漏
  previews.value.forEach((url) => {
    URL.revokeObjectURL(url);
  });

  // 清理识别结果中的URL对象
  if (result.value && result.value.length > 0) {
    result.value.forEach((item) => {
      if (item.imageUrl && item.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.imageUrl);
      }
    });
  }

  images.value = [];
  previews.value = [];
  result.value = []; // 清空结果数据
  isUploading.value = false;

  // 清空文件输入框的值，确保可以重新选择相同文件
  if (imageSelector.value) {
    imageSelector.value.value = '';
  }

  // 强制触发Vue的响应式更新
  nextTick(() => {
    // 确保DOM更新完成
  });
};

const removeImage = (index: number) => {
  // 释放被删除图片的URL对象
  if (previews.value[index]) {
    URL.revokeObjectURL(previews.value[index]);
  }

  images.value = images.value.filter((_, i) => {
    return i !== index;
  });
  previews.value = previews.value.filter((_, i) => {
    return i !== index;
  });

  if (images.value.length === 0) {
    isUploading.value = false;
    // 清空文件输入框
    if (imageSelector.value) {
      imageSelector.value.value = '';
    }
  }
};

const getOptions = () => {
  console.log('初始化固定模型配置...');

  // 使用固定的两个模型,不再从后端获取
  options.value = [
    {
      modelId: 1,
      modelName: '病害识别模型',
      modelType: '病害检测模型',
      modelUrl: '',
      description:
        '基于深度学习的智能病害识别系统，采用ResNet改进架构，支持18种常见谷子病害的精准识别，包括白粉病、锈病、叶枯病等。该模型经过大量田间样本训练，准确率达95.8%，能够快速定位病害区域并给出专业防治建议。',
      isDefault: 1,
      accuracy: 95.8,
      version: 'v2.1.0'
    },
    {
      modelId: 2,
      modelName: '虫害识别模型',
      modelType: '虫害检测模型',
      modelUrl: '',
      description:
        '多特征融合的虫害识别网络（MFWNET），结合颜色、纹理、形态等多维特征，支持12种常见害虫的精准检测，包括蜗虫、蜓虫、蚊虫等。模型采用轻量化设计，处理速度快，准确率达92.5%，特别适用于田间实时监测场景。',
      isDefault: 0,
      accuracy: 92.5,
      version: 'v1.8.3'
    }
  ];

  // 默认选中病害识别模型
  selectedModelType.value = 'disease';
  selectedModelId.value = 1;

  console.log('固定模型初始化完成:', options.value);
};

const identify = async () => {
  // 验证前提条件
  if (!selectedModelId.value) {
    ElMessage({
      message: '请先选择识别模型',
      type: 'warning'
    });
    return;
  }

  if (!images.value || images.value.length === 0) {
    ElMessage({
      message: '请先上传图片',
      type: 'warning'
    });
    return;
  }

  // 验证采样信息
  if (!collectionInfo.value.location) {
    ElMessage({
      message: '请选择数据采集地点',
      type: 'warning'
    });
    return;
  }

  if (!collectionInfo.value.collectTime) {
    ElMessage({
      message: '请选择采集时间',
      type: 'warning'
    });
    return;
  }

  // 开始上传识别流程
  isUploading.value = true;
  uploadProgress.value = 0;

  // 清理之前的结果数据和URL对象
  if (result.value && result.value.length > 0) {
    console.log('清理之前的识别结果...');
    result.value.forEach((item) => {
      if (item.imageUrl && item.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.imageUrl);
      }
    });
  }

  // 重置结果数据
  result.value = [];

  console.log('开始上传图像进行识别:');
  console.log('  选中模型ID:', selectedModelId.value);
  console.log('  选中模型名称:', selectedModel.value?.modelName);
  console.log('  采样地点:', collectionInfo.value.location);
  console.log('  采样时间:', collectionInfo.value.collectTime);
  console.log('  上传图片数量:', images.value.length);
  console.log(
    '  图片信息:',
    images.value.map((img) => ({
      name: img.name,
      size: `${(img.size / 1024 / 1024).toFixed(2)}MB`,
      type: img.type
    }))
  );

  // 模拟上传进度
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += Math.random() * 15;
    }
  }, 200);

  // 根据选中的模型类型调用不同的识别接口
  try {
    console.log('当前选中模型类型:', selectedModelType.value);

    let apiResults;
    if (selectedModelType.value === 'disease') {
      // 调用病害识别接口
      console.log('调用病害识别接口: /pestcontrol/identify/diseaseId');
      const response = await identifyDiseaseId(images.value);
      apiResults = response.data;
    } else if (selectedModelType.value === 'pest') {
      // 调用虫害识别接口
      console.log('调用虫害识别接口: /pestcontrol/identify/pestId');
      const response = await identifyPestId(images.value);
      apiResults = response.data;
    } else {
      throw new Error('未知的模型类型');
    }

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    console.log('识别成功，返回结果:', apiResults);
    result.value = apiResults;

    ElMessage({
      message: `识别完成！共识别出 ${result.value.length} 个结果`,
      type: 'success'
    });

    // 获取选中地块的信息
    const selectedLocation = availableLocations.value.find((loc) => loc.value === collectionInfo.value.location);
    const selectedLocationLabel = selectedLocation?.label || collectionInfo.value.location;
    const selectedBaseName = selectedLocation?.baseName || '侯家沟';
    const selectedBaseId = selectedLocation?.baseId || '-1';

    console.log('===== 准备发送采样信息给父组件 =====');
    console.log('  选中的地块:', selectedLocation);
    console.log('  地块ID:', collectionInfo.value.location);
    console.log('  地块编号:', selectedLocationLabel);
    console.log('  基地名称:', selectedBaseName);
    console.log('  采样时间:', collectionInfo.value.collectTime);

    // 发送结果和采样信息给父组件
    emits('upload', result.value, {
      location: collectionInfo.value.location,
      locationLabel: selectedLocationLabel,
      baseName: selectedBaseName,
      baseId: selectedBaseId,
      collectTime: collectionInfo.value.collectTime
    });

    setTimeout(() => {
      isUploading.value = false;
      uploadProgress.value = 0;
    }, 500);
  } catch (error) {
    console.error('识别接口调用失败:', error);

    // 提供更详细的错误信息
    let errorMessage = '识别失败';
    if ((error as any).response) {
      errorMessage = `识别失败: ${(error as any).response.data?.msg || (error as any).response.statusText}`;
    } else if ((error as any).message) {
      errorMessage = `识别失败: ${(error as any).message}`;
    }

    ElMessage({
      message: errorMessage,
      type: 'error',
      duration: 3000
    });

    clearInterval(progressInterval);
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};

// 备用方法：使用原有的识别接口（如需要可以调用）
const identifyWithOldApi = async () => {
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += Math.random() * 15;
    }
  }, 200);

  try {
    await identifyRgb(selectedModelId.value, images.value)
      .then((response) => {
        clearInterval(progressInterval);
        uploadProgress.value = 100;

        console.log('模型识别API调用成功:');
        console.log('  原始响应:', response);
        console.log('  响应数据:', response.data);

        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          // API返回数据正常
          result.value = response.data.map((item) => ({
            ...item,
            // 确保图片URL正确显示
            imageUrl: item.imageUrl || previews.value[response.data.indexOf(item)] || '',
            // 确保病虫害类型存在
            pestTypes: item.pestTypes || '未识别出病虫害类型'
          }));

          console.log('处理后的识别结果:', result.value);

          ElMessage({
            message: `识别完成！共识别出 ${result.value.length} 个结果`,
            type: 'success'
          });
        } else {
          // API返回数据为空或格式不正确
          console.warn('API返回数据为空或格式不正确，使用模拟数据');
          result.value = createMockResults();

          ElMessage({
            message: '识别完成（模拟数据）',
            type: 'info'
          });
        }

        // 获取选中地块的信息
        const selectedLocation = availableLocations.value.find((loc) => loc.value === collectionInfo.value.location);
        const selectedLocationLabel = selectedLocation?.label || collectionInfo.value.location;
        const selectedBaseName = selectedLocation?.baseName || '侯家沟';

        console.log('===== 准备发送采样信息给父组件（旧API） =====');
        console.log('  选中的地块:', selectedLocation);
        console.log('  地块编号:', selectedLocationLabel);
        console.log('  基地名称:', selectedBaseName);

        // 发送结果和采样信息给父组件
        emits('upload', result.value, {
          location: collectionInfo.value.location,
          locationLabel: selectedLocationLabel,
          baseName: selectedBaseName,
          collectTime: collectionInfo.value.collectTime
        });

        setTimeout(() => {
          isUploading.value = false;
          uploadProgress.value = 0;
        }, 500);
      })
      .catch((error) => {
        clearInterval(progressInterval);

        console.error('模型识别API调用失败:');
        console.error('  错误信息:', error);
        console.error('  错误类型:', error.name);
        console.error('  HTTP状态:', error.response?.status);
        console.error('  服务器响应:', error.response?.data);

        // 使用模拟数据作为备用方案
        result.value = createMockResults();

        // 获取选中地块的信息
        const selectedLocation = availableLocations.value.find((loc) => loc.value === collectionInfo.value.location);
        const selectedLocationLabel = selectedLocation?.label || collectionInfo.value.location;
        const selectedBaseName = selectedLocation?.baseName || '侯家沟';

        console.log('===== 准备发送采样信息给父组件（旧API） =====');
        console.log('  选中的地块:', selectedLocation);
        console.log('  地块编号:', selectedLocationLabel);
        console.log('  基地名称:', selectedBaseName);

        // 发送结果和采样信息给父组件
        emits('upload', result.value, {
          location: collectionInfo.value.location,
          locationLabel: selectedLocationLabel,
          baseName: selectedBaseName,
          collectTime: collectionInfo.value.collectTime
        });

        // 错误提示
        let errorMessage = '识别服务暂时不可用';
        if (error.response) {
          switch (error.response.status) {
            case 400:
              errorMessage = '请求参数错误，请检查上传的图片格式';
              break;
            case 401:
              errorMessage = '身份验证失败，请重新登录';
              break;
            case 403:
              errorMessage = '没有权限访问识别服务';
              break;
            case 413:
              errorMessage = '上传文件过大，请减少图片数量或压缩图片';
              break;
            case 500:
              errorMessage = '服务器内部错误，请稍后重试';
              break;
            case 503:
              errorMessage = '识别服务暂时不可用，请稍后重试';
              break;
            default:
              errorMessage = `请求失败 (${error.response.status})`;
          }
        } else if (error.request) {
          errorMessage = '网络连接失败，请检查网络连接';
        }

        ElMessage({
          message: `${errorMessage}，已加载演示数据`,
          type: 'warning',
          duration: 5000
        });

        setTimeout(() => {
          isUploading.value = false;
          uploadProgress.value = 0;
        }, 500);
      });
  } catch (outerError) {
    console.error('识别流程异常终止:', outerError);
    clearInterval(progressInterval);
    isUploading.value = false;
    uploadProgress.value = 0;
    ElMessage({
      message: '识别流程异常，请刷新页面重试',
      type: 'error'
    });
  }
};

// 创建模拟识别结果的函数
const createMockResults = () => {
  const mockPestTypes = ['蛸虫', '黑腐病', '纹枯病', '叶果病', '灰霸病', '红蜘蛛'];
  const mockClasses = ['蛸虫', '白粉病', '叶斑病', '蚜虫', '螨虫', '锈病', '炭疽病', '黑腐病'];

  return images.value.map((image, index) => {
    // 为每次识别创建全新的blob URL（避免缓存）
    const freshBlob = new Blob([image], { type: image.type });
    const freshImageUrl = URL.createObjectURL(freshBlob);

    // 创建多个检测结果以测试多置信度显示
    const numDetections = Math.floor(Math.random() * 5) + 2; // 2-6个检测结果
    const detections = [];

    for (let i = 0; i < numDetections; i++) {
      detections.push({
        class: mockClasses[i % mockClasses.length],
        confidence: Math.random() * 0.4 + 0.6, // 60-100%的置信度
        bbox: [Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100] // 模拟边界框
      });
    }

    // 按置信度降序排序
    detections.sort((a, b) => b.confidence - a.confidence);

    return {
      imageUrl: freshImageUrl,
      pestTypes: detections[0].class, // 使用置信度最高的作为主要类型
      confidence: detections[0].confidence,
      detections: detections, // 添加完整的检测结果
      detectionTime: new Date().toISOString(),
      modelName: selectedModel.value?.modelName || '未知模型',
      timestamp: Date.now() + index // 添加时间戳标识（加上index确保唯一性）
    };
  });
};

const init = () => {
  getOptions();
};

// 在组件卸载时清理URL对象
// 格式化日期方法
const formatDate = (date: string | number | Date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

onUnmounted(() => {
  previews.value.forEach((url) => {
    URL.revokeObjectURL(url);
  });
});

// 添加对selectedModelId变化的监听，确保模型切换时正确更新显示
watch(
  () => selectedModelId.value,
  (newModelId, oldModelId) => {
    console.log('模型切换监听器触发:');
    console.log('  从模型ID:', oldModelId, '切换到:', newModelId);
    console.log('  当前options:', options.value);
    console.log('  新选中的模型:', selectedModel.value);

    // 强制触发响应式更新
    nextTick(() => {
      console.log('  强制更新后的模型:', selectedModel.value);
    });
  },
  { immediate: true }
);

// 监听 props 变化，当初始化数据为空时重置组件状态
watch(
  () => [props.initImages, props.initPreviews],
  ([newImages, newPreviews]) => {
    // 当从结果页面返回时，初始化数据会被清空
    if ((!newImages || newImages.length === 0) && (!newPreviews || newPreviews.length === 0)) {
      // 清理之前的 URL 对象
      previews.value.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      // 重置组件状态
      images.value = [];
      previews.value = [];
      isUploading.value = false;

      // 清空文件输入框
      if (imageSelector.value) {
        imageSelector.value.value = '';
      }

      console.log('组件状态已重置');
    } else if (newImages && newPreviews) {
      // 如果有初始化数据，则使用它们
      images.value = Array.isArray(newImages) ? newImages.filter((item): item is File => item instanceof File) : [];
      previews.value = Array.isArray(newPreviews) ? newPreviews.filter((item): item is string => typeof item === 'string') : [];
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  init();
  // 先获取用户基地ID
  await initUserBase();
  // 再加载该基地的地块列表
  fetchCollectionLocations();
  // 加载历史检测统计数据
  fetchHistoryStats();
});
</script>

<style scoped>
/* 限制预览区域最大高度，确保不会撑高卡片 - 修正版 */
.preview-grid-container {
  max-height: 100%;
  overflow: hidden;
}

/* 确保图片不会超出容器 - 增强版 */
.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 模型选择标签页样式优化 - Tailwind风格 */
.model-selection-tabs {
  height: auto; /* 改为自动高度 */
  min-height: 15rem; /* 最小高度 240px */
  border-radius: 0.5rem; /* 8px */
  overflow: hidden;
  box-shadow: 0 0.0625rem 0.1875rem 0 rgba(0, 0, 0, 0.1);
}

.model-selection-tabs :deep(.el-tabs__header) {
  margin: 0;
  border-bottom: 0.0625rem solid #e4e7ed;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.model-selection-tabs :deep(.el-tabs__nav-wrap) {
  background: transparent;
  padding: 0;
}

.model-selection-tabs :deep(.el-tabs__item) {
  font-weight: 600;
  color: #64748b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5rem 1rem; /* 8px 16px */
  font-size: 0.8125rem; /* 13px */
  position: relative;
  border-radius: 0.375rem 0.375rem 0 0; /* 6px 6px 0 0 */
}

.model-selection-tabs :deep(.el-tabs__item.is-active) {
  color: #3b82f6;
  font-weight: 700;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.model-selection-tabs :deep(.el-tabs__item:hover) {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.model-selection-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
  min-height: 0;
}

.model-selection-tabs :deep(.el-tab-pane) {
  height: 100%;
}

/* 单选按钮样式优化 - Tailwind单位 */
.model-selection-tabs :deep(.el-radio.is-bordered) {
  margin: 0;
  padding: 0.75rem; /* 增加内边距 12px */
  border-radius: 0.375rem; /* 6px */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 0.09375rem solid #e2e8f0; /* 1.5px */
  background: #ffffff;
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 4rem; /* 增加最小高度 64px */
}

.model-selection-tabs :deep(.el-radio.is-bordered::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.model-selection-tabs :deep(.el-radio.is-bordered.is-checked) {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  box-shadow: 0 0.25rem 0.75rem rgba(59, 130, 246, 0.15); /* 0 4px 12px */
  transform: translateY(-0.0625rem); /* translateY(-1px) */
}

.model-selection-tabs :deep(.el-radio.is-bordered:hover) {
  border-color: #3b82f6;
  box-shadow: 0 0.125rem 0.5rem rgba(59, 130, 246, 0.1); /* 0 2px 8px */
  transform: translateY(-0.0625rem); /* translateY(-1px) */
}

/* 确保单选按钮内容正确显示 - Tailwind优化 */
.model-selection-tabs :deep(.el-radio__label) {
  padding-left: 0.5rem; /* 8px */
  width: 100%;
  display: flex;
  align-items: center;
}

.model-selection-tabs :deep(.el-radio) {
  white-space: normal;
  height: auto;
  line-height: normal;
  display: flex;
  align-items: flex-start;
}

.model-selection-tabs :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* 右侧模型信息卡片样式优化 - Tailwind单位 */
.model-info-card {
  height: auto; /* 改为自动高度 */
  min-height: 15rem; /* 最小高度 240px */
  border-radius: 0.5rem; /* 8px */
  overflow: hidden;
}

.model-info-card :deep(.el-card__header) {
  padding: 0.75rem 1rem; /* 12px 16px */
  border-bottom: 0.0625rem solid #e2e8f0; /* 1px */
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.model-info-card :deep(.el-card__body) {
  padding: 0.75rem 1rem; /* 12px 16px */
  height: auto; /* 改为自动高度 */
  min-height: 10rem; /* 最小高度 160px */
  overflow: hidden;
  background: #ffffff;
}

/* 标签样式优化 - Tailwind单位 */
.model-selection-tabs :deep(.el-tag) {
  border-radius: 0.75rem; /* 12px */
  font-size: 0.625rem; /* 10px */
  padding: 0.125rem 0.5rem; /* 2px 8px */
  font-weight: 600;
}

/* 新增：自适应卡片容器优化 */
.model-selection-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.model-selection-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.model-selection-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
}

/* 右侧模型信息卡片自适应优化 */
.model-info-card {
  height: 100%;
  min-height: 10rem; /* 160px */
  max-height: 25rem; /* 400px */
  display: flex;
  flex-direction: column;
}

.model-info-card :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  padding: 0.75rem;
  overflow: hidden;
}

/* 模型选项自适应文本换行 */
.model-selection-tabs :deep(.el-radio__label) {
  width: 100%;
  overflow: visible;
  text-overflow: unset;
  white-space: normal;
  word-wrap: break-word;
}

/* 模型信息内容区域滚动优化 */
.model-info-card .flex-1.min-h-0.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.model-info-card .flex-1.min-h-0.overflow-y-auto::-webkit-scrollbar {
  width: 0.25rem; /* 4px */
}

.model-info-card .flex-1.min-h-0.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 0.125rem; /* 2px */
}

.model-info-card .flex-1.min-h-0.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 0.125rem; /* 2px */
  transition: background-color 0.2s ease;
}

.model-info-card .flex-1.min-h-0.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 响应式优化 - 使用Tailwind断点 */
@media (max-width: 64rem) {
  /* max-width: 1024px */
  .grid.grid-cols-1.lg\\:grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .model-info-card {
    min-height: 10rem; /* 160px */
    max-height: 18rem; /* 288px */
  }

  /* 上传区域在小屏幕下的优化 */
  .grid.grid-cols-1.lg\\:grid-cols-2.gap-6 {
    gap: 1rem;
    min-height: auto;
  }
}

@media (max-width: 48rem) {
  /* max-width: 768px */
  .model-selection-tabs {
    height: auto;
    min-height: 11.25rem; /* 180px */
  }

  .model-selection-tabs :deep(.el-radio.is-bordered) {
    min-height: 3rem; /* 48px */
    padding: 0.75rem; /* 12px */
  }

  .model-info-card {
    height: auto;
    min-height: 8rem; /* 128px */
    max-height: 15rem; /* 240px */
  }
}
</style>
