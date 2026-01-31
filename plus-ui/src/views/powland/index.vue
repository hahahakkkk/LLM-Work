<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount, markRaw } from 'vue';
import * as echarts from 'echarts';
import { getPowlandOverview, getOverview, getAllBasesPlantArea, getSingleBasePlantArea } from './index';
import { OfficeBuilding, Collection, Location, TrendCharts } from '@element-plus/icons-vue';

import { useRouter } from 'vue-router';
import { baseDictQuery } from './api/tableDict';

import { landDictQuery } from '../mz_base/api/tableDict';

import { listAlert } from './api/alert-api.js';
// import { list } from '@/api/monitor/online'

// 顶部统计卡片
const statCards = ref<any[]>([]);

let landMap; //地块字典

function getLandCode(landId) {
  return landMap.get(landId);
}

// 中间图表数据
const barChartRef = ref<HTMLDivElement | null>(null);
const lineChartRef = ref<HTMLDivElement | null>(null);
let barChart: echarts.ECharts | null = null;
let lineChart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

const allBasesChartRef = ref<HTMLDivElement | null>(null); // 所有基地堆叠柱状图
const oneBaseChartRef = ref<HTMLDivElement | null>(null); // 单个基地柱状图
let allBasesChart: echarts.ECharts | null = null;
let oneBaseChart: echarts.ECharts | null = null;

// 气象图
// const weatherType = ref<'temp' | 'rain'>('temp')
const weatherType = ref<'temp' | 'rain' | 'hum' | 'press'>('temp');

// const weatherData = ref<{ month: number; avgTemp: number; totalRain: number }[]>([])
const weatherData = ref<{ month: number; avgTemp: number; totalRain: number; avgHumidity: number; avgPressure: number }[]>([]);

// const setWeatherType = (t: 'temp' | 'rain') => {
//   weatherType.value = t
//   renderLineChart()
// }
const setWeatherType = (t: 'temp' | 'rain' | 'hum' | 'press') => {
  weatherType.value = t;
  renderLineChart();
};

// 底部列表
const lists = ref<any[]>([]);

// ---------- 基地列表（下拉） & 选中id ----------
const baseList = ref<{ label: string; value: number }[]>([]);
const selectedBaseId = ref<string | null>(null);

