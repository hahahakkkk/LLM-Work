import request from '@/utils/request';
import { AxiosPromise } from 'axios';

import { TableDict } from './types';

/**
 * 肥料
 */
export const fertilizerDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/mz-base/tableDict/fertilizer' + query,
    method: 'get',
    params: query
  });
};
/*
 * 农药
 */
export const chemicalDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/mz-base/tableDict/agricultureChemical' + query,
    method: 'get',
    params: query
  });
};

/**
 * 基地
 */
export const baseDictQuery = (query: Record<string, any> = {}): AxiosPromise<TableDict[]> => {
  return request({
    url: '/mz-base/tableDict/base',
    method: 'get',
    params: query
  });
};

/**
 * 地块
 */
export const landDictQuery = (query: Record<string, any> = {}): AxiosPromise<TableDict[]> => {
  return request({
    url: '/mz-base/tableDict/land',
    method: 'get',
    params: query
  });
};

/**
 * 地块面积
 */
export const landAreaDictQuery = (query: Record<string, any> = {}): AxiosPromise<TableDict[]> => {
  return request({
    url: '/mz-base/tableDict/landArea',
    method: 'get',
    params: query
  });
};

/**
 * 农户
 */
export const farmerDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/mz-base/tableDict/farmer' + query,
    method: 'get',
    params: query
  });
};

/**
 * 农户-地块
 */
export const farmerLandDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/mz-base/tableDict/farmerLand',
    method: 'get',
    params: query
  });
};

/**
 * 农户-基地
 */
export const farmerBaseDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/mz-base/tableDict/farmerBase',
    method: 'get',
    params: query
  });
};

/**
 * 化肥字典
 */
export const fertDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/powland/tableDict/fert',
    method: 'get',
    params: query
  });
};

/**
 * 有机肥
 */
export const organicDictQuery = (query = ''): AxiosPromise<TableDict[]> => {
  return request({
    url: '/powland/tableDict/organic',
    method: 'get',
    params: query
  });
};
