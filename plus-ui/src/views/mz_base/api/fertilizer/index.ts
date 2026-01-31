import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FertilizerVO, FertilizerForm, FertilizerQuery } from './types';

/**
 * 查询肥料基本信息列表
 * @param query
 * @returns {*}
 */

export const listFertilizer = (query?: FertilizerQuery): AxiosPromise<FertilizerVO[]> => {
  return request({
    url: '/mz-base/fertilizer/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询肥料基本信息详细
 * @param fertilizerId
 */
export const getFertilizer = (fertilizerId: string | number): AxiosPromise<FertilizerVO> => {
  return request({
    url: '/mz-base/fertilizer/' + fertilizerId,
    method: 'get'
  });
};

/**
 * 新增肥料基本信息
 * @param data
 */
export const addFertilizer = (data: FertilizerForm) => {
  return request({
    url: '/mz-base/fertilizer',
    method: 'post',
    data: data
  });
};

/**
 * 修改肥料基本信息
 * @param data
 */
export const updateFertilizer = (data: FertilizerForm) => {
  return request({
    url: '/mz-base/fertilizer',
    method: 'put',
    data: data
  });
};

/**
 * 删除肥料基本信息
 * @param fertilizerId
 */
export const delFertilizer = (fertilizerId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/fertilizer/' + fertilizerId,
    method: 'delete'
  });
};
