export interface WafVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 基地编号
   */
  baseId: string | number;

  /**
   * 地块编号
   */
  plotId: string | number;

  /**
   * 预警时间
   */
  alertTime: string;

  /**
   * 预警信息
   */
  alertInfo: string;

  /**
   * 预警种类
   */
  alertType: string;

  /**
   * 是否处理
   */
  isProcessed: number;

  /**
   * 生长时期
   */
  device: string;
}

export interface WafForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 基地编号
   */
  baseId?: string | number;

  /**
   * 地块编号
   */
  plotId?: string | number;

  /**
   * 预警时间
   */
  alertTime?: string;

  /**
   * 预警信息
   */
  alertInfo?: string;

  /**
   * 预警种类
   */
  alertType?: string;

  /**
   * 是否处理
   */
  isProcessed?: number;

  /**
   * 生长时期
   */
  device?: string;
}

export interface WafQuery extends PageQuery {
  /**
   * 基地编号
   */
  baseId?: string | number;

  /**
   * 地块编号
   */
  plotId?: string | number;

  /**
   * 排序字段
   */
  orderByColumn?: string;

  /**
   * 排序方向（asc/desc）
   */
  isAsc?: string;

  /**
   * 预警时间
   */
  alertTime?: string;

  /**
   * 预警信息
   */
  alertInfo?: string;

  /**
   * 预警种类
   */
  alertType?: string;

  /**
   * 是否处理
   */
  isProcessed?: number;

  /**
   * 生长时期
   */
  device?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
