<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="所属基地" prop="baseId" v-has-roles="['superadmin', 'sysadmin', 'govadmin']">
              <el-select v-model="queryParams.baseId" placeholder="请选择所属基地" clearable>
                <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="设备编号" prop="facilityId">
              <el-input v-model="queryParams.facilityId" placeholder="请输入设备编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="设备类型" prop="facilityType">
              <el-select v-model="queryParams.facilityType" placeholder="请选择设备类型" clearable>
                <el-option v-for="dict in four_facility_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="设备运行状态" prop="facilityStatus" label-width="100px">
              <el-select v-model="queryParams.facilityStatus" placeholder="请选择设备运行状态" clearable>
                <el-option v-for="dict in four_facility_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['four:facility:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Top" @click="handleImport" v-hasPermi="['four:facility:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['four:facility:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['four:facility:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['four:facility:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="facilityList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!--<el-table-column label="主键" align="center" prop="fourId" v-if="true" />-->
        <el-table-column label="所属基地" align="center" prop="baseId">
          <template #default="scope">
            <dict-tag :options="four_base_name" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="设备编号" align="center" prop="facilityId" />
        <el-table-column label="设备类型" align="center" prop="facilityType">
          <template #default="scope">
            <dict-tag :options="four_facility_type" :value="scope.row.facilityType" />
          </template>
        </el-table-column>
        <el-table-column label="设备位置经度" align="center" prop="facilityLongitude" />
        <el-table-column label="设备位置纬度" align="center" prop="facilityLatitude" />
        <el-table-column label="设备运行状态" align="center" prop="facilityStatus">
          <template #default="scope">
            <dict-tag :options="four_facility_status" :value="scope.row.facilityStatus" />
          </template>
        </el-table-column>
        <el-table-column label="数据采集频率" align="center" prop="collectFrequency" />
        <!--<el-table-column label="扩展字段1" align="center" prop="ext1" />
        <el-table-column label="扩展字段2" align="center" prop="ext2" />
        <el-table-column label="扩展字段3" align="center" prop="ext3" />
        <el-table-column label="扩展字段4" align="center" prop="ext4" />
        <el-table-column label="扩展字段5" align="center" prop="ext5" />
        <el-table-column label="扩展字段6" align="center" prop="ext6" />-->
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['four:facility:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['four:facility:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改四情监测设备对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="facilityFormRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="所属基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择所属基地">
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号" prop="facilityId">
          <el-input v-model="form.facilityId" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="设备类型" prop="facilityType">
          <el-select v-model="form.facilityType" placeholder="请选择设备类型">
            <el-option v-for="dict in four_facility_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备位置经度" prop="facilityLongitude">
          <el-input v-model="form.facilityLongitude" placeholder="请输入设备位置经度" />
        </el-form-item>
        <el-form-item label="设备位置纬度" prop="facilityLatitude">
          <el-input v-model="form.facilityLatitude" placeholder="请输入设备位置纬度" />
        </el-form-item>
        <el-form-item label="设备运行状态" prop="facilityStatus">
          <el-select v-model="form.facilityStatus" placeholder="请选择设备运行状态">
            <el-option v-for="dict in four_facility_status" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据采集频率" prop="collectFrequency">
          <el-input v-model="form.collectFrequency" placeholder="请输入数据采集频率" />
        </el-form-item>
        <!--<el-form-item label="扩展字段1" prop="ext1">
          <el-input v-model="form.ext1" placeholder="请输入扩展字段1" />
        </el-form-item>
        <el-form-item label="扩展字段2" prop="ext2">
          <el-input v-model="form.ext2" placeholder="请输入扩展字段2" />
        </el-form-item>
        <el-form-item label="扩展字段3" prop="ext3">
          <el-input v-model="form.ext3" placeholder="请输入扩展字段3" />
        </el-form-item>
        <el-form-item label="扩展字段4" prop="ext4">
          <el-input v-model="form.ext4" placeholder="请输入扩展字段4" />
        </el-form-item>
        <el-form-item label="扩展字段5" prop="ext5">
          <el-input v-model="form.ext5" placeholder="请输入扩展字段5" />
        </el-form-item>
        <el-form-item label="扩展字段6" prop="ext6">
          <el-input v-model="form.ext6" placeholder="请输入扩展字段6" />
        </el-form-item>-->
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 文件导入对话框 -->
    <el-dialog v-model="upload.open" :title="upload.title" width="500px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :before-upload="beforeImportUpload"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload">
          <i-ep-upload-filled />
        </el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="text-center el-upload__tip">
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size: 15px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Facility" lang="ts">
import { listFacility, getFacility, delFacility, addFacility, updateFacility } from '../api/facility';
import { FacilityVO, FacilityQuery, FacilityForm } from '../api/facility/types';
import { globalHeaders } from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_facility_type, four_facility_status, four_base_name } = toRefs<any>(
  proxy?.useDict('four_facility_type', 'four_facility_status', 'four_base_name')
);

