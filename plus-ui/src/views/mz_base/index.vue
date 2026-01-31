<template>
  <div class="page-wrap">
    <!-- 表1：地力等级总表（系统/超管） -->
    <el-card class="card pretty" shadow="never" v-has-roles="['sysadmin', 'superadmin']">
      <template #header>
        <div class="card-hd">
          <div class="card-hd-left">
            <b>地力等级总表</b>
            <span class="sub">（单位：块 / 亩）</span>
          </div>
          <div class="card-actions">
            <el-button type="primary" plain size="small" :loading="loading" @click="exportSummaryCSV"> 导出 </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="summaryRows"
        border
        stripe
        class="tight luxe-table"
        :header-cell-style="centerHeader"
        :cell-style="centerCell"
        v-loading="loading"
      >
        <el-table-column prop="base" label="基地名称" min-width="150" fixed />

        <!-- ⭐ 等级列：按实际出现的 visibleLevels 动态生成 -->
        <el-table-column v-for="lv in visibleLevels" :key="lv" min-width="140">
          <template #header>
            <div class="hdr-two">
              <span class="hdr-name">{{ lv }}</span>
              <small class="hdr-unit">（块 / 亩）</small>
            </div>
          </template>
          <template #default="{ row }">
            <span>
              {{ getCountByLevel(row, lv) || '' }}
            </span>

            <span v-if="getCountByLevel(row, lv) || getAreaByLevel(row, lv)" class="slash">/</span>

            <span>
              {{ getAreaByLevel(row, lv) ? getAreaByLevel(row, lv).toLocaleString() : '' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column width="190">
          <template #header>
            <div class="hdr-two">
              <span class="hdr-name">总计</span>
              <small class="hdr-unit">（块 / 亩）</small>
            </div>
          </template>
          <template #default="{ row }">
            <span class="mono">
              {{ row.totalCount || '' }}
            </span>
            <span v-if="row.totalCount || row.totalArea" class="slash">/</span>
            <span class="mono">
              {{ row.totalArea ? toNum(row.totalArea).toLocaleString() : '' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 表2：单基地明细 + 占比环形图（基地管理员） -->
    <el-card class="card pretty" shadow="never" v-has-roles="['baseadmin']">
      <template #header>
        <div class="card-hd">
          <div class="card-hd-left">
            <b>{{ baseName }}地力等级表</b>
            <span class="sub">（单位：块 / 亩）</span>
          </div>
          <div class="card-actions">
            <el-button type="primary" plain size="small" :disabled="!currentBaseId" @click="exportBaseCSV"> 导出 </el-button>
          </div>
        </div>
      </template>

      <div class="g2">
        <div class="table-only">
          <el-table
            :data="displayBaseRows"
            border
            stripe
            class="tight luxe-table"
            :header-cell-style="centerHeader"
            :cell-style="centerCell"
            :empty-text="currentBaseId ? '无数据' : '请选择基地'"
            v-loading="loadingBase"
          >
            <el-table-column prop="level" label="等级" min-width="120" />
            <el-table-column prop="count" label="地块数" min-width="120">
              <template #default="{ row }">
                <span class="mono">{{ row.count || '' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="area" label="面积(亩)" min-width="120">
              <template #default="{ row }">
                <span class="mono">
                  {{ toNum(row.area) ? toNum(row.area).toLocaleString() : '' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="ratio" label="占比" min-width="120">
              <template #default="{ row }">
                <span class="ratio-chip">
                  {{ row.ratio ? (toNum(row.ratio) * 100).toFixed(1) + '%' : '' }}
                </span>
              </template>
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

    <!-- 图：地力等级直方图（总表聚合 / 基地聚合） -->
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
import useUserStore from '@/store/modules/user';
import request from '@/utils/request';

// 当前用户角色
const { roles } = useUserStore();

/* ===== 常量 & 小工具 ===== */
const API_PREFIX = '/mz-base/landLevelReport';
const levelMeta = [
  { key: 'L1', label: '一等' },
  { key: 'L2', label: '二等' },
  { key: 'L3', label: '三等' },
  { key: 'L4', label: '四等' },
  { key: 'L5', label: '五等' },
  { key: 'L6', label: '六等' },
  { key: 'L7', label: '七等' },
  { key: 'L8', label: '八等' },
  { key: 'L9', label: '九等' },
  { key: 'L10', label: '十等' }
];
const toNum = (v: any) => (v == null ? 0 : Number(v));
const getLevelIndex = (label: string) => levelMeta.findIndex((l) => l.label === label);

/* ===== 当前基地名 / 查询条件 ===== */
const baseName = ref<string>();
const year = ref<string>();
const currentBaseId = ref<string | undefined>(undefined);

/* ===== 总表数据 ===== */
type SummaryRow = {
  baseId: string;
  base: string;
  counts: number[]; // 按 levelMeta 顺序
  areas: number[];
  totalCount: number;
  totalArea: number;
};
const summaryRows = ref<SummaryRow[]>([]);
const loading = ref(false);

/* ===== 单基地明细 ===== */
interface BaseDetailRow {
  level: string;
  count: number;
  area: number | string;
  ratio: number;
}
const baseRows = ref<BaseDetailRow[]>([]);
const loadingBase = ref(false);

// 单基地显示的等级行：只保留实际有数据且在 visibleLevels 中的等级
const displayBaseRows = computed(() => baseRows.value.filter((r) => (r.count > 0 || toNum(r.area) > 0) && visibleLevels.value.includes(r.level)));

const hTotal = computed(() => ({
  count: displayBaseRows.value.reduce((s, r) => s + toNum(r.count), 0),
  area: displayBaseRows.value.reduce((s, r) => s + toNum(r.area), 0)
}));

/* ===== 汇总（总表底部） ===== */
const grand = computed(() => {
  const totalCount = summaryRows.value.reduce((s, r) => s + toNum(r.totalCount), 0);
  const totalArea = summaryRows.value.reduce((s, r) => s + toNum(r.totalArea), 0);
  return { totalCount, totalArea };
});

/* ===== 动态可见等级集合（核心） ===== */
const visibleLevels = computed(() => {
  const levels: string[] = [];

  if (roles.includes('baseadmin')) {
    // 基地管理员看本基地
    baseRows.value.forEach((r) => {
      if (r.count > 0 || toNum(r.area) > 0) levels.push(r.level);
    });
  } else {
    // 系统/超管看 summary
    summaryRows.value.forEach((r) =>
      r.counts.forEach((v, i) => {
        if (v > 0 || toNum(r.areas[i]) > 0) {
          levels.push(levelMeta[i].label);
        }
      })
    );
  }

  const showVal = (v: any) => {
    const n = Number(v || 0);
    return n === 0 ? '' : n;
  };

  // 去重 + 按预设顺序排序
  const order = levelMeta.map((v) => v.label);
  return [...new Set(levels)].sort((a, b) => order.indexOf(a) - order.indexOf(b));
});

/* ===== 表格辅助：按等级取 count / area ===== */
const getCountByLevel = (row: SummaryRow, levelLabel: string) => {
  const idx = getLevelIndex(levelLabel);
  if (idx < 0) return 0;
  return row.counts[idx] ?? 0;
};
const getAreaByLevel = (row: SummaryRow, levelLabel: string) => {
  const idx = getLevelIndex(levelLabel);
  if (idx < 0) return 0;
  return toNum(row.areas[idx] ?? 0);
};

/* ===== 导出 CSV：也按 visibleLevels 动态生成列 ===== */
const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob(['\ufeff' + csv], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const exportSummaryCSV = () => {
  const levels = visibleLevels.value;
  const head = ['基地名称', ...levels.map((v) => `${v}(块/亩)`), '总计(块/亩)'];
  const rows = summaryRows.value.map((r) => {
    const pairs = levels.map((lv) => {
      const c = getCountByLevel(r, lv);
      const a = getAreaByLevel(r, lv);
      return `${c}/${a}`;
    });
    return [r.base, ...pairs, `${r.totalCount}/${toNum(r.totalArea)}`];
  });
  const csv = [head, ...rows].map((r) => r.join(',')).join('\n');
  downloadCSV(csv, `地力等级总表${year.value ? '_' + year.value : ''}.csv`);
};

const exportBaseCSV = () => {
  const head = ['等级', '地块数', '面积(亩)', '占比(%)'];
  const rows = displayBaseRows.value.map((r) => [r.level, r.count, toNum(r.area), (toNum(r.ratio) * 100).toFixed(1)]);
  rows.push(['合计', hTotal.value.count, hTotal.value.area, '100.0']);
  const name = baseName.value || '未命名基地';
  const csv = [head, ...rows].map((r) => r.join(',')).join('\n');
  downloadCSV(csv, `${name}地力等级表${year.value ? '_' + year.value : ''}.csv`);
};

/* ===== ECharts：直方图 & 环形图（你之前写的保持不变，只贴关键的） ===== */
const barRef = ref<HTMLDivElement | null>(null);
const pieRef = ref<HTMLDivElement | null>(null);
let bar: echarts.ECharts | null = null;
let pie: echarts.ECharts | null = null;

const buildBar = (agg: number[]) => {
  if (!bar) return;
  const lvLabels = visibleLevels.value;
  const lvIndex = levelMeta.filter((v) => lvLabels.includes(v.label));
  const showAgg = lvIndex.map((v) => agg[levelMeta.indexOf(v)]);

  const areaAgg = new Array(lvIndex.length).fill(0);
  summaryRows.value.forEach((r) =>
    lvIndex.forEach((v, i) => {
      areaAgg[i] += toNum(r.areas[levelMeta.indexOf(v)]);
    })
  );

  const option: echarts.EChartsOption = {
    grid: { left: 48, right: 20, top: 50, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0];
        const idx = p.dataIndex;
        return `${lvLabels[idx]}<br/>地块数：${Math.round(showAgg[idx])} 块<br/>面积：${Math.round(areaAgg[idx])} 亩`;
      }
    },
    // title: {
    //   text: '地力等级直方图',
    //   left: 'center',
    //   top: 8,
    //   textStyle: { fontSize: 14 }
    // },
    xAxis: {
      type: 'category',
      data: lvLabels,
      axisLabel: { color: '#0f172a', fontWeight: 700 }
    },
    yAxis: {
      type: 'value',
      name: '数量（块）',
      nameTextStyle: { color: '#475569', fontWeight: 700 },
      axisLabel: { color: '#334155' }
    },
    series: [
      {
        type: 'bar',
        data: showAgg.map((v) => Math.round(v)),
        barMaxWidth: 46,
        label: {
          show: lvLabels.length <= 6,
          position: 'top',
          color: '#0f172a',
          fontWeight: 700
        },
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#bfdbfe' }
            ]
          }
        }
      }
    ]
  };

  bar.setOption(option, true);
};

const buildPie = () => {
  if (!pie) return;
  const data = displayBaseRows.value.map((r) => ({
    name: r.level,
    value: r.count,
    area: Math.round(toNum(r.area)),
    ratio: r.ratio
  }));

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) =>
        `${p.name}<br/>地块数：${Math.round(p.value)} 块<br/>面积：${p.data.area} 亩<br/>占比：${(p.data.ratio * 100).toFixed(1)}%`
    },
    // title: {
    //   text: '基地等级占比',
    //   left: 'center',
    //   top: 6,
    //   textStyle: { fontSize: 14, color: '#0f172a' }
    // },
    legend: {
      bottom: 0,
      type: 'scroll',
      textStyle: { color: '#334155', fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        data,
        label: {
          show: data.length <= 6,
          formatter: (p: any) => `${p.name}\n${Math.round(p.value)}块`,
          color: '#0f172a',
          fontWeight: 700
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 8,
          shadowColor: 'rgba(0,0,0,0.06)'
        }
      }
    ]
  };
  pie.setOption(option, true);
};

/* ===== 样式回调 ===== */
const centerHeader = () => ({
  textAlign: 'center',
  fontWeight: 900,
  color: 'var(--ink-900)',
  fontSize: '14px',
  letterSpacing: '.2px'
});
const centerCell = () => ({
  textAlign: 'center',
  color: 'var(--ink-900)',
  fontSize: '14px'
});

/* ===== 请求封装 ===== */
const fetchSummary = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (year.value) params.year = year.value;
    const res = await request.get(`${API_PREFIX}/summary`, { params });
    const arr = Array.isArray(res) ? res : (res?.data ?? []);
    summaryRows.value = arr.map((it: any) => ({
      baseId: String(it.baseId),
      base: it.base,
      counts: (it.counts ?? []).map((x: any) => Number(x || 0)),
      areas: (it.areas ?? []).map((x: any) => Number(x || 0)),
      totalCount: Number(it.totalCount || 0),
      totalArea: Number(it.totalArea || 0)
    }));
  } finally {
    loading.value = false;
  }
};

