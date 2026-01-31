<template>
  <div class="flex flex-col gap-4">
    <!-- 模型选择 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <h2 class="m-y-1">生育周期判别模型</h2>
          <p class="m-t-0 text-xs">选择适合您植物生育周期判别需求的模型</p>
        </div>
      </template>
      <el-select v-model="selectedModelId" placeholder="模型列表加载中..." size="large" style="width: 240px">
        <el-option
          v-for="option in options"
          :key="option.modelId"
          :default="option.isDefault === 1"
          :value="option.modelId"
          :label="option.modelName"
        ></el-option>
      </el-select>
    </el-card>
    <!-- 上传识别 -->
    <el-card v-if="selectedModelId">
      <template #header>
        <div class="card-header">
          <h2 class="m-y-1">{{ selectedModel.modelName }}</h2>
          <p class="m-t-0 text-xs">{{ selectedModel.description }}</p>
        </div>
      </template>
      <div class="flex flex-col gap-4">
        <div
          class="flex flex-col p-y-12 rounded-lg border border-solid justify-center items-center select-none cursor-pointer transition-opacity duration-300 opacity-50 hover:opacity-100"
          @click="imageSelector.click"
        >
          <input ref="imageSelector" type="file" accept="image/tiff" multiple class="hidden" @change="handleInputChange" />
          <el-icon :size="32"><Upload /></el-icon>
          <span class="text-lg">上传图片</span>
          <span class="text-xs">点击上传图片，可多选</span>
        </div>
        <div v-if="images && images.length > 0" class="flex flex-col gap-4">
          <div class="flex justify-between items-center">
            <h3>已选择的图像 ({{ images.length }})</h3>
            <el-button @click="clearSelectedImages">清空</el-button>
          </div>
          <div class="flex flex-wrap gap-4">
            <div v-for="(item, index) in previews" :key="index" class="relative group">
              <button
                class="absolute bg-transparent border-none top-0 right-0 z-10 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center text-lg transition-opacity opacity-50 group-hover:opacity-100 cursor-pointer"
                @click="removeImage(index)"
              >
                &times;
              </button>
              <img :src="item" :alt="String(index)" class="w-32 h-32 object-cover rounded-lg border border-solid" />
            </div>
          </div>
          <div class="flex justify-end">
            <el-button :disabled="isUploading" @click="upload">{{ isUploading ? '识别中...' : '识别' }}</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { identifyWh } from '../api';
import { identifyWhResponseVO } from '../api/types';
import { getModelList } from '@/views/process/api';
import { type ModelVO } from '@/views/process/api/types';

const props = defineProps<{
  initImages?: File[];
  initPreviews?: string[];
}>();

const emits = defineEmits<{
  (e: 'upload', res: identifyWhResponseVO[]);
  (e: 'images', images: File[], previews: string[]);
}>();

const upload = () => {
  identify();
  emits('images', images.value, previews.value);
};

const options: Ref<ModelVO[]> = ref([]);
const selectedModelId = ref();
const selectedModel = computed(() => {
  return options.value.filter((option) => {
    return option.modelId === selectedModelId.value;
  })[0];
});
const images: Ref<File[]> = ref(props.initImages || []);
const previews: Ref<string[]> = ref(props.initPreviews || []);
const imageSelector: Ref<HTMLInputElement | null> = ref(null);
const result: Ref<identifyWhResponseVO[] | null> = ref(null);
const isUploading = ref(false);

const handleInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const newFiles = Array.from(target.files);
    images.value = [...images.value, ...newFiles];
    const newPreviewUrls = newFiles.map((file) => {
      return URL.createObjectURL(file);
    });
    previews.value = [...previews.value, ...newPreviewUrls];
  }
};

const clearSelectedImages = () => {
  images.value = [];
  previews.value = [];
  isUploading.value = false;
};

const removeImage = (index: number) => {
  images.value = images.value.filter((_, i) => {
    return i !== index;
  });
  previews.value = previews.value.filter((_, i) => {
    return i !== index;
  });
  if (images.value.length === 0) {
    isUploading.value = false;
  }
};

const getOptions = () => {
  getModelList({
    modelType: '生育阶段识别模型'
  }).then((res) => {
    options.value = res.rows;
    selectedModelId.value = options.value[0].modelId;
  });
};

const identify = () => {
  isUploading.value = true;
  identifyWh(selectedModelId.value, images.value).then((res) => {
    result.value = res.data;
    isUploading.value = false;
    emits('upload', result.value);
  });
};

const init = () => {
  getOptions();
};

onMounted(init);
</script>
