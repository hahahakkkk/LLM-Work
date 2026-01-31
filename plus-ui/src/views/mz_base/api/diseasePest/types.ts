export interface DiseasePestVO {
  /**
   * 病虫害ID
   */
  dpId: string | number;

  /**
   * 所属基地
   */
  baseId: string | number;

  /**
   * 病虫害名称
   */
  dpName: string;

  /**
   * 病虫害面积
   */
  dpArea: number;

  /**
   * 危害程度
   */
  dpLevel: string;

  /**
   * 谷子生长期
   */
  growthPeriod: string;

  /**
   * 年份
   */
  dpNf: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

  baseName: string;
}

export interface DiseasePestForm extends BaseEntity {
  /**
   * 病虫害ID
   */
  dpId: string | number;

  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 病虫害名称
   */
  dpName?: string;

  /**
   * 病虫害面积
   */
  dpArea?: number;

  /**
   * 危害程度
   */
  dpLevel?: string;

  /**
   * 谷子生长期
   */
  growthPeriod?: string;

  /**
   * 年份
   */
  dpNf?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  baseName?: string;

  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;
}

export interface DiseasePestQuery extends PageQuery {
  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 病虫害名称
   */
  dpName?: string;

  /**
   * 病虫害面积
   */
  dpArea?: number;

  /**
   * 危害程度
   */
  dpLevel?: string;

  /**
   * 谷子生长期
   */
  growthPeriod?: string;

  /**
   * 年份
   */
  dpNf?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  baseName?: string;

  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;
}
