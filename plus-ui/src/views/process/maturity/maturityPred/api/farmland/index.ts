import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FarmlandVO, FarmlandForm, FarmlandQuery } from './types';

/**
 * 查询成熟度列表
 * @param query
 * @returns {*}
 */

export const listFarmland = (query?: FarmlandQuery): AxiosPromise<FarmlandVO[]> => {
  return request({
    url: '/process/maturity/farmland/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询成熟度详细
 * @param farmlandId
 */
export const getFarmland = (farmlandId: string | number): AxiosPromise<FarmlandVO> => {
  return request({
    url: '/process/maturity/farmland/' + farmlandId,
    method: 'get'
  });
};

/**
 * 新增成熟度
 * @param data
 */
export const addFarmland = (data: FarmlandForm) => {
  return request({
    url: '/process/maturity/farmland',
    method: 'post',
    data: data
  });
};

/**
 * 修改成熟度
 * @param data
 */
export const updateFarmland = (data: FarmlandForm) => {
  return request({
    url: '/process/maturity/farmland',
    method: 'put',
    data: data
  });
};

/**
 * 删除成熟度
 * @param farmlandId
 */
export const delFarmland = (farmlandId: string | number | Array<string | number>) => {
  return request({
    url: '/process/maturity/farmland/' + farmlandId,
    method: 'delete'
  });
};
