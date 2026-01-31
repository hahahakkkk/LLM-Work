import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SupplyRecVO, SupplyRecForm, SupplyRecQuery } from './types';

/**
 * 查询补给列表
 * @param query
 * @returns {*}
 */

export const listSupplyRec = (query?: SupplyRecQuery): AxiosPromise<SupplyRecVO[]> => {
  return request({
    url: '/process/growth/supplyRec/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询补给详细
 * @param id
 */
export const getSupplyRec = (id: string | number): AxiosPromise<SupplyRecVO> => {
  return request({
    url: '/process/growth/supplyRec/' + id,
    method: 'get'
  });
};

/**
 * 新增补给
 * @param data
 */
export const addSupplyRec = (data: SupplyRecForm) => {
  return request({
    url: '/process/growth/supplyRec',
    method: 'post',
    data: data
  });
};

/**
 * 修改补给
 * @param data
 */
export const updateSupplyRec = (data: SupplyRecForm) => {
  return request({
    url: '/process/growth/supplyRec',
    method: 'put',
    data: data
  });
};

/**
 * 删除补给
 * @param id
 */
export const delSupplyRec = (id: string | number | Array<string | number>) => {
  return request({
    url: '/process/growth/supplyRec/' + id,
    method: 'delete'
  });
};
