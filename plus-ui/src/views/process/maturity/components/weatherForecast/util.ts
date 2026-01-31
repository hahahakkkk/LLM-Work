// 按日期分组
const groupByDate = (list: any[]) => {
  const grouped: any = {};
  list.forEach((item) => {
    const date = formatDate(item.dt);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(item);
  });
  return grouped;
};
// 获取最高温
const getMaxTemp = (forecasts: any[]) => {
  let maxTemp = -Infinity;
  forecasts.forEach((forecast) => {
    const temp = convertToCelsius(forecast.main.temp_max);
    if (Number(temp) > maxTemp) {
      maxTemp = Number(temp);
    }
  });
  return maxTemp;
};

// 获取最低温
const getMinTemp = (forecasts: any[]) => {
  let minTemp = Infinity;
  forecasts.forEach((forecast) => {
    const temp = convertToCelsius(forecast.main.temp_min);
    if (Number(temp) < minTemp) {
      minTemp = Number(temp);
    }
  });
  return minTemp;
};
export const formatForecast = (data: any) => {
  const formatForecast: any[] = [];
  const groupedForecast = groupByDate(data.list);
  Object.entries(groupedForecast).forEach(([date, forecasts]: any) => {
    const forecastData = forecasts[0]; // TODO 选一个时间代表
    const item = {
      date: date, // 转换为日期字符串形式，例如 "Tue Apr 12 2023"
      temp: `${getMinTemp(forecasts)}°C/${getMaxTemp(forecasts)}°C`,
      weatherDesc: weatherDescriptionMap[forecastData.weather[0].description] || forecastData.weather[0].description, // 获取天气描述
      windDirection: degreesToDirection(forecastData.wind.deg),
      icon: `http://openweathermap.org/img/wn/${forecastData.weather[0].icon}@2x.png`
    };
    formatForecast.push(item);
  });
  return formatForecast;
};
// 将时间戳转换为月.日格式
const formatDate = (timestamp: any) => {
  const date = new Date(timestamp * 1000);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}.${day}`;
};
// 温度转换函数，将开氏度转换为摄氏度
const convertToCelsius = (temp: number) => Math.round(temp - 273.15); // 将开氏度转换为摄氏度，并四舍五入到整数
// 将角度转换为风向描述
const degreesToDirection = (degrees: number) => {
  const directions = [
    '北风',
    '东北偏北风',
    '东北风',
    '东北偏东风',
    '东风',
    '东南偏东风',
    '东南风',
    '东南偏南风',
    '南风',
    '西南偏南风',
    '西南风',
    '西南偏西风',
    '西风',
    '西北偏西风',
    '西北风',
    '西北偏北风'
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};
// 英文天气描述到中文的映射表
const weatherDescriptionMap: any = {
  'clear sky': '晴朗',
  'few clouds': '少云',
  'scattered clouds': '多云',
  'broken clouds': '碎云',
  'overcast clouds': '阴云密布',
  'shower rain': '阵雨',
  'rain': '雨',
  'thunderstorm': '雷暴',
  'snow': '雪',
  'mist': '薄雾',
  'smoke': '烟雾',
  'haze': '霾',
  'sand/ dust whirls': '沙尘卷',
  'fog': '雾',
  'sand': '沙尘',
  'dust': '灰尘',
  'volcanic ash': '火山灰',
  'squalls': '飑',
  'tornado': '龙卷风',
  'light rain': '小雨',
  'moderate rain': '中雨',
  'heavy intensity rain': '大雨',
  'very heavy rain': '暴雨',
  'extreme rain': '特大暴雨',
  'freezing rain': '冻雨',
  'light intensity shower rain': '小阵雨',
  'heavy intensity shower rain': '大阵雨',
  'ragged shower rain': '不规则阵雨',
  'light snow': '小雪',
  'heavy snow': '大雪',
  'sleet': '雨夹雪',
  'light shower sleet': '小阵性雨夹雪',
  'shower sleet': '阵性雨夹雪',
  'light rain and snow': '小雨雪',
  'rain and snow': '雨雪',
  'light shower snow': '小阵雪',
  'shower snow': '阵雪',
  'heavy shower snow': '大阵雪'
};
