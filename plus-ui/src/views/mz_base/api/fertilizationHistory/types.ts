export interface FertilizationHistoryVO {
  /**
   * 配方施肥ID
   */
  fertilizationId: string | number;

  /**
   * 配方施肥地块
   */
  landId: string | number;

    /**
   * 配方施肥地块名称
   */
    landCode?: string | number;

  /**
   * 地块养分
   */
  nutrientLand: string;

  /**
   * 目标产量
   */
  outputTarget: number;

  /**
   * 生成100kg籽粒所需的营养
   */
  nutrientNeed: string;

  /**
   * 土壤养分利用率
   */
  nutrientRateSoil: string;

  /**
   * 有机肥养分利用率
   */
  nutrientRateOFertilizer: string;

  /**
   * 肥料养分利用率
   */
  nutrientRateCFertilizer: string;

  /**
   * 有机肥施肥情况
   */
  situationOFertilizer: string;

  /**
   * 复合肥ID
   */
  fertilizerCompound: number;

  /**
   * 氮肥ID
   */
  fertilizerN: number;

  /**
   * 磷肥ID
   */
  fertilizerP: number;

  /**
   * 钾肥ID
   */
  fertilizerK: number;

  /**
   * 复合肥施肥量
   */
  fertilizerCompoundVolumn: number;

  /**
   * 氮肥施肥量
   */
  fertilizerNVolumn: number;

  /**
   * 磷肥施肥量
   */
  fertilizerPVolumn: number;

  /**
   * 钾肥施肥量
   */
  fertilizerKVolumn: number;

  /**
   * 配方概述
   */
  summary: string;

  /**
   * 年份
   */
  yearFertilization: string;

  /**
   * 操作人ID
   */
  operationBy: number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

  /**
   * 调整后复合肥施肥量
   */
  fertilizerCompoundVolumnAdjust: number;

  /**
   * 调整后氮肥施肥量
   */
  fertilizerNVolumnAdjust: number;

  /**
   * 调整后磷肥施肥量
   */
  fertilizerPVolumnAdjust: number;

  /**
   * 调整后钾肥施肥量
   */
  fertilizerKVolumnAdjust: number;

  /**
   * 有机肥施肥情况描述
   */
  situation: string;

  /**
   * 配方描述
   */
  fertilizationDescribe: string;

  /**
   * 调整后配方描述
   */
  fertilizationAdjustDescribe: string;

}

export interface FertilizationHistoryForm extends BaseEntity {
  /**
   * 配方施肥ID
   */
  fertilizationId?: string | number;

  /**
   * 配方施肥地块
   */
  landId?: string | number;

  /**
   * 配方施肥地块名称
   */
  landCode?: string | number;

  /**
   * 地块养分
   */
  nutrientLand?: string;

  /**
   * 目标产量
   */
  outputTarget?: number;

  /**
   * 生成100kg籽粒所需的营养
   */
  nutrientNeed?: string;

  /**
   * 土壤养分利用率
   */
  nutrientRateSoil?: string;

  /**
   * 有机肥养分利用率
   */
  nutrientRateOFertilizer?: string;

  /**
   * 肥料养分利用率
   */
  nutrientRateCFertilizer?: string;

  /**
   * 有机肥施肥情况
   */
  situationOFertilizer?: string;

  /**
   * 复合肥ID
   */
  fertilizerCompound?: number;

  /**
   * 氮肥ID
   */
  fertilizerN?: number;

  /**
   * 磷肥ID
   */
  fertilizerP?: number;

  /**
   * 钾肥ID
   */
  fertilizerK?: number;

  /**
   * 复合肥施肥量
   */
  fertilizerCompoundVolumn?: number;

  /**
   * 氮肥施肥量
   */
  fertilizerNVolumn?: number;

  /**
   * 磷肥施肥量
   */
  fertilizerPVolumn?: number;

  /**
   * 钾肥施肥量
   */
  fertilizerKVolumn?: number;

  /**
   * 配方概述
   */
  summary?: string;

  /**
   * 年份
   */
  yearFertilization?: string;

  /**
   * 操作人ID
   */
  operationBy?: number;

  /**
   * 操作人名称
   */
  operationByName?: String;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * 调整后复合肥施肥量
   */
  fertilizerCompoundVolumnAdjust?: number;

  /**
   * 调整后氮肥施肥量
   */
  fertilizerNVolumnAdjust?: number;

  /**
   * 调整后磷肥施肥量
   */
  fertilizerPVolumnAdjust?: number;

  /**
   * 调整后钾肥施肥量
   */
  fertilizerKVolumnAdjust?: number;

  /**
   * 有机肥施肥情况描述
   */
  situation?: string;

  /**
   * 配方描述
   */
  fertilizationDescribe?: string;

  /**
   * 调整后配方描述
   */
  fertilizationAdjustDescribe?: string;

}

export interface FertilizationHistoryQuery extends PageQuery {

  /**
   * 配方施肥地块
   */
  landId?: string | number;

  /**
   * 配方施肥地块名称
   */
  landCode?: string | number;

  /**
   * 地块养分
   */
  nutrientLand?: string;

  /**
   * 目标产量
   */
  outputTarget?: number;

  /**
   * 生成100kg籽粒所需的营养
   */
  nutrientNeed?: string;

  /**
   * 土壤养分利用率
   */
  nutrientRateSoil?: string;

  /**
   * 有机肥养分利用率
   */
  nutrientRateOFertilizer?: string;

  /**
   * 肥料养分利用率
   */
  nutrientRateCFertilizer?: string;

  /**
   * 有机肥施肥情况
   */
  situationOFertilizer?: string;

  /**
   * 复合肥ID
   */
  fertilizerCompound?: number;

  /**
   * 氮肥ID
   */
  fertilizerN?: number;

  /**
   * 磷肥ID
   */
  fertilizerP?: number;

  /**
   * 钾肥ID
   */
  fertilizerK?: number;

  /**
   * 复合肥施肥量
   */
  fertilizerCompoundVolumn?: number;

  /**
   * 氮肥施肥量
   */
  fertilizerNVolumn?: number;

  /**
   * 磷肥施肥量
   */
  fertilizerPVolumn?: number;

  /**
   * 钾肥施肥量
   */
  fertilizerKVolumn?: number;

  /**
   * 配方概述
   */
  summary?: string;

  /**
   * 年份
   */
  yearFertilization?: string;

  /**
   * 操作人ID
   */
  operationBy?: number;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * 调整后复合肥施肥量
   */
  fertilizerCompoundVolumnAdjust?: number;

  /**
   * 调整后氮肥施肥量
   */
  fertilizerNVolumnAdjust?: number;

  /**
   * 调整后磷肥施肥量
   */
  fertilizerPVolumnAdjust?: number;

  /**
   * 调整后钾肥施肥量
   */
  fertilizerKVolumnAdjust?: number;

  /**
   * 有机肥施肥情况描述
   */
  situation?: string;

  /**
   * 配方描述
   */
  fertilizationDescribe?: string;

  /**
   * 调整后配方描述
   */
  fertilizationAdjustDescribe?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