onMounted(async () => {
  // ===== Powland 数据 =====
  const powland = await getPowlandOverview();

  const lands = await landDictQuery();
  landMap = new Map(lands.rows.map((item) => [item.value, item.label]));

  // ===== MzBase 数据 =====
  const year = new Date().getFullYear();
  const mzbase = await getOverview(year);

  statCards.value = [
    { title: '基地数量', value: powland.baseCount, unit: '个', icon: markRaw(OfficeBuilding), tone: 'indigo' },
    { title: '地块数量', value: powland.landCount, unit: '块', icon: markRaw(Collection), tone: 'cyan' },
    { title: '采样点数量', value: powland.sampleCount, unit: '个', icon: markRaw(Location), tone: 'emerald' },
    { title: '平均产量', value: Math.round(mzbase.avgYield), unit: 'kg/亩', icon: markRaw(TrendCharts), tone: 'amber' }
  ];

  await nextTick();
  const keys = mzbase.soilFertility.key ?? mzbase.soilFertility.keys ?? mzbase.soilFertility.keys;
  const counts = mzbase.soilFertility.value ?? mzbase.soilFertility.values ?? mzbase.soilFertility.val ?? [];
  const areas = mzbase.soilFertility.areas ?? mzbase.soilFertility.area ?? [];

  renderBarChart(counts, keys, areas);
  // renderBarChart(mzbase.soilFertility.value, mzbase.soilFertility.key)

  weatherData.value = mzbase.weather;
  renderLineChart();

  lists.value = [
    { title: '灌溉', route: 'situation/irrigationRecords', data: mzbase.irrigation },
    { title: '喷药', route: 'situation/chemicalUse', data: mzbase.spray },
    { title: '施肥', route: 'situation/fertilizerUse', data: mzbase.fertilization },
    { title: '配方历史', route: 'situation/fertilizationHistory', data: mzbase.formula }
  ];

  const dictRes = await baseDictQuery(); // 返回形如 { total, rows: [...], code, msg }
  // 支持 dictRes.rows 和 dictRes.data 两种常见结构（更鲁棒）
  const rows = dictRes && dictRes.rows ? dictRes.rows : dictRes && (dictRes.data || dictRes.rows) ? dictRes.data || dictRes.rows : [];
  // rows 是数组，每项形如 { label: '侯家沟基地', value: '1880899316147232770' }
  baseList.value = (rows || [])
    .map((d: any) => ({
      label: d.label ?? d.baseName ?? d.name ?? String(d),
      // 保留为字符串，避免超大 id 转 Number 时丢失精度
      value: String(d.value ?? d.baseId ?? d.id ?? '')
    }))
    .filter((b: any) => b.value); // 过滤掉空 id

  if (baseList.value.length > 0) {
    // 先渲染所有基地堆叠图（近五年）
    await renderAllBasesPlantArea();

    // 然后渲染默认单基地数据
    selectedBaseId.value = baseList.value[0].value;
    await renderOneBasePlantArea(selectedBaseId.value);

    try {
      const alerts = await listAlert({
        pageNum: 1,
        pageSize: 20
      });

      const fertUse = alerts.rows
        .filter((it) => it.alertType === '缺肥')
        .map((it) => {
          let landCode = getLandCode(it.plotId);
          return {
            msg: `<div class="alert123"><span>[${landCode}]  ${it.alertLevel}缺肥[${it.actionTime.slice(0, 10)}]</span> <span style="color: red">[缺肥警告]<span></div>`,
            date: it.actionTime,
            alertInfo: it.alertInfo
          };
        });

      const fert = [...mzbase.fertilization, ...fertUse].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
      lists.value[2].data = fert;

      const irrUse = alerts.rows
        .filter((it) => it.alertType === '缺水')
        .map((it) => {
          let landCode = getLandCode(it.plotId);
          return {
            msg: `<div class="alert123"><span>[${landCode}] ${it.alertLevel}缺水[${it.actionTime.slice(0, 10)}]</span> <span style="color: red">[缺水警告]<span></div>`,
            date: it.actionTime,
            alertInfo: it.alertInfo
          };
        });
      const irr = [...mzbase.irrigation, ...irrUse].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
      lists.value[0].data = irr;
    } catch (er) {}
  }

  window.addEventListener('resize', handleResize);
  const root = document.querySelector('.dashboard-container');
  if (root && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(root);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  resizeObserver?.disconnect();
  barChart?.dispose();
  lineChart?.dispose();
  allBasesChart?.dispose();
  oneBaseChart?.dispose();
});

// 渲染地力等级分布（环形图）
// 参数：counts: number[]（每个等级的地块数）
//       keys: string[]   （每个等级的显示名）
//       areas?: number[] （每个等级的面积总和，若后端没有传则会显示 0 亩）
const renderBarChart = (counts: number[], keys: string[], areas?: number[]) => {
  if (!barChartRef.value) return;
  if (!barChart) barChart = echarts.init(barChartRef.value);

  // 保证长度对齐（counts 与 keys 应该等长）
  const n = Math.max(keys.length, counts?.length ?? 0, areas?.length ?? 0);
  const seriesData = [];
  let totalCount = 0;
  for (let i = 0; i < n; i++) {
    const name = keys[i] ?? `未知${i + 1}`;
    const cnt = Number(counts?.[i] ?? 0);
    const area = Number(areas?.[i] ?? 0);
    totalCount += cnt;
    seriesData.push({ name, value: cnt, area });
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        // p.value 对应 count（已经是整数）
        const cnt = Math.round(Number(p.value || 0));
        // 从 data 里取 area（预先保留为整数）
        const areaVal = p.data && p.data.area != null ? Math.round(Number(p.data.area)) : 0;
        const pct = totalCount ? ((cnt / totalCount) * 100).toFixed(1) : '0.0';
        return `${p.name}<br/>地块数：${cnt} 块<br/>面积：${areaVal} 亩<br/>占比：${pct}%`;
      }
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      icon: 'circle',
      textStyle: { color: '#334155' }
    },
    series: [
      {
        type: 'pie',
        radius: ['46%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: {
          formatter: '{b}\n{d}%',
          color: '#0f172a',
          fontWeight: 700
        },
        labelLine: { length: 10, length2: 8 },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 6,
          shadowColor: 'rgba(0,0,0,.06)'
        },
        data: seriesData
      }
    ],
    // 中心总计：按“数量”总计显示（因为百分比也是基于数量）
    graphic: totalCount
      ? [
          {
            type: 'group',
            left: 'center',
            top: '45%',
            z: 100,
            children: [
              { type: 'text', style: { text: '总计', fill: '#64748b', font: '12px sans-serif', textAlign: 'center' }, top: -14, left: 0 },
              {
                type: 'text',
                style: { text: `${totalCount} 块`, fill: '#0f172a', font: '700 16px sans-serif', textAlign: 'center' },
                top: 4,
                left: 0
              }
            ]
          }
        ]
      : []
  };

  barChart.setOption(option, true);
};

