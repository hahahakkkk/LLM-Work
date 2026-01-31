export interface WafVO {
  /**
   *
   */
  id: string | number;

  /**
   * 基地编号
   */
  baseId: number;

  /**
   * 地块编号
   */
  plotId: number;

  /**
   * 生长时期
   */
  growthPeriod: string;

  /**
   * 叶面积指数
   */
  lai: number;

  /**
   * SPAD值
   */
  spad: number;

  /**
   * 长势等级 ('良好', '正常', '较差')
   */
  growthLevel: string;

  /**
   * 缺水等级('重度','中度','轻微','不缺水')
   */
  waterLevel: string;

  /**
   * 本次应灌水量(m³/亩)
   */
  applyM3PerMu: number;

  /**
   * 模型给出的灌溉上限（真实体积含水量）
   */
  upperReal: number;

  /**
   * 模型给出的灌溉下限（真实体积含水量）
   */
  lowerReal: number;

  /**
   * 缺肥等级('轻微', '中度', '重度')
   */
  nutrientLevel: string;

  /**
   * 诊断模型
   */
  diagnosisModel: string;

  /**
   * 备注
   */
  remark: string;
}

export interface WafForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   * 基地编号（修改注释，明确存储的是ID）
   */
  baseId?: string | number;

  /**
   * 地块编号（修改注释，明确存储的是ID）
   */
  plotId?: string | number;

  /**
   * 生长时期（修改注释，明确存储的是ID）
   */
  growthPeriod?: string;

  /**
   * 叶面积指数
   */
  lai?: number;

  /**
   * SPAD值
   */
  spad?: number;

  /**
   * 长势等级 ('良好', '正常', '较差')
   */
  growthLevel?: string;

  /**
   * 缺水等级('重度','中度','轻微','不缺水')
   */
  waterLevel?: string;

  /**
   * 本次应灌水量(m³/亩)
   */
  applyM3PerMu?: number;

  /**
   * 模型给出的灌溉上限（真实体积含水量）
   */
  upperReal?: number;

  /**
   * 模型给出的灌溉下限（真实体积含水量）
   */
  lowerReal?: number;

  /**
   * 缺肥等级('轻微', '中度', '重度')
   */
  nutrientLevel?: string;

  /**
   * 诊断模型
   */
  diagnosisModel?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface WafQuery extends PageQuery {
  /**
   * 基地编号
   */
  baseId?: string | number;

  /**
   * 地块编号
   */
  plotId?: string | number;

  /**
   * 生长时期
   */
  growthPeriod?: string;

  /**
   * 叶面积指数
   */
  lai?: number;

  /**
   * SPAD值
   */
  spad?: number;

  /**
   * 长势等级 ('良好', '正常', '较差')
   */
  growthLevel?: string;

  /**
   * 缺水等级('重度','中度','轻微','不缺水')
   */
  waterLevel?: string;

  /**
   * 本次应灌水量(m³/亩)
   */
  applyM3PerMu?: number;

  /**
   * 模型给出的灌溉上限（真实体积含水量）
   */
  upperReal?: number;

  /**
   * 模型给出的灌溉下限（真实体积含水量）
   */
  lowerReal?: number;

  /**
   * 缺肥等级('轻微', '中度', '重度')
   */
  nutrientLevel?: string;

  /**
   * 诊断模型
   */
  diagnosisModel?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
