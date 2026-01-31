import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ChemicalUseVO, ChemicalUseForm, ChemicalUseQuery } from './types';

/**
 * 查询农药使用记录列表
 * @param query
 * @returns {*}
 */

export const listChemicalUse = (query?: ChemicalUseQuery): AxiosPromise<ChemicalUseVO[]> => {
  return request({
    url: '/mz-base/chemicalUse/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询农药使用记录详细
 * @param useId
 */
export const getChemicalUse = (useId2: string | number): AxiosPromise<ChemicalUseVO> => {
  return request({
    url: '/mz-base/chemicalUse/' + useId2,
    method: 'get'
  });
};

/**
 * 新增农药使用记录
 * @param data
 */
export const addChemicalUse = (data: ChemicalUseForm) => {
  return request({
    url: '/mz-base/chemicalUse',
    method: 'post',
    data: data
  });
};

/**
 * 修改农药使用记录
 * @param data
 */
export const updateChemicalUse = (data: ChemicalUseForm) => {
  return request({
    url: '/mz-base/chemicalUse',
    method: 'put',
    data: data
  });
};

/**
 * 删除农药使用记录
 * @param useId
 */
export const delChemicalUse = (useId2: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/chemicalUse/' + useId2,
    method: 'delete'
  });
};
