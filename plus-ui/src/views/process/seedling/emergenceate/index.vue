<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onActivated, watchEffect, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Document } from '@element-plus/icons-vue';

// API 和类型定义
import { fetchBases, fetchFarmerLands } from './api';
import type { BbiBaseVo, LandUnitVo } from './api/types';

// 组件
import NewDetectComponent from './newdetect.vue';
import HistoryComponent from './history.vue';

defineOptions({
  name: 'ProcessSeedlingEmergenceRate'
});

// 从API获取的数据
const bases = ref<BbiBaseVo[]>([]);
const lands = ref<LandUnitVo[]>([]);

// 用户的选择和筛选条件
const selectedBaseId = ref<number>();
const selectedLandId = ref<number>();

// 显示模式控制
const displayMode = ref<'detection' | 'history'>('history');

// newdetect组件引用
const newDetectRef = ref<InstanceType<typeof NewDetectComponent>>();

// --- 新地块检测和历史记录功能 ---
/** 新检测保存回调 */
const handleNewDetectSave = (result: any) => {
  console.log('新检测结果保存:', result);
  // 可以在这里处理保存逻辑，比如更新统计数据等
  ElMessage.success('检测结果已保存');
  // 保存后切换到历史记录
  displayMode.value = 'history';
};

// --- 生命周期钩子 ---
onMounted(async () => {
  try {
    const baseRes = await fetchBases();

    bases.value = baseRes.rows;
    if (bases.value.length > 0) {
      selectedBaseId.value = bases.value[0].baseId;
    }
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    ElMessage.error('初始化页面数据失败');
  }
});

watchEffect(async () => {
  if (selectedBaseId.value === undefined) return;

  try {
    selectedLandId.value = undefined;
    const landRes = await fetchFarmerLands({ baseId: String(selectedBaseId.value) });
    lands.value = landRes.rows;
    if (lands.value.length > 0) {
      selectedLandId.value = lands.value[0].landId;
    }
  } catch (error) {
    console.error('Failed to fetch farmer lands:', error);
    ElMessage.error('获取地块列表失败');
  }
});

// 页面卸载前清理资源
onBeforeUnmount(() => {
  // 清理所有响应式数据
  bases.value = [];
  lands.value = [];

  // 清理选择状态
  selectedBaseId.value = undefined;
  selectedLandId.value = undefined;

  console.log('出苗率页面资源已清理');
});

// 页面激活时重新初始化（从其他页面返回时）
onActivated(async () => {
  console.log('出苗率页面被激活，重新初始化数据');

  // 延迟一下确保DOM完全渲染
  await nextTick();

  try {
    // 重新获取基础数据
    const baseRes = await fetchBases();
    bases.value = baseRes.rows;

    if (bases.value.length > 0) {
      selectedBaseId.value = bases.value[0].baseId;
    }

    console.log('出苗率页面数据重新初始化完成');
  } catch (error) {
    console.error('重新初始化页面数据失败:', error);
  }
});
</script>

<template>
  <div class="emergence-rate-page">
    <div style="padding: 15px">
      <!-- 功能选择 -->
      <div class="function-selector">
        <el-button :type="displayMode === 'history' ? 'primary' : 'default'" size="large" class="function-button" @click="displayMode = 'history'">
          <el-icon class="button-icon"><Document /></el-icon>
          <span class="button-text">历史检测记录</span>
        </el-button>
        <el-button
          :type="displayMode === 'detection' ? 'primary' : 'default'"
          size="large"
          class="function-button"
          @click="displayMode = 'detection'"
        >
          <el-icon class="button-icon"><Search /></el-icon>
          <span class="button-text">新地块检测</span>
        </el-button>
      </div>

      <!-- 新检测展示区域 -->
      <div v-if="displayMode === 'detection'" class="detection-section mt-4">
        <NewDetectComponent ref="newDetectRef" @save="handleNewDetectSave" />
      </div>

      <!-- 历史检测记录展示区域 -->
      <div v-if="displayMode === 'history'" class="history-section mt-4">
        <HistoryComponent />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.function-selector {
  display: flex;
  gap: 8px;

  .function-button {
    flex: 1;
    height: 80px;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;

    .button-icon {
      font-size: 24px;
      margin-right: 12px;
    }

    .button-text {
      font-size: 16px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
