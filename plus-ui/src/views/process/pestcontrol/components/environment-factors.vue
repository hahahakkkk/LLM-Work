<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sunny, Cloudy, Monitor, TrendCharts, Connection, VideoCamera } from '@element-plus/icons-vue';

// 环境因素数据类型
interface EnvironmentFactor {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'danger';
  icon: any;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

// 环境因素数据
const environmentFactors = ref<EnvironmentFactor[]>([
  {
    id: 'temperature',
    name: '温度',
    value: '26.5',
    unit: '°C',
    status: 'normal',
    icon: Sunny,
    trend: 'up',
    description: '适宜病虫害发生'
  },
  {
    id: 'humidity',
    name: '湿度',
    value: '72',
    unit: '%',
    status: 'warning',
    icon: Cloudy,
    trend: 'up',
    description: '湿度偏高，注意病害预防'
  },
  {
    id: 'rainfall',
    name: '降雨量',
    value: '15.2',
    unit: 'mm',
    status: 'normal',
    icon: TrendCharts,
    trend: 'down',
    description: '降雨适中'
  },
  {
    id: 'light',
    name: '光照',
    value: '45000',
    unit: 'lux',
    status: 'normal',
    icon: VideoCamera,
    trend: 'stable',
    description: '光照充足'
  },
  {
    id: 'soilTemp',
    name: '土温',
    value: '24.8',
    unit: '°C',
    status: 'normal',
    icon: Connection,
    trend: 'stable',
    description: '土壤温度适宜'
  },
  {
    id: 'soilMoisture',
    name: '土湿',
    value: '68',
    unit: '%',
    status: 'warning',
    icon: Monitor,
    trend: 'up',
    description: '土壤湿度偏高'
  }
]);

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return '#67c23a';
    case 'warning':
      return '#e6a23c';
    case 'danger':
      return '#f56c6c';
    default:
      return '#909399';
  }
};

// 获取趋势颜色
const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return '#f56c6c';
    case 'down':
      return '#409eff';
    case 'stable':
      return '#67c23a';
    default:
      return '#909399';
  }
};

// 获取趋势图标
const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return '↗';
    case 'down':
      return '↘';
    case 'stable':
      return '→';
    default:
      return '→';
  }
};

// 模拟实时数据更新
const updateEnvironmentData = () => {
  environmentFactors.value.forEach((factor) => {
    // 随机更新数值（模拟传感器数据）
    const baseValue = parseFloat(factor.value);
    const randomChange = (Math.random() - 0.5) * 2; // -1 到 1 的随机变化
    const newValue = Math.max(0, baseValue + randomChange);
    factor.value = newValue.toFixed(1);

    // 随机更新趋势
    const trends = ['up', 'down', 'stable'];
    factor.trend = trends[Math.floor(Math.random() * trends.length)] as any;
  });
};

onMounted(() => {
  // 每30秒更新一次环境数据
  setInterval(updateEnvironmentData, 30000);
});
</script>

<template>
  <div class="environment-factors-container">
    <div class="environment-factors-content">
      <div class="compact-factors-grid">
        <div v-for="factor in environmentFactors" :key="factor.id" class="compact-factor-card" :class="`compact-factor-card--${factor.status}`">
          <div class="factor-header">
            <el-icon class="factor-icon"><component :is="factor.icon" /></el-icon>
            <span class="factor-name">{{ factor.name }}</span>
          </div>
          <div class="factor-value">
            {{ factor.value }}<span class="factor-unit">{{ factor.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.environment-factors-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .environment-factors-content {
    flex: 1;
    padding: 8px;
    display: flex;
    flex-direction: column;

    .compact-factors-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr 1fr;
      gap: 4px;

      .compact-factor-card {
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
        border-radius: 4px;
        padding: 6px;
        color: white;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &--normal {
          background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
        }

        &--warning {
          background: linear-gradient(135deg, #e6a23c 0%, #d19220 100%);
        }

        &--danger {
          background: linear-gradient(135deg, #f56c6c 0%, #f35454 100%);
          animation: danger-pulse 2s infinite;
        }

        .factor-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-bottom: 3px;

          .factor-icon {
            font-size: 12px;
          }

          .factor-name {
            font-size: 9px;
            font-weight: 500;
            opacity: 0.9;
          }
        }

        .factor-value {
          font-size: 13px;
          font-weight: bold;
          text-align: center;

          .factor-unit {
            font-size: 8px;
            opacity: 0.8;
            margin-left: 1px;
          }
        }
      }
    }
  }
}

// 危险状态闪烁动画
@keyframes danger-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .environment-factors-container {
    .environment-factors-content {
      padding: 8px;

      .compact-factors-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: 1fr 1fr 1fr;
        gap: 4px;

        .compact-factor-card {
          padding: 6px;
          height: 100%;

          .factor-header {
            gap: 3px;
            margin-bottom: 2px;

            .factor-icon {
              font-size: 10px;
            }

            .factor-name {
              font-size: 8px;
            }
          }

          .factor-value {
            font-size: 11px;

            .factor-unit {
              font-size: 7px;
            }
          }
        }
      }
    }
  }
}
</style>
