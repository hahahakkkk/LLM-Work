<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import StandardProtection from '../components/standard-protection.vue';
import { useDisasterInsights, HAZARD_META, SEVERITY_META } from '../hooks/useDisasterInsights';
import type { HazardKey, TrendSeriesItem, SeverityKey } from '../hooks/useDisasterInsights';
import type { ProtectionVO } from '@/api/disaster/protection/types';

type DisasterKey = 'drought' | 'flood' | 'hail';
type LevelDef = { value: number; label: string };

const selectedHazard = ref<HazardKey>('0');
const detailDrawerVisible = ref(false);
const activePlan = ref<ProtectionVO | null>(null);

const { protections, refresh, loadAll } = useDisasterInsights();

const hazardLabel = computed(() => HAZARD_META[selectedHazard.value].label);

const hazardKey = computed<DisasterKey>(() => {
  if (selectedHazard.value === '0') return 'drought';
  if (selectedHazard.value === '1') return 'flood';
  return 'hail';
});

const LEVELS_BY_KEY: Record<DisasterKey, LevelDef[]> = {
  drought: [
    { value: 4, label: '轻旱' },
    { value: 5, label: '中旱' },
    { value: 6, label: '重旱' },
    { value: 7, label: '特旱' }
  ],
  flood: [
    { value: 8, label: '一般洪涝' },
    { value: 9, label: '较大洪涝' },
    { value: 10, label: '重大洪涝' },
    { value: 11, label: '特别重大洪涝' }
  ],
  hail: [
    { value: 0, label: '轻度冰雹' },
    { value: 1, label: '中度冰雹' },
    { value: 2, label: '重度冰雹' },
    { value: 3, label: '特重冰雹' }
  ]
};

const STATIC_PLANS: Record<DisasterKey, Record<number, { measures: string[]; tips?: string }>> = {
  drought: {
    4: {
      measures: [
        '清沟理墒、覆盖地膜保墒，减少蒸发',
        '合理密植并浅锄松土保墒',
        '清晨或傍晚小水轻浇，避免中午大水漫灌',
        '喷施保水剂或蒸腾抑制剂，缓解失水'
      ]
      // tips: '以保苗为主，避免一次性大量浇水导致板结或倒伏'
    },
    5: {
      measures: ['分区轮灌，优先生育关键期地块', '启用喷灌/微灌提高水分利用率', '调配临时水源保障重点地块', '控旺并酌减氮肥，防止徒长']
    },
    6: {
      measures: ['夜间滴灌或微喷降低蒸腾', '搭设遮阳网降低叶温', '适度间伐去老叶，减少耗水', '启动抗旱应急预案，统一供水调度']
      // tips: '关注高温热害，必要时优先降温与保墒'
    },
    7: {
      measures: ['应急供水车轮灌“保命水”', '考虑改茬或提前收获，减少无效耗水', '对接抗旱物资与保险理赔', '及时上报灾情争取补贴']
    }
  },
  flood: {
    8: {
      measures: ['清沟理墒疏通排水', '浅沟排水避免田间长时间积水', '喷施叶面营养+预防性杀菌剂']
      // tips: '提前巡查沟渠和排水口是否通畅'
    },
    9: {
      measures: ['加深条沟/腰沟配合小泵抽排', '扶正植株并喷施助壮剂', '对纹枯、稻瘟、根腐等高风险病害及时预防']
    },
    10: {
      measures: ['渠系贯通必要时围堰导排', '抽排同步补施根系活化剂恢复根活力', '缺苗地块补种或移栽缩短减产窗口', '病虫害联防联控防止二次爆发']
    },
    11: {
      measures: ['启用大型排涝泵连续抽排', '堤坝塘口加固巡查防二次险情', '仓储转移与烘干应急防止霉变', '推进改茬改种与补贴申请稳定产销']
    }
  },
  hail: {
    0: {
      measures: ['关注临近预报，准备可移动覆盖物', '行间预置支架，应急可快速搭建', '关键时期加强值守，确保预警落地']
    },
    1: {
      measures: ['安装防雹网并定期加固', '暴发前快速覆盖并发布预警广播', '易倒伏作物增设临时支撑']
    },
    2: {
      measures: ['雹后24小时内剪除伤枝伤果减感染', '喷施铜制剂/多抗霉素防细菌真菌侵染', '补施叶面营养促进恢复', '如伴随积水需同步排涝']
    },
    3: {
      measures: ['重灾区重剪重建或改种', '办理农业保险理赔与灾情上报', '清运病残体并无害化处理', '制定中长期防护方案（高强度防雹网、区域联防）']
    }
  }
};

