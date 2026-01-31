import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

// 识别任务提交请求参数
export interface IdentifySubmitRequest {
  rgbUrl: string;
  tifUrl: string;
  baseId: string | number;
  baseName: string;
  plotId: string | number;
  plotName: string;
}

// 识别任务提交响应
export interface IdentifySubmitResponse {
  taskId: string;
  message: string;
}

// 防治措施
export interface MeasureItem {
  化学防治?: string[];
  田间管理?: string[];
  抗病性管理?: string[];
}

// 任务结果数据
export interface TaskResultData {
  taskId: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  baseName: string;
  plotName: string;
  baseId?: string | number;
  plotId?: string | number;
  createTime: string;
  longitude: number;
  latitude: number;
  diseaseType?: string;
  incidence: number;
  conclusion: string;
  level: string;
  measure: MeasureItem;
  tifUrl?: string;
  rgbUrl?: string;
  resultImageUrl: string;
  originImageUrl: string;
  downloadUrl: string;
  error?: string | null;
}

// 任务状态查询响应
export interface TaskStatusResponse {
  code: number;
  msg: string;
  data: TaskResultData;
}

// 报告下载请求参数
export interface DownloadReportRequest {
  baseName: string;
  plotName: string;
  longitude: number;
  latitude: number;
  diseaseType: string;
  incidenceRate: number;
  rgbOriginalImage: string;
  tifOriginalImage: string;
  rgbResultImage: string;
  description: string;
  baseId: string | number;
  plotId: string | number;
}

// 提交识别任务
export function submitIdentifyTask(data: IdentifySubmitRequest): AxiosPromise<IdentifySubmitResponse> {
  return request({
    url: '/pestcontrol/identify/pestArea/submit',
    method: 'post',
    data
  });
}

// 查询任务状态
export function getTaskStatus(taskId: string): AxiosPromise<TaskResultData> {
  return request({
    url: `/pestcontrol/identify/pestArea/task/${taskId}`,
    method: 'get'
  });
}

// 下载病虫害区域检测报告
export function downloadAreaDetectionReport(data: DownloadReportRequest): AxiosPromise<Blob> {
  return request({
    url: '/pestcontrol/areaDetection/report',
    method: 'post',
    data,
    responseType: 'blob'
  });
}
