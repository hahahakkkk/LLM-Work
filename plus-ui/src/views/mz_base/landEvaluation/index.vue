<template>
  <div class="page-container">
    <SplitBox asideWidth="50%">
      <template v-slot:aside>
        <el-card shadow="never" :body-style="{ height: 'calc(100vh - 170px)', overflow: 'auto' }">
          <template #header>
            <div style="display: flex; justify-content: space-between">
              <div class="flex items-center space-x-8">
                <el-button type="primary" plain @click="doEvaluate" v-hasPermi="['mz_base:landLevel:evaluate']">耕地质量评价</el-button>
              </div>
              <el-space>
                <el-button type="info" plain @click="handleOverview">评价结果概览</el-button>
                <el-button type="info" plain @click="handleEvaluation">评价方法</el-button>
              </el-space>
            </div>
          </template>
          <el-collapse :expand-icon-position="position" v-model="activeTab" accordion>
            <el-collapse-item :name="idx + ''" v-for="(item, idx) in landLevelData">
              <template #title>
                <span style="font-weight: bolder">{{ item.base }}</span>
              </template>
              <el-card shadow="never">
                <el-table :data="item.list" row-key="llId">
                  <el-table-column prop="landCode" label="地块编号" />
                  <el-table-column prop="llYear" label="年度" />
                  <el-table-column prop="landIfi" label="综合指数（IFI）" />
                  <el-table-column prop="landLevel" label="地力等级">
                    <template #default="scope">
                      <dict-tag :options="land_level" :value="scope.row.landLevel" />
                    </template>
                  </el-table-column>
                  <el-table-column width="200" label="操作" align="center" class-name="small-padding fixed-width">
                    <template #default="scope">
                      <el-tooltip content="定位" placement="top">
                        <el-button link type="primary" icon="LocationFilled" @click="doLocate(scope.row.landId)">定位</el-button>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
                <pagination
                  hide-on-single-page
                  size="small"
                  :total="item.total"
                  v-model:page="item.page"
                  v-model:limit="pageSize"
                  @pagination="doPage(item)"
                  layout="prev, pager, next"
                />
              </el-card>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </template>
      <template v-slot:main>
        <div id="leveLMap" class="map-container">
          <dl class="map-legend">
            <template v-for="itm in levelColor">
              <dt :style="{ backgroundColor: itm.color }"></dt>
              <dd>{{ itm.level }}</dd>
            </template>
          </dl>
        </div>
      </template>
    </SplitBox>

    <el-drawer v-model="drawer" :size="1000">
      <template #header>
        <span style="font-size: 20pt; font-weight: bolder">耕地质量评价方法</span>
      </template>
      <SoilEvaluationMethods />
    </el-drawer>

    <el-drawer v-model="overview" size="1000">
      <template #header>
        <span style="font-size: 20pt; font-weight: bolder">评价结果概览</span>
      </template>
      <OverviewPage />
    </el-drawer>
  </div>
</template>

<script setup lang="ts" name="LandEvaluation">
import { ref, onMounted, reactive } from 'vue';
import { useMap } from '../../powland/hooks/map';
import { landGeoJSON } from '../../powland/api/landUnit';
import { useRouter } from 'vue-router';
import SplitBox from '../../powland/commponents/SplitBox.vue';
import SoilEvaluationMethods from '../SoilEvaluationMethods/index.vue';
import OverviewPage from '../index.vue';

import { landLevelList, evaluateAll, evaluateByLandId } from '../api/landLevel';
import { isTemplate } from 'element-plus/es/utils/index.mjs';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { land_level } = toRefs<any>(proxy?.useDict('land_level'));

const { initMap, resetView, landLevel } = useMap();
const position = ref('left');
//是否显示评价方法
const drawer = ref(false);
const overview = ref(false);

//评价方法页面
const router = useRouter();
const handleEvaluation = () => {
  // router.push('/situation/SoilEvaluationMethods')
  drawer.value = true;
};

//显示评价概览
const handleOverview = () => {
  overview.value = true;
};

//地力图例色彩
const levelColor = ref([
  {
    level: '一等地',
    color: '#003300aa'
  },
  {
    level: '二等地',
    color: '#004D00aa'
  },
  {
    level: '三等地',
    color: '#006600aa'
  },
  {
    level: '四等地',
    color: '#008000aa'
  },
  {
    level: '五等地',
    color: '#009900aa'
  },
  {
    level: '六等地',
    color: '#00B300aa'
  },
  {
    level: '七等地',
    color: '#00CC00aa'
  },
  {
    level: '八等地',
    color: '#00E600aa'
  },
  {
    level: '九等地',
    color: '#00FF00aa'
  },
  {
    level: '十等地',
    color: '#99FF99aa'
  },
  {
    level: '待评价',
    color: '#ff0000aa'
  }
]);

const levelColors = levelColor.value.map((c) => c.color);

//默认页
const activeTab = ref('');
//地力数据
const landLevelData = ref({});
const pageSize = ref(10);
//地块数据
async function getLandList() {
  const tdata = (await landLevelList()).data;
  for (var t of tdata) {
    t.page = 0;
    t.total = t.lands.length;
    t.list = t.lands.slice(0, 10);
  }
  landLevelData.value = tdata;
}
//分页
function doPage(item) {
  const start = (item.page - 1) * 10;
  const end = item.page * 10;
  item.list = item.lands.slice(start, end);
}

/**
 * 耕地地力评价--所有地块
 */
async function doEvaluate() {
  await evaluateAll();
  getLandList();
}

//地图
const updateMap = async () => {
  const lands = await landGeoJSON();
  landLevel.addLands(lands);
};
/**
 * 定位
 */
const doLocate = (id) => {
  landLevel.locate(id);
};
onMounted(async () => {
  initMap('leveLMap');
  landLevel.init(levelColors);
  updateMap();
  //获取地力数据
  getLandList();
  activeTab.value = '0';
});
</script>

<style scoped>
#leveLMap {
  position: relative;
}
dl,
dd {
  margin: 0;
  padding: 0;
}
/* 图例 */
.map-legend {
  width: 120px;
  border: 1px solid slategray;
  position: absolute;
  right: 10px;
  bottom: 10px;
  background-color: #ffffff99;
  padding: 10px;
  z-index: 1000;
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 10px;
  font-size: small;
}

.page-container {
  width: 100%;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.full-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-row {
  flex: 1;
  height: calc(100vh - 120px);
  overflow: hidden;
}

.left-tree {
  height: 100%;
  overflow-y: auto;
}

.tree-box {
  height: 100%;
}

.right-map {
  position: relative;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  border: 1px solid #eee;
  min-width: 800px;
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
  background: #fff;
}

.custom-tree-node.highlight {
  background: #fffae6;
  color: #e67e22;
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
<style>
.el-collapse-item__header {
  background-color: aliceblue;
  padding-left: 20px;
}
</style>
