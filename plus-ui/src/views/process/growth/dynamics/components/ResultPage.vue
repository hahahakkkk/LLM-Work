<template>
  <div class="result-container">
    <!-- 返回按钮 -->
    <el-button @click="$emit('backto-upload')">返回上传</el-button>
    <!-- 添加定位按钮 - 参考采样点管理页面的定位按钮 -->
    <!-- 结果展示 -->
    <template v-if="!loading">
      <div v-for="(result, index) in displayResults" :key="index" class="result-card">
        <div class="header-section">
          <h2 class="result-title">长势诊断结果{{ index + 1 }}</h2>
          <div class="action-group">
            <span class="base-name">{{ result.base }}：</span>
            <el-select v-model="selectedPlot" placeholder="选择地块" class="plot-selector" @change="handlePlotChange">
              <el-option
                v-for="dict in filteredLandDict"
                :label="dict.label ? String(dict.label).slice(-3) : ''"
                :value="dict.label ? String(dict.label).slice(-3) : ''"
              />
            </el-select>
            <el-button type="success" :loading="saving" class="save-btn" @click="saveToDatabase(result)">
              <i class="el-icon-upload"></i> 保存到数据库
            </el-button>
            <el-button type="primary" icon="LocationFilled" class="save-btn" @click="triggerLocate"> 定位到地图 </el-button>
          </div>
        </div>
        <!-- 图片对比区 -->
        <div class="image-comparison">
          <!-- 原始影像 -->
          <div class="image-section">
            <div class="image-header">
              <h3 class="image-title">{{ result.base }}{{ selectedPlotLabel }}号</h3>
            </div>
            <div class="image-wrapper">
              <el-image :src="originalUrl" :preview-src-list="[originalUrl, LAIUrl, SPADUrl]" class="result-image">
                <template #error>
                  <div class="image-error">
                    <i class="el-icon-picture-outline"></i>
                    <p>图片加载失败</p>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
          <div class="image-section">
            <div class="image-header">
              <h3 class="image-title">LAI反演结果</h3>
            </div>
            <div class="image-wrapper">
              <el-image :src="LAIUrl" :preview-src-list="[originalUrl, LAIUrl, SPADUrl]" class="result-image">
                <template #error>
                  <div class="image-error">
                    <i class="el-icon-picture-outline"></i>
                    <p>图片加载失败</p>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
          <!-- 成熟度分析 -->
          <div class="image-section">
            <div class="image-header combined-header">
              <h3 class="image-title">SPAD反演结果</h3>
            </div>
            <div class="image-wrapper">
              <el-image :src="SPADUrl" :preview-src-list="[originalUrl, LAIUrl, SPADUrl]" class="result-image">
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
          <!-- 长势指标模块 -->
          <div class="growth-metrics">
            <div class="indicator-group">
              <div class="indicator-item">
                <span class="indicator-label">长势等级：</span>
                <el-tag :type="getGrowthLevelType(result.growthLevel)" size="large" class="custom-tag">
                  {{ result.growthLevel }}
                </el-tag>
              </div>
              <div class="indicator-item">
                <span class="indicator-label">LAI值：</span>
                <el-tag size="large" class="custom-tag">
                  {{ result.laiValue }}
                </el-tag>
              </div>
              <div class="indicator-item">
                <span class="indicator-label">SPAD值：</span>
                <el-tag size="large" class="custom-tag"> {{ result.spadValue }} </el-tag>
              </div>
            </div>
          </div>
          <!-- 修改水肥监测结果模块 -->
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
}

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
    // 新增经纬度属性
    longitude: 110.37622162;
    latitude: 37.74703348;
  }> | null;
}>();

const loading = ref(false);
const saving = ref(false);

import { TableDict } from '@/views/process/growth/api/tableDict/types';
import { landDictQuery } from '@/views/mz_base/api/tableDict';

const baseDict = ref<TableDict[]>([]);
const landDict = ref<DictDataOption[]>([]);

/**
 * 基地、农户字典
 */
const getDicts = async () => {
  let res = await landDictQuery();
  landDict.value = res.rows;
  // console.log(res);
};

// 创建过滤后的地块字典
const filteredLandDict = ref<DictDataOption[]>([]);

// 基地变化时过滤地块
const filterLandDict = () => {
  // 获取基地名称（label）
  const baseNameLabel = displayResults.value[0].base;

  // 根据基地名称过滤地块
  filteredLandDict.value = landDict.value.filter((item) => {
    if (!item.label || item.label.length < 3) return false;

    const basePart = item.label.slice(0, -3); // 去除后三位数字
    // console.log('地块前缀:', basePart, '基地名称:', baseNameLabel);
    return basePart === baseNameLabel;
  });
  // console.log('过滤后的地块数量:', filteredLandDict.value.length);
};

const selectedPlot = ref('001');
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
      irrigationWaterAmount: `${Math.floor(Math.random() * 20) + 5} L/m³`
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
      longitude: item.longitude,
      latitude: item.latitude,
      // 添加模拟数据
      ...mockData,
      ...waterFertilizerData
    };
  });
});

// 保存到数据库
const saveToDatabase = async (result: DisplayResult) => {
  saving.value = true;
  try {
    // 构造保存数据
    const saveData = {
      base: result.base,
      plot: selectedPlot.value,
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

const selectedPlotLabel = ref('001');
const handlePlotChange = (val: string) => {
  // console.log('选择的地块:', val);
  selectedPlotLabel.value = val;
};

// 定义可触发的事件 - 参考采样点管理页面的@pointLocate
const emit = defineEmits(['backto-upload', 'locate-base']);

// 新增：触发定位事件 - 参考采样点管理页面的locateHandle
// 修改后的 triggerLocate 函数
function triggerLocate() {
  if (props.results && props.results.length > 0) {
    const firstResult = props.results[0];
    // 使用新增的经纬度属性
    emit('locate-base', {
      lng: 110.37622162,
      lat: 37.74703348
    });
  }
}

onMounted(() => {
  getDicts().then(() => {
    // 初始化过滤字典
    filterLandDict();
  });
});
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
</style>
