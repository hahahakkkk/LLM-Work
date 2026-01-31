export interface FacilityData {
  facilityType: string;
  online: number;
  offline: number;
  fault: number;
}

export interface WeatherData {
  baseId: number;
  airTemperature: number;
  airHumidity: number;
  lightIntensity: number;
  windSpeed: number;
  rainfall: number;
  collectTime: string;
}

export interface SoilData {
  baseId: number;
  shallowWater: number;
  middleWater: number;
  deepWater: number;
  shallowTemperature: number;
  middleTemperature: number;
  deepTemperature: number;
  collectTime: string;
}

export interface videoData {
  baseId: number;
  facilityId: string;
  fileLocation: string;
  facilityStatus: string;
}

export interface KnowledgeData {
  fileType: string;
  fileAmount: number;
}

/**
 * 首页/概览页/数据看板-生成过程数据、四情设备信息，接口参数对象
 */
export interface OverviewQueryParams {
  userRoles: string[];
  userId: string | number;
  tenantId: string;
}

/**
 * 概览页模型库卡片数据统计
 */
export interface ModelLibStat {
  modelCount: number;
  datasetCount: number;
  datasetSize: string;
}

/**
 * 概览页数据看板卡片-数据统计按钮使用，接口参数对象
 */
export interface StatRequestDto {
  baseName: string;
  statDimension: string; // 'year' | 'month' | 'growthPeriod'
  dateValue: string; // '2025' | '2025-12' | '2026-p1'
}

/**
 * 概览页数据看板卡片-数据统计按钮使用，气象数据（最大/最小/平均）
 */
export interface StatWeatherData {
  statItem: string; // '最大值' | '最小值' | '平均值'
  airHumidity: string; // 空气湿度
  airTemperature: string; // 空气温度
  lightIntensity: string; // 光照强度
  windSpeed: string; // 风速
  rainfall: string; // 降雨量
}

/**
 * 概览页数据看板卡片-数据统计按钮使用，墒情数据（最大/最小/平均）
 */
export interface StatSoilData {
  statItem: string; // '最大值' | '最小值' | '平均值'
  shallowWater: string; // 土壤湿度
  shallowTemperature: string; // 土壤温度
  soilDdl: string; // 土壤电导率
  soilYf: string; // 土壤盐分
}

/**
 * 概览页数据看板卡片-数据统计按钮使用，接口返回对象
 */
export interface StatResponseDto {
  weatherTableData: StatWeatherData[];
  soilTableData: StatSoilData[];
  currentBaseRainfall: number; // 当前基地降雨量总和
  allBaseRainfall: number; // 全部基地降雨量总和
  activeTemperatureSum: number; // 当前基地活动积温总和
}
