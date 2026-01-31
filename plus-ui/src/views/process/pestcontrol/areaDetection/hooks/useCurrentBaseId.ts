import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo';
import { baseDictQuery } from '@/views/process/growth/api/tableDict';
import { LandUnitVo } from '@/views/process/seedling/emergenceate/api/types';

export const useCurrentBaseId = () => {
  const state = reactive({
    currentBaseId: null as string | number | null,
    loading: true,
    error: null as Error | null
  });

  const fetchData = async () => {
    try {
      state.loading = true;
      state.error = null;
      const response = await baseDictQuery();
      if (response.rows.length > 0) {
        state.currentBaseId = response.rows[0].value;
      }
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
