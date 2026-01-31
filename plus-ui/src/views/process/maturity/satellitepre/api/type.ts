export interface DataVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 诊断时间
   */
  diagnosisTime: string;

  /**
   * 生育期
   */
  period: string;

  /**
   * 输入图像OSS路径
   */
  inputImageOss: string;

  /**
   * 输入图像URL
   */
  inputImageUrl: string;

  /**
   * 预测GJSON文件URL
   */
  predictGjsonUrl: string;

  /**
   * 预测结果JSON文件URL
   */
  predictResultJsonUrl: string;

  /**
   * 任务状态
   */
  taskStatus: string;
}

export interface DataForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 诊断时间
   */
  diagnosisTime?: string;

  /**
   * 生育期
   */
  period?: string;

  /**
   * 输入图像OSS路径
   */
  inputImageOss?: string;

  /**
   * 输入图像URL
   */
  inputImageUrl?: string;

  /**
   * 预测GJSON文件URL
   */
  predictGjsonUrl?: string;

  /**
   * 预测结果JSON文件URL
   */
  predictResultJsonUrl?: string;

  /**
   * 任务状态
   */
  taskStatus?: string;
}

export interface DataQuery extends PageQuery {
  /**
   * 诊断时间
   */
  diagnosisTime?: string;

  /**
   * 生育期
   */
  period?: string;

  /**
   * 输入图像OSS路径
   */
  inputImageOss?: string;

  /**
   * 输入图像URL
   */
  inputImageUrl?: string;

  /**
   * 预测GJSON文件URL
   */
  predictGjsonUrl?: string;

  /**
   * 预测结果JSON文件URL
   */
  predictResultJsonUrl?: string;

  /**
   * 任务状态
   */
  taskStatus?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
