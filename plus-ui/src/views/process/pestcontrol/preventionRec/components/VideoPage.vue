<template>
  <div class="videoPage">
    <h2>
      {{ props.row.name }}
    </h2>
    <div v-if="(props.row.payload as VideoRow).pic || (props.row.payload as VideoRow).video" class="media-container" @click="playVideo">
      <video v-if="isPlaying" controls :src="(props.row.payload as VideoRow).video" class="video-player"></video>
      <el-image v-else :src="(props.row.payload as VideoRow).pic" fit="contain" class="preview-image" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { SidebarItem } from '../types';
import type { VideoRow } from '@/views/process/api/pestcontrol/preventionRec/prevence/types';

const props = defineProps<{
  row: SidebarItem;
}>();

const isPlaying = ref(false);

watch(
  () => props.row,
  () => {
    isPlaying.value = false;
  },
  { deep: true }
);

const playVideo = () => {
  if ((props.row.payload as VideoRow).video) {
    isPlaying.value = true;
  }
};
</script>

<style scoped>
h2 {
  width: fit-content;
  border-bottom: 2px solid var(--el-menu-active-color);
  margin-bottom: 20px;
}

.media-container {
  max-width: 1024px;
  cursor: pointer;
}

.video-player {
  width: 100%;
  border-radius: 4px;
  background: #000;
}

.preview-image {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #eee;
}
</style>
