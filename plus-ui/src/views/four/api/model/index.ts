import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ModelVO, ModelForm, ModelQuery } from './types';

/**
 * 查询智能决策模型列表
 * @param query
 * @returns {*}
 */

export const listModel = (query?: ModelQuery): AxiosPromise<ModelVO[]> => {
  return request({
    url: '/four/model/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询智能决策模型详细
 * @param modelId
 */
export const getModel = (modelId: string | number): AxiosPromise<ModelVO> => {
  return request({
    url: '/four/model/' + modelId,
    method: 'get'
  });
};

/**
 * 新增智能决策模型
 * @param data
 */
export const addModel = (data: ModelForm) => {
  return request({
    url: '/four/model',
    method: 'post',
    data: data
  });
};

/**
 * 修改智能决策模型
 * @param data
 */
export const updateModel = (data: ModelForm) => {
  return request({
    url: '/four/model',
    method: 'put',
    data: data
  });
};

/**
 * 删除智能决策模型
 * @param modelId
 */
export const delModel = (modelId: string | number | Array<string | number>) => {
  return request({
    url: '/four/model/' + modelId,
    method: 'delete'
  });
};
