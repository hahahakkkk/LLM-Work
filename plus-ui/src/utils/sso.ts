import { getToken, setToken } from '@/utils/auth';
import useUserStore from '@/store/modules/user';
import request from '@/utils/request';

/**
 * 从URL中提取查询参数
 * @param url 完整的URL
 * @param param 要提取的参数名
 * @returns 参数值或null
 */
const getQueryParam = (url: string, param: string): string | null => {
  // 查找问号位置
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return null;

  // 提取查询字符串
  const queryString = url.substring(queryStart + 1);

  // 分割参数
  const params = queryString.split('&');

  // 查找目标参数
  for (const p of params) {
    const [key, value] = p.split('=');
    if (key === param) {
      return decodeURIComponent(value || '');
    }
  }

  return null;
};

/**
 * 从URL中移除指定参数
 * @param url 完整的URL
 * @param param 要移除的参数名
 * @returns 清理后的URL
 */
const removeQueryParam = (url: string, param: string): string => {
  // 查找问号位置
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return url;

  // 提取路径和查询字符串
  const path = url.substring(0, queryStart);
  const queryString = url.substring(queryStart + 1);

  // 分割参数并过滤掉目标参数
  const params = queryString.split('&').filter((p) => {
    const [key] = p.split('=');
    return key !== param;
  });

  // 重新构建URL
  return params.length > 0 ? `${path}?${params.join('&')}` : path;
};

/**
 * 验证URL中的token并处理登录流程
 * @param fullPath 当前完整路径（包含可能的token参数）
 * @returns 验证成功返回true，失败返回false
 */
export const verifyAndHandleSSOToken = async (fullPath: string): Promise<boolean> => {
  // 从URL中提取token
  const urlToken = getQueryParam(fullPath, 'token');
  console.log('urlToken', urlToken);

  // 如果已经有token或者没有URL token，则跳过处理
  if (!urlToken || getToken()) {
    return false;
  }

  try {
    // 使用系统的request方法调用token验证接口
    const verificationResponse = await request({
      url: `/auth/platform/verifyToken?token=${encodeURIComponent(urlToken)}`,
      headers: {
        isToken: false // 不携带现有token
      },
      method: 'get'
    });

    console.log('SSO验证响应:', verificationResponse);

    // 解析响应数据
    let verificationData;
    try {
      // 如果data是字符串，先解析为JSON
      if (typeof verificationResponse.data === 'string') {
        verificationData = JSON.parse(verificationResponse.data);
      } else {
        verificationData = verificationResponse.data;
      }

      // 如果解析后的数据还有嵌套的data字段，继续解析
      if (typeof verificationData.data === 'string') {
        verificationData.data = JSON.parse(verificationData.data);
      }
    } catch (parseError) {
      console.error('解析验证响应数据失败:', parseError);
      return false;
    }

    // 检查验证结果 - 根据实际响应结构调整
    const resultCode = verificationData.Result || verificationData.result || verificationData.code;

    const userID = verificationData.Data?.UserID || verificationData.data?.UserID;

    if (resultCode == 0) {
      console.error('SSO token验证失败:', verificationData.Msg || verificationData.msg || '未知错误');
      return false;
    } else {
      console.log('SSO token验证成功，UserID:', userID);
      // pc端固定客户端授权id
      const clientId = import.meta.env.VITE_APP_CLIENT_ID;
      // 使用userID和token进行登录
      // 将 userID 传递给后端，或者也可以传递 urlToken 让后端再次验证
      const ssoLoginResponse = await request({
        url: '/auth/platform/ssoLogin',
        method: 'post',
        headers: {
          isToken: false,
          'Content-Type': 'application/json'
        },
        data: {
          clientId: clientId,
          userId: userID,
          token: urlToken,
          tenantId: '000000',
          grantType: 'sso'
        }
      });

      console.log('LoginIdResponse:', ssoLoginResponse);

      // UserID有效，存储token
      const systemToken = ssoLoginResponse.data.access_token;
      setToken(systemToken);

      // 获取用户完整信息
      const userStore = useUserStore();
      console.log('userStore', userStore);

      try {
        await userStore.getInfo();
        return true;
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 如果获取用户信息失败，清除token
        setToken('');
        return false;
      }
    }
  } catch (error) {
    console.error('SSO token验证过程失败:', error);
    return false;
  }
};

/**
 * 清理URL中的token参数
 * @param fullPath 当前完整路径
 * @returns 清理后的路径
 */
export const cleanTokenFromURL = (fullPath: string): string => {
  return removeQueryParam(fullPath, 'token');
};
