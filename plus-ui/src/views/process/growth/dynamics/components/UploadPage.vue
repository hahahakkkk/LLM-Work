<template>
  <div class="flex flex-col gap-4">
    <!-- 成熟度监测标题 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <h2 class="m-y-1">长势诊断</h2>
        </div>
      </template>
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <span class="mr-2">基地：</span>
          <el-select v-model="selectedBase" placeholder="请选择基地" size="large" style="width: 240px" @change="handleBaseChange">
            <el-option v-for="base in baseDict" :key="base.value" :label="base.label" :value="base.label.replace('基地', '')" />
          </el-select>
        </div>
        <el-button type="primary" size="large" :disabled="!selectedModelId" @click="handleUploadClick">
          <el-icon class="mr-1"><Upload /></el-icon>
          上传图像
        </el-button>
        <input ref="imageSelector" type="file" accept="image/png, image/jpeg, image/tiff" multiple class="hidden" @change="handleInputChange" />
      </div>
    </el-card>

    <!-- 模型选择 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <h2 class="m-y-1">长势诊断模型</h2>
        </div>
      </template>
      <el-select v-model="selectedModelId" placeholder="模型列表加载中..." size="large" style="width: 240px" @change="handleModelChange">
        <el-option v-for="option in options" :key="option.modelId" :value="option.modelId" :label="option.modelName" />
      </el-select>
      <div v-if="selectedModel" class="mt-2 text-sm text-gray-500">
        {{ selectedModel.description }}
      </div>
    </el-card>

    <!-- 上传文件列表 -->
    <el-card v-if="images.length > 0">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <h3>已上传文件 ({{ images.length }})</h3>
          <el-button @click="clearSelectedImages">清空</el-button>
        </div>
      </template>
      <div class="file-list">
        <div v-for="(file, index) in images" :key="index" class="file-item">
          <span>{{ file.name }}</span>
          <el-button type="danger" size="small" @click="removeImage(index)"> 删除 </el-button>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <el-button type="primary" size="large" :disabled="!isReadyForRecognition" :loading="isUploading" @click="handleRecognition">
          {{ isUploading ? '预测中...' : '开始预测' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { listModel, processRgbImage } from '@/views/process/maturity/maturityPred/api/model';
import type { ModelVO, ModelProcessResult, ExtendedModelProcessResult } from '@/views/process/maturity/maturityPred/api/model/types';
import { Upload } from '@element-plus/icons-vue';

import { baseDictQuery } from '../api/tableDict';
import { TableDict } from '../api/tableDict/types';
import { useRouter } from 'vue-router';

// 在setup中使用路由
const router = useRouter();

const baseDict = ref<TableDict[]>([]);

// 调用接口获取基地数据
const fetchBaseDict = async () => {
  try {
    const response = await baseDictQuery();
    baseDict.value = response.rows; // 假设返回数据在 data 字段中
    // console.log('获取基地字典成功', response.rows);
  } catch (error) {
    console.error('获取基地字典失败', error);
    // 处理错误
  }
};
interface Props {
  initImages?: File[];
  initPreviews?: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'upload', results: ModelProcessResult[]): void;
  (e: 'images', images: File[], previews: string[]): void;
  (e: 'modelChange', model: ModelVO): void;
  (e: 'baseChange', base: string): void;
  (e: 'satellite-model-selected', modelInfo: { base: string; modelId: string }): void; // 添加新事件
}>();

const selectedBase = ref('');

// 模型数据
const options = ref<ModelVO[]>([]);
const selectedModelId = ref<string | number>('');
const selectedModel = computed(() => {
  return options.value.find((option) => option.modelId === selectedModelId.value);
});

// 图片数据
const images = ref<File[]>(props.initImages || []);
const previews = ref<string[]>(props.initPreviews || []);
const imageSelector = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);

// 计算属性
const isReadyForRecognition = computed(() => {
  // 增加 options.value.length > 0 确保模型已加载
  return (
    selectedBase.value && selectedModelId.value && images.value.length > 0 && options.value.length > 0 // 新增条件
  );
});

// 方法
const handleUploadClick = () => {
  if (imageSelector.value) {
    imageSelector.value.click();
  }
};

const handleInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.length) {
    const newFiles = Array.from(target.files);
    images.value = [...images.value, ...newFiles];
    previews.value = [...previews.value, ...newFiles.map((file) => URL.createObjectURL(file))];
    emit('images', images.value, previews.value);
  }
  target.value = '';
};

const clearSelectedImages = () => {
  images.value = [];
  previews.value = [];
  emit('images', [], []);
};

const removeImage = (index: number) => {
  images.value.splice(index, 1);
  previews.value.splice(index, 1);
  emit('images', images.value, previews.value);
};

const handleModelChange = (modelId: string | number) => {
  const model = options.value.find((option) => option.modelId === modelId);
  if (model) {
    emit('modelChange', model);
  }
};

const handleBaseChange = (base: string) => {
  emit('baseChange', base);
};

const handleRecognition = async () => {
  if (!isReadyForRecognition.value) return;
  // 检查是否为卫星模型
  if (selectedModel.value?.description.includes('卫星')) {
    // 触发卫星模型选择事件
    emit('satellite-model-selected', {
      base: selectedBase.value,
      modelId: selectedModelId.value.toString()
    });
    return;
  }
  isUploading.value = true;

  try {
    const results: ExtendedModelProcessResult[] = [];
    const currentTimestamp = new Date().toISOString();

    for (const file of images.value) {
      try {
        // 修改为只传2个参数
        const response = await processRgbImage(selectedModelId.value.toString(), file);
        // console.log('处理结果:', response.data);

        results.push({
          ...response.data,
          base: selectedBase.value,
          fileName: file.name,
          status: 'success'
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`图片 ${file.name} 处理失败:`, error);
        results.push({
          originalUrl: URL.createObjectURL(file),
          processedUrls: [],
          ratio: 0,
          modelId: selectedModelId.value.toString(),
          timestamp: currentTimestamp,
          fileName: file.name,
          base: selectedBase.value,
          status: 'error'
        });
      }
    }

    emit('upload', results);
    console.log('识别结果:', results);
  } catch (error) {
    console.error('识别过程中发生错误:', error);
  } finally {
    isUploading.value = false;
  }
};

// 初始化
const getOptions = async () => {
  try {
    const res = await listModel();

    // 过滤出模型名称包含"成熟度"的模型
    options.value = res.rows.filter((model) => model.description.includes('长势'));

    if (options.value.length > 0) {
      selectedModelId.value = options.value[0].modelId;
      emit('modelChange', options.value[0]);
    }
  } catch (error) {
    console.error('加载模型列表失败:', error);
  }
};

onMounted(() => {
  getOptions();
  fetchBaseDict();
});
</script>

<style scoped>
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
}
</style>
