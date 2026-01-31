<template>
  <div class="dify-chat-container">
    <!-- 输入区域 -->
    <div class="input-area">
      <el-input
        v-model="inputQuery"
        placeholder="请输入报告内容，生成相关建议措施（例如：项目进度延迟，资源不足）"
        @keyup.enter="handleSendMessage"
        clearable
        :disabled="isLoading"
        size="default"
        maxlength="500"
        show-word-limit
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
      />
      <div class="button-group">
        <el-button type="primary" :loading="isLoading" @click="handleSendMessage" icon="el-icon-send" :disabled="!inputQuery.trim()">
          发送
        </el-button>
        <el-button type="default" @click="handleClearChat" icon="el-icon-delete" :disabled="chatHistory.length === 0 && !tempAiContent">
          清空记录
        </el-button>
      </div>
    </div>

    <!-- 聊天历史区域（对话框核心展示） -->
    <div class="chat-history-container">
      <div class="chat-history-title">
        建议措施生成记录
        <el-tag v-if="chatHistory.length > 0" size="small" type="info"> {{ chatHistory.length }} 条记录 </el-tag>
      </div>
      <!-- 对话框列表：模拟聊天软件滚动容器 -->
      <div class="chat-dialog-list">
        <!-- 历史消息（对话框气泡） -->
        <div
          class="chat-dialog-item"
          v-for="(item, index) in chatHistory"
          :key="index"
          :class="{ 'user-dialog': item.type === 'user', 'ai-dialog': item.type === 'ai' }"
        >
          <!-- 头像 -->
          <div class="chat-avatar">
            <el-avatar :size="36" :style="item.type === 'user' ? 'background-color: #409EFF' : 'background-color: #67C23A'">
              <el-icon v-if="item.type === 'user'"><User /></el-icon>
              <el-icon v-else><ChatLineRound /></el-icon>
            </el-avatar>
          </div>
          <!-- 对话框气泡 -->
          <div class="chat-dialog-bubble">
            <div class="dialog-header">
              <span class="sender-name">{{ item.type === 'user' ? '我（报告内容）' : 'AI（建议措施）' }}</span>
              <span class="message-time">{{ item.createTime }}</span>
            </div>
            <div class="dialog-content">{{ item.content }}</div>
          </div>
        </div>

        <!-- 实时回复（对话框气泡） -->
        <div v-if="tempAiContent" class="chat-dialog-item ai-dialog">
          <div class="chat-avatar">
            <el-avatar size="36" style="background-color: #67c23a">
              <el-icon><ChatLineRound /></el-icon>
            </el-avatar>
          </div>
          <div class="chat-dialog-bubble">
            <div class="dialog-header">
              <span class="sender-name">AI（建议措施）</span>
              <span class="message-time">{{ currentTime }}</span>
            </div>
            <div class="dialog-content">{{ tempAiContent }}</div>
          </div>
        </div>

        <!-- 加载中状态（对齐AI对话框） -->
        <div v-if="isLoading" class="loading-dialog-item">
          <div class="chat-avatar">
            <el-avatar size="36" style="background-color: #67c23a; opacity: 0.8">
              <el-icon><ChatLineRound /></el-icon>
            </el-avatar>
          </div>
          <div class="chat-dialog-bubble loading-bubble">
            <div class="loading-text">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>AI 正在生成建议措施...</span>
            </div>
          </div>
        </div>

        <!-- 空状态（居中展示） -->
        <div v-if="chatHistory.length === 0 && !tempAiContent && !isLoading" class="empty-dialog-item">
          <el-empty description="暂无生成记录，请输入报告内容并发送">
            <template #image>
              <el-icon :size="80"><ChatLineSquare /></el-icon>
            </template>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 错误提示区域 -->
    <div class="error-area" v-if="errorMessage">
      <el-alert :title="errorMessage" type="error" closable @close="handleClearError" show-icon effect="dark" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue';
import { ElMessageBox } from 'element-plus';
import { User, ChatLineRound, Loading, ChatLineSquare } from '@element-plus/icons-vue';
import { getDifyChat, ApiResponse } from '@/views/process/api/block/dify';

// ===================== 响应式数据 =====================
const inputQuery = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const tempAiContent = ref('');
const currentTime = ref('');

