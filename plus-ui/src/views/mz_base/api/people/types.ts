export interface PeopleVO {
  /**
   * 人员ID
   */
  peopleId: string | number;

  /**
   * 所属基地
   */
  baseId: string | number;

  /**
   * 姓名
   */
  peopleName: string;

  /**
   * 性别
   */
  peopleSex: string;

  /**
   * 出生日期
   */
  peopleBirth: string;

  /**
   * 联系电话
   */
  peoplePhone: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

  /**
   * 人员类型（0管理员，1技术员）
   */
  peopleType: string;

  /**
   * 人员状态（0离岗，1在岗）
   */
  peopleStatus: string;
}

export interface PeopleForm extends BaseEntity {
  /**
   * 人员ID
   */
  peopleId: string | number;

  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 姓名
   */
  peopleName?: string;

  /**
   * 性别
   */
  peopleSex?: string;

  /**
   * 出生日期
   */
  peopleBirth?: string;

  /**
   * 联系电话
   */
  peoplePhone?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * 人员类型（0管理员，1技术员）
   */
  peopleType?: string;

  /**
   * 人员状态（0离岗，1在岗）
   */
  peopleStatus?: string;
}

export interface PeopleQuery extends PageQuery {
  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 姓名
   */
  peopleName?: string;

  /**
   * 性别
   */
  peopleSex?: string;

  /**
   * 联系电话
   */
  peoplePhone?: string;

  /**
   * 人员类型（0管理员，1技术员）
   */
  peopleType?: string;

  /**
   * 人员状态（0离岗，1在岗）
   */
  peopleStatus?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
