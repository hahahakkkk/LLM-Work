<template>
  <div class="result-container">
    <!-- 返回按钮 -->
    <el-button type="primary" class="back-btn" @click="back"> <i class="el-icon-arrow-left"></i> 返回重新上传 </el-button>

    <!-- 结果展示 -->
    <template v-if="!loading">
      <div v-for="(result, index) in displayResults" :key="index" class="result-card">
        <div class="header-section">
          <h2 class="result-title">{{ result.fileName }}</h2>
          <div class="action-group">
            <span class="base-name">{{ result.base }}：</span>
            <el-select v-model="selectedPlot" placeholder="选择地块" class="plot-selector" @change="handlePlotChange">
              <el-option v-for="plot in plotOptions" :key="plot.value" :label="plot.label" :value="plot.value" />
            </el-select>
            <el-button type="success" :loading="saving" class="save-btn" @click="saveToDatabase(result)">
              <i class="el-icon-upload"></i> 保存到数据库
            </el-button>
          </div>
        </div>
        <!-- 图片对比区 -->
        <div class="image-comparison">
          <!-- 原始影像 -->
          <div class="image-section">
            <div class="image-header">
              <h3 class="image-title">原始影像</h3>
            </div>
            <div class="image-wrapper">
              <el-image :src="result.originalUrl" :preview-src-list="[result.originalUrl]" fit="cover" class="result-image">
                <template #error>
                  <div class="image-error">
                    <i class="el-icon-picture-outline"></i>
                    <p>图片加载失败</p>
                  </div>
                </template>
              </el-image>
            </div>
          </div>

          <!-- 检测结果 -->
          <div class="image-section">
            <div class="image-header combined-header">
              <h3 class="image-title">检测结果</h3>
              <div class="legend">
                <span class="legend-item mature"> <span class="color-block"></span>成熟 </span>
                <span class="legend-item immature"> <span class="color-block"></span>未成熟 </span>
              </div>
            </div>
            <div class="image-wrapper">
              <el-image :src="result.processedUrl" :preview-src-list="result.allProcessedUrls" fit="cover" class="result-image">
                <template #error>
                  <div class="image-error">
                    <i class="el-icon-picture-outline"></i>
                    <p>分析结果加载失败</p>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </div>
        <!-- 结论和建议 -->
        <div class="conclusion-section">
          <div class="maturity-status">
            <h3 class="status-title">是否成熟：</h3>
            <el-tag :type="isMature(result) ? 'success' : 'warning'" size="large" class="maturity-tag">
              {{ isMature(result) ? '成熟' : '未成熟' }}
            </el-tag>
          </div>
          <div class="harvest-suggestion">
            <h3>采收建议：</h3>
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
import { SupplyRecForm } from '@/views/process/maturity/harvesting/api/types';
import { addSupplyRec } from '@/views/process/growth/api/supplyRec';

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
}

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
const selectedPlot = ref('');

// 地块选项
const plotOptions = ref([
  { value: '011', label: '011' },
  { value: '012', label: '012' },
  { value: '013', label: '013' },
  { value: '014', label: '014' },
  { value: '015', label: '015' },
  { value: '016', label: '016' },
  { value: '017', label: '017' },
  { value: '018', label: '018' },
  { value: '019', label: '019' }
]);

// 处理结果显示数据
const displayResults = computed<DisplayResult[]>(() => {
  if (!props.results) return [];

  return props.results.map((item) => {
    const data = item.resultData;
    return {
      originalUrl: data.originalUrl.url,
      processedUrl: data.processedUrls[0]?.url || '',
      allProcessedUrls: data.processedUrls.map((p) => p.url),
      ratio: data.ratio,
      status: data.status,
      fileName: data.originalUrl.url.split('/').pop() || '未命名',
      modelId: item.modelId,
      timestamp: item.timestamp,
      base: item.base
    };
  });
});

// 成熟度判定
const isMature = (result: DisplayResult) => {
  return result.ratio >= 0.15; // 假设成熟度阈值是50%
};

// 采收建议
// 采收建议（带随机天气条件）
const getHarvestSuggestion = (result: DisplayResult) => {
  if (result.ratio < 0.15) {
    return '谷子未达到成熟的标准，不建议采收。';
  }
  // 随机天气条件（0-晴天, 1-洪涝, 2-阴雨）
  const weatherCondition = Math.floor(Math.random() * 3);
  switch (weatherCondition) {
    case 0: // 晴天
      return '谷子作物已满足收割条件，建议未来5-7天内晴天采收，合理安排采收时间，该地块面积较大，建议使用机械采收。';
    case 1: // 洪涝
      return '未来存在Ⅱ级洪涝，谷子作物已成熟，建议3天内做好提前采收，抢收完成后晾晒脱水，以减低作物损失。';
    case 2: // 阴雨
      return '谷子作物已成熟，未来一周阴雨不断，建议3天内做好提前采收，抢收完成后晾晒脱水，以减低作物损失。';
    default:
      return '谷子作物已满足收割条件，建议及时采收。';
  }
};

// 保存到数据库
const saveToDatabase = async (result: DisplayResult) => {
  saving.value = true;
  try {
    // 构造保存数据
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const saveData = {
      baseName: result.base, // 基地名称
      baseId: selectedPlot.value, // 地块编号作为基地编号
      actionTime: formattedDate, // 使用当前时间作为预警时间
      alertInfo: getHarvestSuggestion(result), // 采收建议作为预警信息
      measure: isMature(result) ? '成熟' : '未成熟', // 固定为收割
      problemType: '成熟期' // 固定为成熟期
    };
    // 这里替换为实际的API调用
    await addSupplyRec(saveData);
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
  padding: 20px;
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
  grid-template-columns: 1fr 1fr;
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
  min-height: 400px;
}

.result-image {
  width: 90%;
  height: 90%;
  object-fit: cover;
}

.image-error {
  color: #909399;
  text-align: center;
}

/* 图例样式 */
.legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.color-block {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-item.mature .color-block {
  background: #f5d742; /* 成熟黄色 */
}

.legend-item.immature .color-block {
  background: #67c23a; /* 未成熟绿色 */
}

/* 结论和建议区域 - 优化版 */
.conclusion-section {
  display: flex;
  align-items: flex-start;
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.maturity-status {
  flex: 0 0 20%;
  max-width: 20%;
  display: flex;
  justify-content: center;
}

.maturity-status h3 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #409eff;
  font-weight: 500;
}

.maturity-tag {
  font-size: 16px;
  padding: 10px 15px;
  border-radius: 6px;
  width: 100%;
  text-align: center;
  white-space: nowrap;
  font-weight: 500;
}

.harvest-suggestion {
  flex: 0 0 80%;
  max-width: 80%;
  padding-left: 16px;
  border-left: 1px solid #ebeef5;
}

.harvest-suggestion h3 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #409eff;
  font-weight: 500;
}

.suggestion-text {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
}

/* 加载状态 */
.skeleton-loading {
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.maturity-status {
  flex: 0 0 20%;
  max-width: 20%;
  display: flex;
  flex-direction: column; /* 改为垂直布局 */
  align-items: center; /* 水平居中 */
  padding-right: 12px;
}

.status-title {
  margin: 0 0 8px 0; /* 只设置下边距 */
  font-size: 15px;
  color: #409eff;
  font-weight: 500;
  white-space: nowrap; /* 防止标题换行 */
  width: 100%;
}

.maturity-tag {
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 6px;
  width: 80%;
  text-align: center;
  white-space: nowrap;
}
</style>
