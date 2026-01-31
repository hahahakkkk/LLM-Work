import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DiagnosisVO, DiagnosisForm, DiagnosisQuery } from './types';

/**
 * 查询长势模型诊断结果列表
 * @param query
 * @returns {*}
 */

export const listDiagnosis = (query?: DiagnosisQuery): AxiosPromise<DiagnosisVO[]> => {
  return request({
    url: '/process/growth/diagnosis/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询长势模型诊断结果详细
 * @param id
 */
export const getDiagnosis = (id: string | number): AxiosPromise<DiagnosisVO> => {
  return request({
    url: '/process/growth/diagnosis/' + id,
    method: 'get'
  });
};

/**
 * 新增长势模型诊断结果
 * @param data
 */
export const addDiagnosis = (data: DiagnosisForm) => {
  return request({
    url: '/process/growth/diagnosis',
    method: 'post',
    data: data
  });
};

/**
 * 修改长势模型诊断结果
 * @param data
 */
export const updateDiagnosis = (data: DiagnosisForm) => {
  return request({
    url: '/process/growth/diagnosis',
    method: 'put',
    data: data
  });
};

/**
 * 删除长势模型诊断结果
 * @param id
 */
export const delDiagnosis = (id: string | number | Array<string | number>) => {
  return request({
    url: '/process/growth/diagnosis/' + id,
    method: 'delete'
  });
};
