export interface BaseInfoCardVO {
  /**
   * 基地名称
   */
  baseId: string | number;

  /**
   * 基地名称
   */
  baseName: string;

  /**
   * 基地图片链接
   */
  basePhoto: string;

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
   * 经度
   */
  lng: number;

  /**
   * 纬度
   */
  lat: number;

  /**
   * 是否有效
   */
  isValid: string | number;

  /**
   * 备注
   */
  remark: string;
}

export interface BaseInfoCardForm extends BaseEntity {
  /**
   * 基地名称
   */
  baseId: string | number;

  /**
   * 基地名称
   */
  baseName?: string;

  /**
   * 基地图片链接
   */
  basePhoto: string;

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
   * 经度
   */
  lng?: number;

  /**
   * 纬度
   */
  lat?: number;

  /**
   * 是否有效
   */
  isValid?: string | number;

  /**
   * 备注
   */
  remark?: string;
}

export interface BaseInfoCardQuery extends PageQuery {
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
