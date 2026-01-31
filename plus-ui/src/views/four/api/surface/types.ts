export interface SurfaceVO {
  /**
   * 主键
   */
  fourId: string | number;

  /**
   * 基地ID
   */
  baseId: string | number;

  /**
   * 地块ID
   */
  plotId: string | number;

  /**
   * 地块编号
   */
  plotLabel: string | number;

  /**
   * 谷子生育期
   */
  growthPeriod: string;

  /**
   * 文件存放位置
   */
  fileLocation: string;

  /**
   * 采集时间
   */
  collectTime: string;

  /**
   * 采集方式
   */
  collectWay: string;

  /**
   * 用途
   */
  useFor: string;

  /**
   * 类型
   */
  dataType: string;

  /**
   * 大小
   */
  dataSize: string;

  /**
   * 备注
   */
  remark: string;
}

export interface SurfaceForm extends BaseEntity {
  /**
   * 主键
   */
  fourId?: string | number;

  /**
   * 基地ID
   */
  baseId?: string | number;

  /**
   * 地块ID
   */
  plotId?: string | number;

  /**
   * 谷子生育期
   */
  growthPeriod?: string;

  /**
   * 文件存放位置
   */
  fileLocation?: string;

  /**
   * 采集时间
   */
  collectTime?: string;

  /**
   * 采集方式
   */
  collectWay?: string;

  /**
   * 用途
   */
  useFor?: string;

  /**
   * 类型
   */
  dataType?: string;

  /**
   * 大小
   */
  dataSize?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface SurfaceQuery extends PageQuery {
  /**
   * 基地ID
   */
  baseId?: string | number;

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
