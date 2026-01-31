import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProtectionVO, ProtectionForm, ProtectionQuery } from '@/api/disaster/protection/types';

/**
 * 查询灾情防护方案信息列表
 * @param query
 * @returns {*}
 */

export const listProtection = (query?: ProtectionQuery): AxiosPromise<ProtectionVO[]> => {
  return request({
    url: '/disaster/protection/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询灾情防护方案信息详细
 * @param id
 */
export const getProtection = (id: string | number): AxiosPromise<ProtectionVO> => {
  return request({
    url: '/disaster/protection/' + id,
    method: 'get'
  });
};

/**
 * 新增灾情防护方案信息
 * @param data
 */
export const addProtection = (data: ProtectionForm) => {
  return request({
    url: '/disaster/protection',
    method: 'post',
    data: data
  });
};

/**
 * 修改灾情防护方案信息
 * @param data
 */
export const updateProtection = (data: ProtectionForm) => {
  return request({
    url: '/disaster/protection',
    method: 'put',
    data: data
  });
};

/**
 * 删除灾情防护方案信息
 * @param id
 */
export const delProtection = (id: string | number | Array<string | number>) => {
  return request({
    url: '/disaster/protection/' + id,
    method: 'delete'
  });
};
