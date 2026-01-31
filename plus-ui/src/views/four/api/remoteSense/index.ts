import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RemoteSenseVO, RemoteSenseForm, RemoteSenseQuery } from './types';

/**
 * 查询无人机/卫星遥感数据列表
 * @param query
 * @returns {*}
 */

export const listRemoteSense = (query?: RemoteSenseQuery): AxiosPromise<RemoteSenseVO[]> => {
  return request({
    url: '/four/remoteSense/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询无人机/卫星遥感数据详细
 * @param fourId
 */
export const getRemoteSense = (fourId: string | number): AxiosPromise<RemoteSenseVO> => {
  return request({
    url: '/four/remoteSense/' + fourId,
    method: 'get'
  });
};

/**
 * 新增无人机/卫星遥感数据
 * @param data
 */
export const addRemoteSense = (data: RemoteSenseForm) => {
  return request({
    url: '/four/remoteSense',
    method: 'post',
    data: data
  });
};

/**
 * 修改无人机/卫星遥感数据
 * @param data
 */
export const updateRemoteSense = (data: RemoteSenseForm) => {
  return request({
    url: '/four/remoteSense',
    method: 'put',
    data: data
  });
};

/**
 * 删除无人机/卫星遥感数据
 * @param fourId
 */
export const delRemoteSense = (fourId: string | number | Array<string | number>) => {
  return request({
    url: '/four/remoteSense/' + fourId,
    method: 'delete'
  });
};
