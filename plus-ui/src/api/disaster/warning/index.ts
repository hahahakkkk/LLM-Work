import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WarningVO, WarningForm, WarningQuery } from '@/api/disaster/warning/types';

/**
 * 查询灾害预警信息列表
 * @param query
 * @returns {*}
 */

export const listWarning = (query?: WarningQuery): AxiosPromise<WarningVO[]> => {
  return request({
    url: '/disaster/warning/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询灾害预警信息详细
 * @param id
 */
export const getWarning = (id: string | number): AxiosPromise<WarningVO> => {
  return request({
    url: '/disaster/warning/' + id,
    method: 'get'
  });
};

/**
 * 新增灾害预警信息
 * @param data
 */
export const addWarning = (data: WarningForm) => {
  return request({
    url: '/disaster/warning',
    method: 'post',
    data: data
  });
};

/**
 * 修改灾害预警信息
 * @param data
 */
export const updateWarning = (data: WarningForm) => {
  return request({
    url: '/disaster/warning',
    method: 'put',
    data: data
  });
};

/**
 * 删除灾害预警信息
 * @param id
 */
export const delWarning = (id: string | number | Array<string | number>) => {
  return request({
    url: '/disaster/warning/' + id,
    method: 'delete'
  });
};
