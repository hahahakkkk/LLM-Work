export interface CollectionInfo {
  farmlandId: number | null;
  collectTime: string;
}

export const useCollectionInfo = () => {
  const collectionInfo = ref<CollectionInfo>({
    farmlandId: null,
    collectTime: ''
  });

  const disabledDate = (time: Date) => {
    return time.getTime() > Date.now();
  };

  const validateCollectionInfo = (): boolean => {
    if (!collectionInfo.value.farmlandId) {
      ElMessage({
        message: '请选择地块名称',
        type: 'warning'
      });
      return false;
    }

    if (!collectionInfo.value.collectTime) {
      ElMessage({
        message: '请选择采集时间',
        type: 'warning'
      });
      return false;
    }

    return true;
  };

  const resetCollectionInfo = () => {
    collectionInfo.value = {
      farmlandId: null,
      collectTime: ''
    };
  };

  return {
    collectionInfo,
    disabledDate,
    validateCollectionInfo,
    resetCollectionInfo
  };
};
