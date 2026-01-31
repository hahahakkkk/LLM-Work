<template>
  <div class="max-w-full xl:max-w-[1800px] 2xl:max-w-[2000px] mx-auto" style="padding: 15px">
    <!-- 主要内容区域 -->
    <UploadPage v-if="!uploaded" :init-images="initImages" :init-previews="initPreviews" @upload="handleUpload" @images="handleImages" />
    <ResultPage v-else :results="result" :collection-info="collectionInfo" @backto-upload="handleBackToUpload" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import UploadPage from './components/UploadPage.vue';
import ResultPage from './components/ResultPage.vue';
import { identifyRgbResponseVO } from '@/views/process/api/pestcontrol/identify/types';
import { Location, MapLocation, Clock, Crop } from '@element-plus/icons-vue';

const uploaded = ref(false);
const result: Ref<identifyRgbResponseVO[] | null> = ref(null);
const initImages: Ref<File[]> = ref([]);
const initPreviews: Ref<string[]> = ref([]);

// 采样信息
const collectionInfo = ref<{ location: string; locationLabel?: string; baseName?: string; collectTime: string; baseId?: string } | undefined>(
  undefined
);

// 基地和时间相关数据
const currentBase = ref('侯家沟基地');
const currentTime = ref('');
let timeInterval: NodeJS.Timeout | null = null;

// 更新时间
const updateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[now.getDay()];

  currentTime.value = `${year}年${month}月${day}日 ${weekday} ${hours}:${minutes}:${seconds}`;
};

const handleUpload = (
  res: identifyRgbResponseVO[],
  info: { location: string; locationLabel?: string; baseName?: string; collectTime: string; baseId?: string }
) => {
  result.value = res;
  collectionInfo.value = info;
  uploaded.value = true;
};

const handleImages = (images: File[], previews: string[]) => {
  initImages.value = images;
  initPreviews.value = previews;
};

// 返回上传页面时清空状态
const handleBackToUpload = () => {
  uploaded.value = false;
  // 清空结果数据
  result.value = null;
  // 清空采样信息
  collectionInfo.value = undefined;
  // 清空初始化图片数据，这样UploadPage组件会重新初始化
  initImages.value = [];
  initPreviews.value = [];
};

// 生命周期钩子
onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>
