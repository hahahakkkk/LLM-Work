import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  getTacticsResponseVO,
  identifyRgbResponseVO,
  IdentifySTRequest,
  IdentifySTResponse,
  IdentifySTResponseItem,
  IdentifySTResponseData,
  GetStrategyRequest,
  GetStrategyResponseVO,
  GetSTInfoRequest,
  GetSTInfoResponse,
  GetSTInfoResponseData
} from './types';
import { type ModelVO } from '@/views/process/api/types';
import axios from 'axios';

// 导出类型供外部使用
export type {
  IdentifySTRequest,
  IdentifySTResponse,
  IdentifySTResponseItem,
  IdentifySTResponseData,
  GetSTInfoRequest,
  GetSTInfoResponse,
  GetSTInfoResponseData
};

// Flask 服务器地址（通过Vite代理）
const FLASK_SERVER_URL = '/flask-api';
// 备用直接访问地址
const DIRECT_FLASK_URL = 'http://localhost:5000';

// 检测服务器连接状态
const testServerConnection = async (url: string): Promise<boolean> => {
  try {
    // 测试根路径或health check端点
    const response = await axios.get(`${url}/`, {
      timeout: 3000,
      validateStatus: (status) => status < 500 // 404也算连通
    });
    console.log(`服务器 ${url} 连接测试成功`);
    return true;
  } catch (error) {
    console.log(`服务器 ${url} 连接失败:`, error);
    return false;
  }
};

// 原有的识别接口（保留备用）
export const identifyRgb = (modelId: number, images: File[]): AxiosPromise<identifyRgbResponseVO[]> => {
  const formData = new FormData();
  formData.append('modelId', String(modelId));
  images.forEach((image) => {
    formData.append('images', image);
  });
  return request({
    url: '/pestcontrol/identify/rgb',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  });
};

/**
 * 病害识别接口
 * @param images 上传的图片文件列表
 */
export const identifyDiseaseId = (images: File[]): AxiosPromise<identifyRgbResponseVO[]> => {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });
  return request({
    url: '/pestcontrol/identify/diseaseId',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  });
};

/**
 * 虫害识别接口
 * @param images 上传的图片文件列表
 */
export const identifyPestId = (images: File[]): AxiosPromise<identifyRgbResponseVO[]> => {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });
  return request({
    url: '/pestcontrol/identify/pestId',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  });
};

