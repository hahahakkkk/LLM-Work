<template>
  <div class="split-box-container">
    <div ref="leftPane" :style="{ minWidth: asideWidth }" v-if="!collopse" class="split-aside">
      <slot name="aside"></slot>
    </div>
    <div class="split-bar" @mousedown.prevent="startResize">
      <div class="split-bar-button" @click="doAsideCollopse" v-html="splitButton"></div>
    </div>
    <div class="split-main">
      <slot name="main"></slot>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';

const props = defineProps({
  asideWidth: String
});

const leftPane = ref(null);
const startX = ref(0);
const startWidth = ref(0);

const splitButton = ref('&#10096;');
//aside是否被折叠
const collopse = ref(false);
//aside折叠
const doAsideCollopse = () => {
  collopse.value = !collopse.value;
  if (collopse.value) {
    splitButton.value = '&#10097;';
  } else {
    splitButton.value = '&#10096;';
  }
};

const startResize = (e) => {
  startX.value = e.clientX;
  startWidth.value = leftPane.value.offsetWidth;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', stopResize);
};

const onMouseMove = (e) => {
  const dx = e.clientX - startX.value;
  leftPane.value.style.width = `${startWidth.value + dx}px`;
};

const stopResize = () => {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', stopResize);
};
</script>
<style scoped>
.split-box-container {
  width: 100%;
  height: calc(100vh - 84px);
  display: flex;
  align-items: stretch;
}

.split-aside {
  height: 100%;
  overflow: auto;
}

.split-bar {
  min-width: 15px;
  width: 15px;
  display: flex;
  align-items: center;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  background-color: #fefefe;
  cursor: ew-resize;
}

.split-bar-button {
  line-height: 60px;
  width: 100%;
  transform: scale(1, 1.5);
  font-size: 12pt;
  color: #555;
  background-color: #ddd;
  cursor: pointer;
}

.split-bar-button:hover {
  color: red;
}

.split-aside {
  min-width: 300px;
}

.split-main {
  flex-grow: 1;
  position: relative;
}
</style>
