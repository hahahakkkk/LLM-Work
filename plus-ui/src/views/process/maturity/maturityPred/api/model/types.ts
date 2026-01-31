export interface ModelVO {
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
}

export interface ModelForm extends BaseEntity {
  /**
   * 模型id
   */
  modelId?: string | number;

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

export interface ModelQuery extends PageQuery {
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

// 扩展原有的类型定义
export interface ModelProcessResult {
  originalUrl: string;
  processedUrls: string[];
  ratio: number;
  modelId?: string;
  timestamp?: string;
}

// 扩展接口
export interface ExtendedModelProcessResult extends ModelProcessResult {
  fileName?: string; // 可选属性
  status?: string; // 可选属性
  base?: string;
}
