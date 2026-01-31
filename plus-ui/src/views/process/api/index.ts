import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ModelVO } from './types';

export const getModelList = (params: { modelType: string }): AxiosPromise<ModelVO[]> => {
  return request({
    url: '/pestcontrol/identifyModel/list',
    method: 'get',
    params
  });
};
