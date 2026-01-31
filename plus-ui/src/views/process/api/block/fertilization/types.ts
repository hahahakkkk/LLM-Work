export interface FertilizationVO {
  /**
   * 施肥记录ID
   */
  id: string | number;

  /**
   * 跟踪代码
   */
  traceCode: string;

  /**
   * 地块信息
   */
  plotInfo: string;

  /**
   * 肥料名称
   */
  fertilizerName: string;

  /**
   * 施肥时间
   */
  fertilizationTime: string;

  /**
   * 施肥量（单位：kg/亩）
   */
  fertilizerDosage: string;

  /**
   * 施肥方式（字典值：0=机械沟施, 1=人工穴施）
   */
  fertilizationMethod: string;

  /**
   * 操作人
   */
  operator: string;
}

export interface FertilizationForm extends BaseEntity {
  /**
   * 施肥记录ID
   */
  id?: string | number;

  /**
   * 跟踪代码
   */
  traceCode?: string;

  /**
   * 地块信息
   */
  plotInfo?: string;

  /**
   * 肥料名称
   */
  fertilizerName?: string;

  /**
   * 施肥量（单位：kg/亩）
   */
  fertilizerDosage?: string;

  /**
   * 施肥方式（字典值：0=机械沟施, 1=人工穴施）
   */
  fertilizationMethod?: string;

  /**
   * 施肥时间
   */
  fertilizationTime?: string;

  /**
   * 操作人
   */
  operator?: string;
}

export interface FertilizationQuery extends PageQuery {
  /**
   * 跟踪代码
   */
  traceCode?: string;

  /**
   * 地块信息
   */
  plotInfo?: string;

  /**
   * 肥料名称
   */
  fertilizerName?: string;

  /**
   * 施肥量（用于搜索）
   */
  fertilizerDosage?: string;

  /**
   * 施肥方式（用于搜索）
   */
  fertilizationMethod?: string;

  /**
   * 施肥时间
   */
  fertilizationTime?: string;

  /**
   * 操作人
   */
  operator?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
