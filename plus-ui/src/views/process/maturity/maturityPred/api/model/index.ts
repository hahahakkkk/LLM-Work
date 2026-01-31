import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ModelVO, ModelForm, ModelQuery } from './types';

/**
 * 查询模型列表
 * @param query 查询参数
 * @returns 模型列表
 */
export const listModel = (query?: ModelQuery): AxiosPromise<ModelVO[]> => {
  return request({
    url: '/process/maturity/model/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询模型详细
 * @param modelId 模型ID
 * @returns 模型详情
 */
export const getModel = (modelId: string | number): AxiosPromise<ModelVO> => {
  return request({
    url: '/process/maturity/model/' + modelId,
    method: 'get'
  });
};

/**
 * 新增模型
 * @param data 模型表单数据
 * @returns
 */
export const addModel = (data: ModelForm) => {
  return request({
    url: '/process/maturity/model',
    method: 'post',
    data: data
  });
};

/**
 * 修改模型
 * @param data 模型表单数据
 * @returns
 */
export const updateModel = (data: ModelForm) => {
  return request({
    url: '/process/maturity/model',
    method: 'put',
    data: data
  });
};

/**
 * 删除模型
 * @param modelId 模型ID
 * @returns
 */
export const delModel = (modelId: string | number | Array<string | number>) => {
  return request({
    url: '/process/maturity/model/' + modelId,
    method: 'delete'
  });
};

/**
 * 处理RGB图像
 * @param modelId 模型ID
 * @param file 图像文件
 * @returns 处理结果
 */
export function processRgbImage(modelId: string, file: File) {
  const formData = new FormData();
  formData.append('modelId', modelId);
  formData.append('rgbImage', file); // 必须使用"rgbImage"作为key
  console.log('formData:', formData);
  return request({
    url: '/process/maturity/model/processRgb', // 确保URL与后端一致
    method: 'post',
    data: formData
  });
}

/**
 * 通过URL处理RGB图像
 * @param modelId 模型ID
 * @param imageUrl 图像URL
 * @returns 处理结果
 */
export function processRgbImageUrl(modelId: string, imageUrl: string) {
  // 创建一个包含URL的文本文件
  const urlFile = new File([imageUrl], 'image_url.txt', { type: 'text/plain' });

  const formData = new FormData();
  formData.append('modelId', modelId);
  formData.append('rgbImage', urlFile);
  formData.append('image', imageUrl); // 同时添加原始URL作为参数

  return request({
    url: '/process/maturity/model/processRgb',
    method: 'post',
    data: formData
  });
}
