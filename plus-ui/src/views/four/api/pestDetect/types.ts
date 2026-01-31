export interface PestDetectVO {
  /**
   * 主键
   */
  fourId: string | number;

  /**
   * 基地
   */
  baseId: string | number;

  /**
   * 测报仪设备
   */
  facilityId: string | number;

  /**
   * 昆虫种类
   */
  pestType: string | number;

  /**
   * 昆虫数量
   */
  pestAmount: string | number;

  /**
   * 昆虫详情
   */
  pestInfo: string;

  /**
   * 昆虫图像
   */
  fileLocation: string;

  /**
   * 环境温度
   */
  envTemperature: string | number;

  /**
   * 环境湿度
   */
  envHumidity: string | number;

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

export interface PestDetectForm extends BaseEntity {
  /**
   * 虫情测报数据ID
   */
  fourId?: string | number;

  /**
   * 基地
   */
  baseId?: string | number;

  /**
   * 测报仪设备
   */
  facilityId?: string | number;

  /**
   * 昆虫种类
   */
  pestType?: number;

  /**
   * 昆虫数量
   */
  pestAmount?: number;

  /**
   * 昆虫详情
   */
  pestInfo?: string;

  /**
   * 昆虫图像
   */
  fileLocation?: string;

  /**
   * 环境温度
   */
  envTemperature?: number;

  /**
   * 环境湿度
   */
  envHumidity?: number;

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

export interface PestDetectQuery extends PageQuery {
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
