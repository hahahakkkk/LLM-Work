export interface FarmlandVO {
  /**
   * 区域id
   */
  farmlandId: string | number;

  /**
   * 区域名称
   */
  farmlandName: string;

  /**
   * 版本
   */
  version: number;

  /**
   * 病虫害类别
   */
  pestTypes: string;

  /**
   * 病虫害防治策略
   */
  pestTactics: string;

  /**
   * 原始全景图像
   */
  originImageUrl: string;

  /**
   * 识别处理全景图像
   */
  processedImageUrl: string;

  /**
   *
   */
  createTime: string;

  /**
   *
   */
  updateTime: string;
}

export interface FarmlandForm extends BaseEntity {
  /**
   * 区域id
   */
  farmlandId: string | number;
  /**
   * 区域名称
   */
  farmlandName?: string;

  /**
   * 病虫害类别
   */
  pestTypes?: string;

  /**
   * 病虫害防治策略
   */
  pestTactics: string;

  /**
   * 原始全景图像
   */
  originImageUrl?: string;

  /**
   * 识别处理全景图像
   */
  processedImageUrl?: string;
}

export interface FarmlandQuery extends PageQuery {
  /**
   * 区域id
   */
  farmlandId: string | number;

  /**
   * 区域名称
   */
  farmlandName?: string;

  /**
   * 病虫害类别
   */
  pestTypes?: string;
  /**
   * 原始全景图像
   */
  originImageUrl?: string;

  /**
   * 识别处理全景图像
   */
  processedImageUrl?: string;
  /**
   * 日期范围参数
   */
  params?: any;
}

/** 区域检测记录 */
export interface AreaDetectionRecord {
  id: number;
  baseName: string;
  plotName: string;
  longitude: number;
  latitude: number;
  diseaseType: string;
  incidenceRate: number;
  rgbOriginalImage: string;
  tifOriginalImage: string;
  rgbResultImage: string;
  description: string;
  createBy: string;
  createTime: string;
}

/** 区域检测查询 */
export interface AreaDetectionQuery extends PageQuery {
  /** 区域名称 */
  farmlandName?: string;
  /** 病虫害类别 */
  diseaseType?: string;
  /** 日期范围参数 */
  params?: any;
}

/** 植株检测结果记录 */
export interface PlantResultRecord {
  id: number;
  baseName: string;
  plotCode: string;
  diseaseType: string;
  description: string;
  resultImageUrl: string | null;
  baseId: string;
  plotId: string;
  createTime: string;
}

/** 植株检测结果查询 */
export interface PlantResultQuery extends PageQuery {
  /** 基地名 */
  baseName?: string;
  /** 病虫害类型 */
  diseaseType?: string;
  /** 日期范围参数 */
  params?: any;
}

/** 植株检测统计信息 */
export interface BackPestInfo {
  /** 总数 */
  total: number;
  /** 今日 */
  today: number;
  /** 本周 */
  thisWeek: number;
}
