import request from '@/utils/request';
import axios, { AxiosPromise } from 'axios';
import {
  BbiBaseVo,
  ErAverageInfo,
  ErHistoryRecord,
  ErSubmitQuery,
  ErSubmitResponse,
  ErTaskResult,
  ErTaskStatus,
  IdentifyErParams,
  IdentifyErResponse,
  LandUnitVo,
  RemoteSenseVo
} from './types';
import type { OssVO } from '@/views/four/api/oss/types';

export const fetchBases = (): AxiosPromise<BbiBaseVo[]> => {
  return request({
    url: '/powland/baseInfo/list',
    method: 'get'
  });
};

export const fetchFarmerLands = (params: { baseId: string }): AxiosPromise<LandUnitVo[]> => {
  return request({
    url: '/powland/landUnit/list',
    method: 'get',
    params
  });
};

export interface FetchRemoteSensesParams {
  baseId?: string;
  facilityId?: string;
  beginCollectTime?: string;
  endCollectTime?: string;
  pageNum?: number;
  pageSize?: number;
  useFor?: number;
}

export const fetchRemoteSenses = (params: FetchRemoteSensesParams): AxiosPromise<{ rows: RemoteSenseVo[]; total?: number }> => {
  return request({
    url: '/four/remoteSense/list',
    method: 'get',
    params
  });
};

// OSS: 根据 id 串获取文件信息
export const listByIds = (ossId: string | number): AxiosPromise<OssVO[]> => {
  return request({
    url: '/four/oss/listByIds/' + ossId,
    method: 'get'
  });
};

export const identifyEr = (params: IdentifyErParams): Promise<IdentifyErResponse> => {
  return request({
    url: '/pestcontrol/identify/er',
    method: 'post',
    params
  });
};

export const handleExportResult = async (): Promise<void> => {
  try {
    const response = await request({
      url: '/pestcontrol/report/EmergenceRatePdf',
      method: 'get',
      responseType: 'blob' // 告诉 axios 把响应当作二进制 blob 处理
    });

    const blob = response;
    // console.log("response.data",response)

    // 确保是 Blob 类型
    if (!(blob instanceof Blob)) {
      throw new Error('下载失败：响应数据不是有效的 Blob');
    }

    console.log('Blob 大小:', blob.size);
    if (blob.size === 0) {
      throw new Error('下载的文件为空，请检查后端数据');
    }

    // 创建下载链接
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'EmergenceRate.pdf';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理内存
    URL.revokeObjectURL(downloadUrl);

    ElMessage.success('报告下载成功');
  } catch (error: any) {
    console.error('下载失败:', error);

    if (error.message.includes('空')) {
      ElMessage.warning('下载的文件为空，请确认有数据可导出');
    } else {
      ElMessage.error(`下载失败: ${error.message}`);
    }
  }
};

/** 出苗率历史记录
 * 注意：由于响应拦截器返回 res.data，实际返回的是后端数据对象本身
 * 返回格式：{ code: 200, msg: "查询成功", rows: ErHistoryRecord[], total: number }
 */
export const fetchErHistoryRecords = (): Promise<any> => {
  return request({
    url: '/pestcontrol/emergenceHistory/list',
    method: 'get'
  });
};

/** 指定 id 获取出苗率历史记录详情 */
export const fetchErHistoryRecordById = (id: number): AxiosPromise<ErHistoryRecord> => {
  return request({
    url: `/pestcontrol/emergenceHistory/${id}`,
    method: 'get'
  });
};

/** 出苗率 pdf 报告 */
export const fetchErHistoryPdf = (id: number): AxiosPromise<Blob> => {
  return request({
    url: `/pestcontrol/emergenceHistory/Pdf/${id}`,
    method: 'get',
    responseType: 'blob'
  });
};

// 出苗率报告（参数生成，返回 PDF）
export interface ErReportRequest {
  baseId: string | number;
  plotId: string | number;
  baseName: string;
  plotName: string;
  inspectorUser: string;
  longitude: number;
  latitude: number;
  emergenceRate: number;
  totalSeedlings: number;
  plotArea: number;
  seedlingDensity: number;
  originImage: string;
  resultImage: string;
  createTime: string;
}

export const downloadErReport = (data: ErReportRequest): AxiosPromise<Blob> => {
  return request({
    url: '/pestcontrol/emergenceHistory/report',
    method: 'post',
    data,
    responseType: 'blob'
  });
};

/** 出苗率获取平均信息 */
export const fetchErAverageInfo = (): AxiosPromise<ErAverageInfo> => {
  return request({
    url: '/pestcontrol/emergenceHistory/avginfo',
    method: 'get'
  });
};

export const erSubmit = (query: ErSubmitQuery): AxiosPromise<ErSubmitResponse> => {
  return request({
    url: '/pestcontrol/identify/er/submit',
    method: 'post',
    data: query
  });
};

export const erQueryTaskStatus = (task_id: string): AxiosPromise<ErTaskStatus> => {
  return request({
    url: `/pestcontrol/identify/er/status/${task_id}`,
    method: 'get'
  });
};

export const erQueryTaskResult = (task_id: string): AxiosPromise<ErTaskResult> => {
  return request({
    url: `/pestcontrol/identify/er/result/${task_id}`,
    method: 'get'
  });
};
