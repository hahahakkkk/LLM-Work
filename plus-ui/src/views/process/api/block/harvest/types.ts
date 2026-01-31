export interface HarvestVO {
  /**
   * 溯源码
   */
  traceCode: string;

  /**
   * 地块信息
   */
  plotInfo: string;

  /**
   * 收割时间
   */
  harvestTime: string;

  /**
   * 操作人
   */
  operator: string;
}

export interface HarvestForm extends BaseEntity {
  /**
   * 溯源码
   */
  traceCode?: string;

  /**
   * 地块信息
   */
  plotInfo?: string;

  /**
   * 收割时间
   */
  harvestTime?: string;

  /**
   * 操作人
   */
  operator?: string;
}

export interface HarvestQuery extends PageQuery {
  /**
   * 地块信息
   */
  plotInfo?: string;

  /**
   * 收割时间
   */
  harvestTime?: string;

  /**
   * 操作人
   */
  operator?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
