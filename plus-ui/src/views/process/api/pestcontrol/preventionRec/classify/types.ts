export interface ClassifyVO {
  total: number;
  rows: Row[];
  code: number;
  msg: string;
}

export interface Row {
  classifyId: number;
  name: string;
  intro: string;
  feature: string;
  pic1: string;
  pic2: string;
  type: string;
  strategy: Strategy;
}

export interface Strategy {
  [key: string]: string;
}
