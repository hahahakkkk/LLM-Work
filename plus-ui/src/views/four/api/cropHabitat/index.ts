import request from '../../../../utils/request';
import { AxiosPromise } from 'axios';
import { CropHabitatVO, CropHabitatForm, CropHabitatQuery } from './types';

/**
 * 查询作物生境监测数据列表
 * @param query
 * @returns {*}
 */

export const listCropHabitat = (query?: CropHabitatQuery): AxiosPromise<CropHabitatVO[]> => {
  return request({
    url: '/four/cropHabitat/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询作物生境监测数据详细
 * @param fourId
 */
export const getCropHabitat = (fourId: string | number): AxiosPromise<CropHabitatVO> => {
  return request({
    url: '/four/cropHabitat/' + fourId,
    method: 'get'
  });
};

/**
 * 新增作物生境监测数据
 * @param data
 */
export const addCropHabitat = (data: CropHabitatForm) => {
  return request({
    url: '/four/cropHabitat',
    method: 'post',
    data: data
  });
};

/**
 * 修改作物生境监测数据
 * @param data
 */
export const updateCropHabitat = (data: CropHabitatForm) => {
  return request({
    url: '/four/cropHabitat',
    method: 'put',
    data: data
  });
};

/**
 * 删除作物生境监测数据
 * @param fourId
 */
export const delCropHabitat = (fourId: string | number | Array<string | number>) => {
  return request({
    url: '/four/cropHabitat/' + fourId,
    method: 'delete'
  });
};
