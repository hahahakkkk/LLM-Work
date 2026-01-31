import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { getTacticsResponseVO, identifyWhResponseVO } from './types';

// TODO: 需要确认后端正确的生育期识别接口路径
// 当前使用的是病虫害识别接口，需要改为生育期识别专用接口
// 可能的路径: /growthstage/identify 或 /seedling/identify 或其他
export const identifyWh = (modelId: number, images: File[]): AxiosPromise<identifyWhResponseVO[]> => {
  const formData = new FormData();
  formData.append('modelId', String(modelId));
  images.forEach((image) => {
    formData.append('images', image);
  });
  return request({
    // ❌ 错误：这是病虫害识别的接口，不是生育期识别的接口
    // ✅ 需要改为: /growthstage/identify 或正确的生育期识别接口路径
    url: '/pestcontrol/identify/wh',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  });
};

export const getTactics = (pestTypes: string): AxiosPromise<getTacticsResponseVO[]> => {
  return request({
    url: '/pestscience/classify/getTactics',
    method: 'get',
    params: {
      'pestTypes': pestTypes
    }
  });
};
