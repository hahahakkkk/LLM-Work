<script setup lang="ts">
import { ref, computed, watch } from 'vue';

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
  type: 'water' | 'fertilizer';
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
          title: '缺水预警',
          time: '2025-09-12 09:30',
          level: 'high',
          status: 'unhandled',
          base: '侯家沟基地',
          field: '001号',
          description: '土壤含水量低于适宜值30%',
          type: 'water'
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
</script>

<template>
  <div class="alert-list-container">
    <div class="alert-header">
      <div class="alert-title">预警列表</div>
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
            <div class="alert-item-title">
              {{ alert.field }}{{ alert.title }}
              <el-tag :type="getLevelTag(alert.level).type" size="small" class="alert-level-tag"> {{ getLevelTag(alert.level).text }} </el-tag>
            </div>
          </div>
          <div class="alert-item-time">{{ alert.time }}</div>
        </div>
        <div class="alert-item-content">
          <div class="alert-item-description">{{ alert.description }}</div>
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

  .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #eee;

    .alert-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }

  .alert-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;

    // 隐藏滚动条但保持滚动功能
    &::-webkit-scrollbar {
      display: none; /* 隐藏WebKit浏览器的滚动条 */
    }

    -ms-overflow-style: none; /* 隐藏IE/Edge的滚动条 */
    scrollbar-width: none; /* 隐藏Firefox的滚动条 */

    .alert-item-card {
      position: relative;
      padding: 5px;
      margin-bottom: 5px;
      border: 1px solid #ebeef5;
      border-radius: 2px;

      &.alert-unhandled {
        border-right: 4px solid #f56c6c;
      }

      &.alert-handled {
        border-right: 4px solid #67c23a;
      }

      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
      }

      .alert-item-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;

        .alert-item-title-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #333;

          .alert-item-title {
            .el-tag {
              margin-left: 8px;
            }
          }
        }

        .alert-item-time {
          font-size: 12px;
          color: #999;
        }
      }

      .alert-item-content {
        .alert-item-description {
          font-size: 13px;
          color: #666;
        }
      }
    }
  }
}
</style>
