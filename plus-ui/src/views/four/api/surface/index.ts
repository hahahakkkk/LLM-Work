import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SurfaceVO, SurfaceForm, SurfaceQuery } from './types';

/**
 * 查询地面采集数据列表
 * @param query
 * @returns {*}
 */

export const listSurface = (query?: SurfaceQuery): AxiosPromise<SurfaceVO[]> => {
  return request({
    url: '/four/surface/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询地面采集数据详细
 * @param fourId
 */
export const getSurface = (fourId: string | number): AxiosPromise<SurfaceVO> => {
  return request({
    url: '/four/surface/' + fourId,
    method: 'get'
  });
};

/**
 * 新增地面采集数据
 * @param data
 */
export const addSurface = (data: SurfaceForm) => {
  return request({
    url: '/four/surface',
    method: 'post',
    data: data
  });
};

/**
 * 修改地面采集数据
 * @param data
 */
export const updateSurface = (data: SurfaceForm) => {
  return request({
    url: '/four/surface',
    method: 'put',
    data: data
  });
};

/**
 * 删除地面采集数据
 * @param fourId
 */
export const delSurface = (fourId: string | number | Array<string | number>) => {
  return request({
    url: '/four/surface/' + fourId,
    method: 'delete'
  });
};
