import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LeafMeasureVO, LeafMeasureForm, LeafMeasureQuery } from './types';

/**
 * 查询手持叶面积测量仪数据列表
 * @param query
 * @returns {*}
 */

export const listLeafMeasure = (query?: LeafMeasureQuery): AxiosPromise<LeafMeasureVO[]> => {
  return request({
    url: '/four/leafMeasure/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询手持叶面积测量仪数据详细
 * @param fourId
 */
export const getLeafMeasure = (fourId: string | number): AxiosPromise<LeafMeasureVO> => {
  return request({
    url: '/four/leafMeasure/' + fourId,
    method: 'get'
  });
};

/**
 * 新增手持叶面积测量仪数据
 * @param data
 */
export const addLeafMeasure = (data: LeafMeasureForm) => {
  return request({
    url: '/four/leafMeasure',
    method: 'post',
    data: data
  });
};

/**
 * 修改手持叶面积测量仪数据
 * @param data
 */
export const updateLeafMeasure = (data: LeafMeasureForm) => {
  return request({
    url: '/four/leafMeasure',
    method: 'put',
    data: data
  });
};

/**
 * 删除手持叶面积测量仪数据
 * @param fourId
 */
export const delLeafMeasure = (fourId: string | number | Array<string | number>) => {
  return request({
    url: '/four/leafMeasure/' + fourId,
    method: 'delete'
  });
};
