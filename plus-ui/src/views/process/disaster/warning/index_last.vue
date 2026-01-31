<template>
  <div class="disaster-map-container">
    <!-- 左侧：表格 + 查询 -->
    <div class="left-panel">
      <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
        <div v-show="showSearch" class="mb-[10px]">
          <el-card shadow="hover">
            <el-form ref="queryFormRef" :model="queryParams" :inline="true">
              <el-form-item label="灾害类型" prop="disasterType">
                <el-select v-model="queryParams.disasterType" placeholder="请选择灾害类型" clearable>
                  <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="预警等级" prop="warningLevel">
                <el-select v-model="queryParams.warningLevel" placeholder="请选择预警等级" clearable>
                  <el-option v-for="dict in disaster_level" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="预警区域" prop="region">
                <el-input v-model="queryParams.region" placeholder="请输入预警区域" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="发布时间" prop="issueTime">
                <el-date-picker clearable v-model="queryParams.issueTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择发布时间" />
              </el-form-item>
              <el-form-item label="有效期至" prop="validUntil">
                <el-date-picker clearable v-model="queryParams.validUntil" type="date" value-format="YYYY-MM-DD" placeholder="请选择有效期至" />
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
                  <el-option v-for="dict in alter_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </transition>

      <el-card shadow="never">
        <template #header>
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['disaster:warning:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['disaster:warning:edit']"
                >修改</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['disaster:warning:remove']"
                >删除</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['disaster:warning:export']">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
          </el-row>
        </template>

        <el-table v-loading="loading" :data="warningList" @selection-change="handleSelectionChange" @row-click="handleRowClick">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="灾害类型" align="center" prop="disasterType">
            <template #default="scope">
              <dict-tag :options="sys_disaster_type" :value="scope.row.disasterType" />
            </template>
          </el-table-column>
          <el-table-column label="预警等级" align="center" prop="warningLevel">
            <template #default="scope">
              <dict-tag :options="disaster_level" :value="scope.row.warningLevel" />
            </template>
          </el-table-column>
          <el-table-column label="预警内容" align="center" prop="warningContent" />
          <el-table-column label="预警区域" align="center" prop="region" />
          <el-table-column label="发布时间" align="center" prop="issueTime" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.issueTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="有效期至" align="center" prop="validUntil" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.validUntil, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
              <dict-tag :options="alter_status" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="修改" placement="top">
                <el-button link type="primary" icon="Edit" @click.stop="handleUpdate(scope.row)" v-hasPermi="['disaster:warning:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button
                  link
                  type="primary"
                  icon="Delete"
                  @click.stop="handleDelete(scope.row)"
                  v-hasPermi="['disaster:warning:remove']"
                ></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
      </el-card>

      <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
        <el-form ref="warningFormRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="灾害类型" prop="disasterType">
            <el-select v-model="form.disasterType" placeholder="请选择灾害类型">
              <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="预警等级" prop="warningLevel">
            <el-select v-model="form.warningLevel" placeholder="请选择预警等级">
              <el-option v-for="dict in disaster_level" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="预警内容">
            <editor v-model="form.warningContent" :min-height="192" />
          </el-form-item>
          <el-form-item label="预警区域" prop="region">
            <el-input v-model="form.region" placeholder="请输入预警区域" />
          </el-form-item>
          <el-form-item label="发布时间" prop="issueTime">
            <el-date-picker clearable v-model="form.issueTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择发布时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="有效期至" prop="validUntil">
            <el-date-picker clearable v-model="form.validUntil" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择有效期至">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in alter_status" :key="dict.value" :value="parseInt(dict.value)">{{ dict.label }}</el-radio>
            </el-radio-group>
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

    <!-- 右侧：地图 -->
    <div class="right-panel">
      <el-card shadow="hover" style="height: 100%">
        <el-select
          v-model="selectedDisaster"
          placeholder="请选择灾害类型"
          @change="handleDisasterTypeChange"
          style="width: 100%; margin-bottom: 10px"
        >
          <el-option label="旱灾" value="0" />
          <el-option label="洪涝" value="1" />
          <el-option label="冰雹" value="2" />
        </el-select>
        <div id="map" class="map-view"></div>
      </el-card>
    </div>
  </div>
  <!-- <DisasterMap /> -->
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import { watch, onMounted, ref } from 'vue';
import { listWarning, getWarning, delWarning, addWarning, updateWarning } from '@/api/disaster/warning';
import { WarningVO, WarningQuery, WarningForm } from '@/api/disaster/warning/types';
// import DisasterMap from './DisasterMap.vue'
// import { useMap } from '../hooks/map';
// const { landUnit } = useMap();
// const cancel = () => {
//   reset();
//   landUnit.removeLandUnit(land);
//   dialog.visible = false;
// }
/** 新增按钮操作 */
// let land = undefined; //地块
// const handleAdd = (p) => {
//   reset();
//   land = p.feature; //地块
//   form.value = { ...p };
//   dialog.visible = true;
//   dialog.title = "添加地块管理";
// }
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { alter_status, disaster_level, sys_disaster_type } = toRefs<any>(proxy?.useDict('alter_status', 'disaster_level', 'sys_disaster_type'));

const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const warningFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: WarningForm = {
  id: undefined,
  disasterType: undefined,
  warningLevel: undefined,
  warningContent: undefined,
  region: undefined,
  issueTime: undefined,
  validUntil: undefined,
  status: undefined
};
const data = reactive<PageData<WarningForm, WarningQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    disasterType: undefined,
    warningLevel: undefined,
    warningContent: undefined,
    region: undefined,
    issueTime: undefined,
    validUntil: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    disasterType: [{ required: true, message: '灾害类型不能为空', trigger: 'change' }],
    warningLevel: [{ required: true, message: '预警等级不能为空', trigger: 'change' }],
    warningContent: [{ required: true, message: '预警内容不能为空', trigger: 'blur' }],
    region: [{ required: true, message: '预警区域不能为空', trigger: 'blur' }],
    issueTime: [{ required: true, message: '发布时间不能为空', trigger: 'blur' }],
    validUntil: [{ required: true, message: '有效期至不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询灾害预警信息列表 */
// const getList = async () => {
//   loading.value = true;
//   const res = await listWarning(queryParams.value);
//   warningList.value = res.rows;
//   total.value = res.total;
//   loading.value = false;
// };

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
  // reset();
  // landUnit.removeLandUnit(land);
  // dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  warningFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: WarningVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加灾害预警信息';
  // reset();
  // land = p.feature; //地块
  // form.value = { ...p };
  // dialog.visible = true;
  // dialog.title = "添加地块管理";
};

/** 修改按钮操作 */
const handleUpdate = async (row?: WarningVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getWarning(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改灾害预警信息';
};

/** 提交按钮 */
const submitForm = () => {
  warningFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateWarning(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWarning(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
      // emit("updateView");
    }
  });
};
// /**
//  * 暴露给其它组件
//  */
// defineExpose({
//   handleAdd
// });
// /**
//  *
//  * @param row 地块定位
//  */
// const handleLocation = (row ?: LandUnitVO) => {
//   emit('pointLocate', row?.landId);
// }

/** 删除按钮操作 */
const handleDelete = async (row?: WarningVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除灾害预警信息编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delWarning(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'disaster/warning/export',
    {
      ...queryParams.value
    },
    `warning_${new Date().getTime()}.xlsx`
  );
};
import 'leaflet/dist/leaflet.css';
import { getCurrentInstance, nextTick, toRefs, reactive } from 'vue';
import L from 'leaflet';

const selectedDisaster = ref('0');
const warningList = ref([]);
let map: L.Map;
let markerLayer: L.LayerGroup;

const getList = async () => {
  loading.value = true;
  const res = await listWarning(queryParams.value);
  warningList.value = res.rows;
  total.value = res.total;
  loading.value = false;

  // 调试信息
  console.log('加载的预警数据:', warningList.value);
  console.log('当前灾害类型字典:', sys_disaster_type.value);
  console.log('当前灾害等级字典:', disaster_level.value);

  renderMapMarkers();
};

const handleDisasterTypeChange = async () => {
  // 更新查询参数
  queryParams.value.disasterType = selectedDisaster.value;

  // 确保等待数据加载完成
  await getList();

  // 强制重新渲染地图标记
  if (markerLayer) {
    markerLayer.clearLayers();
  }
  renderMapMarkers();

  // 刷新地图视图
  if (map) {
    map.invalidateSize();
  }
};

const baseCoordinates = [
  { id: 1, name: '侯家沟基地', village: '侯家沟', type: '智慧引领种植基地', lng: 110.37847, lat: 37.76523 },
  { id: 2, name: '姜兴庄基地', village: '姜兴庄', type: '智慧引领种植基地', lng: 110.21509, lat: 37.87646 },
  { id: 3, name: '李家寺基地', village: '李家寺', type: '数字化种植基地', lng: 110.329098, lat: 37.719932 },
  { id: 4, name: '寺沟基地', village: '寺沟', type: '数字化种植基地', lng: 110.33521, lat: 37.743249 },
  { id: 5, name: '岳盆基地', village: '岳盆', type: '数字化种植基地', lng: 110.307453, lat: 37.75618 },
  { id: 6, name: '冯渠基地', village: '冯渠', type: '数字化种植基地', lng: 110.17825, lat: 37.8147 },
  { id: 7, name: '高检村基地', village: '高检村', type: '数字化种植基地', lng: 110.211912, lat: 37.847458 },
  { id: 8, name: '候家沟南基地', village: '候家沟', type: '数字化种植基地', lng: 110.37632, lat: 37.74972 },
  { id: 9, name: '杨家沟基地', village: '杨家沟', type: '数字化种植基地', lng: 110.338839, lat: 37.762516 }
];

const disasterColorMap = {
  '0': {
    '4': '#ADD8E6', // 轻旱 - 黄色
    '5': '#FFFF00', // 中旱 - 橙色
    '6': '#FFA500', // 重旱 - 红色
    '7': '#FF0000' // 极旱 - 深红色
  },
  '1': {
    '8': '#ADD8E6', // 一般洪涝 - 浅蓝色
    '9': '#FFFF00', // 较大洪涝 - 蓝色
    '10': '#FFA500', // 重大洪涝 - 紫色
    '11': '#FF0000' // 特别重大洪涝 - 深紫色
  },
  '2': {
    '0': '#ADD8E6', // 轻度冰雹 - 浅灰色
    '1': '#FFFF00', // 中度冰雹 - 灰色
    '2': '#FFA500', // 重度冰雹 - 深灰色
    '3': '#FF0000' // 特重冰雹 - 黑色
  }
};
const renderMapMarkers = () => {
  if (!map) return;
  if (!markerLayer) markerLayer = L.layerGroup().addTo(map);
  else markerLayer.clearLayers();

  baseCoordinates.forEach((base) => {
    // 更精确的匹配逻辑
    const matching = warningList.value.find((row) => {
      if (!row.region || !base.village) return false;

      // 标准化区域名称进行比较
      const normalize = (str) => str.replace(/村|基地|南/g, '').trim();
      const rowRegion = normalize(row.region);
      const baseVillage = normalize(base.village);

      return rowRegion === baseVillage && row.disasterType === selectedDisaster.value;
    });

    let level = '无';
    let color = 'green';
    let content = '暂无预警';

    if (matching) {
      // 确保使用字典中的值进行匹配
      const dictLevel = disaster_level.value.find((d) => d.value === matching.warningLevel);
      level = dictLevel?.label || matching.warningLevel || '无';

      content = matching.warningContent || '暂无详细内容';

      // 安全获取颜色映射
      const colorMap = disasterColorMap[selectedDisaster.value] || {};
      color = colorMap[matching.warningLevel] || 'gray';
    }

    const marker = L.circleMarker([base.lat, base.lng], {
      radius: 10,
      fillColor: color,
      fillOpacity: 0.8,
      color: '#000',
      weight: 1
    });

    marker.bindTooltip(`${base.name} (${level})`, { permanent: false, direction: 'top' });
    marker.bindPopup(`<b>${base.name}</b><br/>村: ${base.village}<br/>类型: ${base.type}<br/>灾害等级: ${level}<br/>内容: ${content}`);
    marker.addTo(markerLayer);
    marker._baseId = base.id;
  });
};
const focusMarkerByBaseId = (id: number) => {
  if (!markerLayer) return;
  markerLayer.eachLayer((layer: any) => {
    if (layer._baseId === id && layer.openPopup) {
      map.setView(layer.getLatLng(), 13);
      layer.openPopup();
    }
  });
};

const handleRowClick = (row: any) => {
  // 标准化区域名称进行匹配
  const normalize = (str) => str.replace(/村|基地/g, '').trim();
  const rowRegion = normalize(row.region);

  const base = baseCoordinates.find((b) => {
    const baseVillage = normalize(b.village);
    return rowRegion === baseVillage;
  });

  if (base) {
    // 先更新灾害类型
    selectedDisaster.value = row.disasterType;

    // 确保查询参数同步
    queryParams.value.disasterType = row.disasterType;

    // 等待数据加载和地图更新
    setTimeout(async () => {
      await getList();
      focusMarkerByBaseId(base.id);
    }, 300);
  } else {
    proxy?.$modal?.msgWarning(`未找到与"${row.region}"匹配的基地`);
  }
};

onMounted(async () => {
  await nextTick();
  map = L.map('map').setView([37.75, 110.3], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  await getList();
});
</script>

<style scoped>
.disaster-map-container {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 100px);
}

.left-panel {
  flex: 1 1 65%;
  padding-right: 10px;
  overflow-y: auto;
}

.right-panel {
  flex: 1 1 35%;
  display: flex;
  flex-direction: column;
}

.map-view {
  height: 800px;
  flex-grow: 1;
}
</style>
