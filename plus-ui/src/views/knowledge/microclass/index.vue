<template>
  <div class="microclass-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>知识培训课堂</h1>
    </div>

    <!-- 内容卡片 -->
    <div class="content-card">
      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="video-tabs">
        <el-tab-pane label="科普视频" name="5"></el-tab-pane>
        <el-tab-pane label="农技微课" name="6"></el-tab-pane>
      </el-tabs>

      <!-- 加载状态 -->
      <el-skeleton :loading="loading" :count="5" animated>
        <template #default>
          <!-- 视频列表 - 5列网格布局 -->
          <div v-if="!loading && videoList.length > 0" class="video-grid">
            <div v-for="video in videoList" :key="video.ossId" class="video-card" @click="playVideo(video)">
              <!-- 视频缩略图/预览 -->
              <div class="video-thumbnail">
                <video :src="video.url + '#t=0.5'" class="thumbnail-img" preload="metadata" muted></video>
                <div class="play-icon">
                  <el-icon>
                    <video-play />
                  </el-icon>
                </div>
              </div>

              <!-- 视频信息 -->
              <div class="video-info">
                <h3 class="video-title" :title="formatVideoTitle(video.originalName)">{{ formatVideoTitle(video.originalName) }}</h3>
                <div class="video-meta">
                  <span class="file-size">{{ formatFileSize(video.fileSize) }}</span>
                  <span class="upload-time">{{ formatDate(video.createTime) }}</span>
                </div>
                <div class="video-creator">
                  <span>上传者：{{ video.createByName }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty v-else-if="!loading && videoList.length === 0" description="暂无视频课程" />
        </template>
      </el-skeleton>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @change="handlePaginationChange"
      />
    </div>

    <!-- 视频播放对话框 -->
    <el-dialog v-model="dialogVisible" :title="formatVideoTitle(selectedVideo?.originalName || '')" width="90%" center @close="stopVideo">
      <div v-if="selectedVideo" class="video-player-container">
        <video ref="videoPlayer" controls controlsList="nodownload" class="video-player" :src="selectedVideo.url" />
        <div class="video-details">
          <p><strong>文件名：</strong>{{ selectedVideo.originalName }}</p>
          <p><strong>大小：</strong>{{ formatFileSize(selectedVideo.fileSize) }}</p>
          <p><strong>上传时间：</strong>{{ formatDate(selectedVideo.createTime) }}</p>
          <p><strong>上传者：</strong>{{ selectedVideo.createByName }}</p>
          <p>
            <strong>下载链接：</strong>
            <el-button link type="primary" @click="downloadVideo">下载视频</el-button>
          </p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Microclass" lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, ComponentInternalInstance, nextTick } from 'vue';
import { getOssList, type VideoVO, type VideoQuery } from '@/views/knowledge/api/microclass/video';
import { VideoPlay } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 数据
const loading = ref(true);
const videoList = ref<VideoVO[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedVideo = ref<VideoVO | null>(null);
const dialogVisible = ref(false);
const videoPlayer = ref<HTMLVideoElement | null>(null);
const activeTab = ref('5'); // 默认显示科普视频

/**
 * Tab切换处理
 */
const handleTabChange = (tabName: string | number) => {
  currentPage.value = 1; // 重置到第一页
  getVideoList();
};

/**
 * 获取视频列表
 */
const getVideoList = async () => {
  loading.value = true;
  try {
    const query: VideoQuery = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      knowledgeType: activeTab.value // 使用当前tab的值
    };
    const response = await getOssList(query);
    if (response?.code === 200 && response?.rows) {
      videoList.value = response.rows as VideoVO[];
      total.value = response.total || 0;
    } else {
      proxy?.$modal.msgError('获取视频列表失败');
    }
  } catch (error) {
    console.error('获取视频列表错误:', error);
    proxy?.$modal.msgError('获取视频列表异常');
  } finally {
    loading.value = false;
  }
};

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * 格式化视频标题 - 去除文件后缀名
 */
const formatVideoTitle = (originalName: string): string => {
  return originalName.replace(/\.(mp4|avi|mov|wmv|flv|mkv|webm|m4v)$/i, '');
};

/**
 * 格式化日期
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 播放视频
 */
const playVideo = (video: VideoVO) => {
  selectedVideo.value = video;
  dialogVisible.value = true;
  // 等待对话框打开和视频元素加载后自动播放
  nextTick(() => {
    if (videoPlayer.value) {
      videoPlayer.value.play().catch((err) => {
        console.log('自动播放失败:', err);
      });
    }
  });
};

/**
 * 停止视频播放
 */
const stopVideo = () => {
  if (videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.currentTime = 0;
  }
};

/**
 * 下载视频
 */
const downloadVideo = () => {
  if (selectedVideo.value) {
    const link = document.createElement('a');
    link.href = selectedVideo.value.url;
    link.download = selectedVideo.value.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * 分页变化
 */
const handlePaginationChange = () => {
  getVideoList();
};

// 初始化
onMounted(() => {
  getVideoList();
});
</script>

<style scoped lang="scss">
.microclass-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 85px);
  display: flex;
  flex-direction: column;

  .page-header {
    text-align: center;
    margin-bottom: 10px;
    color: #333;

    h1 {
      font-size: 36px;
      font-weight: bold;
      margin: 0 0 10px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    p {
      font-size: 16px;
      color: #666;
      margin: 0;
    }
  }

  .content-card {
    background: white;
    border-radius: 16px;
    padding: 10px 30px 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 30px;

    .video-tabs {
      margin-bottom: 20px;

      :deep(.el-tabs__nav-wrap::after) {
        display: none;
      }

      :deep(.el-tabs__item) {
        font-size: 17px;
        font-weight: 600;
        padding: 0 40px;
        height: 56px;
        line-height: 56px;
        color: #666;
        transition: all 0.3s ease;

        &:hover {
          color: #667eea;
        }
      }

      :deep(.el-tabs__item.is-active) {
        color: #667eea;
      }

      :deep(.el-tabs__active-bar) {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        height: 4px;
        border-radius: 2px;
      }

      :deep(.el-tabs__header) {
        margin-bottom: 0;
      }
    }
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    margin-bottom: 0px;
  }

  .video-card {
    background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      transform: translateY(-4px);

      .play-icon {
        background: rgba(102, 126, 234, 0.9);
        transform: scale(1.2);
      }

      .video-title {
        color: #667eea;
      }
    }

    .video-thumbnail {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%; // 16:9 比例
      background: #f0f0f0;
      overflow: hidden;

      .thumbnail-img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #000;
      }

      .play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 56px;
        height: 56px;
        background: rgba(102, 126, 234, 0.8);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        transition: all 0.3s ease;

        :deep(svg) {
          width: 28px;
          height: 28px;
        }
      }
    }

    .video-info {
      padding: 16px;

      .video-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: #333;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color 0.3s ease;
        line-height: 1.4;
      }

      .video-meta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #999;
        margin-bottom: 12px;

        .file-size {
          color: #667eea;
          font-weight: 500;
        }
      }

      .video-creator {
        font-size: 12px;
        color: #666;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    padding: 30px 0;
    margin-top: auto;

    :deep(.el-pagination) {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .video-player-container {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .video-player {
      width: 100%;
      max-height: 600px;
      border-radius: 8px;
      background: #000;
    }

    .video-details {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;

      p {
        margin: 10px 0;
        font-size: 14px;
        color: #333;

        strong {
          color: #667eea;
          margin-right: 10px;
        }
      }
    }
  }
}

:deep(.el-skeleton) {
  width: 100%;
}

:deep(.el-empty) {
  padding: 80px 0;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #eee;
}

:deep(.el-dialog__title) {
  color: #333;
  font-weight: 600;
}
</style>
