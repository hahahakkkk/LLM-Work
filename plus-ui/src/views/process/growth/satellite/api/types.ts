export interface SatelliteVO {
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

  /**
   * 创建时间
   */
  createTime?: string;
}

export interface SatelliteForm extends BaseEntity {
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

export interface SatelliteQuery extends PageQuery {
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

// 模型预测请求参数类型
export interface ProcessNdviRequest {
  /**
   * NDVI图像的URL地址
   */
  ndviUrl: string;

  /**
   * 时期名称
   */
  periodName: string;
}

// 任务状态响应类型
export interface TaskStatusResponse {
  taskId: string;
  status: string;
  progress: number;
  result?: any;
}

// 健康检查响应类型
export interface HealthCheckResponse {
  status: string;
  service: string;
  timestamp: number;
  service_health?: any;
  service_health_error?: string;
}
