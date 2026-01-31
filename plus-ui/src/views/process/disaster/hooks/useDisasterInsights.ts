import { computed, reactive } from 'vue';
import { listWarning } from '@/api/disaster/warning';
import { listIndex } from '@/api/disaster/index';
import { listProtection } from '@/api/disaster/protection';
import type { WarningVO } from '@/api/disaster/warning/types';
import type { IndexVO } from '@/api/disaster/index/types';
import type { ProtectionVO } from '@/api/disaster/protection/types';

type HazardKey = '0' | '1' | '2';
type SeverityKey = 'unknown' | 'safe' | 'minor' | 'medium' | 'severe' | 'extreme';

const HAZARD_ORDER: HazardKey[] = ['0', '1', '2'];
const SEVERITY_ORDER: SeverityKey[] = ['extreme', 'severe', 'medium', 'minor', 'safe', 'unknown'];
const TREND_DAYS = 14;
const RECENT_WARNING_DAYS = 7;
const PLAN_WINDOW_DAYS = 30;
const WARNING_TREND_FORECAST_OFFSET_DAYS = 5;
const BASE_RISK_WINDOW_DAYS = 5;

const SEVERITY_WEIGHTS: Record<SeverityKey, number> = {
  extreme: 4,
  severe: 3,
  medium: 2,
  minor: 1,
  safe: 0,
  unknown: 0
};

const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  '侯家沟数字化种植基地': '侯家沟',
  '姜兴庄智慧引领种植基地': '姜兴庄'
};

export const HAZARD_META: Record<HazardKey, { key: HazardKey; label: string; color: string }> = {
  '0': { key: '0', label: '旱灾', color: '#F88B4F' },
  '1': { key: '1', label: '洪涝', color: '#409EFF' },
  '2': { key: '2', label: '冰雹', color: '#8E6DEB' }
};

export const SEVERITY_META: Record<SeverityKey, { key: SeverityKey; label: string; color: string; value: number }> = {
  unknown: { key: 'unknown', label: '暂无数据', color: '#CFD3DC', value: -1 },
  safe: { key: 'safe', label: '正常', color: '#4CAF50', value: 0 },
  minor: { key: 'minor', label: '蓝色 / 1级', color: '#5B8FF9', value: 1 },
  medium: { key: 'medium', label: '黄色 / 2级', color: '#FFC440', value: 2 },
  severe: { key: 'severe', label: '橙色 / 3级', color: '#FF7F4A', value: 3 },
  extreme: { key: 'extreme', label: '红色 / 4级', color: '#F55266', value: 4 }
};

export const REGION_NAME_MAP: Record<string, string> = {
  '1': '姜兴庄智慧引领种植基地',
  '2': '侯家沟数字化种植基地',
  '3': '侯家沟南基地',
  '4': '李家寺基地',
  '5': '高家硷基地',
  '6': '冯渠基地',
  '7': '寺沟基地',
  '8': '岳家岔基地',
  '9': '杨家沟基地'
};

export const ALLOWED_BASE_CODES = Object.keys(REGION_NAME_MAP);

export const INDEX_NAME_TO_HAZARD: Record<string, HazardKey> = {
  S: '0',
  SWI: '1',
  NDWI: '1',
  R: '1',
  K: '2',
  TT: '2'
};

interface TrendSeriesItem {
  key: HazardKey;
  name: string;
  color: string;
  data: number[];
}

interface TimelinePoint {
  id: string | number;
  timestamp: number;
  hazard: HazardKey;
  hazardLabel: string;
  severity: SeverityKey;
  severityLabel: string;
  severityColor: string;
  region: string;
  regionLabel: string;
  content: string;
  validUntil?: string | number;
}

interface HeatmapCellMeta {
  baseCode: string;
  baseName: string;
  hazard: HazardKey;
  hazardLabel: string;
  severity: SeverityKey;
  severityLabel: string;
  severityColor: string;
  indexName?: string;
  indexValue?: number;
  indexUnit?: string;
  warningId?: string | number;
  warningLevel?: string;
  warningContent?: string;
  label: string;
  updatedAt: string;
}

