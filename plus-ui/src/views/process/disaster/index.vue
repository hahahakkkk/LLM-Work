<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import QuickAccess from './components/quick-access-all-bases.vue';
import DisasterSituationForecast from './components/disaster-situation-forecast.vue';
import DisasterWarningSeverityPie from './components/disaster-warning-severity-pie.vue';
import DisasterWarningTypeComparison from './components/disaster-warning-type-comparison.vue';
import StandardProtection from './components/standard-protection.vue';
import GrowthDiagnosis from './components/GrowthDiagnosis.vue';
import {
  useDisasterInsights,
  HAZARD_META,
  SEVERITY_META,
  REGION_NAME_MAP,
  INDEX_NAME_TO_HAZARD,
  evaluateIndexLevel,
  labelToSeverity,
  normalizeAreaKey,
  ALLOWED_BASE_CODES
} from './hooks/useDisasterInsights';
import type { HazardKey, SeverityKey } from './hooks/useDisasterInsights';
import type { IndexVO } from '@/api/disaster/index/types';
import useUserStore from '@/store/modules/user';

type DisasterKey = 'drought' | 'flood' | 'hail';
type LevelDef = { value: number; label: string };
type PlanItem = { measures: string[]; tips?: string };
type PlanDict = Record<DisasterKey, Record<number, PlanItem>>;
type IndexTimelineEntry = {
  baseCode: string;
  baseName: string;
  indexName: string;
  indexValue: number | string;
  indexUnit: string;
  label: string;
  severity: SeverityKey;
  timestamp: number;
  raw: IndexVO;
};

const growthDiagnosisRef = ref<any>(null);
const selectedHazard = ref<'all' | HazardKey>('all');
const baseCodeList = ALLOWED_BASE_CODES.slice(0, 9);
const selectedBase = ref<string>(baseCodeList[0] || '');
const userStore = useUserStore();
const isAdminUser = computed(() => (userStore.name || userStore.nickname) === 'admin');
const effectiveSelectedBase = computed(() => (isAdminUser.value ? selectedBase.value : ''));
const baseOptions = computed(() =>
  baseCodeList.map((code) => ({
    value: code,
    label: REGION_NAME_MAP[code] || code
  }))
);
const { loadAll, loading, severityDistribution, typeDistribution, warnings, indexes } = useDisasterInsights();

onMounted(() => {
  loadAll();
  growthDiagnosisRef.value?.getDicts?.();
});

const hazardOptions = computed(() => [
  { key: 'all', label: '全部' },
  ...(['0', '1', '2'] as HazardKey[]).map((key) => ({
    key,
    label: HAZARD_META[key].label
  }))
]);

const DROUGHT_SEVERITY_LABELS: Partial<Record<SeverityKey, string>> = {
  extreme: '特旱',
  severe: '重旱',
  medium: '中旱',
  minor: '一般',
  safe: '正常'
};
const FLOOD_SEVERITY_LABELS: Partial<Record<SeverityKey, string>> = {
  extreme: '特别重大洪涝',
  severe: '重大洪涝',
  medium: '较大洪涝',
  minor: '一般洪涝',
  safe: '正常'
};
const HAIL_SEVERITY_LABELS: Partial<Record<SeverityKey, string>> = {
  extreme: '特重冰雹',
  severe: '重度冰雹',
  medium: '中度冰雹',
  minor: '轻度冰雹',
  safe: '正常'
};
const HAZARD_SEVERITY_LEGENDS: Record<'0' | '1' | '2', Partial<Record<SeverityKey, string>>> = {
  '0': DROUGHT_SEVERITY_LABELS,
  '1': FLOOD_SEVERITY_LABELS,
  '2': HAIL_SEVERITY_LABELS
};

const severityChartData = computed(() => {
  const data = severityDistribution.value;
  if (selectedHazard.value === 'all') return data.all;
  if (selectedHazard.value === '0') return data.drought;
  if (selectedHazard.value === '1') return data.flood;
  return data.hail;
});

const severityLegendMapping = computed(() => (selectedHazard.value === 'all' ? undefined : HAZARD_SEVERITY_LEGENDS[selectedHazard.value]));

const typeBarData = computed(() => typeDistribution.value.list);

const hazardLabel = computed(() => (selectedHazard.value === 'all' ? '全部灾害' : HAZARD_META[selectedHazard.value].label));

const formatDateOnly = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
};

const DISTRIBUTION_START_DATE = new Date(2023, 0, 1).getTime();
const distributionTimeInfo = computed(() => `${formatDateOnly(DISTRIBUTION_START_DATE)} - ${formatDateOnly(Date.now())}`);

