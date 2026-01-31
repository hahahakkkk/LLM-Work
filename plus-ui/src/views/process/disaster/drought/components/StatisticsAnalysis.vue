<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>干旱统计分析</span>
    </div>

    <el-form :model="form" label-width="100px" inline class="query-form">
      <el-form-item label="统计类型">
        <el-radio-group v-model="form.type" @change="onTypeChange">
          <el-radio label="year">按年份</el-radio>
          <el-radio label="month">按月份</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="年份" v-if="form.type === 'year'">
        <el-select v-model="form.year" placeholder="请选择年份" style="width: 160px" @change="search">
          <el-option label="全部" value="all" />
          <el-option v-for="y in years" :key="y" :label="y" :value="y" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="pageData" style="width: 100%; margin-top: 20px" border>
      <el-table-column prop="label" label="时间" width="160" />
      <el-table-column prop="count" label="干旱事件数量" width="160" />
    </el-table>

    <div class="pagination-wrapper" style="text-align: right; margin-top: 15px">
      <el-pagination
        background
        layout="prev, pager, next, jumper"
        :page-size="pageSize"
        :current-page="currentPage"
        :total="statsData.length"
        @current-change="handlePageChange"
      />
    </div>

    <div v-if="form.type === 'month' && topMonths.length" class="alert-message" style="margin-top: 20px; font-weight: 600; color: #f56c6c">
      {{ topMonthsText }}
    </div>

    <div ref="chart" style="width: 100%; height: 300px; margin-top: 20px"></div>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const allData = [
  { date: '2023-01-05', severity: '轻旱' },
  { date: '2023-02-15', severity: '中旱' },
  { date: '2023-03-10', severity: '重旱' },
  { date: '2023-04-20', severity: '特旱' },
  { date: '2023-05-25', severity: '中旱' },
  { date: '2023-06-30', severity: '轻旱' },
  { date: '2024-01-12', severity: '重旱' },
  { date: '2024-02-20', severity: '特旱' },
  { date: '2024-03-05', severity: '中旱' },
  { date: '2024-04-15', severity: '轻旱' },
  { date: '2024-05-10', severity: '重旱' },
  { date: '2024-06-18', severity: '特旱' },
  { date: '2024-07-22', severity: '中旱' },
  { date: '2025-01-08', severity: '轻旱' },
  { date: '2025-02-14', severity: '重旱' },
  { date: '2025-03-19', severity: '中旱' },
  { date: '2025-04-25', severity: '特旱' },
  { date: '2025-05-30', severity: '轻旱' }
];

const form = reactive({
  type: 'year',
  year: ''
});

const years = Array.from(new Set(allData.map((item) => item.date.slice(0, 4)))).sort();

const statsData = ref([]);
const pageData = ref([]);

const currentPage = ref(1);
const pageSize = 6;

const chart = ref(null);
let chartInstance = null;

const topMonths = ref([]); // 干旱频次最高的前三个月名数组
const topMonthsText = ref('');

function groupByYear(year) {
  if (year === 'all') {
    const yearMap = {};
    allData.forEach((item) => {
      const y = item.date.slice(0, 4);
      yearMap[y] = (yearMap[y] || 0) + 1;
    });
    return Object.entries(yearMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([y, count]) => ({ label: `${y}年`, count }));
  } else {
    const filtered = allData.filter((i) => i.date.startsWith(year));
    const monthlyCounts = Array(12).fill(0);
    filtered.forEach((item) => {
      const m = parseInt(item.date.slice(5, 7), 10) - 1;
      monthlyCounts[m]++;
    });
    return monthlyCounts.map((count, i) => ({
      label: `${year}年${i + 1}月`,
      count
    }));
  }
}

function groupByMonthAllYears() {
  const monthlyCounts = Array(12).fill(0);
  allData.forEach((item) => {
    const m = parseInt(item.date.slice(5, 7), 10) - 1;
    monthlyCounts[m]++;
  });
  return monthlyCounts.map((count, i) => ({
    label: `${i + 1}月`,
    count
  }));
}

function renderChart(data) {
  if (!chartInstance) {
    chartInstance = echarts.init(chart.value);
  }
  const option = {
    tooltip: {},
    xAxis: {
      type: 'category',
      data: data.map((d) => d.label),
      axisLabel: { rotate: 45, interval: 0 }
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        data: data.map((d) => d.count),
        type: 'bar',
        barMaxWidth: 30
      }
    ]
  };
  chartInstance.setOption(option);
}

function search() {
  if (form.type === 'year' && form.year) {
    statsData.value = groupByYear(form.year);
    topMonths.value = [];
    topMonthsText.value = '';
  } else if (form.type === 'month') {
    statsData.value = groupByMonthAllYears();
    // 找前三名月份
    const sorted = [...statsData.value].sort((a, b) => b.count - a.count);
    topMonths.value = sorted.slice(0, 3).map((m) => m.label);
    topMonthsText.value = topMonths.value.length ? `${topMonths.value.join('、')}为干旱发生的高峰期，请注意防护。` : '';
  } else {
    statsData.value = [];
    topMonths.value = [];
    topMonthsText.value = '';
  }
  currentPage.value = 1;
  updatePageData();
  renderChart(statsData.value);
}

function reset() {
  form.year = '';
  form.type = 'year';
  statsData.value = [];
  pageData.value = [];
  currentPage.value = 1;
  topMonths.value = [];
  topMonthsText.value = '';
  if (chartInstance) {
    chartInstance.clear();
  }
}

function updatePageData() {
  const start = (currentPage.value - 1) * pageSize;
  pageData.value = statsData.value.slice(start, start + pageSize);
}

function handlePageChange(page) {
  currentPage.value = page;
  updatePageData();
}

function onTypeChange() {
  // 类型切换时清空年份选择，自动执行查询
  form.year = '';
  search();
}

onMounted(() => {
  form.year = 'all';
  search();
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
.alert-message {
  font-weight: 600;
  color: #f56c6c;
  margin-top: 20px;
}
</style>