interface HeatmapDataset {
  cells: Array<{ value: number; x: number; y: number; meta: HeatmapCellMeta }>;
  xLabels: string[];
  yLabels: string[];
}

interface TypeDistributionItem {
  key: HazardKey;
  label: string;
  color: string;
  total: number;
  severe: number;
  recent: number;
}

const sharedState = reactive({
  loading: false,
  loaded: false,
  warnings: [] as WarningVO[],
  indexes: [] as IndexVO[],
  protections: [] as ProtectionVO[],
  lastFetched: 0
});

const normalizeHazard = (val: any): HazardKey => {
  const key = String(val ?? '').trim();
  if (key === '1') return '1';
  if (key === '2') return '2';
  return '0';
};

const parseTimestamp = (input: any): number => {
  if (input == null || input === '') return 0;
  if (typeof input === 'number') return input > 1e12 ? input : input * 1000;
  const str = String(input).trim();
  if (!str) return 0;
  if (/^\d{10,13}$/.test(str)) {
    const num = Number(str);
    return num > 1e12 ? num : num * 1000;
  }
  let normalized = str.replace('T', ' ').replace(/\.\d+/, '');
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(normalized)) {
    normalized = normalized.replace(/-/g, '/');
  }
  const time = new Date(normalized).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const formatDate = (timestamp: number, pattern = 'YYYY-MM-DD HH:mm'): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const pad = (num: number) => (num < 10 ? `0${num}` : `${num}`);
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const MM = pad(date.getMinutes());
  const SS = pad(date.getSeconds());
  if (pattern === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
};

const sanitizeRegionText = (value: string) =>
  value
    .replace(/[()（）]/g, '')
    .replace(/基地/g, '')
    .replace(/\s+/g, '')
    .trim();

const getBaseDisplayName = (code: string): string => {
  const rawName = REGION_NAME_MAP[code] || code;
  const trimmed = String(rawName ?? '').trim();
  if (!trimmed) return String(code ?? '');
  if (DISPLAY_NAME_OVERRIDES[trimmed]) return DISPLAY_NAME_OVERRIDES[trimmed];
  return trimmed
    .replace(/\u57fa\u5730$/g, '')
    .replace(/\u667a\u6167\u5f15\u9886\u79cd\u690d/g, '')
    .replace(/\u6570\u5b57\u5316\u79cd\u690d/g, '')
    .replace(/\u667a\u6167\u519c\u4e1a/g, '')
    .trim();
};

export const HAZARD_SEVERITY_LABELS: Record<HazardKey, Partial<Record<SeverityKey, string>>> = {
  '0': {
    minor: '轻旱',
    medium: '中旱',
    severe: '重旱',
    extreme: '特旱',
    safe: '正常'
  },
  '1': {
    minor: '一般洪涝',
    medium: '较大洪涝',
    severe: '重大洪涝',
    extreme: '特别重大洪涝',
    safe: '正常'
  },
  '2': {
    minor: '轻度冰雹',
    medium: '中度冰雹',
    severe: '重度冰雹',
    extreme: '特重冰雹',
    safe: '正常'
  }
};

const getHazardSeverityLabel = (hazard: HazardKey, severity: SeverityKey, fallback: string): string => {
  if (severity === 'safe') return '正常';
  if (severity === 'unknown') return fallback || '暂无数据';
  const mapping = HAZARD_SEVERITY_LABELS[hazard];
  if (mapping && mapping[severity]) return mapping[severity]!;
  return fallback || SEVERITY_META[severity]?.label || '暂无数据';
};