const renderLineChart = () => {
  if (!lineChartRef.value) return;
  if (!lineChart) lineChart = echarts.init(lineChartRef.value);

  const months = weatherData.value.map((w) => w.month + '月');
  const temps = weatherData.value.map((w) => w.avgTemp);
  const rains = weatherData.value.map((w) => w.totalRain);
  const hums = weatherData.value.map((w) => w.avgHumidity);
  const press = weatherData.value.map((w) => w.avgPressure);

  let seriesData: number[] = [];
  let color = '';
  let yName = '';
  let title = '';

  switch (weatherType.value) {
    case 'temp':
      seriesData = temps;
      color = '#E6A23C';
      yName = '℃';
      title = '平均气温';
      break;
    case 'rain':
      seriesData = rains;
      color = '#67C23A';
      yName = 'mm';
      title = '降水量';
      break;
    case 'hum':
      seriesData = hums;
      color = '#409EFF';
      yName = '%';
      title = '相对湿度';
      break;
    case 'press':
      seriesData = press;
      color = '#6366F1';
      yName = 'hPa';
      title = '大气压';
      break;
  }

  lineChart.setOption({
    title: { text: title, left: 'center', top: 4, textStyle: { fontSize: 13, color: '#475569' } },
    grid: { left: 45, right: 20, top: 40, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0];
        return `${p.axisValue}<br/>${title}：${Math.round(p.data)} ${yName}`;
      }
    },
    xAxis: { type: 'category', data: months },
    yAxis: {
      type: 'value',
      name: yName,
      axisLabel: { formatter: (v: number) => Math.round(v).toString() } // 👈 这里强制整数
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: { opacity: 0.15 },
        itemStyle: { color },
        data: seriesData.map((v) => Math.round(v)) // 👈 确保曲线数据为整数
      }
    ]
  });
};

// ====================== renderAllBasesPlantArea（替换为强制近5年窗口） ======================
const renderAllBasesPlantArea = async () => {
  try {
    const raw = await getAllBasesPlantArea();
    const res = raw && (raw as any).data ? (raw as any).data : raw;

    if (!Array.isArray(res)) {
      console.warn('getAllBasesPlantArea 返回不是数组：', res);
      return;
    }
    if (!allBasesChartRef.value) return;
    if (!allBasesChart) allBasesChart = echarts.init(allBasesChartRef.value);

    // 规范化字段名（支持 snake_case 与 camelCase）
    const normalized = res
      .map((r: any) => ({
        baseId: r.baseId ?? r.base_id ?? r.baseid ?? null,
        baseName: (r.baseName ?? r.base_name ?? r.base ?? '').toString(),
        year: Number(r.year ?? r.sh_year ?? 0),
        totalArea: Number(r.totalArea ?? r.total_area ?? r.area ?? 0)
      }))
      .filter((r: any) => r.baseId != null && !Number.isNaN(r.year));

    if (normalized.length === 0) {
      allBasesChart.setOption({ series: [], xAxis: { data: [] }, legend: { data: [] } }, true);
      return;
    }

    // 强制近五年窗口（current-4 .. current）
    const current = getMaxYear(res);
    const yearsWindow = [];
    for (let y = current - 4; y <= current; y++) yearsWindow.push(y);

    // 基地 id 顺序（按出现顺序）
    const baseIds = Array.from(new Map(normalized.map((r: any) => [r.baseId, r.baseId])).keys());

    // 名称映射：优先使用非空名称，否则退回为 基地{ID}
    const nameMap: Record<string | number, string> = {};
    for (const r of normalized) {
      const id = r.baseId;
      const rawName = r.baseName && String(r.baseName).trim() && String(r.baseName) !== 'null' ? String(r.baseName).trim() : '';
      if (!nameMap[id]) {
        nameMap[id] = rawName || `基地${id}`;
      }
    }

    // 构造 series（按 baseIds 顺序），按 yearsWindow 填充缺失年份为 0
    const legendNames: string[] = [];
    const series = baseIds.map((id) => {
      const name = nameMap[id] ?? `基地${id}`;
      legendNames.push(name);
      const dataArr = yearsWindow.map((y) => {
        const item = normalized.find((it: any) => String(it.baseId) === String(id) && Number(it.year) === y);
        return item ? item.totalArea : 0;
      });
      return {
        name,
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: dataArr
      };
    });

    // set option
    allBasesChart.setOption(
      {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { type: 'scroll', bottom: 0, data: legendNames },
        grid: { left: 50, right: 20, bottom: 70, top: 35 },
        xAxis: { type: 'category', data: yearsWindow.map((y) => `${y}`) },
        yAxis: { type: 'value', name: '种植面积(亩)' },
        series
      },
      true
    );
  } catch (e) {
    console.warn('加载所有基地种植面积失败', e);
  }
};

