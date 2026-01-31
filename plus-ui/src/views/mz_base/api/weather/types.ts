export interface WeatherVO {
  /**
   * 气象ID
   */
  weatherId: string | number;

  /**
   * 日均气温
   */
  temperAvg: string;

  /**
   * 日最高气温
   */
  temperMax: string;

  /**
   * 日最低气温
   */
  temperMin: string;

  /**
   * 日降雨量
   */
  rainfall: string;

  /**
   * 相对湿度
   */
  humidity: number;

  /**
   * 大气压
   */
  pressure: number;

  /**
   * 气象灾害：0：冰雹、1：山洪、2：暴雨、3：极端高温
   */
  disaster: string;

  /**
   * 日期
   */
  weatherDate: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid: string | number;
  /**
   * 开始年份
   */
  minYear: string;

  /**
   * 结束年份
   */
  maxYear: string;
  useTimes?: string[];

  /**
   * 日均气温最小值
   */
  temperAvgMin?: string;

  /**
   * 日均气温最大值
   */
  temperAvgMax?: string;
  /**
   * 日降雨量最小值
   */
  rainfallMin?: string;

  /**
   * 日降雨量最大值
   */
  rainfallMax?: string;
}

export interface WeatherForm extends BaseEntity {
  /**
   * 气象ID
   */
  weatherId?: string | number;

  /**
   * 日均气温
   */
  temperAvg?: string;

  /**
   * 日最高气温
   */
  temperMax?: string;

  /**
   * 日最低气温
   */
  temperMin?: string;

  /**
   * 日降雨量
   */
  rainfall?: string;

  /**
   * 相对湿度
   */
  humidity: number;

  /**
   * 大气压
   */
  pressure: number;

  /**
   * 气象灾害：0：冰雹、1：山洪、2：暴雨、3：极端高温
   */
  disaster?: string;

  /**
   * 日期
   */
  weatherDate?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;
  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;
  useTimes?: string[];
  /**
   * 日均气温最小值
   */
  temperAvgMin?: string;

  /**
   * 日均气温最大值
   */
  temperAvgMax?: string;
  /**
   * 日降雨量最小值
   */
  rainfallMin?: string;

  /**
   * 日降雨量最大值
   */
  rainfallMax?: string;
}

export interface WeatherQuery extends PageQuery {
  /**
   * 日均气温
   */
  temperAvg?: string;

  /**
   * 日最高气温
   */
  temperMax?: string;

  /**
   * 日最低气温
   */
  temperMin?: string;

  /**
   * 日降雨量
   */
  rainfall?: string;

  /**
   * 相对湿度
   */
  humidity: number;

  /**
   * 大气压
   */
  pressure: number;

  /**
   * 气象灾害：0：冰雹、1：山洪、2：暴雨、3：极端高温
   */
  disaster?: string;

  /**
   * 日期
   */
  weatherDate?: string;

  /**
   * 是否有效（0无效 1有效）
   */
  isValid?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
  /**
   * 开始年份
   */
  minYear?: string;

  /**
   * 结束年份
   */
  maxYear?: string;
  useTimes?: string[];
  /**
   * 日均气温最小值
   */
  temperAvgMin?: string;

  /**
   * 日均气温最大值
   */
  temperAvgMax?: string;
  /**
   * 日降雨量最小值
   */
  rainfallMin?: string;

  /**
   * 日降雨量最大值
   */
  rainfallMax?: string;
}
