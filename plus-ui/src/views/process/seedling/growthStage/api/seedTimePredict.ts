import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

/**
 * 播种期预测请求参数（前端使用）
 */
export interface SeedTimePredictRequest {
  // 品种名称
  variety: string;
  // 基地名称
  baseName: string;
  // 开始日期（格式：YYYY-MM-DD）
  startDate: string;
  // 结束日期（格式：YYYY-MM-DD）
  endDate: string;
}

/**
 * 后端接口请求格式（StDailyData 数组）
 */
interface StDailyData {
  date: string;
  temp: number;
  humidity: number;
  light: number;
  rainfall: number;
  sun_hours: number;
  soil_temp: number;
  soil_moisture: number;
  frost_warning: boolean;
}

/**
 * 后端返回的最佳窗口
 */
interface BestWindow {
  start: string;
  end: string;
  within_experience_range?: boolean;
  reason?: string;
  [key: string]: any;
}

/**
 * 播种期预测响应结果
 */
export interface SeedTimePredictResponse {
  // 最佳播种时间（格式：M月D日）
  bestSowingTime: string;
  // 预测图表URL（Blob URL）
  chartUrl: string;
  // 原始窗口数据
  bestWindow?: BestWindow;
}

/**
 * 播种期预测API（调用后端接口 /pestcontrol/identify/st）
 * @param data 预测请求参数
 * @returns 预测结果
 */
export const predictSowingTime = async (data: SeedTimePredictRequest): Promise<{ data: SeedTimePredictResponse }> => {
  try {
    // 准备请求参数（传品种、基地和日期范围，后端根据基地获取气象数据）
    // 后端期望接收数组，所以包装成数组格式
    const requestData = [
      {
        variety: data.variety,
        baseName: data.baseName,
        startDate: data.startDate,
        endDate: data.endDate
      }
    ];

    // 打印调试信息
    console.log('播种期预测请求数据:', requestData);

    // 调用后端接口（发送数组到请求体）
    const response: any = await request({
      url: '/pestcontrol/identify/st',
      method: 'post',
      data: requestData // 发送数组格式
    });

    // 解析响应数据（R<List<WhResult>> 格式）
    // response 的结构应该是 { code: 200, msg: 'success', data: [...] }
    const resultData = response.data || response;

    // 尝试从返回结果中提取播种期信息
    let bestWindow: any = null;
    let chartUrl = '';

    if (Array.isArray(resultData) && resultData.length > 0) {
      // 如果返回的是 WhResult 数组，尝试提取第一个结果
      const firstResult = resultData[0];
      chartUrl = firstResult.imageUrl || firstResult.image_url || '';

      // 尝试解析其他可能的字段
      if (firstResult.bestWindow || firstResult.best_window) {
        bestWindow = firstResult.bestWindow || firstResult.best_window;
      }
    }

    // 格式化最佳播种时间
    let bestSowingTime = '暂无推荐';
    if (bestWindow && bestWindow.start) {
      const startDate = new Date(bestWindow.start);
      const month = startDate.getMonth() + 1;
      const day = startDate.getDate();
      bestSowingTime = `${month}月${day}日`;

      if (bestWindow.end && bestWindow.end !== bestWindow.start) {
        const endDate = new Date(bestWindow.end);
        const endMonth = endDate.getMonth() + 1;
        const endDay = endDate.getDate();
        bestSowingTime += ` - ${endMonth}月${endDay}日`;
      }
    }

    // 打印返回数据用于调试
    console.log('播种期预测返回数据:', {
      resultData,
      bestWindow,
      chartUrl,
      bestSowingTime
    });

    return {
      data: {
        bestSowingTime,
        chartUrl,
        bestWindow
      }
    };
  } catch (error: any) {
    console.error('播种期预测API调用失败:', error);
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(error.response?.data?.msg || error.message || '预测失败');
  }
};

/**
 * 获取历史预测记录（可选，暂未实现）
 */
export interface HistoryRecord {
  id: number;
  variety: string;
  predictTime: string;
  bestSowingTime: string;
  chartUrl: string;
}

// 暂时注释掉，等后端实现该接口后再启用
// export const getPredictHistory = (): AxiosPromise<HistoryRecord[]> => {
//   return request({
//     url: '/pestcontrol/predict/history',
//     method: 'get'
//   });
// };
