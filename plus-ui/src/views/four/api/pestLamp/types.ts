export interface PestLampVO {
  /**
   * 主键
   */
  fourId: string | number;

  /**
   * 基地编号
   */
  baseId: string | number;

  /**
   * 设备编号
   */
  facilityId: string | number;

  /**
   * 击虫次数
   */
  pestKills: string | number;

  /**
   * 大气温度
   */
  airTemperature: string | number;

  /**
   * 大气湿度
   */
  airHumidity: string | number;

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
}

export interface PestLampForm extends BaseEntity {
  /**
   * 主键
   */
  fourId?: string | number;

  /**
   * 基地编号
   */
  baseId?: string | number;

  /**
   * 设备编号
   */
  facilityId?: string | number;

  /**
   * 击虫次数
   */
  pestKills?: number;

  /**
   * 大气温度
   */
  airTemperature?: number;

  /**
   * 大气湿度
   */
  airHumidity?: number;

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

export interface PestLampQuery extends PageQuery {
  /**
   * 基地编号
   */
  baseId?: string | number;

  /**
   * 采集时间
   */
  collectTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
