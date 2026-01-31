import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SatelliteVO, SatelliteForm, SatelliteQuery } from './types';

/**
 * 查询卫星遥感数据列表
 * @param query
 * @returns {*}
 */

export const listSatellite = (query?: SatelliteQuery): AxiosPromise<SatelliteVO[]> => {
  return request({
    url: '/four/satellite/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询卫星遥感数据详细
 * @param fourId
 */
export const getSatellite = (fourId: string | number): AxiosPromise<SatelliteVO> => {
  return request({
    url: '/four/satellite/' + fourId,
    method: 'get'
  });
};

/**
 * 新增卫星遥感数据
 * @param data
 */
export const addSatellite = (data: SatelliteForm) => {
  return request({
    url: '/four/satellite',
    method: 'post',
    data: data
  });
};

/**
 * 修改卫星遥感数据
 * @param data
 */
export const updateSatellite = (data: SatelliteForm) => {
  return request({
    url: '/four/satellite',
    method: 'put',
    data: data
  });
};

/**
 * 删除卫星遥感数据
 * @param fourId
 */
export const delSatellite = (fourId: string | number | Array<string | number>) => {
  return request({
    url: '/four/satellite/' + fourId,
    method: 'delete'
  });
};
