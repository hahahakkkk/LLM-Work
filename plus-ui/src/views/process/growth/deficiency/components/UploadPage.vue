<template>
  <div class="flex flex-col gap-4">
    <!-- 水肥亏缺诊断标题 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <h2 class="m-y-1">水肥亏缺诊断</h2>
        </div>
      </template>
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <span class="mr-2">基地：</span>
          <el-select v-model="selectedBase" placeholder="请选择基地" size="large" style="width: 240px" @change="handleBaseChange">
            <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.label" />
          </el-select>
        </div>
        <div class="flex-1">
          <span class="mr-2">地块：</span>
          <el-select v-model="selectedPlot" placeholder="选择地块" size="large" style="width: 240px" @change="handlePlotChange">
            <el-option v-for="dict in filteredLandDict" :label="dict.label" :value="dict.label ? String(dict.label).slice(-3) : ''" />
          </el-select>
        </div>
      </div>
    </el-card>

    <!-- 模型选择 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <h2 class="m-y-1">模型选择</h2>
        </div>
      </template>
      <el-select v-model="selectedModelId" placeholder="模型列表加载中..." size="large" style="width: 240px" @change="handleModelChange">
        <el-option v-for="option in options" :key="option.modelId" :value="option.modelId" :label="option.modelName" />
      </el-select>
      <div v-if="selectedModel" class="mt-2 text-sm text-gray-500">
        {{ selectedModel.description }}
      </div>
      <div class="flex justify-end">
        <el-button type="primary" size="large" :disabled="!selectedModelId" :loading="isUploading" @click="handleDefaultImageUpload">
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

const emit = defineEmits<{
  (e: 'upload', results: ModelProcessResult[]): void;
  (e: 'modelChange', model: ModelVO): void;
  (e: 'baseChange', base: string): void;
}>();

const selectedBase = ref('');

const selectedPlot = ref('');

import { baseDictQuery } from '@/views/process/growth/api/tableDict';
import { TableDict } from '@/views/process/growth/api/tableDict/types';
import { landDictQuery } from '@/views/mz_base/api/tableDict';

const baseDict = ref<TableDict[]>([]);
const landDict = ref<DictDataOption[]>([]);
const filteredLandDict = ref<DictDataOption[]>([]);

/**
 * 基地、农户字典
 */
const getDicts = async () => {
  let res = await landDictQuery();
  landDict.value = res.rows;
  // console.log(res);
  res = await baseDictQuery();
  baseDict.value = res.rows;
  // console.log(res);
};

// 修复1: 重命名局部变量避免冲突
const filterLandDict = () => {
  // 使用新变量名 selectedBaseItem
  const selectedBaseItem = baseDict.value.find((item) => item.label === selectedBase.value);
  console.log(selectedBaseItem);
  if (!selectedBaseItem) {
    console.log('未选择有效基地');
    filteredLandDict.value = []; // 改为空数组更合理
    return;
  }

  // 修复2: 使用模板实际绑定的 selectedBase.value
  const baseNameLabel = selectedBaseItem.label.replace('基地', '');

  filteredLandDict.value = landDict.value.filter((item) => {
    if (!item.label || item.label.length < 3) return false;
    const basePart = item.label.slice(0, -3);
    return basePart === baseNameLabel;
  });
};

// 修复3: 基地变更时自动更新地块列表
const handleBaseChange = (base: string) => {
  emit('baseChange', base);
  filterLandDict(); // 添加过滤调用
};

// 模型数据
const options = ref<ModelVO[]>([]);
const selectedModelId = ref<string | number>('');
const selectedModel = computed(() => {
  return options.value.find((option) => option.modelId === selectedModelId.value);
});

// 默认图片URL
const defaultImageUrl = ref('/images/default-image.tif'); // 替换为您的默认图片路径
const isUploading = ref(false);

// 方法
const handleModelChange = (modelId: string | number) => {
  const model = options.value.find((option) => option.modelId === modelId);
  if (model) {
    emit('modelChange', model);
  }
};

const handlePlotChange = (val: string) => {
  console.log('选择的地块:', val);
};

// 处理默认图片上传
const handleDefaultImageUpload = async () => {
  if (!selectedBase.value || !selectedModelId.value) return;

  isUploading.value = true;

  try {
    // 创建默认图片的File对象
    const response = await fetch(defaultImageUrl.value);
    const blob = await response.blob();
    const file = new File([blob], 'default-image.tif', { type: blob.type });

    // 处理默认图片
    const result = await processSingleImage(file);

    emit('upload', [result]);
  } catch (error) {
    console.error('使用默认图片识别失败:', error);
  } finally {
    isUploading.value = false;
  }
};

// 处理单张图片
const processSingleImage = async (file: File): Promise<ExtendedModelProcessResult> => {
  const currentTimestamp = new Date().toISOString();

  try {
    const response = await processRgbImage(selectedModelId.value.toString(), file);
    console.log('处理结果:', selectedModelId.value.toString());
    return {
      ...response.data,
      base: selectedBase.value,
      fileName: file.name,
      status: 'success'
    };
  } catch (error) {
    console.error(`图片 ${file.name} 处理失败:`, error);
    return {
      originalUrl: URL.createObjectURL(file),
      processedUrls: [],
      ratio: 0,
      modelId: selectedModelId.value.toString(),
      timestamp: currentTimestamp,
      fileName: file.name,
      base: selectedBase.value,
      status: 'error'
    };
  }
};

// 初始化
const getOptions = async () => {
  try {
    const res = await listModel();

    // 过滤出模型名称包含"长势"的模型
    options.value = res.rows.filter((model) => model.modelName.includes('诊断'));

    if (options.value.length > 0) {
      selectedModelId.value = options.value[0].modelId;
      emit('modelChange', options.value[0]);
    }
  } catch (error) {
    console.error('加载模型列表失败:', error);
  }
};

// 修复4: 初始化时确保有默认值
onMounted(() => {
  getOptions();
  getDicts().then(() => {
    filterLandDict();
  });
});
</script>

<style scoped>
/* 样式保持不变 */
</style>

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
