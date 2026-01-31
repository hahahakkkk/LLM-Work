import { getModelList } from '@/views/process/api';
import { ModelVO } from '@/views/process/api/types';

export enum modelType {
  AREA = '病虫害区域检测模型'
}

export const useModels = (type: modelType) => {
  const state = reactive({
    models: [] as ModelVO[],
    loading: true,
    error: null as Error | null
  });

  const currentModelIndex = ref<number | null>(null);

  const fetchModels = async () => {
    try {
      state.loading = true;
      state.error = null;
      const response = await getModelList({
        modelType: type
      });
      state.models = response.rows;
      currentModelIndex.value = state.models.findIndex((model) => model.isDefault) || 0;
    } catch (error) {
      state.error = error as Error;
    } finally {
      state.loading = false;
    }
  };

  fetchModels();

  return {
    ...toRefs(state),
    currentModelIndex,
    currentModel: computed(() => state.models[currentModelIndex.value]),
    refetch: fetchModels
  };
};
