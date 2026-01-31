<!-- BaseSelector.vue -->
<template>
  <el-select
    v-model="localBaseId"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :style="{ width: width }"
    @change="handleChange"
  >
    <el-option v-for="dict in baseDict" :key="dict.value" :label="dict.label" :value="dict.value" />
  </el-select>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { baseDictQuery } from '@/views/process/growth/api/tableDict';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    clearable?: boolean;
    disabled?: boolean;
    width?: string;
  }>(),
  {
    placeholder: '请选择基地',
    clearable: true,
    disabled: false,
    width: '100%'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void;
  (e: 'change', value: string | undefined): void;
}>();

const localBaseId = ref(props.modelValue);
const baseDict = ref<DictDataOption[]>([]);

// 获取基地字典
const loadBaseDict = async () => {
  try {
    const res = await baseDictQuery();
    baseDict.value =
      res.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];
  } catch (error) {
    console.error('获取基地字典失败:', error);
    baseDict.value = [];
  }
};

// 处理变化事件
const handleChange = (value: string | undefined) => {
  emit('update:modelValue', value);
  emit('change', value);
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    localBaseId.value = newVal;
  }
);

// 监听本地值变化并触发更新
watch(localBaseId, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal);
  }
});

// 组件挂载时获取基地字典
onMounted(() => {
  loadBaseDict();
});

// 提供给外部调用的方法
defineExpose({
  loadBaseDict
});
</script>
