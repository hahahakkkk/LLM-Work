import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FarmerVO, FarmerForm, FarmerQuery } from './types';

/**
 * 查询农户信息列表
 * @param query
 * @returns {*}
 */

export const listFarmer = (query?: FarmerQuery): AxiosPromise<FarmerVO[]> => {
  return request({
    url: '/powland/farmer/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询农户信息详细
 * @param farmerId
 */
export const getFarmer = (farmerId: string | number): AxiosPromise<FarmerVO> => {
  return request({
    url: '/powland/farmer/' + farmerId,
    method: 'get'
  });
};

/**
 * 新增农户信息
 * @param data
 */
export const addFarmer = (data: FarmerForm) => {
  return request({
    url: '/powland/farmer',
    method: 'post',
    data: data
  });
};

/**
 * 修改农户信息
 * @param data
 */
export const updateFarmer = (data: FarmerForm) => {
  return request({
    url: '/powland/farmer',
    method: 'put',
    data: data
  });
};

/**
 * 删除农户信息
 * @param farmerId
 */
export const delFarmer = (farmerId: string | number | Array<string | number>) => {
  return request({
    url: '/powland/farmer/' + farmerId,
    method: 'delete'
  });
};
