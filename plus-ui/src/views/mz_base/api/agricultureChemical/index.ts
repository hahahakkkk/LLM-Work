import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AgricultureChemicalVO, AgricultureChemicalForm, AgricultureChemicalQuery } from './types';

/**
 * 查询农药基本信息列表
 * @param query
 * @returns {*}
 */

export const listAgricultureChemical = (query?: AgricultureChemicalQuery): AxiosPromise<AgricultureChemicalVO[]> => {
  return request({
    url: '/mz-base/agricultureChemical/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询农药基本信息详细
 * @param chemicalId
 */
export const getAgricultureChemical = (chemicalId: string | number): AxiosPromise<AgricultureChemicalVO> => {
  return request({
    url: '/mz-base/agricultureChemical/' + chemicalId,
    method: 'get'
  });
};

/**
 * 新增农药基本信息
 * @param data
 */
export const addAgricultureChemical = (data: AgricultureChemicalForm) => {
  return request({
    url: '/mz-base/agricultureChemical',
    method: 'post',
    data: data
  });
};

/**
 * 修改农药基本信息
 * @param data
 */
export const updateAgricultureChemical = (data: AgricultureChemicalForm) => {
  return request({
    url: '/mz-base/agricultureChemical',
    method: 'put',
    data: data
  });
};

/**
 * 删除农药基本信息
 * @param chemicalId
 */
export const delAgricultureChemical = (chemicalId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/agricultureChemical/' + chemicalId,
    method: 'delete'
  });
};