// ====================== renderOneBasePlantArea（强制近 5 年窗口） ======================
const renderOneBasePlantArea = async (baseId: string) => {
  try {
    const raw = await getSingleBasePlantArea(baseId);
    const res = raw && (raw as any).data ? (raw as any).data : raw;

    if (!Array.isArray(res)) {
      console.warn('getSingleBasePlantArea 返回不是数组：', res);
      return;
    }
    if (!oneBaseChartRef.value) return;
    if (!oneBaseChart) oneBaseChart = echarts.init(oneBaseChartRef.value);

    // 规范化：支持 snake_case/camelCase
    const normalized = res
      .map((r: any) => ({
        year: Number(r.year ?? r.sh_year ?? 0),
        totalArea: Number(r.totalArea ?? r.total_area ?? r.area ?? 0)
      }))
      .filter((r: any) => !Number.isNaN(r.year));

    // 强制近五年窗口（current-4 .. current）
    const current = getMaxYear(res);
    const yearsWindow: number[] = [];
    for (let y = current - 4; y <= current; y++) yearsWindow.push(y);

    // 根据窗口填充数据（没有的年份填 0）
    const areas = yearsWindow.map((y) => {
      const item = normalized.find((it: any) => Number(it.year) === y);
      return item ? item.totalArea : 0;
    });

    // 如果所有都是 0，也正常显示（避免空图表）
    oneBaseChart.setOption(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: 50, right: 20, bottom: 40, top: 30 },
        xAxis: { type: 'category', data: yearsWindow.map((y) => `${y}`) },
        yAxis: { type: 'value', name: '种植面积(亩)', nameGap: 10 },
        series: [
          {
            name: '种植面积',
            type: 'bar',
            data: areas,
            barMaxWidth: 36,
            itemStyle: {
              // 不强制颜色，如需统一可设置 color
            }
          }
        ]
      },
      true
    );
  } catch (e) {
    console.warn('加载单基地种植面积失败', e);
  }
};

// 切换单基地
const handleBaseChange = async (val: string) => {
  selectedBaseId.value = val;
  if (val != null) await renderOneBasePlantArea(val);
};

const handleResize = () => {
  barChart?.resize();
  lineChart?.resize();
  allBasesChart?.resize();
  oneBaseChart?.resize();
};

//页面跳转
const router = useRouter();
function toRoute(rt) {
  router.push(rt);
}

/**
 * 获取按年份统计结果获取最大年份
 * @param data
 */
function getMaxYear(data) {
  const maxYear = Math.max(...data.map((dt) => Number(dt.year)));
  return maxYear;
}
</script>

