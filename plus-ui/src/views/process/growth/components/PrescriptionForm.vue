<template>
  <div ref="prescriptionRef" class="prescription-form">
    <div class="prescription-header">
      <h2>水肥亏缺诊断处方单</h2>
    </div>

    <div class="prescription-table">
      <!-- 基础信息 -->
      <div class="prescription-cell">
        <h3 class="section-title">基础信息</h3>
        <div class="result-table">
          <div class="table-row">
            <div class="table-cell"><strong>基地名称：</strong>{{ base }}</div>
            <div class="table-cell"><strong>地块编号：</strong>{{ plotLabel }}</div>
            <!-- 修改点：使用字典转换后的生长时期名称 -->
            <div class="table-cell"><strong>生长时期：</strong>{{ periodLabel }}</div>
          </div>
          <div class="table-row">
            <div class="table-cell"><strong>田间持水量：</strong>20.5%</div>
            <div class="table-cell"><strong>灌溉上限值：</strong>{{ irrigationUpperLimit }}</div>
            <div class="table-cell"><strong>灌溉下限值：</strong>{{ irrigationLowerLimit }}</div>
            <div class="table-cell"><strong>土壤墒情等级：</strong>{{ soilMoistureLevel }}</div>
          </div>
        </div>
      </div>

      <!-- 长势诊断结果 -->
      <div class="prescription-cell">
        <h3 class="section-title">长势诊断结果</h3>
        <div class="result-table">
          <div class="table-row">
            <div class="table-cell"><strong>LAI：</strong>{{ lai }}</div>
            <div class="table-cell"><strong>SPAD：</strong>{{ spad }}</div>
            <div class="table-cell"><strong>长势等级：</strong>{{ growthLevel }}</div>
          </div>
        </div>
      </div>

      <!-- 水肥亏缺诊断结果 -->
      <div class="prescription-cell">
        <h3 class="section-title">水肥亏缺诊断结果</h3>
        <div class="result-table">
          <div class="table-row">
            <div class="table-cell"><strong>缺水等级：</strong>{{ waterDeficitLevel }}</div>
            <div class="table-cell"><strong>缺肥等级：</strong>{{ fertilizerDeficitLevel }}</div>
          </div>
        </div>
      </div>

      <!-- 水肥补给方案 -->
      <div class="prescription-cell">
        <h3 class="section-title">水肥补给方案</h3>
        <div class="suggestion-section">
          <div class="suggestion-item">
            <p><strong>补水建议：</strong></p>
            <!-- 修改点：传递转换后的生长时期给建议生成函数 -->
            <SuggestionContent :content="computedWaterSuggestion" />
          </div>
          <div class="suggestion-item">
            <p><strong>补肥建议：</strong></p>
            <SuggestionContent :content="computedFertilizerSuggestion" />
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚信息 -->
    <div class="prescription-footer">
      <div class="footer-info">
        <!-- 修改点：使用当前登录用户 -->
        <p>操作人：{{ currentUserName }}</p>
        <p>生成日期：{{ currentTime }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, getCurrentInstance, toRefs } from 'vue';
import { getWaterSuggestion, getFertilizerSuggestion } from '@/views/process/growth/utils/waterFertilizerSuggestion';
import SuggestionContent from '@/views/process/growth/components/SuggestionContent.vue';
import useUserStore from '@/store/modules/user'; // 引入用户 Store

// 获取当前实例和字典
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { growth_diagnose_period } = toRefs<any>(proxy?.useDict('growth_diagnose_period')); // 使用 growth_diagnose_period 字典

// 获取用户 Store
const userStore = useUserStore();

// 定义组件属性
interface PrescriptionFormProps {
  base?: string;
  plotLabel?: string;
  growthPeriod?: string;
  lai?: number;
  spad?: number;
  growthLevel?: string;
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
}

const props = withDefaults(defineProps<PrescriptionFormProps>(), {
  base: '',
  plotLabel: '',
  growthPeriod: '',
  lai: 0,
  spad: 0,
  growthLevel: '',
  waterSuggestion: '',
  fertilizerSuggestion: ''
});

// 新增：当前登录用户名称
const currentUserName = computed(() => {
  return userStore.nickname || userStore.name || 'admin';
});

// 新增：将生长时期编码转换为中文名称
const periodLabel = computed(() => {
  if (!props.growthPeriod) return '';
  const period = growth_diagnose_period.value?.find((d: any) => d.value === props.growthPeriod);
  return period ? period.label : props.growthPeriod;
});

// 获取当前时间
const currentTime = computed(() => {
  return new Date().toLocaleString();
});

// 动态计算补水建议（注意：建议生成函数内部可能也需要使用中文名称）
const computedWaterSuggestion = computed(() => {
  const waterAmount = parseFloat(props.irrigationWaterAmount) || 0;
  // 传递编码给建议生成函数，由函数内部决定如何使用
  return getWaterSuggestion(props.growthPeriod, props.waterDeficitLevel, waterAmount);
});

// 动态计算补肥建议
const computedFertilizerSuggestion = computed(() => {
  return getFertilizerSuggestion(props.growthPeriod, props.fertilizerDeficitLevel, props.fertilizerSuggestion);
});

// 提供获取处方单元素的引用
const prescriptionRef = ref<HTMLElement | null>(null);

defineExpose({
  prescriptionRef
});
</script>

<style scoped>
.prescription-form {
  width: 794px; /* A4宽度(210mm) at 96dpi */
  padding: 20px;
  background-color: #fff;
  box-sizing: border-box;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  color: #000;
  font-size: 20px;
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
