/* eslint-disable */
// noinspection JSUnusedGlobalSymbols

/**
 *
 * @author Kenvix <i@kenvix.com>
 */

export const regionDict: Record<string, string> = {
  '1': '姜兴庄智慧引领种植基地',
  '2': '侯家沟数字化种植基地',
  '4': '李家寺',
  '5': '高家硷基地',
  '6': '冯渠',
  '7': '寺沟',
  '8': '岳岔',
  '9': '杨家沟'
};

export const getRegionDisplayName = (id: number | string): string => {
  let idKey = String(id);
  let value = regionDict[idKey];
  if (value) {
    return value.indexOf('基地') != -1 ? value : value + '基地';
  } else {
    return '未知区域';
  }
};

export const dangerousLevelColors = {
  '-1': 'rgba(128, 128, 128, 0.3)', // 默认 - 灰色
  '0': 'rgba(0, 255, 0, 0.6)', // 正常 - 绿色
  '1': 'rgba(0,255,225,0.6)', // 轻度预警 - 青色
  '2': 'rgba(255,255,0,0.6)', // 中等预警 - 橙色
  '3': 'rgba(255,0,255,0.6)', // 严重预警 - 橙红色
  '4': 'rgba(255,0,0,0.66)' // 极严重预警 - 红色
};

export enum WarningLevel {
  DEFAULT = -1,
  NORMAL = 0, // 正常
  MINOR = 1, // 轻度预警
  MEDIUM = 2, // 中等预警
  SEVERE = 3, // 严重预警
  EXTREME = 4 // 极严重预警
}

export namespace WarningLevel {
  export function getColor(level: WarningLevel): string {
    switch (level) {
      case WarningLevel.NORMAL:
        return dangerousLevelColors['0'];
      case WarningLevel.MINOR:
        return dangerousLevelColors['1'];
      case WarningLevel.MEDIUM:
        return dangerousLevelColors['2'];
      case WarningLevel.SEVERE:
        return dangerousLevelColors['3'];
      case WarningLevel.EXTREME:
        return dangerousLevelColors['4'];
      default:
        return dangerousLevelColors['-1']; // 默认颜色
    }
  }

  export function getDisplayName(level: WarningLevel): string {
    switch (level) {
      case WarningLevel.DEFAULT:
        return '默认';
      case WarningLevel.NORMAL:
        return '正常';
      case WarningLevel.MINOR:
        return '轻度预警';
      case WarningLevel.MEDIUM:
        return '中等预警';
      case WarningLevel.SEVERE:
        return '严重预警';
      case WarningLevel.EXTREME:
        return '极严重预警';
      default:
        return '未知预警级别';
    }
  }

  export function fromWarningLevelInt(level: number | string): WarningLevel {
    if (typeof level === 'string') {
      level = parseInt(level);
    }

    switch (level) {
      case -1:
        return WarningLevel.DEFAULT;

      case 99:
        return WarningLevel.NORMAL;

      case 0:
      case 4:
      case 8:
        return WarningLevel.MINOR;

      case 1:
      case 5:
      case 9:
        return WarningLevel.MEDIUM;

      case 2:
      case 6:
      case 10:
        return WarningLevel.SEVERE;

      case 3:
      case 7:
      case 11:
        return WarningLevel.EXTREME;

      default:
        return WarningLevel.DEFAULT;
    }
  }

  export function fromDangerousLevelInt(level: number): WarningLevel {
    switch (level) {
      case 0:
        return WarningLevel.NORMAL;
      case 1:
        return WarningLevel.MINOR;
      case 2:
        return WarningLevel.MEDIUM;
      case 3:
        return WarningLevel.SEVERE;
      case 4:
        return WarningLevel.EXTREME;
      default:
        return WarningLevel.DEFAULT;
    }
  }
}

export enum DisasterType {
  DRY = 'dry',
  FLOOD = 'flood',
  HAIL = 'hail'
}

export namespace DisasterType {
  export function getDisplayName(type: DisasterType): string {
    switch (type) {
      case DisasterType.DRY:
        return '干旱';
      case DisasterType.FLOOD:
        return '洪涝';
      case DisasterType.HAIL:
        return '冰雹';
      default:
        return '未知灾害类型';
    }
  }

  export function fromTypeInt(type: number): DisasterType | null {
    switch (type) {
      case 0:
        return DisasterType.DRY;
      case 1:
        return DisasterType.FLOOD;
      case 2:
        return DisasterType.HAIL;
      default:
        return null;
    }
  }
}

export const warningLevelToDangerousLevelMap = {};
