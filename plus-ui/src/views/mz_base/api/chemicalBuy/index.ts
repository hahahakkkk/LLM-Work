import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ChemicalBuyVO, ChemicalBuyForm, ChemicalBuyQuery } from './types';

/**
 * 查询农药采购记录列表
 * @param query
 * @returns {*}
 */

export const listChemicalBuy = (query?: ChemicalBuyQuery): AxiosPromise<ChemicalBuyVO[]> => {
  return request({
    url: '/mz-base/chemicalBuy/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询农药采购记录详细
 * @param buyId
 */
export const getChemicalBuy = (buyId: string | number): AxiosPromise<ChemicalBuyVO> => {
  return request({
    url: '/mz-base/chemicalBuy/' + buyId,
    method: 'get'
  });
};

/**
 * 新增农药采购记录
 * @param data
 */
export const addChemicalBuy = (data: ChemicalBuyForm) => {
  return request({
    url: '/mz-base/chemicalBuy',
    method: 'post',
    data: data
  });
};

/**
 * 修改农药采购记录
 * @param data
 */
export const updateChemicalBuy = (data: ChemicalBuyForm) => {
  return request({
    url: '/mz-base/chemicalBuy',
    method: 'put',
    data: data
  });
};

/**
 * 删除农药采购记录
 * @param buyId
 */
export const delChemicalBuy = (buyId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/chemicalBuy/' + buyId,
    method: 'delete'
  });
};
