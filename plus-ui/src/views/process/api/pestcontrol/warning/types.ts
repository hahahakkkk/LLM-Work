export interface WarningSummaryResponse {
  code: number;
  msg: string;
  data: WarningData[];
}

export interface WarningData {
  farmlandId: number;
  farmlandName: string;
  warnMessage: string;
  pestTypes: string;
  resultStrategies: ResultStrategy[];
  version: number;
  originImageUrl: string;
  processedImageUrl: string;
  createTime: string;
}

export interface ResultStrategy {
  strategy: string | StrategyDetails;
  class: string;
  average_occurrence_rate: number;
}

export interface StrategyDetails {
  [category: string]: string;
}

export type imageType = 'origin' | 'processed';
