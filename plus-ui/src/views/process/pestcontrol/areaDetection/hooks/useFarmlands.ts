import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo';
import { LandUnitVo } from '@/views/process/seedling/emergenceate/api/types';

export interface farmlandType {
  plotId: number;
  plotName: string;
  area: string;
  baseId: number;
  baseName: string;
}

export const useFarmlands = (baseIdRef: Ref<string | null>) => {
  const state = reactive({
    farmlands: [] as farmlandType[],
    loading: true,
    error: null as Error | null
  });

  const fetchData = async () => {
    try {
      state.loading = true;
      state.error = null;
      const response = await fetchFarmerLands({
        baseId: baseIdRef.value
      });
      state.farmlands = response.rows.map((land: LandUnitVo) => ({
        plotId: land.landId,
        plotName: land.landCode,
        area: land.landArea ? `${land.landArea}亩` : undefined,
        baseId: land.baseId,
        baseName: land.baseName
      }));
    } catch (error) {
      state.error = error as Error;
    } finally {
      state.loading = false;
    }
  };
  watch(
    baseIdRef,
    (id) => {
      if (id !== '' && id) {
        console.log(id);
        fetchData();
      }
    },
    {
      immediate: true
    }
  );

  return {
    ...toRefs(state),
    refetch: fetchData
  };
};
