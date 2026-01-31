export interface DepositoryVO {
  /**
   * 仓库ID
   */
  depositoryId: string | number;

  /**
   * 仓库位置
   */
  depositoryAddress: string;

  /**
   * 地块ID
   */
  landId: string | number;

  /**
   * 管理员
   */
  depositoryManager: string;

  /**
   * 管理员EXT
   */
  managerExtend: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;

}

export interface DepositoryForm extends BaseEntity {
  /**
   * 仓库ID
   */
  depositoryId?: string | number;

  /**
   * 仓库位置
   */
  depositoryAddress?: string;

  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 管理员
   */
  depositoryManager?: string;

  /**
   * 管理员EXT
   */
  managerExtend?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

}

export interface DepositoryQuery extends PageQuery {

  /**
   * 仓库位置
   */
  depositoryAddress?: string;

  /**
   * 地块ID
   */
  landId?: string | number;

  /**
   * 管理员
   */
  depositoryManager?: string;

  /**
   * 管理员EXT
   */
  managerExtend?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



