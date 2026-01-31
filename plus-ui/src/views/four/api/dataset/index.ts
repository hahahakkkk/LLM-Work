import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DatasetVO, DatasetForm, DatasetQuery } from './types';

/**
 * 查询模型库数据集列表
 * @param query
 * @returns {*}
 */

export const listDataset = (query?: DatasetQuery): AxiosPromise<DatasetVO[]> => {
  return request({
    url: '/four/dataset/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询模型库数据集详细
 * @param fourId
 */
export const getDataset = (fourId: string | number): AxiosPromise<DatasetVO> => {
  return request({
    url: '/four/dataset/' + fourId,
    method: 'get'
  });
};

/**
 * 新增模型库数据集
 * @param data
 */
export const addDataset = (data: DatasetForm) => {
  return request({
    url: '/four/dataset',
    method: 'post',
    data: data
  });
};

/**
 * 修改模型库数据集
 * @param data
 */
export const updateDataset = (data: DatasetForm) => {
  return request({
    url: '/four/dataset',
    method: 'put',
    data: data
  });
};

/**
 * 删除模型库数据集
 * @param fourId
 */
export const delDataset = (fourId: string | number | Array<string | number>) => {
  return request({
    url: '/four/dataset/' + fourId,
    method: 'delete'
  });
};
