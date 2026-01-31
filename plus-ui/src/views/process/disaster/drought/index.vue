<template>
  <el-container class="drought-dashboard">
    <el-aside width="200px">
      <el-menu :default-active="activeMenu" :router="false" class="el-menu-vertical" @select="handleSelect">
        <el-menu-item index="1">干旱预警</el-menu-item>
        <el-menu-item index="2">历史干旱情况</el-menu-item>
        <el-menu-item index="3">统计分析</el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-main>
        <component :is="currentComponent" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

import Alert from './components/Alert.vue';
import History from './components/History.vue';
import StatisticsAnalysis from './components/StatisticsAnalysis.vue';
import Notifications from './components/Notifications.vue';

const activeMenu = ref('1');
const currentComponent = ref(Alert);

const menuMap = {
  '1': 'Alert',
  '2': 'History',
  '3': 'StatisticsAnalysis',
  '4': 'Notifications'
};

const componentMap = {
  Alert,
  History,
  StatisticsAnalysis,
  Notifications
};

watch(activeMenu, (val) => {
  const compName = menuMap[val] || 'Alert';
  currentComponent.value = componentMap[compName];
});

function handleSelect(index: string) {
  activeMenu.value = index;
}
</script>

<style scoped>
.drought-dashboard {
  height: 100vh;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}
</style>
