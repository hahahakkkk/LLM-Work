export interface ConfigVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 灾害类型（旱灾/涝灾/冰雹）
   */
  disasterType: string;

  /**
   * 预警阈值（如降雨量 mm）
   */
  thresholdValue: number;

  /**
   * 是否启用自动预警（0否 1是）
   */
  autoWarningEnabled: number;
}

export interface ConfigForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 灾害类型（旱灾/涝灾/冰雹）
   */
  disasterType?: string;

  /**
   * 预警阈值（如降雨量 mm）
   */
  thresholdValue?: number;

  /**
   * 是否启用自动预警（0否 1是）
   */
  autoWarningEnabled?: number;
}

export interface ConfigQuery extends PageQuery {
  /**
   * 灾害类型（旱灾/涝灾/冰雹）
   */
  disasterType?: string;

  /**
   * 预警阈值（如降雨量 mm）
   */
  thresholdValue?: number;

  /**
   * 是否启用自动预警（0否 1是）
   */
  autoWarningEnabled?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
