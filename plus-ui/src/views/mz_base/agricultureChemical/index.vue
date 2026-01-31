<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="农药名称" prop="chemicalName">
              <el-input v-model="queryParams.chemicalName" placeholder="请输入农药名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="批准文号" prop="chemicalApproval">
              <el-input v-model="queryParams.chemicalApproval" placeholder="请输入批准文号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="剂型" prop="chemicalForm">
              <el-input v-model="queryParams.chemicalForm" placeholder="请输入剂型" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="生产厂家" prop="manufacturer">
              <el-input v-model="queryParams.manufacturer" placeholder="请输入生产厂家" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:agricultureChemical:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:agricultureChemical:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
              v-hasPermi="['mz_base:agricultureChemical:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="upload" @click="handleImport" v-hasPermi="['mz_base:agricultureChemical:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:agricultureChemical:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" :columns="columns" :search="true" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="agricultureChemicalList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="columns[0].visible" key="chemicalId" label="农药ID" align="center" prop="chemicalId" />
        <el-table-column v-if="columns[1].visible" key="chemicalName" label="农药名称" align="center" prop="chemicalName" />
        <el-table-column v-if="columns[2].visible" key="chemicalApproval" label="批准文号" align="center" prop="chemicalApproval" />
        <el-table-column v-if="columns[3].visible" key="chemicalForm" label="剂型" align="center" prop="chemicalForm" />
        <el-table-column v-if="columns[4].visible" key="useScope" label="使用范围" align="center" prop="useScope" />
        <el-table-column v-if="columns[5].visible" key="useMethod" label="使用方法" align="center" prop="useMethod" />
        <el-table-column v-if="columns[6].visible" key="safeInterval" label="安全间隔期" align="center" prop="safeInterval" />
        <el-table-column v-if="columns[7].visible" key="manufacturer" label="生产厂家" align="center" prop="manufacturer" />
        <el-table-column v-if="columns[8].visible" key="supplier" label="供应商" align="center" prop="supplier" />
        <el-table-column v-if="columns[9].visible" key="remark" label="备注" align="center" prop="remark" />
        <el-table-column v-if="columns[10].visible" key="isValid" label="是否有效" align="center" prop="isValid">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['mz_base:agricultureChemical:edit']"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['mz_base:agricultureChemical:remove']"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改农药基本信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="agricultureChemicalFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="农药名称" prop="chemicalName">
          <el-input v-model="form.chemicalName" placeholder="请输入农药名称" />
        </el-form-item>
        <el-form-item label="批准文号" prop="chemicalApproval">
          <el-input v-model="form.chemicalApproval" placeholder="请输入批准文号" />
        </el-form-item>
        <el-form-item label="剂型" prop="chemicalForm">
          <el-input v-model="form.chemicalForm" placeholder="请输入剂型" />
        </el-form-item>
        <el-form-item label="使用范围" prop="useScope">
          <el-input v-model="form.useScope" placeholder="请输入使用范围" />
        </el-form-item>
        <el-form-item label="使用方法" prop="useMethod">
          <el-input v-model="form.useMethod" placeholder="请输入使用方法" />
        </el-form-item>
        <el-form-item label="安全间隔期" prop="safeInterval">
          <el-input v-model="form.safeInterval" placeholder="请输入安全间隔期" />
        </el-form-item>
        <el-form-item label="生产厂家" prop="manufacturer">
          <el-input v-model="form.manufacturer" placeholder="请输入生产厂家" />
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="form.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
        <!-- <el-form-item label="是否有效" prop="isValid">
          <el-select v-model="form.isValid" placeholder="请选择是否有效">
            <el-option
                v-for="dict in is_valid"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item> -->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 农药信息导入对话框 -->
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的农药基本信息数据</div>
        <span>仅允许导入xls、xlsx格式文件。</span>
        <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
      </div>
      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AgricultureChemical" lang="ts">
import { globalHeaders } from '@/utils/request';
import {
  listAgricultureChemical,
  getAgricultureChemical,
  delAgricultureChemical,
  addAgricultureChemical,
  updateAgricultureChemical
} from '../api/agricultureChemical/index';
import { AgricultureChemicalVO, AgricultureChemicalQuery, AgricultureChemicalForm } from '../api/agricultureChemical/types';
import { useChemicalStore } from '../store/chemical';

const chemicalStore = useChemicalStore();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid } = toRefs<any>(proxy?.useDict('is_valid'));

