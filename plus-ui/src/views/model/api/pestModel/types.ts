export interface IdentifyModelVO {
  /**
   * 模型id
   */
  modelId: string | number;

  /**
   * 模型名称
   */
  modelName: string;

  /**
   * 模型类型
   */
  modelType: string;

  /**
   * 是否默认
   */
  isDefault: number;

  /**
   * 访问地址
   */
  modelUrl: string;

  /**
   * 备注
   */
  description: string;

  /**
   * 创建时间，自动更新
   */
  createTime: string;

  /**
   * 更新时间，自动更新
   */
  updateTime: string;
}

export interface IdentifyModelForm extends BaseEntity {
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 模型类型
   */
  modelType?: string;

  /**
   * 是否默认
   */
  isDefault?: number;

  /**
   * 访问地址
   */
  modelUrl?: string;

  /**
   * 备注
   */
  description?: string;
}

export interface IdentifyModelQuery extends PageQuery {
  /**
   * 模型id
   */
  modelId?: number;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 模型类型
   */
  modelType?: string;

  /**
   * 是否默认
   */
  isDefault?: number;

  /**
   * 访问地址
   */
  modelUrl?: string;

  /**
   * 备注
   */
  description?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
