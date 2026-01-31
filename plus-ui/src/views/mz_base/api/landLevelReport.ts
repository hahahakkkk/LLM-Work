import request from '@/utils/request';

export type SummaryRow = {
  baseId: number;
  base: string;
  counts: number[]; // [L1..L6]
  areas: string[] | number[]; // BigDecimal -> 后端可能转字符串
  totalCount: number;
  totalArea: string | number;
};

export type BaseDetailRow = {
  level: string;
  count: number;
  area: string | number;
  ratio: number;
};

export function fetchSummary(params: { year?: string } = {}) {
  return request({
    url: '/mz-base/landLevelReport/summary',
    method: 'get',
    params
  });
}

export function fetchBaseDetail(params: { baseId: number; year?: string }) {
  return request({
    url: '/mz-base/landLevelReport/baseDetail',
    method: 'get',
    params
  });
}
