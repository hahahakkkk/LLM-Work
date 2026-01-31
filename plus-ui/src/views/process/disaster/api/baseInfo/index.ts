import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BaseInfoVO, BaseInfoForm, BaseInfoQuery } from './types';

/**
 * 查询基地信息列表
 * @param query
 * @returns {*}
 */

export const listBaseInfo = (query?: BaseInfoQuery): AxiosPromise<BaseInfoVO[]> => {
  return request({
    url: '/powland/baseInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询基地信息详细
 * @param baseId
 */
export const getBaseInfo = (baseId: string | number): AxiosPromise<BaseInfoVO> => {
  return request({
    url: '/powland/baseInfo/' + baseId,
    method: 'get'
  });
};

/**
 * 新增基地信息
 * @param data
 */
export const addBaseInfo = (data: BaseInfoForm) => {
  return request({
    url: '/powland/baseInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改基地信息
 * @param data
 */
export const updateBaseInfo = (data: BaseInfoForm) => {
  return request({
    url: '/powland/baseInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除基地信息
 * @param baseId
 */
export const delBaseInfo = (baseId: string | number | Array<string | number>) => {
  return request({
    url: '/powland/baseInfo/' + baseId,
    method: 'delete'
  });
};
