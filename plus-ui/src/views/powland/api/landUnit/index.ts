import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LandUnitVO, LandUnitForm, LandUnitQuery } from './types';

/**
 * 查询地块管理列表
 * @param query
 * @returns {*}
 */

export const listLandUnit = (query?: LandUnitQuery): AxiosPromise<LandUnitVO[]> => {
  return request({
    url: '/powland/landUnit/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询地块管理详细
 * @param id
 */
export const getLandUnit = (landId: string | number): AxiosPromise<LandUnitVO> => {
  return request({
    url: '/powland/landUnit/' + landId,
    method: 'get'
  });
};

/**
 * 新增地块管理
 * @param data
 */
export const addLandUnit = (data: LandUnitForm) => {
  return request({
    url: '/powland/landUnit',
    method: 'post',
    data: data
  });
};

/**
 * 修改地块管理
 * @param data
 */
export const updateLandUnit = (data: LandUnitForm) => {
  return request({
    url: '/powland/landUnit',
    method: 'put',
    data: data
  });
};

/**
 * 删除地块管理
 * @param id
 */
export const delLandUnit = (id: string | number | Array<string | number>) => {
  return request({
    url: '/powland/landUnit/' + id,
    method: 'delete'
  });
};


/**
 * 地块GeoJSON信息
 */
export const landGeoJSON = () => {
  return request({
    url: '/powland/landUnit/geo',
    method: 'get'
  })
}
