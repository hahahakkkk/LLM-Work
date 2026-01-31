/**
 * 根据生长时期和缺水等级动态生成补水建议
 * @param growthPeriod 生长期
 * @param waterDeficitLevel 缺水等级
 * @param waterSuggestion 自定义建议（可选）
 * @param waterAmount 补水量（可选，单位：m³/亩）
 * @returns 补水建议文本
 */
export function getWaterSuggestion(growthPeriod: string | undefined, waterDeficitLevel: string | undefined, waterAmount?: number): string {
  // 需要提供完整的生长时期和缺水等级信息
  if (!growthPeriod || !waterDeficitLevel) {
    return '请提供完整的生长时期和缺水等级信息以获取建议';
  }

  // 格式化补水量显示
  const formatWaterAmount = (amount: number): string => {
    return `${amount.toFixed(2)} m³/亩`;
  };

  // 拔节期建议
  if (growthPeriod.includes('拔节')) {
    if (waterDeficitLevel.includes('重度')) {
      const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '60.0 m³/亩';
      return `当前谷子处于拔节期，重度缺水。症状表现为：谷子叶片严重卷曲，形似细针，植株萎蔫下垂，下部叶片大量枯黄、脱落，谷子生长停滞。建议观察谷子生长表现，迅速、彻底地补充大量水分，补水时机不分早晚，立即进行，参考补水量为：${amount}。补水方式建议喷灌或滴灌，根据田间实际情况补水至谷子根系土壤层（30-40厘米深）充分湿润，并结合追施复合肥，挽救即将枯死的植株。`;
    } else if (waterDeficitLevel.includes('中度')) {
      const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '40.0 m³/亩';
      return `当前谷子处于拔节期，中度缺水。症状表现为：谷子叶片明显卷曲、颜色发灰绿色，生长缓慢，且下部叶片可能开始发黄。建议观察谷子生长表现，快速补充充足水分，补水时机在太阳落山或早间清晨，参考补水量为：${amount}。补水方式建议喷灌或滴灌，根据田间实际情况补水至谷子根系土壤层（20-30厘米深）充分湿润，恢复谷子生长所需水分。`;
    } else if (waterDeficitLevel.includes('轻微')) {
      const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '25.0 m³/亩';
      return `当前谷子处于拔节期，轻微缺水。症状表现为：谷子叶片应当呈现稍微弯曲、颜色不如平时鲜绿、略显发暗。建议观察谷子生长表现，并结合天气情况，若未来几天无降雨，及时适量补充水分，避免缺水加重，补水时机在太阳落山或早间清晨，参考补水量为：${amount}。补水方式建议喷灌或滴灌，根据田间实际情况补水至谷子根系周围土壤保持湿润即可，若未来几天有降雨，则可继续观察谷子生长情况。`;
    } else {
      return '当前地块水分适宜，无需额外补水。建议继续保持当前灌溉管理方式，定期监测土壤墒情变化，根据天气情况调整灌溉计划。';
    }
  }

  // 抽穗期建议
  if (growthPeriod.includes('抽穗')) {
    if (waterDeficitLevel.includes('重度')) {
      const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '50.0 m³/亩';
      return `当前谷子处于抽穗期，重度缺水。症状表现为：谷子叶片严重卷曲、叶尖枯黄干枯，谷穗难以抽出，即使抽出，也干枯发白，小花凋谢，整个植株萎蔫下垂。建议观察谷子生长表现，迅速、彻底补充大量水分，让谷子根系吸收到水分。补水时机不分早晚，立即进行，参考补水量为：${amount}。补水方式建议喷灌或滴灌，少量多次，避免水分流失，结合田间实际情况，使得谷子根系主要分布土壤层（30-40厘米深）充分湿润。`;
    } else if (waterDeficitLevel.includes('中度')) {
      const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '35.0 m³/亩';
      return `当前谷子处于抽穗期，中度缺水。症状表现为：白天谷子叶片明显卷曲、颜色发灰绿色，谷穗抽出困难，或只抽出一半，甚至卡在叶鞘无法抽穗。建议观察谷子生长表现，快速补充充足水分，确保谷穗能顺利抽出。补水时机在太阳落山或早间清晨，参考补水量为：${amount}。补水方式建议喷灌或滴灌，结合田间实际情况，使得谷子根系主要分布土壤层（20-30厘米深）充分湿润，避免大水冲刷，水流不要直接冲刷到谷穗上。`;
    } else if (waterDeficitLevel.includes('轻微')) {
      const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '20.0 m³/亩';
      return `当前谷子处于抽穗期，轻微缺水。症状表现为：白天最热时，谷子叶片稍微卷曲、颜色发暗，傍晚或次日清晨又恢复舒展。建议观察谷子生长表现，立即补充适量水分，确保谷穗能顺利抽出。补水时机在太阳落山或早间清晨，参考补水量为：${amount}。补水方式建议喷灌或滴灌，避免水直接冲到谷穗，影响授粉。`;
    } else {
      return '当前地块水分适宜，无需额外补水。建议继续保持当前灌溉管理方式，定期监测土壤墒情变化，根据天气情况调整灌溉计划。';
    }
  }

  // 灌浆期建议
  if (growthPeriod.includes('灌浆')) {
    if (waterDeficitLevel.includes('重度')) {
      const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '45.0 m³/亩';
      return `当前谷子处于灌浆期，重度缺水。症状表现为：谷子叶片严重卷曲，叶尖枯黄、干枯，谷穗上籽粒大部分干瘪、发白、毫无饱满度，整个植株萎蔫下垂，下部叶片大量枯黄干枯。建议观察谷子生长表现，迅速、彻底地补充大量水分，让谷子根系能够吸收到水，使剩余籽粒继续灌浆。补水时机部分早晚，立即进行，参考补水量为：${amount}。补水方式建议喷灌或滴灌，均匀、持续补水，使土壤湿润到30-40厘米深，避免水分流失。`;
    } else if (waterDeficitLevel.includes('中度')) {
      const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '30.0 m³/亩';
      return `当前谷子处于灌浆期，中度缺水。症状表现为：白天谷子叶片明显卷曲，颜色发灰绿色，谷穗上籽粒明显发瘪、不饱满，下部叶片可能开始发黄干枯。建议观察谷子生长表现，快速补充充足水分，让谷子根系主要分布的土壤层（20-30厘米深）充分湿润，帮助籽粒尽快恢复灌浆。补水时机在傍晚或早间清晨，参考补水量为：${amount}。补水方式建议喷灌或滴灌，均匀、持续补水。`;
    } else if (waterDeficitLevel.includes('轻微')) {
      const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '15.0 m³/亩';
      return `当前谷子处于灌浆期，轻微缺水。症状表现为：白天最热时，谷子叶片稍微卷曲，颜色略显发暗，籽粒不够饱满。建议观察谷子生长表现，立即补充适量水分，确保籽粒充分灌浆，变得饱满沉重。补水时机在傍晚或早间清晨，参考补水量为：${amount}。补水方式建议喷灌或滴灌。避免大水直接冲刷谷穗或造成积水。补水后持续观察，确保籽粒持续饱满。`;
    } else {
      return '当前地块水分适宜，有利于籽粒灌浆。建议继续保持当前灌溉管理方式，定期监测土壤墒情变化，根据天气情况调整灌溉计划。';
    }
  }

  // 默认建议（针对未识别的生长时期）
  if (waterDeficitLevel.includes('重度')) {
    const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '';
    return `当前地块重度缺水，请及时补水。若遇重度干旱灾情，添加保水剂与水混合后灌根。补水后若遇暴雨天气及时排水，防止涝害伤苗。${amount ? `参考补水量为：${amount}。` : ''}`;
  } else if (waterDeficitLevel.includes('中度')) {
    const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '';
    return `当前地块中度缺水，建议结合天气情况及时补水。灌水时间应避开中午高温时段。${amount ? `参考补水量为：${amount}。` : ''}`;
  } else if (waterDeficitLevel.includes('轻微')) {
    const amount = waterAmount !== undefined ? formatWaterAmount(waterAmount) : '';
    return `当前地块轻微缺水，建议结合未来天气情况酌情考虑补水：若未来一周内有降雨天，则保持监测即可。若无降雨天气，结合实际情况进行灌溉，且需注意禁止在正午高温时段灌水。${amount ? `参考补水量为：${amount}。` : ''}`;
  } else {
    return '当前地块水分适宜，无需额外补水。建议继续保持当前灌溉管理方式，定期监测土壤墒情变化，根据天气情况调整灌溉计划。';
  }
}

