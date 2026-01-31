export interface WafVO {
  /**
   *
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

  /**
   *
   */
  remark: string;
}

export interface WafForm extends BaseEntity {
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

  /**
   *
   */
  remark?: string;
}

export interface WafQuery extends PageQuery {
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
