<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Aim } from '@element-plus/icons-vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { defaults as defaultControls } from 'ol/control';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import XYZ from 'ol/source/XYZ';
import { Style, Fill, Stroke, Text } from 'ol/style';
import type { FeatureLike } from 'ol/Feature';
import { unByKey } from 'ol/Observable';
import type { EventsKey } from 'ol/events';
import {
  useDisasterInsights,
  HAZARD_META,
  SEVERITY_META,
  ALLOWED_BASE_CODES,
  REGION_NAME_MAP,
  INDEX_NAME_TO_HAZARD,
  labelToSeverity,
  evaluateIndexLevel,
  normalizeAreaKey
} from '../hooks/useDisasterInsights';
import type { HazardKey, SeverityKey } from '../hooks/useDisasterInsights';
import type { IndexVO } from '@/api/disaster/index/types';

const hazardOrder: HazardKey[] = ['0', '1', '2'];
const severityRank: Record<SeverityKey, number> = {
  unknown: 0,
  safe: 1,
  minor: 2,
  medium: 3,
  severe: 4,
  extreme: 5
};
const severityTagType: Record<SeverityKey, 'info' | 'success' | 'primary' | 'warning' | 'danger'> = {
  unknown: 'info',
  safe: 'success',
  minor: 'primary',
  medium: 'primary',
  severe: 'warning',
  extreme: 'danger'
};

interface IndexSnapshot {
  hazard: HazardKey;
  indexName: string;
  value: number;
  unit?: string;
  label: string;
  severity: SeverityKey;
  timestamp: number;
}

interface HazardStatus {
  hazard: HazardKey;
  hazardLabel: string;
  index?: IndexSnapshot;
  combinedSeverity: SeverityKey;
  combinedLabel: string;
  combinedColor: string;
}

interface BaseVisualEntry {
  code: string;
  name: string;
  severity: SeverityKey;
  severityLabel: string;
  severityColor: string;
  hazards: HazardStatus[];
}

interface HoverCardPayload {
  base: BaseVisualEntry;
  hazards: HazardStatus[];
}

const { indexes, loadAll, refresh: refreshInsights, lastUpdated } = useDisasterInsights();

const FEATURE_NAME_CODE_OVERRIDES: Record<string, string> = {
  '高硷村': '5',
  '姜兴庄智慧引领种植基地': '1',
  '冯渠': '6',
  '岳岔': '8',
  '寺沟': '7',
  '李家寺': '4',
  '侯家沟数字化种植基地': '2',
  '杨家沟': '9',
  '侯家沟南': '2'
};

const selectedHazard = ref<'all' | HazardKey>('all');
const baseGeoJson = ref<any>(null);
const geoJsonLoading = ref(false);
const mapContainerRef = ref<HTMLDivElement | null>(null);
let plainMap: Map | null = null;
let tileLayer: TileLayer<XYZ> | null = null;
let baseVectorLayer: VectorLayer<VectorSource> | null = null;
let mapClickKey: EventsKey | null = null;
let pointerMoveKey: EventsKey | null = null;
const detailDrawerVisible = ref(false);
const activeBase = ref<BaseVisualEntry | null>(null);
const hoverCard = ref<HoverCardPayload | null>(null);
const hoverPixel = ref<[number, number] | null>(null);
const HOVER_CARD_WIDTH = 240;
const HOVER_CARD_HEIGHT = 160;
const INDEX_WINDOW_DAYS = 5;
const panelHeight = 820;

const fetchGeoJson = async () => {
  if (baseGeoJson.value || geoJsonLoading.value) return;
  geoJsonLoading.value = true;
  try {
    const response = await fetch('/map-json/mz-base.geojson');
    if (!response.ok) throw new Error('网络错误');
    baseGeoJson.value = await response.json();
  } catch (error) {
    console.error('[DisasterMap] 加载基地边界失败', error);
    ElMessage.error('加载基地边界失败，请稍后重试');
  } finally {
    geoJsonLoading.value = false;
  }
};

