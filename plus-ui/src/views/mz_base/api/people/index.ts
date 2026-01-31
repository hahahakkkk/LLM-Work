import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PeopleVO, PeopleForm, PeopleQuery } from './types';

/**
 * 查询基地人员列表
 * @param query
 * @returns {*}
 */

export const listPeople = (query?: PeopleQuery): AxiosPromise<PeopleVO[]> => {
  return request({
    url: '/mz-base/people/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询基地人员详细
 * @param peopleId
 */
export const getPeople = (peopleId: string | number): AxiosPromise<PeopleVO> => {
  return request({
    url: '/mz-base/people/' + peopleId,
    method: 'get'
  });
};

/**
 * 新增基地人员
 * @param data
 */
export const addPeople = (data: PeopleForm) => {
  return request({
    url: '/mz-base/people',
    method: 'post',
    data: data
  });
};

/**
 * 修改基地人员
 * @param data
 */
export const updatePeople = (data: PeopleForm) => {
  return request({
    url: '/mz-base/people',
    method: 'put',
    data: data
  });
};

/**
 * 删除基地人员
 * @param peopleId
 */
export const delPeople = (peopleId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/people/' + peopleId,
    method: 'delete'
  });
};
