import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SowHarvestVO, SowHarvestForm, SowHarvestQuery } from './types';

/**
 * 查询播种与收割列表
 * @param query
 * @returns {*}
 */

export const listSowHarvest = (query?: SowHarvestQuery): AxiosPromise<SowHarvestVO[]> => {
  return request({
    url: '/mz-base/sowHarvest/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询播种与收割详细
 * @param shId
 */
export const getSowHarvest = (shId: string | number): AxiosPromise<SowHarvestVO> => {
  return request({
    url: '/mz-base/sowHarvest/' + shId,
    method: 'get'
  });
};

/**
 * 新增播种与收割
 * @param data
 */
export const addSowHarvest = (data: SowHarvestForm) => {
  return request({
    url: '/mz-base/sowHarvest',
    method: 'post',
    data: data
  });
};

/**
 * 修改播种与收割
 * @param data
 */
export const updateSowHarvest = (data: SowHarvestForm) => {
  return request({
    url: '/mz-base/sowHarvest',
    method: 'put',
    data: data
  });
};

/**
 * 删除播种与收割
 * @param shId
 */
export const delSowHarvest = (shId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/sowHarvest/' + shId,
    method: 'delete'
  });
};
