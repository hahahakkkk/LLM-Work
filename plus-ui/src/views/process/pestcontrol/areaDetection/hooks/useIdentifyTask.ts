import { submitIdentifyTask } from '../api/identify';
import type { farmlandType } from './useFarmlands';
import type { FileItem } from './useFileUpload';

export interface IdentifyTaskParams {
  farmlandId: number | null;
  collectTime: string;
  tiffFileList: FileItem[];
  rgbFileList: FileItem[];
  farmlands: farmlandType[];
}

export const useIdentifyTask = () => {
  const loading = ref(false);
  const validateFiles = (tiffFileList: FileItem[], rgbFileList: FileItem[]): boolean => {
    if (tiffFileList.length === 0) {
      ElMessage({
        message: '请上传 TIFF 图像',
        type: 'warning'
      });
      return false;
    }
    if (rgbFileList.length === 0) {
      ElMessage({
        message: '请上传 RGB 图像',
        type: 'warning'
      });
      return false;
    }
    return true;
  };

  const submitTask = async (params: IdentifyTaskParams): Promise<string | null> => {
    const { farmlandId, tiffFileList, rgbFileList, farmlands } = params;
    try {
      loading.value = true;
      if (!validateFiles(tiffFileList, rgbFileList)) {
        return null;
      }
      const selectedFarmland = farmlands.find((f) => f.plotId === farmlandId);
      if (!selectedFarmland) {
        ElMessage({
          message: '找不到选中的地块信息',
          type: 'error'
        });
        return null;
      }
      const { baseId, baseName, plotId, plotName } = selectedFarmland;
      const response = await submitIdentifyTask({
        rgbUrl: rgbFileList[0].url,
        tifUrl: tiffFileList[0].url,
        // HRADCODE URL, JUST FOR DEBUGGING
        // rgbUrl: 'http://172.25.23.186:9000/ls-bkt/2025/11/05/hjg005RGB.jpg',
        // tifUrl: 'http://172.25.23.186:9000/ls-bkt/2025/11/05/hjg005.tif',
        baseId,
        baseName,
        plotId,
        plotName
      });
      if (response.data && response.data.taskId) {
        ElMessage({
          message: response.data.message || '任务提交成功，正在处理中...',
          type: 'success'
        });
        return response.data.taskId;
      }
      return null;
    } catch (error) {
      console.error('Submit identify task error:', error);
      ElMessage({
        message: '任务提交失败，请重试',
        type: 'error'
      });
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    submitTask
  };
};
