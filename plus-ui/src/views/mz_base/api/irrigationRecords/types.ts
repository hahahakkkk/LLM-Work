export interface IrrigationRecordsVO {
  /**
   * 灌溉记录ID
   */
  irrigationId: string | number;

  /**
   * 地块ID
   */
  landId: string | number;

  /**
   * 灌溉时间
   */
  irrigationTime: string;

  /**
   * 灌溉能力
   */
  irrigationCapacity: string;

  /**
   * 灌溉方式
   */
  irrigationMethod: string;

  /**
   * 灌溉总量
   */
  irrigationAmount: string | number;

  /**
   * 操作人-农户
   */
  farmerId: string | number;

  /**
   * 操作人-非农户
   */
  nonFarmer: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

  /**
   * 操作人类型
   */
  operatorType: string;
}

export interface IrrigationRecordsForm extends BaseEntity {
  /**
   * 灌溉记录ID
   */
  irrigationId?: string | number;

  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 地块ID
   */
  landIds?: string | number;

  /**
   * 灌溉时间
   */
  irrigationTime?: string;

  /**
   * 灌溉能力
   */
  irrigationCapacity?: string;

  /**
   * 灌溉方式
   */
  irrigationMethod?: string;

  /**
   * 灌溉总量
   */
  irrigationAmount?: string | number;

  /**
   * 操作人-农户
   */
  farmerId?: string | number;

  /**
   * 操作人-非农户
   */
  nonFarmer?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * 操作人类型
   */
  operatorType?: string;

  irrigationTimes?: [];
}

export interface IrrigationRecordsQuery extends PageQuery {
  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 灌溉时间
   */
  irrigationTime?: string;

  /**
   * 灌溉能力
   */
  irrigationCapacity?: string;

  /**
   * 灌溉方式
   */
  irrigationMethod?: string;

  /**
   * 灌溉总量
   */
  irrigationAmount: string | number;

  /**
   * 操作人-农户
   */
  farmerId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;

  irrigationTimes?: [];
}
