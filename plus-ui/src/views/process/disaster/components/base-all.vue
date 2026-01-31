<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { listIndex } from '@/api/disaster/index';
import { getRegionDisplayName } from '@/components/DisasterWarning/RegionProps';
import type { IndexVO } from '@/api/disaster/index/types';

/* ---------------- 固定只显示这 8 个基地 ---------------- */
const REGION_NAME_MAP: Record<string, string> = {
  '1': '姜兴庄基地',
  '2': '侯家沟基地',
  '4': '李家寺基地',
  '5': '高家硷基地',
  '6': '冯渠基地',
  '7': '寺沟基地',
  '8': '岳家岔基地',
  '9': '杨家沟基地'
};
const ALLOWED_CODES = ['1', '2', '4', '5', '6', '7', '8', '9'] as const;
const ALLOWED_SET = new Set(ALLOWED_CODES);
const NAME_TO_CODE: Record<string, string> = Object.fromEntries(Object.entries(REGION_NAME_MAP).map(([k, v]) => [v, k]));

/* 归一化 detectionArea 到 8 个码之一；不在集合内返回空串（丢弃） */
function normalizeAreaKey(area: any): string {
  const raw = String(area ?? '').trim();
  if (!raw) return '';
  if (ALLOWED_SET.has(raw)) return raw; // 直接是码
  const numeric = String(Number(raw)); // '1.0' / 1 -> '1'
  if (ALLOWED_SET.has(numeric)) return numeric;
  if (NAME_TO_CODE[raw]) return NAME_TO_CODE[raw]; // 本身就是中文名
  const byDisplay = typeof getRegionDisplayName === 'function' ? getRegionDisplayName(raw) : '';
  if (byDisplay && NAME_TO_CODE[byDisplay]) return NAME_TO_CODE[byDisplay]; // ID/别名 -> 名称 -> 码
  return '';
}

/* ---------------- 数据获取 ---------------- */
const baseDataList = ref<IndexVO[]>([]);
onMounted(async () => {
  try {
    const res = await listIndex({ pageNum: 1, pageSize: 1000 });
    baseDataList.value = Array.isArray(res?.rows) ? (res.rows as IndexVO[]) : [];
  } catch {
    baseDataList.value = [];
  }
});

/* ---------------- 指标最新值工具 ---------------- */
function latestIndexValue(baseCode: string, indexName: string): number | null {
  let latestValue: number | null = null;
  let latestTs = 0;
  const target = indexName.trim().toUpperCase();
  for (const it of baseDataList.value) {
    const code = normalizeAreaKey(it?.detectionArea);
    if (code !== baseCode) continue;
    if (
      String(it?.indexName ?? '')
        .trim()
        .toUpperCase() !== target
    )
      continue;
    const ts = toTs(pickTimeField(it));
    const val = Number(it?.indexValue);
    if (Number.isNaN(val)) continue;
    if (ts >= latestTs) {
      latestTs = ts;
      latestValue = val;
    }
  }
  return latestValue;
}

function determineDroughtStatus(baseCode: string): string {
  const S = latestIndexValue(baseCode, 'S') ?? null;
  if (S !== null) {
    if (S <= -2.2) return '特旱';
    if (S <= -1.4) return '重旱';
    if (S <= -1.0) return '中旱';
    if (S <= -0.2) return '轻旱';
    return '正常';
  }
}

function determineFloodStatus(baseCode: string): string {
  const r = latestIndexValue(baseCode, 'R');
  if (r !== null) {
    if (r < 0.1) return '特别重大洪涝';
    if (r < 0.2) return '重大洪涝';
    if (r < 0.25) return '较大洪涝';
    if (r < 0.3) return '一般洪涝';
    return '正常';
  }
  const swi = latestIndexValue(baseCode, 'SWI');
  if (swi !== null) {
    if (swi > 0.85) return '特别重大洪涝';
    if (swi > 0.75) return '重大洪涝';
    if (swi > 0.65) return '较大洪涝';
    if (swi > 0.55) return '一般洪涝';
    return '正常';
  }
  const ndwi = latestIndexValue(baseCode, 'NDWI');
  if (ndwi !== null) {
    if (ndwi > 0.6) return '特别重大洪涝';
    if (ndwi > 0.5) return '重大洪涝';
    if (ndwi > 0.4) return '较大洪涝';
    if (ndwi > 0.3) return '一般洪涝';
  }
  return '正常';
}

