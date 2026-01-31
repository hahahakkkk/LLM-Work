import request from '@/utils/request';
import { AxiosPromise } from 'axios';

import { TableDict } from './types';

/**
 * 农户
 */
export const farmerDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/powland/tableDict/farmer' + query,
    method: 'get',
    params: query
  });
};

/**
 * 基地
 */
export const baseDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/powland/tableDict/base' + query,
    method: 'get',
    params: query
  });
};
