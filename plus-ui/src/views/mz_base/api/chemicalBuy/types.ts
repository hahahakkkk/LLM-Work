export interface ChemicalBuyVO {
  /**
   * 采购记录ID
   */
  buyId: string | number;

  /**
   * 采购日期
   */
  buyTime: string;

  /**
   * 农药名称
   */
  chemicalId: string | number;

  /**
   * 采购数量
   */
  buyAmount: string;

  /**
   * 采购人
   */
  farmerId: string | number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

  /**
   * 非农户名称
   */
  nonFarmer: string;

  /**
   * 采购人类型(0 农户，1 非农户)
   */
  buyerType: string;
}

export interface ChemicalBuyForm extends BaseEntity {
  /**
   * 采购记录ID
   */
  buyId?: string | number;

  /**
   * 采购日期
   */
  buyTime?: string;

  /**
   * 农药名称
   */
  chemicalId?: string | number;

  /**
   * 采购数量
   */
  buyAmount?: string;

  /**
   * 采购人
   */
  farmerId?: string | number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * 非农户名称
   */
  nonFarmer: string;

  /**
   * 采购人类型(0 农户，1 非农户)
   */
  buyerType: string;

  /**
   * 采购日期
   */
  buyTimes?: [];
}

export interface ChemicalBuyQuery extends PageQuery {
  /**
   * 采购日期
   */
  buyTime?: string;

  /**
   * 农药名称
   */
  chemicalId?: string | number;

  /**
   * 采购人
   */
  farmerId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;

  /**
   * 非农户名称
   */
  nonFarmer: string;

  /**
   * 采购人类型(0 农户，1 非农户)
   */
  buyerType: string;

  /**
   * 采购日期
   */
  buyTimes?: [];
}
