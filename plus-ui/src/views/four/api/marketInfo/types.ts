export interface MarketInfoVO {
  /**
   * 主键
   */
  marketId: string | number;

  /**
   * 时间
   */
  dataTime: string;

  /**
   * 地区
   */
  area: string;

  /**
   * 品类
   */
  category: string;

  /**
   * 价格（元/斤）
   */
  price: number;

  /**
   * 涨跌（元/斤）
   */
  riseFall: string | number;

  /**
   * 统计周期
   */
  cycle: string;

  /**
   * 数据来源
   */
  dataSource: string;

  /**
   * 扩展字段2
   */
  ext2: string;

  /**
   * 扩展字段3
   */
  ext3: string;

  /**
   * 扩展字段4
   */
  ext4: string;

  /**
   * 扩展字段5
   */
  ext5: string;

  /**
   * 扩展字段6
   */
  ext6: string;

  /**
   * 备注
   */
  remark: string;
}

export interface MarketInfoForm extends BaseEntity {
  /**
   * 主键
   */
  marketId?: string | number;

  /**
   * 时间
   */
  dataTime?: string;

  /**
   * 地区
   */
  area?: string;

  /**
   * 品类
   */
  category?: string;

  /**
   * 价格（元/斤）
   */
  price?: number;

  /**
   * 涨跌（元/斤）
   */
  riseFall?: string | number;

  /**
   * 统计周期
   */
  cycle?: string;

  /**
   * 数据来源
   */
  dataSource?: string;

  /**
   * 扩展字段2
   */
  ext2?: string;

  /**
   * 扩展字段3
   */
  ext3?: string;

  /**
   * 扩展字段4
   */
  ext4?: string;

  /**
   * 扩展字段5
   */
  ext5?: string;

  /**
   * 扩展字段6
   */
  ext6?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface MarketInfoQuery extends PageQuery {
  /**
   * 时间
   */
  dataTime?: string;

  /**
   * 地区
   */
  area?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

/**
 * 价格走势接口返回类型
 */
export interface GuZiPriceResponse {
  /**
   * 时间
   */
  dataTime: string;

  /**
   * 地区
   */
  area: string;

  /**
   * 品类
   */
  category: string;

  /**
   * 价格（元/斤）
   */
  price: number;
}
