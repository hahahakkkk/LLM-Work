import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FertilizerBuyVO, FertilizerBuyForm, FertilizerBuyQuery } from './types';

/**
 * 查询肥料采购记录列表
 * @param query
 * @returns {*}
 */

export const listFertilizerBuy = (query?: FertilizerBuyQuery): AxiosPromise<FertilizerBuyVO[]> => {
  return request({
    url: '/mz-base/fertilizerBuy/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询肥料采购记录详细
 * @param buyId
 */
export const getFertilizerBuy = (buyId: string | number): AxiosPromise<FertilizerBuyVO> => {
  return request({
    url: '/mz-base/fertilizerBuy/' + buyId,
    method: 'get'
  });
};

/**
 * 新增肥料采购记录
 * @param data
 */
export const addFertilizerBuy = (data: FertilizerBuyForm) => {
  return request({
    url: '/mz-base/fertilizerBuy',
    method: 'post',
    data: data
  });
};

/**
 * 修改肥料采购记录
 * @param data
 */
export const updateFertilizerBuy = (data: FertilizerBuyForm) => {
  return request({
    url: '/mz-base/fertilizerBuy',
    method: 'put',
    data: data
  });
};

/**
 * 删除肥料采购记录
 * @param buyId
 */
export const delFertilizerBuy = (buyId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/fertilizerBuy/' + buyId,
    method: 'delete'
  });
};
