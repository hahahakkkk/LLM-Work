<template>
  <div class="result-container">
    <!-- 返回按钮 -->
    <el-button type="primary" class="back-btn" @click="back"> <i class="el-icon-arrow-left"></i> 返回重新上传 </el-button>

    <!-- 结果展示 -->
    <template v-if="!loading">
      <div v-for="(result, index) in displayResults" :key="index" class="result-card">
        <div class="header-section">
          <h2 class="result-title">{{ result.base }}{{ selectedPlotLabel }}号分析结果</h2>
          <div class="indicator-row">
            <div class="indicator-item align-right">
              <span class="indicator-label">田间持水量：</span>
              <el-tag size="large" class="custom-tag">
                {{ result.fieldWaterInfo }}
              </el-tag>
            </div>
          </div>
          <div class="action-group">
            <el-button type="success" :loading="saving" class="save-btn" @click="saveToDatabase(result)">
              <i class="el-icon-upload"></i> 保存到数据库
            </el-button>
          </div>
        </div>
        <!-- 结论和建议 -->
        <div class="conclusion-section">
          <!-- 修改水肥监测结果模块 -->
          <div class="water-fertilizer-status">
            <h3 class="module-title">水亏缺诊断结果</h3>
            <div class="indicators-grid">
              <!-- 突出显示区域 -->
              <div class="highlight-section">
                <div class="indicator-item">
                  <span class="indicator-label">缺水等级：</span>
                  <el-tag :type="getWaterDeficitType(result.waterDeficitLevel)" size="large" class="custom-tag highlight-tag">
                    {{ result.waterDeficitLevel }}
                  </el-tag>
                </div>
              </div>

              <!-- 其他指标区域 -->
              <div class="other-indicators">
                <div class="indicator-row">
                  <div class="indicator-item">
                    <span class="indicator-label">灌溉上限值：</span>
                    <el-tag size="large" class="custom-tag">
                      {{ result.irrigationUpperLimit }}
                    </el-tag>
                  </div>
                  <div class="indicator-item">
                    <span class="indicator-label">灌溉下限值：</span>
                    <el-tag size="large" class="custom-tag">
                      {{ result.irrigationLowerLimit }}
                    </el-tag>
                  </div>
                </div>
                <div class="indicator-row">
                  <div class="indicator-item">
                    <span class="indicator-label">灌溉用水量：</span>
                    <el-tag size="large" class="custom-tag">
                      {{ result.irrigationWaterAmount }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 采收建议模块 -->
          <div class="harvest-suggestion">
            <h3 class="module-title">补水推荐方案</h3>
            <div class="suggestion-text">{{ getHarvestSuggestion(result) }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- 加载状态 -->
    <template v-else>
      <div class="skeleton-loading">
        <el-skeleton :rows="5" animated />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

let originalUrl = 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202506051702946.jpg';
let LAIUrl = 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202506051715784.jpg';
let SPADUrl = 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202506051715721.jpg';

// 更新 DisplayResult 接口
interface DisplayResult {
  originalUrl: string;
  processedUrl: string;
  allProcessedUrls: string[];
  ratio: number;
  status: string;
  fileName: string;
  modelId?: string;
  timestamp?: string;
  base?: string;
  // 新增长势模型返回的四个指标
  laiValue: number;
  spadValue: number;
  growthLevel: string; // 例如: "优", "良", "中", "差"
  waterDeficitLevel: string; // 例如: "轻度缺水", "中度缺水", "严重缺水"
  fertilizerDeficitLevel: string; // 例如: "轻度缺肥", "中度缺肥", "严重缺肥"
  fieldWaterInfo: number; // 田间持水信息
  soilMoistureLevel: string; // 土壤墒情等级
  milletWaterTrait: string; // 谷子持水特性
  irrigationUpperLimit: number; // 灌溉上限值
  irrigationLowerLimit: number; // 灌溉下限值
  irrigationWaterAmount: string; // 灌溉用水量
}

// 新增土壤墒情等级标签类型判断
const getSoilMoistureType = (level: string) => {
  if (level === '良好') return 'success';
  if (level === '一般') return 'warning';
  return 'danger'; // 差
};

// 新增计算属性：获取当前选中的地块标签
const selectedPlotLabel = computed(() => {
  const option = plotOptions.value.find((opt) => opt.value === selectedPlot.value);
  return option ? option.label : '';
});

// 新增标签类型判断方法
const getWaterDeficitType = (level: string) => {
  if (level.includes('严重')) return 'danger';
  if (level.includes('中度')) return 'warning';
  return 'info';
};

const getFertilizerDeficitType = (level: string) => {
  if (level.includes('严重')) return 'danger';
  if (level.includes('中度')) return 'warning';
  return 'info';
};

// 添加长势等级类型判断
const getGrowthLevelType = (level: string) => {
  if (level === '良好') return 'success';
  if (level === '正常') return 'info';
  return 'danger'; // 差
};

const props = defineProps<{
  results: Array<{
    resultData: {
      originalUrl: { url: string };
      processedUrls: Array<{ url: string }>;
      ratio: number;
      status: string;
    };
    modelId?: string;
    timestamp?: string;
    base?: string;
  }> | null;
}>();

const loading = ref(false);
const saving = ref(false);

// 地块选项
const plotOptions = ref([
  { value: 'plot1', label: '001' },
  { value: 'plot2', label: '002' },
  { value: 'plot3', label: '012' }
]);
const selectedPlot = ref(plotOptions.value[0].value);
// 处理结果显示数据
const displayResults = computed<DisplayResult[]>(() => {
  if (!props.results) return [];

  return props.results.map((item) => {
    const data = item.resultData;

    // 新增水肥监测模拟数据
    const waterFertilizerData = {
      fieldWaterInfo: parseFloat((Math.random() * 0.2).toFixed(4)), // 0~0.2随机值
      soilMoistureLevel: ['良好', '一般', '差'][Math.floor(Math.random() * 3)],
      milletWaterTrait: '抗旱持水',
      irrigationUpperLimit: 0.7,
      irrigationLowerLimit: 0.2,
      irrigationWaterAmount: `${Math.floor(Math.random() * 20) + 5} m³/亩`
    };

    // 生成模拟数据
    const mockData = {
      laiValue: parseFloat((Math.random() * 4 + 1).toFixed(2)), // 1.00 - 5.00
      spadValue: (Math.random() * 30 + 30).toFixed(1), // 生成30.0-60.0之间的随机数，保留一位小数
      waterDeficitLevel: '轻微',
      fertilizerDeficitLevel: '中度',
      growthLevel: ['良好', '正常', '较差'][Math.floor(Math.random() * 3)]
    };

    return {
      originalUrl: data.originalUrl.url,
      processedUrl: data.processedUrls[0]?.url || '',
      allProcessedUrls: data.processedUrls.map((p) => p.url),
      ratio: data.ratio,
      status: data.status,
      fileName: data.originalUrl.url.split('/').pop() || '未命名',
      modelId: item.modelId,
      timestamp: item.timestamp,
      base: item.base,
      // 添加模拟数据
      ...mockData,
      ...waterFertilizerData
    };
  });
});

// 成熟度判定
const isMature = (result: DisplayResult) => {
  return result.ratio >= 0.15; // 假设成熟度阈值是50%
};

// 采收建议
const getHarvestSuggestion = (result: DisplayResult) => {
  if (result.ratio >= 0.15)
    return '当前地块轻微缺水，尚处于可控状态，建议结合未来天气情况酌情考虑补水：若未来一周内有降雨天，则保持监测即可。若无降雨天气，适当引水穴灌，且需注意禁止在正午高温时段灌水，避免汽烫伤苗。';
  return '当前地块轻微缺水，尚处于可控状态，建议结合未来天气情况酌情考虑补水：若未来一周内有降雨天，则保持监测即可。若无降雨天气，适当引水穴灌，且需注意禁止在正午高温时段灌水，避免汽烫伤苗。';
};

// 保存到数据库
const saveToDatabase = async (result: DisplayResult) => {
  saving.value = true;
  try {
    // 构造保存数据
    const saveData = {
      base: result.base,
      plot: selectedPlot.value,
      originalImage: result.originalUrl,
      processedImage: result.processedUrl,
      maturityRatio: result.ratio,
      maturityStatus: isMature(result) ? 'mature' : 'immature',
      harvestSuggestion: getHarvestSuggestion(result),
      modelId: result.modelId,
      timestamp: new Date().toISOString()
    };

    // 这里替换为实际的API调用
    // await api.saveResult(saveData);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    ElMessage.success('结果已成功保存到数据库');
  } catch (error) {
    ElMessage.error('保存失败: ' + (error as Error).message);
  } finally {
    saving.value = false;
  }
};

const emits = defineEmits(['backto-upload']);
const back = () => emits('backto-upload');
const handlePlotChange = (val: string) => {
  console.log('选择的地块:', val);
};
</script>

<style scoped>
/* 基础容器样式 */
.result-container {
  padding: 10px;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 20px;
}

.result-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

/* 头部区域 */
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

.action-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.base-name,
.plot-label {
  font-size: 14px;
  color: #606266;
}

.plot-selector {
  width: 200px;
}

/* 图片对比区域 */
.image-comparison {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 改为三列等宽布局 */
  gap: 20px;
  margin-bottom: 20px;
}

.image-section {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.image-header {
  background: #f5f7fa;
  padding: 10px;
  font-size: 16px;
}

.combined-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.image-title {
  margin: 0;
}

.image-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  min-height: 200px;
}

.result-image {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.image-error {
  color: #909399;
  text-align: center;
}

.legend-item.mature .color-block {
  background: #f5d742; /* 成熟黄色 */
}

.legend-item.immature .color-block {
  background: #67c23a; /* 未成熟绿色 */
}

.maturity-status h3 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #409eff;
  font-weight: 500;
}

.harvest-suggestion {
  padding-left: 16px;
  border-left: 1px solid #ebeef5;
}

.indicator-group h3 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #409eff;
  font-weight: 500;
}

.suggestion-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-line; /* 保留换行符并自动换行 */
}

