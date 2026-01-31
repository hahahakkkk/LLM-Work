export interface WarningVO {
  /**
   * 自增主键
   */
  id: string | number;

  /**
   * 预警等级
   */
  warningLevel: string;

  /**
   * 预测日期
   */
  predictionDate: string;

  /**
   * 平均温度（℃，过去七天平均）
   */
  tmean: number;

  /**
   * 平均相对湿度（%，过去七天的平均）
   */
  rhMean: number;

  /**
   * 日照时间（h，过去七天平均）
   */
  ssd: number;

  /**
   * 累计降水量（mm，过去七天累计）
   */
  rf: number;

  /**
   * 参考作物蒸散量（mm，过去七天平均）
   */
  et0: number;

  /**
   * 建议措施
   */
  recommendation: string;
}

export interface WarningForm extends BaseEntity {
  /**
   * 预警等级
   */
  warningLevel?: string;

  /**
   * 预测日期
   */
  predictionDate?: string;

  /**
   * 平均温度（℃，过去七天平均）
   */
  tMean?: number;

  /**
   * 平均相对湿度（%，过去七天的平均）
   */
  rhMean?: number;

  /**
   * 日照时间（h，过去七天平均）
   */
  SSD?: number;

  /**
   * 累计降水量（mm，过去七天累计）
   */
  RF?: number;

  /**
   * 参考作物蒸散量（mm，过去七天平均）
   */
  ET0?: number;

  /**
   * 建议措施
   */
  recommendation?: string;
}

export interface WarningQuery extends PageQuery {
  /**
   * 自增主键
   */
  id?: string | number;

  /**
   * 预警等级
   */
  warningLevel?: string;

  /**
   * 预测日期
   */
  predictionDate?: string;

  /**
   * 平均温度（℃，过去七天平均）
   */
  tMean?: number;

  /**
   * 平均相对湿度（%，过去七天的平均）
   */
  rhMean?: number;

  /**
   * 日照时间（h，过去七天平均）
   */
  SSD?: number;

  /**
   * 累计降水量（mm，过去七天累计）
   */
  RF?: number;

  /**
   * 参考作物蒸散量（mm，过去七天平均）
   */
  ET0?: number;

  /**
   * 建议措施
   */
  recommendation?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
