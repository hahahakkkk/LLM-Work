<script setup lang="ts">
import { ref, onMounted, onActivated, onBeforeUnmount } from 'vue';

// 当前时间
const currentTime = ref(
  new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
);

// 更新时间的定时器
let timer: NodeJS.Timeout | null = null;

// 初始化定时器
const initializeTimer = () => {
  console.log('系统标题组件 - 初始化定时器');

  // 确保定时器只有一个
  if (timer) {
    clearInterval(timer);
  }

  // 定时更新时间
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, 1000);
};

onMounted(() => {
  console.log('系统标题组件 - onMounted 执行');
  initializeTimer();
});

onActivated(() => {
  console.log('系统标题组件 - onActivated 执行');
  initializeTimer();
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="system-title-container">
    <div class="title-content">
      <div class="header-title">苗情监测与诊断系统</div>
      <div class="header-time">{{ currentTime }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.system-title-container {
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  .title-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    text-align: center;

    .header-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
    }

    .header-time {
      font-size: 16px;
      color: #333;
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .system-title-container {
    padding: 12px 15px;

    .title-content {
      .header-title {
        font-size: 14px;
      }

      .header-time {
        font-size: 11px;
      }
    }
  }
}

@media (max-width: 768px) {
  .system-title-container {
    padding: 10px;

    .title-content {
      .header-title {
        font-size: 12px;
        margin-bottom: 4px;
      }

      .header-time {
        font-size: 10px;
      }
    }
  }
}

// 高分辨率屏幕优化
@media screen and (-webkit-min-device-pixel-ratio: 2), screen and (min-resolution: 192dpi) {
  .system-title-container {
    box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.08);
  }
}
</style>
