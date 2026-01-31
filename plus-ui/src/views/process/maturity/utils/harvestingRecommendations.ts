/**
 * 根据成熟水平、天气状况和灾害状况生成收割建议
 * @param maturityLevel 成熟水平（如：成熟、未成熟）
 * @param weather 天气状况（如：晴天、多云、小雨、大雨）
 * @param disaster 灾害状况（如：无灾害、冰雹、洪涝）
 * @returns 收割建议文本（带 <br> 换行）
 */
export function getHarvestSuggestion(
  maturityLevel: string | undefined,
  weather: string | undefined,
  disaster: string | undefined,
  forecastData?: Array<{ weatherLabel: string }> // 新增参数
): string {
  if (!maturityLevel) {
    return '请提供作物成熟水平信息';
  }

  // 未成熟
  if (maturityLevel.includes('未成熟')) {
    return '谷子未达到成熟的标准，不建议采收。';
  }

  // 成熟处理
  if (maturityLevel.includes('成熟')) {
    // 有灾害 —— 冰雹
    if (disaster?.includes('冰雹')) {
      return '未来存在冰雹，谷子作物已成熟，建议3天内做好提前抢收，采收完成后晾晒脱水，以减低作物损失。' + '<br>注意：最佳收获时间：3天内。';
    }

    // 有灾害 —— 洪涝
    if (disaster?.includes('洪涝')) {
      return '未来存在洪涝，谷子作物已成熟，建议3天内做好提前抢收，采收完成后晾晒脱水，以减低作物损失。' + '<br>注意：最佳收获时间：3天内。';
    }

    // 有灾害 —— 干旱
    if (disaster?.includes('旱')) {
      return '未来存在干旱，谷子作物已成熟，建议3天内做好提前抢收，采收完成后晾晒脱水，以减低作物损失。' + '<br>注意：最佳收获时间：3天内。';
    }

    // 检查预报数据中的特殊天气模式
    if (forecastData && forecastData.length > 0) {
      const heavyRainDays = forecastData.filter((item) => item.weatherLabel.includes('大雨')).length;

      // 如果有2天或以上大雨
      if (heavyRainDays >= 2) {
        return (
          '未来7天中有' +
          heavyRainDays +
          '天大雨，谷子作物已成熟，建议3天内做好提前抢收，采收完成后晾晒脱水，以减低作物损失。' +
          '<br>注意：最佳收获时间：3天内。'
        );
      }

      // 检查连续4天小雨
      for (let i = 0; i <= forecastData.length - 4; i++) {
        const consecutiveDays = forecastData.slice(i, i + 4);
        const isAllLightRain = consecutiveDays.every((item) => item.weatherLabel.includes('小雨'));

        if (isAllLightRain) {
          return (
            '检测到连续4天小雨天气，谷子作物已成熟，建议3天内做好提前抢收，采收完成后晾晒脱水，以减低作物损失。' + '<br>注意：最佳收获时间：3天内。'
          );
        }
      }
    }

    // 无灾害且无特殊天气模式
    if (disaster === '无灾害' || !disaster) {
      // 晴、多云、小雨
      if (weather?.includes('晴') || weather?.includes('多云') || weather?.includes('小雨') || weather?.includes('阴')) {
        return '谷子作物已成熟，建议未来5-7天内晴天采收，合理安排采收时间，该地块面积较大，建议使用机械采收。' + '<br>注意：最佳收获时间：5-7天内。';
      }

      // 大雨
      if (weather?.includes('大雨')) {
        return '谷子作物已成熟，未来一周阴雨不断，建议3天内做好提前抢收，采收完成后晾晒脱水，以减低作物损失。' + '<br>注意：最佳收获时间：3天内。';
      }
    }
  }

  // 默认兜底
  return '请检查输入信息，无法生成采收建议。';
}
