import { AxiosPromise } from 'axios';
import request from '@/utils/request';
import { ClassifyVO } from './types';

export function list(): AxiosPromise<ClassifyVO> {
  return request({
    url: '/pestscience/classify/list',
    method: 'get'
  });
}
