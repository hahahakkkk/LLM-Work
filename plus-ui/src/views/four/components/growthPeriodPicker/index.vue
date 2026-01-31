<template>
  <div class="growth-period-picker">
    <el-popover v-model:visible="visible" placement="bottom" :width="320" trigger="click" popper-class="growth-period-popover">
      <template #reference>
        <el-input v-model="displayValue" placeholder="选择生育期" readonly :style="{ width: '125px' }" :prefix-icon="icon" />
      </template>

      <div class="growth-period-panel">
        <!-- 年份选择区域（顶部） -->
        <div class="year-header">
          <el-icon @click="changeYear(-1)" class="arrow-icon">
            <DArrowLeft />
          </el-icon>
          <span class="year-text">{{ selectedYear }}年</span>
          <el-icon @click="changeYear(1)" class="arrow-icon">
            <DArrowRight />
          </el-icon>
        </div>

        <!-- 生育期选择区域（下方网格） -->
        <div class="period-grid">
          <div
            v-for="dict in growthPeriodDict"
            :key="dict.value"
            class="period-item"
            :class="{
              'is-selected': selectedPeriod === dict.value,
              'is-active': isCurrentPeriod(dict.value)
            }"
            @click="selectPeriod(dict)"
          >
            {{ dict.label }}
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Calendar, DArrowLeft, DArrowRight } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  growthPeriodDict: {
    type: Array as () => Array<{ label: string; value: string }>,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const visible = ref(false);
const selectedYear = ref(new Date().getFullYear().toString());
const selectedPeriod = ref('');

// 显示值
const displayValue = computed(() => {
  if (!selectedYear.value || !selectedPeriod.value) return '';
  const periodLabel = props.growthPeriodDict.find((item) => item.value === selectedPeriod.value)?.label || '';
  return `${selectedYear.value}-${periodLabel}`;
});

// 图标
const icon = computed(() => Calendar);

// 获取当前年份和生育期（用于高亮当前周期）
const isCurrentPeriod = (value: string) => {
  // 根据当前日期判断是否在对应生育期
  // 这里需要根据实际业务逻辑实现
  return false;
};

// 选择生育期
const selectPeriod = (dict: { label: string; value: string }) => {
  selectedPeriod.value = dict.value;
  syncValue();
  visible.value = false;
};

// 同步值到父组件
const syncValue = () => {
  if (selectedYear.value && selectedPeriod.value) {
    emit('update:modelValue', `${selectedYear.value}-${selectedPeriod.value}`);
  } else {
    emit('update:modelValue', '');
  }
};

// 年份切换
const changeYear = (delta: number) => {
  const year = parseInt(selectedYear.value) + delta;
  selectedYear.value = year.toString();
  syncValue();
};

// 监听外部值变化
watch(
  () => props.modelValue,
  (val) => {
    if (val && val.includes('-')) {
      const [year, period] = val.split('-');
      selectedYear.value = year;
      selectedPeriod.value = period;
    } else {
      selectedYear.value = new Date().getFullYear().toString();
      selectedPeriod.value = '';
    }
  },
  { immediate: true }
);

// 监听内部选择变化
watch([selectedYear, selectedPeriod], syncValue);
</script>

<style scoped>
.year-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.year-text {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.arrow-icon {
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  color: #606266;
}

.arrow-icon:hover {
  color: #409eff;
}

.period-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 16px;
}

.period-item {
  padding: 8px 4px;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  background: transparent; /* 移除默认底色 */
  border: 1px solid transparent;
  transition: all 0.3s;
}

.period-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

.period-item.is-selected {
  background: #409eff;
  color: #fff;
}

.period-item.is-active {
  border: 1px solid #409eff;
}
</style>

<style>
/* Popover 全局样式覆盖 */
.growth-period-popover {
  padding: 0 !important;
}

.growth-period-popover .el-popper__arrow {
  display: none;
}
</style>
