<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Location, Warning, DataAnalysis } from '@element-plus/icons-vue';

// 定义基地详情数据类型（参考seedling实现，适配病虫害信息）
interface BaseDetail {
  id: number;
  name: string;
  fullName: string;
  area: number;
  variety: string;
  currentStage: string;
  plotCount: number;
  riskPlots: number;
  detectionCoverage: number;
  pestRisk: 'low' | 'medium' | 'high';
  threatLevel: string;
  mainThreats: string[];
  operator: string;
  lastUpdateTime: string;
  averageTemperature: number;
  averageHumidity: number;
  recommendations: string[];
}

// 当前基地信息（固定为侯家沟基地，参考seedling模式）
const currentBase = ref<BaseDetail>({
  id: 1,
  name: '侯家沟',
  fullName: '侯家沟数字化种植基地',
  area: 1000,
  variety: '米谷1号',
  currentStage: '病虫害监测期',
  plotCount: 85,
  riskPlots: 12,
  detectionCoverage: 78.5,
  pestRisk: 'medium',
  threatLevel: '中等风险',
  mainThreats: ['蚜虫', '叶斑病', '红蜘蛛'],
  operator: 'admin',
  lastUpdateTime: '2025-09-24 16:42:44',
  averageTemperature: 26.5,
  averageHumidity: 68,
  recommendations: ['定期监测', '适时防治', '加强通风']
});

// 发送事件到父组件
const emit = defineEmits<{
  (e: 'base-selected', name: string): void;
}>();

// 获取风险颜色
const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取风险文字
const getRiskText = (risk: string) => {
  switch (risk) {
    case 'low':
      return '低';
    case 'medium':
      return '中';
    case 'high':
      return '高';
    default:
      return '未知';
  }
};

// 在组件挂载时自动选择当前基地，延迟执行确保地图组件已经初始化
onMounted(() => {
  setTimeout(() => {
    emit('base-selected', currentBase.value.fullName);
  }, 100);
});
</script>

<template>
  <div class="base-info-container">
    <div class="base-info-content">
      <div class="info-row">
        <span class="info-label">基地名称：</span>
        <span class="info-value">{{ currentBase.name }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">种植面积：</span>
        <span class="info-value">{{ currentBase.area }}亩</span>
      </div>

      <div class="info-row">
        <span class="info-label">作物品种：</span>
        <span class="info-value">{{ currentBase.variety }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">当前生育期：</span>
        <span class="info-value highlight">{{ currentBase.currentStage }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">地块数量：</span>
        <span class="info-value">{{ currentBase.plotCount }}块</span>
      </div>

      <div class="info-row">
        <span class="info-label">风险地块：</span>
        <span class="info-value risk-value">{{ currentBase.riskPlots }}块</span>
      </div>

      <div class="info-row">
        <span class="info-label">检测完成率：</span>
        <span class="info-value coverage-value">{{ currentBase.detectionCoverage }}%</span>
      </div>

      <div class="info-row">
        <span class="info-label">病虫害风险：</span>
        <span class="info-value">
          <el-tag :type="getRiskColor(currentBase.pestRisk)" size="small"> {{ getRiskText(currentBase.pestRisk) }}风险 </el-tag>
        </span>
      </div>

      <div class="info-row threats-row">
        <span class="info-label">主要威胁：</span>
        <div class="info-value">
          <el-tag v-for="threat in currentBase.mainThreats" :key="threat" type="warning" size="small" class="threat-tag">
            {{ threat }}
          </el-tag>
        </div>
      </div>

      <div class="info-row">
        <span class="info-label">环境温度：</span>
        <span class="info-value">{{ currentBase.averageTemperature }}°C</span>
      </div>

      <div class="info-row">
        <span class="info-label">环境湿度：</span>
        <span class="info-value">{{ currentBase.averageHumidity }}%</span>
      </div>

      <div class="info-row">
        <span class="info-label">数据更新时间：</span>
        <span class="info-value time-value">{{ currentBase.lastUpdateTime }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-info-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px;
  justify-content: center;
  background-color: #fafbfc;

  .base-info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow-y: auto;

    .info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f5f7fa;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(64, 158, 255, 0.05);
        border-radius: 4px;
        margin: 0 -8px;
        padding: 12px 8px;
      }

      &:last-child {
        border-bottom: none;
      }

      &.threats-row {
        align-items: flex-start;

        .info-value {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          max-width: 60%;
          justify-content: flex-end;

          .threat-tag {
            margin: 0;
          }
        }
      }

      .info-label {
        font-size: 14px;
        color: #666;
        font-weight: normal;
        min-width: 95px;
        flex-shrink: 0;
        text-align: left;
      }

      .info-value {
        font-size: 14px;
        color: #333;
        font-weight: normal;
        text-align: right;
        flex: 1;

        &.highlight {
          color: #409eff;
          font-weight: normal;
        }

        &.coverage-value {
          color: #67c23a;
          font-weight: normal;
        }

        &.risk-value {
          color: #e6a23c;
          font-weight: normal;
        }

        &.time-value {
          font-size: 12px;
          color: #999;
          font-weight: normal;
          font-family: 'Courier New', monospace;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .base-info-container {
    padding: 8px;

    .base-info-content {
      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        text-align: center;

        &.threats-row {
          .info-value {
            max-width: 100%;
            justify-content: flex-start;
          }
        }

        .info-label {
          min-width: auto;
          font-size: 12px;
          text-align: left;
        }

        .info-value {
          font-size: 12px;
          text-align: left;

          &.time-value {
            font-size: 10px;
          }
        }
      }
    }
  }
}
</style>
