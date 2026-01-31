import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AlertVO, AlertForm, AlertQuery } from './types';

/**
 * 查询水肥预警信息列表
 * @param query
 * @returns {*}
 */

export const listAlert = (query?: AlertQuery): AxiosPromise<AlertVO[]> => {
  const params = {
    ...query,
    isAsc: 'desc'
  };
  return request({
    url: '/process/growth/alert/list',
    method: 'get',
    params
  });
};

/**
 * 查询水肥预警信息详细
 * @param id
 */
export const getAlert = (id: string | number): AxiosPromise<AlertVO> => {
  return request({
    url: '/process/growth/alert/' + id,
    method: 'get'
  });
};

/**
 * 新增水肥预警信息
 * @param data
 */
export const addAlert = (data: AlertForm) => {
  return request({
    url: '/process/growth/alert',
    method: 'post',
    data: data
  });
};

/**
 * 修改水肥预警信息
 * @param data
 */
export const updateAlert = (data: AlertForm) => {
  return request({
    url: '/process/growth/alert',
    method: 'put',
    data: data
  });
};

/**
 * 删除水肥预警信息
 * @param id
 */
export const delAlert = (id: string | number | Array<string | number>) => {
  return request({
    url: '/process/growth/alert/' + id,
    method: 'delete'
  });
};
