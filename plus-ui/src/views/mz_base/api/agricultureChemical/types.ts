export interface AgricultureChemicalVO {
  /**
   * 农药ID
   */
  chemicalId: string | number;

  /**
   * 农药名称
   */
  chemicalName: string;

  /**
   * 批准文号
   */
  chemicalApproval: string;

  /**
   * 剂型
   */
  chemicalForm: string;

  /**
   * 使用范围
   */
  useScope: string;

  /**
   * 使用方法
   */
  useMethod: string;

  /**
   * 安全间隔期
   */
  safeInterval: string;

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

export interface AgricultureChemicalForm extends BaseEntity {
  /**
   * 农药ID
   */
  chemicalId?: string | number;

  /**
   * 农药名称
   */
  chemicalName?: string;

  /**
   * 批准文号
   */
  chemicalApproval?: string;

  /**
   * 剂型
   */
  chemicalForm?: string;

  /**
   * 使用范围
   */
  useScope?: string;

  /**
   * 使用方法
   */
  useMethod?: string;

  /**
   * 安全间隔期
   */
  safeInterval?: string;

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

export interface AgricultureChemicalQuery extends PageQuery {
  /**
   * 农药名称
   */
  chemicalName?: string;

  /**
   * 批准文号
   */
  chemicalApproval?: string;

  /**
   * 剂型
   */
  chemicalForm?: string;

  /**
   * 生产厂家
   */
  manufacturer?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