/* 加载状态 */
.skeleton-loading {
  padding: 20px;
  background: white;
  border-radius: 8px;
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

.indicator-value {
  font-weight: 500;
  color: #333;
}

/* 结论区域新布局 */
.conclusion-section {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

/* 模块通用样式 */
.growth-metrics,
.water-fertilizer-status,
.harvest-suggestion {
  background: #f8fafc;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  min-width: 0; /* 重要：允许内容收缩 */
}

.module-title {
  margin-top: 0;
  margin-bottom: 1px;
  font-size: 16px;
  color: #409eff;
  font-weight: 500;
  padding-bottom: 8px;
}

/* 指标组样式 */
.indicator-group {
  display: grid; /* 改为 flex 布局 */
  grid-template-columns: 1fr 1fr 1fr;
  gap: 60px; /* 保持间距 */
  width: 70%;
}

.indicators-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.indicator-row {
  display: flex;
  gap: 20px;
}

.indicator-item {
  display: flex;
  align-items: center;
}

.conclusion-section {
  display: flex; /* 改为 flex 布局 */
  flex-direction: column; /* 垂直排列 */
  gap: 16px; /* 保持间距 */
  width: 100%;
}

/* 调整模块宽度 */
.growth-metrics,
.water-fertilizer-status,
.harvest-suggestion {
  width: 100%;
}

.conclusion-section {
  display: flex; /* 使用 flex 布局 */
  gap: 16px; /* 保持间距 */
  width: 100%;
}

/* 调整模块宽度比例 */
.growth-metrics {
  flex: 1; /* 占据1份 */
  min-width: 250px; /* 最小宽度 */
}

.water-fertilizer-status {
  flex: 2; /* 占据2份，水肥监测结果需要更多空间 */
  min-width: 400px; /* 最小宽度 */
}

.harvest-suggestion {
  flex: 1.5; /* 占据1.5份 */
  min-width: 300px; /* 最小宽度 */
}

/* 调整水肥监测结果模块内部布局 */
.indicators-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 两列布局 */
  gap: 12px;
  width: 100%;
}

.indicator-row {
  display: contents; /* 使用网格布局代替行 */
}

.indicator-item {
  display: flex;
  align-items: center;
  background: rgba(245, 247, 250, 0.5);
  border-radius: 4px;
}
.custom-tag {
  font-size: 14px; /* 调整字体大小 */
  padding: 4px 8px; /* 调整内边距 */
  height: auto; /* 取消固定高度 */
  width: 80px;
}
/* 突出显示区域样式 */
.highlight-section {
  display: grid;
  grid-template-columns: 1fr;
  border-radius: 8px 0 0 8px;
  margin-right: 30px;
  gap: 12px;
}

/* 突出显示的标签 */
.highlight-tag {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 调整网格布局 */
.indicators-grid {
  display: grid;
  grid-template-columns: 1fr 3fr; /* 突出区域占1份，其他指标占3份 */
  gap: 12px;
}

/* 其他指标区域 */
.other-indicators {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* 突出区域占1份，其他指标占3份 */
  gap: 12px;
}

.align-right {
  margin-right: auto; /* 关键属性：将元素推到右侧 */
  margin-left: 100px;
  justify-content: flex-end; /* 确保内容右对齐 */
}
</style>