/**
 * 根据生长时期和缺肥等级动态生成补肥建议
 * @param growthPeriod 生长期
 * @param fertilizerDeficitLevel 缺肥等级
 * @param fertilizerSuggestion 自定义建议（可选）
 * @returns 补肥建议文本
 */
export function getFertilizerSuggestion(
  growthPeriod: string | undefined,
  fertilizerDeficitLevel: string | undefined,
  fertilizerSuggestion?: string
): string {
  // 如果有自定义建议，优先使用自定义建议
  if (fertilizerSuggestion) {
    return fertilizerSuggestion;
  }

  // 需要提供完整的生长时期和缺肥等级信息
  if (!growthPeriod || !fertilizerDeficitLevel) {
    return '请提供完整的生长时期和缺肥等级信息以获取建议';
  }

  // 拔节期建议
  if (growthPeriod.includes('拔节')) {
    if (fertilizerDeficitLevel.includes('重度')) {
      return '当前谷子处于拔节期，重度缺肥。做好清垄，去除杂草，避免争肥，并做好中耕，锄深、锄透。建议及时追肥，补充谷子养分需求，建议亩施尿素10-15公斤（根据地力实际情况调整），施肥时机在降雨前或降雨后，将尿素均匀撒施在谷垄中间，避免撒到叶片，防止烧叶，也可结合中耕施肥，或配合补水施肥。';
    } else if (fertilizerDeficitLevel.includes('中度')) {
      return '当前谷子处于拔节期，中度缺肥。做好清垄，去除杂草，避免争肥，并做好中耕，锄深、锄透。建议快速追肥，补充谷子养分需求，建议亩施尿素8-10公斤（根据地力实际情况调整），施肥时机在降雨前或降雨后，将尿素均匀撒施在谷垄中间，避免撒到叶片，防止烧叶，也可结合中耕施肥，或配合补水施肥。';
    } else if (fertilizerDeficitLevel.includes('轻微')) {
      return '当前谷子处于拔节期，轻微缺肥。做好清垄，去除杂草，避免争肥，并做好中耕，锄深、锄透。建议适量追肥，补充谷子养分需求，建议亩施尿素5-8公斤（根据地力实际情况调整），施肥时机在降雨前或降雨后，将尿素均匀撒施在谷垄中间，避免撒到叶片，防止烧叶，也可结合中耕施肥，或配合补水施肥。';
    } else {
      return '当前地块氮素含量适宜，无需额外补充氮肥。建议继续保持当前施肥管理方式，定期监测植株长势和叶色变化。';
    }
  }

  // 抽穗期建议
  if (growthPeriod.includes('抽穗')) {
    if (fertilizerDeficitLevel.includes('重度')) {
      return '当前谷子处于抽穗期，重度缺肥。建议及时追肥，补充谷子养分需求，建议亩施尿素8-10公斤（根据地力实际情况调整），施肥时机在降雨前或降雨后，将尿素均匀撒施在谷垄中间，避免撒到叶片，防止烧叶。每亩地叶面喷施0.2% ~ 0.5%磷酸二氢钾以及0.1% ~ 0.3%硼酸，抽穗前后各一次，补充磷钾，防止早衰。';
    } else if (fertilizerDeficitLevel.includes('中度')) {
      return '当前谷子处于抽穗期，中度缺肥。建议快速追肥，补充谷子养分需求，建议亩施尿素5-8公斤（根据地力实际情况调整），施肥时机在降雨前或降雨后，将尿素均匀撒施在谷垄中间，避免撒到叶片，防止烧叶。每亩地叶面喷施0.2% ~ 0.5%磷酸二氢钾。晴天早上或傍晚喷施到叶片上，抽穗前后各一次，补充磷钾，防止早衰。';
    } else if (fertilizerDeficitLevel.includes('轻微')) {
      return '当前谷子处于抽穗期，轻微缺肥。建议适量追肥，补充谷子养分需求，每亩地叶面喷施0.2% ~ 0.5%磷酸二氢钾。晴天早上或傍晚喷施到叶片上，补充磷钾，防止早衰。';
    } else {
      return '当前地块氮素含量适宜，无需额外补充氮肥。建议继续保持当前施肥管理方式，定期监测植株长势和叶色变化。';
    }
  }

  // 灌浆期建议
  if (growthPeriod.includes('灌浆')) {
    if (fertilizerDeficitLevel.includes('重度')) {
      return '当前谷子处于灌浆期，重度缺肥。建议适量追肥，补充谷子养分需求，每亩地叶面混合喷施0.2% ~ 0.5%磷酸二氢钾以及0.3% ~ 0.5%尿素。喷施2次，间隔5 ~ 7天，晴天早上或傍晚喷施到叶片上，补充磷钾，促进籽粒饱满，叶面补氮，快速补充营养。';
    } else if (fertilizerDeficitLevel.includes('中度')) {
      return '当前谷子处于灌浆期，中度缺肥。建议适量追肥，补充谷子养分需求，每亩地叶面混合喷施0.2% ~ 0.5%磷酸二氢钾以及0.2% ~ 0.3%尿素。喷施1 ~ 2次，晴天早上或傍晚喷施到叶片上，补充磷钾，促进籽粒饱满，叶面补氮，防止早衰。';
    } else if (fertilizerDeficitLevel.includes('轻微')) {
      return '当前谷子处于灌浆期，轻微缺肥。建议适量追肥，补充谷子养分需求，每亩地叶面喷施0.2% ~ 0.5%磷酸二氢钾。喷施一次，晴天早上或傍晚喷施到叶片上，补充磷钾，促进籽粒饱满，提高干粒重。';
    } else {
      return '当前地块养分充足，有利于籽粒灌浆。建议继续保持当前管理方式，定期监测田间情况，及时清理沟渠，确保排水通畅。';
    }
  }

  // 默认建议（针对未识别的生长时期）
  if (fertilizerDeficitLevel.includes('重度')) {
    return '当前地块重度缺肥，需及时补充养分。根据当前生长时期合理选择肥料种类和用量，采用沟施、穴施或叶面喷施等方式进行补充，施肥后及时补水促进养分吸收。';
  } else if (fertilizerDeficitLevel.includes('中度')) {
    return '当前地块中度缺肥，需适量补充养分。根据当前生长时期合理选择肥料种类和用量，采用沟施、穴施或叶面喷施等方式进行补充，避免肥料与根系直接接触。';
  } else if (fertilizerDeficitLevel.includes('轻微')) {
    return '当前地块养分略有不足，可适量补充。根据当前生长时期合理选择肥料种类和用量，采用叶面喷施等方式进行补充，提高肥料利用率。';
  } else {
    return '当前地块养分充足，无需额外补充肥料。建议继续保持当前施肥管理方式，定期监测植株长势和叶色变化。';
  }
}
