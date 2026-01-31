<template>
  <BaseSoilFertilityMap
    :alert-data="alertData"
    :base-stroke-color="baseStrokeColor"
    :level-labels="levelLabels"
    :click-labels="clickLabels"
    :debug-prefix="debugPrefix"
  />
</template>

<script setup>
/* eslint-disable */
import BaseSoilFertilityMap from '@/views/process/disaster/components/map.vue';

// 接收父组件传递的预警数据和配置
const props = defineProps({
  alertData: {
    type: Array,
    default: () => []
  },
  baseStrokeColor: {
    type: String,
    default: 'rgba(139,69,19,0.5)'
  },
  levelLabels: {
    type: Object,
    default: () => ({
      minor: '轻度',
      medium: '中度',
      severe: '重度',
      extreme: '极度'
    })
  },
  clickLabels: {
    type: Object,
    default: () => ({
      levelLabel: '级别',
      contentLabel: '详情'
    })
  },
  debugPrefix: {
    type: String,
    default: 'Disaster'
  }
});
</script>
