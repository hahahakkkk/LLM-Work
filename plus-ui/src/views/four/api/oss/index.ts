import request from '@/utils/request';
import { OssQuery, OssVO } from './types';
import { AxiosPromise } from 'axios';
import qs from 'qs';

// 查询OSS对象存储列表
export function listOss(query: OssQuery): AxiosPromise<OssVO[]> {
  return request({
    url: '/four/oss/list',
    method: 'get',
    params: query
  });
}

// 查询OSS对象基于id串
export function listByIds(ossId: string | number): AxiosPromise<OssVO[]> {
  return request({
    url: '/four/oss/listByIds/' + ossId,
    method: 'get'
  });
}

export function deleteOss(ossUrl: string | number | Array<string | number>): AxiosPromise<void> {
  // 统一转成数组并过滤空值、null 和 undefined
  const urlArray = (Array.isArray(ossUrl) ? ossUrl : [ossUrl])
    .map(String)
    .flatMap((s) => s.split(','))
    .map((s) => s.trim())
    .filter((s) => s !== '' && s !== 'null' && s !== 'undefined');

  // 如果全部为空就不发请求
  if (!urlArray.length) return Promise.resolve(void 0);
  return request({
    url: '/four/oss/delete',
    method: 'delete',
    data: urlArray
  });
}

/**
 * 根据ids查询urls，可以查单个id，也可查逗号分隔的ids串
 * @param ossId
 */
export function selectUrlByIds(ossId: string | number): AxiosPromise<string> {
  return request({
    url: '/four/oss/selectUrlByIds/' + ossId,
    method: 'get'
  });
}

/**
 * 批量获取 id → url 映射
 * ids: number[] | string[]
 */
export function selectUrlMapByIds(ids: (string | number)[]): AxiosPromise<Record<string, string>> {
  return request({
    url: '/four/oss/selectUrlMapByIds',
    method: 'post',
    data: ids
  });
}
