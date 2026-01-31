import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 视频资源信息
export interface VideoVO {
  ossId: string;
  fileName: string;
  fileSize: number;
  originalName: string;
  fileSuffix: string;
  url: string;
  createTime: string;
  createBy: number;
  createByName: string;
  service: string;
  knowledgeType: string;
}

// 视频列表查询参数
export interface VideoQuery {
  pageNum?: number;
  pageSize?: number;
  knowledgeType?: string;
  [key: string]: any;
}

// 视频列表响应
export interface VideoListResponse {
  total: number;
  rows: VideoVO[];
  code: number;
  msg: string;
}

/**
 * 获取知识库OSS列表
 * @param query 查询参数
 * @returns
 */
export function getOssList(query?: VideoQuery): AxiosPromise<any> {
  return request({
    url: '/four/oss/list',
    method: 'get',
    params: query
  });
}
