import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IrrigationVO, IrrigationForm, IrrigationQuery } from '@/views/process/api/block/irrigation/types';

/**
 * 查询灌溉溯源列表
 * @param query
 * @returns {*}
 */

export const listIrrigation = (query?: IrrigationQuery): AxiosPromise<IrrigationVO[]> => {
  return request({
    url: '/block/irrigation/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询灌溉溯源详细
 * @param id
 */
export const getIrrigation = (id: string | number): AxiosPromise<IrrigationVO> => {
  return request({
    url: '/block/irrigation/' + id,
    method: 'get'
  });
};

/**
 * 新增灌溉溯源
 * @param data
 */
export const addIrrigation = (data: IrrigationForm) => {
  return request({
    url: '/block/irrigation',
    method: 'post',
    data: data
  });
};

/**
 * 修改灌溉溯源
 * @param data
 */
export const updateIrrigation = (data: IrrigationForm) => {
  return request({
    url: '/block/irrigation',
    method: 'put',
    data: data
  });
};

/**
 * 删除灌溉溯源
 * @param id
 */
export const delIrrigation = (id: string | number | Array<string | number>) => {
  return request({
    url: '/block/irrigation/' + id,
    method: 'delete'
  });
};
