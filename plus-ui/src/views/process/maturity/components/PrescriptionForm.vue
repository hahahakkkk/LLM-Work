<template>
  <div ref="prescriptionRef" class="prescription-form">
    <div class="prescription-header">
      <h2>采收推荐处方单</h2>
    </div>

    <div class="prescription-table">
      <!-- 基础信息 -->
      <div class="prescription-cell">
        <h3 class="section-title">基础信息</h3>
        <div class="result-table">
          <div class="table-row">
            <div class="table-cell"><strong>基地名称：</strong>{{ base }}</div>
            <div class="table-cell"><strong>地块编号：</strong>{{ plotLabel }}</div>
            <div class="table-cell"><strong>生长时期：</strong>{{ growthPeriod }}</div>
          </div>
          <div class="table-row">
            <div class="table-cell"><strong>天气状况：</strong>晴天</div>
            <div class="table-cell"><strong>灾情状况：</strong>无</div>
            <div class="table-cell"><strong>地块面积：</strong>{{ plantingArea }}</div>
          </div>
        </div>
      </div>

      <!-- 成熟度检测结果 -->
      <div class="prescription-cell">
        <h3 class="section-title">成熟度检测结果</h3>
        <div class="result-table">
          <div class="table-row">
            <div class="table-cell"><strong>成熟度：</strong>{{ matureLevel }}</div>
          </div>
        </div>
      </div>

      <!-- 采收推荐方案 -->
      <div class="prescription-cell">
        <h3 class="section-title">采收推荐方案</h3>
        <div class="suggestion-section">
          <div class="suggestion-item">
            <SuggestionContent :content="computedharvestSuggestion" />
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚信息 -->
    <div class="prescription-footer">
      <div class="footer-info">
        <p>操作人：admin</p>
        <p>生成日期：{{ currentTime }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { getHarvestSuggestion } from '@/views/process/maturity/utils/harvestingRecommendations';
import SuggestionContent from '@/views/process/maturity/components/SuggestionContent.vue';

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

// 获取当前时间
const currentTime = computed(() => {
  return new Date().toLocaleString();
});

// 动态采收土建建议
const computedharvestSuggestion = computed(() => {
  // 将 irrigationharvestAmount 转换为数字
  return getHarvestSuggestion(props.matureLevel, props.weatherConditions, props.disasterSituation);
});

// 提供获取处方单元素的引用
const prescriptionRef = ref<HTMLElement | null>(null);

defineExpose({
  prescriptionRef
});
</script>

<style scoped>
.prescription-form {
  width: 794px; /* A4宽度 */
  padding: 0 !important; /* 去掉内边距，消除顶部空白 */
  margin: 0 !important; /* 取消外边距 */
  background-color: #fff;
  box-sizing: border-box;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  color: #000;
  font-size: 20px;
  position: relative;
  top: 0;
}

.prescription-header {
  text-align: center;
  margin-bottom: 20px;
}

.prescription-header h2 {
  margin: 0;
  font-size: 29px;
  color: #000;
  font-weight: bold;
}

.prescription-table {
  display: grid;
  grid-template-columns: 1fr;
  padding: 15px;
}

.prescription-cell {
  border: 1px solid #000;
  padding: 15px;
}

.prescription-cell .section-title {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 22px;
  color: #000;
  font-weight: 600;
  padding-bottom: 8px;
}

.result-table {
  width: 100%;
}

.table-row {
  display: flex;
  margin-bottom: 8px;
  gap: 8px;
}

.table-cell {
  flex: 1;
  padding: 8px 10px;
  font-size: 15px;
}

.table-cell strong {
  color: #000;
}

.suggestion-item {
  margin-bottom: 10px;
}

.suggestion-item p {
  margin: 5px 0;
  font-size: 15px;
  color: #000;
}

.suggestion-content {
  white-space: normal;
  line-height: 1.6;
}

.suggestion-content {
  text-indent: 2em;
  line-height: 1.6;
  padding: 8px 10px;
}

.prescription-footer {
  right: 50px;
  margin-top: 20px;
  text-align: right;
}

.footer-info {
  font-size: 15px;
}

.footer-info p {
  margin-right: 20px;
}
</style>
