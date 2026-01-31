<template>
  <div class="hail-response-feedback">
    <el-card>
      <el-table :data="feedbacks" style="width: 100%" class="mt-3">
        <el-table-column prop="unit" label="响应单位" />
        <el-table-column prop="alertLevel" label="预警级别" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.alertLevel === '红' ? 'danger' : 'warning'">{{
              scope.row.alertLevel === '橙' ? '橙色预警' : '红色预警'
            }}</el-tag>
          </template>
        </el-table-column>
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

    <el-dialog v-model="dialogVisible" title="冰雹预警反馈详情" width="500px">
      <div>
        <p><strong>单位：</strong> {{ currentFeedback.unit }}</p>

        <p>
          <strong>预警级别：</strong>

          <el-tag :type="currentFeedback.alertLevel === '红' ? 'danger' : 'warning'">
            {{ currentFeedback.alertLevel === '橙' ? '橙色预警(6小时内)' : '红色预警(2小时内)' }}
          </el-tag>
        </p>

        <p><strong>接收时间：</strong> {{ currentFeedback.receivedTime }}</p>

        <p><strong>状态：</strong> {{ currentFeedback.status }}</p>

        <p><strong>反馈内容：</strong></p>

        <p>{{ currentFeedback.content || '暂无反馈内容' }}</p>
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
  alertLevel: string;
  receivedTime: string;
  status: string;
  content: string;
}

const feedbacks = ref<Feedback[]>([
  { unit: '沙家店镇001号', alertLevel: '橙', receivedTime: '2025-05-20 09:00', status: '已反馈', content: '已通知各村做好防范准备' },
  { unit: '印斗镇101号', alertLevel: '红', receivedTime: '2025-05-20 09:10', status: '已反馈', content: '已启动应急响应，人员已疏散' },
  { unit: '龙镇201号', alertLevel: '橙', receivedTime: '2025-05-20 09:15', status: '未反馈', content: '' }
]);

const dialogVisible = ref(false);
const currentFeedback = ref<Feedback>({
  unit: '',
  alertLevel: '',
  receivedTime: '',
  status: '',
  content: ''
});

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
