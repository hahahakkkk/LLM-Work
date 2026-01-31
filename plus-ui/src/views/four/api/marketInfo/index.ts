import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MarketInfoVO, MarketInfoForm, MarketInfoQuery, GuZiPriceResponse } from './types';

/**
 * 查询市场信息列表
 * @param query
 * @returns {*}
 */

export const listMarketInfo = (query?: MarketInfoQuery): AxiosPromise<MarketInfoVO[]> => {
  return request({
    url: '/four/marketInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询市场信息详细
 * @param marketId
 */
export const getMarketInfo = (marketId: string | number): AxiosPromise<MarketInfoVO> => {
  return request({
    url: '/four/marketInfo/' + marketId,
    method: 'get'
  });
};

/**
 * 新增市场信息
 * @param data
 */
export const addMarketInfo = (data: MarketInfoForm) => {
  return request({
    url: '/four/marketInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改市场信息
 * @param data
 */
export const updateMarketInfo = (data: MarketInfoForm) => {
  return request({
    url: '/four/marketInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除市场信息
 * @param marketId
 */
export const delMarketInfo = (marketId: string | number | Array<string | number>) => {
  return request({
    url: '/four/marketInfo/' + marketId,
    method: 'delete'
  });
};

/**
 * 价格走势，左侧：价格极值（地区 like，不限品类）
 * @param params
 */
export const getPriceExtremes = (params: {
  area: string;
  dateType: number;
}): AxiosPromise<{
  max: GuZiPriceResponse;
  min: GuZiPriceResponse;
}> => {
  return request({
    url: '/four/marketInfo/priceExtremes',
    method: 'get',
    params
  });
};

/**
 * 价格走势，右侧：谷子价格走势（地区 =，品类=谷子）
 * @param params
 */
export const getPriceTrend = (params: { area: string; dateType: number }): AxiosPromise<GuZiPriceResponse[]> => {
  return request({
    url: '/four/marketInfo/priceTrend',
    method: 'get',
    params
  });
};
