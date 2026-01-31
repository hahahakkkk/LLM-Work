<template>
  <el-container class="flood-warning-dashboard">
    <el-aside width="200px">
      <el-menu :default-active="activeMenu" class="el-menu-vertical">
        <el-menu-item index="2" @click="selectModule('WarningRules')">预警规则配置</el-menu-item>
        <el-menu-item index="3" @click="selectModule('WarningPublish')">预警信息发布</el-menu-item>
        <el-menu-item index="4" @click="selectModule('ResponseFeedback')">响应反馈</el-menu-item>
        <el-menu-item index="5" @click="selectModule('StatisticsAnalysis')">统计分析</el-menu-item>
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
import { ref } from 'vue';

// 模块组件导入
import DataManagement from './components/DataManagement.vue';
import WarningRules from './components/WarningRules.vue';
import WarningPublish from './components/WarningPublish.vue';
import ResponseFeedback from './components/ResponseFeedback.vue';
import StatisticsAnalysis from './components/StatisticsAnalysis.vue';

const activeMenu = ref('1');
const currentComponent = ref<any>(DataManagement);

function selectModule(name: string) {
  activeMenu.value =
    {
      'DataManagement': '1',
      'WarningRules': '2',
      'WarningPublish': '3',
      'ResponseFeedback': '4',
      'StatisticsAnalysis': '5'
    }[name] || '1';

  currentComponent.value =
    {
      'DataManagement': DataManagement,
      'WarningRules': WarningRules,
      'WarningPublish': WarningPublish,
      'ResponseFeedback': ResponseFeedback,
      'StatisticsAnalysis': StatisticsAnalysis
    }[name] || DataManagement;
}
</script>

<style scoped>
.flood-warning-dashboard {
  height: 100vh;
}
.el-menu-vertical {
  height: 100%;
  border-right: none;
}
</style>
