import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IrrigationRecordsVO, IrrigationRecordsForm, IrrigationRecordsQuery } from './types';

/**
 * 查询灌溉记录列表
 * @param query
 * @returns {*}
 */

export const listIrrigationRecords = (query?: IrrigationRecordsQuery): AxiosPromise<IrrigationRecordsVO[]> => {
  return request({
    url: '/mz-base/irrigationRecords/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询灌溉记录详细
 * @param irrigationId
 */
export const getIrrigationRecords = (irrigationId: string | number): AxiosPromise<IrrigationRecordsVO> => {
  return request({
    url: '/mz-base/irrigationRecords/' + irrigationId,
    method: 'get'
  });
};

/**
 * 新增灌溉记录
 * @param data
 */
export const addIrrigationRecords = (data: IrrigationRecordsForm) => {
  return request({
    url: '/mz-base/irrigationRecords',
    method: 'post',
    data: data
  });
};

/**
 * 修改灌溉记录
 * @param data
 */
export const updateIrrigationRecords = (data: IrrigationRecordsForm) => {
  return request({
    url: '/mz-base/irrigationRecords',
    method: 'put',
    data: data
  });
};

/**
 * 删除灌溉记录
 * @param irrigationId
 */
export const delIrrigationRecords = (irrigationId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/irrigationRecords/' + irrigationId,
    method: 'delete'
  });
};
