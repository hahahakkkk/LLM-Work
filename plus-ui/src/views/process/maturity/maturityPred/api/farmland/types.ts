export interface FarmlandVO {
  /**
   * 区域id
   */
  farmlandId: string | number;

  /**
   * 用户id
   */
  userId: string | number;

  /**
   * 区域名称
   */
  farmlandName: string;

  /**
   * 成熟率
   */
  ratio: string;

  /**
   * 原始图像
   */
  originImageUrl: string;

  /**
   * 处理后图像
   */
  processedImageUrl: string;
}

export interface FarmlandForm extends BaseEntity {
  /**
   * 区域id
   */
  farmlandId?: string | number;

  /**
   * 用户id
   */
  userId?: string | number;

  /**
   * 区域名称
   */
  farmlandName?: string;

  /**
   * 成熟率
   */
  ratio?: string;

  /**
   * 原始图像
   */
  originImageUrl?: string;

  /**
   * 处理后图像
   */
  processedImageUrl?: string;
}

export interface FarmlandQuery extends PageQuery {
  /**
   * 用户id
   */
  userId?: string | number;

  /**
   * 区域名称
   */
  farmlandName?: string;

  /**
   * 成熟率
   */
  ratio?: string;

  /**
   * 原始图像
   */
  originImageUrl?: string;

  /**
   * 处理后图像
   */
  processedImageUrl?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
