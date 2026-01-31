export interface PlantVO {
  /**
   * 溯源码
   */
  traceCode: string;

  /**
   * 种子信息
   */
  seedInfo: string;

  /**
   * 地块信息
   */
  plotInfo: string;

  /**
   * 播种时间
   */
  sowingTime: string;

  /**
   * 操作人
   */
  operator: string;

  /**
   * 溯源二维码存储地址
   */
  qrCode: string;

  /**
   * 条形码存储地址
   */
  barcode: string;
}

export interface PlantForm extends BaseEntity {
  /**
   * 溯源码
   */
  traceCode?: string;

  /**
   * 种子信息
   */
  seedInfo?: string;

  /**
   * 地块信息
   */
  plotInfo?: string;

  /**
   * 播种时间
   */
  sowingTime?: string;

  /**
   * 操作人
   */
  operator?: string;

  /**
   * 溯源二维码存储地址
   */
  qrCode?: string;

  /**
   * 条形码存储地址
   */
  barcode?: string;
}

export interface PlantQuery extends PageQuery {
  /**
   * 种子信息
   */
  seedInfo?: string;

  /**
   * 地块信息
   */
  plotInfo?: string;

  /**
   * 播种时间
   */
  sowingTime?: string;

  /**
   * 操作人
   */
  operator?: string;

  /**
   * 溯源二维码存储地址
   */
  qrCode?: string;

  /**
   * 条形码存储地址
   */
  barcode?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
