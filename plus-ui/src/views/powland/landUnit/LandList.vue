<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="所属基地" prop="baseId" v-has-roles="['superadmin', 'sysadmin']">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable>
                <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="地块名称" prop="landCode">
              <el-input v-model="queryParams.landCode" placeholder="请输入地块名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="水资源条件" prop="irrigationCapacity" style="white-space: nowrap">
              <el-select v-model="queryParams.irrigationCapacity" placeholder="请选择水资源条件" clearable>
                <el-option v-for="dict in irrigation_capacity" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="排水能力" prop="drainageCapacity">
              <el-select v-model="queryParams.drainageCapacity" placeholder="请选择排水能力" clearable>
                <el-option v-for="dict in drainage_capacity" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['powland:landUnit:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['powland:landUnit:remove']"
              >删除</el-button
            >
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport()"
              v-hasPermi="['powland:landUnit:import']">导入</el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['powland:landUnit:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="landUnitList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Primary Key" align="center" prop="id" v-if="false" />
        <el-table-column width="120" label="地块编码" align="center" prop="landCode" />
        <el-table-column label="所属基地" width="150" align="center" prop="baseId">
          <template #default="scope">
            <dict-tag :options="baseDict" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="面积(亩)" align="center" prop="landArea" />
        <el-table-column label="地块拥有者" align="center" prop="farmerId">
          <template #default="scope">
            <dict-tag :options="farmerDict" :value="scope.row.farmerId" />
          </template>
        </el-table-column>
        <el-table-column label="地力等级" align="center" prop="landLevel">
          <template #default="scope">
            <dict-tag :options="land_level" :value="scope.row.landLevel" />
          </template>
        </el-table-column>
        <!-- 
        <el-table-column label="坡度(%)" align="center" prop="slope" />
        <el-table-column label="坡向(°)" align="center" prop="slopeDirection">
          <template #default="scope">
            <dict-tag :options="slope_direction" :value="scope.row.slopeDirection" />
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="海拔" align="center" prop="altitude" />-->
        <el-table-column label="地形部位" align="center" prop="topographicFeature">
          <template #default="scope">
            <dict-tag :options="topographic_feature" :value="scope.row.topographicFeature" />
          </template>
        </el-table-column>
        <el-table-column label="有效土层厚度" width="110" align="center" prop="effectiveSoilLayer" />
        <el-table-column label="质地构造" align="center" prop="textureStructure" />
        <el-table-column label="耕层质地" align="center" prop="landTexture" />
        <el-table-column label="土壤容重(g/cm³)" align="center" prop="soilDensity" />
        <el-table-column label="水资源条件" align="center" prop="irrigationCapacity">
          <template #default="scope">
            <dict-tag :options="irrigation_capacity" :value="scope.row.irrigationCapacity" />
          </template>
        </el-table-column>
        <el-table-column label="排水能力" align="center" prop="drainageCapacity">
          <template #default="scope">
            <dict-tag :options="drainage_capacity" :value="scope.row.drainageCapacity" />
          </template>
        </el-table-column>
        <el-table-column label="农田林网化程度" align="center" prop="forestationLevel" />
        <el-table-column label="备注" align="center" prop="remark">
          <template #default="scope">
            <el-text truncated :title="scope.row.remark">{{ scope.row.remark }}</el-text>
          </template>
        </el-table-column>
        <el-table-column width="200" label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['powland:landUnit:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['powland:landUnit:remove']"></el-button>
            </el-tooltip>
            <el-tooltip content="配方施肥" placement="top">
              <el-button
                link
                type="primary"
                icon="document"
                @click="handleFertilization(scope.row)"
                v-hasPermi="['powland:landUnit:fertilization']"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="定位" placement="top">
              <el-button
                link
                type="primary"
                icon="LocationFilled"
                @click="handleLocation(scope.row)"
                v-hasPermi="['powland:point:locate']"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改地块管理对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="landUnitFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="地块名称" prop="landCode">
          <el-input v-model="form.landCode" placeholder="请输入地块名称" />
        </el-form-item>
        <el-form-item label="所属基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地" clearable>
            <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="地块拥有者">
          <el-select
            v-model="form.farmerId"
            placeholder="请选择农户"
            clearable
            filterable
            remote
            :remote-method="fetchFarmers"
            :loading="loadingFarmers"
          >
            <el-option v-for="dict in filteredFarmers" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="地形部位" prop="topographicFeature">
          <el-select v-model="form.topographicFeature" placeholder="请选择地形部位">
            <el-option v-for="dict in topographic_feature" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="水资源条件" prop="irrigationCapacity">
          <el-select v-model="form.irrigationCapacity" placeholder="请选择水资源条件">
            <el-option v-for="dict in irrigation_capacity" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排水能力" prop="drainageCapacity">
          <el-select v-model="form.drainageCapacity" placeholder="请选择排水能力">
            <el-option v-for="dict in drainage_capacity" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="面积(亩)">
          <el-input v-model="form.landArea" disabled />
        </el-form-item>
        <!-- <el-form-item label="Gis文本信息" prop="geomText">
            <el-input v-model="form.geomText" type="textarea" placeholder="请输入内容" />
        </el-form-item> -->
        <!-- <el-form-item label="坡度" prop="slope">
          <el-input v-model="form.slope" placeholder="请输入坡度" />
        </el-form-item>
        <el-form-item label="坡向" prop="slopeDirection">
          <el-select v-model="form.slopeDirection" placeholder="请选择坡向">
            <el-option v-for="dict in slope_direction" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 地块导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div class="el-upload__tip" slot="tip">
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的地块数据</div>
        <span>仅允许导入xls、xlsx格式文件。</span>
        <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="LandUnit" lang="ts">
import { getCurrentInstance, onMounted } from 'vue';
import request from '@/utils/request';
import { listLandUnit, getLandUnit, delLandUnit, addLandUnit, updateLandUnit } from '../api/landUnit';
import { LandUnitVO, LandUnitQuery, LandUnitForm } from '../api/landUnit/types';

import { farmerDictQuery, baseDictQuery } from '../api/tableDict';

import { useMap } from '../hooks/map';
import { globalHeaders } from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { land_level } = toRefs<any>(proxy?.useDict('land_level'));
const { irrigation_capacity } = toRefs<any>(proxy?.useDict('irrigation_capacity'));
const { drainage_capacity } = toRefs<any>(proxy?.useDict('drainage_capacity'));
// const { slope_direction } = toRefs<any>(proxy?.useDict('slope_direction'));
const topographic_feature = ref([
  { label: '丘陵上部', value: '0' },
  { label: '丘陵中部', value: '1' },
  { label: '丘陵下部', value: '2' }
]);
const { is_valid } = toRefs<any>(proxy?.useDict('is_valid'));
const filteredFarmers = ref<{ label: string; value: string; elTagType?: string; elTagClass?: string }[]>([]);
const loadingFarmers = ref(false);

const fetchFarmersByBaseId = async (baseId: string | number, query: string) => {
  const baseIdStr = String(baseId);
  const fullQuery = `?baseId=${baseIdStr}&query=${query}&isValid=1`; // 增加过滤条件
  const res = await farmerDictQuery(fullQuery);
  return res;
};

const fetchFarmers = async (query: string) => {
  if (!query) {
    // 如果没有查询条件，直接返回所有农户
    filteredFarmers.value = farmerDict.value.map((farmer) => ({
      label: farmer.label,
      value: String(farmer.value) // 确保 value 是字符串
    }));
    return;
  }

  loadingFarmers.value = true;

  const baseId = form.value.baseId;
  if (baseId) {
    try {
      const res = await fetchFarmersByBaseId(baseId, query);
      filteredFarmers.value = res.rows
        .filter((farmer: any) => farmer.label.toLowerCase().includes(query.toLowerCase())) // 按名称过滤
        .sort((a: any, b: any) => a.label.localeCompare(b.label)) // 按字母排序
        .map((farmer: any) => ({
          label: farmer.label,
          value: String(farmer.value) // 确保 value 是字符串
        }));
    } catch (error) {
      console.error('获取农户失败', error);
    }
  }

  loadingFarmers.value = false;
};

const landUnitList = ref<LandUnitVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const farmerDict = ref<DictDataOption[]>([]);
const baseDict = ref<any[]>([]);

const queryFormRef = ref<ElFormInstance>();
const landUnitFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 地块导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层（地块导入）
  open: false,
  // 弹出层标题（地块导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的地块数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/powland/landUnit/import'
});

const uploadRef = ref<ElUploadInstance>();

const handleImport = () => {
  upload.open = true;
  upload.title = '地块导入';
};

const initFormData: LandUnitForm = {
  landId: undefined,
  landCode: undefined,
  landArea: undefined,
  geomText: undefined,
  baseId: undefined,
  landLevel: undefined,
  farmerId: undefined,
  irrigationCapacity: undefined,
  remark: undefined,
  // slope: undefined,
  // slopeDirection: undefined,
  altitude: undefined,
  landTexture: undefined,
  soilDensity: undefined,
  drainageCapacity: undefined,
  topographicFeature: undefined,
  effectiveSoilLayer: undefined,
  textureStructure: undefined,
  forestationLevel: undefined
};
const data = reactive<PageData<LandUnitForm, LandUnitQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    landCode: undefined,
    baseId: undefined,
    irrigationCapacity: undefined,
    drainageCapacity: undefined,
    params: {
      isValid: 1
    }
  },
  rules: {
    // id: [
    //   { required: true, message: "Primary Key不能为空", trigger: "blur" }
    // ],
    landCode: [{ required: true, message: '地块名称不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '所属地不能为空', trigger: 'blur' }],
    farmerId: [{ required: true, message: '地块拥有者不能为空', trigger: 'blur' }],
    irrigationCapacity: [{ required: true, message: '水资源条件不能为空', trigger: 'blur' }],
    drainageCapacity: [{ required: true, message: '排水能力不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

//定义事件
const emit = defineEmits(['updateView', 'pointLocate', 'formula', 'ready']);

/** 查询地块管理列表 */
const getList = async () => {
  loading.value = true;
  emit('updateView');

  // 直接调用接口，使用后端分页
  const res = await listLandUnit(queryParams.value);
  landUnitList.value = res.rows;
  total.value = res.total;

  loading.value = false;
};

/** 取消按钮 */
const { landUnit } = useMap();
const cancel = () => {
  reset();
  landUnit.removeLandUnit(land);
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  landUnitFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  // 移除强制要求输入条件的限制，允许空搜索
  queryParams.value.pageNum = 1;
  console.log('查询参数:', queryParams.value); // 打印参数
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  // 重置所有查询参数
  queryParams.value.landCode = undefined;
  queryParams.value.baseId = undefined;
  queryParams.value.irrigationCapacity = undefined;
  queryParams.value.drainageCapacity = undefined;
  queryParams.value.params.isValid = 1; // 保持有效记录筛选
  queryParams.value.pageNum = 1;
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: LandUnitVO[]) => {
  ids.value = selection.map((item) => item.landId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
let land = undefined; //地块
const handleAdd = (p) => {
  reset();
  land = p.feature; //地块
  form.value = { ...p };
  dialog.visible = true;
  dialog.title = '添加地块管理';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: LandUnitVO) => {
  reset();
  const _id = row?.landId || ids.value[0];
  const res = await getLandUnit(_id);
  Object.assign(form.value, res.data);
  // 初始化 filteredFarmers，让 el-select 能显示当前农户姓名
  if (form.value.farmerId && !filteredFarmers.value.find((f) => f.value === String(form.value.farmerId))) {
    const farmer = farmerDict.value.find((f) => f.value === String(form.value.farmerId));
    if (farmer) {
      filteredFarmers.value = [farmer];
    }
  }
  dialog.visible = true;
  dialog.title = '修改地块管理';
};

/** 提交按钮 */
const submitForm = () => {
  landUnitFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.landId) {
        await updateLandUnit(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addLandUnit(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
      //新增、修改后更新地图
      emit('updateView');
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: LandUnitVO) => {
  const _keys = row?.landCode || ids.value;
  const _ids = row?.landId || ids.value;
  const keyArray = Array.isArray(_keys) ? _keys : [_keys];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除地块信息已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delLandUnit(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'powland/landUnit/export',
    {
      ...queryParams.value
    },
    `landUnit_${new Date().getTime()}.xlsx`
  );
};

const importTemplate = () => {
  proxy?.download('powland/landUnit/importTemplate', {}, 'landUnitImportTemplate.xlsx');
};

const handleFileUploadProgress = () => {
  upload.isUploading = true;
};

const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>', '导入结果', {
    dangerouslyUseHTMLString: true
  });
  getList();
};

const submitFileForm = () => {
  uploadRef.value?.submit();
};

/**
 * 农户、基地字典
 */
const getDicts = async () => {
  // 获取农户字典数据
  let res = await farmerDictQuery('?isValid=1');
  // 将数据按农户名称排序
  const sortedData = res.rows.sort((a, b) => {
    return a.label.localeCompare(b.label, 'zh-CN');
  });
  // 将 farmerDict.value 中的每个 value 字段转换为 string
  farmerDict.value = sortedData.map((item: any) => ({
    label: item.label,
    value: String(item.value),
    elTagType: item.elTagType,
    elTagClass: item.elTagClass
  }));
};

/**
 * 基地字典
 */
const getDicts1 = async () => {
  try {
    // 向后端请求基地信息
    const res = await request({
      url: '/powland/baseInfo/list',
      method: 'get',
      params: { isValid: 1 } // 只取有效基地
    });

    // 统一映射为我们想要的结构
    baseDict.value = (res.rows || []).map((item: any) => ({
      label: item.baseName,
      value: String(item.baseId)
    }));

    return baseDict.value;
  } catch (error) {
    console.error('获取基地信息失败:', error);
    baseDict.value = [];
    return [];
  }
};

onMounted(async () => {
  loading.value = true;
  await getDicts1(); // 保基地字典先加载完
  await getDicts(); // 其他字典
  await getList(); // 加载地块列表

  emit('ready', { handleAdd }); //向父组件返回组件方法
  loading.value = false;
});

/**
 * 暴露给其它组件
 */
// defineExpose({
//   handleAdd
// });
/**
 *
 * @param row 地块定位
 */
const handleLocation = (row?: LandUnitVO) => {
  emit('pointLocate', row?.landId);
};

/**
 *
 * @param row 配方施肥
 */
const handleFertilization = (row?: LandUnitVO) => {
  emit('formula', row?.landId);
  // router.push({ path: 'odFertilization', query: { id: row.landId } });
};
</script>
