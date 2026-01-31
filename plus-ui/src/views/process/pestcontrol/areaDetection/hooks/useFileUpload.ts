import { listByIds } from '@/views/four/api/oss';

export interface FileItem {
  url: string;
  [key: string]: any;
}

export const useFileUpload = () => {
  const tiffFileList = ref<FileItem[]>([]);
  const rgbFileList = ref<FileItem[]>([]);
  const currentStep = ref(0);

  const handleTiffUploadChange = async (ossIds: string) => {
    if (ossIds) {
      try {
        const response = await listByIds(ossIds);
        tiffFileList.value = response.data || [];
        currentStep.value++;
      } catch (error) {
        console.error('TIFF file upload error:', error);
        tiffFileList.value = [];
        ElMessage({
          message: 'TIFF 图像上传失败',
          type: 'error'
        });
      }
    } else {
      tiffFileList.value = [];
    }
  };

  const handleRgbUploadChange = async (ossIds: string) => {
    if (ossIds) {
      try {
        const response = await listByIds(ossIds);
        rgbFileList.value = response.data || [];
        currentStep.value++;
      } catch (error) {
        console.error('RGB file upload error:', error);
        rgbFileList.value = [];
        ElMessage({
          message: 'RGB 图像上传失败',
          type: 'error'
        });
      }
    } else {
      rgbFileList.value = [];
    }
  };

  const totalFileCount = computed(() => {
    return tiffFileList.value.length + rgbFileList.value.length;
  });

  const allFiles = computed(() => {
    return [...tiffFileList.value, ...rgbFileList.value];
  });

  const resetFiles = () => {
    tiffFileList.value = [];
    rgbFileList.value = [];
    currentStep.value = 0;
  };

  return {
    tiffFileList,
    rgbFileList,
    currentStep,
    totalFileCount,
    allFiles,
    handleTiffUploadChange,
    handleRgbUploadChange,
    resetFiles
  };
};
