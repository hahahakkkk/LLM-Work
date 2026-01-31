<script setup lang="ts">
import { ref } from 'vue';

const testData = ref('病虫害防治页面测试');
</script>

<template>
  <div class="pestcontrol-test">
    <h1>{{ testData }}</h1>
    <el-card>
      <p>这是一个简化的测试页面</p>
      <el-button type="primary">测试按钮</el-button>
    </el-card>
  </div>
</template>

<style scoped>
.pestcontrol-test {
  padding: 20px;
}
</style>
