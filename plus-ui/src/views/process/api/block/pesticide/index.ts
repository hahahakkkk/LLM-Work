import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PesticideVO, PesticideForm, PesticideQuery } from '@/views/process/api/block/pesticide/types';

/**
 * 查询打药溯源列表
 * @param query
 * @returns {*}
 */

export const listPesticide = (query?: PesticideQuery): AxiosPromise<PesticideVO[]> => {
  return request({
    url: '/block/pesticide/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询打药溯源详细
 * @param id
 */
export const getPesticide = (id: string | number): AxiosPromise<PesticideVO> => {
  return request({
    url: '/block/pesticide/' + id,
    method: 'get'
  });
};

/**
 * 新增打药溯源
 * @param data
 */
export const addPesticide = (data: PesticideForm) => {
  return request({
    url: '/block/pesticide',
    method: 'post',
    data: data
  });
};

/**
 * 修改打药溯源
 * @param data
 */
export const updatePesticide = (data: PesticideForm) => {
  return request({
    url: '/block/pesticide',
    method: 'put',
    data: data
  });
};

/**
 * 删除打药溯源
 * @param id
 */
export const delPesticide = (id: string | number | Array<string | number>) => {
  return request({
    url: '/block/pesticide/' + id,
    method: 'delete'
  });
};
