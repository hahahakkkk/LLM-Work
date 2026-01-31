import request from '@/utils/request';
import axios, { AxiosPromise } from 'axios';
import { areaDetectResponseVO, pestTacticsVO, BackDieaseAreaStaticVO, PestDetectionMapVO } from './types';

// 分片上传配置
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB每片
const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024; // 100MB阈值
const MAX_CONCURRENT_UPLOADS = 3; // 最大并发上传数

// 生成唯一文件ID
const generateFileId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 检查已上传的分片
const checkUploadedChunks = async (fileId: string, fileType: 'tif' | 'rgb'): Promise<number[]> => {
  try {
    const response = await axios.get('/area-detect/api/upload/check-chunks', {
      params: { fileId, fileType }
    });
    return response.data.uploadedChunks || [];
  } catch (error) {
    console.warn('检查已上传分片失败:', error);
    return [];
  }
};

// 上传单个分片（带重试机制）
const uploadChunk = async (
  chunk: Blob,
  chunkIndex: number,
  fileId: string,
  fileType: 'tif' | 'rgb',
  onProgress?: (progress: number) => void,
  retries = 3
): Promise<void> => {
  const formData = new FormData();
  formData.append('chunk', chunk);
  formData.append('chunkIndex', chunkIndex.toString());
  formData.append('fileId', fileId);
  formData.append('fileType', fileType);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await axios.post('/area-detect/api/upload/chunk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
        timeout: 300000 // 5分钟超时
      });
      return; // 上传成功，退出重试循环
    } catch (error) {
      if (attempt < retries) {
        console.warn(`分片 ${chunkIndex} 上传失败，正在重试 (${attempt + 1}/${retries}):`, error);
        // 指数退避：等待时间随重试次数递增
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      } else {
        console.error(`分片 ${chunkIndex} 上传失败，已达最大重试次数:`, error);
        throw error;
      }
    }
  }
};

// 并发上传控制器
class ConcurrentUploader {
  private queue: Array<() => Promise<void>> = [];
  private running = 0;
  private maxConcurrent: number;
  private totalTasks = 0;
  private completedTasks = 0;
  private onProgress?: (progress: number) => void;

  constructor(maxConcurrent: number, onProgress?: (progress: number) => void) {
    this.maxConcurrent = maxConcurrent;
    this.onProgress = onProgress;
  }

