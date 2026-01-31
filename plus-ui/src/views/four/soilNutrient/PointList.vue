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
            <el-form-item label="采样点编号" prop="code" label-width="85px">
              <el-input v-model="queryParams.pointCode" placeholder="请输入采样点编号" clearable @keyup.enter="handleQuery" />
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
      <!--<template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['powland:point:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['powland:point:edit']"
            >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['powland:point:remove']"
            >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['powland:point:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['powland:point:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>-->

      <el-table v-loading="loading" :data="pointList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="80" align="center" />
        <el-table-column label="Primary Key" align="center" prop="pointId" v-if="false" />
        <el-table-column label="采样点编号" width="110" align="center" prop="pointCode" />
        <el-table-column label="所属基地" width="110" align="center" prop="baseId">
          <template #default="scope">
            <dict-tag :options="baseDict" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="采集地" align="center" prop="address" /> -->
        <el-table-column label="测定编号" width="110" align="center" prop="testId" />
        <el-table-column label="酸碱度" align="center" prop="ph" />
        <el-table-column label="有机质(g/KG)" align="center" prop="om" />
        <el-table-column label="全氮(mg/KG)" align="center" prop="tn" />
        <el-table-column label="全磷(mg/KG)" align="center" prop="tp" />
        <el-table-column label="有效磷(mg/KG)" align="center" prop="ap" />
        <el-table-column label="速效钾(mg/KG)" align="center" prop="ak" />
        <el-table-column label="缓效钾(mg/KG)" align="center" prop="slk" />
        <el-table-column label="经度(°)" align="center" prop="lng" />
        <el-table-column label="纬度(°)" align="center" prop="lat" />
        <el-table-column label="海拔(m)" align="center" prop="altitude" />
        <el-table-column label="测定单位" align="center" prop="testOrg" />
        <el-table-column label="测定时间" align="center" prop="testDate" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
          <template #default="scope">
            <!--<el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['powland:point:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['powland:point:remove']"></el-button>
            </el-tooltip>-->
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
    <!-- 添加或修改采样点对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="pointFormRef" :model="form" :rules="rules" label-width="80px">
        <!-- <el-form-item label="采集地" prop="address">
          <el-select v-model="form.address" placeholder="请选择采集地" clearable>
            <el-option
                v-for="dict in mz_collection_point"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="所属基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地" clearable>
            <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="采样点编号" prop="pointCode">
          <el-input v-model="form.pointCode" placeholder="请输入编号" clearable />
        </el-form-item>
        <el-form-item label="测定编号" prop="testId">
          <el-input v-model="form.testId" placeholder="请输入编号" clearable />
        </el-form-item>
        <el-form-item label="酸碱度" prop="ph">
          <el-input v-model="form.ph" placeholder="请输入ph值" clearable />
        </el-form-item>
        <el-form-item label="有机质" prop="om">
          <el-input v-model="form.om" placeholder="请输入有机质" clearable />
        </el-form-item>
        <el-form-item label="全氮" prop="tn">
          <el-input v-model="form.tn" placeholder="请输入全氮" clearable />
        </el-form-item>
        <el-form-item label="全磷" prop="tp">
          <el-input v-model.number="form.tp" placeholder="请输入全磷" clearable />
        </el-form-item>
        <el-form-item label="有效磷" prop="ap">
          <el-input v-model="form.ap" placeholder="请输入有效磷" clearable />
        </el-form-item>
        <el-form-item label="速效钾" prop="ak">
          <el-input v-model="form.ak" placeholder="请输入速效钾" clearable />
        </el-form-item>
        <el-form-item label="缓效钾" prop="slk">
          <el-input v-model.number="form.slk" placeholder="请输入缓效钾" clearable />
        </el-form-item>
        <el-form-item label="经度" prop="lng">
          <el-input v-model.number="form.lng" placeholder="请输入经度" />
        </el-form-item>
        <el-form-item label="纬度" prop="lat">
          <el-input v-model.number="form.lat" placeholder="请输入纬度" />
        </el-form-item>
        <!-- 海拔 -->
        <el-form-item label="海拔(m)" prop="altitude">
          <el-input v-model.number="form.altitude" placeholder="请输入海拔" clearable />
        </el-form-item>
        <!-- 备注 -->
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" clearable />
        </el-form-item>
        <el-form-item label="测定单位">
          <el-input v-model="form.testOrg" placeholder="请输入测定单位" clearable />
        </el-form-item>
        <el-form-item label="测定时间">
          <el-date-picker type="date" v-model="form.testDate" value-format="YYYY-MM-DD" placeholder="请输入测定时间" clearable />
        </el-form-item>
        <el-form-item label="坐标类型">
          <el-radio-group v-model="form.coorType">
            <el-radio :value="0" checked :disabled="isEdit">
              <el-tooltip content="从高德、百度、奥维地图获取的经纬度">火星坐标</el-tooltip>
            </el-radio>
            <el-radio :value="1" :disabled="isEdit">
              <el-tooltip content="使用手机、定位工具获取的经纬度">WGS84坐标</el-tooltip>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark" v-if="false">
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
    <!-- 导入采样点对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".json, .geojson, .xls, .xlsx"
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的采样点数据</div>
        <span>仅允许导入xls、xlsx、json、geojson格式文件。</span>
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

<script setup name="SoilNutrient" lang="ts">
import { listPoint, getPoint, delPoint, addPoint, updatePoint } from '@/views/powland/api/point';
import { PointVO, PointQuery, PointForm } from '@/views/powland/api/point/types';

import { useMap } from '@/views/powland/hooks/map';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { mz_collection_point } = toRefs<any>(proxy?.useDict('mz_collection_point'));
const { is_valid } = toRefs<any>(proxy?.useDict('is_valid'));

import { baseDictQuery } from '@/views/powland/api/tableDict';
import { globalHeaders } from '@/utils/request';
import axios from 'axios';

const pointList = ref<PointVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const keys = ref<Array<string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
//是否正在修改
const isEdit = ref(false);

const queryFormRef = ref<ElFormInstance>();
const pointFormRef = ref<ElFormInstance>();

const baseDict = ref<DictDataOption[]>([]);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 采样点导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层（采样点导入）
  open: false,
  // 弹出层标题（采样点导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的采样点数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/powland/point/import'
});

let importUrl = import.meta.env.VITE_APP_BASE_API + '/powland/point/import';

const uploadRef = ref<ElUploadInstance>();

const initFormData: PointForm = {
  pointId: undefined,
  pointCode: undefined,
  baseId: undefined,
  address: undefined,
  testId: undefined,
  ph: undefined,
  om: undefined,
  tn: undefined,
  tp: undefined,
  ap: undefined,
  ak: undefined,
  slk: undefined,
  lng: undefined,
  lat: undefined,
  testOrg: undefined,
  testDate: undefined,
  isValid: undefined,
  remark: undefined,
  coorType: 0, //坐标类型，默认火星坐标
  altitude: undefined
};
const data = reactive<PageData<PointForm, PointQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    address: undefined,
    pointCode: undefined,
    params: {},
    altitude: undefined,
    baseId: undefined
  },
  rules: {
    pointCode: [{ required: true, message: '采样点编号不能为空', trigger: 'blur' }],
    address: [{ required: true, message: '采集地不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '基地不能为空', trigger: 'blur' }],
    testId: [{ required: true, message: '测定编号不能为空', trigger: 'blur' }],
    ph: [
      { required: true, message: 'PH值不能为空', trigger: 'blur' },
      {
        pattern: /^-?\d+(\.\d+)?$/,
        message: '请输入有效的数值',
        trigger: 'blur'
      }
    ],
    om: [
      { required: true, message: '有机质不能为空', trigger: 'blur' },
      {
        pattern: /^-?\d+(\.\d+)?$/,
        message: '请输入有效的数值',
        trigger: 'blur'
      }
    ],
    tn: [
      { required: true, message: '全氮不能为空', trigger: 'blur' },
      {
        pattern: /^-?\d+(\.\d+)?$/,
        message: '请输入有效的数值',
        trigger: 'blur'
      }
    ],
    tp: [
      { type: 'number', message: '请输入有效的数值' },
      { required: true, message: '全磷不能为空', trigger: 'blur' }
    ],
    ap: [
      { required: true, message: '有效磷不能为空', trigger: 'blur' },
      {
        pattern: /^-?\d+(\.\d+)?$/,
        message: '请输入有效的数值',
        trigger: 'blur'
      }
    ],
    ak: [
      { required: true, message: '速效钾不能为空', trigger: 'blur' },
      {
        pattern: /^-?\d+(\.\d+)?$/,
        message: '请输入有效的数值',
        trigger: 'blur'
      }
    ],
    slk: [
      { type: 'number', message: '请输入有效的数值' },
      { required: true, message: '缓效钾不能为空', trigger: 'blur' }
    ],
    lng: [
      { type: 'number', message: '请输入有效的数值' },
      { required: true, message: '经度不能为空', trigger: 'blur' }
    ],
    lat: [
      { type: 'number', message: '请输入有效的数值' },
      { required: true, message: '纬度不能为空', trigger: 'blur' }
    ],
    altitude: [
      {
        pattern: /^-?\d+(\.\d+)?$/,
        message: '请输入有效的数值',
        trigger: 'blur'
      },
      { required: true, message: '海拔不能为空', trigger: 'blur' }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

const importJson = ref('');

/** 查询采样点列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPoint(queryParams.value);
  pointList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  pointFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  Object.assign(queryParams.value, {
    pageNum: 1,
    pageSize: 10,
    address: undefined,
    pointCode: undefined,
    altitude: undefined,
    baseId: undefined,
    params: {}
  });
  queryFormRef.value?.resetFields();
  getList();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: PointVO[]) => {
  ids.value = selection.map((item) => item.pointId);
  keys.value = selection.map((item) => item.pointCode);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  isEdit.value = false;
  reset();
  dialog.visible = true;
  dialog.title = '添加采样点';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: PointVO) => {
  isEdit.value = true;
  reset();
  const _id = row?.pointId || ids.value[0];
  const res = await getPoint(_id);
  Object.assign(form.value, res.data);
  form.value.coorType = 1;
  dialog.visible = true;
  dialog.title = '修改采样点';
};

//采样点操作，触发相应事件
const emit = defineEmits(['addPoint', 'delPoint', 'modiPoint', 'pointLocate']);

const { gcj02ToG84 } = useMap();

/** 提交按钮 */
const submitForm = () => {
  pointFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.coorType === 0) {
        [form.value.lng, form.value.lat] = gcj02ToG84([form.value.lng, form.value.lat]);
      }
      if (form.value.pointId) {
        await updatePoint(form.value).finally(() => (buttonLoading.value = false));
        emit('modiPoint', form.value.lng, form.value.lat, form.value.pointId);
      } else {
        const id = await addPoint(form.value).finally(() => (buttonLoading.value = false));

        emit('addPoint', form.value.lng, form.value.lat, id, form.value.pointCode);
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: PointVO) => {
  const _keys = row?.pointCode || keys.value;
  const _ids = row?.pointId || ids.value;
  // 构建确认消息
  let confirmMessage = '';
  if (row) {
    // 单条删除：显示完整编号
    confirmMessage = '是否确认删除采样点编号为"' + _keys + '"的数据项？';
  } else {
    // 批量删除：显示第一个编号+数量
    const keyArray = Array.isArray(_keys) ? _keys : [_keys];
    const firstKey = keyArray[0] || '';
    const count = keyArray.length;
    if (count === 1) {
      // 单条删除：直接使用_baseIds（可能是字符串或数字）
      confirmMessage = '是否确认删除采样点编号为"' + _keys + '"的数据项？';
    } else {
      // 批量删除：显示第一个编号+数量
      confirmMessage = `是否确认删除采样点编号为"${firstKey}"等的${count}条数据？`;
    }
  }
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delPoint(_ids);
  emit('delPoint', _ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/**
 *
 * @param row 采样点定位
 */
const handleLocation = (row?: PointVO) => {
  console.log(row?.pointId);

  emit('pointLocate', row?.pointId);
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'powland/point/export',
    {
      ...queryParams.value
    },
    `point_${new Date().getTime()}.xlsx`
  );
};

const handleImport = () => {
  upload.open = true;
  upload.title = '采样点导入';
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
  uploadRef?.value.submit();
};

const importTemplate = () => {
  proxy?.download('powland/point/importTemplate', {}, `point_template_${new Date().getTime()}.xlsx`);
};

/**
 * 农户、基地字典
 */
const getDicts = async () => {
  const res = await baseDictQuery();
  baseDict.value = res.rows
    .map((item) => ({
      label: item.label,
      value: item.value.toString()
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'zh'));
};

onMounted(() => {
  getList();
  getDicts();
});
</script>
