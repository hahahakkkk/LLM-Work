<template>
  <BaseSoilFertilityMap
    :alert-data="normalizedAlerts"
    :base-stroke-color="baseStrokeColor"
    :level-labels="levelLabels"
    :click-labels="clickLabels"
    :debug-prefix="debugPrefix"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseSoilFertilityMap from '@/views/process/disaster/components/map.vue';
import { regionDict, WarningLevel } from '@/components/DisasterWarning/RegionProps';

// props 接收 index.vue 传来的数据库数据
const props = defineProps({
  alerts: { type: Array, default: () => [] },
  baseStrokeColor: { type: String, default: 'rgba(139,69,19,0.5)' },
  levelLabels: {
    type: Object,
    default: () => ({ minor: '轻度', medium: '中度', severe: '重度', extreme: '极度' })
  },
  clickLabels: {
    type: Object,
    default: () => ({ levelLabel: '级别', contentLabel: '详情' })
  },
  debugPrefix: { type: String, default: 'Disaster' }
});

/** 把数据库返回的 warningLevel 转成标准枚举 */
function normalizeLevel(rawLevel: any): number {
  if (rawLevel === null || rawLevel === undefined) return WarningLevel.DEFAULT;

  // 如果数据库里就是数字（0~4）
  if (typeof rawLevel === 'number') return rawLevel;

  // 字符串 → 数字
  const s = String(rawLevel).trim().toLowerCase();
  const dict: Record<string, number> = {
    low: WarningLevel.MINOR,
    minor: WarningLevel.MINOR,
    medium: WarningLevel.MEDIUM,
    mid: WarningLevel.MEDIUM,
    high: WarningLevel.SEVERE,
    severe: WarningLevel.SEVERE,
    extreme: WarningLevel.EXTREME
  };
  return dict[s] ?? WarningLevel.DEFAULT;
}

/** 基地名 → regionId */
function getRegionIdByBase(baseName?: string | null): string | null {
  if (!baseName) return null;
  const cleanInput = baseName.replace(/基地|数字化种植基地/g, '').trim();

  for (const [id, name] of Object.entries(regionDict)) {
    const cleanDict = name.replace(/基地/g, '').trim();
    if (baseName.includes(cleanDict) || cleanInput.includes(cleanDict) || cleanDict.includes(baseName)) {
      return String(id);
    }
  }
  return null;
}

/** 规范化数据，提供给地图使用 */
const normalizedAlerts = computed(() => {
  return (props.alerts as any[])
    .map((a) => {
      const regionId = a.region ?? getRegionIdByBase(a.base);
      const levelCode = normalizeLevel(a.warningLevel ?? a.level);
      return { ...a, region: regionId, warningLevel: levelCode };
    })
    .filter((a) => a.region != null && a.warningLevel !== undefined);
});
</script>
