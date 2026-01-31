export interface FertilizerUseVO {
  /**
   * 使用记录ID
   */
  useId: string | number;

  /**
   * 使用日期
   */
  useTime: string;

  /**
   * 肥料名称
   */
  fertilizerId: string | number;

  /**
   * 用途
   */
  useFor: string;

  /**
   * 使用量
   */
  useAmount: string;

  /**
   * 使用人
   */
  useBy: string;

  /**
   * 操作人
   */
  farmerId: string | number;

  /**
   * 施肥方式
   */
  useMethod: string | number;

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
  /**
   * 非农户名称
   */
  nonFarmer: string;

  /**
   * 采购人类型(0 农户，1 非农户)
   */
  buyerType: string;
  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;
  useTimes?: string[];
}

export interface FertilizerUseForm extends BaseEntity {
  /**
   * 使用记录ID
   */
  useId?: string | number;

  /**
   * 使用日期
   */
  useTime?: string;

  /**
   * 肥料名称
   */
  fertilizerId?: string | number;

  /**
   * 用途
   */
  useFor?: string;

  /**
   * 使用量
   */
  useAmount?: string;

  /**
   * 使用人
   */
  useBy?: string;

  /**
   * 操作人
   */
  farmerId?: string | number;

  /**
   * 施肥方式
   */
  useMethod?: string | number;

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
   * 非农户名称
   */
  nonFarmer?: string;

  /**
   * 采购人类型(0 农户，1 非农户)
   */
  buyerType?: string;
  useTimes?: string[];
}

export interface FertilizerUseQuery extends PageQuery {
  /**
   * 使用日期
   */
  useTime?: string;

  /**
   * 肥料名称
   */
  fertilizerId?: string | number;

  /**
   * 用途
   */
  useFor?: string;

  /**
   * 使用量
   */
  useAmount?: string;

  /**
   * 使用人
   */
  useBy?: string;

  /**
   * 操作人
   */
  farmerId?: string | number;

  /**
   * 施肥方式
   */
  useMethod?: string | number;

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
  /**
   * 非农户名称
   */
  nonFarmer?: string;

  /**
   * 采购人类型(0 农户，1 非农户)
   */
  buyerType?: string;
  useTimes?: string[];
}
