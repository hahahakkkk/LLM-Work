export interface ProductionVO {
  /**
   * 生产计划ID
   */
  productionId: string | number;

  /**
   * 所属基地
   */
  baseId: string | number;

  /**
   * 生产年份
   */
  pYear: string;

  /**
   * 开始时间
   */
  startTime: string;

  /**
   * 结束时间
   */
  endTime: string;

  /**
   * 工作内容
   */
  pcontent: string;

  /**
   * 执行单位
   */
  implementedBy: string;

  /**
   *开始年份
   */
  minYear: string;

  /**
   * 结束年份
   */
  maxYear: string;

  /**
   * 备注
   */
  remark: string;
}

export interface ProductionForm extends BaseEntity {
  /**
   * 生产计划ID
   */
  productionId?: string | number;

  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 生产年份
   */
  pYear?: string;

  /**
   * 开始时间
   */
  startTime?: string;

  /**
   * 结束时间
   */
  endTime?: string;

  /**
   * 工作内容
   */
  pcontent?: string;

  /**
   * 执行单位
   */
  implementedBy?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;
}

export interface ProductionQuery extends PageQuery {
  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 生产年份
   */
  pYear?: string;

  /**
   * 开始时间
   */
  startTime?: string;

  /**
   * 结束时间
   */
  endTime?: string;

  /**
   * 工作内容
   */
  pContent?: string;

  /**
   * 执行单位
   */
  implementedBy?: string;

  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