const warningLevelToSeverity = (level: any, content?: any): SeverityKey => {
  const text = String(level ?? '').trim();
  const contentText = String(content ?? '').trim();
  const combined = `${text} ${contentText}`.toLowerCase();
  const normalized = combined.replace(/\s+/g, '');
  if (!text && /正常|解除|未达|无预警|平稳|无冰雹/.test(contentText)) return 'safe';
  if (/解除|取消|恢复正常|未达|无预警|无冰雹/.test(combined)) return 'safe';

  const digitMatch = normalized.match(/([1-4])级/);
  if (digitMatch) {
    const levelNum = Number(digitMatch[1]);
    if (levelNum === 4) return 'extreme';
    if (levelNum === 3) return 'severe';
    if (levelNum === 2) return 'medium';
    if (levelNum === 1) return 'minor';
  }

  if (/四级|肆级|ⅳ|Ⅳ/.test(normalized)) return 'extreme';
  if (/三级|叁级|ⅲ|Ⅲ/.test(normalized)) return 'severe';
  if (/二级|贰级|ⅱ|Ⅱ/.test(normalized)) return 'medium';
  if (/一级|壹级|ⅰ|Ⅰ/.test(normalized)) return 'minor';

  if (/红|特|极|critical|red|特大|重大/.test(combined)) return 'extreme';
  if (/橙|重|heavy|orange|严重|较重/.test(combined)) return 'severe';
  if (/黄|中|moderate|yellow|较大/.test(combined)) return 'medium';
  if (/蓝|轻|light|blue|一般|普通/.test(combined)) return 'minor';
  return 'minor';
};

export const labelToSeverity = (label: string): SeverityKey => {
  const text = String(label ?? '').trim();
  if (!text) return 'unknown';
  const lowered = text.toLowerCase();
  const normalized = lowered.replace(/\s+/g, '');
  if (/暂无|缺省|--/.test(lowered)) return 'unknown';
  if (/正常|良好|安全|平稳|未预警|无异常|无冰雹/.test(lowered)) return 'safe';

  const digitMatch = normalized.match(/([1-4])级/);
  if (digitMatch) {
    const levelNum = Number(digitMatch[1]);
    if (levelNum === 4) return 'extreme';
    if (levelNum === 3) return 'severe';
    if (levelNum === 2) return 'medium';
    if (levelNum === 1) return 'minor';
  }

  if (/四级|肆级|ⅳ|Ⅳ/.test(normalized)) return 'extreme';
  if (/三级|叁级|ⅲ|Ⅲ/.test(normalized)) return 'severe';
  if (/二级|贰级|ⅱ|Ⅱ/.test(normalized)) return 'medium';
  if (/一级|壹级|ⅰ|Ⅰ/.test(normalized)) return 'minor';

  if (/红|特|极/.test(lowered)) return 'extreme';
  if (/橙|重|较重|重大/.test(lowered)) return 'severe';
  if (/黄|中|较大/.test(lowered)) return 'medium';
  if (/蓝|轻|一般|普通/.test(lowered)) return 'minor';
  return 'unknown';
};

export const normalizeAreaKey = (area: any): string => {
  const raw = String(area ?? '').trim();
  if (!raw) return '';
  if (ALLOWED_BASE_CODES.includes(raw)) return raw;
  const numeric = String(Number(raw));
  if (ALLOWED_BASE_CODES.includes(numeric)) return numeric;
  const sanitized = sanitizeRegionText(raw);
  const matchedEntry = Object.entries(REGION_NAME_MAP).find(([, name]) => {
    const candidate = sanitizeRegionText(String(name ?? ''));
    if (!candidate) return false;
    return candidate === sanitized || candidate.includes(sanitized) || sanitized.includes(candidate);
  });
  return matchedEntry ? matchedEntry[0] : '';
};

const latestIndexValueForBase = (baseCode: string, indexName: string): { value: number | null; timestamp: number } => {
  const target = String(indexName || '').toUpperCase();
  let latestValue: number | null = null;
  let latestTs = -Infinity;
  sharedState.indexes.forEach((item) => {
    const itemName = String(item?.indexName || '').toUpperCase();
    if (itemName !== target) return;
    if (normalizeAreaKey(item?.detectionArea) !== baseCode) return;
    const ts = parseTimestamp((item as any)?.createTime) || parseTimestamp((item as any)?.updateTime) || parseTimestamp((item as any)?.timestamp);
    const val = Number(item?.indexValue);
    if (Number.isNaN(val)) return;
    if (ts >= latestTs) {
      latestTs = ts;
      latestValue = val;
    }
  });
  return { value: latestValue, timestamp: latestTs };
};

