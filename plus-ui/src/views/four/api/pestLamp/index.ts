import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PestLampVO, PestLampForm, PestLampQuery } from './types';

/**
 * 查询杀虫灯数据列表
 * @param query
 * @returns {*}
 */

export const listPestLamp = (query?: PestLampQuery): AxiosPromise<PestLampVO[]> => {
  return request({
    url: '/four/pestLamp/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询杀虫灯数据详细
 * @param fourId
 */
export const getPestLamp = (fourId: string | number): AxiosPromise<PestLampVO> => {
  return request({
    url: '/four/pestLamp/' + fourId,
    method: 'get'
  });
};

/**
 * 新增杀虫灯数据
 * @param data
 */
export const addPestLamp = (data: PestLampForm) => {
  return request({
    url: '/four/pestLamp',
    method: 'post',
    data: data
  });
};

/**
 * 修改杀虫灯数据
 * @param data
 */
export const updatePestLamp = (data: PestLampForm) => {
  return request({
    url: '/four/pestLamp',
    method: 'put',
    data: data
  });
};

/**
 * 删除杀虫灯数据
 * @param fourId
 */
export const delPestLamp = (fourId: string | number | Array<string | number>) => {
  return request({
    url: '/four/pestLamp/' + fourId,
    method: 'delete'
  });
};