// 聊天历史记录
interface ChatItem {
  type: 'user' | 'ai';
  content: string;
  createTime: string;
}
const chatHistory = ref<ChatItem[]>([]);

// 连接管理
let abortController: AbortController | null = null;
let typingTimer: number | null = null;
let currentUpdateTimer: number | null = null;

// ===================== 计算属性 =====================
const formattedTime = computed(() => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
});

// ===================== 工具方法 =====================
/**
 * 格式化时间
 */
const formatTime = (date?: Date): string => {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hour = d.getHours().toString().padStart(2, '0');
  const minute = d.getMinutes().toString().padStart(2, '0');
  const second = d.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/**
 * 更新当前时间
 */
const updateCurrentTime = () => {
  currentTime.value = formatTime();
};

/**
 * 清理之前的连接和计时器
 */
const cleanupPreviousConnection = () => {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  if (typingTimer) {
    clearTimeout(typingTimer);
    typingTimer = null;
  }
  if (currentUpdateTimer) {
    clearInterval(currentUpdateTimer);
    currentUpdateTimer = null;
  }
};

/**
 * 模拟打字效果
 */
const simulateTypingEffect = (content: string, callback?: () => void) => {
  if (!content) {
    if (callback) callback();
    return;
  }

  tempAiContent.value = '';
  let index = 0;

  const typeChar = () => {
    if (index < content.length) {
      tempAiContent.value += content.charAt(index);
      index++;
      typingTimer = window.setTimeout(typeChar, 30);
    } else if (callback) {
      callback();
    }
  };

  typeChar();
};

// ===================== 核心方法 =====================
/**
 * 发送消息（生成建议措施）
 */
const handleSendMessage = async () => {
  const reportContent = inputQuery.value.trim();
  if (!reportContent) {
    return;
  }

  try {
    cleanupPreviousConnection();

    isLoading.value = true;
    errorMessage.value = '';
    tempAiContent.value = '';

    updateCurrentTime();
    currentUpdateTimer = window.setInterval(updateCurrentTime, 1000);

    // 添加用户消息到历史
    const userItem: ChatItem = {
      type: 'user',
      content: reportContent,
      createTime: formatTime()
    };
    chatHistory.value.push(userItem);

    // 清空输入框
    inputQuery.value = '';

    // 生成临时用户ID
    const userId = `user_${Date.now().toString().substring(4, 12)}`;

    // 调用非流式请求
    await handleNonStreamingRequest(reportContent, userId);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('请求被用户取消');
      return;
    }

    errorMessage.value = error.message || '生成建议措施失败';
  } finally {
    isLoading.value = false;
    if (currentUpdateTimer) {
      clearInterval(currentUpdateTimer);
      currentUpdateTimer = null;
    }
  }
};

/**
 * 处理非流式请求
 */
const handleNonStreamingRequest = async (reportContent: string, userId: string): Promise<void> => {
  try {
    abortController = new AbortController();

    const result: ApiResponse<string> = await getDifyChat(reportContent, userId);

    console.log('result', result);

    if (result.code === 200 && result.data) {
      // 直接显示结果，不模拟打字效果
      const aiItem: ChatItem = {
        type: 'ai',
        content: result.data!,
        createTime: formatTime()
      };
      chatHistory.value.push(aiItem);
      tempAiContent.value = '';
    } else {
      throw new Error(result.msg || '生成建议措施失败');
    }
  } catch (error: any) {
    throw error;
  }
};

/**
 * 清空生成记录
 */
const handleClearChat = () => {
  if (chatHistory.value.length === 0 && !tempAiContent.value) {
    return;
  }

  ElMessageBox.confirm('确定要清空所有生成记录吗？此操作不可撤销。', '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    center: true,
    customClass: 'clear-chat-dialog'
  })
    .then(() => {
      chatHistory.value = [];
      tempAiContent.value = '';
      errorMessage.value = '';
      cleanupPreviousConnection();
    })
    .catch(() => {});
};

/**
 * 清除错误提示
 */
const handleClearError = () => {
  errorMessage.value = '';
};

// ===================== 生命周期 =====================
onBeforeUnmount(() => {
  cleanupPreviousConnection();
});

