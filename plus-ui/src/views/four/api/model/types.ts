export interface ModelVO {
  /**
   * 主键
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
   * 访问地址
   */
  modelUrl: string;

  /**
   * 文件存放位置
   */
  fileLocation: string;

  /**
   * 是否默认
   */
  isDefault: string;

  /**
   * 描述信息
   */
  remark: string;

  /**
   * 创建时间
   */
  modelCreate: string;

  /**
   * 更新时间
   */
  modelUpdate: string;
}

export interface ModelForm extends BaseEntity {
  /**
   * 主键
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
   * 访问地址
   */
  modelUrl?: string;

  /**
   * 文件存放位置
   */
  fileLocation?: string;

  /**
   * 是否默认
   */
  isDefault?: string;

  /**
   * 描述信息
   */
  remark?: string;

  /**
   * 创建时间
   */
  modelCreate?: string;

  /**
   * 更新时间
   */
  modelUpdate?: string;
}

export interface ModelQuery extends PageQuery {
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
  isDefault?: string;

  /**
   * 描述信息
   */
  remark?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
