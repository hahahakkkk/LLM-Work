import request from '@/utils/request';

interface PowlandStats {
  baseCount: number;
  landCount: number;
  sampleCount: number;
  avgYield: number;
}
export function getPowlandOverview(): Promise<PowlandStats> {
  return request({ url: '/powland/overview', method: 'get' });
}

// mz-base 后端：地力、气象、灌溉、喷药、施肥、配方历史
interface MzBaseOverview {
  soilFertility: {
    values: number[];
    keys: string[];
  };
  weather: { month: number; avgTemp: number; totalRain: number }[];
  irrigation: string[];
  spray: string[];
  fertilization: string[];
  formula: string[];
}

export function getOverview(year: number): Promise<MzBaseOverview> {
  return request({
    url: `/mz-base/overview?year=${year}`,
    method: 'get'
  });
}

// 新增：获取所有基地近五年种植面积（供堆叠柱状图用）
export function getAllBasesPlantArea(): Promise<{ baseId: string; baseName: string; year: string; totalArea: number }[]> {
  return request({
    url: '/mz-base/overview/plantArea/all',
    method: 'get'
  });
}

// 新增：获取单个基地近五年种植面积
export function getSingleBasePlantArea(baseId: string): Promise<{ baseId?: string; baseName?: string; year: string; totalArea: number }[]> {
  return request({
    url: `/mz-base/overview/plantArea/${baseId}`,
    method: 'get'
  });
}
