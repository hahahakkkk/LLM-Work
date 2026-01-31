import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OrganicFertilizerVO, OrganicFertilizerForm, OrganicFertilizerQuery } from './types';

/**
 * 查询有机肥基本信息列表
 * @param query
 * @returns {*}
 */

export const listOrganicFertilizer = (query?: OrganicFertilizerQuery): AxiosPromise<OrganicFertilizerVO[]> => {
  return request({
    url: '/mz-base/organicFertilizer/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询有机肥基本信息详细
 * @param ofId
 */
export const getOrganicFertilizer = (ofId: string | number): AxiosPromise<OrganicFertilizerVO> => {
  return request({
    url: '/mz-base/organicFertilizer/' + ofId,
    method: 'get'
  });
};

/**
 * 新增有机肥基本信息
 * @param data
 */
export const addOrganicFertilizer = (data: OrganicFertilizerForm) => {
  return request({
    url: '/mz-base/organicFertilizer',
    method: 'post',
    data: data
  });
};

/**
 * 修改有机肥基本信息
 * @param data
 */
export const updateOrganicFertilizer = (data: OrganicFertilizerForm) => {
  return request({
    url: '/mz-base/organicFertilizer',
    method: 'put',
    data: data
  });
};

/**
 * 删除有机肥基本信息
 * @param ofId
 */
export const delOrganicFertilizer = (ofId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/organicFertilizer/' + ofId,
    method: 'delete'
  });
};
