import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FertilizationVO, FertilizationForm, FertilizationQuery } from '@/views/process/api/block/fertilization/types';

/**
 * 查询施肥溯源列表
 * @param query
 * @returns {*}
 */

export const listFertilization = (query?: FertilizationQuery): AxiosPromise<FertilizationVO[]> => {
  return request({
    url: '/block/fertilization/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询施肥溯源详细
 * @param id
 */
export const getFertilization = (id: string | number): AxiosPromise<FertilizationVO> => {
  return request({
    url: '/block/fertilization/' + id,
    method: 'get'
  });
};

/**
 * 新增施肥溯源
 * @param data
 */
export const addFertilization = (data: FertilizationForm) => {
  return request({
    url: '/block/fertilization',
    method: 'post',
    data: data
  });
};

/**
 * 修改施肥溯源
 * @param data
 */
export const updateFertilization = (data: FertilizationForm) => {
  return request({
    url: '/block/fertilization',
    method: 'put',
    data: data
  });
};

/**
 * 删除施肥溯源
 * @param id
 */
export const delFertilization = (id: string | number | Array<string | number>) => {
  return request({
    url: '/block/fertilization/' + id,
    method: 'delete'
  });
};