const facilityList = ref<FacilityVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const facilityFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FacilityForm = {
  fourId: undefined,
  baseId: undefined,
  facilityId: undefined,
  facilityType: undefined,
  facilityLongitude: undefined,
  facilityLatitude: undefined,
  facilityStatus: undefined,
  collectFrequency: undefined,
  ext1: undefined,
  ext2: undefined,
  ext3: undefined,
  ext4: undefined,
  ext5: undefined,
  ext6: undefined,
  remark: undefined
};
const data = reactive<PageData<FacilityForm, FacilityQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    facilityId: undefined,
    facilityType: undefined,
    facilityStatus: undefined,
    params: {}
  },
  rules: {
    fourId: [{ required: true, message: '主键不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '所属基地不能为空', trigger: 'change' }],
    facilityId: [{ required: true, message: '设备编号不能为空', trigger: 'blur' }],
    facilityType: [{ required: true, message: '设备类型不能为空', trigger: 'change' }],
    facilityLongitude: [
      { required: true, message: '设备位置经度不能为空', trigger: 'change' },
      {
        pattern: /^\d+(\.\d{8})$/,
        message: '经度格式错误，必须为正数且小数点后八位',
        trigger: 'blur'
      }
    ],
    facilityLatitude: [
      { required: true, message: '设备位置纬度不能为空', trigger: 'change' },
      {
        pattern: /^\d+(\.\d{8})$/,
        message: '纬度格式错误，必须为正数且小数点后八位',
        trigger: 'blur'
      }
    ],
    facilityStatus: [{ required: true, message: '设备运行状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询四情监测设备列表 */
const getList = async () => {
  loading.value = true;
  const res = await listFacility(queryParams.value);
  facilityList.value = res.rows;
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
  facilityFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: FacilityVO[]) => {
  ids.value = selection.map((item) => item.fourId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加四情监测设备';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: FacilityVO) => {
  reset();
  const _fourId = row?.fourId || ids.value[0];
  const res = await getFacility(_fourId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改四情监测设备';
};

/** 提交按钮 */
const submitForm = () => {
  facilityFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.fourId) {
        await updateFacility(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFacility(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: FacilityVO) => {
  const _fourIds = row?.fourId || ids.value;
  await proxy?.$modal.confirm('是否确认删除四情监测设备主键为"' + _fourIds + '"的数据项？').finally(() => (loading.value = false));
  await delFacility(_fourIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'four/facility/export',
    {
      ...queryParams.value
    },
    `facility_${new Date().getTime()}.xlsx`
  );
};

/*** 以下为数据导入按钮-ltq */
/*** 文件导入参数 */
const upload = reactive<ImportOption>({
  // 是否显示弹出框
  open: false,
  // 弹出框标题
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/four/facility/importData'
});

const uploadRef = ref<ElUploadInstance>(); //uploadRef 用于引用 el-upload 组件的实例,在 el-upload 组件上使用 ref 属性绑定 uploadRef

/** 导入按钮操作 */
const handleImport = () => {
  upload.title = '批量导入四情监测设备数据';
  upload.open = true;
};

/** 下载模板操作 */
const importTemplate = () => {
  proxy?.download('four/facility/importTemplate', {}, `facility_template_${new Date().getTime()}.xlsx`);
};

/**文件上传前处理 */
const beforeImportUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
  if (!isExcel) {
    proxy?.$modal.msgError('上传文件格式不正确');
  }
  const isLt800K = file.size / 1024 < 800;
  if (!isLt800K) {
    proxy?.$modal.msgError('上传文件大小不能超过 800KB!');
  }
  return isExcel && isLt800K;
};

/**文件上传中处理 */
const handleFileUploadProgress = () => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>', '导入结果', {
    dangerouslyUseHTMLString: true
  });
  getList();
};

/** 提交上传文件 */
function submitFileForm() {
  uploadRef.value?.submit();
}

onMounted(() => {
  getList();
});
</script>
