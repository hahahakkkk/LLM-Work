import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DiseasePestVO, DiseasePestForm, DiseasePestQuery } from './types';

/**
 * 查询基地病虫害历史数据列表
 * @param query
 * @returns {*}
 */

export const listDiseasePest = (query?: DiseasePestQuery): AxiosPromise<DiseasePestVO[]> => {
  return request({
    url: '/mz-base/diseasePest/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询基地病虫害历史数据详细
 * @param dpId
 */
export const getDiseasePest = (dpId: string | number): AxiosPromise<DiseasePestVO> => {
  return request({
    url: '/mz-base/diseasePest/' + dpId,
    method: 'get'
  });
};

/**
 * 新增基地病虫害历史数据
 * @param data
 */
export const addDiseasePest = (data: DiseasePestForm) => {
  return request({
    url: '/mz-base/diseasePest',
    method: 'post',
    data: data
  });
};

/**
 * 修改基地病虫害历史数据
 * @param data
 */
export const updateDiseasePest = (data: DiseasePestForm) => {
  return request({
    url: '/mz-base/diseasePest',
    method: 'put',
    data: data
  });
};

/**
 * 删除基地病虫害历史数据
 * @param dpId
 */
export const delDiseasePest = (dpId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/diseasePest/' + dpId,
    method: 'delete'
  });
};
