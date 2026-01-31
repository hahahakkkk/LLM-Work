/**
 * 天气预报单项数据类型
 */
export interface ForecastDay {
  dayWeek: string; // 星期几，如“周五”
  dayLabel: string; // 日期标签，如“7/11”
  weatherLabel: string; // 天气描述，如“多云”
  weatherIcon: string; // 天气图标代码，如“101”
  max: number; // 最高温度
  min: number; // 最低温度
  wind: string; // 风向，如“北风”
}

/**
 * 空气质量数据类型
 */
export interface AirQuality {
  category: string; // 空气质量类别，如“良”
  aqi: number; // 空气质量指数
  level: string; // 污染等级，如“2”
}

/**
 * 当前天气数据类型
 */
export interface NowWeather {
  temp: string; // 当前温度
  feelsLike: string; // 体感温度
  text: string; // 天气描述，如“雾”
  windDir: string; // 风向
  windScale: string; // 风力等级
  humidity: string; // 湿度
  precip: string; // 降水量
  pressure: string; // 气压
  vis: string; // 能见度
  cloud: string; // 云量
  icon: string; // 天气图标代码
  location: string; // 位置
}

/**
 * 天气预报整体数据
 */
export interface ForecastData {
  forecastData: ForecastDay[];
}

/**
 * 天气API返回的整体数据类型
 */
export interface WeatherResponse {
  code: number; // 状态码
  data: {
    forecast: ForecastData;
    airQuality: AirQuality;
    now: NowWeather;
  };
}
