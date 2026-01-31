import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ForecastVO, ForecastForm, ForecastQuery } from '@/api/process/maturity/forecast/types';

/**
 * 查询种植预测列表
 * @param query
 * @returns {*}
 */

export const listForecast = (query?: ForecastQuery): AxiosPromise<ForecastVO[]> => {
  return request({
    url: '/process/maturity/forecast/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询种植预测详细
 * @param id
 */
export const getForecast = (id: string | number): AxiosPromise<ForecastVO> => {
  return request({
    url: '/process/maturity/forecast/' + id,
    method: 'get'
  });
};

/**
 * 新增种植预测
 * @param data
 */
export const addForecast = (data: ForecastForm) => {
  return request({
    url: '/process/maturity/forecast',
    method: 'post',
    data: data
  });
};

/**
 * 修改种植预测
 * @param data
 */
export const updateForecast = (data: ForecastForm) => {
  return request({
    url: '/process/maturity/forecast',
    method: 'put',
    data: data
  });
};

/**
 * 删除种植预测
 * @param id
 */
export const delForecast = (id: string | number | Array<string | number>) => {
  return request({
    url: '/process/maturity/forecast/' + id,
    method: 'delete'
  });
};
