<!-- WaterFertilizerCard.vue -->
<template>
  <el-dialog :model-value="visible" :title="plotLabel + '号分析结果'" width="1000px" @close="handleClose">
    <div class="water-fertilizer-card">
      <!-- 水肥监测结果模块 -->
      <div class="water-fertilizer-status">
        <h3 class="module-title">成熟度诊断结果</h3>
        <div class="indicators-grid">
          <!-- 4列显示区域 -->
          <div class="four-column-grid">
            <!--            <div class="indicator-item">-->
            <!--              <span class="indicator-label">谷子品种：</span>-->
            <!--              <el-tag size="large" class="custom-tag highlight-tag">-->
            <!--                {{ variety }}-->
            <!--              </el-tag>-->
            <!--            </div>-->
            <!--            <div class="indicator-item">-->
            <!--              <span class="indicator-label">种植面积：</span>-->
            <!--              <el-tag size="large" class="custom-tag">{{ plantingArea }}亩</el-tag>-->
            <!--            </div>-->
            <div class="indicator-item">
              <span class="indicator-label">成熟度：</span>
              <el-tag :type="getMatureType(matureLevel)" size="large" class="custom-tag"> {{ matureLevel }} </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 采收推荐模块 -->
      <div class="harvest-suggestion">
        <h3 class="module-title">采收推荐方案</h3>
        <div class="suggestion-section">
          <div class="suggestion-text">
            <div class="suggestion-content">{{ computedharvestSuggestion }}</div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { getHarvestSuggestion } from '@/views/process/maturity/utils/harvestingRecommendations';

// 定义组件属性
interface RecommendCardProps {
  visible: boolean;
  base?: string;
  plotLabel?: string;
  matureLevel: string;
  variety: string;
  plantingArea: number;
  weatherConditions: string;
  disasterSituation: string;
  harvestingSuggestion?: string;
  growthPeriod?: string; // 添加生长时期属性
}

const props = withDefaults(defineProps<RecommendCardProps>(), {
  visible: false,
  base: '',
  plotLabel: '',
  harvestingSuggestion: '',
  growthPeriod: ''
});

// 定义事件
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false);
};

// 标签类型判断方法
const getMatureType = (level: string) => {
  if (level === '未成熟') return 'success';
  if (level === '成熟') return 'warning';
  return 'danger';
};

// 动态采收推荐建议
const computedharvestSuggestion = computed(() => {
  // 将 irrigationharvestAmount 转换为数字
  return getHarvestSuggestion(props.matureLevel, props.weatherConditions, props.disasterSituation);
});
</script>

<style scoped>
.water-fertilizer-card {
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-title {
  font-size: 18px;
  color: #333;
  margin: 0;
}

/* 水肥监测结果模块 */
.water-fertilizer-status {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.module-title {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  color: #409eff;
  font-weight: 500;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

/* 指标网格布局 */
.indicators-grid {
  display: flex;
  flex-direction: column;
}

.four-column-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.indicator-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-label {
  font-weight: bold;
  font-size: 14px;
  color: #606266;
  min-width: 100px;
  text-align: left;
}

.custom-tag {
  font-size: 14px;
  padding: 4px 8px;
  height: auto;
  width: auto;
  min-width: 80px;
}

.highlight-tag {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 采收建议模块 */
.harvest-suggestion {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.suggestion-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-line;
}

.suggestion-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.suggestion-content {
  text-indent: 2em;
}
</style>
