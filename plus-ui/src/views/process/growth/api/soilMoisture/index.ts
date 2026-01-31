import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SoilMoistureVO, SoilMoistureForm, SoilMoistureQuery } from './types';

/**
 * 查询土壤墒情监测数据列表
 * @param query
 * @returns {*}
 */

export const listSoilMoisture = (query?: SoilMoistureQuery): AxiosPromise<SoilMoistureVO[]> => {
  return request({
    url: '/four/soilMoisture/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询土壤墒情监测数据详细
 * @param fourId
 */
export const getSoilMoisture = (fourId: string | number): AxiosPromise<SoilMoistureVO> => {
  return request({
    url: '/four/soilMoisture/' + fourId,
    method: 'get'
  });
};

/**
 * 新增土壤墒情监测数据
 * @param data
 */
export const addSoilMoisture = (data: SoilMoistureForm) => {
  return request({
    url: '/four/soilMoisture',
    method: 'post',
    data: data
  });
};

/**
 * 修改土壤墒情监测数据
 * @param data
 */
export const updateSoilMoisture = (data: SoilMoistureForm) => {
  return request({
    url: '/four/soilMoisture',
    method: 'put',
    data: data
  });
};

/**
 * 删除土壤墒情监测数据
 * @param fourId
 */
export const delSoilMoisture = (fourId: string | number | Array<string | number>) => {
  return request({
    url: '/four/soilMoisture/' + fourId,
    method: 'delete'
  });
};
