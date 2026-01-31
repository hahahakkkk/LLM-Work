<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>冰雹统计分析</span>
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
      <el-table-column prop="orangeCount" label="橙色预警次数" width="120" />
      <el-table-column prop="redCount" label="红色预警次数" width="120" />
      <el-table-column prop="total" label="总次数" width="100" />
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

    <div ref="chart" style="width: 100%; height: 300px; margin-top: 20px"></div>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const allData = [
  { date: '2023-05-20', level: '橙' },
  { date: '2023-06-15', level: '红' },
  { date: '2023-07-10', level: '橙' },
  { date: '2023-08-05', level: '红' },
  { date: '2023-09-12', level: '橙' },
  { date: '2023-10-20', level: '红' },
  { date: '2024-01-15', level: '橙' },
  { date: '2024-02-18', level: '橙' },
  { date: '2024-03-10', level: '红' },
  { date: '2024-04-05', level: '橙' },
  { date: '2024-05-10', level: '红' },
  { date: '2024-06-15', level: '橙' },
  { date: '2025-01-08', level: '橙' },
  { date: '2025-02-14', level: '红' },
  { date: '2025-03-19', level: '橙' },
  { date: '2025-04-25', level: '红' }
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

function groupByYear(year) {
  if (year === 'all') {
    const yearMap = {};
    allData.forEach((item) => {
      const y = item.date.slice(0, 4);
      if (!yearMap[y]) {
        yearMap[y] = { orangeCount: 0, redCount: 0 };
      }
      if (item.level === '橙') {
        yearMap[y].orangeCount++;
      } else {
        yearMap[y].redCount++;
      }
    });
    return Object.entries(yearMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([y, counts]) => ({
        label: `${y}年`,
        orangeCount: counts.orangeCount,
        redCount: counts.redCount,
        total: counts.orangeCount + counts.redCount
      }));
  } else {
    const filtered = allData.filter((i) => i.date.startsWith(year));
    const monthlyCounts = Array(12)
      .fill()
      .map(() => ({ orangeCount: 0, redCount: 0 }));
    filtered.forEach((item) => {
      const m = parseInt(item.date.slice(5, 7), 10) - 1;
      if (item.level === '橙') {
        monthlyCounts[m].orangeCount++;
      } else {
        monthlyCounts[m].redCount++;
      }
    });
    return monthlyCounts.map((counts, i) => ({
      label: `${year}年${i + 1}月`,
      orangeCount: counts.orangeCount,
      redCount: counts.redCount,
      total: counts.orangeCount + counts.redCount
    }));
  }
}

function groupByMonthAllYears() {
  const monthlyCounts = Array(12)
    .fill()
    .map(() => ({ orangeCount: 0, redCount: 0 }));
  allData.forEach((item) => {
    const m = parseInt(item.date.slice(5, 7), 10) - 1;
    if (item.level === '橙') {
      monthlyCounts[m].orangeCount++;
    } else {
      monthlyCounts[m].redCount++;
    }
  });
  return monthlyCounts.map((counts, i) => ({
    label: `${i + 1}月`,
    orangeCount: counts.orangeCount,
    redCount: counts.redCount,
    total: counts.orangeCount + counts.redCount
  }));
}

function renderChart(data) {
  if (!chartInstance) {
    chartInstance = echarts.init(chart.value);
  }
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['橙色预警', '红色预警']
    },
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
        name: '橙色预警',
        type: 'bar',
        barGap: 0,
        data: data.map((d) => d.orangeCount),
        itemStyle: {
          color: '#e6a23c'
        }
      },
      {
        name: '红色预警',
        type: 'bar',
        data: data.map((d) => d.redCount),
        itemStyle: {
          color: '#f56c6c'
        }
      }
    ]
  };
  chartInstance.setOption(option);
}

function search() {
  if (form.type === 'year' && form.year) {
    statsData.value = groupByYear(form.year);
  } else if (form.type === 'month') {
    statsData.value = groupByMonthAllYears();
  } else {
    statsData.value = [];
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
</style>