const TYPE_COMPARISON_START_DATE = new Date(2024, 0, 1).getTime();
const typeComparisonTimeInfo = computed(() => `${formatDateOnly(TYPE_COMPARISON_START_DATE)} - ${formatDateOnly(Date.now())}`);

const selectedDisasterForPlan = computed<'0' | '1' | '2'>(() => (selectedHazard.value === 'all' ? '0' : selectedHazard.value));

const normalizeHazardForWarning = (val: any): HazardKey => {
  const key = String(val ?? '').trim();
  if (key === '1') return '1';
  if (key === '2') return '2';
  if (key === '0') return '0';
  if (/洪|涝|flood/i.test(key)) return '1';
  if (/雹|冰|hail/i.test(key)) return '2';
  if (/旱|干|drought/i.test(key)) return '0';
  return '0';
};

const parseWarningTimestamp = (warn: any): number => {
  const candidate = warn?.issueTime ?? warn?.updateTime ?? warn?.validUntil;
  if (candidate == null) return 0;
  if (typeof candidate === 'number') return candidate > 1e12 ? candidate : candidate * 1000;
  const str = String(candidate).trim();
  if (!str) return 0;
  if (/^\d{10,13}$/.test(str)) {
    const num = Number(str);
    return num > 1e12 ? num : num * 1000;
  }
  const normalized = str.replace('T', ' ').replace(/-/g, '/');
  const ts = new Date(normalized).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

const disasterKey = computed<DisasterKey>(() => {
  if (selectedDisasterForPlan.value === '0') return 'drought';
  if (selectedDisasterForPlan.value === '1') return 'flood';
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

type HazardSeverityEntry = { level: number; label: string; value: number };

const HAZARD_LEVEL_DEFS: Record<HazardKey, LevelDef[]> = {
  '0': LEVELS_BY_KEY.drought,
  '1': LEVELS_BY_KEY.flood,
  '2': LEVELS_BY_KEY.hail
};

const buildLevelRegex = (label: string) => new RegExp(label.replace(/\s+/g, ''), 'i');

const HAZARD_LEVEL_MATCHERS: Record<HazardKey, Array<{ regex: RegExp; label: string; generalLevel: number; value: number }>> = {
  '0': LEVELS_BY_KEY.drought
    .map((def, index) => ({ regex: buildLevelRegex(def.label), label: def.label, generalLevel: index + 1, value: def.value }))
    .sort((a, b) => b.generalLevel - a.generalLevel),
  '1': LEVELS_BY_KEY.flood
    .map((def, index) => ({ regex: buildLevelRegex(def.label), label: def.label, generalLevel: index + 1, value: def.value }))
    .sort((a, b) => b.generalLevel - a.generalLevel),
  '2': LEVELS_BY_KEY.hail
    .map((def, index) => ({ regex: buildLevelRegex(def.label), label: def.label, generalLevel: index + 1, value: def.value }))
    .sort((a, b) => b.generalLevel - a.generalLevel)
};

const generalLevelFromText = (text: string) => {
  if (!text) return 0;
  const lowered = text.toLowerCase();
  if (/四级|肆级|ⅳ|特大|特重|特别重大|红色|红警|极严重|critical|extreme/.test(lowered)) return 4;
  if (/三级|叁级|ⅲ|重大|橙色|橙警|严重|orange|heavy/.test(lowered)) return 3;
  if (/二级|贰级|ⅱ|较大|黄色|黄警|moderate|yellow|中度/.test(lowered)) return 2;
  if (/一级|壹级|ⅰ|一般|蓝色|蓝警|light|blue|轻度/.test(lowered)) return 1;
  const digitMatch = lowered.match(/([1-4])/);
  if (digitMatch) return Number(digitMatch[1]);
  const numeric = Number(text);
  if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= 4) return numeric;
  return 0;
};

const resolveWarningSeverity = (hazard: HazardKey, level: any, content?: any): HazardSeverityEntry => {
  const defs = HAZARD_LEVEL_DEFS[hazard];
  const numericLevel = Number(level);
  if (!Number.isNaN(numericLevel)) {
    if (numericLevel === 99) return { level: 0, label: '正常', value: 0 };
    const matched = defs.findIndex((def) => def.value === numericLevel);
    if (matched >= 0) {
      const def = defs[matched];
      return { level: matched + 1, label: def.label, value: def.value };
    }
    return { level: 0, label: '正常', value: 0 };
  }
  const raw = `${level ?? ''} ${content ?? ''}`.trim();
  if (!raw) return { level: 0, label: '', value: 0 };
  const normalized = raw.replace(/\s+/g, '');
  const lowered = normalized.toLowerCase();
  const matchers = HAZARD_LEVEL_MATCHERS[hazard] || [];
  for (const matcher of matchers) {
    if (matcher.regex.test(normalized)) {
      return { level: matcher.generalLevel, label: matcher.label, value: matcher.value };
    }
  }
  const general = generalLevelFromText(lowered);
  if (general > 0) {
    const defs = HAZARD_LEVEL_DEFS[hazard];
    const idx = Math.min(general - 1, defs.length - 1);
    const def = defs[idx];
    return { level: general, label: def?.label ?? '', value: def?.value ?? general };
  }
  return { level: 0, label: '', value: 0 };
};

const hazardSeverityInfo = computed(() => {
  const info: Record<'0' | '1' | '2' | 'all', HazardSeverityEntry> = {
    '0': { level: 0, label: '', value: 0 },
    '1': { level: 0, label: '', value: 0 },
    '2': { level: 0, label: '', value: 0 },
    all: { level: 0, label: '', value: 0 }
  };
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const startMs = todayStart.getTime();
  const updateEntry = (key: '0' | '1' | '2' | 'all', severity: HazardSeverityEntry) => {
    const entry = info[key];
    if (severity.level > entry.level || (severity.level === entry.level && severity.value > entry.value)) {
      info[key] = { ...severity };
    }
  };
  warnings.value.forEach((warn) => {
    const ts = parseWarningTimestamp(warn);
    if (!ts || ts < startMs) return;
    const hazard = normalizeHazardForWarning((warn as any)?.disasterType);
    const severity = resolveWarningSeverity(hazard, (warn as any)?.warningLevel, (warn as any)?.warningContent);
    if (severity.level <= 0) return;
    updateEntry(hazard, severity);
    updateEntry('all', severity);
  });
  return info;
});

const severityInfoKey = computed<'all' | HazardKey>(() => (selectedHazard.value === 'all' ? 'all' : selectedHazard.value));

const currentWarningLevel = computed(() => hazardSeverityInfo.value[severityInfoKey.value]?.level ?? 0);

const currentHazardLevelLabel = computed(() => hazardSeverityInfo.value[severityInfoKey.value]?.label ?? '');

const todayWarningCount = computed(() => {
  const hazardFilter = selectedHazard.value === 'all' ? undefined : selectedHazard.value;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const startMs = todayStart.getTime();
  const endMs = startMs + 24 * 60 * 60 * 1000;
  return (warnings.value || []).filter((warn) => {
    const hazard = normalizeHazardForWarning((warn as any)?.disasterType);
    if (hazardFilter && hazard !== hazardFilter) return false;
    const timestamp = parseWarningTimestamp(warn);
    return timestamp >= startMs && timestamp < endMs;
  }).length;
});

const STATIC_PLANS: PlanDict = {
  drought: {
    4: {
      measures: [
        '深松保墒、镇压封闭行间，保持垄沟排蓄结合',
        '覆盖地膜/秸秆，早晚小水滴灌或喷灌，避免中午大水',
        '苗期控旺密植田适当间苗，减少耗水',
        '叶面补喷抗旱保水剂或磷钾肥，减缓蒸腾'
      ]
    },
    5: {
      measures: [
        '分区轮灌，优先生育关键期田块，水肥一体滴灌',
        '中耕松土破除板结，减少蒸发',
        '株高旺长田块喷施缩节胺等控旺，防倒伏增抗旱',
        '叶面喷施腐殖酸/海藻酸类，提高抗逆与保水'
      ]
    },
    6: {
      measures: [
        '夜间滴灌或小流量喷灌，防热害脱水',
        '搭配遮阴网或防晒剂降低叶温，必要时间伐去老叶',
        '调整施肥，以磷钾为主，控制速效氮',
        '启动抗旱应急预案：应急水源调度、机井轮灌'
      ]
    },
    7: {
      measures: [
        '关键田块实施“保命水”，重旱地块提前收获或改茬',
        '联动水利/保险部门，启动抗旱补贴和理赔',
        '建立临时输水、蓄水设施并分级限水',
        '加强田间监测，及时上报灾情并防火防鼠'
      ]
    }
  },
  flood: {
    8: {
      measures: [
        '疏通三沟（田间沟、腰沟、围沟），浅沟排水防渍',
        '低洼处小泵抽排，避免根系长时间缺氧',
        '倒伏作物扶正培土，喷施磷酸二氢钾+芸苔素等促恢复',
        '雨后预防穗腐/纹枯等病害，喷施保护性杀菌剂'
      ]
    },
    9: {
      measures: [
        '加深沟系、设置导排口，持续抽排积水',
        '施用根系活化剂或生根剂，促进根系恢复',
        '缺苗断垄处补种/移栽，缩短减产窗口',
        '加强病虫害联防联控，防二次暴发'
      ]
    },
    10: {
      measures: [
        '启用连续抽排设备，必要时围堰或临时管道分流',
        '叶面+根际同步补肥（磷钾+螯合微量元素）提升抗逆',
        '受淹地块重施速效肥料，促进分蘖/次生根',
        '清理田间残枝秸秆，降低病源并防二次积水'
      ]
    },
    11: {
      measures: [
        '24小时不间断排涝，检查加固堤渠涵洞',
        '提前安排收获/烘干，防霉变；转移仓储物资',
        '严重受灾田块评估改种/补种并对接补贴、保险理赔',
        '雨停后立即杀菌杀虫并监测毒素，防止霉菌毒素超标'
      ]
    }
  },
  hail: {
    0: {
      measures: [
        '关注临近预报，备防雹网/可移动覆盖物',
        '行间预置支架，遇急可快速覆盖',
        '关键期加强值守，发布田间广播或短信预警',
        '叶面喷施硅钙或氨基酸叶肥，增强叶片韧性'
      ]
    },
    1: {
      measures: [
        '安装防雹网并加固固定点，行间设拉绳',
        '雹前快速覆盖，避免机械作业，保护幼穗/幼茎',
        '易倒伏地块设置临时支撑或扶直培土',
        '雹后12小时内喷施保护性杀菌剂，防细菌性软腐'
      ]
    },
    2: {
      measures: [
        '24小时内剪除破损叶和受伤穗部，带出田间',
        '伤口喷施铜制剂/多抗霉素类，抑制二次感染',
        '叶面补施磷钾+氨基酸，促进恢复并防灼伤',
        '伴随积水的地块同步排涝通风'
      ]
    },
    3: {
      measures: [
        '重灾区重剪重播或改种短生育期作物',
        '组织保险查勘并上报灾情，申请补贴',
        '清运病残体无害化处理，减少病虫源',
        '制定中长期防雹方案：固定防雹网、增设预警与联动值守'
      ]
    }
  }
};

const levelsForSelected = computed<LevelDef[]>(() => LEVELS_BY_KEY[disasterKey.value]);

const levelLabel = (val: any) => levelsForSelected.value.find((x) => x.value === Number(val))?.label ?? `等级 ${val}`;

const levelTagType = (val: any): 'success' | 'primary' | 'warning' | 'danger' | 'info' => {
  const v = Number(val);
  if ([0, 4, 8].includes(v)) return 'success';
  if ([1, 5, 9].includes(v)) return 'primary';
  if ([2, 6, 10].includes(v)) return 'warning';
  if ([3, 7, 11].includes(v)) return 'danger';
  return 'info';
};

const parseIndexTimestamp = (input: any): number => {
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
    if (effectiveSelectedBase.value && normalizeAreaKey((item as any)?.detectionArea) !== effectiveSelectedBase.value) return false;
    return true;
  })
);

