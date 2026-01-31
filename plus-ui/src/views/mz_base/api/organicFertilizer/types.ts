export interface OrganicFertilizerVO {
  /**
   * 有机肥ID
   */
  ofId: string | number;

  /**
   * 有机肥名称
   */
  ofName: string;

  /**
   * 氮含量
   */
  ofN: number;

  /**
   * 磷含量
   */
  ofP: number;

  /**
   * 钾含量
   */
  ofK: number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

}

export interface OrganicFertilizerForm extends BaseEntity {
  /**
   * 有机肥ID
   */
  ofId?: string | number;

  /**
   * 有机肥名称
   */
  ofName?: string;

  /**
   * 氮含量
   */
  ofN?: number;

  /**
   * 磷含量
   */
  ofP?: number;

  /**
   * 钾含量
   */
  ofK?: number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

}

export interface OrganicFertilizerQuery extends PageQuery {

  /**
   * 有机肥名称
   */
  ofName?: string;

  /**
   * 氮含量
   */
  ofN?: number;

  /**
   * 磷含量
   */
  ofP?: number;

  /**
   * 钾含量
   */
  ofK?: number;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



