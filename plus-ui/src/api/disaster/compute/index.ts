import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

export interface ComputeListQuery {
  bucket: string;
  prefix: string;
}

export const listCompute = (query: ComputeListQuery): AxiosPromise<any> => {
  return request({
    url: '/disaster/api/compute/list',
    method: 'get',
    params: query
  });
};

export const uploadCompute = (data: FormData, config: Record<string, any> = {}): AxiosPromise<any> => {
  return request({
    url: '/disaster/api/compute/upload',
    method: 'post',
    data,
    ...config
  });
};
