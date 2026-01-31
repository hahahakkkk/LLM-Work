<template>
  <div class="h-full w-full flex flex-col overflow-hidden" style="height: calc(100vh - 84px)">
    <div class="main-area rounded-lg">
      <!-- 筛选器区域 -->
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item">
            <label>内容类型:</label>
            <el-select v-model="selectedCategory" placeholder="请选择内容类型" @change="handleCategoryChange">
              <el-option label="病虫害百科" value="encyclopedia" />
              <el-option label="常见病虫害" value="common" />
              <el-option label="科学种植与预防" value="prevention" />
            </el-select>
          </div>

          <div v-if="selectedCategory === 'encyclopedia'" class="filter-item">
            <label>百科类型:</label>
            <el-select v-model="selectedEncyclopediaType" placeholder="请选择百科类型">
              <el-option label="病虫害定义" value="definition" />
              <el-option label="病虫害分类" value="classification" />
              <el-option label="病虫害危害" value="damage" />
            </el-select>
          </div>

          <div v-if="selectedCategory === 'common'" class="filter-item">
            <label>病虫害类型:</label>
            <el-select v-model="selectedPestType" placeholder="请选择病虫害类型" @change="handlePestTypeChange">
              <el-option label="病害" value="disease" />
              <el-option label="虫害" value="pest" />
            </el-select>
          </div>

          <div v-if="selectedCategory === 'common' && selectedPestType" class="filter-item">
            <label>具体类别:</label>
            <el-select v-model="selectedSpecificType" placeholder="请选择具体类别">
              <el-option v-for="option in specificTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </div>

          <div v-if="selectedCategory === 'prevention'" class="filter-item">
            <label>视频内容:</label>
            <el-select v-model="selectedVideo" placeholder="请选择视频">
              <el-option v-for="video in videoOptions" :key="video.value" :label="video.label" :value="video.value" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 内容显示区域 -->
      <div class="content-area">
        <template v-if="selectedCategory === 'encyclopedia'">
          <Home :row="currentEncyclopediaContent" />
        </template>
        <template v-if="selectedCategory === 'common' && currentPestContent">
          <Description :row="currentPestContent" />
        </template>
        <template v-if="selectedCategory === 'prevention' && currentVideoContent">
          <VideoPage :row="currentVideoContent" />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import Description from './components/Description.vue';
import VideoPage from './components/VideoPage.vue';
import Home from './components/Home.vue';
import { SidebarItem } from './types';
import { list as classifyList } from '@/views/process/api/pestcontrol/preventionRec/classify';
import { list as videoList } from '@/views/process/api/pestcontrol/preventionRec/prevence';
import type { Row } from '@/views/process/api/pestcontrol/preventionRec/classify/types';
import type { VideoRow } from '@/views/process/api/pestcontrol/preventionRec/prevence/types';

// 筛选器状态
const selectedCategory = ref<string>('common');
const selectedEncyclopediaType = ref<string>('definition');
const selectedPestType = ref<string>('disease');
const selectedSpecificType = ref<string>('');
const selectedVideo = ref<string>('');

// 数据存储
const diseaseCategories = ref<Array<{ name: string; items: Row[] }>>([]);
const pestCategories = ref<Array<{ name: string; items: Row[] }>>([]);
const videoData = ref<VideoRow[]>([]);

// 选项计算
const specificTypeOptions = computed(() => {
  if (selectedPestType.value === 'disease') {
    return diseaseCategories.value.map((cat) => ({
      label: cat.name,
      value: cat.name
    }));
  } else if (selectedPestType.value === 'pest') {
    return pestCategories.value.map((cat) => ({
      label: cat.name,
      value: cat.name
    }));
  }
  return [];
});

const videoOptions = computed(() => {
  return videoData.value.map((video) => ({
    label: video.name,
    value: video.id.toString()
  }));
});

// 当前显示内容
const currentEncyclopediaContent = computed<SidebarItem>(() => {
  return {
    name:
      selectedEncyclopediaType.value === 'definition'
        ? '病虫害定义'
        : selectedEncyclopediaType.value === 'classification'
          ? '病虫害分类'
          : '病虫害危害'
  };
});

const currentPestContent = computed<SidebarItem | null>(() => {
  if (!selectedSpecificType.value) return null;

  const categories = selectedPestType.value === 'disease' ? diseaseCategories.value : pestCategories.value;
  const category = categories.find((cat) => cat.name === selectedSpecificType.value);

  if (category) {
    return {
      name: category.name,
      payload: category.items
    };
  }

  return null;
});

