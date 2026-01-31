import request from '@/utils/request';
import { WarningData } from './types';
import { AxiosPromise } from 'axios';

export function fetchWarningSummary(): AxiosPromise<WarningData[]> {
  return request({
    url: '/pestcontrol/identify/warn',
    method: 'get'
  });
}
