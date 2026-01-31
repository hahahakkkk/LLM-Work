<template>
  <template v-for="item in props.row.payload as Array<Row>" :key="item.name">
    <h2>{{ item.name }}</h2>
    <el-card style="width: 100%">
      <div class="intro">
        <h3>简介</h3>
        <p>{{ item.intro }}</p>
      </div>
      <div class="feature">
        <h3>症状</h3>
        <p>{{ item.feature }}</p>
      </div>
      <div class="album">
        <img :src="item.pic1" alt="img1" />
        <img :src="item.pic2" alt="img2" />
      </div>
      <div class="strategy">
        <h3>防治策略</h3>
        <el-descriptions border :column="1">
          <el-descriptions-item v-for="(key, value) in item.strategy" :key="key" :label="value.toString()"> {{ key }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </template>
</template>

<script lang="ts" setup>
import { Row } from '@/views/process/api/pestcontrol/preventionRec/classify/types';
import { SidebarItem } from '../types';
const props = defineProps<{
  row: SidebarItem;
}>();
</script>

<style scoped>
h3 {
  width: fit-content;
  border-bottom: 2px solid var(--el-menu-active-color);
}

.album {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  overflow: hidden;
}

.album img {
  width: 48%;
  min-width: 256px;
  max-width: 512px;
  border-radius: 8px;
}
</style>
