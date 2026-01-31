export interface ForecastVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 基地编号
   */
  baseId: string | number;

  /**
   * 地块编号
   */
  plotId: string | number;

  /**
   * NDVI图像URL
   */
  ndviImageUrl?: string;

  /**
   * 诊断时间
   */
  diagnosisTime: string;

  /**
   * 诊断模型
   */
  diagnosisModel: string;

  /**
   * 原始图像OSS
   */
  originalImageOss: string;

  /**
   * 原始图像URL
   */
  originalImageUrl: string;

  /**
   * 结果图像URL
   */
  resultImageUrl: string;

  /**
   * 成熟度（0:未成熟 1:已成熟）
   */
  ripenessStatus: number;

  /**
   * 种植年份
   */
  plantingYear: number;

  /**
   * 品种
   */
  variety: string;

  /**
   * 种植面积
   */
  plantingArea: number;
}

export interface ForecastForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 基地编号
   */
  baseId?: string | number;

  /**
   * 地块编号
   */
  plotId?: string | number;

  /**
   * NDVI图像URL
   */
  ndviImageUrl?: string;

  /**
   * 诊断时间
   */
  diagnosisTime?: string;

  /**
   * 诊断模型
   */
  diagnosisModel?: string;

  /**
   * 原始图像OSS
   */
  originalImageOss?: string;

  /**
   * 原始图像URL
   */
  originalImageUrl?: string;

  /**
   * 结果图像URL
   */
  resultImageUrl?: string;

  /**
   * 成熟度（0:未成熟 1:已成熟）
   */
  ripenessStatus?: number;

  /**
   * 种植年份
   */
  plantingYear?: number;

  /**
   * 品种
   */
  variety?: string;

  /**
   * 种植面积
   */
  plantingArea?: number;
}

export interface ForecastQuery extends PageQuery {
  /**
   * 基地编号
   */
  baseId?: string | number;

  /**
   * 地块编号
   */
  plotId?: string | number;

  /**
   * 排序字段
   */
  orderByColumn?: string;

  /**
   * 排序方向（asc/desc）
   */
  isAsc?: string;

  /**
   * NDVI图像URL
   */
  ndviImageUrl?: string;

  /**
   * 诊断时间
   */
  diagnosisTime?: string;

  /**
   * 诊断模型
   */
  diagnosisModel?: string;

  /**
   * 原始图像OSS
   */
  originalImageOss?: string;

  /**
   * 原始图像URL
   */
  originalImageUrl?: string;

  /**
   * 结果图像URL
   */
  resultImageUrl?: string;

  /**
   * 成熟度（0:未成熟 1:已成熟）
   */
  ripenessStatus?: number;

  /**
   * 种植年份
   */
  plantingYear?: number;

  /**
   * 品种
   */
  variety?: string;

  /**
   * 种植面积
   */
  plantingArea?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
