import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LandEvaluationVO, LandEvaluationForm, LandEvaluationQuery } from './types';

/**
 * 查询地力评价列表
 * @param query
 * @returns {*}
 */
export const listLandEvaluation = (query?: LandEvaluationQuery): AxiosPromise<LandEvaluationVO[]> => {
  return request({
    url: '/mz-base/landEvaluation/list',
    method: 'get',
    params: query
  });
};

/**
 * 修改地力评价
 * @param data
 */
export const updateLandEvaluation = (data: LandEvaluationForm) => {
  return request({
    url: '/mz-base/landEvaluation',
    method: 'put',
    data: data
  });
};

/**
 * 删除地力等级
 * @param llId
 */
export const delLandLevel = (llId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/landEvaluation/' + llId,
    method: 'delete'
  });
};
