export interface BaseInfoVO {
  /**
   * 基地名称
   */
  baseId: string | number;
  /**
   * 基地名称
   */
  baseName: string;

  /**
   * 基地所在村
   */
  baseLocation: string;

  /**
   * 基地类型
   */
  baseType: string;

  /**
   * 基地面积
   */
  baseArea: number;

  /**
   * 是否有效
   */
  isValid: string | number;

  /**
   * 备注
   */
  remark: string;
}

export interface BaseInfoForm extends BaseEntity {
  /**
   * 基地名称
   */
  baseId: string | number;
  /**
   * 基地名称
   */
  baseName?: string;

  /**
   * 基地所在村
   */
  baseLocation?: string;

  /**
   * 基地类型
   */
  baseType?: string;

  /**
   * 基地面积
   */
  baseArea?: number;

  /**
   * 是否有效
   */
  isValid?: string | number;

  /**
   * 备注
   */
  remark?: string;
}

export interface BaseInfoQuery extends PageQuery {
  /**
   * 基地名称
   */
  baseName?: string;

  /**
   * 基地所在村
   */
  baseLocation?: string;

  /**
   * 基地类型
   */
  baseType?: string;

  /**
   * 是否有效
   */
  isValid?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}

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

export interface IntegratedDataVO {
  /**
   * 基地ID
   */
  baseId: number | string;

  /**
   * 生长时期
   */
  growthPeriod?: string;

  /**
   * 诊断时间
   */
  detectionTime?: string;

  /**
   * 平均叶面积指数
   */
  avgLai?: number;

  /**
   * 平均SPAD值
   */
  avgSpad?: number;

  /**
   * 长势分布
   */
  growthDistribution?: string;
}
