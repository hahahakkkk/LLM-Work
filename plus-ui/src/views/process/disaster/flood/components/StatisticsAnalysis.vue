<template>
  <div class="statistics-analysis">
    <el-card>
      <div class="filters mb-3">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        <el-button type="primary" class="ml-2" @click="fetchStats">查询</el-button>
      </div>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <div class="chart-title">年度预警趋势</div>
            <div id="trendChart" style="height: 300px"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <div class="chart-title">区域响应统计</div>
            <div id="responseChart" style="height: 300px"></div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';

const dateRange = ref<[Date, Date]>();

function fetchStats() {
  renderCharts();
}

function renderCharts() {
  nextTick(() => {
    const trend = echarts.init(document.getElementById('trendChart')!);
    trend.setOption({
      title: { text: '年度预警趋势' },
      xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月'] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [2, 5, 8, 3] }]
    });

    const response = echarts.init(document.getElementById('responseChart')!);
    response.setOption({
      title: { text: '区域响应统计' },
      tooltip: {},
      xAxis: { type: 'category', data: ['001', '002', '003', '004'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [10, 7, 5, 12] }]
    });
  });
}

onMounted(() => {
  renderCharts();
});
</script>

<style scoped>
.mb-3 {
  margin-bottom: 15px;
}
.ml-2 {
  margin-left: 10px;
}
.chart-title {
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
