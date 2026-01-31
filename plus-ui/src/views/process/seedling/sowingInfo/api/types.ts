// ==================== 原有类型定义 ====================
/**
 * 播种信息响应数据类型
 */
export interface SowingInfoData {
  baseName: string; // 基地名称
  variety: string; // 品种
  sowingStartDate: string; // 播种开始日期
  sowingEndDate: string; // 播种结束日期
  sowingRealDate: string; // 实际播种日期
}

/**
 * 播种信息响应类型
 */
export interface SowingInfoResponse {
  code: number;
  msg: string;
  data: SowingInfoData;
}

// ==================== CRUD 类型定义 ====================
/**
 * 播种计划视图对象
 */
export interface PredictVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 基地名
   */
  baseName: string;

  /**
   * 品种
   */
  variety: string;

  /**
   * 预测播种开始日期
   */
  sowingStartDate: string;

  /**
   * 预测播种结束日期
   */
  sowingEndDate: string;
}

/**
 * 播种计划表单对象
 */
export interface PredictForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 基地名
   */
  baseName?: string;

  /**
   * 品种
   */
  variety?: string;

  /**
   * 预测播种开始日期
   */
  sowingStartDate?: string;

  /**
   * 预测播种结束日期
   */
  sowingEndDate?: string;
}

/**
 * 播种计划查询对象
 */
export interface PredictQuery extends PageQuery {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 基地名
   */
  baseName?: string;

  /**
   * 品种
   */
  variety?: string;

  /**
   * 预测播种开始日期
   */
  sowingStartDate?: string;

  /**
   * 预测播种结束日期
   */
  sowingEndDate?: string;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
