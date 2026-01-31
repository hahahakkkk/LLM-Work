<template>
  <MzMap ref="map" @click="getLandUnitProperty" :landStyles="styles">
    <template #leftLegend>
      <button @click="locate">定位到指定基地</button>
      <div class="box">
        <ul>
          <li>
            <div>一等地</div>
            <div style="background-color: green"></div>
          </li>
          <li>
            <div>二等地</div>
            <div style="background-color: wheat"></div>
          </li>
        </ul>
      </div>
    </template>
  </MzMap>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const map = ref(null);
/**
 * 地块颜色
 */
const styles = ref([
  {
    id: '1886326862885421057',
    color: '#ff000077'
  },
  {
    id: '1886326373372395521',
    color: '#00ff0077'
  }
]);
/**
 * 定位到基地
 * @param params
 */
function locate(params) {
  map.value.locate('姜兴庄');
}

/**
 * 点击地块时，返回地块属性
 * @param p
 */
function getLandUnitProperty(p) {
  alert(`地块编号：${p.landCode}，面积：${p.landArea}亩`);
}

onMounted(() => {
  setTimeout(() => {
    locate();
  }, 1000);
});
</script>

<style scoped>
.box {
  width: 150px;
  line-height: 2;
  background-color: rgba(255, 255, 255, 0.5);
  border: 5px solid rgba(134, 134, 134, 0.8);
  padding: 10px;
}

li {
  display: flex;
  padding: 5px;
}

li div:first-child {
  width: 50px;
}

li div:last-child {
  flex-grow: 1;
}

button {
  padding: 10px 20px;
}
</style>
