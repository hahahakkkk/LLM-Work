import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ConfigVO, ConfigForm, ConfigQuery } from '@/api/disaster/config/types';

/**
 * 查询灾害预警配置列表
 * @param query
 * @returns {*}
 */

export const listConfig = (query?: ConfigQuery): AxiosPromise<ConfigVO[]> => {
  return request({
    url: '/disaster/config/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询灾害预警配置详细
 * @param id
 */
export const getConfig = (id: string | number): AxiosPromise<ConfigVO> => {
  return request({
    url: '/disaster/config/' + id,
    method: 'get'
  });
};

/**
 * 新增灾害预警配置
 * @param data
 */
export const addConfig = (data: ConfigForm) => {
  return request({
    url: '/disaster/config',
    method: 'post',
    data: data
  });
};

/**
 * 修改灾害预警配置
 * @param data
 */
export const updateConfig = (data: ConfigForm) => {
  return request({
    url: '/disaster/config',
    method: 'put',
    data: data
  });
};

/**
 * 删除灾害预警配置
 * @param id
 */
export const delConfig = (id: string | number | Array<string | number>) => {
  return request({
    url: '/disaster/config/' + id,
    method: 'delete'
  });
};
