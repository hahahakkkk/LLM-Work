import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FertilizerUseVO, FertilizerUseForm, FertilizerUseQuery } from './types';

/**
 * 查询肥料使用记录列表
 * @param query
 * @returns {*}
 */

export const listFertilizerUse = (query?: FertilizerUseQuery): AxiosPromise<FertilizerUseVO[]> => {
  return request({
    url: '/mz-base/fertilizerUse/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询肥料使用记录详细
 * @param useId
 */
export const getFertilizerUse = (useId2: string | number): AxiosPromise<FertilizerUseVO> => {
  return request({
    url: '/mz-base/fertilizerUse/' + useId2,
    method: 'get'
  });
};

/**
 * 新增肥料使用记录
 * @param data
 */
export const addFertilizerUse = (data: FertilizerUseForm) => {
  return request({
    url: '/mz-base/fertilizerUse',
    method: 'post',
    data: data
  });
};

/**
 * 修改肥料使用记录
 * @param data
 */
export const updateFertilizerUse = (data: FertilizerUseForm) => {
  return request({
    url: '/mz-base/fertilizerUse',
    method: 'put',
    data: data
  });
};

/**
 * 删除肥料使用记录
 * @param useId
 */
export const delFertilizerUse = (useId2: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/fertilizerUse/' + useId2,
    method: 'delete'
  });
};
