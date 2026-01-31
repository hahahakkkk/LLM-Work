<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import DisasterWarningSeverityPie from '../components/disaster-warning-severity-pie.vue';
import DisasterWarningTypeComparison from '../components/disaster-warning-type-comparison.vue';
import DisasterWarningTimeline from '../components/disaster-warning-timeline.vue';
import DisasterWarningTrendChart from '../components/disaster-warning-trend-chart.vue';
import useUserStore from '@/store/modules/user';
import {
  useDisasterInsights,
  HAZARD_META,
  SEVERITY_META,
  INDEX_NAME_TO_HAZARD,
  evaluateIndexLevel,
  labelToSeverity,
  normalizeAreaKey,
  REGION_NAME_MAP,
  ALLOWED_BASE_CODES
} from '../hooks/useDisasterInsights';
import type { HazardKey, SeverityKey } from '../hooks/useDisasterInsights';
import type { IndexVO } from '@/api/disaster/index/types';
import type { ProtectionVO } from '@/api/disaster/protection/types';

const { warningTimeline, protections, indexes, loadAll } = useDisasterInsights();
const userStore = useUserStore();

const selectedHazard = ref<'all' | HazardKey>('all');
const baseCodeList = ALLOWED_BASE_CODES.slice(0, 9);
const selectedBase = ref<string>(''); // 空值表示全基地
const isAdminUser = computed(() => (userStore.name || userStore.nickname) === 'admin');
const effectiveSelectedBase = computed(() => (isAdminUser.value ? selectedBase.value : ''));

const hazardLabel = computed(() => (selectedHazard.value === 'all' ? '全部灾害' : HAZARD_META[selectedHazard.value].label));

const DROUGHT_SEVERITY_LABELS: Partial<Record<SeverityKey, string>> = {
  extreme: '特旱',
  severe: '重旱',
  medium: '中旱',
  minor: '一般',
  safe: '安全'
};
const FLOOD_SEVERITY_LABELS: Partial<Record<SeverityKey, string>> = {
  extreme: '特别重大洪涝',
  severe: '重大洪涝',
  medium: '较大洪涝',
  minor: '一般洪涝',
  safe: '安全'
};
const HAIL_SEVERITY_LABELS: Partial<Record<SeverityKey, string>> = {
  extreme: '特重冰雹',
  severe: '重度冰雹',
  medium: '中度冰雹',
  minor: '轻度冰雹',
  safe: '安全'
};
const HAZARD_SEVERITY_LEGENDS: Record<'0' | '1' | '2', Partial<Record<SeverityKey, string>>> = {
  '0': DROUGHT_SEVERITY_LABELS,
  '1': FLOOD_SEVERITY_LABELS,
  '2': HAIL_SEVERITY_LABELS
};

const severityOrderForProtection = ['minor', 'medium', 'severe', 'extreme'] as const;
const PROTECTION_LEVELS_BY_KEY: Record<HazardKey, Array<{ value: number; label: string }>> = {
  '0': [
    { value: 4, label: '轻旱' },
    { value: 5, label: '中旱' },
    { value: 6, label: '重旱' },
    { value: 7, label: '特旱' }
  ],
  '1': [
    { value: 8, label: '一般洪涝' },
    { value: 9, label: '较大洪涝' },
    { value: 10, label: '重大洪涝' },
    { value: 11, label: '特别重大洪涝' }
  ],
  '2': [
    { value: 0, label: '轻度冰雹' },
    { value: 1, label: '中度冰雹' },
    { value: 2, label: '重度冰雹' },
    { value: 3, label: '特重冰雹' }
  ]
};
const PROTECTION_LEGENDS: Record<HazardKey, Record<(typeof severityOrderForProtection)[number], string>> = {
  '0': { extreme: '特旱', severe: '重旱', medium: '中旱', minor: '轻旱' },
  '1': { extreme: '特别重大洪涝', severe: '重大洪涝', medium: '较大洪涝', minor: '一般洪涝' },
  '2': { extreme: '特重冰雹', severe: '重度冰雹', medium: '中度冰雹', minor: '轻度冰雹' }
};
const levelIndexForProtection = (plan: ProtectionVO) => {
  const hazard = (
    String((plan as any)?.disasterType || '').trim() === '1' ? '1' : String((plan as any)?.disasterType || '').trim() === '2' ? '2' : '0'
  ) as HazardKey;
  const levels = PROTECTION_LEVELS_BY_KEY[hazard] || [];
  return {
    hazard,
    idx: levels.findIndex((item) => Number((plan as any)?.disasterLevel) === item.value)
  };
};
const filteredProtections = computed(() => {
  return protections.value.filter((plan) => {
    const hazard = levelIndexForProtection(plan).hazard;
    if (selectedHazard.value !== 'all' && hazard !== selectedHazard.value) return false;
    return true;
  });
});
const protectionDistribution = computed(() => {
  const counts = [0, 0, 0, 0];
  filteredProtections.value.forEach((plan) => {
    const { idx } = levelIndexForProtection(plan);
    if (idx >= 0 && idx < counts.length) counts[idx] += 1;
  });
  return counts.map((value, idx) => {
    const severity = severityOrderForProtection[idx];
    return {
      key: severity,
      label: SEVERITY_META[severity].label,
      value,
      color: SEVERITY_META[severity].color
    };
  });
});
const protectionLegendMapping = computed(() => (selectedHazard.value === 'all' ? undefined : PROTECTION_LEGENDS[selectedHazard.value]));

