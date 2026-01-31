<template>
  <div class="page-wrap">
    <!-- 标题 -->
    <div class="page-title">
      <h2>耕地地力等级总览</h2>
    </div>

    <!-- 表1：地力等级总表 -->
    <el-card class="card pretty" shadow="never" v-hasPermi="['mz_base:admin:view']">
      <template #header>
        <div class="card-hd">
          <div class="card-hd-left">
            <b>地力等级总表</b>
            <span class="sub">（单位：块 / 亩）</span>
          </div>
          <div class="card-actions">
            <el-button type="primary" plain size="small" @click="exportSummaryCSV"> 导出 </el-button>
          </div>
        </div>
      </template>

      <el-table :data="summaryRows" border stripe class="tight luxe-table" :header-cell-style="centerHeader" :cell-style="centerCell">
        <el-table-column prop="base" label="基地名称" min-width="150" fixed />

        <!-- 动态 6 列：Ⅰ等~Ⅵ等（数量/面积） + 双行列头 -->
        <el-table-column v-for="(lv, i) in levelMeta" :key="lv.key" min-width="150">
          <template #header>
            <div class="hdr-two">
              <span class="hdr-name">{{ lv.label }}</span>
              <small class="hdr-unit">（块 / 亩）</small>
            </div>
          </template>
          <template #default="{ row }">
            <span class="mono strong">{{ row.counts[i] }}</span>
            <span class="slash">/</span>
            <span class="mono mild">{{ row.areas[i].toLocaleString() }}</span>
          </template>
        </el-table-column>

        <!-- 总计（数量/面积） + 双行列头 -->
        <el-table-column width="190">
          <template #header>
            <div class="hdr-two">
              <span class="hdr-name">总计</span>
              <small class="hdr-unit">（块 / 亩）</small>
            </div>
          </template>
          <template #default="{ row }">
            <b class="mono strong">{{ row.totalCount }}</b>
            <span class="slash">/</span>
            <b class="mono bold-blue">{{ row.totalArea.toLocaleString() }}</b>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div class="pill pill-blue">
          总计地块数：<b>{{ grand.totalCount }}</b> 块
        </div>
        <div class="pill pill-green">
          总面积：<b>{{ grand.totalArea.toLocaleString() }}</b> 亩
        </div>
      </div>
    </el-card>

    <!-- 表2：侯家沟地力等级表 + 占比饼图 -->
    <el-card class="card pretty" shadow="never" v-hasPermi="['mz_base:base:view']">
      <template #header>
        <div class="card-hd">
          <div class="card-hd-left">
            <b>侯家沟地力等级表</b>
            <span class="sub">（单位：块 / 亩）</span>
          </div>
          <div class="card-actions">
            <el-button type="primary" plain size="small" @click="exportHouCSV"> 导出 </el-button>
          </div>
        </div>
      </template>

      <div class="g2">
        <div class="table-only">
          <el-table :data="houjiagouRows" border stripe class="tight luxe-table" :header-cell-style="centerHeader" :cell-style="centerCell">
            <el-table-column prop="level" label="等级" min-width="120" />
            <el-table-column prop="count" label="地块数" min-width="120">
              <template #default="{ row }"
                ><span class="mono strong">{{ row.count }}</span></template
              >
            </el-table-column>
            <el-table-column prop="area" label="面积(亩)" min-width="120">
              <template #default="{ row }"
                ><span class="mono mild">{{ row.area.toLocaleString() }}</span></template
              >
            </el-table-column>
            <el-table-column prop="ratio" label="占比" min-width="120">
              <template #default="{ row }"
                ><span class="ratio-chip">{{ (row.ratio * 100).toFixed(1) }}%</span></template
              >
            </el-table-column>
          </el-table>
        </div>

        <div class="pie-wrap">
          <div ref="pieRef" class="pie-box"></div>
          <div class="legend-note">按占比绘制</div>
        </div>
      </div>

      <div class="table-footer">
        <div class="pill pill-blue">
          总计地块数：<b>{{ hTotal.count }}</b> 块
        </div>
        <div class="pill pill-green">
          总面积：<b>{{ hTotal.area.toLocaleString() }}</b> 亩
        </div>
      </div>
    </el-card>

    <!-- 图：地力等级直方图（总表聚合） -->
    <el-card class="card pretty" shadow="never">
      <template #header>
        <div class="card-hd">
          <div class="card-hd-left">
            <b>地力等级直方图</b>
            <span class="sub">（总表聚合数量）</span>
          </div>
        </div>
      </template>
      <div ref="barRef" class="chart-box"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts';

/* ===== 数据 ===== */
const levelMeta = [
  { key: 'L1', label: '一等' },
  { key: 'L2', label: '二等' },
  { key: 'L3', label: '三等' },
  { key: 'L4', label: '四等' },
  { key: 'L5', label: '五等' },
  { key: 'L6', label: '六等' }
];

