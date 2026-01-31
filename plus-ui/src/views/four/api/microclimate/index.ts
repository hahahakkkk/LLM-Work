import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MicroclimateVO, MicroclimateForm, MicroclimateQuery } from './types';

/**
 * 查询小气候气象数据列表
 * @param query
 * @returns {*}
 */

export const listMicroclimate = (query?: MicroclimateQuery): AxiosPromise<MicroclimateVO[]> => {
  return request({
    url: '/four/microclimate/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询小气候气象数据详细
 * @param fourId
 */
export const getMicroclimate = (fourId: string | number): AxiosPromise<MicroclimateVO> => {
  return request({
    url: '/four/microclimate/' + fourId,
    method: 'get'
  });
};

/**
 * 新增小气候气象数据
 * @param data
 */
export const addMicroclimate = (data: MicroclimateForm) => {
  return request({
    url: '/four/microclimate',
    method: 'post',
    data: data
  });
};

/**
 * 修改小气候气象数据
 * @param data
 */
export const updateMicroclimate = (data: MicroclimateForm) => {
  return request({
    url: '/four/microclimate',
    method: 'put',
    data: data
  });
};

/**
 * 删除小气候气象数据
 * @param fourId
 */
export const delMicroclimate = (fourId: string | number | Array<string | number>) => {
  return request({
    url: '/four/microclimate/' + fourId,
    method: 'delete'
  });
};
