<template>
  <div class="disaster-container">
    <div class="left-panel">
      <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
        <div v-show="showSearch" class="wu">
          <el-card shadow="hover">
            <el-form ref="queryFormRef" :model="queryParams" :inline="true">
              <el-form-item label="灾害类型" prop="disasterType">
                <el-select v-model="queryParams.disasterType" placeholder="请选择灾害类型" clearable>
                  <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="指数名称" prop="indexName">
                <el-input v-model="queryParams.indexName" placeholder="请输入指数名称" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <!--            <el-form-item label="指数值" prop="indexValue">
              <el-input v-model="queryParams.indexValue" placeholder="请输入指数值" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="指数单位" prop="indexUnit">
              <el-input v-model="queryParams.indexUnit" placeholder="请输入指数单位" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
              <el-form-item label="检测区域" prop="detectionArea">
                <el-input v-model="queryParams.detectionArea" placeholder="请输入检测区域" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                <el-button type="danger" @click="calculateDrought">旱灾指数计算</el-button>
                <el-button type="primary" @click="calculateFlood">洪涝指数计算</el-button>
                <el-button type="warning" @click="calculateFlood_test">洪涝指数计算(演示)</el-button>
                <el-button type="info" @click="calculateHail">冰雹指数计算</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </transition>

      <el-card shadow="never">
        <template #header>
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['disaster:index:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['disaster:index:edit']"
                >修改</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['disaster:index:remove']"
                >删除</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['disaster:index:export']">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
          </el-row>
        </template>

        <el-table v-loading="loading" :data="indexList" @selection-change="handleSelectionChange" @row-click="handleRowClick">
          <el-table-column type="selection" width="55" align="center" />
          <!-- <el-table-column label="主键ID" align="center" prop="id" v-if="true" /> -->
          <el-table-column label="灾害类型" align="center" prop="disasterType">
            <template #default="scope">
              <dict-tag :options="sys_disaster_type" :value="scope.row.disasterType" />
            </template>
          </el-table-column>
          <!--        <el-table-column label="灾害等级" align="center">
          <template #default="scope">
            <span :class="getDisasterLevelClass(scope.row)">
              {{ getDisasterLevel(scope.row) }}
            </span>
          </template>
        </el-table-column> -->
          <el-table-column label="灾害等级" align="center" width="120">
            <template #default="scope">
              <el-tooltip :content="`${scope.row.indexName}=${scope.row.indexValue}`">
                <el-tag :type="getDisasterLevel(scope.row).tagType" effect="dark">
                  {{ getDisasterLevel(scope.row).level }}
                </el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="指数名称" align="center" prop="indexName" />
          <el-table-column label="指数值" align="center" prop="indexValue" />
          <el-table-column label="指数单位" align="center" prop="indexUnit" />
          <el-table-column label="检测区域" align="center" prop="detectionArea" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="修改" placement="top">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['disaster:index:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['disaster:index:remove']"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
      </el-card>
      <!-- 添加或修改灾害预警指数信息对话框 -->
      <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
        <el-form ref="indexFormRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="灾害类型" prop="disasterType">
            <el-select v-model="form.disasterType" placeholder="请选择灾害类型">
              <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="指数名称" prop="indexName">
            <el-input v-model="form.indexName" placeholder="请输入指数名称" />
          </el-form-item>
          <el-form-item label="指数值" prop="indexValue">
            <el-input v-model="form.indexValue" placeholder="请输入指数值" />
          </el-form-item>
          <el-form-item label="指数单位" prop="indexUnit">
            <el-input v-model="form.indexUnit" placeholder="请输入指数单位" />
          </el-form-item>
          <el-form-item label="检测区域" prop="detectionArea">
            <el-input v-model="form.detectionArea" placeholder="请输入检测区域" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
    <!-- 右侧地图 -->
    <div class="right-panel">
      <el-card>
        <el-select v-model="selectedIndex" @change="updateMapMarkers" placeholder="选择指数类型" style="width: 100%; margin-bottom: 10px">
          <el-option label="NDVI (旱灾)" value="NDVI" />
          <el-option label="TVDI (旱灾)" value="TVDI" />
          <el-option label="SWI (洪涝)" value="SWI" />
          <el-option label="NDWI (洪涝)" value="NDWI" />
          <el-option label="K (冰雹)" value="K" />
          <el-option label="TT (冰雹)" value="TT" />
        </el-select>
        <div id="map" class="map-container"></div>
        <div id="popup" class="ol-popup"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup name="Index" lang="ts">
import request from '@/utils/request';

import { listIndex, getIndex, delIndex, addIndex, updateIndex } from '@/api/disaster/index';
import { IndexVO, IndexQuery, IndexForm } from '@/api/disaster/index/types';
import { ref, onMounted, watch } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { Geometry } from 'ol/geom';
import { Coordinate } from 'ol/coordinate';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_disaster_type } = toRefs<any>(proxy?.useDict('sys_disaster_type'));

const calculateDrought = async () => {
  proxy?.$modal.loading('正在计算旱灾指数...');
  try {
    await request.get('/disaster/drought-level?region=8&ndvi=0.68&tvdi=0.85&surfaceTemp=38');
    proxy?.$modal.msgSuccess('旱灾指数计算完成');
  } catch (e) {
    proxy?.$modal.msgError('旱灾指数计算失败');
  } finally {
    proxy?.$modal.closeLoading();
  }
};

const calculateFlood = async () => {
  proxy?.$modal.loading('正在计算洪涝指数...');
  try {
    await request.post('/disaster/api/flooddisaster/calculateRisk');
    proxy?.$modal.msgSuccess('洪涝指数计算完成');
  } catch (e) {
    proxy?.$modal.msgError('洪涝指数计算失败');
  } finally {
    proxy?.$modal.closeLoading();
  }
};
const payload = {
  beginTime: '2025-06-01',
  endTime: '2025-06-03'
};

const calculateFlood_test = async () => {
  proxy?.$modal.loading('正在计算洪涝指数(演示)...');
  try {
    await request.post('/disaster/api/flooddisaster/calculateRisk', payload);
    proxy?.$modal.msgSuccess('洪涝指数计算(演示)完成');
  } catch (e) {
    proxy?.$modal.msgError('洪涝指数计算(演示)失败');
  } finally {
    proxy?.$modal.closeLoading();
  }
};

const calculateHail = async () => {
  proxy?.$modal.loading('正在计算冰雹指数...');
  try {
    await request.post('/disaster/api/hail/calculateRisk', payload);
    proxy?.$modal.msgSuccess('冰雹指数计算完成');
  } catch (e) {
    proxy?.$modal.msgError('冰雹指数计算失败');
  } finally {
    proxy?.$modal.closeLoading();
  }
};

const indexList = ref<IndexVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const indexFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: IndexForm = {
  id: undefined,
  disasterType: undefined,
  indexName: undefined,
  indexValue: undefined,
  indexUnit: undefined,
  detectionArea: undefined
};
const data = reactive<PageData<IndexForm, IndexQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    disasterType: undefined,
    indexName: undefined,
    indexValue: undefined,
    indexUnit: undefined,
    detectionArea: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    disasterType: [{ required: true, message: '灾害类型不能为空', trigger: 'change' }],
    indexName: [{ required: true, message: '指数名称不能为空', trigger: 'blur' }],
    indexValue: [{ required: true, message: '指数值不能为空', trigger: 'blur' }],
    indexUnit: [{ required: true, message: '指数单位不能为空', trigger: 'blur' }],
    detectionArea: [{ required: true, message: '检测区域不能为空', trigger: 'blur' }]
  }
});
// 基地数据（根据图片信息）
const baseStations = [
  { id: 1, name: '侯家沟基地', village: '侯家沟', type: '智慧引领种植基地', lng: 110.37847, lat: 37.76523 },
  { id: 2, name: '姜兴庄基地', village: '姜兴庄', type: '智慧引领种植基地', lng: 110.21509, lat: 37.87646 },
  { id: 3, name: '李家寺基地', village: '李家寺', type: '数字化种植基地', lng: 110.329098, lat: 37.719932 },
  { id: 4, name: '寺沟基地', village: '寺沟', type: '数字化种植基地', lng: 110.33521, lat: 37.743249 },
  { id: 5, name: '岳岔基地', village: '岳岔', type: '数字化种植基地', lng: 110.307453, lat: 37.75618 },
  { id: 6, name: '冯渠基地', village: '冯渠', type: '数字化种植基地', lng: 110.17825, lat: 37.8147 },
  { id: 7, name: '高硷村基地', village: '高硷村', type: '数字化种植基地', lng: 110.211912, lat: 37.847458 },
  { id: 8, name: '侯家沟南基地', village: '侯家沟', type: '数字化种植基地', lng: 110.37632, lat: 37.74972 },
  { id: 9, name: '杨家沟基地', village: '杨家沟', type: '数字化种植基地', lng: 110.338839, lat: 37.762516 }
];

