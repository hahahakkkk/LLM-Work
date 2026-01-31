export interface PesticideVO {
  /**
   * 打药记录ID
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
   * 农药名称
   */
  pesticideName: string | number;

  /**
   * 打药时间
   */
  pesticideTime: string | number;

  /**
   * 打药计量（单位：ml/亩）
   */
  pesticideDosage: string;

  /**
   * 操作人
   */
  operator: string;
}

export interface PesticideForm extends BaseEntity {
  /**
   * 打药记录ID
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
   * 农药名称
   */
  pesticideName?: string | number;

  /**
   * 打药计量（单位：ml/亩）
   */
  pesticideDosage?: string;

  /**
   * 打药时间
   */
  pesticideTime?: string | number;

  /**
   * 操作人
   */
  operator?: string;
}

export interface PesticideQuery extends PageQuery {
  /**
   * 溯源码
   */
  traceCode?: string;

  /**
   * 地块信息
   */
  plotInfo?: string;

  /**
   * 农药名称
   */
  pesticideName?: string | number;

  /**
   * 打药计量（用于搜索）
   */
  pesticideDosage?: string;

  /**
   * 打药时间
   */
  pesticideTime?: string | number;

  /**
   * 操作人
   */
  operator?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