const indexTimelineEntries = computed<IndexTimelineEntry[]>(() =>
  [...filteredIndexes.value]
    .sort((a, b) => parseIndexTimestamp((b as any)?.createTime) - parseIndexTimestamp((a as any)?.createTime))
    .slice(0, 7)
    .map((item) => {
      const baseCode = normalizeAreaKey((item as any)?.detectionArea);
      const baseName = REGION_NAME_MAP[baseCode] || '未知基地';
      const label = evaluateIndexLevel(item as IndexVO);
      const severity = labelToSeverity(label);
      return {
        baseCode,
        baseName,
        indexName: item.indexName,
        indexValue: item.indexValue,
        indexUnit: item.indexUnit,
        label,
        severity,
        timestamp: parseIndexTimestamp((item as any)?.createTime),
        raw: item as IndexVO
      };
    })
);

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
  <div class="disaster-dashboard">
    <div class="dashboard-header">
      <div class="control-card">
        <div class="control-row">
          <span class="label">关注灾害</span>
          <el-radio-group v-model="selectedHazard" size="small" class="hazard-radio">
            <el-radio-button v-for="item in hazardOptions" :key="item.key" :label="item.key">
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <el-card class="grid-item grid-span-2" :body-style="{ padding: '0 16px 16px 16px' }">
        <template #header>
          <div class="card-header">
            <span>灾情预警</span>
          </div>
        </template>
        <DisasterSituationForecast
          :hazard="selectedHazard"
          :hazard-label="hazardLabel"
          :loading="loading"
          :current-level="currentWarningLevel"
          :current-level-label="currentHazardLevelLabel"
          :today-count="todayWarningCount"
        />
      </el-card>

      <el-card class="grid-item grid-span-2" :body-style="{ padding: '0 16px 16px 16px' }">
        <template #header>
          <div class="card-header">
            <span>标准防护方案</span>
            <!-- <span class="sub-title">{{ hazardLabel }}</span> -->
          </div>
        </template>
        <StandardProtection
          :disaster-key="disasterKey"
          :levels="levelsForSelected"
          :plans="STATIC_PLANS"
          :level-tag-type="levelTagType"
          :level-label="levelLabel"
          :selected-disaster="selectedDisasterForPlan"
        />
      </el-card>

      <el-card class="grid-item" :body-style="{ padding: '0 16px 16px 16px' }">
        <template #header>
          <div class="card-header">
            <span>历史灾害类型对比</span>
            <span class="sub-title">统计时间：{{ typeComparisonTimeInfo }}</span>
          </div>
        </template>
        <DisasterWarningTypeComparison :loading="loading" :data="typeBarData" :height="280" />
      </el-card>

      <el-card class="grid-item" :body-style="{ padding: '12px' }">
        <template #header>
          <div class="card-header">
            <div class="title-wrapper">
              <span>最近指数记录</span>
              <span class="sub-title">最近7条</span>
            </div>
            <div v-if="isAdminUser" class="header-actions">
              <el-select v-model="selectedBase" size="small" class="base-select" placeholder="选择基地">
                <el-option v-for="item in baseOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </div>
        </template>
        <el-scrollbar class="timeline-scroll" height="320px">
          <el-timeline>
            <el-timeline-item
              v-for="entry in indexTimelineEntries"
              :key="entry.raw.id"
              :timestamp="formatTime(entry.timestamp)"
              :color="SEVERITY_META[entry.severity].color"
            >
              <div class="timeline-item">
                <div class="title">{{ entry.baseName }} · {{ entry.indexName }}</div>
                <div class="meta">
                  <span class="badge">{{ entry.label }}</span>
                  <span class="value">{{ entry.indexValue }} </span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-scrollbar>
      </el-card>

      <el-card class="grid-item" :body-style="{ padding: '0 16px 16px 16px' }">
        <template #header>
          <div class="card-header">
            <span>历史灾害等级占比</span>
            <span class="sub-title">统计时间：{{ distributionTimeInfo }}</span>
          </div>
        </template>
        <DisasterWarningSeverityPie :loading="loading" :data="severityChartData" :legend-mapping="severityLegendMapping" :height="280" />
      </el-card>

      <el-card class="grid-item" :body-style="{ padding: '12px' }">
        <template #header>
          <div class="card-header">
            <span>快捷入口</span>
          </div>
        </template>
        <QuickAccess />
      </el-card>
    </div>

    <GrowthDiagnosis ref="growthDiagnosisRef" />
  </div>
