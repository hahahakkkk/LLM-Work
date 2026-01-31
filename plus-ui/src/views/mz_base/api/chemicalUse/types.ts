export interface ChemicalUseVO {
  /**
   * 使用记录ID
   */
  useId: string | number;

  /**
   * 使用日期
   */
  useTime: string;

  /**
   * 农药名称
   */
  chemicalId: string | number;

  /**
   * 用途
   */
  useFor: string;

  /**
   * 使用量
   */
  useAmount: string;

  /**
   * 操作人
   */
  farmerId: string | number;

  /**
   * 非农户名称
   */
  nonFarmer: string;

  /**
   * 操作人类型(0 农户，1 非农户)
   */
  userType: string;

  /**
   * 使用地块
   */
  landId: string | number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;
}

export interface ChemicalUseForm extends BaseEntity {
  /**
   * 使用记录ID
   */
  useId?: string | number;

  /**
   * 使用日期
   */
  useTime?: string;

  /**
   * 农药名称
   */
  chemicalId?: string | number;

  /**
   * 用途
   */
  useFor?: string;

  /**
   * 使用量
   */
  useAmount?: string;

  /**
   * 操作人
   */
  farmerId?: string | number;

  /**
   * 非农户名称
   */
  nonFarmer?: string;

  /**
   * 操作人类型(0 农户，1 非农户)
   */
  userType?: string;

  /**
   * 使用地块
   */
  landId?: string | number;

  /**
   * 使用地块
   */
  landIds?: string | number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * 使用日期
   */
  useTimes?: [];
}

export interface ChemicalUseQuery extends PageQuery {
  /**
   * 使用日期
   */
  useTime?: string;

  /**
   * 使用日期
   */
  useTimes?: [];

  /**
   * 农药名称
   */
  chemicalId?: string | number;

  /**
   * 用途
   */
  useFor?: string;

  /**
   * 使用量
   */
  useAmount?: string;

  /**
   * 操作人
   */
  farmerId?: string | number;

  /**
   * 非农户名称
   */
  nonFarmer?: string;

  /**
   * 操作人类型(0 农户，1 非农户)
   */
  userType?: string;

  /**
   * 使用地块
   */
  landId?: string | number;

  /**
   * 使用地块
   */
  landIds?: string | number;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}
