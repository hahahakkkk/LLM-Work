export interface LandUnitVO {
  /**
   * 地块ID
   */
  landId: string | number;

  /**
   * 地块名称
   */
  landCode: string;

  /**
   * 农户ID
   */
  farmerId: string | number;

  /**
   * 农户名称
   */
  farmerName: string;

  /**
   * 坡向
   */
  slopeDirection: string | number; 

  /**
   * 
   * 面积
   */
  landArea: Number;

  /**
   * 地力等级
   */
  landLevel: Number;

  /**
  * 灌溉能力（0无 1有）
  */
  irrigation: string | number;

  /**
   * 排水能力（0无 1有）
   */
  drainage: string | number;

  /**
  * 耕地质地
  */
  landTexture: string;

  /**
  * 海拔
  */
  altitude: number | string;

  /**
  * 土地容重
  */
  soilDensity: number | string;
  
  /**
  * 坡度
  */
  slope: number | string;

  /**
   * 
   * 根须深度
   */
  rootDepth: Number;
}

export interface FertilizerVolumn extends BaseEntity{
  /**
  * 配方ID
  */  
  fertilizationId: number | String;


  /**
  * 复合肥施肥量
  */  
  fertilizerCompoundVolumnAdjust: number;

  /**
  * 氮肥施肥量
  */  
  fertilizerNVolumnAdjust: number;

  /**
  * 磷肥施肥量
  */  
  fertilizerPVolumnAdjust: number;

  /**
  * 钾施肥量
  */  
  fertilizerKVolumnAdjust: number;
}

export interface FertilizationForm extends BaseEntity {
  /**
  * 配方ID
  */  
  fertilizationID: number | String;
  
  /**
   * 地块ID
   */
  landId: string | number;

  /**
   * 地块名称
   */
  landCode: string | number;

  /**
   * 
   * 面积
   */
  area: Number;

  /**
   * 
   * 根须深度
   */
  rootDepth: Number;

  /**
   * 
   * 土地容重
   */
  soilDensity: Number;

  /**
  * 地块养分
  */  
  nutrientLand: string;

  /**
  * 地块氮养分
  */  
  nutrientLandN: number;

  /**
  * 地块磷养分
  */  
  nutrientLandP: number;

  /**
  * 地块钾养分
  */  
  nutrientLandK: number;

  /**
  * 目标产量
  */  
  outputTarget: number;

  /**
  * 生产100kg籽粒所需养分
  */  
  nutrientNeed: string;

  /**
  * 所需氮养分
  */  
  nutrientNeedN: number;

  /**
  * 所需磷养分
  */  
  nutrientNeedP: number;

  /**
  * 所需钾养分
  */  
  nutrientNeedK: number;

  /**
  * 土壤养分利用率
  */  
  nutrientRateSoil: string;

  /**
  * 土壤氮利用率
  */  
  nutrientRateSoilN: number;

  /**
  * 土壤磷利用率
  */  
  nutrientRateSoilP: number;

  /**
  * 土壤钾利用率
  */  
  nutrientRateSoilK: number;

  /**
  * 有机肥养分利用率
  */  
  nutrientRateOFertilizer: string;

  /**
  * 有机肥氮利用率
  */  
  nutrientRateOFertilizerN: number;

  /**
  * 有机肥磷利用率
  */  
  nutrientRateOFertilizerP: number;

  /**
  * 有机肥钾利用率
  */  
  nutrientRateOFertilizerK: number;

  /**
  * 化肥养分利用率
  */  
  nutrientRateCFertilizer: string;

  /**
  * 化肥氮利用率
  */  
  nutrientRateCFertilizerN: number;

  /**
  * 化肥磷利用率
  */  
  nutrientRateCFertilizerP: number;

  /**
  * 化肥钾利用率
  */  
  nutrientRateCFertilizerK: number;

  /**
  * 有机肥施肥情况
  */  
  situationOFertilizer: string;

  /**
  * 复合肥ID
  */  
  fertilizerCompound: number;

  /**
  * 氮肥ID
  */  
  fertilizerN: number;

  /**
  * 磷肥ID
  */  
  fertilizerP: number;

  /**
  * 钾肥ID
  */  
  fertilizerK: number;

  /**
  * 复合肥施肥量
  */  
  fertilizerCompoundVolumn: number;

  /**
  * 氮肥施肥量
  */  
  fertilizerNVolumn: number;

  /**
  * 磷肥施肥量
  */  
  fertilizerPVolumn: number;

  /**
  * 钾施肥量
  */  
  fertilizerKVolumn: number;

  /**
  * 调整后复合肥施肥量
  */  
  fertilizerCompoundVolumnAdjust: number;

  /**
  * 调整后氮肥施肥量
  */  
  fertilizerNVolumnAdjust: number;

  /**
  * 调整后磷肥施肥量
  */  
  fertilizerPVolumnAdjust: number;

  /**
  * 调整后钾肥施肥量
  */  
  fertilizerKVolumnAdjust: number;

  /**
  * 年份
  */  
  yearFertilization: number | string;

  /**
  * 操作人ID
  */  
  operationBy: number;

  /**
  * 配方概述
  */  
  summary: string;

  /**
  * 有机肥施肥情况
  */  
  situation: string;
}

export interface LandUnitQuery extends PageQuery {

  /**
   * 编号
   */
  landCode?: string;

  /**
   * 所属地
   */
  baseId?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

export interface PdfData{
  data_land: LandUnitVO;
  data_form: FertilizationForm;
  o_situation: Array<String>;
  schedule_desc: Array<String>;
  adjust_desc: Array<String>;
  hasAdjust: Boolean;
  date: Date;
}