const classifyHailByComposite = (row: IndexVO): string | null => {
  const baseCode = normalizeAreaKey(row?.detectionArea);
  if (!baseCode) return null;
  const rowTs = parseTimestamp((row as any)?.createTime) || parseTimestamp((row as any)?.updateTime) || parseTimestamp((row as any)?.timestamp);

  let { value: kValue, timestamp: kTs } = latestIndexValueForBase(baseCode, 'K');
  let { value: ttValue, timestamp: ttTs } = latestIndexValueForBase(baseCode, 'TT');

  const currentVal = Number(row?.indexValue);
  if (!Number.isNaN(currentVal)) {
    const currentName = String(row?.indexName || '').toUpperCase();
    if (currentName === 'K' && rowTs >= kTs) {
      kValue = currentVal;
      kTs = rowTs;
    }
    if (currentName === 'TT' && rowTs >= ttTs) {
      ttValue = currentVal;
      ttTs = rowTs;
    }
  }

  if (kValue == null || ttValue == null) return null;

  if (kValue > 40 && ttValue > 55) return '特重冰雹';
  if (kValue > 35 && ttValue > 50) return '重度冰雹';
  if (kValue > 30 && ttValue > 45) return '中度冰雹';
  if (kValue > 25 && ttValue > 40) return '轻度冰雹';
  return '正常';
};

export const evaluateIndexLevel = (row: IndexVO): string => {
  const value = Number(row.indexValue);
  if (Number.isNaN(value)) return '数据异常';
  const name = String(row.indexName || '').toUpperCase();
  switch (name) {
    case 'K':
    case 'TT': {
      const composite = classifyHailByComposite(row);
      if (composite) return composite;
      if (value > 40) return '特重冰雹';
      if (value > 35) return '重度冰雹';
      if (value > 30) return '中度冰雹';
      if (value > 25) return '轻度冰雹';
      return '正常';
    }
    case 'S':
      if (value <= -2.2) return '特旱';
      if (value <= -1.4) return '重旱';
      if (value <= -1.0) return '中旱';
      if (value <= -0.2) return '轻旱';
      return '正常';
    case 'SWI':
      if (value > 0.85) return '特别重大洪涝';
      if (value > 0.75) return '重大洪涝';
      if (value > 0.65) return '较大洪涝';
      if (value > 0.55) return '一般洪涝';
      return '正常';
    case 'NDWI':
      if (value > 0.6) return '特别重大洪涝';
      if (value > 0.5) return '重大洪涝';
      if (value > 0.4) return '较大洪涝';
      if (value > 0.3) return '一般洪涝';
      return '正常';
    case 'R':
      if (value < 0.1) return '特别重大洪涝';
      if (value < 0.2) return '重大洪涝';
      if (value < 0.25) return '较大洪涝';
      if (value < 0.3) return '一般洪涝';
      return '正常';
    default:
      return '正常';
  }
};

const withDefault = <T>(value: T | undefined | null, fallback: T): T => (value == null ? fallback : value);

const generateDayBuckets = (days: number) => {
  const buckets: Array<{ key: string; label: string }> = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    date.setDate(date.getDate() - i);
    const key = formatDate(date.getTime(), 'YYYY-MM-DD');
    const label = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    buckets.push({ key, label });
  }
  return buckets;
};

