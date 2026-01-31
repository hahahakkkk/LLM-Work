import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IdentifyModelVO, IdentifyModelForm, IdentifyModelQuery } from './types';

/**
 * 查询病虫害模型列表
 * @param query
 * @returns {*}
 */

export const listIdentifyModel = (query?: IdentifyModelQuery): AxiosPromise<IdentifyModelVO[]> => {
  return request({
    url: '/pestcontrol/identifyModel/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询病虫害模型详细
 * @param modelId
 */
export const getIdentifyModel = (modelId: string | number): AxiosPromise<IdentifyModelVO> => {
  return request({
    url: '/pestcontrol/identifyModel/' + modelId,
    method: 'get'
  });
};

/**
 * 新增病虫害模型
 * @param data
 */
export const addIdentifyModel = (data: IdentifyModelForm) => {
  return request({
    url: '/pestcontrol/identifyModel',
    method: 'post',
    data: data
  });
};

/**
 * 修改病虫害模型
 * @param data
 */
export const updateIdentifyModel = (data: IdentifyModelForm) => {
  return request({
    url: '/pestcontrol/identifyModel',
    method: 'put',
    data: data
  });
};

/**
 * 删除病虫害模型
 * @param modelId
 */
export const delIdentifyModel = (modelId: string | number | Array<string | number>) => {
  return request({
    url: '/pestcontrol/identifyModel/' + modelId,
    method: 'delete'
  });
};
