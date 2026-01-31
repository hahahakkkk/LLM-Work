import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { EquipmentVO, EquipmentForm, EquipmentQuery } from './types';

/**
 * 查询基地设备列表
 * @param query
 * @returns {*}
 */

export const listEquipment = (query?: EquipmentQuery): AxiosPromise<EquipmentVO[]> => {
  return request({
    url: '/mz-base/equipment/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询基地设备详细
 * @param equipId
 */
export const getEquipment = (equipId: string | number): AxiosPromise<EquipmentVO> => {
  return request({
    url: '/mz-base/equipment/' + equipId,
    method: 'get'
  });
};

/**
 * 新增基地设备
 * @param data
 */
export const addEquipment = (data: EquipmentForm) => {
  return request({
    url: '/mz-base/equipment',
    method: 'post',
    data: data
  });
};

/**
 * 修改基地设备
 * @param data
 */
export const updateEquipment = (data: EquipmentForm) => {
  return request({
    url: '/mz-base/equipment',
    method: 'put',
    data: data
  });
};

/**
 * 删除基地设备
 * @param equipId
 */
export const delEquipment = (equipId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/equipment/' + equipId,
    method: 'delete'
  });
};
