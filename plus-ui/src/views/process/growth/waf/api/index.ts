import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WafVO, WafForm, WafQuery } from './types';

/**
 * 查询水肥诊断数据列表
 * @param query
 * @returns {*}
 */

export const listWaf = (query?: WafQuery): AxiosPromise<WafVO[]> => {
  return request({
    url: '/process/growth/waf/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询水肥诊断数据详细
 * @param id
 */
export const getWaf = (id: string | number): AxiosPromise<WafVO> => {
  return request({
    url: '/process/growth/waf/' + id,
    method: 'get'
  });
};

/**
 * 新增水肥诊断数据
 * @param data
 */
export const addWaf = (data: WafForm) => {
  return request({
    url: '/process/growth/waf',
    method: 'post',
    data: data
  });
};

/**
 * 修改水肥诊断数据
 * @param data
 */
export const updateWaf = (data: WafForm) => {
  return request({
    url: '/process/growth/waf',
    method: 'put',
    data: data
  });
};

/**
 * 删除水肥诊断数据
 * @param id
 */
export const delWaf = (id: string | number | Array<string | number>) => {
  return request({
    url: '/process/growth/waf/' + id,
    method: 'delete'
  });
};

// 水肥一体化评估接口
export function waterFertilizerAssessment(data: { lai: number; growthLevel: string; spadValue: number }) {
  return request({
    url: '/process/maturity/modelforward/water-fertilizer',
    method: 'post',
    data
  });
}

// 健康检查接口
export function healthCheck() {
  return request({
    url: '/process/maturity/modelforward/health',
    method: 'get'
  });
}
