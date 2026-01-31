export interface AlertVO {
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
  actionTime: string;

  /**
   * 预警信息
   */
  alertInfo: string;

  /**
   * 预警等级
   */
  alertLevel: string;

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
  growthPeriod: string;
}

export interface AlertForm extends BaseEntity {
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
  actionTime?: string;

  /**
   * 预警信息
   */
  alertInfo?: string;

  /**
   * 预警等级
   */
  alertLevel?: string;

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
  growthPeriod?: string;
}

export interface AlertQuery extends PageQuery {
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
  actionTime?: string;

  /**
   * 预警信息
   */
  alertInfo?: string;

  /**
   * 预警等级
   */
  alertLevel?: string;

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
  growthPeriod?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
