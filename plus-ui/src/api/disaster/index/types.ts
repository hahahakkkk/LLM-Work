export interface IndexVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 灾害类型
   */
  disasterType: string;

  /**
   * 指数名称
   */
  indexName: string;

  /**
   * 指数值
   */
  indexValue: number;

  /**
   * 指数单位
   */
  indexUnit: string;

  /**
   * 检测区域
   */
  detectionArea: string;

  createTime: string;
}

export interface IndexForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 灾害类型
   */
  disasterType?: string;

  /**
   * 指数名称
   */
  indexName?: string;

  /**
   * 指数值
   */
  indexValue?: number;

  /**
   * 指数单位
   */
  indexUnit?: string;

  /**
   * 检测区域
   */
  detectionArea?: string;

  createTime: string;
}

export interface IndexQuery extends PageQuery {
  /**
   * 灾害类型
   */
  disasterType?: string;

  /**
   * 指数名称
   */
  indexName?: string;

  /**
   * 指数值
   */
  indexValue?: number;

  /**
   * 指数单位
   */
  indexUnit?: string;

  /**
   * 检测区域
   */
  detectionArea?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  createTime: string;
}
