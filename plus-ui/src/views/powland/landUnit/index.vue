<template>
  <div style="position: relative">
    <SplitBox asideWidth="50%">
      <template v-slot:aside>
        <LandList @updateView="updateMap" @pointLocate="doLocate" @formula="doFormula" @ready="doListReady" />
      </template>
      <template v-slot:main>
        <el-space class="button-box">
          <el-button plain type="primary" size="small" :disabled="drawing || editing" @click="beginDraw">绘制地块</el-button>
          <el-button plain type="warning" size="small" :disabled="drawing || editing" @click="beginModi">修改地块</el-button>
          <el-button plain type="info" size="small" :disabled="!(drawing || editing)" @click="exitDraw">退出绘制</el-button>
          <div class="tip-box">新建时，双击结束绘制，点击“ESC”放弃绘制。</div>
        </el-space>
        <div id="landUnitMap"></div>
      </template>
    </SplitBox>
    <el-drawer v-model="dialogVisible" size="calc(100% - 200px)" destroy-on-close @open="loadData()" :append-to-body="false">
      <template #header>
        <h2>配方施肥</h2>
      </template>
      <Fertilization ref="fert" />
    </el-drawer>
  </div>
</template>
<script setup>
import SplitBox from '../commponents/SplitBox.vue';
import LandList from './LandList.vue';
import Fertilization from '../../mz_base/fertilization/index.vue';
import { useMap } from '../hooks/map';
import { geoList } from '../api/point';
import { landGeoJSON } from '../api/landUnit';
import { onMounted, ref } from 'vue';

const { initMap, locate, collectPoint, landUnit } = useMap();

const dialogVisible = ref(false);
let landId = null;
//配肥组件
const fert = ref();
//加载配肥所需数据
function loadData() {
  fert.value.getAllBaseData(landId);
}
//进行配方施肥
function doFormula(lid) {
  landId = lid;
  dialogVisible.value = true;
}

//列表组件
const listRef = ref(null);
/**
 * 通过ready事件返回子组件方法
 * @param instance
 */
function doListReady(methods) {
  listRef.value = methods;
}

//正在绘制
const drawing = ref(false);
//正在修改
const editing = ref(false);

//开始绘制
const beginDraw = () => {
  drawing.value = true;
  landUnit.drawBegin((p) => {
    listRef.value?.handleAdd(p);
  });
};

const beginModi = () => {
  editing.value = true;
  landUnit.modiBegin();
};

//退出绘制
const exitDraw = () => {
  if (drawing.value) {
    landUnit.drawEnd();
  }
  if (editing.value) {
    landUnit.modiEnd();
  }
  drawing.value = false;
  editing.value = false;
};
/**
 * 更新地块
 */
const updateMap = async () => {
  const lands = await landGeoJSON();
  landUnit.addLandUnit(lands);
};

/**
 * 定位
 */
const doLocate = (id) => {
  locate(id, 'block');
};

onMounted(async () => {
  initMap('landUnitMap');
  // const points = await geoList();
  // collectPoint.addPointLayer(points);
  landUnit.init();
  updateMap();
});
</script>
<style scoped>
.el-overlay {
  position: absolute !important;
}

#landUnitMap {
  width: 100%;
  height: 100%;
}

.button-box {
  position: absolute;
  top: 8px;
  left: 50px;
  z-index: 2000;
}

.tip-box {
  border: 1px sienna dotted;
  padding: 2px 10px;
  font-size: 8pt;
  color: salmon;
  background-color: white;
}
</style>
