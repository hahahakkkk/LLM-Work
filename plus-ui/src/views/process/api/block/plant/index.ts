import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PlantVO, PlantForm, PlantQuery } from '@/views/process/api/block/plant/types';

/**
 * 查询播种溯源列表
 * @param query
 * @returns {*}
 */

export const listPlant = (query?: PlantQuery): AxiosPromise<PlantVO[]> => {
  return request({
    url: '/block/plant/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询播种溯源详细
 * @param traceCode
 */
export const getPlant = (traceCode: string | number): AxiosPromise<PlantVO> => {
  return request({
    url: '/block/plant/' + traceCode,
    method: 'get'
  });
};

/**
 * 新增播种溯源
 * @param data
 */
export const addPlant = (data: PlantForm) => {
  return request({
    url: '/block/plant',
    method: 'post',
    data: data
  });
};

/**
 * 修改播种溯源
 * @param data
 */
export const updatePlant = (data: PlantForm) => {
  return request({
    url: '/block/plant',
    method: 'put',
    data: data
  });
};

/**
 * 删除播种溯源
 * @param traceCode
 */
export const delPlant = (traceCode: string | number | Array<string | number>) => {
  return request({
    url: '/block/plant/' + traceCode,
    method: 'delete'
  });
};
