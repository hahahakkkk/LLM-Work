<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElDialog } from 'element-plus';

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
  // 添加详情字段
  detail?: string;
}

// 定义props，从父组件接收预警列表数据
const props = defineProps<{
  alerts?: AlertItem[];
}>();

// 控制详情弹窗显示
const dialogVisible = ref(false);
// 当前查看的预警详情
const currentAlert = ref<AlertItem | null>(null);

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
          detail:
            '当前谷子处于抽穗期，轻微缺水。症状表现为：白天最热时，谷子叶片稍微卷曲、颜色发暗，傍晚或次日清晨又恢复舒展。建议观察谷子生长表现，立即补充适量水分，确保谷穗能顺利抽出。补水时机在太阳落山或早间清晨，参考补水量为：1.46 m³/亩，补水方式建议喷灌或滴灌，避免水直接冲到谷穗，影响授粉。',
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

// 提取简短描述（显示"建议"后100字）
// 提取简短描述（显示关键建议内容后40字）
const getShortDescription = (description: string, detail?: string) => {
  const fullText = detail || description;

  // 定义关键词列表
  const keywords = ['参考补水量', '亩施', '每亩地叶面混合喷施', '叶面喷施'];

  // 查找第一个出现的关键词
  let firstKeywordIndex = -1;
  let foundKeyword = '';

  for (const keyword of keywords) {
    const index = fullText.indexOf(keyword);
    if (index !== -1 && (firstKeywordIndex === -1 || index < firstKeywordIndex)) {
      firstKeywordIndex = index;
      foundKeyword = keyword;
    }
  }

  // 如果找到关键词
  if (firstKeywordIndex !== -1) {
    // 从关键词后开始截取
    const startIndex = firstKeywordIndex + foundKeyword.length;
    const suggestionText = fullText.substring(firstKeywordIndex);

    // 如果建议内容超过40字，截取前40字并添加省略号
    if (suggestionText.length > 40) {
      return suggestionText.substring(0, 40) + '...';
    }

    return suggestionText;
  }

  // 如果没有找到关键词，按原来的方式处理
  if (fullText.length > 40) {
    return fullText.substring(0, 40) + '...';
  }

  return fullText;
};

// 显示详情弹窗
const showDetail = (alert: AlertItem) => {
  currentAlert.value = alert;
  dialogVisible.value = true;
};

// 将时间转换为相对时间显示
const formatTime = (time: string) => {
  const now = new Date();
  const date = new Date(time.replace(/-/g, '/')); // 兼容 Safari 浏览器
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years}年前`;
  } else if (months > 0) {
    return `${months}个月前`;
  } else if (weeks > 0) {
    return `${weeks}周前`;
  } else if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return `${seconds}秒前`;
  }
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
        @click="showDetail(alert)"
      >
        <div class="alert-item-header">
          <div class="alert-item-title-wrapper">
            <div class="alert-item-title">
              {{ alert.field.slice(-3) }}号{{ alert.title }}
              <el-tag :type="getLevelTag(alert.level).type" class="alert-level-tag"> {{ getLevelTag(alert.level).text }} </el-tag>
            </div>
          </div>
          <div class="alert-item-time">{{ formatTime(alert.time) }}</div>
        </div>
        <div class="alert-item-content">
          <div class="alert-item-description">{{ getShortDescription(alert.description, alert.detail) }}</div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="dialogVisible" :title="currentAlert?.field + '号' + currentAlert?.title" width="60vh">
      <div v-if="currentAlert" class="alert-detail-content">
        <div class="alert-detail-section">
          <div class="alert-detail-label">时间：</div>
          <div class="alert-detail-value">{{ currentAlert.time }}</div>
        </div>
        <div class="alert-detail-section">
          <div class="alert-detail-label">级别：</div>
          <div class="alert-detail-value">
            <el-tag :type="getLevelTag(currentAlert.level).type" size="small">
              {{ getLevelTag(currentAlert.level).text }}
            </el-tag>
          </div>
        </div>
        <div class="alert-detail-section">
          <div class="alert-detail-label">状态：</div>
          <div class="alert-detail-value" :style="{ color: getStatusColor(currentAlert.status) }">
            {{ getStatusText(currentAlert.status) }}
          </div>
        </div>
        <div class="alert-detail-section">
          <div class="alert-detail-label">详细描述：</div>
          <div class="alert-detail-value">{{ currentAlert.detail || currentAlert.description }}</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
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

  .alert-level-tag {
    height: 20px;
    width: 30px;
    font-size: 12px;
  }

  .alert-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
    cursor: pointer;

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
          font-weight: normal;
          color: #333;

          .alert-item-title {
            .el-tag {
              margin-left: 8px;
            }
          }
        }

        .alert-item-time {
          font-size: 14px;
          color: #999;
        }
      }

      .alert-item-content {
        .alert-item-description {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }
}

.alert-detail-content {
  .alert-detail-section {
    display: flex;
    margin-bottom: 15px;

    .alert-detail-label {
      width: 80px;
      font-weight: normal;
      color: #333;
    }

    .alert-detail-value {
      flex: 1;
      color: #666;
      font-size: 14px;
    }
  }
}
</style>
