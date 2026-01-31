import { defineStore } from 'pinia';
import { chemicalDictQuery } from '@/views/mz_base/api/tableDict';

export const useChemicalStore = defineStore('chemicalStore', {
  state: () => ({
    chemicalDict: [] // 保持变量名不变
  }),
  actions: {
    async loadChemicalDict() {
      const res = await chemicalDictQuery();
      console.log(res);
      this.chemicalDict = res.rows; // 保持赋值方式
    }
  }
});