const selectedLevels = computed<LevelDef[]>(() => LEVELS_BY_KEY[hazardKey.value]);

const filteredPlans = computed<ProtectionVO[]>(() => protections.value.filter((plan) => String(plan.disasterType) === selectedHazard.value));

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

const formatDate = (timestamp: number, pattern = 'YYYY-MM-DD HH:mm') => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const MM = pad(d.getMinutes());
  const SS = pad(d.getSeconds());
  if (pattern === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
};

const generateDayBuckets = (days: number) => {
  const result: Array<{ key: string; label: string }> = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    day.setDate(day.getDate() - i);
    const key = formatDate(day.getTime(), 'YYYY-MM-DD');
    const label = `${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;
    result.push({ key, label });
  }
  return result;
};

const trendSeries = computed<{ categories: string[]; series: TrendSeriesItem[] }>(() => {
  const buckets = generateDayBuckets(14);
  const map = new Map(buckets.map((bucket) => [bucket.key, 0]));
  filteredPlans.value.forEach((plan) => {
    const ts = parseTimestamp(plan.disasterTime);
    const key = formatDate(ts, 'YYYY-MM-DD');
    if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
  });
  const data = buckets.map((bucket) => map.get(bucket.key) || 0);
  const series: TrendSeriesItem = {
    key: selectedHazard.value,
    name: hazardLabel.value,
    color: HAZARD_META[selectedHazard.value].color,
    data
  };
  return { categories: buckets.map((bucket) => bucket.label), series: [series] };
});

const timelinePlans = computed(() =>
  [...filteredPlans.value].sort((a, b) => parseTimestamp(b.disasterTime) - parseTimestamp(a.disasterTime)).slice(0, 12)
);

const statsCards = computed(() => {
  const total = filteredPlans.value.length;
  const severeCount = filteredPlans.value.filter((plan) => {
    const idx = selectedLevels.value.findIndex((item) => Number(plan.disasterLevel) === item.value);
    return idx >= 2;
  }).length;
  const avg = total === 0 ? 0 : Math.round((total / Math.max(timelinePlans.value.length, 1)) * 100) / 100;
  return [
    // { label: '累计方案', value: total, color: '#409EFF' },
    // { label: '高等级方案', value: severeCount, color: '#F56C6C' }
    // { label: '近12条平均频次', value: `${avg}`, color: '#67C23A' }
  ];
});

const openDetail = (plan: ProtectionVO) => {
  activePlan.value = plan;
  detailDrawerVisible.value = true;
};

const levelTagType = (idx: number): 'success' | 'primary' | 'warning' | 'danger' => {
  if (idx <= 0) return 'success';
  if (idx === 1) return 'primary';
  if (idx === 2) return 'warning';
  return 'danger';
};

const handleRefresh = async () => {
  await refresh();
};

onMounted(() => {
  loadAll();
});
</script>

<template>
  <div class="protection-dashboard">
    <div class="filters-card">
      <div class="control-card">
        <div class="control-row">
          <span class="label">关注灾害</span>
          <el-radio-group v-model="selectedHazard" size="small" class="hazard-radio">
            <el-radio-button label="0">旱灾</el-radio-button>
            <el-radio-button label="1">洪涝</el-radio-button>
            <el-radio-button label="2">冰雹</el-radio-button>
          </el-radio-group>
          <!-- <span class="hint">当前筛选：{{ hazardLabel }}</span> -->
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div v-for="item in statsCards" :key="item.label" class="stat-card">
        <div class="value" :style="{ color: item.color }">{{ item.value }}</div>
        <div class="label">{{ item.label }}</div>
      </div>
    </div>

    <div class="content-grid">
      <!-- <el-card class="grid-item">
        <template #header>
          <div class="card-header">
            <span>近14天响应频次</span>
            <span class="sub-title">{{ hazardLabel }}</span>
          </div>
        </template>
        <DisasterWarningTrendChart :categories="trendSeries.categories" :series="trendSeries.series" :height="280" />
      </el-card> -->

      <!-- <el-card class="grid-item timeline-card">
        <template #header>
          <div class="card-header">
            <span>最近响应记录</span>
            <span class="sub-title">双击查看详情</span>
          </div>
        </template>
        <el-scrollbar class="timeline-scroll">
          <el-timeline>
            <el-timeline-item
              v-for="plan in timelinePlans"
              :key="plan.id"
              :timestamp="formatDate(parseTimestamp(plan.disasterTime))"
              :color="SEVERITY_META[levelToSeverity(selectedLevels.findIndex((item) => Number(plan.disasterLevel) === item.value))].color"
              @click="openDetail(plan)"
            >
              <div class="timeline-item">
                <el-tag
                  :type="levelTagType(selectedLevels.findIndex((item) => Number(plan.disasterLevel) === item.value))"
                  effect="dark"
                  size="small"
                >
                  {{ selectedLevels.find((item) => Number(plan.disasterLevel) === item.value)?.label || '未知等级' }}
                </el-tag>
                <div class="timeline-content">
                  <div class="title">响应方案</div>
                  <div class="desc">{{ plan.protectionPlan }}</div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-scrollbar>
      </el-card> -->

      <el-card class="grid-item standard-card">
        <template #header>
          <div class="card-header">
            <span>标准防护建议</span>
            <!-- <span class="sub-title">{{ hazardLabel }} · 等级指引</span> -->
          </div>
        </template>
        <StandardProtection
          :disaster-key="hazardKey"
          :levels="selectedLevels"
          :plans="STATIC_PLANS"
          :level-tag-type="(val: any) => levelTagType(selectedLevels.findIndex((item) => item.value === Number(val)))"
          :level-label="(val: any) => selectedLevels.find((item) => item.value === Number(val))?.label ?? `等级 ${val}`"
          :selected-disaster="selectedHazard"
        />
      </el-card>
    </div>

    <el-drawer v-model="detailDrawerVisible" title="防护方案详情" size="400px" destroy-on-close>
      <template v-if="activePlan">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="灾害类型">{{ hazardLabel }}</el-descriptions-item>
          <el-descriptions-item label="灾害等级">
            {{ selectedLevels.find((item) => item.value === Number(activePlan.disasterLevel))?.label || '未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="发生时间">
            {{ formatDate(parseTimestamp(activePlan.disasterTime)) }}
          </el-descriptions-item>
          <el-descriptions-item label="防护方案">
            {{ activePlan.protectionPlan }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
      <el-empty v-else description="请选择一条记录" />
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.protection-dashboard {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  flex-wrap: wrap;

  .label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
    min-width: 72px;
  }

  .hazard-radio {
    flex: 1 1 auto;

    :deep(.el-radio-button__inner) {
      font-size: 14px;
      padding: 6px 16px;
    }
  }

  .hint {
    font-size: 12px;
    color: #909399;
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.07);
  display: flex;
  flex-direction: column;
  gap: 6px;

  .value {
    font-size: 22px;
    font-weight: 600;
  }

  .label {
    font-size: 12px;
    color: #606266;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.grid-item {
  min-height: 280px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.07);
}

.standard-card {
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #303133;

  .sub-title {
    font-size: 12px;
    color: #909399;
    font-weight: 400;
  }
}

.timeline-card {
  .timeline-scroll {
    max-height: 280px;
  }

  .timeline-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;

    .timeline-content {
      .title {
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }
      .desc {
        font-size: 12px;
        color: #606266;
      }
    }
  }
}

:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 0 16px 16px 16px;
}

:deep(.standard-protection-container) {
  height: 100%;
}

:deep(.risk-method-container) {
  height: 100%;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .full-span {
    grid-column: span 1;
  }
}
</style>