const summaryRows = ref([
  { base: '侯家沟', counts: [18, 32, 21, 12, 8, 4], areas: [980, 1120, 720, 320, 112, 35] },
  { base: '姜兴庄', counts: [12, 25, 30, 18, 10, 6], areas: [620, 890, 830, 410, 160, 54] },
  { base: '李家寺', counts: [20, 28, 19, 15, 7, 3], areas: [760, 920, 540, 190, 95, 35] },
  { base: '冯渠', counts: [10, 22, 26, 20, 9, 5], areas: [410, 760, 640, 320, 120, 61] },
  { base: '高硷村', counts: [15, 24, 23, 14, 6, 2], areas: [520, 780, 660, 420, 330, 276] }
]);
summaryRows.value.forEach((r) => {
  (r as any).totalCount = r.counts.reduce((s, v) => s + v, 0);
  (r as any).totalArea = r.areas.reduce((s, v) => s + v, 0);
});

const grand = computed(() => {
  const totalCount = summaryRows.value.reduce((s, r: any) => s + r.totalCount, 0);
  const totalArea = summaryRows.value.reduce((s, r: any) => s + r.totalArea, 0);
  return { totalCount, totalArea };
});

const houjiagouRows = ref([
  { level: '一等', count: 18, area: 980, ratio: 0.22 },
  { level: '二等', count: 32, area: 1120, ratio: 0.39 },
  { level: '三等', count: 21, area: 720, ratio: 0.25 },
  { level: '四等', count: 12, area: 320, ratio: 0.1 },
  { level: '五等', count: 8, area: 112, ratio: 0.03 },
  { level: '六等', count: 4, area: 35, ratio: 0.01 }
]);
const hTotal = computed(() => ({
  count: houjiagouRows.value.reduce((s, r) => s + r.count, 0),
  area: houjiagouRows.value.reduce((s, r) => s + r.area, 0)
}));

/* ===== 导出：CSV ===== */
const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const exportSummaryCSV = () => {
  const head = ['基地名称', ...levelMeta.map((v) => `${v.label}(块/亩)`), '总计(块/亩)'];
  const rows = summaryRows.value.map((r) => {
    const pairs = r.counts.map((c, i) => `${c}/${r.areas[i]}`);
    return [r.base, ...pairs, `${(r as any).totalCount}/${(r as any).totalArea}`];
  });
  const csv = [head, ...rows].map((r) => r.join(',')).join('\n');
  downloadCSV(csv, '地力等级总表.csv');
};

const exportHouCSV = () => {
  const head = ['等级', '地块数', '面积(亩)', '占比(%)'];
  const rows = houjiagouRows.value.map((r) => [r.level, r.count, r.area, (r.ratio * 100).toFixed(1)]);
  rows.push(['合计', hTotal.value.count, hTotal.value.area, '100.0']);
  const csv = [head, ...rows].map((r) => r.join(',')).join('\n');
  downloadCSV(csv, '侯家沟地力等级表.csv');
};

/* ===== 图表：直方图 ===== */
const barRef = ref<HTMLDivElement | null>(null);
let bar: echarts.ECharts | null = null;
const buildBar = () => {
  const agg = [0, 0, 0, 0, 0, 0];
  summaryRows.value.forEach((r) => r.counts.forEach((v, i) => (agg[i] += v)));
  const option: echarts.EChartsOption = {
    grid: { left: 48, right: 20, top: 30, bottom: 40 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: levelMeta.map((v) => v.label),
      axisTick: { show: false },
      axisLabel: { color: 'var(--ink-900)', fontSize: 13, fontWeight: 600 }
    },
    yAxis: {
      type: 'value',
      name: '数量（块）',
      nameTextStyle: { color: 'var(--ink-700)', fontWeight: 700 },
      splitLine: { lineStyle: { color: '#e9eef5' } },
      axisLabel: { color: 'var(--ink-900)' }
    },
    series: [
      {
        type: 'bar',
        data: agg,
        barMaxWidth: 46,
        label: { show: true, position: 'top', color: 'var(--ink-900)', fontWeight: 800, fontSize: 13 },
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#6aa7ff' },
              { offset: 1, color: '#dbe8ff' }
            ]
          }
        }
      }
    ]
  };
  bar!.setOption(option);
};

/* ===== 图表：饼图 ===== */
const pieRef = ref<HTMLDivElement | null>(null);
let pie: echarts.ECharts | null = null;
const buildPie = () => {
  const data = houjiagouRows.value.map((r) => ({ name: r.level, value: +(r.ratio * 100).toFixed(1) }));
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}：{c}%' },
    legend: { bottom: 0, textStyle: { color: 'var(--ink-900)' } },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '42%'],
        label: { formatter: '{b}\n{d}%', color: 'var(--ink-900)', fontWeight: 700 },
        itemStyle: { borderColor: '#fff', borderWidth: 2, shadowBlur: 6, shadowColor: 'rgba(0,0,0,.06)' },
        data
      }
    ]
  };
  pie!.setOption(option);
};

/* ===== 公共样式回调 ===== */
const centerHeader = () => ({ textAlign: 'center', fontWeight: 900, color: 'var(--ink-900)', fontSize: '14px', letterSpacing: '.2px' });
const centerCell = () => ({ textAlign: 'center', color: 'var(--ink-900)', fontSize: '14px' });

