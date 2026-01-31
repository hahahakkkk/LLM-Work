<template>
  <div class="map-container" ref="mapRef">
    <div class="legend left">
      <slot name="leftLegend"></slot>
    </div>
    <div class="legend right">
      <slot name="rightLegend"></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useMzMapBase } from './MzMapBase';
import MzMapBase from './MzMapBase';
import { useHeaderStore } from '@/store/headerStore';
const headerStore = useHeaderStore();
// 定义 baseName 属性
const props = defineProps({
  baseName: {
    type: String,
    default: ''
  }
});

const mapRef = ref(null);
//暴露可被调用的方法
defineExpose({
  locate
});
//声明事件
const emit = defineEmits(['map-loaded']);

let mzMapBase: MzMapBase;

/**
 * 定位到指定基地
 * @param name 基地名
 */
function locate(name: string) {
  mzMapBase.basePointLocate(name);
}

onMounted(() => {
  mzMapBase = useMzMapBase(mapRef.value, () => {
    emit('map-loaded', mzMapBase);
    // 如果提供了基地名称，则在地图加载完成后进行定位
    if (props.baseName) {
      locate(props.baseName);
    }
  });
});
</script>
<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.legend {
  position: absolute;
  bottom: 30px;
  z-index: 100000;
  color: #000;
}
.left {
  left: 10px;
}
.right {
  right: 10px;
}
.legend {
  font-size: 8pt;
}
</style>