const parseTimestamp = (input: any): number => {
  if (!input && input !== 0) return 0;
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

const recentIndexRecords = computed(() => {
  const map = new Map<
    string,
    {
      severity: SeverityKey;
      label: string;
      index: IndexSnapshot;
    }
  >();
  const threshold = Date.now() - INDEX_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  indexes.value.forEach((row: IndexVO) => {
    const baseCode = normalizeAreaKey(row?.detectionArea);
    if (!baseCode) return;
    const indexName = String(row?.indexName || '').toUpperCase();
    const hazard = INDEX_NAME_TO_HAZARD[indexName] || ((row?.disasterType as HazardKey) ?? null);
    if (!hazard || !hazardOrder.includes(hazard)) return;
    const value = Number(row?.indexValue);
    if (Number.isNaN(value)) return;
    const timestamp = parseTimestamp((row as any)?.createTime || (row as any)?.updateTime || (row as any)?.timestamp);
    if (!timestamp || timestamp < threshold) return;

    const label = evaluateIndexLevel(row);
    const severity = labelToSeverity(label);
    const key = `${baseCode}-${hazard}`;
    const existing = map.get(key);
    if (!existing || timestamp >= existing.index.timestamp) {
      map.set(key, {
        severity,
        label,
        index: {
          hazard,
          indexName,
          value,
          unit: row.indexUnit,
          label,
          severity,
          timestamp
        }
      });
    }
  });

  return map;
});

const createBaseEntry = (code: string): BaseVisualEntry => ({
  code,
  name: REGION_NAME_MAP[code] || `基地 ${code}`,
  severity: 'unknown',
  severityLabel: SEVERITY_META.unknown.label,
  severityColor: SEVERITY_META.unknown.color,
  hazards: []
});

const createEmptyHazards = (): HazardStatus[] =>
  hazardOrder.map((hazard) => ({
    hazard,
    hazardLabel: HAZARD_META[hazard].label,
    index: undefined,
    combinedSeverity: 'safe',
    combinedLabel: SEVERITY_META.safe.label,
    combinedColor: SEVERITY_META.safe.color
  }));

const resolveBaseCodeFromFeature = (feature: FeatureLike | undefined): string => {
  if (!feature) return '';
  const rawName = feature.get?.('NAME') || feature.get?.('shortName');
  if (rawName && FEATURE_NAME_CODE_OVERRIDES[rawName]) return FEATURE_NAME_CODE_OVERRIDES[rawName];
  return normalizeAreaKey(rawName);
};

const createFallbackEntry = (feature: FeatureLike, baseCode?: string | null): BaseVisualEntry => {
  const name = feature?.get?.('NAME') || feature?.get?.('shortName') || `基地${feature?.getId?.() ?? ''}`;
  return {
    code: baseCode || String(feature?.getId?.() ?? name ?? ''),
    name,
    severity: 'unknown',
    severityLabel: SEVERITY_META.unknown.label,
    severityColor: SEVERITY_META.unknown.color,
    hazards: createEmptyHazards()
  };
};

const baseEntries = computed<Record<string, BaseVisualEntry>>(() => {
  const result: Record<string, BaseVisualEntry> = {};
  const recordMap = recentIndexRecords.value;
  ALLOWED_BASE_CODES.forEach((code) => {
    result[code] = createBaseEntry(code);
  });

  ALLOWED_BASE_CODES.forEach((code) => {
    const hazards: HazardStatus[] = hazardOrder.map((hazard) => {
      const record = recordMap.get(`${code}-${hazard}`);
      if (!record) {
        return {
          hazard,
          hazardLabel: HAZARD_META[hazard].label,
          index: undefined,
          combinedSeverity: 'safe',
          combinedLabel: SEVERITY_META.safe.label,
          combinedColor: SEVERITY_META.safe.color
        };
      }
      const severityMeta = SEVERITY_META[record.severity];
      return {
        hazard,
        hazardLabel: HAZARD_META[hazard].label,
        index: record.index,
        combinedSeverity: record.severity,
        combinedLabel: record.label,
        combinedColor: severityMeta.color
      };
    });

    const entry = result[code];
    entry.hazards = hazards;
    const worst = hazards.reduce<SeverityKey>((current, item) => {
      return severityRank[item.combinedSeverity] > severityRank[current] ? item.combinedSeverity : current;
    }, 'safe');
    entry.severity = worst;
    entry.severityLabel = SEVERITY_META[worst].label;
    entry.severityColor = SEVERITY_META[worst].color;
  });

  return result;
});

const baseList = computed<BaseVisualEntry[]>(() => {
  return Object.values(baseEntries.value).sort((a, b) => {
    const diff = severityRank[b.severity] - severityRank[a.severity];
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name, 'zh-CN');
  });
});

