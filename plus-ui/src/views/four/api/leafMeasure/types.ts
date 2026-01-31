export interface LeafMeasureVO {
  /**
   * 主键
   */
  fourId: string | number;

  /**
   * 基地
   */
  baseId: string | number;

  /**
   * 叶片序号
   */
  leafId: string | number;

  /**
   * 叶面积
   */
  leafArea: string;

  /**
   * 叶长
   */
  leafLength: string;

  /**
   * 叶宽
   */
  leafWidth: string | number;

  /**
   * 长宽比
   */
  aspectRatio: string;

  /**
   * 谷子生育期
   */
  growthPeriod: string;

  /**
   * 采集时间
   */
  collectTime: string;

  /**
   * 备注
   */
  remark: string;

}

export interface LeafMeasureForm extends BaseEntity {
  /**
   * 叶面积测量数据ID
   */
  fourId?: string | number;

  /**
   * 基地
   */
  baseId?: string | number;

  /**
   * 叶片序号
   */
  leafId?: string | number;

  /**
   * 叶面积
   */
  leafArea?: string;

  /**
   * 叶长
   */
  leafLength?: string;

  /**
   * 叶宽
   */
  leafWidth?: string | number;

  /**
   * 长宽比
   */
  aspectRatio?: string;

  /**
   * 谷子生育期
   */
  growthPeriod?: string;

  /**
   * 采集时间
   */
  collectTime?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface LeafMeasureQuery extends PageQuery {

  /**
   * 基地
   */
  baseId?: string | number;

  /**
   * 谷子生育期
   */
  growthPeriod?: string;

  /**
   * 采集时间
   */
  collectTime?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



