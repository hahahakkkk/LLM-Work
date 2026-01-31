<template>
  <div class="hail-alert">
    <el-card>
      <div class="header">
        <el-button type="primary" @click="openPublishDialog">发布冰雹预警</el-button>
      </div>

      <el-table :data="alerts" style="width: 100%" class="mt-3">
        <el-table-column prop="id" label="预警编号" width="120" />
        <el-table-column prop="level" label="级别" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.level === '红' ? 'danger' : 'warning'">{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="area" label="预警区域" />
        <el-table-column prop="content" label="内容摘要" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已发布' ? 'success' : 'info'">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180" />
        <el-table-column label="操作" width="160">
          <template #default="scope">
            <el-button type="primary" text @click="viewDetail(scope.row)">查看</el-button>
            <el-button v-if="scope.row.status === '待发布'" type="success" text @click="publish(scope.row)">发布</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 发布预警弹窗 -->
      <el-dialog v-model="dialogVisible" title="发布冰雹预警" width="600px">
        <el-form :model="form" label-width="100px">
          <el-form-item label="预警级别">
            <el-select v-model="form.level" placeholder="请选择">
              <el-option label="橙色预警" value="橙" />
              <el-option label="红色预警" value="红" />
            </el-select>
          </el-form-item>

          <el-form-item label="区域">
            <el-input v-model="form.area" placeholder="如：西城区" />
          </el-form-item>

          <el-form-item label="预计时间">
            <el-input v-model="form.expectedTime" placeholder="如：2小时内" />
          </el-form-item>

          <el-form-item label="内容摘要">
            <el-input v-model="form.content" type="textarea" rows="4" placeholder="请输入简要内容" />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmPublish">确认发布</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface Alert {
  id: string;
  level: string;
  area: string;
  expectedTime: string;
  content: string;
  status: string;
  publishTime: string;
}

const alerts = ref<Alert[]>([
  {
    id: 'H20240501',
    level: '橙',
    area: '姜兴庄智慧引领种植基地',
    expectedTime: '6小时内',
    content: '预计出现冰雹天气',
    status: '已发布',
    publishTime: '2025-05-20 08:30'
  },
  {
    id: 'H20240502',
    level: '红',
    area: '侯家沟智慧引领种植基地',
    expectedTime: '2小时内',
    content: '可能出现强冰雹',
    status: '待发布',
    publishTime: ''
  }
]);

const dialogVisible = ref(false);
const form = ref<Omit<Alert, 'id' | 'publishTime' | 'status'>>({
  level: '',
  area: '',
  expectedTime: '',
  content: ''
});

function openPublishDialog() {
  form.value = { level: '', area: '', expectedTime: '', content: '' };
  dialogVisible.value = true;
}

function confirmPublish() {
  const newId = `H${new Date().getTime()}`;
  alerts.value.push({
    id: newId,
    level: form.value.level,
    area: form.value.area,
    expectedTime: form.value.expectedTime,
    content: form.value.content,
    status: '已发布',
    publishTime: new Date().toLocaleString()
  });
  dialogVisible.value = false;
}

function publish(alert: Alert) {
  alert.status = '已发布';
  alert.publishTime = new Date().toLocaleString();
}

function viewDetail(alert: Alert) {
  alert(`冰雹预警详情
区域：${alert.area}
级别：${alert.level === '橙' ? '橙色预警(6小时内)' : '红色预警(2小时内)'}
预计时间：${alert.expectedTime}
内容：${alert.content}`);
}
</script>

<style scoped>
.hail-alert .header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.mt-3 {
  margin-top: 15px;
}
</style>