const summaryStats = computed(() => {
  const totals = {
    total: baseList.value.length,
    highRisk: baseList.value.filter((item) => severityRank[item.severity] >= severityRank.medium).length,
    normal: baseList.value.filter((item) => item.severity === 'safe').length
  };
  return totals;
});

const mapLoading = computed(() => geoJsonLoading.value && !baseGeoJson.value);

const hexToRgba = (hex: string, alpha = 0.3) => {
  const sanitized = hex.replace('#', '');
  const value =
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((c) => c + c)
          .join('')
      : sanitized;
  const num = parseInt(value, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getFeatureStatus = (feature: any) => {
  const entry = resolveEntryFromFeature(feature);
  if (!entry) {
    return {
      color: SEVERITY_META.unknown.color,
      label: '暂无数据'
    };
  }
  if (selectedHazard.value === 'all') {
    return {
      color: entry.severityColor,
      label: entry.severityLabel
    };
  }
  const hazardInfo = entry.hazards.find((item) => item.hazard === selectedHazard.value);
  if (!hazardInfo) {
    return {
      color: SEVERITY_META.unknown.color,
      label: '暂无数据'
    };
  }
  return {
    color: hazardInfo.combinedColor,
    label: hazardInfo.combinedLabel
  };
};

const createPolygonStyle = (feature: any) => {
  const status = getFeatureStatus(feature);
  const name = feature?.get?.('NAME') || feature?.get?.('shortName') || '';
  return new Style({
    stroke: new Stroke({
      color: '#ffffff',
      width: 1.2
    }),
    fill: new Fill({
      color: hexToRgba(status.color, 0.35)
    }),
    text: new Text({
      text: name,
      font: '600 14px "Microsoft YaHei", "PingFang SC", sans-serif',
      fill: new Fill({ color: '#1f2d3d' }),
      stroke: new Stroke({ color: '#ffffff', width: 3 })
    })
  });
};

const ensureMap = () => {
  if (plainMap || !mapContainerRef.value) return;

  tileLayer = new TileLayer({
    source: new XYZ({
      projection: 'EPSG:3857',
      url: 'https://api.jl1mall.com/getMap/{z}/{x}/{-y}?mk=73ad26c4aa6957eef051ecc5a15308b4&tk=7cda6357553bcfe9117eb962d391ca80',
      maxZoom: 18,
      minZoom: 0
    })
  });

  baseVectorLayer = new VectorLayer({
    source: new VectorSource(),
    style: (feature) => createPolygonStyle(feature)
  });

  plainMap = new Map({
    target: mapContainerRef.value,
    layers: [tileLayer, baseVectorLayer],
    view: new View({
      projection: 'EPSG:4326',
      center: [110.25, 37.85],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18
    }),
    controls: defaultControls({ attribution: false })
  });

  attachMapClickListener();
  attachPointerMoveListener();
};

const fitViewToBases = () => {
  if (!plainMap || !baseVectorLayer) return;
  const source = baseVectorLayer.getSource();
  if (!source || source.getFeatures().length === 0) return;
  const extent = source.getExtent();
  plainMap.getView().fit(extent, {
    padding: [30, 30, 30, 30],
    duration: 600,
    maxZoom: 16
  });
};

const renderBaseLayer = () => {
  if (!baseGeoJson.value) return;
  ensureMap();
  if (!baseVectorLayer) return;
  const source = baseVectorLayer.getSource();
  const features = new GeoJSON().readFeatures(baseGeoJson.value, {
    featureProjection: 'EPSG:4326'
  });
  source.clear();
  source.addFeatures(features);
  fitViewToBases();
  refreshVectorStyle();
  clearHoverInfo();
};

const refreshVectorStyle = () => {
  baseVectorLayer?.changed();
};

const resolveEntryFromFeature = (feature: FeatureLike | undefined): BaseVisualEntry | null => {
  if (!feature) return null;
  const baseCode = resolveBaseCodeFromFeature(feature);
  if (baseCode && baseEntries.value[baseCode]) {
    return baseEntries.value[baseCode];
  }
  return createFallbackEntry(feature, baseCode);
};

const handleMapClick = (feature: FeatureLike | undefined) => {
  const entry = resolveEntryFromFeature(feature);
  if (entry) openBaseDetail(entry);
};

const focusBaseByCode = (baseCode: string) => {
  if (!baseCode || !baseVectorLayer || !plainMap) return;
  const source = baseVectorLayer.getSource();
  if (!source) return;
  const feature = source.getFeatures().find((feat) => resolveBaseCodeFromFeature(feat as FeatureLike) === baseCode);
  if (feature) {
    const geometry = feature.getGeometry();
    if (geometry) {
      plainMap.getView().fit(geometry.getExtent(), { duration: 600, maxZoom: 16, padding: [40, 40, 40, 40] });
    }
  }
};

const attachMapClickListener = () => {
  if (!plainMap || mapClickKey) return;
  mapClickKey = plainMap.on('singleclick', (evt) => {
    const feature = plainMap?.forEachFeatureAtPixel(evt.pixel, (f) => f);
    handleMapClick(feature as FeatureLike | undefined);
  });
};

const attachPointerMoveListener = () => {
  if (!plainMap || pointerMoveKey) return;
  pointerMoveKey = plainMap.on('pointermove', (evt) => {
    if ((evt as any).dragging) return;
    const feature = plainMap?.forEachFeatureAtPixel(evt.pixel, (f) => f);
    const entry = resolveEntryFromFeature(feature as FeatureLike | undefined);
    if (!entry) {
      clearHoverInfo();
      return;
    }
    const hazards = pickHoverHazards(entry);
    hoverCard.value = { base: entry, hazards };
    hoverPixel.value = evt.pixel as [number, number];
  });
};

const pickHoverHazards = (entry: BaseVisualEntry) => {
  const list = entry.hazards.filter((item) => item.warning || item.index);
  return list.length > 0 ? list : entry.hazards.slice(0, 3);
};

const clearHoverInfo = () => {
  hoverCard.value = null;
  hoverPixel.value = null;
};

const detachMap = () => {
  if (mapClickKey) {
    unByKey(mapClickKey);
    mapClickKey = null;
  }
  if (pointerMoveKey) {
    unByKey(pointerMoveKey);
    pointerMoveKey = null;
  }
  plainMap?.setTarget(undefined);
  plainMap = null;
  baseVectorLayer = null;
  tileLayer = null;
  clearHoverInfo();
};

watch(selectedHazard, () => refreshVectorStyle());
watch(
  baseEntries,
  () => {
    refreshVectorStyle();
    clearHoverInfo();
  },
  { deep: true }
);

watch(
  () => baseGeoJson.value,
  () => {
    if (!baseGeoJson.value) return;
    nextTick(() => renderBaseLayer());
  }
);

watch(
  () => mapContainerRef.value,
  () => {
    if (!mapContainerRef.value || !baseGeoJson.value) return;
    nextTick(() => renderBaseLayer());
  }
);

onBeforeUnmount(() => {
  detachMap();
});

const hoverCardStyle = computed(() => {
  if (!hoverCard.value || !hoverPixel.value || !mapContainerRef.value) return { opacity: 0, pointerEvents: 'none' };
  const container = mapContainerRef.value;
  const width = container.clientWidth;
  const height = container.clientHeight;
  const [x, y] = hoverPixel.value;
  const left = Math.min(Math.max(0, x + 12), width - HOVER_CARD_WIDTH);
  const top = Math.min(Math.max(0, y - 12), height - HOVER_CARD_HEIGHT);
  return {
    opacity: 1,
    left: `${left}px`,
    top: `${top}px`
  };
});

const severityLegend = computed(() =>
  ['extreme', 'severe', 'medium', 'minor', 'safe'].map((key) => ({
    key,
    label: SEVERITY_META[key as SeverityKey].label,
    color: SEVERITY_META[key as SeverityKey].color
  }))
);

const formatIndexValue = (value?: number) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(2);
};

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('zh-CN', { hour12: false });
};

