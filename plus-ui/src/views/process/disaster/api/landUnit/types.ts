export interface LandUnitVO {
  /**
   * Primary Key
   */
  landId: string | number;

  /**
   * 所属地
   */
  baseId: string | Number;

  /**
   * 地块名称
   */
  landCode: string;

  /**
   *
   * 面积
   */
  landArea: Number;

  /**
   * 地力等级
   */
  landLevel: Number;

  /**
   * 农户
   */
  farmerId: string | Number;

  /**
   * 灌溉能力
   */
  irrigationCapacity: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 坡度
   */
  slope: number;

  /**
   * 坡向
   */
  slopeDirection: string;

  /**
   * 海拔
   */
  altitude: string;

  /**
   * 耕地质地
   */
  landTexture: string;

  /**
   * 土壤容重
   */
  soilDensity: number | string;

  /**
   * 排水能力
   */
  drainageCapacity: string;
}

export interface LandUnitForm extends BaseEntity {
  /**
   * Primary Key
   */
  landId?: string | number;

  /**
   * 地块名称
   */
  landCode?: string;

  /**
   * 所属地
   */
  baseId?: string | number;

  /**
   * Gis文本信息
   */
  geomText?: string;
  /**
   * 面积
   */
  landArea?: number;

  /**
   * 地力等级
   */
  landLevel: Number;

  /**
   * 农户
   */
  farmerId: string | Number;

  /**
   * 灌溉能力
   */
  irrigationCapacity?: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 坡度
   */
  slope?: number;

  /**
   * 坡向
   */
  slopeDirection?: string;

  /**
   * 海拔
   */
  altitude?: string;

  /**
   * 耕地质地
   */
  landTexture?: string;

  /**
   * 土壤容重
   */
  soilDensity?: number | string;

  /**
   * 排水能力
   */
  drainageCapacity?: string;
}

export interface LandUnitQuery extends PageQuery {
  /**
   * 地块名称
   */
  landCode?: string;

  /**
   * 所属基地
   */
  baseId?: string;

  /**
   * 地块拥有者
   */
  farmerId?: string | number;

  /**
   * 灌溉能力
   */
  irrigationCapacity?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * 坡度
   */
  slope?: number;

  /**
   * 坡向
   */
  slopeDirection?: string;

  /**
   * 海拔
   */
  altitude?: string;

  /**
   * 排水能力
   */
  drainageCapacity?: string;

  /**
   * 土壤容重
   */
  soilDensity?: number | string;

  /**
   * 日期范围参数
   */
  params?: any;
}
