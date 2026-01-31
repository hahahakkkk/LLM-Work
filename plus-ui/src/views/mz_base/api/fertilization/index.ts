import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LandUnitVO, FertilizationForm, FertilizerVolumn } from './types';

/**
 * 查询地块管理详细
 * @param id
 */
export const getLandUnit = (id: string | number): AxiosPromise<LandUnitVO> => {
  return request({
    url: '/powland/landUnit/' + id,
    method: 'get'
  });
};

/**
 * 生成配方施肥单
 */
export const genarateFertilizationForm = (data: FertilizationForm): AxiosPromise<FertilizerVolumn> => {
  return request({
    url: '/mz-base/formula/genarate',
    method: 'post',
    data: data
  });
};

/**
 * 调整配方施肥单
 */
export const adjustFertilizationForm = (data: FertilizerVolumn) => {
  return request({
    url: '/mz-base/formula/adjust',
    method: 'post',
    data: data
  });
};
