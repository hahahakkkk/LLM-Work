import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DepositoryVO, DepositoryForm, DepositoryQuery } from './types';

/**
 * 查询仓库信息列表
 * @param query
 * @returns {*}
 */

export const listDepository = (query?: DepositoryQuery): AxiosPromise<DepositoryVO[]> => {
  return request({
    url: '/mz-base/depository/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询仓库信息详细
 * @param depositoryId
 */
export const getDepository = (depositoryId: string | number): AxiosPromise<DepositoryVO> => {
  return request({
    url: '/mz-base/depository/' + depositoryId,
    method: 'get'
  });
};

/**
 * 新增仓库信息
 * @param data
 */
export const addDepository = (data: DepositoryForm) => {
  return request({
    url: '/mz-base/depository',
    method: 'post',
    data: data
  });
};

/**
 * 修改仓库信息
 * @param data
 */
export const updateDepository = (data: DepositoryForm) => {
  return request({
    url: '/mz-base/depository',
    method: 'put',
    data: data
  });
};

/**
 * 删除仓库信息
 * @param depositoryId
 */
export const delDepository = (depositoryId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/depository/' + depositoryId,
    method: 'delete'
  });
};
