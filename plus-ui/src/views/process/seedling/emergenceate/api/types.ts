/**
 * BbiBaseVo，基地信息视图对象 bbi_base
 */
export interface BbiBaseVo {
  /**
   * 基地面积
   */
  baseArea?: number;
  baseId?: number;
  /**
   * 基地所在村
   */
  baseLocation?: string;
  /**
   * 基地名称
   */
  baseName?: string;
  /**
   * 基地类型
   */
  baseType?: string;
  /**
   * 是否有效
   */
  isValid?: string;
  /**
   * 纬度
   */
  lat?: number;
  /**
   * 经度
   */
  lng?: number;
  /**
   * 备注
   */
  remark?: string;
  [property: string]: any;
}

/**
 * TableDataInfoLandUnitVo，表格分页数据对象
 */
export interface Response {
  /**
   * 消息状态码
   */
  code?: number;
  /**
   * 消息内容
   */
  msg?: string;
  /**
   * 列表数据
   */
  rows?: LandUnitVo[];
  /**
   * 总记录数
   */
  total?: number;
  [property: string]: any;
}

/**
 * LandUnitVo，地块管理视图对象 land_unit
 */
export interface LandUnitVo {
  /**
   * 海拔
   */
  altitude?: string;
  /**
   * 所属地
   */
  baseId?: number;
  baseName?: string;
  /**
   * 排水能力
   */
  drainageCapacity?: string;
  /**
   * 地块拥有者
   */
  farmerId?: number;
  farmerName?: string;
  /**
   * 灌溉能力
   */
  irrigationCapacity?: string;
  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string;
  /**
   * 面积
   */
  landArea?: number;
  /**
   * 地块名称
   */
  landCode?: string;
  /**
   * Primary Key
   */
  landId?: number;
  /**
   * 地力等级
   */
  landLevel?: string;
  /**
   * 耕地质地
   */
  landTexture?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 坡度
   */
  slope?: number;
  /**
   * 坡向
   */
  slopeDirection?: string;
  /**
   * 土壤容重
   */
  soilDensity?: number;
  /**
   * 溯源码
   */
  traceSourceCode?: string;
  [property: string]: any;
}

/**
 * TODO: 移除或完善此类型
 * RemoteSenseVo，无人机和卫星遥感数据视图对象 four_remote_sense
 */
export interface RemoteSenseVo {
  /**
   * 基地
   */
  baseId?: number;
  /**
   * 采集时间
   */
  collectTime?: Date;
  /**
   * 采集方式
   */
  collectWay?: string;
  /**
   * 设备编号
   */
  facilityId?: string;
  /**
   * 遥感文件存放位置
   */
  fileLocation?: string;
  /**
   * 主键
   */
  fourId?: number;
  /**
   * 谷子生育期
   */
  growthPeriod?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 上传时间
   */
  uploadTime?: Date;
  [property: string]: any;
}

export interface IdentifyErParams {
  modelId: number;
  images: string[];
}

export interface IdentifyErResponse {
  code: number;
  data: IdentifyErData;
  message: string;
  [property: string]: any;
}

export interface IdentifyErData {
  confidence_threshold: number;
  num_tiles: number;
  overlap: number;
  results: IdentifyErResult[];
  tile_size: number;
  total_seedlings: number;
  [property: string]: any;
}

export interface IdentifyErResult {
  position: number[];
  seedling_count: number;
  tile_id: number;
  [property: string]: any;
}

/** 出苗率历史记录 */
export interface ErHistoryRecord {
  id: number | string;
  baseName: string;
  inspectorUser: string;
  plotName: string;
  longitude: number;
  latitude: number;
  emergenceRate: number;
  totalSeedlings: number;
  plotArea: number;
  seedlingDensity: number;
  originImage: string;
  resultImage: string;
  createTime: string;
  baseId: string; // 基地ID
  plotId: string; // 地块ID
}

/** 出苗率平均信息 */
export interface ErAverageInfo {
  avgEmergence: number;
  abnormalBlock: number;
  todayDetection: number;
  emergenceStandard: number;
}

/** 出苗率历史记录分页响应 */
export interface ErHistoryRecordsPageResponse {
  rows: ErHistoryRecord[];
  total: number;
}

export interface ErSubmitQuery {
  base_name: string;
  base_id: string;
  plot_name: string;
  plot_id: string;
  tif_url: string;
}

export interface ErSubmitResponse {
  task_id: string;
}

export interface ErTaskStatus {
  /**
   * - queued 排队中
   * - running 运行中
   * - done 完成
   */
  status: string;
  /**
   * - queued 排队中 (status 为 queued)
   * - downloading 下载文件中 (status 为 running)
   * - processing 准备处理 (status 为 running)
   * - inferencing AI 模型检测中 (status 为 running)
   * - mapping 结果映射计算中 (status 为 running)
   * - packaging 生成报告打包中 (status 为 running)
   * - done 完成 (status 为 done)
   */
  stage: string;
  progress: number;
  error: string;
  task_id: string;
}

export interface ErTaskResult {
  tifUrl: string;
  baseName: string;
  baseId: string;
  plotName: string;
  plotId: string;
  totalSeedlings: number;
  detectTime: string;
  plotLongitude: string;
  plotLatitude: string;
  emergenceRate: number;
  seedlingDensity: number;
  resultImage: string;
  conclusion: string;
  suggestion: string;
  emergenceLevel: string;
}