  async addTask(task: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await task();
          this.completedTasks++;
          this.updateProgress();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      this.totalTasks++;
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.running++;
    try {
      await task();
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  private updateProgress(): void {
    if (this.onProgress && this.totalTasks > 0) {
      const progress = (this.completedTasks / this.totalTasks) * 100;
      this.onProgress(progress);
    }
  }

  async waitForAll(): Promise<void> {
    while (this.running > 0 || this.queue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

// 分片上传文件（多线程版本）
const uploadFileInChunks = async (file: File, fileId: string, fileType: 'tif' | 'rgb', onProgress?: (progress: number) => void): Promise<void> => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  console.log(`开始并发分片上传 ${fileType} 文件: ${file.name}, 总分片数: ${totalChunks}, 并发数: ${MAX_CONCURRENT_UPLOADS}`);

  // 检查已上传的分片（支持断点续传）
  const uploadedChunks = await checkUploadedChunks(fileId, fileType);
  console.log(`已上传分片: ${uploadedChunks.length}/${totalChunks}`);

  // 创建需要上传的分片列表
  const chunksToUpload: number[] = [];
  for (let i = 0; i < totalChunks; i++) {
    if (!uploadedChunks.includes(i)) {
      chunksToUpload.push(i);
    }
  }

  if (chunksToUpload.length === 0) {
    console.log(`${fileType} 文件已完全上传`);
    onProgress?.(100);
    return;
  }

  // 创建并发上传器
  const uploader = new ConcurrentUploader(MAX_CONCURRENT_UPLOADS, (progress) => {
    // 考虑已上传的分片，计算整体进度
    const baseProgress = (uploadedChunks.length / totalChunks) * 100;
    const remainingProgress = ((chunksToUpload.length - (chunksToUpload.length * progress) / 100) / totalChunks) * 100;
    const totalProgress = baseProgress + ((progress * chunksToUpload.length) / totalChunks / 100) * 100;
    onProgress?.(totalProgress);
  });

  // 添加所有需要上传的分片任务
  const uploadPromises = chunksToUpload.map((i) =>
    uploader.addTask(async () => {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      try {
        await uploadChunk(chunk, i, fileId, fileType);
        console.log(`${fileType} 分片 ${i + 1}/${totalChunks} 上传完成`);
      } catch (error) {
        console.error(`${fileType} 分片 ${i} 上传失败:`, error);
        throw new Error(`分片 ${i} 上传失败: ${error}`);
      }
    })
  );

  // 等待所有分片上传完成
  await Promise.all(uploadPromises);
  console.log(`${fileType} 文件并发分片上传完成`);
};

// 合并分片并预测
const mergeAndPredict = async (fileId: string, tifName: string, rgbName: string): AxiosPromise<areaDetectResponseVO> => {
  return axios.post(
    '/area-detect/api/upload/merge-and-predict',
    {
      fileId,
      tifName,
      rgbName
    },
    {
      responseType: 'blob',
      timeout: 600000 // 10分钟
    }
  );
};

export const areaDetect = async (
  modelId: number,
  multiImages: File[],
  rgbImages: File[],
  onUploadProgress?: (progressEvent: any) => void
): Promise<any> => {
  // 检查是否至少有一个文件
  if ((!multiImages || multiImages.length === 0) && (!rgbImages || rgbImages.length === 0)) {
    throw new Error('至少需要上传一个图像文件');
  }

  const tifFile = multiImages && multiImages.length > 0 ? multiImages[0] : null;
  const rgbFile = rgbImages && rgbImages.length > 0 ? rgbImages[0] : null;

  // 计算总文件大小
  const totalSize = [...(multiImages || []), ...(rgbImages || [])].reduce((acc, file) => acc + file.size, 0);

  console.log(`总上传大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);

  // 统一使用分片上传策略（后端只支持分片上传API）
  console.log('🔄 使用分片上传策略（后端统一接口）');
  return uploadWithChunks(tifFile, rgbFile, onUploadProgress);
};

// 注意：原直接上传函数已移除，因为后端不支持 /api/predict 接口
// 现在统一使用分片上传方式，无论文件大小

// 分片上传（大文件）
const uploadWithChunks = async (tifFile: File | null, rgbFile: File | null, onUploadProgress?: (progressEvent: any) => void): Promise<any> => {
  const fileId = generateFileId();
  console.log(`🆔 生成文件ID: ${fileId}`);

  let totalProgress = 0;
  const updateProgress = (phase: string, progress: number, weight: number) => {
    if (onUploadProgress) {
      const phaseProgress = progress * weight;
      console.log(`${phase} 进度: ${progress.toFixed(1)}% (权重: ${weight})`);

      // 更新总进度
      if (phase === 'tif') {
        totalProgress = phaseProgress;
      } else if (phase === 'rgb') {
        totalProgress = (tifFile ? 40 : 0) + phaseProgress;
      } else if (phase === 'merge') {
        totalProgress = (tifFile ? 40 : 0) + (rgbFile ? 40 : 0) + phaseProgress;
      }

      onUploadProgress({ loaded: totalProgress, total: 100 });
    }
  };

  try {
    // 上传TIFF文件分片
    if (tifFile) {
      console.log(`📤 开始上传TIFF文件分片: ${tifFile.name}`);
      await uploadFileInChunks(tifFile, fileId, 'tif', (progress) => {
        updateProgress('tif', progress, 0.4); // TIFF占40%
      });
    }

    // 上传RGB文件分片
    if (rgbFile) {
      console.log(`📤 开始上传RGB文件分片: ${rgbFile.name}`);
      await uploadFileInChunks(rgbFile, fileId, 'rgb', (progress) => {
        updateProgress('rgb', progress, 0.4); // RGB占40%
      });
    }

    // 合并分片并预测
    console.log('🔀 开始合并分片并预测...');
    updateProgress('merge', 0, 0.2); // 合并占20%

    const result = await mergeAndPredict(fileId, tifFile?.name || 'merged.tif', rgbFile?.name || 'merged.jpg');

    updateProgress('merge', 100, 0.2);
    console.log('✅ 分片上传和预测完成');

    return result;
  } catch (error) {
    console.error('❌ 分片上传失败:', error);
    throw error;
  }
};

export const save = (farmlandName: string, originImageUrl: string, processedImageUrl: string, pestTactics: pestTacticsVO[]): AxiosPromise<null> => {
  const json = JSON.stringify({
    'farmlandName': farmlandName,
    'originImageUrl': originImageUrl,
    'processedImageUrl': processedImageUrl,
    'pestTactics': pestTactics
  });
  return request({
    url: '/pestcontrol/farmland',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: json
  });
};

/**
 * 下载病虫害检测报告PDF
 * @returns Promise<Blob>
 */
export const downloadPestReport = async (): Promise<Blob> => {
  const response = await request({
    url: '/pestcontrol/report/PestPdf',
    method: 'get',
    responseType: 'blob' // 告诉 axios 把响应当作二进制 blob 处理
  });

  return response as unknown as Blob;
};

/**
 * 获取病虫害区域检测统计数据
 * @returns Promise<BackDieaseAreaStaticVO>
 */
export const getAreaDetectionStats = (): AxiosPromise<BackDieaseAreaStaticVO> => {
  return request({
    url: '/pestcontrol/areaDetection/BackDiseaseAreaStaticVo',
    method: 'get'
  });
};

/**
 * 获取病虫害地图展示数据
 * @returns Promise<PestDetectionMapVO[]>
 */
export const getDeskINfo = (): AxiosPromise<PestDetectionMapVO[]> => {
  return request({
    url: '/pestcontrol/areaDetection/getDeskINfo',
    method: 'get'
  });
};

/**
 * 获取出苗期多病害记录数据
 * @returns Promise<MultipleDiseaseRecord[]>
 */
export const getMultipleDiseaseRecords = (): AxiosPromise<any> => {
  return request({
    url: '/pestcontrol/PlantResults/getMultipleDiseaseRecords',
    method: 'get'
  });
};

/**
 * 获取粟灰螟检测记录数据
 * @returns Promise<any>
 */
export const getSuHuiMingDetectionRecords = (): AxiosPromise<any> => {
  return request({
    url: '/pestcontrol/PlantResults/getSuHuiMingDetectionRecords',
    method: 'get'
  });
};