const selectedIndex = ref('NDVI');
let map: Map;
let markerLayer: VectorLayer<VectorSource<Geometry>>;
const { queryParams, form, rules } = toRefs(data);

/** 查询灾害预警指数信息列表 */
// const getList = async () => {
//   loading.value = true;
//   const res = await listIndex(queryParams.value);
//   indexList.value = res.rows;
//   total.value = res.total;
//   loading.value = false;
// };
const getList = async () => {
  loading.value = true;
  const res = await listIndex(queryParams.value);
  indexList.value = res.rows;
  total.value = res.total;
  loading.value = false;

  // 触发地图更新
  updateMapMarkers();
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  indexFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: IndexVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加灾害预警指数信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: IndexVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getIndex(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改灾害预警指数信息';
};

/** 提交按钮 */
const submitForm = () => {
  indexFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateIndex(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addIndex(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: IndexVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除灾害预警指数信息编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delIndex(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'disaster/index/export',
    {
      ...queryParams.value
    },
    `index_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});

const getDisasterLevel = (row: IndexVO) => {
  const value = Number(row.indexValue);
  if (isNaN(value)) return { level: '数据异常', tagType: 'danger' };

  switch (row.indexName) {
    // 冰雹灾害
    case 'K':
      if (value >= 35) return { level: '特重冰雹', tagType: 'danger' };
      if (value >= 30) return { level: '重度冰雹', tagType: 'warning' };
      if (value >= 25) return { level: '中度冰雹', tagType: '' };
      if (value >= 20) return { level: '轻度冰雹', tagType: 'info' };
      return { level: '无冰雹风险', tagType: 'success' };

    case 'TT':
      if (value >= 55) return { level: '特重冰雹', tagType: 'danger' };
      if (value >= 50) return { level: '重度冰雹', tagType: 'warning' };
      if (value >= 45) return { level: '中度冰雹', tagType: '' };
      return { level: '无冰雹风险', tagType: 'success' };

    // 旱灾
    case 'NDVI':
      return { level: '-', tagType: 'info' };

    case 'TVDI':
      if (value > 0.8) return { level: '特旱', tagType: 'danger' };
      if (value > 0.7) return { level: '重旱', tagType: 'warning' };
      if (value > 0.6) return { level: '中旱', tagType: '' };
      return { level: '正常', tagType: 'success' };

    // 洪涝
    case 'R':
      if (value < 0.1) return { level: '极严重洪涝危机', tagType: 'danger' };
      if (value > 0.1 && value < 0.2) return { level: '偏严重洪涝危机', tagType: 'warning' };
      if (value > 0.2 && value < 0.25) return { level: '中等洪涝危机', tagType: 'middle' };
      if (value > 0.25 && value < 0.3) return { level: '轻微洪涝危机', tagType: 'info' };
      return { level: '正常', tagType: 'success' };

    case 'NDWI':
      if (value > 0.6) return { level: '特别重大洪涝', tagType: 'danger' };
      if (value > 0.5) return { level: '重大洪涝', tagType: 'warning' };
      if (value > 0.4) return { level: '较大洪涝', tagType: '' };
      if (value > 0.3) return { level: '一般洪涝', tagType: 'info' };
      return { level: '正常', tagType: 'success' };

    case 'SWI':
      if (value > 0.85) return { level: '特别重大洪涝', tagType: 'danger' };
      if (value > 0.75) return { level: '重大洪涝', tagType: 'warning' };
      if (value > 0.65) return { level: '较大洪涝', tagType: '' };
      return { level: '正常', tagType: 'success' };

    default:
      return { level: '未定义指数', tagType: 'info' };
  }
};

// 灾害颜色映射
const disasterColorMap = {
  '旱灾': {
    '轻旱': '#ADD8E6',
    '中旱': '#FFFF00',
    '重旱': '#FFA500',
    '极旱': '#FF0000'
  },
  '洪涝': {
    '一般洪涝': '#ADD8E6',
    '较大洪涝': '#FFFF00',
    '重大洪涝': '#FFA500',
    '特别重大洪涝': '#FF0000'
  },
  '冰雹': {
    '轻度冰雹': '#ADD8E6',
    '中度冰雹': '#FFFF00',
    '重度冰雹': '#FFA500',
    '特重冰雹': '#FF0000'
  }
};

// 初始化地图
function initMap() {
  map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM({
          // 完全移除版权信息
          attributions: []
        })
      })
    ],
    view: new View({
      center: fromLonLat([110.3, 37.8]),
      zoom: 10
    }),
    //禁用所有模型插件
    controls: []
  });

  // 创建标记图层
  markerLayer = new VectorLayer({
    source: new VectorSource(),
    style: (feature) => {
      const props = feature.getProperties();
      return new Style({
        image: new Circle({
          radius: 12,
          fill: new Fill({ color: props.color }),
          stroke: new Stroke({ color: '#000', width: 2 })
        }),
        text: new Text({
          text: `${props.indexName}: ${props.indexValue}`,
          offsetY: 25,
          font: 'bold 12px 微软雅黑',
          fill: new Fill({ color: '#333' }),
          stroke: new Stroke({ color: '#fff', width: 3 })
        })
      });
    }
  });
  map.addLayer(markerLayer);

  // 设置弹窗
  const popup = new Overlay({
    element: document.getElementById('popup'),
    positioning: 'bottom-center',
    stopEvent: false
  });
  map.addOverlay(popup);

  map.on('click', function (evt: { pixel: any; coordinate: Coordinate }) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f): any => f);
    if (feature) {
      const props = feature.getProperties();
      popup.getElement().innerHTML = `
        <div class="popup-content">
          <h3>${props.name}</h3>
          <p>类型: ${props.type}</p>
          <p>指数: ${props.indexName} = ${props.indexValue}</p>
          <p>灾害等级: ${props.disasterLevel}</p>
          <p>检测区域: ${props.detectionArea}</p>
        </div>
      `;
      popup.setPosition(evt.coordinate);
    } else {
      popup.setPosition(undefined);
    }
  });
}

// 更新地图标记
function updateMapMarkers() {
  const source = markerLayer.getSource();
  source.clear();

  // 过滤当前选择的指数数据
  const currentData = indexList.value.filter((item) => item.indexName === selectedIndex.value);

  baseStations.forEach((base) => {
    const stationData = currentData.find((item) => item.detectionArea.includes(base.village.replace('村', '')));

    if (stationData) {
      const disasterInfo = getDisasterLevel(stationData);
      const disasterType =
        selectedIndex.value === 'NDVI' || selectedIndex.value === 'TVDI'
          ? '旱灾'
          : selectedIndex.value === 'SWI' || selectedIndex.value === 'NDWI'
            ? '洪涝'
            : '冰雹';

      const feature = new Feature({
        geometry: new Point(fromLonLat([base.lng, base.lat])),
        name: base.name,
        type: base.type,
        indexName: stationData.indexName,
        indexValue: stationData.indexValue,
        disasterLevel: disasterInfo.level,
        detectionArea: stationData.detectionArea,
        color: disasterColorMap[disasterType][disasterInfo.level] || '#4CAF50'
      });
      source.addFeature(feature);
    }
  });
}

// 行点击事件
function handleRowClick(row: { detectionArea: string | string[] }) {
  const base = baseStations.find((b) => row.detectionArea.includes(b.village.replace('村', '')));
  if (base) {
    map.getView().animate({
      center: fromLonLat([base.lng, base.lat]),
      zoom: 14,
      duration: 1000
    });
  }
}

onMounted(() => {
  initMap();
  watch(indexList, updateMapMarkers, { immediate: true });
});
</script>

<style scoped>
.disaster-container {
  display: flex;
  height: calc(100vh - 60px);
}

.left-panel {
  width: 70%;
  padding: 10px;
  overflow-y: auto;
}

.right-panel {
  width: 30%;
  padding: 10px;
}

.map-container {
  height: 800px;
  width: 100%;
}

.ol-popup {
  position: absolute;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}
</style>
// // 冰雹灾害等级判断 // const getDisasterLevel = (row: IndexVO) => { // if (row.disasterType !== '2') return 'N/A'; // 非冰雹类型不处理 // const
kValue = Number(row.indexValue); // if (isNaN(kValue)) return '数据异常'; // // K指数判断逻辑 // if (kValue >= 35) return '特重冰雹'; // else if
(kValue >= 30) return '重度冰雹'; // else if (kValue >= 25) return '中度冰雹'; // else if (kValue >= 20) return '轻度冰雹'; // else return
'无冰雹风险'; // }; // // 可选：根据等级设置文字颜色 // const getDisasterLevelClass = (row: IndexVO) => { // const level = getDisasterLevel(row); //
return { // 'text-red-500': level.includes('极重'), // 'text-orange-500': level.includes('重度'), // 'text-yellow-500': level.includes('中度'), //
'text-blue-500': level.includes('轻度') // }; // };
