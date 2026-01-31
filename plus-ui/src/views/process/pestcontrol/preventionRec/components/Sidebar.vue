<template>
  <div class="sidebar">
    <div v-for="item in root" :key="item.name">
      <div
        class="sidebar-item"
        :class="{ 'active': props.currentActiveItem === item }"
        :style="{ 'padding-left': depth + 1 + 'rem' }"
        @click="onSidebarClick(item)"
      >
        {{ item.name }}
      </div>
      <Sidebar
        v-if="item.children && item.children.length > 0"
        :root="item.children"
        :current-active-item="props.currentActiveItem"
        :depth="props.depth + 1"
        @click-sidebar="onSidebarClick"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SidebarItem } from '../types';

const props = defineProps<{
  root: SidebarItem[];
  currentActiveItem: SidebarItem;
  depth: number;
}>();

const emit = defineEmits<{
  (e: 'clickSidebar', item: SidebarItem): void;
}>();

const onSidebarClick = (item: SidebarItem) => {
  if (item.children) return;
  emit('clickSidebar', item);
};
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.sidebar-item {
  flex-grow: 1;
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-regular);
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  user-select: none;
}

.active,
.sidebar-item:hover {
  color: var(--el-menu-active-color);
  background-color: var(--el-fill-color-light);
  border-left: 2px solid var(--el-menu-active-color);
}
</style>
