import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { HarvestVO, HarvestForm, HarvestQuery } from '@/views/process/api/block/harvest/types';

/**
 * 查询收割溯源列表
 * @param query
 * @returns {*}
 */

export const listHarvest = (query?: HarvestQuery): AxiosPromise<HarvestVO[]> => {
  return request({
    url: '/block/harvest/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询收割溯源详细
 * @param traceCode
 */
export const getHarvest = (traceCode: string | number): AxiosPromise<HarvestVO> => {
  return request({
    url: '/block/harvest/' + traceCode,
    method: 'get'
  });
};

/**
 * 新增收割溯源
 * @param data
 */
export const addHarvest = (data: HarvestForm) => {
  return request({
    url: '/block/harvest',
    method: 'post',
    data: data
  });
};

/**
 * 修改收割溯源
 * @param data
 */
export const updateHarvest = (data: HarvestForm) => {
  return request({
    url: '/block/harvest',
    method: 'put',
    data: data
  });
};

/**
 * 删除收割溯源
 * @param traceCode
 */
export const delHarvest = (traceCode: string | number | Array<string | number>) => {
  return request({
    url: '/block/harvest/' + traceCode,
    method: 'delete'
  });
};
