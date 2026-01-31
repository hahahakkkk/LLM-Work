import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DataVO, DataForm, DataQuery } from '@/api/ripeness/data/types';

/**
 * 查询成熟度检测（卫星）列表
 * @param query
 * @returns {*}
 */

export const listData = (query?: DataQuery): AxiosPromise<DataVO[]> => {
  return request({
    url: '/process/maturity/data/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询成熟度检测（卫星）详细
 * @param id
 */
export const getData = (id: string | number): AxiosPromise<DataVO> => {
  return request({
    url: '/process/maturity/data/' + id,
    method: 'get'
  });
};

/**
 * 新增成熟度检测（卫星）
 * @param data
 */
export const addData = (data: DataForm) => {
  return request({
    url: '/process/maturity/data',
    method: 'post',
    data: data
  });
};

/**
 * 修改成熟度检测（卫星）
 * @param data
 */
export const updateData = (data: DataForm) => {
  return request({
    url: '/process/maturity/data',
    method: 'put',
    data: data
  });
};

/**
 * 删除成熟度检测（卫星）
 * @param id
 */
export const delData = (id: string | number | Array<string | number>) => {
  return request({
    url: '/process/maturity/data/' + id,
    method: 'delete'
  });
};
