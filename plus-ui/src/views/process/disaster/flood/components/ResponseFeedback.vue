<template>
  <div class="response-feedback">
    <el-card>
      <el-table :data="feedbacks" style="width: 100%" class="mt-3">
        <el-table-column prop="unit" label="响应单位" />
        <el-table-column prop="receivedTime" label="接收时间" width="180" />
        <el-table-column prop="status" label="反馈状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已反馈' ? 'success' : 'warning'">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="反馈内容" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" text @click="viewFeedback(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="反馈详情" width="500px">
      <div>
        <p><strong>单位：</strong>{{ currentFeedback.unit }}</p>
        <p><strong>时间：</strong>{{ currentFeedback.receivedTime }}</p>
        <p><strong>状态：</strong>{{ currentFeedback.status }}</p>
        <p><strong>内容：</strong></p>
        <p>{{ currentFeedback.content }}</p>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface Feedback {
  unit: string;
  receivedTime: string;
  status: string;
  content: string;
}

const feedbacks = ref<Feedback[]>([
  { unit: '侯家沟001号', receivedTime: '2025-05-20 09:00', status: '已反馈', content: '已完成现场巡查，暂无风险。' },
  { unit: '侯家沟002号', receivedTime: '2025-05-20 09:10', status: '未反馈', content: '' }
]);

const dialogVisible = ref(false);
const currentFeedback = ref<Feedback>({ unit: '', receivedTime: '', status: '', content: '' });

function viewFeedback(fb: Feedback) {
  currentFeedback.value = { ...fb };
  dialogVisible.value = true;
}
</script>

<style scoped>
.mt-3 {
  margin-top: 15px;
}
</style>