export const useDisasterInsights = () => {
  const loadAll = async (force = false) => {
    if (sharedState.loading) return;
    if (sharedState.loaded && !force) return;
    sharedState.loading = true;
    try {
      const [warningRes, indexRes, protectionRes] = await Promise.all([
        listWarning({ pageNum: 1, pageSize: 1000 }),
        listIndex({ pageNum: 1, pageSize: 1000 }),
        listProtection({ pageNum: 1, pageSize: 1000 })
      ]);

      const warnings = Array.isArray((warningRes as any)?.rows)
        ? ((warningRes as any).rows as WarningVO[])
        : Array.isArray(warningRes as any)
          ? (warningRes as any as WarningVO[])
          : [];
      const indexes = Array.isArray((indexRes as any)?.rows)
        ? ((indexRes as any).rows as IndexVO[])
        : Array.isArray(indexRes as any)
          ? (indexRes as any as IndexVO[])
          : [];
      const protections = Array.isArray((protectionRes as any)?.rows)
        ? ((protectionRes as any).rows as ProtectionVO[])
        : Array.isArray(protectionRes as any)
          ? (protectionRes as any as ProtectionVO[])
          : [];

      sharedState.warnings = warnings;
      sharedState.indexes = indexes;
      sharedState.protections = protections;
      sharedState.loaded = true;
      sharedState.lastFetched = Date.now();
    } catch (error) {
      sharedState.warnings = [];
      sharedState.indexes = [];
      sharedState.protections = [];
      sharedState.loaded = false;
    } finally {
      sharedState.loading = false;
    }
  };

  const warnings = computed(() => sharedState.warnings);
  const protections = computed(() => sharedState.protections);
  const indexes = computed(() => sharedState.indexes);

  const hazardSummary = computed(() => {
    const total = warnings.value.length;
    const active = warnings.value.filter((w) => Number(w.status) === 1).length;
    const high = warnings.value.filter((w) => {
      const severity = warningLevelToSeverity(w.warningLevel, w.warningContent);
      return severity === 'severe' || severity === 'extreme';
    }).length;
    const now = Date.now();
    const recent = warnings.value.filter((w) => {
      const ts = parseTimestamp(w.issueTime);
      return ts >= now - 24 * 60 * 60 * 1000;
    }).length;
    return { total, active, high, new24h: recent };
  });

  const warningTrend = computed(() => {
    const pastBuckets = generateDayBuckets(TREND_DAYS).map((bucket) => ({
      ...bucket,
      displayKey: bucket.key,
      displayLabel: bucket.label,
      originalLabel: bucket.label
    }));

    const futureBuckets: Array<{
      key: string;
      label: string;
      displayKey: string;
      displayLabel: string;
      originalLabel: string;
    }> = [];

    if (WARNING_TREND_FORECAST_OFFSET_DAYS > 0) {
      const today = new Date();
      const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      for (let i = 1; i <= WARNING_TREND_FORECAST_OFFSET_DAYS; i += 1) {
        const futureDate = new Date(base);
        futureDate.setDate(futureDate.getDate() + i);
        const key = formatDate(futureDate.getTime(), 'YYYY-MM-DD');
        const label = `${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;
        futureBuckets.push({
          key,
          label,
          displayKey: key,
          displayLabel: label,
          originalLabel: label
        });
      }
    }

    const buckets = [...pastBuckets, ...futureBuckets];
    const map = new Map<string, Record<HazardKey, number>>();
    buckets.forEach((bucket) => {
      map.set(bucket.displayKey, { '0': 0, '1': 0, '2': 0 });
    });

    warnings.value.forEach((item) => {
      const hazard = normalizeHazard(item.disasterType);
      const ts = parseTimestamp(item.issueTime);
      if (!ts) return;
      const key = formatDate(ts, 'YYYY-MM-DD');
      const row = map.get(key);
      if (row) row[hazard] += 1;
    });

    const series: TrendSeriesItem[] = HAZARD_ORDER.map((key) => ({
      key,
      name: HAZARD_META[key].label,
      color: HAZARD_META[key].color,
      data: buckets.map((bucket) => withDefault(map.get(bucket.displayKey)?.[key], 0))
    }));
    const totalSeries: TrendSeriesItem = {
      key: '0',
      name: '总计',
      color: '#2F88FF',
      data: buckets.map((bucket, index) => series.reduce((sum, item) => sum + item.data[index], 0))
    };
    return { buckets, series, totalSeries };
  });

  const severityDistribution = computed(() => {
    const baseCounter: Record<string, Record<SeverityKey, number>> = {
      all: { unknown: 0, safe: 0, minor: 0, medium: 0, severe: 0, extreme: 0 },
      '0': { unknown: 0, safe: 0, minor: 0, medium: 0, severe: 0, extreme: 0 },
      '1': { unknown: 0, safe: 0, minor: 0, medium: 0, severe: 0, extreme: 0 },
      '2': { unknown: 0, safe: 0, minor: 0, medium: 0, severe: 0, extreme: 0 }
    };

    warnings.value.forEach((item) => {
      const hazard = normalizeHazard(item.disasterType);
      const severity = warningLevelToSeverity(item.warningLevel, item.warningContent);
      if (severity === 'safe') return;
      baseCounter.all[severity] += 1;
      baseCounter[hazard][severity] += 1;
    });

    const toArray = (counter: Record<SeverityKey, number>) =>
      SEVERITY_ORDER.filter((key) => key !== 'safe' && key !== 'unknown').map((key) => ({
        key,
        label: SEVERITY_META[key].label,
        color: SEVERITY_META[key].color,
        value: counter[key]
      }));

    return {
      all: toArray(baseCounter.all),
      drought: toArray(baseCounter['0']),
      flood: toArray(baseCounter['1']),
      hail: toArray(baseCounter['2'])
    };
  });

  const typeDistribution = computed(() => {
    const now = Date.now();
    const recentThreshold = now - RECENT_WARNING_DAYS * 24 * 60 * 60 * 1000;
    const stats: Record<HazardKey, { total: number; severe: number; recent: number }> = {
      '0': { total: 0, severe: 0, recent: 0 },
      '1': { total: 0, severe: 0, recent: 0 },
      '2': { total: 0, severe: 0, recent: 0 }
    };

    warnings.value.forEach((item) => {
      const hazard = normalizeHazard(item.disasterType);
      const severity = warningLevelToSeverity(item.warningLevel, item.warningContent);
      if (severity === 'safe') return;
      stats[hazard].total += 1;
      if (severity === 'severe' || severity === 'extreme') {
        stats[hazard].severe += 1;
      }
      const ts = parseTimestamp(item.issueTime);
      if (ts && ts >= recentThreshold) {
        stats[hazard].recent += 1;
      }
    });

    const list: TypeDistributionItem[] = HAZARD_ORDER.map((key) => ({
      key,
      label: HAZARD_META[key].label,
      color: HAZARD_META[key].color,
      total: stats[key].total,
      severe: stats[key].severe,
      recent: stats[key].recent
    }));
    return { list };
  });

  const warningTimeline = computed<TimelinePoint[]>(() => {
    return warnings.value
      .map((warn) => {
        const hazard = normalizeHazard(warn.disasterType);
        const severity = warningLevelToSeverity(warn.warningLevel, warn.warningContent);
        const severityMeta = SEVERITY_META[severity];
        const timestamp = parseTimestamp(warn.issueTime) || parseTimestamp((warn as any)?.updateTime) || parseTimestamp(warn.validUntil);
        const regionCode = normalizeAreaKey(warn.region);
        const regionLabel = regionCode ? REGION_NAME_MAP[regionCode] : warn.region || '未知区域';
        return {
          id: warn.id,
          timestamp,
          hazard,
          hazardLabel: HAZARD_META[hazard].label,
          severity,
          severityLabel: severityMeta.label,
          severityColor: severityMeta.color,
          region: regionCode || warn.region,
          regionLabel,
          content: warn.warningContent ?? '',
          validUntil: warn.validUntil
        };
      })
      .filter((item) => item.timestamp)
      .sort((a, b) => a.timestamp - b.timestamp);
  });

  const latestWarningByBaseAndHazard = computed(() => {
    const map = new Map<
      string,
      {
        warning: WarningVO;
        severity: SeverityKey;
        severityLabel: string;
        severityColor: string;
        label: string;
        weight: number;
        timestamp: number;
      }
    >();

    const threshold = Date.now() - BASE_RISK_WINDOW_DAYS * 24 * 60 * 60 * 1000;

    warnings.value.forEach((warn) => {
      if (Number((warn as any)?.status) !== 1) return;
      const baseCode = normalizeAreaKey((warn as any)?.region);
      if (!baseCode) return;
      if (!ALLOWED_BASE_CODES.includes(baseCode)) return;
      const hazard = normalizeHazard((warn as any)?.disasterType);
      const timestamp =
        parseTimestamp((warn as any)?.issueTime) || parseTimestamp((warn as any)?.createTime) || parseTimestamp((warn as any)?.updateTime);
      if (!timestamp) return;
      if (timestamp < threshold) return;

      const severity = warningLevelToSeverity((warn as any)?.warningLevel, (warn as any)?.warningContent);
      const severityMeta = SEVERITY_META[severity];
      const weight = SEVERITY_WEIGHTS[severity] ?? 0;
      const label = getHazardSeverityLabel(hazard, severity, severityMeta.label);
      const key = `${baseCode}-${hazard}`;
      const existing = map.get(key);

      if (!existing || weight > existing.weight || (weight === existing.weight && timestamp >= existing.timestamp)) {
        map.set(key, {
          warning: warn,
          severity,
          severityLabel: severityMeta.label,
          severityColor: severityMeta.color,
          label,
          weight,
          timestamp
        });
      }
    });

    return map;
  });

  const baseHeatmap = computed<HeatmapDataset>(() => {
    const cells: HeatmapDataset['cells'] = [];
    const xLabels = HAZARD_ORDER.map((key) => HAZARD_META[key].label);
    const baseCodes = ALLOWED_BASE_CODES;
    const yLabels = baseCodes.map((code) => getBaseDisplayName(code));
    const warningMap = latestWarningByBaseAndHazard.value;

    baseCodes.forEach((baseCode, rowIndex) => {
      HAZARD_ORDER.forEach((hazard, colIndex) => {
        const key = `${baseCode}-${hazard}`;
        const stored = warningMap.get(key);

        if (!stored) {
          const severityMeta = SEVERITY_META.safe;
          cells.push({
            x: colIndex,
            y: rowIndex,
            value: severityMeta.value,
            meta: {
              baseCode,
              baseName: getBaseDisplayName(baseCode),
              hazard,
              hazardLabel: HAZARD_META[hazard].label,
              severity: 'safe',
              severityLabel: severityMeta.label,
              severityColor: severityMeta.color,
              label: '正常',
              updatedAt: '',
              warningContent: ''
            }
          });
          return;
        }

        const { warning, severity, severityLabel, severityColor, label, timestamp } = stored;
        const severityMeta = SEVERITY_META[severity];
        const warningContentRaw = (warning as any)?.warningContent;
        const warningContent = warningContentRaw === undefined || warningContentRaw === null ? '' : String(warningContentRaw).trim();
        const warningLevelRaw = (warning as any)?.warningLevel;
        const warningLevel = warningLevelRaw === undefined || warningLevelRaw === null ? '' : String(warningLevelRaw).trim();
        const warningId = (warning as any)?.id ?? (warning as any)?.warningId ?? '';

        cells.push({
          x: colIndex,
          y: rowIndex,
          value: severityMeta.value,
          meta: {
            baseCode,
            baseName: getBaseDisplayName(baseCode),
            hazard,
            hazardLabel: HAZARD_META[hazard].label,
            severity,
            severityLabel,
            severityColor,
            label,
            updatedAt: timestamp ? formatDate(timestamp) : '',
            warningId,
            warningLevel,
            warningContent
          }
        });
      });
    });

    return { cells, xLabels, yLabels };
  });

  const planSummary = computed(() => {
    const now = Date.now();
    const recentThreshold = now - PLAN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    let recentWarnings = 0;
    const warningMatch: Record<HazardKey, number> = { '0': 0, '1': 0, '2': 0 };
    warnings.value.forEach((warn) => {
      const ts = parseTimestamp(warn.issueTime);
      if (ts && ts >= recentThreshold) {
        recentWarnings += 1;
        const hazard = normalizeHazard(warn.disasterType);
        warningMatch[hazard] += 1;
      }
    });

    const recentPlans = protections.value.filter((plan) => {
      const ts = parseTimestamp((plan as any)?.disasterTime);
      return ts && ts >= recentThreshold;
    });

    const planCounts: Record<HazardKey, number> = { '0': 0, '1': 0, '2': 0 };
    recentPlans.forEach((plan) => {
      const hazard = normalizeHazard((plan as any)?.disasterType);
      planCounts[hazard] += 1;
    });

    const coverage = recentWarnings === 0 ? 100 : Math.min(100, Math.round((recentPlans.length / recentWarnings) * 100));

    return {
      totalPlans: protections.value.length,
      recentPlans: recentPlans.length,
      recentWarnings,
      coverage,
      planCounts,
      warningCounts: warningMatch
    };
  });

  const baseRiskRanking = computed(() => {
    const sanitizeBaseName = (name: string) => {
      const trimmed = String(name ?? '').trim();
      if (!trimmed) return '未知区域';
      if (DISPLAY_NAME_OVERRIDES[trimmed]) return DISPLAY_NAME_OVERRIDES[trimmed];
      return trimmed
        .replace(/基地$/, '')
        .replace(/智慧引领种植/g, '')
        .replace(/数字化种植/g, '')
        .replace(/智慧农业/g, '')
        .trim();
    };

    const counter = new Map<
      string,
      {
        baseCode: string;
        baseName: string;
        displayName: string;
        score: number;
        severe: number;
        total: number;
        levelCounts: Record<'extreme' | 'severe' | 'medium' | 'minor', number>;
      }
    >();
    warnings.value.forEach((item) => {
      const severity = warningLevelToSeverity(item.warningLevel, item.warningContent);
      const weight = SEVERITY_WEIGHTS[severity] ?? 0;
      if (weight <= 0) return;
      const baseCode = normalizeAreaKey(item.region);
      if (!baseCode) return;
      const baseNameRaw = REGION_NAME_MAP[baseCode] || item.region || '未知区域';
      if (!counter.has(baseCode)) {
        counter.set(baseCode, {
          baseCode,
          baseName: baseNameRaw,
          displayName: sanitizeBaseName(baseNameRaw),
          score: 0,
          severe: 0,
          total: 0,
          levelCounts: { extreme: 0, severe: 0, medium: 0, minor: 0 }
        });
      }
      const entry = counter.get(baseCode)!;
      entry.total += 1;
      entry.score += weight;
      if (severity === 'severe' || severity === 'extreme') entry.severe += 1;
      if (severity === 'extreme' || severity === 'severe' || severity === 'medium' || severity === 'minor') {
        entry.levelCounts[severity as 'extreme' | 'severe' | 'medium' | 'minor'] += 1;
      }
    });
    return Array.from(counter.values()).sort((a, b) => b.score - a.score || b.severe - a.severe);
  });

  return {
    loading: computed(() => sharedState.loading),
    loaded: computed(() => sharedState.loaded),
    lastUpdated: computed(() => sharedState.lastFetched),
    warnings,
    protections,
    indexes,
    hazardSummary,
    warningTrend,
    severityDistribution,
    typeDistribution,
    warningTimeline,
    baseHeatmap,
    planSummary,
    baseRiskRanking,
    loadAll,
    refresh: () => loadAll(true)
  };
};

export type { TrendSeriesItem, HeatmapDataset, HeatmapCellMeta, TimelinePoint, TypeDistributionItem, HazardKey, SeverityKey };
