export interface LandPlantVO {
  /**
   * 种植记录ID
   */
  plantId: string | number;

  /**
   * 播种地块
   */
  landId: string | number;

  /**
   * 播种地块名称
   */
  landCode: string;

  /**
   * 种植作物
   */
  plantCrop: string;

  /**
   * 作物品种
   */
  cropVariety: string;

  /**
   * 播种时间
   */
  sowDate: string;

  /**
   * 历史产量
   */
  historyYield: number;

  /**
   * 年份
   */
  nf: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

}

export interface LandPlantForm extends BaseEntity {
  /**
   * 种植记录ID
   */
  plantId: string | number;
  
  /**
   * 播种地块
   */
  landId?: string | number;

  /**
   * 播种地块名称
   */
  landCode: string;

  /**
   * 种植作物
   */
  plantCrop?: string;

  /**
   * 作物品种
   */
  cropVariety?: string;

  /**
   * 播种时间
   */
  sowDate?: string;

  /**
   * 历史产量
   */
  historyYield?: number;

  /**
   * 年份
   */
  nf?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

}

export interface LandPlantQuery extends PageQuery {

  /**
   * 种植记录ID
   */
  plantId?: string | number;

  /**
   * 播种地块
   */
  landId?: string | number;

  /**
   * 播种地块名称
   */
  landCode: string;

  /**
   * 种植作物
   */
  plantCrop?: string;

  /**
   * 作物品种
   */
  cropVariety?: string;

  /**
   * 播种时间
   */
  sowDate?: string;

  /**
   * 历史产量
   */
  historyYield?: number;

  /**
   * 年份
   */
  nf?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



