<template>
  <div class="qa-community-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>问答社区记录</h1>
    </div>

    <!-- 问题列表 -->
    <el-card class="content-card" shadow="never" v-loading="loading">
      <div v-if="questionList.length > 0" class="question-list">
        <div v-for="question in questionList" :key="question.questionId" class="question-item">
          <!-- 问题头部 -->
          <div class="question-header">
            <div class="user-info">
              <el-avatar :size="40" :src="getUserAvatar(question.userId)" class="avatar">
                {{ getUserNickName(question.userId, question.userName)?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="user-details">
                <span class="username">{{ getUserNickName(question.userId, question.userName) }}</span>
                <span class="time">{{ formatTime(question.publishedAt) }}</span>
              </div>
            </div>
            <div class="question-actions">
              <el-button
                text
                type="primary"
                @click="toggleAnswers(question)"
                :icon="expandedQuestions.has(question.questionId) ? 'ArrowUp' : 'ArrowDown'"
              >
                {{ expandedQuestions.has(question.questionId) ? '收起' : '查看' }}回答 ({{ getActualAnswerCount(question.questionId) }})
              </el-button>
              <el-button text type="danger" icon="Delete" @click="handleDeleteQuestion(question)"> 删除问题 </el-button>
            </div>
          </div>

          <!-- 问题内容 -->
          <div class="question-content">
            <h3 class="question-title">标题：{{ question.title }}</h3>
            <div class="question-text">问题详情：{{ question.content }}</div>
            <div class="question-meta">
              <el-tag v-if="question.categoryName" size="small" type="info">{{ question.categoryName }}</el-tag>
              <el-tag v-if="question.isHot" size="small" type="danger" effect="plain">热门</el-tag>
              <el-tag v-if="question.expert" size="small" type="warning" effect="plain">专家</el-tag>
              <span class="meta-item"
                ><el-icon><View /></el-icon> {{ question.viewCount || 0 }}</span
              >
              <span class="meta-item"
                ><el-icon><ChatDotRound /></el-icon> {{ getActualAnswerCount(question.questionId) }}</span
              >
              <span class="meta-item"
                ><el-icon><Star /></el-icon> {{ question.likeCount || 0 }}</span
              >
            </div>
          </div>

          <!-- 回答列表（展开时显示） -->
          <div v-if="expandedQuestions.has(question.questionId)" class="answers-section">
            <el-divider />
            <div v-if="loadingAnswers.has(question.questionId)" class="loading-answers">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载回答中...</span>
            </div>
            <div v-else-if="questionAnswers[question.questionId]?.length > 0" class="answer-list">
              <div v-for="answer in questionAnswers[question.questionId]" :key="answer.answerId" class="answer-item">
                <!-- 回答头部 -->
                <div class="answer-header">
                  <div class="user-info">
                    <el-avatar :size="32" :src="getUserAvatar(answer.userId)" class="avatar">
                      {{ getUserNickName(answer.userId, answer.userName)?.charAt(0) || 'U' }}
                    </el-avatar>
                    <div class="user-details">
                      <span class="username">{{ getUserNickName(answer.userId, answer.userName) }}</span>
                      <span class="time">{{ formatTime(answer.publishedAt) }}</span>
                    </div>
                  </div>
                  <div class="answer-actions">
                    <el-button
                      text
                      type="primary"
                      size="small"
                      @click="toggleReplies(answer)"
                      :icon="expandedAnswers.has(answer.answerId) ? 'ArrowUp' : 'ArrowDown'"
                    >
                      {{ expandedAnswers.has(answer.answerId) ? '收起' : '查看' }}回复 ({{ getActualReplyCount(answer.answerId) }})
                    </el-button>
                    <el-button text type="danger" size="small" icon="Delete" @click="handleDeleteAnswer(answer)"> 删除 </el-button>
                  </div>
                </div>

                <!-- 回答内容 -->
                <div class="answer-content">
                  <p>{{ answer.content }}</p>
                  <div class="answer-meta">
                    <span class="meta-item"
                      ><el-icon><Star /></el-icon> {{ answer.likeCount || 0 }}</span
                    >
                  </div>
                </div>

                <!-- 回复列表（展开时显示） -->
                <div v-if="expandedAnswers.has(answer.answerId)" class="replies-section">
                  <div v-if="loadingReplies.has(answer.answerId)" class="loading-replies">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>加载回复中...</span>
                  </div>
                  <div v-else-if="answerReplies[answer.answerId]?.length > 0" class="reply-list">
                    <div v-for="reply in answerReplies[answer.answerId]" :key="reply.replyId" class="reply-item">
                      <div class="reply-header">
                        <div class="user-info">
                          <el-avatar :size="28" :src="getUserAvatar(reply.userId)" class="avatar">
                            {{ getUserNickName(reply.userId, reply.userName)?.charAt(0) || 'U' }}
                          </el-avatar>
                          <div class="user-details">
                            <span class="username">{{ getUserNickName(reply.userId, reply.userName) }}</span>
                            <span v-if="reply.replyToUserName" class="reply-to">
                              回复 <strong>@{{ getUserNickName(reply.replyToUserId, reply.replyToUserName) }}</strong>
                            </span>
                            <span class="time">{{ formatTime(reply.publishedAt) }}</span>
                          </div>
                        </div>
                        <el-button text type="danger" size="small" icon="Delete" @click="handleDeleteReply(reply)"> 删除 </el-button>
                      </div>
                      <div class="reply-content">
                        <p>{{ reply.content }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-replies">
                    <el-empty description="暂无回复" :image-size="60" />
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-answers">
              <el-empty description="暂无回答" :image-size="80" />
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="暂无问题数据" :image-size="120" />
    </el-card>

    <!-- 分页 -->
    <div v-if="total > queryParams.pageSize" class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @change="getQuestionList"
      />
    </div>
  </div>
</template>

<script setup name="QaCommunity" lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue';
import {
  listQuestions,
  deleteQuestions,
  listAnswers,
  deleteAnswers,
  listReplies,
  deleteReplies,
  type Question,
  type Answer,
  type Reply
} from '@/views/knowledge/api/qa/qa';
import { View, ChatDotRound, Star, Loading } from '@element-plus/icons-vue';
import { getUserProfile } from '@/api/system/user';
import useUserStore from '@/store/modules/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const userStore = useUserStore();

// 数据
const loading = ref(false);
const questionList = ref<Question[]>([]);
const total = ref(0);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
});

// 展开状态
const expandedQuestions = ref(new Set<string | number>());
const expandedAnswers = ref(new Set<string | number>());
const loadingAnswers = ref(new Set<string | number>());
const loadingReplies = ref(new Set<string | number>());

// 回答和回复数据
const questionAnswers = ref<Record<string | number, Answer[]>>({});
const answerReplies = ref<Record<string | number, Reply[]>>({});
// 实际回答数量映射 (questionId => answerCount)
const actualAnswerCounts = ref<Record<string | number, number>>({});
// 实际回复数量映射 (answerId => replyCount)
const actualReplyCounts = ref<Record<string | number, number>>({});

// 用户头像映射 (userId => avatarUrl)
const userAvatars = ref<Record<string | number, string>>({});
// 用户昵称映射 (userId => nickName)
const userNickNames = ref<Record<string | number, string>>({});

/**
 * 获取用户头像URL
 */
const getUserAvatar = (userId?: string | number): string => {
  if (!userId) return '';
  return userAvatars.value[userId] || userStore.avatar || '';
};

/**
 * 获取用户昵称
 */
const getUserNickName = (userId?: string | number, defaultName?: string): string => {
  if (!userId) return defaultName || '匿名用户';
  return userNickNames.value[userId] || defaultName || '匿名用户';
};

/**
 * 获取实际回答数量
 */
const getActualAnswerCount = (questionId: string | number): number => {
  // 优先返回已统计的实际数量
  if (actualAnswerCounts.value[questionId] !== undefined) {
    return actualAnswerCounts.value[questionId];
  }
  return 0;
};

/**
 * 获取实际回复数量
 */
const getActualReplyCount = (answerId: string | number): number => {
  // 优先返回已统计的实际数量
  if (actualReplyCounts.value[answerId] !== undefined) {
    return actualReplyCounts.value[answerId];
  }
  return 0;
};

/**
 * 加载用户头像和昵称
 */
const loadUserAvatar = async () => {
  try {
    const response = await getUserProfile();
    if (response?.data?.user) {
      const user = response.data.user;
      userAvatars.value[user.userId] = user.avatar || '';
      userNickNames.value[user.userId] = user.nickName || user.userName || '';
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

/**
 * 获取问题列表
 */
const getQuestionList = async () => {
  loading.value = true;
  try {
    const response = await listQuestions(queryParams);
    if (response?.code === 200) {
      const questions = response.rows || [];
      questionList.value = questions;
      total.value = response.total || 0;

      // 为每个问题加载实际回答数量
      await Promise.all(
        questions.map(async (question) => {
          try {
            const answerResponse = await listAnswers(question.questionId, { pageNum: 1, pageSize: 100 });
            if (answerResponse?.code === 200) {
              actualAnswerCounts.value[question.questionId] = (answerResponse.rows || []).length;
            }
          } catch (error) {
            console.error(`加载问题${question.questionId}的回答数量失败:`, error);
            actualAnswerCounts.value[question.questionId] = 0;
          }
        })
      );
    } else {
      proxy?.$modal.msgError('获取问题列表失败');
    }
  } catch (error) {
    console.error('获取问题列表错误:', error);
    proxy?.$modal.msgError('获取问题列表异常');
  } finally {
    loading.value = false;
  }
};

/**
 * 切换回答显示
 */
const toggleAnswers = async (question: Question) => {
  const questionId = question.questionId;

  if (expandedQuestions.value.has(questionId)) {
    // 收起
    expandedQuestions.value.delete(questionId);
  } else {
    // 展开并加载回答
    expandedQuestions.value.add(questionId);

    if (!questionAnswers.value[questionId]) {
      await loadAnswers(questionId);
    }
  }
};

/**
 * 加载回答列表
 */
const loadAnswers = async (questionId: string | number) => {
  loadingAnswers.value.add(questionId);
  try {
    const response = await listAnswers(questionId, { pageNum: 1, pageSize: 100 });
    if (response?.code === 200) {
      const answers = response.rows || [];
      questionAnswers.value[questionId] = answers;

      // 为每个回答加载回复数量
      await Promise.all(
        answers.map(async (answer) => {
          try {
            const replyResponse = await listReplies(answer.answerId, { pageNum: 1, pageSize: 100 });
            if (replyResponse?.code === 200) {
              actualReplyCounts.value[answer.answerId] = (replyResponse.rows || []).length;
            }
          } catch (error) {
            console.error(`加载回答${answer.answerId}的回复数量失败:`, error);
            actualReplyCounts.value[answer.answerId] = 0;
          }
        })
      );
    }
  } catch (error) {
    console.error('加载回答错误:', error);
  } finally {
    loadingAnswers.value.delete(questionId);
  }
};

/**
 * 切换回复显示
 */
const toggleReplies = async (answer: Answer) => {
  const answerId = answer.answerId;

  if (expandedAnswers.value.has(answerId)) {
    // 收起
    expandedAnswers.value.delete(answerId);
  } else {
    // 展开并加载回复
    expandedAnswers.value.add(answerId);

    if (!answerReplies.value[answerId]) {
      await loadReplies(answerId);
    }
  }
};

/**
 * 加载回复列表
 */
const loadReplies = async (answerId: string | number) => {
  loadingReplies.value.add(answerId);
  try {
    const response = await listReplies(answerId, { pageNum: 1, pageSize: 100 });
    if (response?.code === 200) {
      const replies = response.rows || [];
      answerReplies.value[answerId] = replies;
      // 更新实际回复数量
      actualReplyCounts.value[answerId] = replies.length;
    }
  } catch (error) {
    console.error('加载回复错误:', error);
  } finally {
    loadingReplies.value.delete(answerId);
  }
};

/**
 * 删除问题
 */
const handleDeleteQuestion = async (question: Question) => {
  try {
    await proxy?.$modal.confirm(`确定要删除问题"${question.title}"吗？此操作将同时删除该问题下的所有回答和回复！`);
    await deleteQuestions(question.questionId);
    proxy?.$modal.msgSuccess('删除成功');
    await getQuestionList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除问题错误:', error);
    }
  }
};

/**
 * 删除回答
 */
const handleDeleteAnswer = async (answer: Answer) => {
  try {
    await proxy?.$modal.confirm('确定要删除这条回答吗？此操作将同时删除该回答下的所有回复！');
    await deleteAnswers(answer.answerId);
    proxy?.$modal.msgSuccess('删除成功');

    // 重新加载回答列表
    await loadAnswers(answer.questionId);

    // 更新问题的回答数
    const question = questionList.value.find((q) => q.questionId === answer.questionId);
    if (question && question.answerCount > 0) {
      question.answerCount--;
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除回答错误:', error);
    }
  }
};

/**
 * 删除回复
 */
const handleDeleteReply = async (reply: Reply) => {
  try {
    await proxy?.$modal.confirm('确定要删除这条回复吗？');
    await deleteReplies(reply.replyId);
    proxy?.$modal.msgSuccess('删除成功');

    // 重新加载回复列表（会自动更新回复数）
    await loadReplies(reply.answerId);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除回复错误:', error);
    }
  }
};

/**
 * 格式化时间
 */
const formatTime = (dateStr: string): string => {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < 7 * day) {
    return Math.floor(diff / day) + '天前';
  } else {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

// 初始化
onMounted(() => {
  loadUserAvatar();
  getQuestionList();
});
</script>

<style scoped lang="scss">
.qa-community-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);

  .page-header {
    text-align: center;
    margin-bottom: 40px;
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
    margin-bottom: 20px;
    border-radius: 8px;
    min-height: 400px;

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .question-list {
    .question-item {
      padding: 24px;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #fafafa;
      }
    }
  }

  .question-header,
  .answer-header,
  .reply-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: bold;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .username {
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }

      .time {
        font-size: 12px;
        color: #999;
      }

      .reply-to {
        font-size: 12px;
        color: #666;

        strong {
          color: #667eea;
        }
      }
    }
  }

  .question-actions,
  .answer-actions {
    display: flex;
    gap: 8px;
  }

  .question-content {
    padding-left: 52px;

    .question-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0 0 12px 0;
      line-height: 1.5;
    }

    .question-text {
      font-size: 14px;
      color: #666;
      line-height: 1.8;
      margin-bottom: 16px;
      white-space: pre-wrap;
    }

    .question-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #999;

        .el-icon {
          font-size: 14px;
        }
      }
    }
  }

  .answers-section {
    margin-top: 16px;
    padding-left: 52px;

    .answer-list {
      .answer-item {
        padding: 16px;
        background: #fafbfc;
        border-radius: 8px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .loading-answers {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 20px;
      color: #999;
      font-size: 14px;
    }

    .empty-answers {
      padding: 20px;
    }
  }

  .answer-content {
    padding-left: 44px;

    p {
      font-size: 14px;
      color: #666;
      line-height: 1.8;
      margin: 0 0 12px 0;
      white-space: pre-wrap;
    }

    .answer-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #999;
      }
    }
  }

  .replies-section {
    margin-top: 12px;
    padding-left: 44px;

    .reply-list {
      .reply-item {
        padding: 12px;
        background: white;
        border-radius: 6px;
        margin-bottom: 8px;
        border-left: 3px solid #e0e0e0;

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          border-left-color: #667eea;
          background: #f9f9f9;
        }
      }
    }

    .loading-replies {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      color: #999;
      font-size: 13px;
    }

    .empty-replies {
      padding: 16px;
    }
  }

  .reply-content {
    padding-left: 40px;

    p {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
      margin: 0;
      white-space: pre-wrap;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    :deep(.el-pagination) {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}

:deep(.el-divider) {
  margin: 16px 0;
}

:deep(.el-empty) {
  padding: 40px 0;
}
</style>
