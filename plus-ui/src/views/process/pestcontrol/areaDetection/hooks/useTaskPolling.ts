import { getTaskStatus } from '../api/identify';
import type { TaskResultData } from '../api/identify';

export const useTaskPolling = () => {
  const taskPollingInterval = ref<NodeJS.Timeout | null>(null);
  const currentTask = ref<TaskResultData | null>(null);
  const isPolling = ref(false);

  const checkTaskStatus = async (taskId: string) => {
    try {
      const response = await getTaskStatus(taskId);
      if (response.data) {
        currentTask.value = response.data;

        // 如果任务完成或失败，停止轮询
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          stopPolling();

          // 通知用户任务状态
          if (response.data.status === 'completed') {
            ElMessage({
              message: '任务检测完成',
              type: 'success'
            });
          } else if (response.data.status === 'failed') {
            ElMessage({
              message: response.data.error || '任务检测失败',
              type: 'error'
            });
          }
        }
      }
    } catch (error) {
      console.error('Check task status error:', error);
      ElMessage({
        message: '查询任务状态失败',
        type: 'error'
      });
    }
  };

  const startPolling = (taskId: string, interval: number = 30000) => {
    if (!taskId) {
      console.warn('Task ID is required to start polling');
      return;
    }

    // 停止之前的轮询
    stopPolling();

    isPolling.value = true;

    // 立即检查一次
    checkTaskStatus(taskId);

    // 设置定时轮询
    taskPollingInterval.value = setInterval(() => {
      checkTaskStatus(taskId);
    }, interval);
  };

  const stopPolling = () => {
    if (taskPollingInterval.value) {
      clearInterval(taskPollingInterval.value);
      taskPollingInterval.value = null;
    }
    isPolling.value = false;
  };

  const resetTask = () => {
    stopPolling();
    currentTask.value = null;
  };

  // 组件卸载时清理
  onUnmounted(() => {
    stopPolling();
  });

  return {
    currentTask,
    isPolling,
    startPolling,
    stopPolling,
    resetTask
  };
};
