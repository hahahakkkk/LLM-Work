<template>
  <div class="video-container">
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin"
      controls
      preload="none"
      :width="props.width"
      :height="props.height"
      style="object-fit: cover"
      :poster="posterUrl"
    >
      <source :src="src" :type="getVideoType(src)" />
      您的浏览器不支持视频播放
    </video>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const posterUrl = '/video-poster.png'; // 可选占位图

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  width: {
    type: [String, Number],
    default: ''
  },
  height: {
    type: [String, Number],
    default: ''
  }
});

// 获取视频类型
const getVideoType = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'ogg':
      return 'video/ogg';
    case 'avi':
      return 'video/x-msvideo';
    case 'mov':
      return 'video/quicktime';
    default:
      return 'video/mp4'; // 默认返回mp4类型
  }
};

const videoPlayer = ref<HTMLVideoElement | null>(null);

// 在script setup部分修改
const playerInstance = ref(null); // 用于存储Video.js实例

const observer = ref(null); // 用于存储IntersectionObserver实例

// 新增状态跟踪
const isInViewport = ref(false);

// 初始化 video.js 播放器
onMounted(() => {
  if (videoPlayer.value) {
    // 创建IntersectionObserver
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInViewport.value = entry.isIntersecting;
          if (entry.isIntersecting) {
            // 视口内才初始化播放器
            if (!playerInstance.value) {
              playerInstance.value = videojs(videoPlayer.value, {
                controls: true,
                preload: 'none',
                width: props.width,
                height: props.height
              });
            }
          } else if (playerInstance.value) {
            // 离开视口暂停播放
            playerInstance.value.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    // 开始观察视频元素
    observer.value.observe(videoPlayer.value);
  }
});

// 监听 src 的变化，动态更新视频源
watch(
  () => props.src,
  (newSrc) => {
    if (playerInstance.value && isInViewport.value) {
      playerInstance.value.src({ src: newSrc, type: getVideoType(newSrc) });
      // 添加ready状态检查
      if (playerInstance.value.readyState() === 0) {
        playerInstance.value.load();
      }
    }
  },
  { immediate: true }
);

// 销毁 video.js 播放器
onUnmounted(() => {
  // 清理Video.js实例
  if (playerInstance.value) {
    playerInstance.value.dispose();
    playerInstance.value = null;
  }
  // 清理IntersectionObserver
  if (observer.value) {
    observer.value.disconnect();
  }
  videoPlayer.value = null;
});
</script>

<style scoped>
.video-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  max-width: 180px;
  max-height: 90px;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: auto; /* 自动外边距，确保在列表单元格中居中 */
}

/* 隐藏画中画按钮 */
:deep(.video-js .vjs-control-bar .vjs-picture-in-picture-control) {
  display: none !important;
}

/* 缩小控制栏整体宽度 */
:deep(.video-js .vjs-control-bar) {
  width: 90%; /* 设置控制栏宽度为视频容器的 90% */
  margin: 0 auto; /* 水平居中 */
}

/* 缩小控制栏按钮间距 */
:deep(.video-js .vjs-control-bar .vjs-control) {
  margin: 0 -5px !important; /* 调整按钮间距 */
}
</style>
