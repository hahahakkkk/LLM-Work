export interface AgricultureActivityVO {
  /**
   * 农艺活动ID
   */
  activityId: string | number;

  /**
   * 农艺活动地块
   */
  landId: string | number;

  /**
   * 谷子品种
   */
  milletType: string;

  /**
   * 农艺活动
   */
  activityName: string;

  /**
   * 用法
   */
  useMethod: string;

  /**
   * 用量
   */
  useAmount: string;

  /**
   * 下发人
   */
  issueBy: string;

  /**
   * 执行人
   */
  executeBy: string;

  /**
   * 执行时间
   */
  executeTime: string;

  /**
   * 任务完成状态
   */
  taskProgress: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

}

export interface AgricultureActivityForm extends BaseEntity {
  /**
   * 农艺活动ID
   */
  activityId: string | number;
  
  /**
   * 农艺活动地块
   */
  landId?: string | number;

  /**
   * 谷子品种
   */
  milletType?: string;

  /**
   * 农艺活动
   */
  activityName?: string;

  /**
   * 用法
   */
  useMethod?: string;

  /**
   * 用量
   */
  useAmount?: string;

  /**
   * 下发人
   */
  issueBy?: string;

  /**
   * 执行人
   */
  executeBy?: string;

  /**
   * 执行时间
   */
  executeTime?: string;

  /**
   * 任务完成状态
   */
  taskProgress?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

}

export interface AgricultureActivityQuery extends PageQuery {

  /**
   * 农艺活动ID
   */
  activityId?: string | number;

  /**
   * 农艺活动地块
   */
  landId?: string | number;

  /**
   * 谷子品种
   */
  milletType?: string;

  /**
   * 农艺活动
   */
  activityName?: string;

  /**
   * 用法
   */
  useMethod?: string;

  /**
   * 用量
   */
  useAmount?: string;

  /**
   * 下发人
   */
  issueBy?: string;

  /**
   * 执行人
   */
  executeBy?: string;

  /**
   * 执行时间
   */
  executeTime?: string;

  /**
   * 任务完成状态
   */
  taskProgress?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



