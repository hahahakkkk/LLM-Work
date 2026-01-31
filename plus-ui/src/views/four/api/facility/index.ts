import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FacilityVO, FacilityForm, FacilityQuery } from './types';

/**
 * 查询四情监测设备列表
 * @param query
 * @returns {*}
 */

export const listFacility = (query?: FacilityQuery): AxiosPromise<FacilityVO[]> => {
  return request({
    url: '/four/facility/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询四情监测设备详细
 * @param fourId
 */
export const getFacility = (fourId: string | number): AxiosPromise<FacilityVO> => {
  return request({
    url: '/four/facility/' + fourId,
    method: 'get'
  });
};

/**
 * 新增四情监测设备
 * @param data
 */
export const addFacility = (data: FacilityForm) => {
  return request({
    url: '/four/facility',
    method: 'post',
    data: data
  });
};

/**
 * 修改四情监测设备
 * @param data
 */
export const updateFacility = (data: FacilityForm) => {
  return request({
    url: '/four/facility',
    method: 'put',
    data: data
  });
};

/**
 * 删除四情监测设备
 * @param fourId
 */
export const delFacility = (fourId: string | number | Array<string | number>) => {
  return request({
    url: '/four/facility/' + fourId,
    method: 'delete'
  });
};
