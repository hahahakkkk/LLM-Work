<template>
  <div class="nav">
    <div
      v-for="item in props.navs"
      :key="item.name"
      class="nav-item"
      :class="{ 'active': item === props.currentActiveItem }"
      @click="onNavClick(item)"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NavItem } from '../types';

const props = defineProps<{
  navs: NavItem[];
  currentActiveItem: NavItem;
}>();

const emit = defineEmits<{
  (e: 'clickNav', item: NavItem): void;
}>();

const onNavClick = (item) => {
  emit('clickNav', item);
};
</script>

<style scoped>
.nav {
  display: flex;
  width: 100%;
}

.nav-item {
  flex-grow: 1;
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-regular);
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.1em;
  user-select: none;
}

.active,
.nav-item:hover {
  background-color: var(--el-fill-color-light);
  color: var(--el-menu-active-color);
}
</style>