const fetchBaseDetail = async () => {
  loadingBase.value = true;
  try {
    const params: Record<string, any> = { baseId: currentBaseId.value };
    if (year.value) params.year = year.value;

    const res = await request.get(`${API_PREFIX}/baseDetail`, { params });
    baseName.value = res.data.baseName;

    const arr = (
      Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.rows)
            ? res.rows
            : Array.isArray(res?.data?.out)
              ? res.data.out
              : Array.isArray(res?.data?.rows)
                ? res.data.rows
                : []
    ) as BaseDetailRow[];

    const order = levelMeta.map((v) => v.label);
    const tmpMap = new Map<string, BaseDetailRow>(arr.map((r) => [r.level, r]));

    baseRows.value = order.map((lv) => {
      const r = tmpMap.get(lv);
      return {
        level: lv,
        count: Number(r?.count ?? 0),
        area: Number(r?.area ?? 0),
        ratio: Number(r?.ratio ?? 0)
      };
    });
  } finally {
    loadingBase.value = false;
  }
};

/* ===== 事件/生命周期 ===== */
const reloadBaseDetail = async () => {
  await fetchBaseDetail();
  await nextTick();
  buildPie();
};

const reloadAll = async () => {
  await fetchSummary();
  await nextTick();

  const agg = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  if (roles.includes('baseadmin')) {
    await reloadBaseDetail();
    baseRows.value.forEach((r, i) => (agg[i] += r.count));
  } else {
    summaryRows.value.forEach((r) => r.counts.forEach((v, i) => (agg[i] += toNum(v))));
  }
  buildBar(agg);
};

const onResize = () => {
  bar?.resize();
  pie?.resize();
};

onMounted(async () => {
  await nextTick();
  if (barRef.value) bar = echarts.init(barRef.value);
  if (pieRef.value) pie = echarts.init(pieRef.value);
  await reloadAll();
  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  bar?.dispose();
  pie?.dispose();
});
</script>

<style scoped>
/* 原样保留你的样式 */
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

.toolbar {
  margin: 2px 0 12px;
}

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

.g2 {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 8px;
  align-items: stretch;
}
.table-only :deep(.el-table--border) {
  border-right: none !important;
}
.table-only :deep(.el-table--border .el-table__inner-wrapper::after),
.table-only :deep(.el-table__border-right-patch),
.table-only :deep(.el-table--border::after) {
  display: none !important;
  width: 0 !important;
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
