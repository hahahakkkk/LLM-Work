export interface DatasetVO {
  /**
   * 主键
   */
  fourId: string | number;

  /**
   * 标题
   */
  dataTitle: string;

  /**
   * 大小
   */
  dataSize: number;

  /**
   * 文件数量
   */
  dataAmount: number;

  /**
   * 预览图
   */
  previewImage: string;

  /**
   * 文件存放位置
   */
  fileLocation: string;

  /**
   * 采集时间
   */
  collectTime: string;

  /**
   * 用途
   */
  useFor: string;

  /**
   * 说明
   */
  remark: string;
}

export interface DatasetForm extends BaseEntity {
  /**
   * 主键
   */
  fourId?: string | number;

  /**
   * 标题
   */
  dataTitle?: string;

  /**
   * 大小
   */
  dataSize?: number;

  /**
   * 文件数量
   */
  dataAmount?: number;

  /**
   * 预览图
   */
  previewImage?: string;

  /**
   * 文件存放位置
   */
  fileLocation?: string;

  /**
   * 采集时间
   */
  collectTime?: string;

  /**
   * 用途
   */
  useFor?: string;

  /**
   * 说明
   */
  remark?: string;
}

export interface DatasetQuery extends PageQuery {
  /**
   * 标题
   */
  dataTitle?: string;

  /**
   * 采集时间
   */
  collectTime?: string;

  /**
   * 用途
   */
  useFor?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
