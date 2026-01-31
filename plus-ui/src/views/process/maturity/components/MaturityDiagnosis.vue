<template>
  <div class="maturity-diagnosis-container">
    <el-dialog v-model="dialogVisible" title="成熟度诊断" width="50%" :before-close="handleClose">
      <div class="diagnosis-content">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" label-position="left">
          <el-form-item label="诊断日期" prop="diagnosisDate">
            <el-date-picker v-model="formData.diagnosisDate" type="date" placeholder="选择诊断日期" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>

          <el-form-item label="诊断地块" prop="plot">
            <el-select v-model="formData.plot" placeholder="请选择诊断地块" style="width: 100%">
              <el-option v-for="plot in plotOptions" :key="plot.value" :label="plot.label" :value="plot.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="成熟度指数" prop="maturityIndex">
            <el-input-number v-model="formData.maturityIndex" :min="0" :max="100" :step="0.1" controls-position="right" style="width: 100%" />
          </el-form-item>

          <el-form-item label="叶绿素含量" prop="spad">
            <el-input-number v-model="formData.spad" :min="0" :max="100" :step="0.1" controls-position="right" style="width: 100%" />
          </el-form-item>

          <el-form-item label="生长状态" prop="growthStatus">
            <el-radio-group v-model="formData.growthStatus">
              <el-radio label="normal">正常</el-radio>
              <el-radio label="warning">预警</el-radio>
              <el-radio label="danger">异常</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="诊断描述" prop="description">
            <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入诊断描述" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['completed']);

const dialogVisible = ref(true);

const formData = ref({
  diagnosisDate: '',
  plot: '',
  maturityIndex: 85.6,
  spad: 46.8,
  growthStatus: 'normal',
  description: '作物生长状态良好，成熟度指数较高，预计12天后可收获。'
});

const formRules = {
  diagnosisDate: [{ required: true, message: '请选择诊断日期', trigger: 'change' }],
  plot: [{ required: true, message: '请选择诊断地块', trigger: 'change' }],
  maturityIndex: [{ required: true, message: '请输入成熟度指数', trigger: 'blur' }],
  spad: [{ required: true, message: '请输入叶绿素含量', trigger: 'blur' }],
  growthStatus: [{ required: true, message: '请选择生长状态', trigger: 'change' }],
  description: [{ required: true, message: '请输入诊断描述', trigger: 'blur' }]
};

const plotOptions = ref([
  { value: 'hjgn001', label: '侯家沟南地块001' },
  { value: 'hjgn002', label: '侯家沟南地块002' },
  { value: 'hjg001', label: '侯家沟地块001' },
  { value: 'hjg002', label: '侯家沟地块002' }
]);

const handleClose = () => {
  dialogVisible.value = false;
};

const handleSubmit = () => {
  console.log('提交成熟度诊断数据:', formData.value);
  emit('completed');
  handleClose();
};

// 暴露给父组件的方法
defineExpose({
  show: () => {
    dialogVisible.value = true;
  }
});
</script>

<style scoped lang="scss">
.maturity-diagnosis-container {
  :deep(.el-dialog) {
    border-radius: 0.8vh;

    .el-dialog__header {
      padding: 2vh;
      border-bottom: 0.1vh solid #f0f0f0;

      .el-dialog__title {
        font-size: 2vh;
        font-weight: 600;
        color: #303133;
      }
    }

    .el-dialog__body {
      padding: 2vh;
    }

    .el-dialog__footer {
      padding: 2vh;
      border-top: 0.1vh solid #f0f0f0;
    }
  }

  .diagnosis-content {
    .el-form {
      .el-form-item {
        margin-bottom: 2vh;

        :deep(.el-form-item__label) {
          font-size: 2vh;
          color: #606266;
        }

        :deep(.el-input__inner),
        :deep(.el-textarea__inner) {
          font-size: 2vh;
        }
      }
    }
  }

  .dialog-footer {
    .el-button {
      padding: 1.2vh 2vh;
      font-size: 2vh;
    }
  }
}
</style>
