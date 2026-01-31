export interface EquipmentVO {
  /**
   * 设备ID
   */
  equipId: string | number;

  /**
   * 所属基地
   */
  baseId: string | number;

  orderByColumn?: string;
  isAsc?: string;
  /**
   * 所属基地名称
   */
  baseName: string;

  /**
   * 设备名称
   */
  equipName: string;

  /**
   * 设备类型
   */
  equipType: string;

  /**
   * 设备功能
   */
  equipFunction: string;

  /**
   * 设备购置时间
   */
  buyDate: string;

  /**
   * 购买价格
   */
  buyPrice: string;

  /**
   * 设备状态
   */
  equipStatus: string;

  /**
   * Gis文本信息
   */
  geomText: string;

  /**
   * 设备数量
   */
  equipCount: number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

  /**
   * GIS信息
   */
  geometry: string;
}

export interface EquipmentForm extends BaseEntity {
  /**
   * 设备ID
   */
  equipId: string | number;

  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 所属基地名称
   */
  baseName: string;

  /**
   * 设备名称
   */
  equipName?: string;

  /**
   * 设备类型
   */
  equipType?: string;

  /**
   * 设备功能
   */
  equipFunction?: string;

  /**
   * 设备购置时间
   */
  buyDate?: string;

  /**
   * 购买价格
   */
  buyPrice?: string;

  /**
   * 设备状态
   */
  equipStatus?: string;

  /**
   * Gis文本信息
   */
  geomText?: string;

  /**
   * 设备数量
   */
  equipCount?: number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * GIS信息
   */
  geometry?: string;
}

export interface EquipmentQuery extends PageQuery {
  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 所属基地名称
   */
  baseName: string;

  /**
   * 设备名称
   */
  equipName?: string;

  /**
   * 设备类型
   */
  equipType?: string;

  /**
   * 设备功能
   */
  equipFunction?: string;

  /**
   * 购买价格
   */
  buyPrice?: string;

  /**
   * 设备状态
   */
  equipStatus?: string;

  /**
   * 设备状态
   */
  equipCount?: number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * GIS信息
   */
  geometry?: string;

  /**
   * 经度
   */
  lng?: number;

  /**
   * 纬度
   */
  lat?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
