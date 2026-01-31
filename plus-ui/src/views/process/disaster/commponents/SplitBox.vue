<template>
  <div class="split-box-container">
    <div :style="{ minWidth: asideWidth }" v-if="!collopse" class="split-aside">
      <slot name="aside"></slot>
    </div>
    <div class="split-bar">
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
