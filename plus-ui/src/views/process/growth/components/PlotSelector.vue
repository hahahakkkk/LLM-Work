<!-- PlotSelector.vue -->
<template>
  <el-select v-model="localPlotId" :placeholder="placeholder" :clearable="clearable" :disabled="disabled || !baseId" :style="{ width: width }">
    <el-option v-for="dict in plotDict" :key="dict.value" :label="dict.label" :value="dict.value" />
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    baseId?: string;
    placeholder?: string;
    clearable?: boolean;
    disabled?: boolean;
    width?: string;
  }>(),
  {
    modelValue: '',
    baseId: '',
    placeholder: '请选择地块',
    clearable: true,
    disabled: false,
    width: '100%'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void;
}>();

const localPlotId = ref(props.modelValue);
const plotDict = ref<DictDataOption[]>([]);

// 根据基地获取地块
const loadPlotDictByBase = async (baseId?: string) => {
  if (!baseId) {
    plotDict.value = [];
    localPlotId.value = undefined;
    return;
  }

  try {
    const res = await fetchFarmerLands({ baseId });
    plotDict.value =
      res.rows?.map((item) => ({
        value: String(item.landId),
        label: String(item.landCode)
      })) || [];
  } catch (error) {
    console.error('获取地块字典失败:', error);
    plotDict.value = [];
  }
};

// 监听基地ID变化
watch(
  () => props.baseId,
  (newBaseId, oldBaseId) => {
    if (newBaseId !== oldBaseId) {
      loadPlotDictByBase(newBaseId);
    }
  },
  { immediate: true }
);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    localPlotId.value = newVal;
  }
);

// 监听本地值变化并触发更新
watch(localPlotId, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal);
  }
});

// 提供给外部调用的方法
defineExpose({
  loadPlotDictByBase
});
</script>
