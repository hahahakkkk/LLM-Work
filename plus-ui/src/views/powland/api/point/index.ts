import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PointVO, PointForm, PointQuery } from './types';

/**
 * 查询采样点列表
 * @param query
 * @returns {*}
 */

export const listPoint = (query?: PointQuery): AxiosPromise<PointVO[]> => {
  return request({
    url: '/powland/point/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询采样点详细
 * @param id
 */
export const getPoint = (id: string | number): AxiosPromise<PointVO> => {
  return request({
    url: '/powland/point/' + id,
    method: 'get'
  });
};

/**
 * 新增采样点
 * @param data
 */
export const addPoint = (data: PointForm) => {
  return request({
    url: '/powland/point',
    method: 'post',
    data: data
  });
};

/**
 * 修改采样点
 * @param data
 */
export const updatePoint = (data: PointForm) => {
  return request({
    url: '/powland/point',
    method: 'put',
    data: data
  });
};

/**
 * 删除采样点
 * @param id
 */
export const delPoint = (id: string | number | Array<string | number>) => {
  return request({
    url: '/powland/point/' + id,
    method: 'delete'
  });
};

/**
 * 采样点GIS信息
 */
export const geoList = () => {
  return request({
    url: '/powland/point/geo',
    method: 'post'
  });
};

/**
 * 地块中的采样点
 * @param landId
 * @returns
 */
export const pointInLand = (landId: string | number) => {
  return request({
    url: '/powland/point/pointInLand/' + landId,
    method: 'get'
  });
};