<template>
  <div class="dashboard-container">
    <!-- 行1：顶部四个统计卡片 -->
    <el-row :gutter="16" class="row-stats">
      <el-col :xs="24" :sm="12" :md="6" v-for="card in statCards" :key="card.title">
        <el-card shadow="hover" class="stat-card" :class="'tone-' + card.tone">
          <div class="stat-inner">
            <div class="icon-wrap">
              <component :is="card.icon"></component>
            </div>
            <div class="texts">
              <div class="stat-title">{{ card.title }}</div>
              <div class="stat-value">
                {{ card.value }} <span class="unit">{{ card.unit }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 行2：中间四个图表（环形、所有基地柱、单基地柱、气象） -->
    <el-row :gutter="16" class="row-charts">
      <el-col :xs="24" :sm="24" :md="6" class="h-full">
        <el-card shadow="hover" class="chart-card h-full soft-card" :body-style="{ height: '100%' }">
          <div class="chart-title">地力等级分布</div>
          <div ref="barChartRef" class="chart-box"></div>
          <div style="font-size: xx-small; color: #999; margin-top: 10px; text-align: center">
            等级划分依据《第三次全国土壤普查耕地质量等级评价技术规范》
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="9" class="h-full" v-has-roles="['sysadmin', 'superadmin']">
        <el-card shadow="hover" class="chart-card h-full soft-card" :body-style="{ height: '100%' }">
          <div class="chart-title">近五年 — 各基地种植面积（堆叠）</div>
          <div ref="allBasesChartRef" class="chart-box"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="9" class="h-full" v-has-roles="['baseadmin']">
        <el-card shadow="hover" class="chart-card h-full soft-card" :body-style="{ height: '100%' }">
          <div class="chart-header">
            <span class="chart-title">基地近五年种植面积</span>
          </div>
          <div ref="oneBaseChartRef" class="chart-box"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="9" class="h-full">
        <el-card shadow="hover" class="chart-card h-full soft-card" :body-style="{ height: '100%' }">
          <div class="chart-header">
            <span class="chart-title">米脂历史气象数据</span>
            <div class="btn-group">
              <el-button size="small" :type="weatherType === 'temp' ? 'primary' : 'default'" @click="setWeatherType('temp')">温度</el-button>
              <el-button size="small" :type="weatherType === 'rain' ? 'success' : 'default'" @click="setWeatherType('rain')">降水量</el-button>
              <el-button size="small" :type="weatherType === 'hum' ? 'info' : 'default'" @click="setWeatherType('hum')">湿度</el-button>
              <el-button size="small" :type="weatherType === 'press' ? 'warning' : 'default'" @click="setWeatherType('press')">气压</el-button>
            </div>
          </div>
          <div ref="lineChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 行3：底部四个列表 -->
    <el-row :gutter="16" class="row-lists">
      <el-col :xs="24" :md="6" v-for="list in lists" :key="list.title" class="h-full">
        <el-card shadow="hover" class="list-card h-full soft-card">
          <div class="list-header">
            <div class="list-header-left">
              <span class="header-dot"></span>
              <span>{{ list.title }}</span>
            </div>
            <el-button link type="primary" size="small" @click="toRoute(list.route)"> 更多 </el-button>
          </div>
          <el-divider class="my-2" />
          <div class="list-scroll">
            <ul class="list-content">
              <li v-for="(item, index) in list.data" :key="index">
                <span class="dot"></span>
                <span v-if="list.title === '配方历史'">{{ item }}</span>
                <span style="display: inline-block; width: 100%" v-else v-html="item.msg"></span>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
/* 页面浅色背景 */
.dashboard-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 16px;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr 1fr;
  gap: 16px;
  background: #f7f9fc;
}

/* 行布局 */
.row-stats,
.row-charts,
.row-lists {
  min-height: 0;
}

.h-full {
  height: 100%;
  max-height: 500px;
}

/* 统计卡片 */
.stat-card {
  height: 100%;
  border: none;
  border-radius: 12px;
}

.stat-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-wrap {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--tone-ink-weak);
  color: var(--tone-ink);
}

.icon-wrap :deep(svg) {
  width: 22px;
  height: 22px;
}

.stat-title {
  font-size: 14px;
  color: var(--tone-ink);
  opacity: 0.9;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--tone-ink-strong);
}

.unit {
  font-size: 12px;
  margin-left: 6px;
  opacity: 0.8;
}

/* 卡片主题色 */
.tone-indigo {
  --tone-ink: #3b82f6;
  --tone-ink-strong: #1e40af;
  --tone-ink-weak: rgba(59, 130, 246, 0.15);
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
}

.tone-cyan {
  --tone-ink: #06b6d4;
  --tone-ink-strong: #0e7490;
  --tone-ink-weak: rgba(6, 182, 212, 0.15);
  background: linear-gradient(135deg, #ecfeff, #cffafe);
}

.tone-emerald {
  --tone-ink: #10b981;
  --tone-ink-strong: #047857;
  --tone-ink-weak: rgba(16, 185, 129, 0.15);
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
}

.tone-amber {
  --tone-ink: #f59e0b;
  --tone-ink-strong: #b45309;
  --tone-ink-weak: rgba(245, 158, 11, 0.15);
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
}

/* 图表卡片 */
.soft-card {
  background: #ffffff;
  border: 1px solid #eef1f6;
  border-radius: 12px;
}

.chart-card {
  padding-bottom: 6px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-weight: 600;
  color: #334155;
}

.chart-box {
  width: 100%;
  height: calc(100% - 35px);
  min-height: 220px;
}

/* 底部列表 */
.list-card {
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #334155;
}

.list-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(45deg, #60a5fa, #34d399);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
}

.list-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.list-content {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-content li {
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid #f2f4f7;
  line-height: 1.5;
}

.list-content li:last-child {
  border-bottom: none;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409eff;
  display: inline-block;
  margin-right: 8px;
}

/* 间距 */
.my-2 {
  margin: 8px 0;
}

/* 小屏优化 */
@media (max-width: 768px) {
  .dashboard-container {
    grid-template-rows: auto 1.2fr 1.2fr;
  }

  .chart-box {
    min-height: 260px;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.btn-group {
  display: flex;
  gap: 6px;
  align-items: center;
}
</style>
<style>
.alert123 {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
</style>
