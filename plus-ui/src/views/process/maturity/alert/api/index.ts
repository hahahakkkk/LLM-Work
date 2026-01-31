import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WafVO, WafForm, WafQuery } from './types';

/**
 * 查询谷子成熟预警信息记录列表
 * @param query
 * @returns {*}
 */

export const listWaf = (query?: WafQuery): AxiosPromise<WafVO[]> => {
  return request({
    url: '/process/maturity/waf/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询谷子成熟预警信息记录详细
 * @param id
 */
export const getWaf = (id: string | number): AxiosPromise<WafVO> => {
  return request({
    url: '/process/maturity/waf/' + id,
    method: 'get'
  });
};

/**
 * 新增谷子成熟预警信息记录
 * @param data
 */
export const addWaf = (data: WafForm) => {
  return request({
    url: '/process/maturity/waf',
    method: 'post',
    data: data
  });
};

/**
 * 修改谷子成熟预警信息记录
 * @param data
 */
export const updateWaf = (data: WafForm) => {
  return request({
    url: '/process/maturity/waf',
    method: 'put',
    data: data
  });
};

/**
 * 删除谷子成熟预警信息记录
 * @param id
 */
export const delWaf = (id: string | number | Array<string | number>) => {
  return request({
    url: '/process/maturity/waf/' + id,
    method: 'delete'
  });
};
