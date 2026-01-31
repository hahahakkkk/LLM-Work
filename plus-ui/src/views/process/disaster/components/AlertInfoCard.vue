<template>
  <div class="alert-card" :class="levelClass">
    <!-- 左侧图标 -->
    <div class="alert-icon">
      <span class="exclamation">!</span>
    </div>

    <!-- 内容 -->
    <div class="alert-content">
      <div class="alert-header">
        <span class="location">{{ alertTitle }}</span>
        <span class="time">{{ timeAgo }}</span>
      </div>
      <div class="alert-message">{{ alertMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  alertTitle: string;
  timeAgo: string;
  alertMessage: string;
  cardId: string | number;
  level: string | number; // 等级：0-11，可能传字符串
}
const props = defineProps<Props>();

// 等级 → 颜色映射
const levelClass = computed(() => {
  const lvl = Number(props.level); // 转成数字，避免全是蓝色的问题

  switch (lvl) {
    case 3:
    case 7:
    case 11: // 特重/特旱/特别重大洪涝
      return 'alert-red';
    case 2:
    case 6:
    case 10: // 重度/重旱/重大洪涝
      return 'alert-orange';
    case 1:
    case 5:
    case 9: // 中度/中旱/较大洪涝
      return 'alert-yellow';
    case 0:
    case 4:
    case 8: // 轻度/轻旱/一般洪涝
      return 'alert-blue';
    default:
      return 'alert-blue';
  }
});
</script>

<style scoped lang="scss">
.alert-card {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
  background: #fff;
  border-left: 6px solid #1890ff; /* 默认蓝色竖条 */

  &:hover {
    transform: translateY(-2px);
  }

  &.alert-red {
    border-left-color: #ff4d4f;
  }
  &.alert-orange {
    border-left-color: #fa8c16;
  }
  &.alert-yellow {
    border-left-color: #fadb14;
  }
  &.alert-blue {
    border-left-color: #1890ff;
  }
}

/* 左侧图标 */
.alert-icon {
  width: 36px;
  height: 36px;
  background: #fff;
  border-radius: 50%;
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .exclamation {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }
}

/* 内容部分 */
.alert-content {
  flex: 1;

  .alert-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;

    .location {
      font-weight: bold;
      font-size: 15px;
      color: #333;
    }
    .time {
      font-size: 13px;
      color: #888;
    }
  }

  .alert-message {
    font-size: 14px;
    color: #555;
  }
}
</style>