// ===================== 监听器 =====================
watch(
  () => inputQuery.value,
  () => {
    if (inputQuery.value.trim()) {
      updateCurrentTime();
    }
  }
);
</script>

<style scoped lang="scss">
.dify-chat-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

// 输入区域
.input-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;

  .el-textarea {
    :deep(.el-textarea__inner) {
      border-radius: 8px;
      border: 1px solid #dcdfe6;
      transition: border-color 0.3s;

      &:focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
      }
    }
  }

  .button-group {
    display: flex;
    gap: 12px;

    .el-button {
      padding: 10px 24px;
      border-radius: 6px;
      font-weight: 500;

      &:first-child {
        flex: 1;
      }
    }
  }
}

// 聊天历史容器
.chat-history-container {
  margin-top: 32px;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;

  .chat-history-title {
    padding: 16px 20px;
    background-color: #f5f7fa;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
  }

  // 对话框列表
  .chat-dialog-list {
    max-height: 600px;
    min-height: 300px;
    overflow-y: auto;
    padding: 20px;
    background-color: #fafafa;
    // 滚动条优化
    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #c1c1c1;
      border-radius: 4px;
      &:hover {
        background-color: #a8a8a8;
      }
    }

    // 通用对话框项
    .chat-dialog-item {
      display: flex;
      margin-bottom: 20px;
      align-items: flex-start;
      animation: fadeIn 0.3s ease;

      // 头像样式
      .chat-avatar {
        flex-shrink: 0;
        margin-right: 12px;
      }

      // 对话框气泡
      .chat-dialog-bubble {
        flex: 0 1 75%;
        background: linear-gradient(135deg, #f0f9f0, #e1f3e1);
        border: 1px solid #e1f3e1;
        border-radius: 12px;
        padding: 12px 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        position: relative;

        // 对话框头部（发送者+时间）
        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;

          .sender-name {
            font-weight: 600;
            color: #67c23a;
          }

          .message-time {
            color: #909399;
            font-size: 11px;
          }
        }

        // 对话框内容
        .dialog-content {
          color: #303133;
          font-size: 14px;
          line-height: 1.6;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
      }

      // 用户对话框（右对齐，蓝色气泡）
      &.user-dialog {
        flex-direction: row-reverse;

        .chat-avatar {
          margin-right: 0;
          margin-left: 12px;
        }

        .chat-dialog-bubble {
          background: linear-gradient(135deg, #409eff, #337ecc);
          border: 1px solid #409eff;

          .dialog-header {
            .sender-name {
              color: rgba(255, 255, 255, 0.9);
            }
            .message-time {
              color: rgba(255, 255, 255, 0.7);
            }
          }

          .dialog-content {
            color: #ffffff;
          }
        }
      }

      // AI对话框（左对齐，绿色气泡）
      &.ai-dialog {
        flex-direction: row;
      }
    }

    // 加载中对话框
    .loading-dialog-item {
      display: flex;
      margin-bottom: 20px;
      align-items: flex-start;

      .chat-avatar {
        flex-shrink: 0;
        margin-right: 12px;
      }

      .loading-bubble {
        flex: 0 1 75%;
        background-color: #f8fbf8;
        border: 1px solid #e1f3e1;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

        .loading-text {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          color: #606266;
          font-size: 12px;

          .loading-icon {
            animation: rotating 2s linear infinite;
            font-size: 14px;
          }
        }
      }
    }

    // 空状态
    .empty-dialog-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: #909399;

      .el-empty__description {
        margin-top: 12px;
      }
    }
  }
}

// 错误提示区域
.error-area {
  margin-top: 20px;
  animation: slideDown 0.3s ease;
}

// 动画定义
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dify-chat-container {
    margin: 10px;
    padding: 16px;
  }

  .input-area .button-group {
    flex-direction: column;
    .el-button {
      width: 100%;
    }
  }

  .chat-dialog-list .chat-dialog-bubble {
    flex: 0 1 85%;
  }
}
</style>

<style>
/* 全局对话框确认框样式 */
.clear-chat-dialog .el-message-box__content {
  padding: 20px;
}

.clear-chat-dialog .el-message-box__title {
  font-weight: 600;
}

.clear-chat-dialog .el-message-box__btns {
  padding-top: 20px;
}
</style>
