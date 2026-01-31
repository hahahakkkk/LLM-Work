import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LandLevelVO, LandLevelForm, LandLevelQuery } from './types';

/**
 * 查询地力等级列表
 * @param query
 * @returns {*}
 */

export const listLandLevel = (query?: LandLevelQuery): AxiosPromise<LandLevelVO[]> => {
  return request({
    url: '/mz-base/landLevel/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询地力等级详细
 * @param llId
 */
export const getLandLevel = (llId: string | number): AxiosPromise<LandLevelVO> => {
  return request({
    url: '/mz-base/landLevel/' + llId,
    method: 'get'
  });
};

/**
 * 新增地力等级
 * @param data
 */
export const addLandLevel = (data: LandLevelForm) => {
  return request({
    url: '/mz-base/landLevel',
    method: 'post',
    data: data
  });
};

/**
 * 修改地力等级
 * @param data
 */
export const updateLandLevel = (data: LandLevelForm) => {
  return request({
    url: '/mz-base/landLevel',
    method: 'put',
    data: data
  });
};

/**
 * 删除地力等级
 * @param llId
 */
export const delLandLevel = (llId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/landLevel/' + llId,
    method: 'delete'
  });
};

/**
 * 列表
 * @returns
 */
export const landLevelList = () => {
  return request({
    url: '/powland/landLevel',
    method: 'get'
  });
};

/**
 * 整体评价
 * @returns
 */
export const evaluateAll = () => {
  return request({
    url: '/powland/landLevel',
    method: 'put'
  });
};

/**
 * 单地块评价
 * @returns
 */
export const evaluateByLandId = (landId) => {
  return request({
    url: '/powland/landLevel',
    method: 'post',
    data: { landId: landId }
  });
};
