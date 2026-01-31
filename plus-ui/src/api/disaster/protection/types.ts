export interface ProtectionVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 灾害类型
   */
  disasterType: string;

  /**
   * 防护方案
   */
  protectionPlan: string;

  /**
   * 灾害等级
   */
  disasterLevel: string;

  /**
   * 灾害发生时间
   */
  disasterTime: string;
}

export interface ProtectionForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 灾害类型
   */
  disasterType?: string;

  /**
   * 防护方案
   */
  protectionPlan?: string;

  /**
   * 灾害等级
   */
  disasterLevel?: string;

  /**
   * 灾害发生时间
   */
  disasterTime?: string;
}

export interface ProtectionQuery extends PageQuery {
  /**
   * 灾害类型
   */
  disasterType?: string;

  /**
   * 防护方案
   */
  protectionPlan?: string;

  /**
   * 灾害等级
   */
  disasterLevel?: string;

  /**
   * 灾害发生时间
   */
  disasterTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
