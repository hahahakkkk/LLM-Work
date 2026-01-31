export interface LandEvaluationVO {
  /**
   * 所属基地
   */
  baseId: string | number;

  /**
   * 地块ID
   */
  landId: string | number;

  /**
   * 地块面积
   */
  landArea: number;

  /**
   * 地力等级
   */
  landLevel: number;
}

export interface LandEvaluationForm extends BaseEntity {
  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 地块面积
   */
  landArea: number;

  /**
   * 地力等级
   */
  landLevel: number;
}

export interface LandEvaluationQuery extends PageQuery {
  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 地块面积
   */
  landArea: number;

  /**
   * 地力等级
   */
  landLevel: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
