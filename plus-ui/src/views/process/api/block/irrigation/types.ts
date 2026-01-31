export interface IrrigationVO {
  /**
   * 灌溉记录ID
   */
  id: string | number;

  /**
   * 溯源码
   */
  traceCode: string;

  /**
   * 地块信息
   */
  plotInfo: string;

  /**
   * 灌溉方法
   */
  irrigationMethod: string;

  /**
   * 灌溉日期
   */
  irrigationDate: string;

  /**
   * 操作人
   */
  operator: string;
}

export interface IrrigationForm extends BaseEntity {
  /**
   * 灌溉记录ID
   */
  id?: string | number;

  /**
   * 溯源码
   */
  traceCode?: string;

  /**
   * 地块信息
   */
  plotInfo?: string;

  /**
   * 灌溉方法
   */
  irrigationMethod?: string;

  /**
   * 灌溉日期
   */
  irrigationDate?: string;

  /**
   * 操作人
   */
  operator?: string;
}

export interface IrrigationQuery extends PageQuery {
  /**
   * 溯源码
   */
  traceCode?: string;

  /**
   * 地块信息
   */
  plotInfo?: string;

  /**
   * 灌溉方法
   */
  irrigationMethod?: string;

  /**
   * 灌溉日期
   */
  irrigationDate?: string;

  /**
   * 操作人
   */
  operator?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
