import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProductionVO, ProductionForm, ProductionQuery } from './types';

/**
 * 查询生产计划列表
 * @param query
 * @returns {*}
 */

export const listProduction = (query?: ProductionQuery): AxiosPromise<ProductionVO[]> => {
  return request({
    url: '/mz-base/production/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询生产计划详细
 * @param productionId
 */
export const getProduction = (productionId: string | number): AxiosPromise<ProductionVO> => {
  return request({
    url: '/mz-base/production/' + productionId,
    method: 'get'
  });
};

/**
 * 新增生产计划
 * @param data
 */
export const addProduction = (data: ProductionForm) => {
  return request({
    url: '/mz-base/production',
    method: 'post',
    data: data
  });
};

/**
 * 修改生产计划
 * @param data
 */
export const updateProduction = (data: ProductionForm) => {
  return request({
    url: '/mz-base/production',
    method: 'put',
    data: data
  });
};

/**
 * 删除生产计划
 * @param productionId
 */
export const delProduction = (productionId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/production/' + productionId,
    method: 'delete'
  });
};
