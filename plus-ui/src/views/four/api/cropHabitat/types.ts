export interface CropHabitatVO {
  /**
   * 主键
   */
  fourId: string | number;

  /**
   * 基地
   */
  baseId: string | number;

  /**
   * 设备编号
   */
  facilityId: string | number;

  /**
   * 视频文件存放位置
   */
  fileLocation: string;

  /**
   * 作物种类
   */
  cropType: string;

  /**
   * 生长状态
   */
  growthStatus: string;

  /**
   * 受害状态
   */
  victimizeStatus: string;

  /**
   * 谷子生育期
   */
  growthPeriod: string;

  /**
   * 采集时间
   */
  collectTime: string;

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

export interface CropHabitatForm extends BaseEntity {
  /**
   * 主键
   */
  fourId?: string | number;

  /**
   * 基地
   */
  baseId?: string | number;

  /**
   * 设备编号
   */
  facilityId?: string | number;

  /**
   * 视频文件存放位置
   */
  fileLocation?: string;

  /**
   * 作物种类
   */
  cropType?: string;

  /**
   * 生长状态
   */
  growthStatus?: string;

  /**
   * 受害状态
   */
  victimizeStatus?: string;

  /**
   * 谷子生育期
   */
  growthPeriod?: string;

  /**
   * 采集时间
   */
  collectTime?: string;

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

export interface CropHabitatQuery extends PageQuery {

  /**
   * 基地
   */
  baseId?: string | number;

  /**
   * 设备编号
   */
  facilityId?: string | number;

  /**
   * 谷子生育期
   */
  growthPeriod?: string;

  /**
   * 采集时间
   */
  collectTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
