import request from '@/utils/request';
import { AxiosPromise } from 'axios';

import { TableDict } from './types';

/**
 * 基地
 */
export const baseDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/powland/tableDict/base',
    method: 'get',
    params: query
  });
};
