<template>
  <div class="hail-rules">
    <el-card>
      <div class="header">
        <el-button type="primary" @click="openRuleDialog">新增规则</el-button>
      </div>

      <el-table :data="rules" style="width: 100%" class="mt-3">
        <el-table-column prop="level" label="预警级别" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.level === '红' ? 'danger' : 'warning'">{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="conditions" label="规则条件" />
        <el-table-column prop="area" label="监控区域" />
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="scope">
            <el-switch v-model="scope.row.enabled" @change="toggleEnable(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="scope">
            <el-button type="primary" text @click="editRule(scope.row)">编辑</el-button>
            <el-button type="danger" text @click="deleteRule(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 规则弹窗 -->
      <el-dialog v-model="dialogVisible" title="冰雹预警规则配置" width="600px">
        <el-form :model="form" label-width="100px">
          <el-form-item label="预警级别">
            <el-select v-model="form.level" placeholder="请选择">
              <el-option label="橙色预警" value="橙" />
              <el-option label="红色预警" value="红" />
            </el-select>
          </el-form-item>

          <el-form-item label="规则条件">
            <el-input v-model="form.conditions" placeholder="如：雷达反射率 > 50dBz 且云顶温度 < -20°C" />
          </el-form-item>

          <el-form-item label="监控区域">
            <el-input v-model="form.area" placeholder="如：侯家沟001" />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRule">保存</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface Rule {
  level: string;
  conditions: string;
  area: string;
  enabled: boolean;
}

const rules = ref<Rule[]>([
  { level: '橙', conditions: '雷达反射率 > 50dBz 且云顶温度 < -20°C', area: '侯家沟001', enabled: true },
  { level: '红', conditions: '雷达反射率 > 60dBz 且云顶温度 < -30°C', area: '侯家沟002', enabled: true }
]);

const dialogVisible = ref(false);
const form = ref<Rule>({ level: '', conditions: '', area: '', enabled: true });

function openRuleDialog() {
  form.value = { level: '', conditions: '', area: '', enabled: true };
  dialogVisible.value = true;
}

function editRule(rule: Rule) {
  form.value = { ...rule };
  dialogVisible.value = true;
}

function saveRule() {
  const index = rules.value.findIndex((r) => r.level === form.value.level && r.area === form.value.area);
  if (index >= 0) rules.value[index] = { ...form.value };
  else rules.value.push({ ...form.value });
  dialogVisible.value = false;
}

function deleteRule(rule: Rule) {
  rules.value = rules.value.filter((r) => r !== rule);
}

function toggleEnable(rule: Rule) {
  console.log('切换状态:', rule);
}
</script>

<style scoped>
.hail-rules .header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.mt-3 {
  margin-top: 15px;
}
</style>
