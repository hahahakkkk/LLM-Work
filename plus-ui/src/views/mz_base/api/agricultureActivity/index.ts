import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AgricultureActivityVO, AgricultureActivityForm, AgricultureActivityQuery } from './types';

/**
 * 查询农艺活动列表
 * @param query
 * @returns {*}
 */

export const listAgricultureActivity = (query?: AgricultureActivityQuery): AxiosPromise<AgricultureActivityVO[]> => {
  return request({
    url: '/mz-base/agricultureActivity/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询农艺活动详细
 * @param activityId
 */
export const getAgricultureActivity = (activityId: string | number): AxiosPromise<AgricultureActivityVO> => {
  return request({
    url: '/mz-base/agricultureActivity/' + activityId,
    method: 'get'
  });
};

/**
 * 新增农艺活动
 * @param data
 */
export const addAgricultureActivity = (data: AgricultureActivityForm) => {
  return request({
    url: '/mz-base/agricultureActivity',
    method: 'post',
    data: data
  });
};

/**
 * 修改农艺活动
 * @param data
 */
export const updateAgricultureActivity = (data: AgricultureActivityForm) => {
  return request({
    url: '/mz-base/agricultureActivity',
    method: 'put',
    data: data
  });
};

/**
 * 删除农艺活动
 * @param activityId
 */
export const delAgricultureActivity = (activityId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/agricultureActivity/' + activityId,
    method: 'delete'
  });
};