/* ===== 挂载 ===== */
const onResize = () => {
  bar?.resize();
  pie?.resize();
};
onMounted(async () => {
  await nextTick();
  if (barRef.value) {
    bar = echarts.init(barRef.value);
    buildBar();
  }
  if (pieRef.value) {
    pie = echarts.init(pieRef.value);
    buildPie();
  }
  window.addEventListener('resize', onResize);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  bar?.dispose();
  pie?.dispose();
});
</script>

<style scoped>
/* 主题变量 */
.page-wrap {
  --ink-900: #0f172a;
  --ink-700: #334155;
  --muted: #64748b;
  --card-border: #eaf0f7;
  --row-even: #fbfdff;
  --row-odd: #ffffff;

  padding: 14px;
  background:
    radial-gradient(600px 200px at 8% -10%, rgba(99, 102, 241, 0.06), transparent 60%),
    radial-gradient(500px 260px at 92% 0%, rgba(16, 185, 129, 0.06), transparent 60%), linear-gradient(180deg, #f8fbff, #f4f7fd);
  min-height: 100%;
  font-feature-settings: 'tnum';
}

/* 标题 */
.page-title {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin: 4px 0 12px;
}
.page-title h2 {
  margin: 0;
  font-weight: 900;
  letter-spacing: 0.4px;
  color: var(--ink-900);
}

/* 卡片 */
.card.pretty {
  margin-bottom: 14px;
  border: 1px solid var(--card-border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(16, 24, 40, 0.05);
  background: #fff;
}
.card-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 2px;
  border-image: linear-gradient(90deg, #6aa7ff 0, #22c55e 50%, #f59e0b 100%) 1;
  border-bottom: 2px solid transparent;
}
.card-hd b {
  color: var(--ink-900);
  font-size: 16px;
  font-weight: 900;
}
.card-hd .sub {
  color: var(--muted);
  font-size: 12px;
}
.card-actions {
  display: flex;
  gap: 8px;
}

/* 表格（更紧凑&更清晰） */
.tight :deep(.el-table__cell) {
  padding: 10px 12px;
  font-size: 14px;
}
.luxe-table :deep(.el-table__header-wrapper th) {
  background: linear-gradient(180deg, #f8faff, #f2f6ff);
  color: var(--ink-900);
  border-bottom: 1px solid #e5e7eb;
  font-weight: 900;
}
.luxe-table :deep(.el-table__body tr:nth-child(odd) > td) {
  background: var(--row-odd);
}
.luxe-table :deep(.el-table__body tr:nth-child(even) > td) {
  background: var(--row-even);
}
.luxe-table :deep(.el-table__body tr:hover > td) {
  background: #f6fbff !important;
  box-shadow:
    inset 0 1px 0 #eef2ff,
    inset 0 -1px 0 #eef2ff;
}

/* 双行列头 */
.hdr-two {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.05;
}
.hdr-two .hdr-name {
  font-weight: 900;
  color: var(--ink-900);
}
.hdr-two .hdr-unit {
  font-size: 12px;
  color: var(--muted);
  transform: translateY(0.5px);
}

/* 数字层次 */
.mono {
  font-variant-numeric: tabular-nums;
}
.strong {
  font-weight: 800;
  color: var(--ink-900);
}
.mild {
  color: #1e3a8a;
}
.bold-blue {
  color: #0f3c96;
}
.slash {
  display: inline-block;
  padding: 0 4px;
  color: #94a3b8;
}

/* 徽章 */
.table-footer {
  display: flex;
  gap: 10px;
  padding-top: 10px;
}
.pill {
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 800;
  background: #f3f6ff;
  color: #1e40af;
  box-shadow: inset 0 1px 0 #fff;
}
.pill-blue {
  background: #eef4ff;
  color: #1e40af;
}
.pill-green {
  background: #eefbf3;
  color: #065f46;
}

/* 表2布局更紧凑 + 去中线感（修正：不隐藏表，只去右边线/伪元素） */
.g2 {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 8px;
  align-items: stretch;
}
.table-only :deep(.el-table--border) {
  border-right: none !important;
} /* ✅ 只去右边框 */
.table-only :deep(.el-table--border .el-table__inner-wrapper::after),
.table-only :deep(.el-table__border-right-patch),
.table-only :deep(.el-table--border::after) {
  display: none !important;
  width: 0 !important; /* ✅ 仅去伪元素/补丁 */
}
.pie-wrap {
  display: grid;
  grid-template-rows: 1fr auto;
  align-items: center;
  padding-left: 2px;
}
.pie-box {
  width: 100%;
  height: 280px;
}
.legend-note {
  text-align: center;
  font-size: 12px;
  color: var(--muted);
}

/* 占比小胶囊 */
.ratio-chip {
  display: inline-block;
  min-width: 56px;
  text-align: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 800;
  background: #f0f9ff;
  color: #075985;
  border: 1px solid #e0f2fe;
}

/* 图 */
.chart-box {
  width: 100%;
  height: 340px;
}

@media (max-width: 960px) {
  .g2 {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .pie-box {
    height: 240px;
  }
  .chart-box {
    height: 300px;
  }
}
</style>
