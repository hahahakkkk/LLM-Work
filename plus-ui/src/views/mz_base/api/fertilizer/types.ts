export interface FertilizerVO {
  /**
   * 肥料ID
   */
  fertilizerId: string | number;

  /**
   * 肥料名称
   */
  fertiName: string;

  /**
   * 肥料类型（氮肥、磷肥、钾肥、复合肥）
   */
  fertiType: string;

  /**
   * 肥料含量
   */
  fertiContent: number;

  /**
   * 氮含量
   */
  contentN: number;

  /**
   * 磷含量
   */
  contentP: number;

  /**
   * 钾含量
   */
  contentK: number;

  /**
   * 生产厂家
   */
  manufacturer: string;

  /**
   * 供应商
   */
  supplier: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

}

export interface FertilizerForm extends BaseEntity {
  /**
   * 肥料ID
   */
  fertilizerId?: string | number;

  /**
   * 肥料名称
   */
  fertiName?: string;

  /**
   * 肥料类型（氮肥、磷肥、钾肥、复合肥）
   */
  fertiType?: string;

  /**
   * 肥料含量
   */
  fertiContent?: number;

  /**
   * 氮含量
   */
  contentN?: number;

  /**
   * 磷含量
   */
  contentP?: number;

  /**
   * 钾含量
   */
  contentK?: number;

  /**
   * 生产厂家
   */
  manufacturer?: string;

  /**
   * 供应商
   */
  supplier?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

}

export interface FertilizerQuery extends PageQuery {

  /**
   * 肥料名称
   */
  fertiName?: string;

  /**
   * 肥料类型（氮肥、磷肥、钾肥、复合肥）
   */
  fertiType?: string;

  /**
   * 肥料含量
   */
  fertiContent?: number;

  /**
   * 氮含量
   */
  contentN?: number;

  /**
   * 磷含量
   */
  contentP?: number;

  /**
   * 钾含量
   */
  contentK?: number;

  /**
   * 生产厂家
   */
  manufacturer?: string;

  /**
   * 供应商
   */
  supplier?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



