<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>历史冰雹情况查询</span>
    </div>

    <el-form :model="form" label-width="100px" inline class="query-form">
      <el-form-item label="地区">
        <el-select v-model="form.region" placeholder="请选择地区" style="width: 180px">
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

      <!--      <el-form-item label="区域ID">
        <el-input v-model="form.regionId" placeholder="请输入区域ID" style="width: 160px" />
      </el-form-item> -->

      <el-form-item label="开始时间">
        <el-date-picker v-model="form.startDate" type="date" placeholder="选择开始时间" style="width: 160px" clearable />
      </el-form-item>

      <el-form-item label="冰雹等级">
        <el-select v-model="form.level" placeholder="请选择等级" style="width: 120px">
          <el-option label="橙色预警" value="橙" />
          <el-option label="红色预警" value="红" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="pageData" style="width: 100%; margin-top: 20px" border>
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="region" label="地区" width="200" />
      <!--      <el-table-column prop="regionId" label="区域ID" width="120" /> -->
      <el-table-column prop="level" label="预警等级" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.level === '红' ? 'danger' : 'warning'">{{ scope.row.level === '橙' ? '橙色预警' : '红色预警' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="damage" label="灾害情况" />
      <el-table-column prop="notes" label="备注" />
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
  regionId: '',
  startDate: null,
  level: ''
});

const allData = [
  { date: '2023-05-20', region: '姜兴庄智慧引领种植基地', regionId: '001', level: '橙', damage: '轻微雹灾', notes: '农作物轻微受损' },
  { date: '2023-06-15', region: '侯家沟智慧引领种植基地', regionId: '101', level: '红', damage: '严重雹灾', notes: '农作物大面积受损' },
  { date: '2024-03-10', region: '侯家沟数字化种植基地', regionId: '201', level: '橙', damage: '中等雹灾', notes: '部分农作物受损' },
  { date: '2024-08-05', region: '李家寺数字化种植基地', regionId: '102', level: '红', damage: '特大雹灾', notes: '农作物绝收' },
  { date: '2024-09-12', region: '高家硷数字化种植基地', regionId: '103', level: '橙', damage: '轻微雹灾', notes: '少量农作物受损' },
  { date: '2024-10-20', region: '冯渠数字化种植基地', regionId: '104', level: '红', damage: '严重雹灾', notes: '农作物严重受损' },
  { date: '2025-01-15', region: '寺沟数字化种植基地', regionId: '105', level: '橙', damage: '轻微雹灾', notes: '农作物轻微受损' },
  { date: '2025-02-18', region: '岳家岔数字化种植基地', regionId: '106', level: '橙', damage: '中等雹灾', notes: '部分农作物受损' },
  { date: '2025-04-10', region: '杨家沟数字化种植基地', regionId: '107', level: '红', damage: '特大雹灾', notes: '农作物绝收' },
  { date: '2025-04-10', region: '巩家沟数字化种植基地', regionId: '107', level: '红', damage: '特大雹灾', notes: '农作物绝收' }
];

const filteredData = ref([]);
const pageData = ref([]);

const currentPage = ref(1);
const pageSize = 6;

function search() {
  filteredData.value = allData.filter((item) => {
    if (form.region && item.region !== form.region) return false;
    if (form.regionId && !item.regionId.includes(form.regionId.trim())) return false;
    if (form.level && item.level !== form.level) return false;

    if (form.startDate) {
      const startTime = form.startDate.getTime();
      const itemTime = new Date(item.date).getTime();
      if (itemTime < startTime) return false;
    }

    return true;
  });

  currentPage.value = 1;
  updatePageData();
}

function reset() {
  form.region = '';
  form.regionId = '';
  form.startDate = null;
  form.level = '';
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
