<template>
  <el-container class="hail-dashboard">
    <el-aside width="200px">
      <el-menu :default-active="activeMenu" :router="false" class="el-menu-vertical" @select="handleSelect">
        <el-menu-item index="1">冰雹预警</el-menu-item>
        <el-menu-item index="2">历史冰雹情况</el-menu-item>
        <el-menu-item index="3">统计分析</el-menu-item>
        <!--        <el-menu-item index="4">预警规则配置</el-menu-item -->
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
import HailAlert from './components/HailAlert.vue';
import HailHistory from './components/HailHistory.vue';
import HailStatistics from './components/HailStatistics.vue';
// import HailRules from './components/HailRules.vue';

const activeMenu = ref('1');
const currentComponent = ref(HailAlert);

const menuMap = {
  '1': 'HailAlert',
  '2': 'HailHistory',
  '3': 'HailStatistics'
  //   '4': 'HailRules'
};

const componentMap = {
  HailAlert,
  HailHistory,
  HailStatistics
  //   HailRules
};

watch(activeMenu, (val) => {
  const compName = menuMap[val] || 'HailAlert';
  currentComponent.value = componentMap[compName];
});

function handleSelect(index: string) {
  activeMenu.value = index;
}
</script>

<style scoped>
.hail-dashboard {
  height: 100vh;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}
</style>
