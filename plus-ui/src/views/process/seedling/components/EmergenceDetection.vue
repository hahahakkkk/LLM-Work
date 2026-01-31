<script setup lang="ts">
import { ref } from 'vue';

// 定义emits
const emit = defineEmits(['completed']);

// 对话框显示状态
const dialogVisible = ref(false);

// 表单数据
const formData = ref({
  baseId: '',
  plotId: '',
  growthPeriod: '',
  detectionTime: '',
  imageFile: null
});

// 基地字典数据（模拟）
const baseDict = ref([
  { label: '侯家沟数字化种植基地', value: '1880899316147232770' },
  { label: '姜兴庄智慧引领种植基地', value: '1880899316147232771' }
]);

// 显示添加对话框
const showAddDialog = () => {
  dialogVisible.value = true;
};

// 设置默认值
const setDefaultValues = async (values: any) => {
  formData.value = { ...formData.value, ...values };
};

// 获取字典数据
const getDicts = () => {
  // 模拟获取字典数据
  console.log('获取基地字典数据');
};

// 提交表单
const handleSubmit = () => {
  console.log('提交出苗率检测表单:', formData.value);

  // 模拟检测完成
  setTimeout(() => {
    emit('completed');
    dialogVisible.value = false;
  }, 1000);
};

// 取消操作
const handleCancel = () => {
  dialogVisible.value = false;
};

// 暴露方法给父组件
defineExpose({
  showAddDialog,
  setDefaultValues,
  getDicts,
  baseDict
});
</script>

<template>
  <el-dialog v-model="dialogVisible" title="出苗率检测" width="600px" append-to-body>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="基地">
        <el-select v-model="formData.baseId" placeholder="请选择基地" style="width: 100%">
          <el-option v-for="base in baseDict" :key="base.value" :label="base.label" :value="base.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="地块ID">
        <el-input v-model="formData.plotId" placeholder="请输入地块ID" />
      </el-form-item>

      <el-form-item label="生育期">
        <el-input v-model="formData.growthPeriod" placeholder="生育期" readonly />
      </el-form-item>

      <el-form-item label="检测时间">
        <el-input v-model="formData.detectionTime" placeholder="检测时间" readonly />
      </el-form-item>

      <el-form-item label="上传图像">
        <el-upload class="upload-demo" drag action="#" :auto-upload="false" accept="image/*">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">开始检测</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  text-align: right;
}

.upload-demo {
  width: 100%;
}
</style>
