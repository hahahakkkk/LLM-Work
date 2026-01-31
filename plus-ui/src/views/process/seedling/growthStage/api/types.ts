export interface identifyRgbResponseVO {
  imageUrl: string;
  pestTypes: string;
}
export interface identifyWhResponseVO {
  imageUrl: string;
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
