import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SatelliteVO, SatelliteForm, SatelliteQuery } from './types';

// 模型预测请求参数类型
export interface ProcessNdviRequest {
  ndviUrl: string;
  periodName: string;
}

// 任务状态响应类型
export interface TaskStatusResponse {
  taskId: string;
  status: string;
  progress: number;
  result?: any;
}

/**
 * 查询卫星监测数据列表
 * @param query
 * @returns {*}
 */

export const listSatellite = (query?: SatelliteQuery): AxiosPromise<SatelliteVO[]> => {
  // 添加默认排序参数，按诊断时间倒序排列（最新的在前）
  const queryParams = {
    ...query,
    isAsc: 'false'
  };

  return request({
    url: '/process/growth/satellite/list',
    method: 'get',
    params: queryParams
  });
};
/**
 * 查询卫星监测数据详细
 * @param id
 */
export const getSatellite = (id: string | number): AxiosPromise<SatelliteVO> => {
  return request({
    url: '/process/growth/satellite/' + id,
    method: 'get'
  });
};

/**
 * 新增卫星监测数据
 * @param data
 */
export const addSatellite = (data: SatelliteForm) => {
  return request({
    url: '/process/growth/satellite',
    method: 'post',
    data: data
  });
};

/**
 * 修改卫星监测数据
 * @param data
 */
export const updateSatellite = (data: SatelliteForm) => {
  return request({
    url: '/process/growth/satellite',
    method: 'put',
    data: data
  });
};

/**
 * 删除卫星监测数据
 * @param id
 */
export const delSatellite = (id: string | number | Array<string | number>) => {
  return request({
    url: '/process/growth/satellite/' + id,
    method: 'delete'
  });
};

/**
 * 卫星NDVI处理API
 * @param data
 * @returns
 */
export const processNdvi = (data: ProcessNdviRequest) => {
  return request({
    url: '/process/growth/modelforward/growth-satellite/process_ndvi',
    method: 'post',
    data: data
  });
};

/**
 * 查询任务状态
 * @param taskId
 * @returns
 */
export const getTaskStatus = (taskId: string) => {
  return request({
    url: `/process/growth/modelforward/growth-satellite/task_status/${taskId}`,
    method: 'get'
  });
};

/**
 * 健康检查
 * @returns
 */
export const healthCheck = () => {
  return request({
    url: '/process/growth/modelforward/satellite-health',
    method: 'get'
  });
};
