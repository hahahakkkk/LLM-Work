export interface SowHarvestVO {
  /**
   * 播种与收割ID
   */
  shId: string | number;

  /**
   * 地块ID
   */
  landId: string | number;

  /**
   * 基地ID
   */
  baseId: string | number;

  /**
   * 年份
   */
  shYear: string;

  /**
   * 种植作物
   */
  plantCrop: string;

  /**
   * 种植谷子品种
   */
  cropVariety: string;

  /**
   * 种子品质
   */
  seedQuality: string;

  /**
   * 播种时间
   */
  sowTime: string;

  /**
   * 播种人
   */
  farmerId: string | number;

  /**
   * 播种人-非农户
   */
  seederExt: string;

  /**
   * 播种人类型（0农户 1非农户）
   */
  seederType: string | number;

  /**
   * 收割时间
   */
  harvestTime: string;

  /**
   * 收割方式
   */
  harvestMethod: string | number;

  /**
   * 收割人-农户
   */
  harvesterFarmer: string | number;

  /**
   * 收割人-非农户
   */
  harvesterExt: string;

  /**
   * 产量
   */
  yeild: string;

  /**
   * 最小产量
   */
  minYield: string;

  /**
   * 最大产量
   */
  maxYield: string;

  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;
}

export interface SowHarvestForm extends BaseEntity {
  /**
   * 播种与收割ID
   */
  shId?: string | number;

  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 地块ID
   */
  landIds?: string | number;

  /**
   * 地块ID
   */
  baseId?: string | number;

  /**
   * 年份
   */
  shYear?: string;

  /**
   * 种植作物
   */
  plantCrop?: string;

  /**
   * 种植谷子品种
   */
  cropVariety?: string;

  /**
   * 种子品质
   */
  seedQuality?: string;

  /**
   * 播种时间
   */
  sowTime?: string;

  /**
   * 播种人
   */
  farmerId?: string | number;

  /**
   * 播种人-非农户
   */
  seederExt?: string;

  /**
   * 播种人类型（0农户 1非农户）
   */
  seederType: string | number;

  /**
   * 收割时间
   */
  harvestTime?: string;

  /**
   * 收割方式
   */
  harvestMethod?: string | number;

  harvesterType: string; // 收割人类型：'0'=农户，'1'=非农户

  /**
   * 收割人-农户
   */
  //harvesterFarmer: string | number;
  harvesterFarmer: string | undefined; // 农户类型的收割人ID

  /**
   * 收割人-非农户
   */
  //harvesterExt: string;
  harvesterExt: string | undefined; // 非农户类型的收割人名称

  /**
   * 产量
   */
  yeild?: string;

  /**
   * 最小产量
   */
  minYield?: string;

  /**
   * 最大产量
   */
  maxYield: string;

  /**
   * 开始年份
   */
  minYear: string;

  /**
   * 结束年份
   */
  maxYear: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface SowHarvestQuery extends PageQuery {
  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 地块ID
   */
  landIds?: string | number;

  /**
   * 基地ID
   */
  baseId?: string | number;

  /**
   * 年份
   */
  shYear?: string;

  /**
   * 种植谷子品种
   */
  cropVariety?: string;

  /**
   * 播种时间
   */
  sowTime?: string;

  /**
   * 种子品质
   */
  seedQuality?: string;

  /**
   * 收割时间
   */
  harvestTime?: string;

  /**
   * 收割方式
   */
  harvestMethod?: string | number;

  /**
   * 产量
   */
  yeild?: string;

  /**
   * 最小产量
   */
  minYield?: string;

  /**
   * 最大产量
   */
  maxYield?: string;

  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
