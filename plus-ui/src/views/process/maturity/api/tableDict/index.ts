import request from '@/utils/request';
import { AxiosPromise } from 'axios';

import { TableDict } from './types';
/**
 * 基地
 */
export const baseDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/mz-base/tableDict/base',
    method: 'get',
    params: query
  });
};

/**
 * 地块
 */
export const landDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/mz-base/tableDict/land',
    method: 'get',
    params: query
  });
};
