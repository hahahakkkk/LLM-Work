export interface areaDetectResponseVO {
  resultImageUrl: string;
  originalImages: File[];
  detectionTime: string;
  modelId: number;
  originImageUrl?: string;
  processedImageUrl?: string;
  pestTactics?: pestTacticsVO[];
  [key: string]: any;
}

export interface pestTacticsVO {
  class: string;
  strategy: Strategy | string;
  average_occurrence_rate: number;
}

export interface Strategy {
  耕种方式: string;
  化学防治: string;
  生物防治: string;
  环境调控: string;
}

// 病虫害区域检测统计数据
export interface BackDieaseAreaStaticVO {
  total: number; // 总记录数
  thisWeek: number; // 本周记录数
  today: number; // 今日记录数
}

// 病虫害地图展示数据
export interface PestDetectionMapVO {
  id: number; // ID
  landCode: string; // 地块编码
  baseName: string; // 基地名称
  baseId: number | null; // 基地ID
  plotId: string; // 地块ID
  diseaseType: string; // 病虫害类型
  imageUrl: string; // 图片URL
  incidenceRate: number; // 发病率
  leval: number; // 等级 1-轻度 2-中度 3-重度
  createTime: string;
}
