export interface PointVO {
  pointId: number;
  /**
   * 采集地
   */
  address: string;

  /**
   * 所属基地
   */
  baseId: number;

  /**
   * ph值
   */
  ph: number;

  /**
   * 有机质
   */
  om: number;

  /**
   * 全氮
   */
  tn: number;

  /**
   * 全磷
   */
  tp: number;

  /**
   * 有效磷
   */
  ap: number;

  /**
   * 速效钾
   */
  ak: number;

  /**
   * 缓效钾
   */
  slk: number;

  /**
   * 测定单位
   */
  testOrg: string;

  /**
   * 测定时间
   */
  testDate: Date;

  /**
   * 经度
   */
  lng: number;

  /**
   * 纬度
   */
  lat: number;

  /**
   * 编号
   */
  pointCode: string;

  /**
   * 是否有效
   */
  isValid: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 海拔
   */
  altitude: string;
}

export interface PointForm extends BaseEntity {
  pointId: number;
  baseId: number;
  /**
   * 采集地
   */
  address?: string;

  /**
   * ph值
   */
  ph?: number;

  /**
   * 有机质
   */
  om?: number;

  /**
   * 全氮
   */
  tn?: number;

  /**
   * 全磷
   */
  tp?: number;

  /**
   * 有效磷
   */
  ap?: number;

  /**
   * 速效钾
   */
  ak?: number;

  /**
   * 缓效钾
   */
  slk?: number;

  /**
   * 测定单位
   */
  testOrg?: string;

  /**
   * 测定时间
   */
  testDate?: Date;

  /**
   * 经度
   */
  lng?: number;

  /**
   * 纬度
   */
  lat?: number;

  /**
   * 编号
   */
  pointCode?: string;

  /**
   * 是否有效
   */
  isValid?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 坐标类型：火星坐标（GCJ02), WGS84
   */
  coorType?: number;

  /**
   * 海拔
   */
  altitude: string;
}

export interface PointQuery extends PageQuery {
  /**
   * 海拔
   */
  altitude: string;

  /**
   * 采集地
   */
  address?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  baseId: number;
  /**
   * 编号
   */
  pointCode?: string;
}
