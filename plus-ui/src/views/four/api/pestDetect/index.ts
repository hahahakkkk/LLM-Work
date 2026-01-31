import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PestDetectVO, PestDetectForm, PestDetectQuery } from './types';

/**
 * 查询智能虫情测报仪数据列表
 * @param query
 * @returns {*}
 */

export const listPestDetect = (query?: PestDetectQuery): AxiosPromise<PestDetectVO[]> => {
  return request({
    url: '/four/pestDetect/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询智能虫情测报仪数据详细
 * @param fourId
 */
export const getPestDetect = (fourId: string | number): AxiosPromise<PestDetectVO> => {
  return request({
    url: '/four/pestDetect/' + fourId,
    method: 'get'
  });
};

/**
 * 新增智能虫情测报仪数据
 * @param data
 */
export const addPestDetect = (data: PestDetectForm) => {
  return request({
    url: '/four/pestDetect',
    method: 'post',
    data: data
  });
};

/**
 * 修改智能虫情测报仪数据
 * @param data
 */
export const updatePestDetect = (data: PestDetectForm) => {
  return request({
    url: '/four/pestDetect',
    method: 'put',
    data: data
  });
};

/**
 * 删除智能虫情测报仪数据
 * @param fourId
 */
export const delPestDetect = (fourId: string | number | Array<string | number>) => {
  return request({
    url: '/four/pestDetect/' + fourId,
    method: 'delete'
  });
};
