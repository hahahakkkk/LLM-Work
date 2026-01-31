<template>
  <div class="flex flex-col gap-4">
    <el-button @click="back">返回上传页面</el-button>
    <el-card v-for="(identifyResult, identifyResultIndex) in props.results" :key="identifyResultIndex">
      <template #header>
        <div class="flex justify-between items-center">
          <span v-if="'pestTypes' in identifyResult">识别结果： {{ identifyResult.pestTypes }}</span>
          <span v-else>识别结果 {{ identifyResultIndex + 1 }}</span>
          <div>
            <el-button @click="saveToDatabase(identifyResult)">保存至数据库</el-button>
          </div>
        </div>
      </template>
      <img
        style="max-height: 512px"
        :src="identifyResult.imageUrl"
        :alt="'pestTypes' in identifyResult ? identifyResult.pestTypes : `结果${identifyResultIndex + 1}`"
      />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { identifyRgbResponseVO } from '../../../api/pestcontrol/identify/types';
import { identifyWhResponseVO } from '../api/types';

const props = defineProps<{
  results: (identifyRgbResponseVO | identifyWhResponseVO)[] | null;
}>();
const emits = defineEmits(['backto-upload']);
const back = () => {
  emits('backto-upload');
};

const saveToDatabase = (result: identifyRgbResponseVO | identifyWhResponseVO) => {
  // TODO: 保存至数据库
  ElMessage({
    message: '该功能暂未开放',
    type: 'warning'
  });
};
</script>
