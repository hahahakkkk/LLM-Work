// 导入项目统一的请求工具（已内置token处理）
import request from '@/utils/request';

/**
 * 后端响应数据格式接口（对应 R<String>）
 */
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 流式请求回调参数类型
 */
export interface StreamChatCallbacks {
  onContent: (content: string) => void; // 接收内容片段
  onError: (errorMsg: string) => void; // 接收错误信息
  onComplete: () => void; // 接收完成通知
}

/**
 * 阻塞式（同步）请求 - 一次性获取完整回复（使用项目统一request工具，自动携带token）
 * @param reportContent 报告内容/问题
 * @param userId 用户唯一标识（可选）
 * @returns Promise<ApiResponse<string>>
 */
export const getDifyChat = async (reportContent: string, userId?: string): Promise<ApiResponse<string>> => {
  try {
    // 构造请求参数（与后端@RequestParam对应）
    const params = {
      reportContent,
      userId // 可选参数，后端会处理默认值
    };

    // 调用项目统一request工具（自动携带token，无需手动配置请求头）
    // URL前缀与其他接口保持一致：/block/trace/sync
    const response = await request<ApiResponse<string>>({
      url: '/block/trace/sync',
      method: 'post',
      params, // 对应后端@RequestParam，request工具会自动处理为表单格式
      timeout: 60000 // 阻塞式请求超时时间（60秒）
    });

    return response;
  } catch (error: any) {
    // 统一异常处理（沿用request工具的异常格式）
    const errorMsg = error.msg || error.message || '阻塞式请求失败，请稍后重试';
    return {
      code: 500,
      msg: errorMsg,
      data: ''
    };
  }
};

/**
 * 流式（SSE）请求 - 实时获取回复片段（EventSource不支持请求头，拼接token到URL）
 * @param reportContent 报告内容/问题
 * @param userId 用户唯一标识（可选）
 * @param onContent 内容片段回调
 * @param onError 错误回调
 * @param onComplete 完成回调
 * @returns 包含close方法的连接对象（用于关闭SSE连接）
 */
export const getDifyStreamChat = (
  reportContent: string,
  userId?: string,
  onContent: (content: string) => void,
  onError: (errorMsg: string) => void,
  onComplete: () => void
): { close: () => void } => {
  // 1. 从request工具的默认配置中提取baseURL（若有），或直接使用项目统一前缀
  const baseURL = import.meta.env.VITE_APP_BASE_API || '';

  // 2. 构造请求参数（URL编码，避免特殊字符问题）
  const encodedContent = encodeURIComponent(reportContent);
  let requestUrl = `${baseURL}/block/trace/stream?reportContent=${encodedContent}`;

  // 补充userId参数
  if (userId && userId.trim()) {
    const encodedUserId = encodeURIComponent(userId);
    requestUrl += `&userId=${encodedUserId}`;
  }

  // 3. 核心：提取token并拼接在URL上（解决EventSource无法携带请求头token的问题）
  // 项目的request工具已内置token存储（一般在localStorage/cookie），直接获取
  const token = localStorage.getItem('token') || localStorage.getItem('Admin-Token') || '';
  if (token) {
    const encodedToken = encodeURIComponent(token);
    requestUrl += `&token=${encodedToken}`; // 后端需支持从URL参数获取token
  }

  // 4. 创建EventSource（SSE连接），开启withCredentials支持跨域携带cookie
  const eventSource = new EventSource(requestUrl, { withCredentials: true });

  // 5. 监听后端定义的SSE事件（与后端接口保持一致）
  // 监听正常内容片段（event: content）
  eventSource.addEventListener('content', (event) => {
    if (event.data && typeof onContent === 'function') {
      onContent(event.data);
    }
  });

  // 监听生成完成（event: complete）
  eventSource.addEventListener('complete', () => {
    if (typeof onComplete === 'function') {
      onComplete();
    }
    // 完成后自动关闭SSE连接
    eventSource.close();
  });

  // 监听错误信息（event: error）
  eventSource.addEventListener('error', (event: MessageEvent | Event) => {
    let errorMsg = '流式请求异常，请稍后重试';
    if ((event as MessageEvent).data) {
      errorMsg = (event as MessageEvent).data;
    } else if (event instanceof Event && event.type === 'error') {
      if (eventSource.readyState === EventSource.CLOSED) {
        errorMsg = '流式连接已关闭';
      } else {
        errorMsg = '网络异常，无法建立流式连接';
      }
    }

    if (typeof onError === 'function') {
      onError(errorMsg);
    }

    // 错误后关闭SSE连接
    eventSource.close();
  });

  // 6. 返回关闭连接的方法（供前端手动清理）
  return {
    close: () => {
      eventSource.close();
    }
  };
};

/**
 * 保留原有方法名兼容（无需修改前端调用逻辑）
 */
export const getDifyHybridChat = getDifyChat;
