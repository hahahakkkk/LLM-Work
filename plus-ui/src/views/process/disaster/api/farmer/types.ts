export interface FarmerVO {
  /**
   * 农户ID
   */
  farmerId: string | number;
  /**
   * 所属基地
   */
  baseId: string | number;

  /**
   * 姓名
   */
  farmerName: string;

  /**
   * 地址
   */
  farmerAddress: string;

  /**
   * 联系电话
   */
  farmerPhone: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;
}

export interface FarmerForm extends BaseEntity {
  /**
   * 农户ID
   */
  farmerId: string | number;

  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 姓名
   */
  farmerName?: string;

  /**
   * 地址
   */
  farmerAddress?: string;

  /**
   * 联系电话
   */
  farmerPhone?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface FarmerQuery extends PageQuery {
  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 姓名
   */
  farmerName?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}
