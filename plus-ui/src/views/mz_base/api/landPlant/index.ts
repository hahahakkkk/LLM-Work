import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LandPlantVO, LandPlantForm, LandPlantQuery } from './types';

/**
 * 查询地块种植列表
 * @param query
 * @returns {*}
 */

export const listLandPlant = (query?: LandPlantQuery): AxiosPromise<LandPlantVO[]> => {
  return request({
    url: '/mz-base/landPlant/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询地块种植详细
 * @param plantId
 */
export const getLandPlant = (plantId: string | number): AxiosPromise<LandPlantVO> => {
  return request({
    url: '/mz-base/landPlant/' + plantId,
    method: 'get'
  });
};

/**
 * 新增地块种植
 * @param data
 */
export const addLandPlant = (data: LandPlantForm) => {
  return request({
    url: '/mz-base/landPlant',
    method: 'post',
    data: data
  });
};

/**
 * 修改地块种植
 * @param data
 */
export const updateLandPlant = (data: LandPlantForm) => {
  return request({
    url: '/mz-base/landPlant',
    method: 'put',
    data: data
  });
};

/**
 * 删除地块种植
 * @param plantId
 */
export const delLandPlant = (plantId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/landPlant/' + plantId,
    method: 'delete'
  });
};
