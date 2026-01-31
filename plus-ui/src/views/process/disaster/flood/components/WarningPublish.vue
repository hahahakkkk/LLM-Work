<template>
  <div class="warning-publish">
    <el-card>
      <div class="header">
        <el-button type="primary" @click="openPublishDialog">手动发布预警</el-button>
      </div>

      <el-table :data="warnings" style="width: 100%" class="mt-3">
        <el-table-column prop="id" label="预警编号" width="120" />
        <el-table-column prop="level" label="级别" width="80">
          <template #default="scope">
            <el-tag :type="levelType(scope.row.level)">{{ scope.row.level }}</el-tag>
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
      <el-dialog v-model="dialogVisible" title="发布预警" width="600px">
        <el-form :model="form" label-width="100px">
          <el-form-item label="级别">
            <el-select v-model="form.level" placeholder="请选择">
              <el-option label="蓝色" value="蓝" />
              <el-option label="黄色" value="黄" />
              <el-option label="橙色" value="橙" />
              <el-option label="红色" value="红" />
            </el-select>
          </el-form-item>

          <el-form-item label="区域">
            <el-input v-model="form.area" placeholder="如：西城区" />
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

interface Warning {
  id: string;
  level: string;
  area: string;
  content: string;
  status: string;
  publishTime: string;
}

const warnings = ref<Warning[]>([
  { id: 'W20240501', level: '蓝', area: '江南区', content: '小雨不断，河道水位略升', status: '已发布', publishTime: '2025-05-20 08:30' },
  { id: 'W20240502', level: '黄', area: '中原区', content: '预计强降雨，注意防范', status: '待发布', publishTime: '' }
]);

const dialogVisible = ref(false);
const form = ref<Omit<Warning, 'id' | 'publishTime' | 'status'>>({ level: '', area: '', content: '' });

function openPublishDialog() {
  form.value = { level: '', area: '', content: '' };
  dialogVisible.value = true;
}

function confirmPublish() {
  const newId = `W${new Date().getTime()}`;
  warnings.value.push({
    id: newId,
    level: form.value.level,
    area: form.value.area,
    content: form.value.content,
    status: '已发布',
    publishTime: new Date().toLocaleString()
  });
  dialogVisible.value = false;
}

function publish(warning: Warning) {
  warning.status = '已发布';
  warning.publishTime = new Date().toLocaleString();
}

function viewDetail(warning: Warning) {
  alert(`预警详情\n区域：${warning.area}\n内容：${warning.content}`);
}

function levelType(level: string) {
  return (
    {
      '蓝': 'info',
      '黄': 'warning',
      '橙': 'danger',
      '红': 'danger'
    }[level] || 'default'
  );
}
</script>

<style scoped>
.warning-publish .header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.mt-3 {
  margin-top: 15px;
}
</style>
