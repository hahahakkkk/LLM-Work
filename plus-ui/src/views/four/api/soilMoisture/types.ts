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
   * 土壤湿度
   */
  shallowWater: string | number;

  /**
   * 20-40cm土层土壤水分含量
   */
  middleWater: string | number;

  /**
   * 40-60cm土层土壤水分含量
   */
  deepWater: string | number;

  /**
   * 土壤温度
   */
  shallowTemperature: string | number;

  /**
   * 20-40cm土层土壤温度
   */
  middleTemperature: string | number;

  /**
   * 40-60cm土层土壤温度
   */
  deepTemperature: string | number;

  /**
   * 土壤电导率
   */
  soilDdl: string | number;

  /**
   * 土壤盐分
   */
  soilYf: string | number;

  /**
   * 土壤pH值
   */
  soilPh: string | number;

  /**
   * 谷子生育期
   */
  growthPeriod: string | number;

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
   * 土壤湿度
   */
  shallowWater?: number;

  /**
   * 20-40cm土层土壤水分含量
   */
  middleWater?: number;

  /**
   * 40-60cm土层土壤水分含量
   */
  deepWater?: number;

  /**
   * 土壤温度
   */
  shallowTemperature?: number;

  /**
   * 20-40cm土层土壤温度
   */
  middleTemperature?: number;

  /**
   * 40-60cm土层土壤温度
   */
  deepTemperature?: number;

  /**
   * 土壤电导率
   */
  soilDdl?: number;

  /**
   * 土壤盐分
   */
  soilYf?: number;

  /**
   * 土壤pH值
   */
  soilPh?: number;

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
