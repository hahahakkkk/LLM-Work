<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="所属基地" prop="baseId" v-has-roles="['superadmin', 'sysadmin']">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable>
                <el-option v-for="dict in baseDict" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="姓名" prop="farmerName">
              <el-input v-model="queryParams.farmerName" placeholder="请输入姓名" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['powland:farmer:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['powland:farmer:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['powland:farmer:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['powland:farmer:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['powland:farmer:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="farmerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Primary Key" align="center" prop="farmerId" v-if="false" />
        <el-table-column label="所属基地" align="center" prop="baseId">
          <template #default="scope">
            <dict-tag :options="baseDict" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="姓名" align="center" prop="farmerName" />
        <el-table-column label="地址" align="center" prop="farmerAddress" />
        <el-table-column label="联系电话" align="center" prop="farmerPhone" />
        <el-table-column label="备注" align="center" prop="remark" />
        <!-- <el-table-column label="是否有效" align="center" prop="isValid">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid"/>
          </template>
        </el-table-column> -->
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['powland:farmer:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['powland:farmer:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改农户信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="farmerFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="farmerName">
          <el-input v-model="form.farmerName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="所属基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地" clearable>
            <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="farmerAddress">
          <el-input v-model="form.farmerAddress" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="联系电话" prop="farmerPhone">
          <el-input v-model="form.farmerPhone" placeholder="请输入联系电话" />
        </el-form-item>
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

    <!-- 导入农户对话框 -->
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的农户数据</div>
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

<script setup name="Farmer" lang="ts">
import { globalHeaders } from '@/utils/request';
import { listFarmer, getFarmer, delFarmer, addFarmer, updateFarmer } from '../api/farmer';
import { FarmerVO, FarmerQuery, FarmerForm } from '../api/farmer/types';
import { baseDictQuery } from '@/views/powland/api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid } = toRefs<any>(proxy?.useDict('is_valid'));

const farmerList = ref<FarmerVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const baseDict = ref<DictDataOption[]>([]);

const queryFormRef = ref<ElFormInstance>();
const farmerFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 农户导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层（农户导入）
  open: false,
  // 弹出层标题（农户导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的农户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/powland/farmer/import'
});

const uploadRef = ref<ElUploadInstance>();

const initFormData: FarmerForm = {
  farmerId: undefined,
  baseId: undefined,
  farmerName: undefined,
  farmerAddress: undefined,
  farmerPhone: undefined,
  remark: undefined
};
const data = reactive<PageData<FarmerForm, FarmerQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    farmerName: undefined,
    isValid: undefined,
    params: {}
  },
  rules: {
    baseId: [{ required: true, message: '所属基地不能为空', trigger: 'change' }],
    farmerName: [{ required: true, message: '姓名不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询农户信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listFarmer(queryParams.value);
  farmerList.value = res.rows;
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
  farmerFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: FarmerVO[]) => {
  ids.value = selection.map((item) => item.farmerId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加农户信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: FarmerVO) => {
  reset();
  const _farmerId = row?.farmerId || ids.value[0];
  const res = await getFarmer(_farmerId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改农户信息';
};

/** 提交按钮 */
const submitForm = () => {
  farmerFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.farmerId) {
        await updateFarmer(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFarmer(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: FarmerVO) => {
  const _farmerIds = row?.farmerId || ids.value;
  const keyArray = Array.isArray(_farmerIds) ? _farmerIds : [_farmerIds];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除农户信息已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delFarmer(_farmerIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'powland/farmer/export',
    {
      ...queryParams.value
    },
    `farmer_${new Date().getTime()}.xlsx`
  );
};

const handleImport = () => {
  upload.open = true;
  upload.title = '农户导入';
};

const importTemplate = () => {
  proxy?.download('powland/farmer/importTemplate', {}, `farmerImportTemplate.xlsx`);
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
  const res = await baseDictQuery();
  baseDict.value = res.rows.sort((a, b) => a.label.localeCompare(b.label, 'zh'));
};
onMounted(() => {
  getList();
  getDicts();
});
</script>
