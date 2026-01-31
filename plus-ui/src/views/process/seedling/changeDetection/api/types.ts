export interface ChangeAnalysisVO {
  /**
   * 主键ID，自增
   */
  id: string | number;

  /**
   * 基地ID
   */
  baseId: string | number;

  /**
   * 基地名称
   */
  baseName: string;

  /**
   * 地块ID
   */
  landId: string | number;

  /**
   * 地块编码
   */
  landCode: string;

  /**
   * 地块原始面积（亩）
   */
  landAreaMu: number;

  /**
   * 新增面积（亩）
   */
  increasedAreaMu: number;

  /**
   * 减少面积（亩）
   */
  decreasedAreaMu: number;
}

export interface ChangeAnalysisForm extends BaseEntity {
  /**
   * 主键ID，自增
   */
  id?: string | number;

  /**
   * 基地ID
   */
  baseId?: string | number;

  /**
   * 基地名称
   */
  baseName?: string;

  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 地块编码
   */
  landCode?: string;

  /**
   * 地块原始面积（亩）
   */
  landAreaMu?: number;

  /**
   * 新增面积（亩）
   */
  increasedAreaMu?: number;

  /**
   * 减少面积（亩）
   */
  decreasedAreaMu?: number;
}

export interface ChangeAnalysisQuery extends PageQuery {
  /**
   * 主键ID，自增
   */
  id?: string | number;

  /**
   * 基地ID
   */
  baseId?: string | number;

  /**
   * 基地名称
   */
  baseName?: string;

  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 地块编码
   */
  landCode?: string;

  /**
   * 地块原始面积（亩）
   */
  landAreaMu?: number;

  /**
   * 新增面积（亩）
   */
  increasedAreaMu?: number;

  /**
   * 减少面积（亩）
   */
  decreasedAreaMu?: number;

  /**
   * 创建时间，自动更新
   */
  createTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
