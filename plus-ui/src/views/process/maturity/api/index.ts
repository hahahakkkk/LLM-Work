import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { WeatherResponse } from './types';

/**
 * 查询最近七天的天气
 * @returns 天气数据
 */
export function queryWeather(): AxiosPromise<WeatherResponse> {
  return request({
    url: '/block/api/weather',
    method: 'get'
  });
}
