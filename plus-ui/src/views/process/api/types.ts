export interface ModelVO {
  modelId: number;
  modelName: string;
  modelType: string;
  isDefault: number;
  modelUrl: string;
  description: string;
  [key: string]: any;
}
