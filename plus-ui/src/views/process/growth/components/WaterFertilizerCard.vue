<!-- WaterFertilizerCard.vue -->
<template>
  <el-dialog :model-value="visible" :title="plotLabel + '号分析结果'" width="1000px" @close="handleClose">
    <div class="water-fertilizer-card">
      <!-- 水肥监测结果模块 -->
      <div class="water-fertilizer-status">
        <h3 class="module-title">水肥亏缺诊断结果</h3>
        <div class="indicators-grid">
          <!-- 4列显示区域 -->
          <div class="four-column-grid">
            <div class="indicator-item">
              <span class="indicator-label">缺水等级：</span>
              <el-tag :type="getWaterDeficitType(waterDeficitLevel)" size="large" class="custom-tag highlight-tag">
                {{ waterDeficitLevel }}
              </el-tag>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">谷子持水特性：</span>
              <el-tag size="large" class="custom-tag">{{ milletWaterTrait }}</el-tag>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">田间持水量：</span>
              <el-tag size="large" class="custom-tag"> {{ 0.205 }} </el-tag>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">土壤墒情等级：</span>
              <el-tag :type="getSoilMoistureType(soilMoistureLevel)" size="large" class="custom-tag">
                {{ soilMoistureLevel }}
              </el-tag>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">缺肥等级：</span>
              <el-tag :type="getFertilizerDeficitType(fertilizerDeficitLevel)" size="large" class="custom-tag highlight-tag">
                {{ fertilizerDeficitLevel }}
              </el-tag>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">灌溉上限值：</span>
              <el-tag size="large" class="custom-tag"> {{ irrigationUpperLimit }} </el-tag>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">灌溉下限值：</span>
              <el-tag size="large" class="custom-tag"> {{ irrigationLowerLimit }} </el-tag>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">灌溉用水量：</span>
              <el-tag size="large" class="custom-tag"> {{ irrigationWaterAmount }} m³/亩 </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 水肥补给方案模块 -->
      <div class="harvest-suggestion">
        <h3 class="module-title">水肥补给方案</h3>
        <div class="suggestion-section">
          <div class="suggestion-text">
            <div class="suggestion-content">{{ computedWaterSuggestion }}</div>
          </div>
          <div class="suggestion-text">
            <div class="suggestion-content">{{ computedFertilizerSuggestion }}</div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { getWaterSuggestion, getFertilizerSuggestion } from '@/views/process/growth/utils/waterFertilizerSuggestion';

// 定义组件属性
interface WaterFertilizerCardProps {
  visible: boolean;
  base?: string;
  plotLabel?: string;
  fertilizerDeficitLevel: string;
  waterDeficitLevel: string;
  milletWaterTrait: string;
  fieldWaterInfo: number;
  soilMoistureLevel: string;
  irrigationUpperLimit: number;
  irrigationLowerLimit: number;
  irrigationWaterAmount: string;
  waterSuggestion?: string;
  fertilizerSuggestion?: string;
  growthPeriod?: string; // 添加生长时期属性
}

const props = withDefaults(defineProps<WaterFertilizerCardProps>(), {
  visible: false,
  base: '',
  plotLabel: '',
  waterSuggestion: '',
  fertilizerSuggestion: '',
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
const getWaterDeficitType = (level: string) => {
  if (level.includes('重度')) return 'danger';
  if (level.includes('中度')) return 'warning';
  return 'info';
};

const getFertilizerDeficitType = (level: string) => {
  if (level.includes('重度')) return 'danger';
  if (level.includes('中度')) return 'warning';
  return 'info';
};

const getSoilMoistureType = (level: string) => {
  if (level === '适宜') return 'success';
  if (level === '轻旱') return 'warning';
  return 'danger';
};

// 动态计算补水建议
const computedWaterSuggestion = computed(() => {
  // 将 irrigationWaterAmount 转换为数字
  const waterAmount = parseFloat(props.irrigationWaterAmount) || 0;
  return getWaterSuggestion(props.growthPeriod, props.waterDeficitLevel, waterAmount);
});

// 动态计算补肥建议
const computedFertilizerSuggestion = computed(() => {
  return getFertilizerSuggestion(props.growthPeriod, props.fertilizerDeficitLevel, props.fertilizerSuggestion);
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
