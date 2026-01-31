export interface SupplyRecVO {
  /**
   * 预警编号
   */
  id: string | number;

  /**
   * 基地编号
   */
  baseId: string | number;

  /**
   * 基地名称
   */
  baseName: string;

  /**
   * 预警时间
   */
  actionTime: string;

  /**
   * 预警信息
   */
  alertInfo: string;

  /**
   * 方法措施
   */
  measure: string;

  /**
   * 问题种类
   */
  problemType: string;
}

export interface SupplyRecForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   * 基地编号
   */
  baseId?: string | number;

  /**
   * 基地名称
   */
  baseName?: string;

  /**
   * 预警时间
   */
  actionTime?: string;

  /**
   * 预警信息
   */
  alertInfo?: string;

  /**
   * 方法措施
   */
  measure?: string;

  /**
   * 问题种类
   */
  problemType?: string;
}

export interface SupplyRecQuery extends PageQuery {
  /**
   * 基地编号
   */
  baseId?: string | number;

  /**
   * 基地名称
   */
  baseName?: string;

  /**
   * 预警时间
   */
  actionTime?: string;

  /**
   * 预警信息
   */
  alertInfo?: string;

  /**
   * 方法措施
   */
  measure?: string;

  /**
   * 问题种类
   */
  problemType?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