const openBaseDetail = (entry: BaseVisualEntry) => {
  activeBase.value = entry;
  detailDrawerVisible.value = true;
};

onMounted(async () => {
  fetchGeoJson();
  await loadAll();
});
</script>

<template>
  <div class="disaster-map-page">
    <div class="main-layout">
      <div class="left-column">
        <!-- <div class="summary-cards">
          <div class="summary-card">
            <div class="label">纳入监测基地</div>
            <div class="value">{{ summaryStats.total }}</div>
          </div>
          <div class="summary-card">
            <div class="label">关注基地区域</div>
            <div class="value text-warning">{{ summaryStats.highRisk }}</div>
          </div>
          <div class="summary-card">
            <div class="label">正常运行基地</div>
            <div class="value text-success">{{ summaryStats.normal }}</div>
          </div>
        </div> -->
        <div class="map-panel">
          <div class="map-wrapper" :style="{ height: panelHeight + 'px' }">
            <div v-if="mapLoading" class="map-loading">
              <el-skeleton animated :rows="10" />
            </div>
            <template v-else>
              <div v-if="baseGeoJson" class="map-inner">
                <div ref="mapContainerRef" class="map-canvas" />
                <div class="legend-box overlay">
                  <div class="legend-title">灾害等级</div>
                  <ul>
                    <li v-for="item in severityLegend" :key="item.key">
                      <span class="dot" :style="{ backgroundColor: item.color }"></span>
                      <span class="text">{{ item.label }}</span>
                    </li>
                  </ul>
                </div>
                <div v-if="hoverCard" class="hover-card" :style="hoverCardStyle">
                  <div class="hover-card__header">
                    <span class="name">{{ hoverCard.base.name }}</span>
                    <el-tag size="small" :type="severityTagType[hoverCard.base.severity]">{{ hoverCard.base.severityLabel }}</el-tag>
                  </div>
                  <div class="hover-card__body">
                    <div v-for="hazard in hoverCard.hazards" :key="hazard.hazard" class="hover-hazard-row">
                      <span class="hazard-label">{{ hazard.hazardLabel }}</span>
                      <span class="hazard-level" :style="{ color: hazard.combinedColor }">
                        {{ hazard.combinedLabel }}
                      </span>
                      <span class="hazard-index">
                        <template v-if="hazard.index">
                          {{ hazard.index.indexName }}：{{ formatIndexValue(hazard.index.value) }}{{ hazard.index.unit || '' }}
                        </template>
                        <template v-else>暂无指数</template>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="map-empty">
                <el-empty description="暂无边界数据" />
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="right-column">
        <!-- <div class="last-update-card">
          <div class="label">最近更新时间</div>
          <div class="value">{{ lastUpdated ? new Date(lastUpdated).toLocaleString('zh-CN', { hour12: false }) : '--' }}</div>
        </div> -->
        <div class="side-panel">
          <div class="panel-header">
            <div class="title">基地灾情列表</div>
            <div class="hint">点击地图或列表查看详情</div>
          </div>
          <el-scrollbar class="base-list">
            <div v-for="base in baseList" :key="base.code" class="base-item" @click="openBaseDetail(base)">
              <div class="base-item__head">
                <div class="name">
                  {{ base.name }}
                  <el-button text circle class="locate-btn" @click.stop="focusBaseByCode(base.code)" :title="`定位到${base.name}`">
                    <el-icon><Aim /></el-icon>
                  </el-button>
                </div>
                <el-tag size="small" :type="severityTagType[base.severity]">{{ base.severityLabel }}</el-tag>
              </div>
              <div class="hazard-badges">
                <span
                  v-for="hazard in base.hazards"
                  :key="hazard.hazard"
                  class="hazard-tag"
                  :style="{ borderColor: hazard.combinedColor, color: hazard.combinedColor }"
                >
                  {{ hazard.hazardLabel }} · {{ hazard.combinedLabel }}
                </span>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <el-drawer v-model="detailDrawerVisible" :title="activeBase?.name" size="420px" destroy-on-close direction="rtl">
      <div v-if="activeBase" class="drawer-body">
        <div v-for="hazard in activeBase.hazards" :key="hazard.hazard" class="hazard-card">
          <div class="hazard-card__header">
            <div class="title">
              <span class="dot" :style="{ backgroundColor: hazard.combinedColor }"></span>
              {{ hazard.hazardLabel }}
            </div>
            <el-tag size="small" :type="severityTagType[hazard.combinedSeverity]">{{ hazard.combinedLabel }}</el-tag>
          </div>
          <div class="hazard-card__content">
            <div class="info-row">
              <span class="label">指数等级</span>
              <span class="value">
                {{ hazard.combinedLabel }}
                <small v-if="hazard.index?.timestamp" class="time">{{ formatTimestamp(hazard.index.timestamp) }}</small>
              </span>
            </div>
            <div class="info-row">
              <span class="label">灾害指数</span>
              <span class="value">
                <template v-if="hazard.index">
                  {{ hazard.index.indexName }}
                  <strong>{{ formatIndexValue(hazard.index.value) }}</strong>
                  <span v-if="hazard.index.unit">{{ hazard.index.unit }}</span>
                </template>
                <template v-else>暂无指数</template>
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.disaster-map-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 12px 12px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;

  .summary-card {
    border-radius: 12px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f8fbff, #eef3ff);
    border: 1px solid rgba(64, 158, 255, 0.12);
    box-shadow: 0 8px 18px rgba(31, 45, 61, 0.08);

    .label {
      font-size: 13px;
      color: #606266;
      margin-bottom: 6px;
    }

    .value {
      font-size: 26px;
      font-weight: 600;
      color: #1f2d3d;

      &.text-warning {
        color: #f56c6c;
      }
      &.text-success {
        color: #67c23a;
      }
    }
  }
}