</template>

<style scoped lang="scss">
.disaster-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  background: #f5f7fb;
  height: calc(100vh - 84px);
  overflow: auto;
  font-size: 15px;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-card {
  width: 100%;
  max-width: none;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .label {
    font-size: 15px;
    color: #606266;
    font-weight: 500;
    min-width: 68px;
  }

  .hazard-radio {
    flex: 1 1 auto;
    display: flex;
    align-items: center;

    :deep(.el-radio-button__inner) {
      font-size: 15px;
      padding: 6px 16px;
    }
  }
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.grid-item {
  height: 360px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.07);
  border: none;
  overflow: hidden;
}

.grid-span-2 {
  grid-column: span 2;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.card-header .title-wrapper {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.card-header .header-actions {
  display: flex;
  align-items: center;
  gap: 8px;

  .base-select {
    min-width: 200px;
  }
}

.card-header .sub-title {
  font-size: 13px;
  color: #909399;
  font-weight: 400;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 0;
}

:deep(.quick-access-container) {
  height: 100%;
}

:deep(.standard-protection-container) {
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

:deep(.timeline-scroll) {
  min-height: 280px;

  .timeline-item {
    .title {
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }
    .meta {
      display: flex;
      gap: 12px;
      align-items: center;

      .badge {
        font-size: 12px;
        color: #606266;
      }
      .value {
        font-size: 13px;
        font-weight: 500;
        color: #303133;
      }
    }
  }
}

@media (max-width: 1400px) {
  .content-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .grid-span-2 {
    grid-column: span 2;
  }
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .grid-span-2 {
    grid-column: span 1;
  }
}
</style>
