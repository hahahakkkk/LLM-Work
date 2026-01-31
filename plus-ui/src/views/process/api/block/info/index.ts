import request from '@/utils/request';

/**
 * 查询溯源信息详细
 * @param traceCode
 */
export function getTraceInfo(traceCode: string) {
  return request({
    url: `/block/trace/search/${traceCode}`,
    method: 'get'
  });
}

/**
 * 获取所有溯源码列表
 */
export function getAllTraceCodes() {
  return request({
    url: '/block/trace/codes',
    method: 'get'
  });
}
