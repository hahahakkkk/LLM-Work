export interface StatisticsVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 灾害类型（旱灾/涝灾/冰雹）
   */
  disasterType: string;

  /**
   * 统计月份（格式：2025-06）
   */
  statMonth: string;

  /**
   * 本月预警数量
   */
  warningCount: number;

  /**
   * 本月解除数量
   */
  resolvedCount: number;
}

export interface StatisticsForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 灾害类型（旱灾/涝灾/冰雹）
   */
  disasterType?: string;

  /**
   * 统计月份（格式：2025-06）
   */
  statMonth?: string;

  /**
   * 本月预警数量
   */
  warningCount?: number;

  /**
   * 本月解除数量
   */
  resolvedCount?: number;
}

export interface StatisticsQuery extends PageQuery {
  /**
   * 灾害类型（旱灾/涝灾/冰雹）
   */
  disasterType?: string;

  /**
   * 统计月份（格式：2025-06）
   */
  statMonth?: string;

  /**
   * 本月预警数量
   */
  warningCount?: number;

  /**
   * 本月解除数量
   */
  resolvedCount?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
