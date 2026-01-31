export interface LandLevelVO {
  /**
   * 所属基地
   */
  baseId: string | number;
  /**
   * 地力ID
   */
  llId: string | number;

  /**
   * 地块ID
   */
  landId: string | number;

  /**
   * 年份
   */
  llYear: string;

  /**
   * 地力综合指数
   */
  landIfi: number;

  /**
   * 地力等级
   */
  landLevel: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;
  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;
}

export interface LandLevelForm extends BaseEntity {
  /**
   * 所属基地
   */
  baseId?: string | number;
  /**
   * 地力ID
   */
  llId?: string | number;

  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 年份
   */
  llYear?: string;

  /**
   * 地力综合指数
   */
  landIfi?: number;

  /**
   * 地力等级
   */
  landLevel?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;
  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;
}

export interface LandLevelQuery extends PageQuery {
  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 年份
   */
  llYear?: string;

  /**
   * 地力综合指数
   */
  landIfi?: number;

  /**
   * 地力等级
   */
  landLevel?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;
}
