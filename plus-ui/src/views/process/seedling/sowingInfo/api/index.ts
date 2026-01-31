import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PredictVO, PredictForm, PredictQuery } from './types';

// ==================== 原有接口 ====================
/**
 * 获取播种信息接口
 * @param baseId 基地ID
 */
export function getSowingInfo(baseId: string) {
  return request({
    url: `/pestcontrol/sowingInfo/getSowingInfo?baseId=${baseId}`,
    method: 'post'
  });
}

// ==================== CRUD 接口 ====================

/**
 * 查询基地播种计划列表
 * @param query
 * @returns {*}
 */

export const listPredict = (query?: PredictQuery): AxiosPromise<PredictVO[]> => {
  return request({
    url: '/pestcontrol/predict/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询基地播种计划详细
 * @param id
 */
export const getPredict = (id: string | number): AxiosPromise<PredictVO> => {
  return request({
    url: '/pestcontrol/predict/' + id,
    method: 'get'
  });
};

/**
 * 新增基地播种计划
 * @param data
 */
export const addPredict = (data: PredictForm) => {
  return request({
    url: '/pestcontrol/predict',
    method: 'post',
    data: data
  });
};

/**
 * 修改基地播种计划
 * @param data
 */
export const updatePredict = (data: PredictForm) => {
  return request({
    url: '/pestcontrol/predict',
    method: 'put',
    data: data
  });
};

/**
 * 删除基地播种计划
 * @param id
 */
export const delPredict = (id: string | number | Array<string | number>) => {
  return request({
    url: '/pestcontrol/predict/' + id,
    method: 'delete'
  });
};
