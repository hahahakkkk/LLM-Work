import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { StatisticsVO, StatisticsForm, StatisticsQuery } from './types';

/**
 * 查询实测数据列表
 * @param query
 * @returns {*}
 */

export const listStatistics = (query?: StatisticsQuery): AxiosPromise<StatisticsVO[]> => {
  return request({
    url: '/process/growth/statistics/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询实测数据详细
 * @param id
 */
export const getStatistics = (id: string | number): AxiosPromise<StatisticsVO> => {
  return request({
    url: '/process/growth/statistics/' + id,
    method: 'get'
  });
};

/**
 * 新增实测数据
 * @param data
 */
export const addStatistics = (data: StatisticsForm) => {
  return request({
    url: '/process/growth/statistics',
    method: 'post',
    data: data
  });
};

/**
 * 修改实测数据
 * @param data
 */
export const updateStatistics = (data: StatisticsForm) => {
  return request({
    url: '/process/growth/statistics',
    method: 'put',
    data: data
  });
};

/**
 * 删除实测数据
 * @param id
 */
export const delStatistics = (id: string | number | Array<string | number>) => {
  return request({
    url: '/process/growth/statistics/' + id,
    method: 'delete'
  });
};

/**
 * 导出实测数据
 * @param query
 * @returns {*}
 */
export const exportStatistics = (query?: StatisticsQuery) => {
  return request({
    url: '/process/growth/statistics/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 下载导入模板
 * @returns {*}
 */
export const importTemplate = () => {
  return request({
    url: '/process/growth/statistics/importTemplate',
    method: 'get',
    responseType: 'blob'
  });
};
