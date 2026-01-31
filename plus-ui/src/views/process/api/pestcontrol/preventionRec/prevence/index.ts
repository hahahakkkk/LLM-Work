import { AxiosPromise } from 'axios';
import request from '@/utils/request';
import { VideoVO } from './types';

export function list(): AxiosPromise<VideoVO> {
  return request({
    url: '/pestscience/prevence/list',
    method: 'get'
  });
}
