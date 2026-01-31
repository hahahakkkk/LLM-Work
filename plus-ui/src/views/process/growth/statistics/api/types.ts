export interface StatisticsVO {
  /**
   * id
   */
  id: string | number;

  /**
   * 基地名称
   */
  baseName: string;

  /**
   * 地块编号
   */
  baseId: string | number;

  /**
   * 采集时间
   */
  time: string;

  /**
   * 生长时期
   */
  period: string;

  /**
   * LAI
   */
  realLai: number;

  /**
   * SPAD
   */
  realSpad: number;

  /**
   * 备注
   */
  remark: string;
}

export interface StatisticsForm extends BaseEntity {
  /**
   * 基地名称
   */
  baseName?: string;

  /**
   * 地块编号
   */
  baseId?: string | number;

  /**
   * 采集时间
   */
  time?: string;

  /**
   * 生长时期
   */
  period?: string;

  /**
   * LAI
   */
  realLai?: number;

  /**
   * SPAD
   */
  realSpad?: number;

  /**
   * 备注
   */
  remark?: string;
}

export interface StatisticsQuery extends PageQuery {
  /**
   * 基地名称
   */
  baseName?: string;

  /**
   * 地块编号
   */
  baseId?: string | number;

  /**
   * 采集时间
   */
  time?: string;

  /**
   * 生长时期
   */
  period?: string;

  /**
   * LAI
   */
  realLai?: number;

  /**
   * SPAD
   */
  realSpad?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
