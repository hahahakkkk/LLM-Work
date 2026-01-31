import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { StatisticsVO, StatisticsForm, StatisticsQuery } from '@/api/disaster/statistics/types';

/**
 * 查询灾害统计分析（按月）列表
 * @param query
 * @returns {*}
 */

export const listStatistics = (query?: StatisticsQuery): AxiosPromise<StatisticsVO[]> => {
  return request({
    url: '/disaster/statistics/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询灾害统计分析（按月）详细
 * @param id
 */
export const getStatistics = (id: string | number): AxiosPromise<StatisticsVO> => {
  return request({
    url: '/disaster/statistics/' + id,
    method: 'get'
  });
};

/**
 * 新增灾害统计分析（按月）
 * @param data
 */
export const addStatistics = (data: StatisticsForm) => {
  return request({
    url: '/disaster/statistics',
    method: 'post',
    data: data
  });
};

/**
 * 修改灾害统计分析（按月）
 * @param data
 */
export const updateStatistics = (data: StatisticsForm) => {
  return request({
    url: '/disaster/statistics',
    method: 'put',
    data: data
  });
};

/**
 * 删除灾害统计分析（按月）
 * @param id
 */
export const delStatistics = (id: string | number | Array<string | number>) => {
  return request({
    url: '/disaster/statistics/' + id,
    method: 'delete'
  });
};