const agricultureChemicalList = ref<AgricultureChemicalVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const agricultureChemicalFormRef = ref<ElFormInstance>();

const uploadRef = ref<ElUploadInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `农药ID`, visible: false, children: [] },
  { key: 1, label: `农药名称`, visible: true, children: [] },
  { key: 2, label: `批准文号`, visible: true, children: [] },
  { key: 3, label: `剂型`, visible: true, children: [] },
  { key: 4, label: `使用范围`, visible: true, children: [] },
  { key: 5, label: `使用方法`, visible: true, children: [] },
  { key: 6, label: `安全间隔期`, visible: true, children: [] },
  { key: 7, label: `生产厂家`, visible: true, children: [] },
  { key: 8, label: `供应商`, visible: true, children: [] },
  { key: 9, label: `备注`, visible: true, children: [] },
  { key: 10, label: `是否有效`, visible: false, children: [] }
]);

// 农药基本信息导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层（农药基本信息导入）
  open: false,
  // 弹出层标题（农药基本信息导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/agricultureChemical/importData'
});

const initFormData: AgricultureChemicalForm = {
  chemicalId: undefined,
  chemicalName: undefined,
  chemicalApproval: undefined,
  chemicalForm: undefined,
  useScope: undefined,
  useMethod: undefined,
  safeInterval: undefined,
  manufacturer: undefined,
  supplier: undefined,
  remark: undefined
};
const data = reactive<PageData<AgricultureChemicalForm, AgricultureChemicalQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    chemicalName: undefined,
    chemicalApproval: undefined,
    chemicalForm: undefined,
    manufacturer: undefined,
    params: {}
  },
  rules: {
    chemicalId: [{ required: true, message: '农药ID不能为空', trigger: 'blur' }],
    chemicalName: [{ required: true, message: '农药名称不能为空', trigger: 'blur' }],
    chemicalApproval: [{ required: true, message: '批准文号不能为空', trigger: 'blur' }],
    chemicalForm: [{ required: true, message: '剂型不能为空', trigger: 'blur' }],
    useScope: [{ required: true, message: '使用范围不能为空', trigger: 'blur' }],
    useMethod: [{ required: true, message: '使用方法不能为空', trigger: 'blur' }],
    safeInterval: [{ required: true, message: '安全间隔期不能为空', trigger: 'blur' }],
    manufacturer: [{ required: true, message: '生产厂家不能为空', trigger: 'blur' }],
    supplier: [{ required: true, message: '供应商不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询农药基本信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAgricultureChemical(queryParams.value);
  agricultureChemicalList.value = res.rows;
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
  agricultureChemicalFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: AgricultureChemicalVO[]) => {
  ids.value = selection.map((item) => item.chemicalId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加农药基本信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: AgricultureChemicalVO) => {
  reset();
  const _chemicalId = row?.chemicalId || ids.value[0];
  const res = await getAgricultureChemical(_chemicalId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改农药基本信息';
};

/** 提交按钮 */
const submitForm = () => {
  agricultureChemicalFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.chemicalId) {
        await updateAgricultureChemical(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addAgricultureChemical(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
      chemicalStore.loadChemicalDict();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: AgricultureChemicalVO) => {
  const _chemicalIds = row?.chemicalId || ids.value;
  const keyArray = Array.isArray(_chemicalIds) ? _chemicalIds : [_chemicalIds];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除农药基本信息已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delAgricultureChemical(_chemicalIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '农药基本信息导入';
};

const importTemplate = () => {
  proxy?.download('mz-base/agricultureChemical/importTemplate', {}, `agricultureChemical_template_${new Date().getTime()}.xlsx`);
};

const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};

const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  alert(response.msg);
  uploadRef.value?.handleRemove(file);
  getList();
};

const submitFileForm = () => {
  uploadRef.value?.submit();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'mz-base/agricultureChemical/export',
    {
      ...queryParams.value
    },
    `agricultureChemical_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
