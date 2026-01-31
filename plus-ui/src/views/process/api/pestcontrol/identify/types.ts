export interface identifyRgbResponseVO {
  imageUrl: string;
  pestTypes: string;
  confidence?: number;
  detections?: any[];
  originalFileName?: string;
  serverUsed?: string;
  timestamp?: number;
  error?: string;
  detectionTime?: string;
  modelName?: string;
  [key: string]: any;
}

export interface getTacticsResponseVO {
  type: string;
  strategy: Strategy;
}

export interface Strategy {
  耕种方式: string;
  化学防治: string;
  生物防治: string;
  环境调控: string;
}

// 新的getStrategy接口请求参数
export interface GetStrategyRequest {
  class: string;
}

// 新的getStrategy接口返回的策略结构（支持动态字段名）
export interface StrategyDetail {
  [key: string]: string; // 支持任意防治策略字段名
}

// 新的getStrategy接口响应结构
export interface GetStrategyResponseVO {
  strategy: StrategyDetail;
  class: string;
  average_occurrence_rate: number;
  intro: string;
}

// 播种期识别请求参数
export interface IdentifySTRequest {
  variety: string; // 品种
  variety_area: string; // 基地
}

// 播种期识别响应数据结构
export interface IdentifySTResponseData {
  variety: string; // 品种
  baseName: string; // 基地名称
  startDate: string; // 开始日期
  endDate: string; // 结束日期
  realStartDate: string; // 实际开始日期
  realEndDate: string; // 实际结束日期
  forecastUrl: string; // 预测依据图片URL
  trendUrl: string; // 预测结果图片URL
}

// 播种期识别响应项（兼容旧版本）
export interface IdentifySTResponseItem {
  imageUrl?: string; // 图片URL（兼容旧版本）
  basisImageUrl?: string; // 预测依据图片URL
  resultImageUrl?: string; // 预测结果图片URL
  startDate?: string; // 开始日期
  endDate?: string; // 结束日期
  [key: string]: any;
}

// 播种期识别完整响应结构（后端直接返回数据对象）
export interface IdentifySTResponse extends IdentifySTResponseData {}

// 播种期信息请求参数
export interface GetSTInfoRequest {
  variety: string; // 品种
  variety_area: string; // 基地
}

// 播种期信息响应数据结构
export interface GetSTInfoResponseData {
  tempBarUrl: string; // 温度柱状图URL
  moistBarUrl: string; // 湿度柱状图URL
  message: string; // 消息
}

// 播种期信息完整响应结构（后端直接返回数据对象）
export interface GetSTInfoResponse extends GetSTInfoResponseData {}
