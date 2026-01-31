export interface AgricultureSituationReportVO {
  /**
   * 上报记录ID
   */
  reportId: string | number;

  /**
   * 农情发生地块
   */
  landId: string | number;

  /**
   * 上报内容
   */
  reportContent: string;

  /**
   * 上报时间
   */
  reportTime: string;

  /**
   * 上报人
   */
  reportBy: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

}

export interface AgricultureSituationReportForm extends BaseEntity {
  /**
   * 上报记录ID
   */
  reportId: string | number;

  /**
   * 农情发生地块
   */
  landId?: string | number;

  /**
   * 上报内容
   */
  reportContent?: string;

  /**
   * 上报时间
   */
  reportTime?: string;

  /**
   * 上报人
   */
  reportBy?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

}

export interface AgricultureSituationReportQuery extends PageQuery {
  /**
   * 上报记录ID
   */
  reportId?: string | number;

  /**
   * 农情发生地块
   */
  landId?: string | number;

  /**
   * 上报内容
   */
  reportContent?: string;

  /**
   * 上报时间
   */
  reportTime?: string;

  /**
   * 上报人
   */
  reportBy?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



