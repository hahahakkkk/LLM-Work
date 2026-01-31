import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  FacilityData,
  KnowledgeData,
  ModelLibStat,
  OverviewQueryParams,
  SoilData,
  StatRequestDto,
  StatResponseDto,
  videoData,
  WeatherData
} from '@/views/four/api/statisticAnalysis/types';
import { GuZiPriceResponse } from '@/views/four/api/marketInfo/types';

/**
 * 首页/概览页/数据看板-获取四情设备信息
 */
export const queryFacilityInfo = (deptId: number | string): AxiosPromise<FacilityData> => {
  return request({
    url: '/four/facility/facilityInfo',
    method: 'get',
    params: {
      deptId
    }
  });
};

/**
 * 数据看板-获取最近一周的小气候气象数据
 */
export const queryWeatherData = (baseId: number | string): AxiosPromise<WeatherData> => {
  return request({
    url: '/four/microclimate/latestWeek',
    method: 'get',
    params: {
      baseId
    }
  });
};

/**
 * 数据看板-获取最近一周的土壤墒情监测数据
 */
export const querySoilData = (baseId: number | string): AxiosPromise<SoilData> => {
  return request({
    url: '/four/soilMoisture/latestWeek',
    method: 'get',
    params: {
      baseId
    }
  });
};

/**
 * 数据看板-获取作物生境监测视频数据
 */
export const queryVideoData = (baseId: number | string): AxiosPromise<videoData> => {
  return request({
    url: '/four/cropHabitat/video',
    method: 'get',
    params: {
      baseId
    }
  });
};

/**
 * 概览页-获取知识库内容类型数据
 */
export const queryKnowledgeData = (): AxiosPromise<KnowledgeData> => {
  return request({
    url: '/four/oss/knowStatistic',
    method: 'get'
  });
};

/**
 * 概览页-获取今日谷子市场价格TOP5
 */
export const queryPriceTop5Data = (): AxiosPromise<GuZiPriceResponse> => {
  return request({
    url: '/four/marketInfo/priceTop5',
    method: 'get'
  });
};

/**
 * 概览页-获取年度生产过程数据
 */
export const queryProductionData = (data: OverviewQueryParams): AxiosPromise<Record<string, number>> => {
  return request({
    url: '/four/overview/productionData',
    method: 'post',
    data: data // POST 请求：参数放在 data 字段（Axios 自动转 JSON）
  });
};

/**
 * 概览页-获取模型数量、数据集数量大小
 */
export const queryModelLibStat = (): AxiosPromise<ModelLibStat> => {
  return request({
    url: '/four/overview/modelLibStatistics',
    method: 'get'
  });
};

/**
 * 概览页-数据看板卡片-数据统计按钮使用，获取四情监测统计数据
 */
export const queryStatData = (data: StatRequestDto): AxiosPromise<StatResponseDto> => {
  return request({
    url: '/four/overview/fourStat',
    method: 'POST',
    data
  });
};
