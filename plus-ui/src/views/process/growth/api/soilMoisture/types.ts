export interface SoilMoistureVO {
  /**
   * 主键
   */
  fourId: string | number;

  /**
   * 基地
   */
  baseId: string | number;

  /**
   * 设备编号
   */
  facilityId: string | number;

  /**
   * 监测设备位置经度
   */
  facilityLongitude: number;

  /**
   * 0-20cm土层土壤水分含量
   */
  shallowWater: number;

  /**
   * 20-40cm土层土壤水分含量
   */
  middleWater: string | number;

  /**
   * 40-60cm土层土壤水分含量
   */
  deepWater: number;

  /**
   * 0-20cm土层土壤温度
   */
  shallowTemperature: number;

  /**
   * 20-40cm土层土壤温度
   */
  middleTemperature: string | number;

  /**
   * 40-60cm土层土壤温度
   */
  deepTemperature: number;

  /**
   * 土壤温度
   */
  soilWd: string;

  /**
   * 土壤电导率
   */
  soilDdl: string;

  /**
   * 土壤pH值
   */
  soilPh: string;

  /**
   * 谷子生育期
   */
  growthPeriod: number;

  /**
   * 采集时间
   */
  collectTime: string;

  /**
   * 备注
   */
  remark: string;
}

export interface SoilMoistureForm extends BaseEntity {
  /**
   * 墒情数据ID
   */
  fourId?: string | number;

  /**
   * 基地
   */
  baseId?: string | number;

  /**
   * 设备编号
   */
  facilityId?: string | number;

  /**
   * 监测设备位置经度
   */
  facilityLongitude?: number;

  /**
   * 0-20cm土层土壤水分含量
   */
  shallowWater?: number;

  /**
   * 20-40cm土层土壤水分含量
   */
  middleWater?: string | number;

  /**
   * 40-60cm土层土壤水分含量
   */
  deepWater?: number;

  /**
   * 0-20cm土层土壤温度
   */
  shallowTemperature?: number;

  /**
   * 20-40cm土层土壤温度
   */
  middleTemperature?: string | number;

  /**
   * 40-60cm土层土壤温度
   */
  deepTemperature?: number;

  /**
   * 土壤温度
   */
  soilWd?: string;

  /**
   * 土壤电导率
   */
  soilDdl?: string;

  /**
   * 土壤pH值
   */
  soilPh?: string;

  /**
   * 谷子生育期
   */
  growthPeriod?: number;

  /**
   * 采集时间
   */
  collectTime?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface SoilMoistureQuery extends PageQuery {
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
