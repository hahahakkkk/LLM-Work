import { getAreaDetectionStats } from '@/views/process/api/pestcontrol/areaDetection';
import { BackDieaseAreaStaticVO } from '@/views/process/api/pestcontrol/areaDetection/types';

export const useAreaDectionStats = () => {
  const state = reactive({
    data: {
      total: 0,
      thisWeek: 0,
      today: 0
    } as BackDieaseAreaStaticVO,
    loading: true,
    error: null as Error | null
  });

  const fetchData = async () => {
    try {
      state.loading = true;
      state.error = null;
      const response = await getAreaDetectionStats();
      state.data = response.data;
    } catch (error) {
      state.error = error as Error;
    } finally {
      state.loading = false;
    }
  };

  fetchData();

  return {
    ...toRefs(state),
    refetch: fetchData
  };
};
