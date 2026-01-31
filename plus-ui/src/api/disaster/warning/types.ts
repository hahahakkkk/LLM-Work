export interface WarningVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 灾害类型（旱灾/涝灾/冰雹）
   */
  disasterType: string;

  /**
   * 预警等级（蓝/黄/橙/红）
   */
  warningLevel: string;

  /**
   * 预警内容
   */
  warningContent: string;

  /**
   * 预警区域
   */
  region: string;

  /**
   * 发布时间
   */
  issueTime: string;

  /**
   * 有效期至
   */
  validUntil: string | number;

  /**
   * 状态（0-已解除，1-生效中）
   */
  status: number;
}

export interface WarningForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 灾害类型（旱灾/涝灾/冰雹）
   */
  disasterType?: string;

  /**
   * 预警等级（蓝/黄/橙/红）
   */
  warningLevel?: string;

  /**
   * 预警内容
   */
  warningContent?: string;

  /**
   * 预警区域
   */
  region?: string;

  /**
   * 发布时间
   */
  issueTime?: string;

  /**
   * 有效期至
   */
  validUntil?: string | number;

  /**
   * 状态（0-已解除，1-生效中）
   */
  status?: number;
}

export interface WarningQuery extends PageQuery {
  /**
   * 灾害类型（旱灾/涝灾/冰雹）
   */
  disasterType?: string;

  /**
   * 预警等级（蓝/黄/橙/红）
   */
  warningLevel?: string;

  /**
   * 预警内容
   */
  warningContent?: string;

  /**
   * 预警区域
   */
  region?: string;

  /**
   * 发布时间
   */
  issueTime?: string;

  /**
   * 有效期至
   */
  validUntil?: string | number;

  /**
   * 状态（0-已解除，1-生效中）
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
