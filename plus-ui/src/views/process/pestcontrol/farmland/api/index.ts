import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  FarmlandVO,
  FarmlandForm,
  FarmlandQuery,
  AreaDetectionRecord,
  AreaDetectionQuery,
  PlantResultRecord,
  PlantResultQuery,
  BackPestInfo
} from './types';

/**
 * 查询区域信息列表
 * @param query
 * @returns {*}
 */

export const listFarmland = (query?: FarmlandQuery): AxiosPromise<FarmlandVO[]> => {
  return request({
    url: '/pestcontrol/farmland/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询区域信息详细
 * @param farmlandId
 */
export const getFarmland = (farmlandId: string | number): AxiosPromise<FarmlandVO> => {
  return request({
    url: '/pestcontrol/farmland/' + farmlandId,
    method: 'get'
  });
};

/**
 * 新增区域信息
 * @param data
 */
export const addFarmland = (data: FarmlandForm) => {
  return request({
    url: '/pestcontrol/farmland',
    method: 'post',
    data: data
  });
};

/**
 * 修改区域信息
 * @param data
 */
export const updateFarmland = (data: FarmlandForm) => {
  return request({
    url: '/pestcontrol/farmland',
    method: 'put',
    data: data
  });
};

/**
 * 删除区域信息
 * @param farmlandId
 */
export const delFarmland = (farmlandId: string | number | Array<string | number>) => {
  return request({
    url: '/pestcontrol/farmland/' + farmlandId,
    method: 'delete'
  });
};

/** 病害区域检测记录 */
export const listAreaDetectionRecords = (query?: AreaDetectionQuery): AxiosPromise<AreaDetectionRecord[]> => {
  return request({
    url: '/pestcontrol/areaDetection/list',
    method: 'get',
    params: query
  });
};

/**
 * 删除区域检测记录
 * @param id
 */
export const delAreaDetectionRecord = (id: string | number | Array<string | number>) => {
  return request({
    url: '/pestcontrol/areaDetection/' + id,
    method: 'delete'
  });
};

/**
 * 下载区域检测报告
 * @param id
 */
export const downloadAreaDetectionReport = (id: string | number) => {
  return request({
    url: '/pestcontrol/areaDetection/report/' + id,
    method: 'get',
    responseType: 'blob'
  });
};

/**
 * 下载植株尺度检测报告
 * @param id
 */
export const downloadPlantReport = (id: string | number) => {
  return request({
    url: `/pestcontrol/PlantResults/report/${id}`,
    method: 'get',
    responseType: 'blob'
  });
};

/**
 * 查询植株检测结果列表
 * @param query
 * @returns {*}
 */
export const listPlantResults = (query?: PlantResultQuery): AxiosPromise<PlantResultRecord[]> => {
  return request({
    url: '/pestcontrol/PlantResults/list',
    method: 'get',
    params: query
  });
};

/**
 * 删除植株检测记录
 * @param id
 */
export const delPlantResult = (id: string | number | Array<string | number>) => {
  return request({
    url: '/pestcontrol/PlantResults/' + id,
    method: 'delete'
  });
};

/**
 * 获取植株检测统计信息
 * @returns {*}
 */
export const getBackPestInfo = (): AxiosPromise<BackPestInfo> => {
  return request({
    url: '/pestcontrol/PlantResults/getBackPestInfo',
    method: 'get'
  });
};

/**
 * 新增植株检测结果
 * @param data
 */
export const addPlantResult = (data: any) => {
  return request({
    url: '/pestcontrol/PlantResults',
    method: 'post',
    data: data
  });
};
