import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ChangeAnalysisVO, ChangeAnalysisForm, ChangeAnalysisQuery } from './types';

/**
 * 查询土地变化分析列表
 * @param query
 * @returns {*}
 */

export const listChangeAnalysis = (query?: ChangeAnalysisQuery): AxiosPromise<ChangeAnalysisVO[]> => {
  return request({
    url: '/pestcontrol/changeAnalysis/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询土地变化分析详细
 * @param id
 */
export const getChangeAnalysis = (id: string | number): AxiosPromise<ChangeAnalysisVO> => {
  return request({
    url: '/pestcontrol/changeAnalysis/' + id,
    method: 'get'
  });
};

/**
 * 新增土地变化分析
 * @param data
 */
export const addChangeAnalysis = (data: ChangeAnalysisForm) => {
  return request({
    url: '/pestcontrol/changeAnalysis',
    method: 'post',
    data: data
  });
};

/**
 * 修改土地变化分析
 * @param data
 */
export const updateChangeAnalysis = (data: ChangeAnalysisForm) => {
  return request({
    url: '/pestcontrol/changeAnalysis',
    method: 'put',
    data: data
  });
};

/**
 * 删除土地变化分析
 * @param id
 */
export const delChangeAnalysis = (id: string | number | Array<string | number>) => {
  return request({
    url: '/pestcontrol/changeAnalysis/' + id,
    method: 'delete'
  });
};
