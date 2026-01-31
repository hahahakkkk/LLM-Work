export interface SatelliteVO {
  /**
   * 主键
   */
  fourId: string | number;

  /**
   * 预览图
   */
  previewImage: string;

  /**
   * 遥感文件存放位置
   */
  fileLocation: string;

  /**
   * 采集时间
   */
  collectTime: string;

  /**
   * 季度
   */
  quarter: string | number;

  /**
   * 采集期次
   */
  collectPeriod: string;

  /**
   * 大小
   */
  fileSize: number;

  /**
   * 拍摄卫星
   */
  srcSatellite: string;

  /**
   * 备注
   */
  remark: string;
}

export interface SatelliteForm extends BaseEntity {
  /**
   * 遥感数据ID
   */
  fourId?: string | number;

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
   * 季度
   */
  quarter?: string | number;

  /**
   * 采集期次
   */
  collectPeriod?: string;

  /**
   * 大小
   */
  fileSize?: number;

  /**
   * 拍摄卫星
   */
  srcSatellite?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface SatelliteQuery extends PageQuery {
  /**
   * 采集时间
   */
  collectTime?: string;

  /**
   * 拍摄卫星
   */
  srcSatellite?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
