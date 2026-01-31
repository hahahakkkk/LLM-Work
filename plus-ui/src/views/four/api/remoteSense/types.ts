export interface RemoteSenseVO {
  /**
   * 主键
   */
  fourId: string | number;

  /**
   * 基地
   */
  baseId: string | number;

  /**
   * 地块
   */
  plotId: string | number;

  /**
   * 谷子生育期
   */
  growthPeriod: string;

  /**
   * 预览图
   */
  previewImage: string;

  /**
   * 遥感文件存放位置
   */
  fileLocation: string;

  /**
   * 文件大小
   */
  fileSize: number;

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
  string: string;

  /**
   * 类型
   */
  imageType: string;

  /**
   * 备注
   */
  remark: string;
}

export interface RemoteSenseForm extends BaseEntity {
  /**
   * 遥感数据ID
   */
  fourId?: string | number;

  /**
   * 基地
   */
  baseId?: string | number;

  /**
   * 地块
   */
  plotId?: string | number;

  /**
   * 谷子生育期
   */
  growthPeriod?: string;

  /**
   * 预览图
   */
  previewImage?: string;

  /**
   * 遥感文件存放位置
   */
  fileLocation?: string;

  /**
   * 采集时间
   */
  collectTime?: string;

  /**
   * 文件大小
   */
  fileSize?: number;

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
  imageType?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface RemoteSenseQuery extends PageQuery {
  /**
   * 基地
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
   * 采集方式
   */
  collectWay?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
