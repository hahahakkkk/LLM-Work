import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WarningVO, WarningForm, WarningQuery } from './types';

/**
 * 查询气象预警与建议数据列表
 * @param query
 * @returns {*}
 */

export const listWarning = (query?: WarningQuery): AxiosPromise<WarningVO[]> => {
  return request({
    url: '/pestcontrol/warning/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询气象预警与建议数据详细
 * @param id
 */
export const getWarning = (id: string | number): AxiosPromise<WarningVO> => {
  return request({
    url: '/pestcontrol/warning/' + id,
    method: 'get'
  });
};

/**
 * 新增气象预警与建议数据
 * @param data
 */
export const addWarning = (data: WarningForm) => {
  return request({
    url: '/pestcontrol/warning',
    method: 'post',
    data: data
  });
};

/**
 * 修改气象预警与建议数据
 * @param data
 */
export const updateWarning = (data: WarningForm) => {
  return request({
    url: '/pestcontrol/warning',
    method: 'put',
    data: data
  });
};

/**
 * 删除气象预警与建议数据
 * @param id
 */
export const delWarning = (id: string | number | Array<string | number>) => {
  return request({
    url: '/pestcontrol/warning/' + id,
    method: 'delete'
  });
};