const baseOptions = computed(() =>
  baseCodeList.map((code) => ({
    value: code,
    label: REGION_NAME_MAP[code] || code
  }))
);

const filteredWarnings = computed(() => {
  return warningTimeline.value.filter((item) => {
    if (selectedHazard.value !== 'all' && item.hazard !== selectedHazard.value) return false;
    return true;
  });
});

const typeComparisonData = computed(() => {
  const now = Date.now();
  const recentThreshold = now - 30 * 24 * 60 * 60 * 1000;
  const stats: Record<HazardKey, { total: number; severe: number; recent: number }> = {
    '0': { total: 0, severe: 0, recent: 0 },
    '1': { total: 0, severe: 0, recent: 0 },
    '2': { total: 0, severe: 0, recent: 0 }
  };
  filteredWarnings.value.forEach((item) => {
    stats[item.hazard].total += 1;
    if (item.severity === 'severe' || item.severity === 'extreme') stats[item.hazard].severe += 1;
    if (item.timestamp && item.timestamp >= recentThreshold) stats[item.hazard].recent += 1;
  });
  return (['0', '1', '2'] as HazardKey[]).map((key) => ({
    key,
    label: HAZARD_META[key].label,
    color: HAZARD_META[key].color,
    total: stats[key].total,
    severe: stats[key].severe,
    recent: stats[key].recent
  }));
});

