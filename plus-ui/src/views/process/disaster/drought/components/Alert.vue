<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>当前未处理预警</span>
    </div>

    <el-form :model="form" label-width="100px" inline class="query-form">
      <el-form-item label="基地">
        <el-select v-model="form.region" placeholder="请选择基地" style="width: 260px">
          <el-option label="姜兴庄智慧引领种植基地" value="姜兴庄智慧引领种植基地" />
          <el-option label="侯家沟智慧引领种植基地" value="侯家沟智慧引领种植基地" />
          <el-option label="侯家沟数字化种植基地" value="侯家沟数字化种植基地" />
          <el-option label="李家寺数字化种植基地" value="李家寺数字化种植基地" />
          <el-option label="高家硷数字化种植基地" value="高家硷数字化种植基地" />
          <el-option label="冯渠数字化种植基地" value="冯渠数字化种植基地" />
          <el-option label="寺沟数字化种植基地" value="寺沟数字化种植基地" />
          <el-option label="岳家岔数字化种植基地" value="岳家岔数字化种植基地" />
          <el-option label="杨家沟数字化种植基地" value="杨家沟数字化种植基地" />
          <el-option label="巩家沟数字化种植基地" value="巩家沟数字化种植基地" />
        </el-select>
      </el-form-item>

      <el-form-item label="干旱等级">
        <el-select v-model="form.severity" placeholder="请选择等级" style="width: 120px">
          <el-option label="特旱" value="特旱" />
          <el-option label="重旱" value="重旱" />
          <el-option label="中旱" value="中旱" />
          <el-option label="轻旱" value="轻旱" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="pageData" style="width: 100%; margin-top: 20px" border>
      <el-table-column prop="date" label="开始日期" width="120" />
      <el-table-column prop="region" label="基地" width="260" />
      <el-table-column prop="severity" label="干旱等级" width="100" />
      <el-table-column prop="description" label="描述" />
    </el-table>

    <div class="pagination-wrapper" style="text-align: right; margin-top: 15px">
      <el-pagination
        background
        layout="prev, pager, next, jumper"
        :page-size="pageSize"
        :current-page="currentPage"
        :total="filteredData.length"
        @current-change="handlePageChange"
      />
    </div>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';

const form = reactive({
  region: '',
  severity: ''
});

const allData = [
  { date: '2025-05-20', region: '侯家沟数字化种植基地', severity: '轻旱', description: '土壤湿度较低' },
  { date: '2025-05-21', region: '侯家沟数字化种植基地', severity: '中旱', description: '降雨量不足' },
  { date: '2025-05-22', region: '姜兴庄智慧引领种植基地', severity: '重旱', description: '严重干旱影响农作物' },
  { date: '2025-05-23', region: '杨家沟数字化种植基地', severity: '轻旱', description: '土壤湿度稍低' },
  { date: '2025-05-24', region: '李家寺数字化种植基地', severity: '中旱', description: '连续无雨' },
  { date: '2025-05-25', region: '高家硷数字化种植基地', severity: '特旱', description: '极端干旱' },
  { date: '2025-05-26', region: '冯渠数字化种植基地', severity: '重旱', description: '作物严重受损' },
  { date: '2025-05-27', region: '寺沟数字化种植基地', severity: '轻旱', description: '降雨稍有减少' },
  { date: '2025-05-28', region: '岳家岔数字化种植基地', severity: '中旱', description: '土壤水分不足' },
  { date: '2025-05-29', region: '巩家沟数字化种植基地', severity: '重旱', description: '水资源极度紧张' }
];

const filteredData = ref([]);
const pageData = ref([]);

const currentPage = ref(1);
const pageSize = 6;

function search() {
  filteredData.value = allData.filter((item) => {
    if (form.region && item.region !== form.region) return false;
    if (form.severity && item.severity !== form.severity) return false;
    return true;
  });

  currentPage.value = 1;
  updatePageData();
}

function reset() {
  form.region = '';
  form.severity = '';
  filteredData.value = [];
  pageData.value = [];
  currentPage.value = 1;
}

function updatePageData() {
  const start = (currentPage.value - 1) * pageSize;
  pageData.value = filteredData.value.slice(start, start + pageSize);
}

function handlePageChange(page) {
  currentPage.value = page;
  updatePageData();
}

onMounted(() => {
  filteredData.value = allData;
  updatePageData();
});
</script>

<style scoped>
.box-card {
  margin: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.query-form {
  flex-wrap: wrap;
}

.pagination-wrapper {
  user-select: none;
}
</style>
