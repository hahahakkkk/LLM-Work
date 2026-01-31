export interface DiagnosisVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 基地名称
   */
  baseName: string;

  /**
   * 地块编号
   */
  plotId: string | number;

  /**
   * 原始图像
   */
  originalImage: string;

  /**
   * 原始图像Url
   */
  originalImageUrl: string;
  /**
   * 生长时期
   */
  growthPeriod: string;

  /**
   * 诊断时间
   */
  diagnosisTime: string;

  /**
   * 诊断模型
   */
  diagnosisModel: string;

  /**
   * LAI反演图像
   */
  laiInversionImage: string;

  /**
   * LAI反演图像Url
   */
  laiInversionImageUrl: string;
  /**
   * SPAD反演图像
   */
  spadInversionImage: string;

  /**
   * SPAD反演图像Url
   */
  spadInversionImageUrl: string;
  /**
   * LAI预测值
   */
  laiPrediction: number;

  /**
   * SPAD预测值
   */
  spadPrediction: number;

  /**
   * 长势等级
   */
  growthLevel: string;

  /**
   * 是否已完成预测（0-未预测，1-已预测）
   */
  isPredicted: number;

  /**
   * 备注
   */
  remark: string;
}

export interface DiagnosisForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 基地编号（修改注释，明确存储的是ID）
   */
  baseName?: string;

  /**
   * 地块编号
   */
  plotId?: string | number;

  /**
   * 原始图像
   */
  originalImage?: string;

  /**
   * 生长时期（修改注释，明确存储的是ID）
   */
  growthPeriod?: string;

  /**
   * 诊断时间
   */
  diagnosisTime?: string;

  /**
   * 诊断模型
   */
  diagnosisModel?: string;

  /**
   * LAI反演图像
   */
  laiInversionImage?: string;

  /**
   * SPAD反演图像
   */
  spadInversionImage?: string;

  /**
   * LAI预测值
   */
  laiPrediction?: number;

  /**
   * SPAD预测值
   */
  spadPrediction?: number;

  /**
   * 长势等级
   */
  growthLevel?: string;

  /**
   * 是否已完成预测（0-未预测，1-已预测）
   */
  isPredicted?: number;

  /**
   * 备注
   */
  remark?: string;
}

export interface DiagnosisQuery extends PageQuery {
  /**
   * 基地名称
   */
  baseName?: string;

  /**
   * 地块编号
   */
  plotId?: string | number;

  /**
   * 生长时期
   */
  growthPeriod?: string;

  /**
   * 诊断时间
   */
  diagnosisTime?: string;

  /**
   * 诊断模型
   */
  diagnosisModel?: string;

  /**
   * 是否已完成预测（0-未预测，1-已预测）
   */
  isPredicted?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