const currentVideoContent = computed<SidebarItem | null>(() => {
  if (!selectedVideo.value) return null;

  const video = videoData.value.find((v) => v.id.toString() === selectedVideo.value);
  if (video) {
    return {
      name: video.name,
      payload: video
    };
  }

  return null;
});

// 事件处理
const handleCategoryChange = () => {
  if (selectedCategory.value === 'encyclopedia') {
    // 默认选择病虫害定义
    selectedEncyclopediaType.value = 'definition';
    // 清除其他选择
    selectedPestType.value = '';
    selectedSpecificType.value = '';
    selectedVideo.value = '';
  } else if (selectedCategory.value === 'common') {
    // 默认选择病害，并设置默认的具体类别
    selectedPestType.value = 'disease';
    if (diseaseCategories.value.length > 0) {
      selectedSpecificType.value = diseaseCategories.value[0].name;
    }
    // 清除其他选择
    selectedEncyclopediaType.value = 'definition';
    selectedVideo.value = '';
  } else if (selectedCategory.value === 'prevention') {
    // 默认选择第一个视频
    if (videoData.value.length > 0) {
      selectedVideo.value = videoData.value[0].id.toString();
    }
    // 清除其他选择
    selectedEncyclopediaType.value = 'definition';
    selectedPestType.value = '';
    selectedSpecificType.value = '';
  }
};

const handlePestTypeChange = () => {
  // 根据病虫害类型设置默认的具体类别
  if (selectedPestType.value === 'disease' && diseaseCategories.value.length > 0) {
    selectedSpecificType.value = diseaseCategories.value[0].name;
  } else if (selectedPestType.value === 'pest' && pestCategories.value.length > 0) {
    selectedSpecificType.value = pestCategories.value[0].name;
  } else {
    selectedSpecificType.value = '';
  }
};

// 数据获取
const getList = async () => {
  const res = await classifyList();
  const diseaseMap = new Map<string, Row[]>();
  const pestMap = new Map<string, Row[]>();

  (res.rows as unknown as Row[]).forEach((element) => {
    if (element.type.endsWith('病害')) {
      const diseaseName = element.type;
      if (!diseaseMap.has(diseaseName)) {
        diseaseMap.set(diseaseName, []);
      }
      diseaseMap.get(diseaseName)!.push(element);
    } else {
      const pestName = element.type;
      if (!pestMap.has(pestName)) {
        pestMap.set(pestName, []);
      }
      pestMap.get(pestName)!.push(element);
    }
  });

  diseaseCategories.value = Array.from(diseaseMap.entries()).map(([name, items]) => ({
    name,
    items
  }));

  pestCategories.value = Array.from(pestMap.entries()).map(([name, items]) => ({
    name,
    items
  }));
};

const getVideoList = async () => {
  const res = await videoList();
  videoData.value = res.rows as unknown as VideoRow[];
};

// 设置默认选择的辅助函数
const setDefaultSelections = () => {
  if (selectedCategory.value === 'common') {
    // 如果还没有选择病虫害类型，默认选择病害
    if (!selectedPestType.value) {
      if (diseaseCategories.value.length > 0) {
        selectedPestType.value = 'disease';
        selectedSpecificType.value = diseaseCategories.value[0].name;
      } else if (pestCategories.value.length > 0) {
        selectedPestType.value = 'pest';
        selectedSpecificType.value = pestCategories.value[0].name;
      }
    }
    // 如果已经选择了类型但没有具体类别，设置默认的具体类别
    else if (!selectedSpecificType.value) {
      if (selectedPestType.value === 'disease' && diseaseCategories.value.length > 0) {
        selectedSpecificType.value = diseaseCategories.value[0].name;
      } else if (selectedPestType.value === 'pest' && pestCategories.value.length > 0) {
        selectedSpecificType.value = pestCategories.value[0].name;
      }
    }
  } else if (selectedCategory.value === 'prevention') {
    // 如果还没有选择视频，默认选择第一个
    if (!selectedVideo.value && videoData.value.length > 0) {
      selectedVideo.value = videoData.value[0].id.toString();
    }
  }
};

onMounted(async () => {
  // 加载数据
  await Promise.all([getList(), getVideoList()]);

  // 设置默认选择
  setDefaultSelections();
});

// 监听数据变化，确保在数据加载后设置默认选择
watch(
  [diseaseCategories, pestCategories, videoData],
  () => {
    setDefaultSelections();
  },
  { deep: true }
);
</script>

<style scoped>
.main-area {
  margin: 20px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.filter-section {
  background-color: var(--el-bg-color-page);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--el-border-color);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
}

.filter-item label {
  white-space: nowrap;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.filter-item .el-select {
  flex: 1;
  min-width: 150px;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    min-width: unset;
  }
}
</style>
