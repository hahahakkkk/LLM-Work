import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WeatherVO, WeatherForm, WeatherQuery } from './types';

/**
 * 查询气象历史数据列表
 * @param query
 * @returns {*}
 */

export const listWeather = (query?: WeatherQuery): AxiosPromise<WeatherVO[]> => {
  return request({
    url: '/mz-base/weather/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询气象历史数据详细
 * @param weatherId
 */
export const getWeather = (weatherId: string | number): AxiosPromise<WeatherVO> => {
  return request({
    url: '/mz-base/weather/' + weatherId,
    method: 'get'
  });
};

/**
 * 新增气象历史数据
 * @param data
 */
export const addWeather = (data: WeatherForm) => {
  return request({
    url: '/mz-base/weather',
    method: 'post',
    data: data
  });
};

/**
 * 修改气象历史数据
 * @param data
 */
export const updateWeather = (data: WeatherForm) => {
  return request({
    url: '/mz-base/weather',
    method: 'put',
    data: data
  });
};

/**
 * 删除气象历史数据
 * @param weatherId
 */
export const delWeather = (weatherId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/weather/' + weatherId,
    method: 'delete'
  });
};