const parseTimestamp = (input: any): number => {
  if (input == null) return 0;
  if (typeof input === 'number') return input > 1e12 ? input : input * 1000;
  const str = String(input).trim();
  if (!str) return 0;
  if (/^\d{10,13}$/.test(str)) {
    const num = Number(str);
    return num > 1e12 ? num : num * 1000;
  }
  let normalized = str.replace('T', ' ').replace(/\.\d+/, '');
  if (/^\d{4}-\d/.test(normalized)) normalized = normalized.replace(/-/g, '/');
  const ts = new Date(normalized).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

const filteredIndexes = computed(() =>
  indexes.value.filter((item) => {
    const hazard = INDEX_NAME_TO_HAZARD[String(item.indexName || '').toUpperCase()] ?? (item.disasterType as HazardKey | undefined);
    if (selectedHazard.value !== 'all' && hazard !== selectedHazard.value) return false;
    return true;
  })
);

const filteredIndexesForTrend = computed(() =>
  indexes.value.filter((item) => {
    const hazard = INDEX_NAME_TO_HAZARD[String(item.indexName || '').toUpperCase()] ?? (item.disasterType as HazardKey | undefined);
    if (selectedHazard.value !== 'all' && hazard !== selectedHazard.value) return false;
    if (effectiveSelectedBase.value && normalizeAreaKey((item as any)?.detectionArea) !== effectiveSelectedBase.value) return false;
    return true;
  })
);

const indexNames = computed(() => {
  const set = new Set<string>();
  filteredIndexes.value.forEach((item) => {
    set.add(String(item.indexName || '').toUpperCase());
  });
  return Array.from(set);
});

const trendIndexNames = computed(() => {
  const set = new Set<string>();
  filteredIndexesForTrend.value.forEach((item) => {
    set.add(String(item.indexName || '').toUpperCase());
  });
  return Array.from(set);
});

const palette: Record<string, string> = {
  S: '#F4B400',
  SWI: '#2F88FF',
  NDWI: '#20C997',
  HAILSCORE: '#7B61FF',
  HailSource: '#F56C6C'
};
const colorForIndex = (name: string) => palette[name.toUpperCase()] || '#5B8FF9';

const generateDayBuckets = (days: number) => {
  const now = new Date();
  const result: Array<{ key: string; label: string }> = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    day.setDate(day.getDate() - i);
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const label = `${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    result.push({ key, label });
  }
  return result;
};

const trendSeries = computed(() => {
  const buckets = generateDayBuckets(14);
  const names = trendIndexNames.value;
  const aggregates = names.map(() => buckets.map(() => ({ sum: 0, count: 0 })));
  filteredIndexesForTrend.value.forEach((item) => {
    const idxName = String(item.indexName || '').toUpperCase();
    const idx = names.indexOf(idxName);
    if (idx === -1) return;
    const ts = parseTimestamp(item.createTime);
    const key = `${new Date(ts).getFullYear()}-${String(new Date(ts).getMonth() + 1).padStart(2, '0')}-${String(new Date(ts).getDate()).padStart(2, '0')}`;
    const bucketIndex = buckets.findIndex((bucket) => bucket.key === key);
    if (bucketIndex === -1) return;
    const value = Number(item.indexValue);
    if (!Number.isNaN(value)) {
      aggregates[idx][bucketIndex].sum += value;
      aggregates[idx][bucketIndex].count += 1;
    }
  });

  const series = names.map((name, idx) => ({
    key: name,
    name,
    color: colorForIndex(name),
    data: aggregates[idx].map((item) => (item.count ? Number((item.sum / item.count).toFixed(3)) : null))
  }));

  return { categories: buckets.map((bucket) => bucket.label), series };
});

const indexDistributionData = computed(() => {
  const counts: Record<SeverityKey, number> = {
    extreme: 0,
    severe: 0,
    medium: 0,
    minor: 0,
    safe: 0,
    unknown: 0
  };
  filteredIndexes.value.forEach((item) => {
    const label = evaluateIndexLevel(item as IndexVO);
    const severity = labelToSeverity(label);
    counts[severity] += 1;
  });
  const order: SeverityKey[] = ['extreme', 'severe', 'medium', 'minor', 'safe'];
  return order.map((severity) => ({
    key: severity,
    label: SEVERITY_META[severity].label,
    value: counts[severity],
    color: SEVERITY_META[severity].color
  }));
});
const INDEX_DISTRIBUTION_START_DATE = new Date(2025, 4, 1).getTime();
const indexDistributionTimeInfo = computed(() => `${formatDateOnly(INDEX_DISTRIBUTION_START_DATE)} - ${formatDateOnly(Date.now())}`);

const formatDateOnly = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
};

const TYPE_COMPARISON_START_DATE = new Date(2024, 0, 1).getTime();
const typeComparisonTimeInfo = computed(() => `${formatDateOnly(TYPE_COMPARISON_START_DATE)} - ${formatDateOnly(Date.now())}`);

onMounted(() => {
  loadAll();
});

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
</script>

<template>
  <div class="warning-dashboard">
    <div class="filters-card">
      <div class="control-card">
        <div class="control-row">
          <span class="label">关注灾害</span>
          <div class="control-inline">
            <el-radio-group v-model="selectedHazard" size="small" class="hazard-radio">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="0">旱灾</el-radio-button>
              <el-radio-button label="1">洪涝</el-radio-button>
              <el-radio-button label="2">冰雹</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <el-card class="grid-item">
        <template #header>
          <div class="card-header">
            <span>历史灾害类型对比</span>
            <span class="sub-title">统计时间：{{ typeComparisonTimeInfo }}</span>
          </div>
        </template>
        <DisasterWarningTypeComparison :data="typeComparisonData" :height="280" />
      </el-card>

      <el-card class="grid-item">
        <template #header>
          <div class="card-header">
            <span>已提交防护建议</span>
            <span class="sub-title">{{ hazardLabel }}</span>
          </div>
        </template>
        <DisasterWarningSeverityPie :data="protectionDistribution" :legend-mapping="protectionLegendMapping" :height="280" />
      </el-card>

      <el-card class="grid-item">
        <template #header>
          <div class="card-header">
            <span>指数趋势</span>
            <div v-if="isAdminUser" class="header-actions">
              <!-- <span class="sub-title">近14天平均值</span> -->
              <el-select v-model="selectedBase" size="small" class="base-select" placeholder="选择基地">
                <el-option v-for="item in baseOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </div>
        </template>
        <DisasterWarningTrendChart :categories="trendSeries.categories" :series="trendSeries.series" :height="280" />
      </el-card>

      <el-card class="grid-item">
        <template #header>
          <div class="card-header">
            <span>历史指数等级分布</span>
            <span class="sub-title">统计时间：{{ indexDistributionTimeInfo }}</span>
          </div>
        </template>
        <DisasterWarningSeverityPie :data="indexDistributionData" :height="280" />
      </el-card>

      <!-- <el-card class="grid-item grid-span-2">
        <template #header>
          <div class="card-header">
            <span>预警时间脉络</span>
            <span class="sub-title">筛选后事件轨迹</span>
          </div>
        </template>
        <DisasterWarningTimeline :points="filteredTimeline" :height="320" />
      </el-card> -->
    </div>
  </div>
</template>

<style scoped lang="scss">
.warning-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  background: #f5f7fb;
  height: calc(100vh - 84px);
  overflow: auto;
}

.filters-card {
  margin-bottom: 0;
}

.control-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.07);
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;

  .label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
    min-width: 72px;
  }

  .control-inline {
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    gap: 12px;
    flex: 1 1 auto;
    min-width: 0;

    .hazard-radio {
      width: 100%;

      :deep(.el-radio-button__inner) {
        font-size: 14px;
        padding: 6px 16px;
      }
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__selection) {
      font-size: 14px;
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #303133;
  gap: 12px;

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .base-select {
      min-width: 200px;
    }
  }

  .sub-title {
    font-size: 12px;
    color: #909399;
    font-weight: 400;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.grid-item {
  max-height: 385px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.07);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;

  .sub-title {
    font-size: 12px;
    color: #909399;
    font-weight: 400;
  }
}

:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 0 16px 16px 16px;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
