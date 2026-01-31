export interface MicroclimateVO {
  /**
   * 主键
   */
  fourId: string | number;

  /**
   * 基地
   */
  baseId: string | number;

  /**
   * 小气候气象站
   */
  facilityId: string | number;

  /**
   * 空气温度
   */
  airTemperature: string | number;

  /**
   * 空气湿度
   */
  airHumidity: string | number;

  /**
   * 光照强度
   */
  lightIntensity: string | number;

  /**
   * 二氧化碳浓度
   */
  carbonDensity: string | number;

  /**
   * 风速
   */
  windSpeed: string | number;

  /**
   * 风向
   */
  windDirection: string;

  /**
   * 降雨量
   */
  rainfall: string | number;

  /**
   * 大气压强
   */
  atmosPressure: string | number;

  /**
   * 土壤温度
   */
  soilTemperature: string | number;

  /**
   * 土壤湿度
   */
  soilHumidity: string | number;

  /**
   * 谷子生育期
   */
  growthPeriod: string;

  /**
   * 采集时间
   */
  collectTime: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效
   */
  isValid: string | number;
}

export interface MicroclimateForm extends BaseEntity {
  /**
   * 小气候数据
   */
  fourId?: string | number;

  /**
   * 基地
   */
  baseId?: string | number;

  /**
   * 小气候气象站
   */
  facilityId?: string | number;

  /**
   * 空气温度
   */
  airTemperature?: number;

  /**
   * 空气湿度
   */
  airHumidity?: number;

  /**
   * 光照强度
   */
  lightIntensity?: number;

  /**
   * 二氧化碳浓度
   */
  carbonDensity?: number;

  /**
   * 风速
   */
  windSpeed?: number;

  /**
   * 风向
   */
  windDirection?: string;

  /**
   * 降雨量
   */
  rainfall?: number;

  /**
   * 大气压强
   */
  atmosPressure?: number;

  /**
   * 土壤温度
   */
  soilTemperature?: number;

  /**
   * 土壤湿度
   */
  soilHumidity?: number;

  /**
   * 谷子生育期
   */
  growthPeriod?: string;

  /**
   * 采集时间
   */
  collectTime?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效
   */
  isValid?: string | number;
}

export interface MicroclimateQuery extends PageQuery {
  /**
   * 基地
   */
  baseId?: string | number;

  /**
   * 设备编号
   */
  facilityId?: string | number;

  /**
   * 谷子生育期
   */
  growthPeriod?: string;

  /**
   * 采集时间
   */
  collectTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
