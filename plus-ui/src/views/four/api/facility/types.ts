export interface FacilityVO {
  /**
   * 主键
   */
  fourId: string | number;

  /**
   * 所属基地
   */
  baseId: string | number;

  /**
   * 设备编号
   */
  facilityId: string | number;

  /**
   * 设备类型
   */
  facilityType: string;

  /**
   * 设备位置经度
   */
  facilityLongitude: string;

  /**
   * 设备位置纬度
   */
  facilityLatitude: string;

  /**
   * 设备运行状态
   */
  facilityStatus: string;

  /**
   * 数据采集频率
   */
  collectFrequency: string;

  /**
   * 扩展字段1
   */
  ext1: string;

  /**
   * 扩展字段2
   */
  ext2: string;

  /**
   * 扩展字段3
   */
  ext3: string;

  /**
   * 扩展字段4
   */
  ext4: string;

  /**
   * 扩展字段5
   */
  ext5: string;

  /**
   * 扩展字段6
   */
  ext6: string;

  /**
   * 备注
   */
  remark: string;

}

export interface FacilityForm extends BaseEntity {
  /**
   * 主键
   */
  fourId?: string | number;

  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 设备编号
   */
  facilityId?: string | number;

  /**
   * 设备类型
   */
  facilityType?: string;

  /**
   * 设备位置经度
   */
  facilityLongitude?: string;

  /**
   * 设备位置纬度
   */
  facilityLatitude?: string;

  /**
   * 设备运行状态
   */
  facilityStatus?: string;

  /**
   * 数据采集频率
   */
  collectFrequency?: string;

  /**
   * 扩展字段1
   */
  ext1?: string;

  /**
   * 扩展字段2
   */
  ext2?: string;

  /**
   * 扩展字段3
   */
  ext3?: string;

  /**
   * 扩展字段4
   */
  ext4?: string;

  /**
   * 扩展字段5
   */
  ext5?: string;

  /**
   * 扩展字段6
   */
  ext6?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface FacilityQuery extends PageQuery {

  /**
   * 所属基地
   */
  baseId?: string | number;

  /**
   * 设备编号
   */
  facilityId?: string | number;

  /**
   * 设备类型
   */
  facilityType?: string;

  /**
   * 设备运行状态
   */
  facilityStatus?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



