<script setup lang="ts">
import { computed } from 'vue';
import type { HazardKey } from '../hooks/useDisasterInsights';

defineOptions({ name: 'DisasterSituationForecast' });

const props = withDefaults(
  defineProps<{
    hazard: 'all' | HazardKey;
    hazardLabel: string;
    loading?: boolean;
    currentLevel?: number | null;
    currentLevelLabel?: string | null;
    todayCount?: number | string;
  }>(),
  {
    loading: false,
    currentLevel: 0,
    currentLevelLabel: '',
    todayCount: 0
  }
);

const hazardName = computed(() => (props.hazard === 'all' ? '整体' : `${props.hazardLabel}`));

const normalizedLevel = computed(() => {
  const val = Number(props.currentLevel ?? 0);
  if (Number.isNaN(val)) return 0;
  return Math.max(0, Math.min(4, val));
});

const riskLevel = computed(() => {
  const level = normalizedLevel.value;
  if (level >= 4) return { label: '高风险', type: 'danger' as const };
  if (level === 2 || level === 3) return { label: '中风险', type: 'warning' as const };
  return { label: '低风险', type: 'success' as const };
});

const severityLabel = computed(() => props.currentLevelLabel?.trim() || riskLevel.value.label);

const todayCountNumber = computed(() => {
  const val = Number(props.todayCount ?? 0);
  return Number.isNaN(val) ? 0 : Math.max(0, val);
});

const hasWarnings = computed(() => todayCountNumber.value > 0);

const summaryText = computed(() => {
  if (!hasWarnings.value) {
    return `${hazardName.value}今日暂无新增预警，整体维持${severityLabel.value}水平。`;
  }
  return `${hazardName.value}今日新增预警${todayCountNumber.value}条，风险等级为${severityLabel.value}，请及时关注并执行防护方案。`;
});

const futureText = computed(() => {
  if (!hasWarnings.value) {
    return `预计未来7天维持低风险。`;
  }
  return `未来7天预测延续当前态势，重点关注新增预警对应区域，按照现行防护策略执行。`;
});
</script>

<template>
  <div class="situation-forecast">
    <div v-if="loading" class="skeleton">
      <el-skeleton animated :rows="8" />
    </div>
    <template v-else>
      <section class="section current">
        <div class="section-header">
          <div>
            <div class="title">当前灾情</div>
          </div>
          <el-tag :type="riskLevel.type" effect="dark" size="small">{{ severityLabel }}</el-tag>
        </div>

        <div class="stat-card" :class="{ 'is-empty': !hasWarnings }">
          <div class="stat-value">{{ todayCountNumber }}</div>
          <div class="stat-label">今日新增预警</div>
          <div class="stat-desc">{{ summaryText }}</div>
        </div>
      </section>

      <section class="section forecast">
        <div class="section-header">
          <div>
            <div class="title">未来趋势预测</div>
          </div>
        </div>

        <div class="stat-card mirror">
          <!-- <div class="stat-label">未来10天态势</div> -->
          <div class="stat-desc">{{ futureText }}</div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.situation-forecast {
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;

  .skeleton {
    flex: 1;
  }
}

.section {
  flex: 1;
  min-height: 0;
  border-radius: 12px;
  padding: 10px;
  background: #f7f9fc;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &.forecast {
    background: #fff8f2;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    font-weight: 600;
    color: #303133;
  }

  .subtitle {
    font-size: 12px;
    color: #909399;
  }
}

.stat-card {
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 4px 12px rgba(14, 35, 58, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.mirror {
    background: #fffdf8;
  }

  &.is-empty {
    background: #f5f7fb;
  }

  .stat-value {
    font-size: 34px;
    font-weight: 600;
    color: #303133;
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    color: #909399;
  }

  .stat-desc {
    font-size: 12px;
    color: #303133;
    line-height: 1.6;
  }
}

@media (max-width: 768px) {
  .situation-forecast {
    padding: 12px;
  }
}
</style>
