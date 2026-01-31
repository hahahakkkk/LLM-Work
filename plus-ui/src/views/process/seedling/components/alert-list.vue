<script setup lang="ts">
import { ref, computed } from 'vue';

// 定义预警信息类型
interface AlertItem {
  id: number;
  title: string;
  time: string;
  level: 'high' | 'medium' | 'low';
  status: 'unhandled' | 'handled';
  base: string;
  field: string;
  description: string;
  type: 'emergence' | 'growth';
}

// 定义props，从父组件接收预警列表数据
const props = defineProps<{
  alerts?: AlertItem[];
}>();

// 使用计算属性处理传入的数据，如果没有传入则使用默认数据
const alertList = computed<AlertItem[]>(() => {
  return props.alerts && props.alerts.length > 0
    ? props.alerts
    : [
        {
          id: 1,
          title: '出苗率偏低预警',
          time: '2025-09-23 14:30',
          level: 'high',
          status: 'unhandled',
          base: '侯家沟基地',
          field: '004',
          description: '004号地块出苗率为46%，低于正常标准',
          type: 'emergence'
        },
        {
          id: 2,
          title: '出苗不均匀预警',
          time: '2025-09-23 13:45',
          level: 'medium',
          status: 'unhandled',
          base: '姜兴庄基地',
          field: '009',
          description: '009号地块出苗不均匀，建议补种',
          type: 'emergence'
        }
      ];
});

// 获取预警级别标签
const getLevelTag = (level: 'high' | 'medium' | 'low') => {
  const levelMap = {
    high: { type: 'danger', text: '重度' },
    medium: { type: 'warning', text: '中度' },
    low: { type: 'info', text: '轻微' }
  };
  return levelMap[level];
};

// 获取处理状态对应的颜色
const getStatusColor = (status: 'unhandled' | 'handled') => {
  const colorMap = {
    unhandled: '#f56c6c', // 红色，表示未处理
    handled: '#67c23a' // 绿色，表示已处理
  };
  return colorMap[status];
};

// 获取处理状态对应的文本
const getStatusText = (status: 'unhandled' | 'handled') => {
  const textMap = {
    unhandled: '未处理',
    handled: '已处理'
  };
  return textMap[status];
};

// 获取预警类型图标
const getTypeIcon = (type: 'emergence' | 'growth') => {
  const iconMap = {
    emergence: '🌱', // 出苗率相关
    growth: '🌿' // 生长相关
  };
  return iconMap[type];
};
</script>

<template>
  <div class="alert-list-container">
    <div class="alert-header">
      <div class="alert-title">预警列表</div>
      <div class="alert-info">
        <span class="alert-count">{{ alertList.length }}</span>
        <span class="alert-text">条预警信息</span>
      </div>
    </div>

    <div class="alert-list">
      <div
        v-for="alert in alertList"
        :key="alert.id"
        class="alert-item-card"
        :class="{ 'alert-unhandled': alert.status === 'unhandled', 'alert-handled': alert.status === 'handled' }"
      >
        <div class="alert-item-header">
          <div class="alert-item-title-wrapper">
            <div class="alert-type-icon">{{ getTypeIcon(alert.type) }}</div>
            <div class="alert-item-title">
              {{ alert.base }}{{ alert.field }}号{{ alert.title }}
              <el-tag :type="getLevelTag(alert.level).type" size="small" class="alert-level-tag">
                {{ getLevelTag(alert.level).text }}
              </el-tag>
            </div>
          </div>
          <div class="alert-item-time">{{ alert.time }}</div>
        </div>
        <div class="alert-item-content">
          <div class="alert-item-description">{{ alert.description }}</div>
          <div class="alert-item-status">
            <span class="status-indicator" :style="{ backgroundColor: getStatusColor(alert.status) }"></span>
            <span class="status-text">{{ getStatusText(alert.status) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.alert-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;

  .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;

    .alert-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .alert-info {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .alert-count {
        font-size: 20px;
        font-weight: bold;
        color: #f56c6c;
      }

      .alert-text {
        font-size: 14px;
        color: #666;
      }
    }
  }

  .alert-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .alert-item-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border-left: 4px solid transparent;

      &.alert-unhandled {
        border-left-color: #f56c6c;
        background: linear-gradient(to right, #fff5f5, #fff);
      }

      &.alert-handled {
        border-left-color: #67c23a;
        background: linear-gradient(to right, #f0f9ff, #fff);
        opacity: 0.8;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .alert-item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;

        .alert-item-title-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;

          .alert-type-icon {
            font-size: 16px;
            flex-shrink: 0;
          }

          .alert-item-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;

            .alert-level-tag {
              flex-shrink: 0;
            }
          }
        }

        .alert-item-time {
          font-size: 12px;
          color: #999;
          white-space: nowrap;
          margin-left: 12px;
        }
      }

      .alert-item-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 12px;

        .alert-item-description {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
          flex: 1;
        }

        .alert-item-status {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;

          .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .status-text {
            font-size: 12px;
            font-weight: 500;
          }
        }
      }
    }
  }

  /* 隐藏滚动条但保持滚动功能 */
  .alert-list::-webkit-scrollbar {
    display: none;
  }

  .alert-list {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
</style>
