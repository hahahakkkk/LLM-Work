import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IndexVO, IndexForm, IndexQuery } from '@/api/disaster/index/types';

/**
 * 查询灾害预警指数信息列表
 * @param query
 * @returns {*}
 */

export const listIndex = (query?: IndexQuery): AxiosPromise<IndexVO[]> => {
  return request({
    url: '/disaster/index/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询灾害预警指数信息详细
 * @param id
 */
export const getIndex = (id: string | number): AxiosPromise<IndexVO> => {
  return request({
    url: '/disaster/index/' + id,
    method: 'get'
  });
};

/**
 * 新增灾害预警指数信息
 * @param data
 */
export const addIndex = (data: IndexForm) => {
  return request({
    url: '/disaster/index',
    method: 'post',
    data: data
  });
};

/**
 * 修改灾害预警指数信息
 * @param data
 */
export const updateIndex = (data: IndexForm) => {
  return request({
    url: '/disaster/index',
    method: 'put',
    data: data
  });
};

/**
 * 删除灾害预警指数信息
 * @param id
 */
export const delIndex = (id: string | number | Array<string | number>) => {
  return request({
    url: '/disaster/index/' + id,
    method: 'delete'
  });
};
