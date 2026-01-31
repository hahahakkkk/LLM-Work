import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FertilizationHistoryVO, FertilizationHistoryForm, FertilizationHistoryQuery } from './types';
import { id } from 'element-plus/es/locale/index.mjs';

/**
 * 查询配方施肥历史列表
 * @param query
 * @returns {*}
 */

export const listFertilization_history = (query?: FertilizationHistoryQuery): AxiosPromise<FertilizationHistoryVO[]> => {
  return request({
    url: '/mz-base/fertilizationHistory/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询配方施肥历史详细
 * @param fertilizationId
 */
export const getFertilization = (fertilizationId: string | number): AxiosPromise<FertilizationHistoryVO> => {
  return request({
    url: '/mz-base/fertilizationHistory/' + fertilizationId,
    method: 'get'
  });
};

/**
 * 新增配方施肥历史
 * @param data
 */
export const addFertilization_history = (data: FertilizationHistoryForm) => {
  return request({
    url: '/mz-base/fertilizationHistory',
    method: 'post',
    data: data
  });
};

/**
 * 修改配方施肥历史
 * @param data
 */
export const updateFertilization_history = (data: FertilizationHistoryForm) => {
  return request({
    url: '/mz-base/fertilizationHistory',
    method: 'put',
    data: data
  });
};

/**
 * 删除配方施肥历史
 * @param fertilizationId
 */
export const delFertilization_history = (fertilizationId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/fertilizationHistory/' + fertilizationId,
    method: 'delete'
  });
};

/**
 * 查看配方单
 * @param fertilizationId
 */
export const lookAtFertilization = (param: string) => {
  return request({
    url: '/mz-base/fertilizationHistory/pdf/' + param,
    method: 'get',
    responseType: 'arraybuffer',
  });
};
