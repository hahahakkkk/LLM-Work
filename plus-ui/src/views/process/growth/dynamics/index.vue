:src/views/process/growth/dynamics/index.vue
<template>
  <div v-if="!uploaded" class="p-6 max-w-[1600px] mx-auto">
    <UploadPage
      :init-images="initImages"
      :init-previews="initPreviews"
      @upload="handleUpload"
      @images="handleImages"
      @satellite-model-selected="handleSatelliteModelSelected"
    />
  </div>

  <!-- 修改此处：使用 satelliteResult 组件 -->
  <satelliteResult v-else-if="isSatelliteModel" :base="satelliteBase" :model-id="satelliteModelId" />

  <SplitBox v-else aside-width="50%">
    <template #aside>
      <div class="p-6">
        <ResultPage :results="result" @backto-upload="uploaded = false" @locate-base="handleLocateBase" />
      </div>
    </template>
    <template #main>
      <div style="height: 100%">
        <Result2Map :result="result" :location-target="locationTarget" />
      </div>
    </template>
  </SplitBox>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import SplitBox from '@/views/powland/commponents/SplitBox.vue';
import UploadPage from './components/UploadPage.vue';
import ResultPage from './components/ResultPage.vue';
import Result2Map from './components/Result2Map.vue';
import satelliteResult from './components/satelliteResult.vue'; // 引入卫星结果组件
import type { ModelProcessResult } from '@/views/process/maturity/maturityPred/api/model/types.ts';

const uploaded = ref<boolean>(false);
const result: Ref<ModelProcessResult[] | null> = ref(null);
const initImages: Ref<File[]> = ref([]);
const initPreviews: Ref<string[]> = ref([]);
const locationTarget = ref<{ lng: number; lat: number } | null>(null);

// 添加卫星模型相关状态
const isSatelliteModel = ref(false);
const satelliteBase = ref('');
const satelliteModelId = ref('');

function handleLocateBase(coords: { lng: number; lat: number }) {
  locationTarget.value = coords;
  setTimeout(() => {
    locationTarget.value = null;
  }, 3000);
}

const handleUpload = (res: ModelProcessResult[]): void => {
  result.value = res;
  uploaded.value = true;
  isSatelliteModel.value = false; // 确保普通模型显示正常结果
};

const handleImages = (images: File[], previews: string[]): void => {
  initImages.value = images;
  initPreviews.value = previews;
};

const handleSatelliteModelSelected = (modelInfo: { base: string; modelId: string }) => {
  // 设置卫星模型状态
  isSatelliteModel.value = true;
  satelliteBase.value = modelInfo.base;
  satelliteModelId.value = modelInfo.modelId;
  uploaded.value = true; // 触发显示卫星结果
};
</script>
