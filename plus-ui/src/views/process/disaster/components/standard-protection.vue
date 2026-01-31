<template>
  <div class="standard-protection-container">
    <div class="sp-head">
      <div class="sp-title-block">
        <div class="sp-title">
          <span class="sp-title-text">{{ disasterCn }}</span>
          <span class="sp-subtitle">标准防护方案覆盖各灾害等级</span>
          <span class="sp-control">
            <el-select v-model="localSelected" size="small" style="min-width: 120px">
              <el-option label="旱灾" value="0" />
              <el-option label="洪涝" value="1" />
              <el-option label="冰雹" value="2" />
            </el-select>
          </span>
        </div>
        <div class="sp-legend" v-if="legendLevels.length">
          <div v-for="lv in legendLevels" :key="lv.value" class="sp-legend-item">
            <el-tag :type="levelTagType(lv.value)" size="small">
              {{ labelFor(lv.value) }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    <!-- ✅ 只有这里滚动，底部分页不被裁切 -->
    <div class="standard-protection-content">
      <div v-if="currentLevelValue !== undefined" class="sp-panel">
        <div class="sp-row-title">
          <el-tag :type="levelTagType(currentLevelValue)" size="small" effect="dark">
            {{ labelFor(currentLevelValue) }}
          </el-tag>
          <span class="sp-row-title-text">{{ disasterCn }} - {{ labelFor(currentLevelValue) }}</span>
        </div>
        <div class="sp-row-body" v-if="currentPlan">
          <ul class="sp-measures">
            <li v-for="(m, idx) in currentPlan.measures" :key="idx">{{ m }}</li>
          </ul>
          <el-alert v-if="currentPlan.tips" :title="currentPlan.tips" type="info" :closable="false" class="sp-tips" show-icon />
        </div>
        <el-empty v-else description="暂无该等级的标准方案" :image-size="64" />
      </div>
      <el-empty v-else description="暂无可用等级数据" :image-size="80" />
    </div>
    <div class="sp-footer" v-if="levelValues.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="1"
        :total="levelValues.length"
        layout="prev, pager, next"
        small
        background
        :hide-on-single-page="true"
      />
      <div class="sp-page-hint">第 {{ currentPage }} / {{ levelValues.length }} 页</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, PropType } from 'vue';
type DisasterKey = 'drought' | 'flood' | 'hail';
type LevelDef = { value: number; label: string };
type PlanItem = { measures: string[]; tips?: string };
type PlanDict = Record<DisasterKey, Record<number, PlanItem>>;
const props = defineProps({
  disasterKey: { type: String as PropType<DisasterKey>, required: true },
  levels: { type: Array as PropType<LevelDef[]>, required: true },
  plans: { type: Object as PropType<PlanDict>, required: true },
  levelTagType: {
    type: Function as PropType<(v: any) => 'success' | 'primary' | 'warning' | 'danger' | 'info'>,
    required: true
  },
  levelLabel: { type: Function as PropType<(v: any) => string>, required: true },
  selectedDisaster: { type: String as PropType<'0' | '1' | '2'>, required: true }
});
const localSelected = ref<'0' | '1' | '2'>(props.selectedDisaster);
watch(
  () => props.selectedDisaster,
  (v) => {
    localSelected.value = v;
  }
);
const localKey = computed<DisasterKey>(() => {
  if (localSelected.value === '0') return 'drought';
  if (localSelected.value === '1') return 'flood';
  return 'hail';
});
const disasterCn = computed(() => ({ '0': '旱灾', '1': '洪涝', '2': '冰雹' })[localSelected.value]);
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
const legendLevels = computed<LevelDef[]>(() => LEVELS_BY_KEY[localKey.value]);
const levelValues = computed<number[]>(() => legendLevels.value.map((l) => l.value));
const labelFor = (val: any) => legendLevels.value.find((x) => x.value === Number(val))?.label ?? props.levelLabel(val);
const currentPage = ref(1);
watch(localSelected, () => {
  currentPage.value = 1;
});
const currentLevelValue = computed<number | undefined>(() => {
  if (!levelValues.value.length) return undefined;
  const idx = Math.min(Math.max(currentPage.value - 1, 0), levelValues.value.length - 1);
  return levelValues.value[idx];
});
const currentPlan = computed<PlanItem | undefined>(() => {
  const v = currentLevelValue.value;
  if (v === undefined) return undefined;
  return props.plans[localKey.value]?.[v];
});
</script>
<style scoped lang="scss">
.standard-protection-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  .sp-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 10px 12px 6px 12px;
    border-bottom: 1px dashed #ebeef5;
    gap: 12px;
    flex-wrap: wrap;

    .sp-title-block {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1 1 auto;
      min-width: 0;
    }

    .sp-control {
      flex: 0 0 auto;
      justify-content: flex-end;
    }

    .sp-title {
      display: flex;
      align-items: baseline;
      gap: 10px;
      .sp-title-text {
        font-weight: 600;
        font-size: 14px;
        color: #303133;
      }
      .sp-subtitle {
        font-size: 12px;
        color: #909399;
      }
    }
    .sp-legend {
      display: inline-flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
  /* ✅ 这里承担滚动，底部分页不会被裁切 */
  .standard-protection-content {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 10px 12px 12px 12px;
    .sp-panel {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sp-row-title {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      .sp-row-title-text {
        font-size: 13px;
        color: #606266;
      }
    }
    .sp-row-body {
      padding: 6px 2px 0 2px;
    }
    .sp-measures {
      margin: 0;
      padding-left: 18px;
      line-height: 1.7;
      li {
        margin: 4px 0;
        color: #303133;
      }
    }
    .sp-tips {
      margin-top: 10px;
    }
  }
  .sp-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px 10px 12px;
    border-top: 1px dashed #ebeef5;
    background: #fff; /* 防止在某些主题下被底色遮挡 */
    .sp-page-hint {
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