function determineHailStatus(baseCode: string): string {
  const k = latestIndexValue(baseCode, 'K');
  const tt = latestIndexValue(baseCode, 'TT');
  if (k === null || tt === null) return '正常';
  if (k > 40 && tt > 55) return '特重冰雹';
  if (k > 35 && tt > 50) return '重度冰雹';
  if (k > 30 && tt > 45) return '中度冰雹';
  if (k > 25 && tt > 40) return '轻度冰雹';
  return '正常';
}
// 原 classByText 替换为这个
function classByText(disaster: '0' | '1' | '2', text: string): 'lvl-good' | 'lvl-minor' | 'lvl-warn' | 'lvl-bad' {
  const t = String(text);

  if (disaster === '0') {
    // 旱
    if (/特旱|重旱/.test(t)) return 'lvl-bad';
    if (/中旱/.test(t)) return 'lvl-warn';
    if (/轻旱/.test(t)) return 'lvl-minor'; // ✅ 轻旱单独颜色
    return 'lvl-good'; // 正常
  }

  if (disaster === '1') {
    // 洪涝
    if (/特别重大洪涝|重大洪涝/.test(t)) return 'lvl-bad';
    if (/较大洪涝/.test(t)) return 'lvl-warn';
    if (/一般洪涝/.test(t)) return 'lvl-minor'; // ✅ 一般
    return 'lvl-good'; // 正常
  }

  // 冰雹
  if (/特重冰雹|重度冰雹/.test(t)) return 'lvl-bad';
  if (/中度冰雹/.test(t)) return 'lvl-warn';
  if (/轻度冰雹|轻微冰雹/.test(t)) return 'lvl-minor'; // ✅ 轻度/轻微
  return 'lvl-good'; // 正常
}

/* ---------------- 时间工具 ---------------- */
function pickTimeField(row: any) {
  return row?.createTime ?? row?.issueTime ?? row?.time ?? row?.timestamp ?? row?.ts ?? '';
}
function toTs(input: any): number {
  if (input == null || input === '') return 0;
  if (typeof input === 'number') return input > 1e12 ? input : input * 1000;
  if (/^\d{10,13}$/.test(String(input))) {
    const n = Number(input);
    return n > 1e12 ? n : n * 1000;
  }
  let d = new Date(input);
  if (isNaN(d.getTime())) d = new Date(String(input).replace(' ', 'T'));
  if (isNaN(d.getTime())) d = new Date(String(input).replace(/-/g, '/'));
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

/* ---------------- 三类灾害“最新状态”（限定到 8 个基地） ---------------- */
function latestStatusFor(baseCode: string, disaster: '0' | '1' | '2') {
  let text = '正常';
  if (disaster === '0') {
    text = determineDroughtStatus(baseCode);
  } else if (disaster === '1') {
    text = determineFloodStatus(baseCode);
  } else if (disaster === '2') {
    text = determineHailStatus(baseCode);
  }
  return { text, cls: classByText(disaster, text) };
}

/* ---------------- 表格数据：严格使用 8 个码为行集合 ---------------- */
const statusTableRows = computed(() => {
  return ALLOWED_CODES.map((code) => {
    const drought = latestStatusFor(code, '0');
    const flood = latestStatusFor(code, '1');
    const hail = latestStatusFor(code, '2');
    return {
      baseKey: code,
      baseName: REGION_NAME_MAP[code], // 展示中文名
      droughtText: drought.text,
      droughtCls: drought.cls,
      floodText: flood.text,
      floodCls: flood.cls,
      hailText: hail.text,
      hailCls: hail.cls
    };
  });
});

/* 可选：点击行上抛 */
const emit = defineEmits<{ (e: 'base-selected', regionCode: string): void }>();
function onRowClick(row: any) {
  emit('base-selected', row?.baseKey);
}
</script>

<template>
  <div class="base-all-container">
    <el-card class="growth-table-card" shadow="hover" :body-style="{ padding: '0' }">
      <el-table
        :data="statusTableRows"
        :height="303"
        :weight="300"
        size="small"
        header-cell-class-name="tbl-header"
        cell-class-name="tbl-cell"
        @row-click="onRowClick"
      >
        <el-table-column prop="baseName" label="基地" min-width="120" show-overflow-tooltip />
        <el-table-column label="旱灾情况" align="center" min-width="150">
          <template #default="{ row }"
            ><span class="chip" :class="row.droughtCls">{{ row.droughtText }}</span></template
          >
        </el-table-column>
        <el-table-column label="洪涝情况" align="center" min-width="150">
          <template #default="{ row }"
            ><span class="chip" :class="row.floodCls">{{ row.floodText }}</span></template
          >
        </el-table-column>
        <el-table-column label="冰雹情况" align="center" min-width="150">
          <template #default="{ row }"
            ><span class="chip" :class="row.hailCls">{{ row.hailText }}</span></template
          >
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
}

.lvl-good {
  background: #e7f6ec;
  color: #41a058;
} /* 正常 */
.lvl-minor {
  background: #e8f3ff;
  color: #409eff;
} /* ✅ 轻微/轻度/一般（蓝） */
.lvl-warn {
  background: #fff7e6;
  color: #e6a23c;
} /* 中 */
.lvl-bad {
  background: #fdecea;
  color: #f5222d;
} /* 重/特 */

.base-all-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}
.growth-table-card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
:deep(.tbl-header) {
  background: #f5f7fa !important;
  color: #303133;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid #ebeef5;
}
:deep(.tbl-cell) {
  font-size: 13px;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}
:deep(.el-table__body tr:hover > td) {
  background: #fafcff !important;
}
.chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
}
.lvl-good {
  background: #e7f6ec;
  color: #41a058;
}
.lvl-warn {
  background: #fff7e6;
  color: #e6a23c;
}
.lvl-bad {
  background: #fdecea;
  color: #f5222d;
}
</style>