.main-layout {
  display: grid;
  grid-template-columns: minmax(0, 2.5fr) minmax(320px, 1fr);
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-self: stretch;
}

.last-update-card {
  border-radius: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fbff, #eef3ff);
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.07);
  border: 1px solid rgba(64, 158, 255, 0.12);
  display: flex;
  flex-direction: column;
  gap: 8px;

  .label {
    font-size: 13px;
    color: #909399;
  }

  .value {
    font-size: 18px;
    font-weight: 600;
    color: #1f2d3d;
  }
}

.map-panel {
  min-height: 820px;

  .map-wrapper {
    width: 100%;
    height: 100%;
    min-height: 820px;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(64, 158, 255, 0.18);
    box-shadow: 0 14px 32px rgba(31, 45, 61, 0.12);
    position: relative;
  }

  .map-loading {
    position: absolute;
    inset: 0;
    padding: 24px;
    background: rgba(255, 255, 255, 0.9);
    z-index: 5;
  }

  .map-empty {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
}

.map-inner {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-canvas {
  width: 100%;
  height: 100%;
  background: #f5f7fb;
}

.legend-box {
  min-width: 150px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 6px 16px rgba(15, 34, 58, 0.15);

  .legend-title {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 6px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
  }
}

.legend-box.overlay {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 5;
}

.hover-card {
  position: absolute;
  z-index: 6;
  width: 240px;
  background: rgba(8, 22, 48, 0.88);
  color: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 12px 28px rgba(8, 22, 48, 0.4);
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.hover-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  .name {
    font-weight: 600;
    font-size: 14px;
  }
}

.hover-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
}

.hover-hazard-row {
  display: grid;
  grid-template-columns: 70px auto;
  gap: 4px;
  line-height: 1.4;
}

.hover-hazard-row .hazard-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.hover-hazard-row .hazard-level {
  font-weight: 500;
}

.hover-hazard-row .hazard-index {
  grid-column: span 2;
  color: rgba(255, 255, 255, 0.7);
}

.side-panel {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(64, 158, 255, 0.12);
  box-shadow: 0 14px 32px rgba(31, 45, 61, 0.08);
  display: flex;
  flex-direction: column;
  padding: 16px;
  min-height: 820px;

  .panel-header {
    margin-bottom: 12px;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2d3d;
    }
    .hint {
      font-size: 12px;
      color: #909399;
    }
  }
}

.base-list {
  flex: 1;
  padding-right: 8px;
  height: 820px;

  .base-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .base-item {
    border: 1px solid rgba(64, 158, 255, 0.12);
    border-radius: 10px;
    padding: 8px;
    margin-bottom: 6px;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    min-height: 50px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(31, 45, 61, 0.15);
    }

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .name {
        font-weight: 600;
        color: #1f2d3d;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;

        .locate-btn {
          padding: 0;
          width: 28px;
          height: 28px;
          font-size: 16px;
          color: #409eff;
        }
      }
    }

    .hazard-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      .hazard-tag {
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 999px;
        border: 1px solid rgba(96, 125, 139, 0.4);
        background: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hazard-card {
  border: 1px solid rgba(64, 158, 255, 0.16);
  border-radius: 12px;
  padding: 12px;
  background: rgba(248, 251, 255, 0.8);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: #1f2d3d;

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #303133;

  .label {
    color: #909399;
  }

  .value {
    text-align: right;

    strong {
      margin: 0 4px;
    }

    .time {
      display: block;
      color: #a0a3ab;
      font-size: 11px;
    }
  }
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
  }
  .map-panel .map-wrapper {
    min-height: 420px;
  }
}
</style>
