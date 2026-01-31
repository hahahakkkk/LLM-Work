<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="有机肥名称" prop="ofName" label-width="100">
              <el-input v-model="queryParams.ofName" placeholder="请输入有机肥名称" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:organicFertilizer:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:organicFertilizer:edit']"
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
              v-hasPermi="['mz_base:organicFertilizer:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="upload" @click="handleImport" v-hasPermi="['mz_base:organicFertilizer:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:organicFertilizer:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="organicFertilizerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="有机肥ID" align="center" prop="ofId" v-if="false" />
        <el-table-column label="有机肥名称" align="center" prop="ofName" />
        <el-table-column label="氮含量(%)" align="center" prop="ofN" />
        <el-table-column label="磷含量(%)" align="center" prop="ofP" />
        <el-table-column label="钾含量(%)" align="center" prop="ofK" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="是否有效" align="center" prop="isValid" v-if="false">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:organicFertilizer:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['mz_base:organicFertilizer:remove']"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改有机肥基本信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="organicFertilizerFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="有机肥名称" prop="ofName">
          <el-input v-model="form.ofName" placeholder="请输入有机肥名称" />
        </el-form-item>
        <el-form-item label="氮含量" prop="ofN">
          <el-input v-model="form.ofN" placeholder="请输入氮含量" />
        </el-form-item>
        <el-form-item label="磷含量" prop="ofP">
          <el-input v-model="form.ofP" placeholder="请输入磷含量" />
        </el-form-item>
        <el-form-item label="钾含量" prop="ofK">
          <el-input v-model="form.ofK" placeholder="请输入钾含量" />
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
    <!-- 有机肥基本信息导入对话框 -->
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的有机肥基本信息</div>
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

<script setup name="OrganicFertilizer" lang="ts">
import { globalHeaders } from '@/utils/request';
import {
  listOrganicFertilizer,
  getOrganicFertilizer,
  delOrganicFertilizer,
  addOrganicFertilizer,
  updateOrganicFertilizer
} from '../api/organicFertilizer';
import { OrganicFertilizerVO, OrganicFertilizerQuery, OrganicFertilizerForm } from '../api/organicFertilizer/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid } = toRefs<any>(proxy?.useDict('is_valid'));

const organicFertilizerList = ref<OrganicFertilizerVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const organicFertilizerFormRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();

// 有机肥基本信息导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层
  open: false,
  // 弹出层标题
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的有机肥基本信息数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/organicFertilizer/importData'
});

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: OrganicFertilizerForm = {
  ofId: undefined,
  ofName: undefined,
  ofN: undefined,
  ofP: undefined,
  ofK: undefined,
  remark: undefined
};
const data = reactive<PageData<OrganicFertilizerForm, OrganicFertilizerQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ofName: undefined,
    ofN: undefined,
    ofP: undefined,
    ofK: undefined,
    params: {}
  },
  rules: {
    ofId: [{ required: true, message: '有机肥ID不能为空', trigger: 'blur' }],
    ofName: [{ required: true, message: '有机肥名称不能为空', trigger: 'blur' }],
    ofN: [{ required: true, message: '氮含量不能为空', trigger: 'blur' }],
    ofP: [{ required: true, message: '磷含量不能为空', trigger: 'blur' }],
    ofK: [{ required: true, message: '钾含量不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询有机肥基本信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listOrganicFertilizer(queryParams.value);
  organicFertilizerList.value = res.rows;
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
  organicFertilizerFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: OrganicFertilizerVO[]) => {
  ids.value = selection.map((item) => item.ofId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加有机肥基本信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: OrganicFertilizerVO) => {
  reset();
  const _ofId = row?.ofId || ids.value[0];
  const res = await getOrganicFertilizer(_ofId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改有机肥基本信息';
};

/** 提交按钮 */
const submitForm = () => {
  organicFertilizerFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.ofId) {
        await updateOrganicFertilizer(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addOrganicFertilizer(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作（有机肥） */
const handleDelete = async (row?: OrganicFertilizerVO) => {
  const _keys = row?.ofId || ids.value;
  const _ids = row?.ofId || ids.value;
  const keyArray = Array.isArray(_keys) ? _keys : [_keys];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除有机肥基本信息已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delOrganicFertilizer(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '有机肥基本信息导入';
};

const importTemplate = () => {
  proxy?.download('mz-base/organicFertilizer/importTemplate', {}, `organicFertilizer_template_${new Date().getTime()}.xlsx`);
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
    'mz-base/organicFertilizer/export',
    {
      ...queryParams.value
    },
    `organicFertilizer_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
