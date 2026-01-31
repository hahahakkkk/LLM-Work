<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <!-- <el-form-item label="所属基地" prop="baseId">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable>
                <el-option v-for="dict in baseDict"  :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item> -->
            <el-form-item label="年份" prop="pyear">
              <el-date-picker v-model="queryParams.pYear" type="year" value-format="YYYY" format="YYYY" placeholder="生产年份" clearable />
              <!-- <el-date-picker v-model="queryParams.minYear" type="year" value-format="YYYY" format="YYYY"
                placeholder="开始年份" clearable />
              <span style="margin: 0 8px">-</span>
              <el-date-picker v-model="queryParams.maxYear" type="year" value-format="YYYY" format="YYYY"
                placeholder="结束年份" clearable /> -->
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:production:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:production:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:production:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="upload" @click="handleImport" v-hasPermi="['mz_base:production:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:production:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="productionList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="生产计划ID" align="center" prop="productionId" v-if="false" />
        <!-- <el-table-column label="所属基地" align="center" prop="baseId" width = "120">
          <template #default="scope">
            <dict-tag :options="baseDict as unknown as DictDataOption[]" :value="scope.row.baseId" />
          </template>
        </el-table-column> -->
        <el-table-column label="生产年份" align="center" prop="pyear" />
        <el-table-column label="开始时间" align="center" prop="startTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center" prop="endTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工作内容" align="center" prop="pcontent" />
        <!-- <el-table-column label="执行单位" align="center" prop="implementedBy" /> -->
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-has-roles="['sysadmin', 'superadmin']">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:production:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:production:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改生产计划对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="productionFormRef" :model="form" :rules="rules" label-width="80px">
        <!-- <el-form-item label="所属基地" prop="baseId">
            <el-select v-model="form.baseId" placeholder="请选择所属基地" clearable>
              <el-option v-for="dict in baseDict"  :label="dict.label" :value="dict.value" />
            </el-select>
        </el-form-item> -->
        <el-form-item label="年份" prop="pyear">
          <el-date-picker
            v-model="form.pyear"
            type="year"
            value-format="YYYY"
            format="YYYY"
            placeholder="请选择年份"
            clearable
            @change="handleQuery"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker clearable v-model="form.startTime" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" placeholder="请选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable v-model="form.endTime" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" placeholder="请选择结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="工作内容" prop="pcontent">
          <el-input v-model="form.pcontent" placeholder="请输入工作内容" type="textarea" />
        </el-form-item>
        <!-- <el-form-item label="执行单位" prop="implementedBy">
          <el-input v-model="form.implementedBy" placeholder="请输入执行单位" />
        </el-form-item> -->
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 生产计划导入对话框 -->
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的生产计划数据</div>
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

<script setup name="Production" lang="ts">
import { globalHeaders } from '@/utils/request';
import { listProduction, getProduction, delProduction, addProduction, updateProduction } from '../api/production';
import { ProductionVO, ProductionQuery, ProductionForm } from '../api/production/types';
import { baseDictQuery } from '../api/tableDict';
import { TableDict } from '../api/tableDict/types';
import type { DictDataOption } from '@/types/global';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid } = toRefs<any>(proxy?.useDict('is_valid'));

const productionList = ref<ProductionVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const baseDict = ref<TableDict[]>([]);

const queryFormRef = ref<ElFormInstance>();
const productionFormRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();

// 生产计划导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层
  open: false,
  // 弹出层标题
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的播种与收割数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/production/importData'
});

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProductionForm = {
  productionId: undefined,
  baseId: undefined,
  pYear: '',
  startTime: undefined,
  endTime: undefined,
  pcontent: undefined,
  implementedBy: undefined,
  minYear: undefined,
  maxYear: undefined,
  remark: undefined
};
const data = reactive<PageData<ProductionForm, ProductionQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    pYear: '',
    startTime: undefined,
    endTime: undefined,
    pContent: undefined,
    implementedBy: undefined,
    minYear: '',
    maxYear: '',
    params: {}
  },
  rules: {
    baseId: [{ required: true, message: '所属基地不能为空', trigger: 'blur' }],
    pyear: [{ required: true, message: '生产年份不能为空', trigger: 'blur' }],
    startTime: [{ required: true, message: '开始时间不能为空', trigger: 'blur' }],
    endTime: [{ required: true, message: '结束时间不能为空', trigger: 'blur' }],
    pcontent: [{ required: true, message: '工作内容不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询生产计划列表 */
const getList = async () => {
  loading.value = true;
  const res = await listProduction(queryParams.value);
  productionList.value = res.rows;
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
  productionFormRef.value?.resetFields();
  upload.updateSupport = 0;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.pYear = '';
  // queryParams.value.minYear = "";
  // queryParams.value.maxYear = "";
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: ProductionVO[]) => {
  ids.value = selection.map((item) => item.productionId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加生产计划';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ProductionVO) => {
  reset();
  const _productionId = row?.productionId || ids.value[0];
  const res = await getProduction(_productionId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改生产计划';
};

/** 提交按钮 */
const submitForm = () => {
  console.log(productionFormRef.value);
  productionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.productionId) {
        await updateProduction(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addProduction(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作（生产计划） */
const handleDelete = async (row?: ProductionVO) => {
  const _keys = row?.productionId || ids.value;
  const _ids = row?.productionId || ids.value;
  const keyArray = Array.isArray(_keys) ? _keys : [_keys];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除生产计划已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delProduction(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '生产计划导入';
};

const importTemplate = () => {
  proxy?.download('mz-base/production/importTemplate', {}, `production_template_${new Date().getTime()}.xlsx`);
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
    'mz-base/production/export',
    {
      ...queryParams.value
    },
    `production_${new Date().getTime()}.xlsx`
  );
};

/**
 * 基地、农户字典
 */
const getDicts = async () => {
  const res = await baseDictQuery();
  baseDict.value = (res.rows || []).slice().sort((a, b) =>
    String(a.label).localeCompare(String(b.label), 'zh-CN', {
      numeric: true,
      sensitivity: 'base'
    })
  );
  // let res = await baseDictQuery();
  // baseDict.value = res.rows;
};

onMounted(() => {
  getDicts();
  getList();
});
</script>
