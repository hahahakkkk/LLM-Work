import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WafVO, WafForm, WafQuery } from './types';

/**
 * 查询水肥补给列表
 * @param query
 * @returns {*}
 */

export const listWaf = (query?: WafQuery): AxiosPromise<WafVO[]> => {
  return request({
    url: '/growth/waf/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询水肥补给详细
 * @param id
 */
export const getWaf = (id: string | number): AxiosPromise<WafVO> => {
  return request({
    url: '/growth/waf/' + id,
    method: 'get'
  });
};

/**
 * 新增水肥补给
 * @param data
 */
export const addWaf = (data: WafForm) => {
  return request({
    url: '/growth/waf',
    method: 'post',
    data: data
  });
};

/**
 * 修改水肥补给
 * @param data
 */
export const updateWaf = (data: WafForm) => {
  return request({
    url: '/growth/waf',
    method: 'put',
    data: data
  });
};

/**
 * 删除水肥补给
 * @param id
 */
export const delWaf = (id: string | number | Array<string | number>) => {
  return request({
    url: '/growth/waf/' + id,
    method: 'delete'
  });
};