// 新的Flask服务器识别接口
export const identifyWithFlask = async (images: File[]): Promise<identifyRgbResponseVO[]> => {
  const results: identifyRgbResponseVO[] = [];

  console.log(`开始调用Flask服务器识别 ${images.length} 张图片`);

  // 选择可用的服务器
  let serverUrl = FLASK_SERVER_URL;

  // 优先使用Vite代理访问（避免CORS问题）
  serverUrl = FLASK_SERVER_URL;
  console.log('使用Vite代理访閮Flask服务器');

  // 测试连接
  try {
    const testResponse = await axios.post(`${serverUrl}/upload-and-detect`, new FormData(), {
      timeout: 3000,
      validateStatus: (status) => status !== 500 // 400是正常的（没有文件）
    });
    console.log('Flask服务器连接测试成功（通过Vite代理）');
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      console.log('Flask服务器连接测试成功（400错误是正常的，表示服务器运行正常）');
    } else {
      console.error('Vite代理访閮失败，尝试直接访閮:', error.message);

      // 如果Vite代理失败，尝试直接访问（可能会遇到CORS问题）
      try {
        serverUrl = DIRECT_FLASK_URL;
        const directTestResponse = await axios.post(`${serverUrl}/upload-and-detect`, new FormData(), {
          timeout: 3000,
          validateStatus: (status) => status !== 500
        });
        console.log('直接访閮Flask服务器成功');
      } catch (directError: any) {
        console.error('Flask服务器直接访问也失败:', directError.message);
        throw new Error(`Flask服务器不可用: ${directError.message}。请确保SSH端口转发正常运行（ssh -L 5000:localhost:5000 rui@172.29.1.19）`);
      }
    }
  }

  // 逐个处理图片（Flask接口一次只能处理一张）
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    console.log(`正在处理第 ${i + 1} 张图片: ${image.name}`);

    try {
      const formData = new FormData();
      formData.append('file', image);

      const response = await axios.post(`${serverUrl}/upload-and-detect`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob', // 首先尝试接收为图片
        timeout: 30000 // 30秒超时
      });

      console.log(`第 ${i + 1} 张图片处理完成:`, {
        status: response.status,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        hasXDetections: !!response.headers['x-detections']
      });

      // 从响应头获取检测结果JSON
      const detectionsHeader = response.headers['x-detections'];
      let detections = [];

      if (detectionsHeader) {
        try {
          detections = JSON.parse(detectionsHeader);
          console.log(`第 ${i + 1} 张图片检测结果:`, detections);
        } catch (parseError) {
          console.error('解析检测结果失败:', parseError);
        }
      }

      // 检查响应内容类型和大小
      const contentType = response.headers['content-type'] || '';
      const imageBlob = response.data;
      let imageUrl: string;

      console.log(`第 ${i + 1} 张图片Blob信息:`, {
        size: imageBlob.size,
        type: imageBlob.type,
        contentType: contentType
      });

      // 判断是否为有效的图片响应
      const isValidImage = contentType.startsWith('image/') && imageBlob.size > 1000;

      if (!isValidImage) {
        console.warn(`第 ${i + 1} 张图片：Flask服务器返回非有效图片数据（${contentType}, ${imageBlob.size}字节），使用原图显示`);

        // 为原图创建全新的blob URL（避免缓存）
        const originalBlob = new Blob([image], { type: image.type });
        imageUrl = URL.createObjectURL(originalBlob);

        // 如果检测结果为空，尝试从响应体解析JSON
        if (detections.length === 0) {
          try {
            const text = await imageBlob.text();
            const jsonData = JSON.parse(text);
            if (Array.isArray(jsonData)) {
              detections = jsonData;
              console.log(`从响应体解析到检测结果:`, detections);
            }
          } catch (parseError) {
            console.log('无法从响应体解析JSON');
          }
        }
      } else {
        // 正常的图片响应，使用处理后的图片
        imageUrl = URL.createObjectURL(imageBlob);
        console.log(`第 ${i + 1} 张图片URL创建成功（处理后图片）:`, imageUrl);
      }

      // 提取病虫害类型（取置信度最高的）
      let pestTypes = '未检测到病虫害';
      if (detections && detections.length > 0) {
        // 按置信度排序，取最高的
        detections.sort((a: any, b: any) => b.confidence - a.confidence);
        pestTypes = detections[0].class || '未知病虫害';
      }

      results.push({
        imageUrl: imageUrl,
        pestTypes: pestTypes,
        detections: detections, // 添加完整的检测结果
        originalFileName: image.name,
        confidence: detections.length > 0 ? detections[0].confidence : 0,
        serverUsed: serverUrl, // 记录使用的服务器
        timestamp: Date.now() + i, // 添加时间戳标识（加上index确保唯一性）
        imageType: isValidImage ? 'processed' : 'original' // 标记图片类型
      });
    } catch (error: any) {
      console.error(`第 ${i + 1} 张图片处理失败:`, error);

      // 提供更详细的错误信息
      let errorMessage = '识别失败';
      if ((error as any).code === 'ECONNREFUSED') {
        errorMessage = 'Flask服务器连接被拒绝，请检查SSH端口转发是否正常';
      } else if ((error as any).code === 'ENOTFOUND') {
        errorMessage = '无法找到Flask服务器';
      } else if ((error as any).code === 'ETIMEDOUT') {
        errorMessage = 'Flask服务器请求超时';
      } else if ((error as any).response) {
        errorMessage = `服务器错误: ${(error as any).response.status} - ${(error as any).response.statusText}`;
      }

      // 添加错误结果
      results.push({
        imageUrl: URL.createObjectURL(image), // 使用原图
        pestTypes: errorMessage,
        error: (error as Error).message || '未知错误',
        originalFileName: image.name,
        confidence: 0,
        serverUsed: serverUrl,
        timestamp: Date.now() + i, // 添加时间戳标识（加上index确保唯一性）
        imageType: 'original' // 标记图片类型
      });
    }
  }

  console.log('所有图片处理完成:', results);
  return results;
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

/**
 * 播种期识别接口
 * @param data 包含品种和基地的请求参数
 * @returns Promise<IdentifySTResponse>
 */
export const identifyST = (data: IdentifySTRequest): AxiosPromise<IdentifySTResponse> => {
  return request({
    url: '/pestcontrol/identify/st',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  });
};

/**
 * 获取病虫害防治策略接口（新版）
 * @param pestClass 病虫害类别
 * @returns Promise<GetStrategyResponseVO[]>
 */
export const getStrategy = (pestClass: string): AxiosPromise<GetStrategyResponseVO[]> => {
  return request({
    url: '/pestscience/classify/getStrategy',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      class: pestClass
    }
  });
};

/**
 * 获取播种期信息接口（温度和湿度柱状图）
 * @param data 包含品种和基地的请求参数
 * @returns Promise<GetSTInfoResponse>
 */
export const getSTInfo = (data: GetSTInfoRequest): AxiosPromise<GetSTInfoResponse> => {
  return request({
    url: '/pestcontrol/identify/stinfo',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  });
};
