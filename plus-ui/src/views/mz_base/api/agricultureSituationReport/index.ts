import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AgricultureSituationReportVO, AgricultureSituationReportForm, AgricultureSituationReportQuery } from './types';

/**
 * 查询农情信息上报列表
 * @param query
 * @returns {*}
 */

export const listAgricultureSituationReport = (query?: AgricultureSituationReportQuery): AxiosPromise<AgricultureSituationReportVO[]> => {
  return request({
    url: '/mz-base/agricultureSituationReport/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询农情信息上报详细
 * @param reportId
 */
export const getAgricultureSituationReport = (reportId: string | number): AxiosPromise<AgricultureSituationReportVO> => {
  return request({
    url: '/mz-base/agricultureSituationReport/' + reportId,
    method: 'get'
  });
};

/**
 * 新增农情信息上报
 * @param data
 */
export const addAgricultureSituationReport = (data: AgricultureSituationReportForm) => {
  return request({
    url: '/mz-base/agricultureSituationReport',
    method: 'post',
    data: data
  });
};

/**
 * 修改农情信息上报
 * @param data
 */
export const updateAgricultureSituationReport = (data: AgricultureSituationReportForm) => {
  return request({
    url: '/mz-base/agricultureSituationReport',
    method: 'put',
    data: data
  });
};

/**
 * 删除农情信息上报
 * @param reportId
 */
export const delAgricultureSituationReport = (reportId: string | number | Array<string | number>) => {
  return request({
    url: '/mz-base/agricultureSituationReport/' + reportId,
    method: 'delete'
  });
};
