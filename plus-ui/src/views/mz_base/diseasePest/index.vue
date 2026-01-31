<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="100px">
            <el-form-item label="所属基地" prop="baseId" v-has-roles="['superadmin', 'sysadmin']">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable style="width: 150px">
                <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="病虫害名称" prop="dpName">
              <el-select v-model="queryParams.dpName" placeholder="请选择病虫害名称" clearable style="width: 160px">
                <el-option v-for="dict in dp_name" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="危害程度" prop="dpLevel">
              <el-select v-model="queryParams.dpLevel" placeholder="请选择危害程度" clearable style="width: 160px">
                <el-option v-for="dict in dp_level" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="谷子生长期" prop="growthPeriod">
              <el-select v-model="queryParams.growthPeriod" placeholder="请选择谷子生长期" clearable style="width: 160px">
                <el-option v-for="dict in growth_period" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="年份" prop="dpNf" label-width="50">
              <el-date-picker
                v-model="queryParams.minYear"
                type="year"
                value-format="YYYY"
                format="YYYY"
                placeholder="开始年份"
                clearable
                style="width: 160px"
              />
              <span style="margin: 0 8px">-</span>
              <el-date-picker
                v-model="queryParams.maxYear"
                type="year"
                value-format="YYYY"
                format="YYYY"
                placeholder="结束年份"
                clearable
                style="width: 160px"
              />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:diseasePest:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:diseasePest:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:diseasePest:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="upload" @click="handleImport" v-hasPermi="['mz_base:diseasePest:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:diseasePest:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" :columns="columns" :sesrch="true" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="diseasePestList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="columns[0].visible" key="dpId" label="病虫害ID" align="center" prop="dpId" />
        <el-table-column v-if="columns[1].visible" key="baseId" label="所属基地" align="center" prop="baseId">
          <template #default="scope">
            <dict-tag :options="baseDict" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column v-if="columns[2].visible" key="dpName" label="病虫害名称" align="center" prop="dpName">
          <template #default="scope">
            <dict-tag :options="dp_name" :value="scope.row.dpName" />
          </template>
        </el-table-column>
        <el-table-column v-if="columns[3].visible" key="dpArea" label="病虫害面积" align="center" prop="dpArea" />
        <el-table-column v-if="columns[4].visible" key="dpLevel" label="危害程度" align="center" prop="dpLevel">
          <template #default="scope">
            <dict-tag :options="dp_level" :value="scope.row.dpLevel" />
          </template>
        </el-table-column>
        <el-table-column v-if="columns[5].visible" key="growthPeriod" label="谷子生长期" align="center" prop="growthPeriod">
          <template #default="scope">
            <dict-tag :options="growth_period" :value="scope.row.growthPeriod" />
          </template>
        </el-table-column>
        <el-table-column v-if="columns[6].visible" key="dpNf" label="年份" align="center" prop="dpNf" />
        <el-table-column v-if="columns[7].visible" key="remark" label="备注" align="center" prop="remark" />
        <el-table-column v-if="columns[8].visible" key="isValid" label="是否有效" align="center" prop="isValid">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:diseasePest:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:diseasePest:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改基地病虫害历史数据对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="diseasePestFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="所属基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择所属基地" clearable>
            <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="病虫害名称" prop="dpName">
          <el-select v-model="form.dpName" placeholder="请选择病虫害名称">
            <el-option v-for="dict in dp_name" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="病虫害面积" prop="dpArea">
          <el-input v-model="form.dpArea" placeholder="请输入病虫害面积" />
        </el-form-item>
        <el-form-item label="危害程度" prop="dpLevel">
          <el-select v-model="form.dpLevel" placeholder="请选择危害程度">
            <el-option v-for="dict in dp_level" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="谷子生长期" prop="growthPeriod">
          <el-select v-model="form.growthPeriod" placeholder="请选择谷子生长期">
            <el-option v-for="dict in growth_period" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年份" prop="dpNf">
          <el-input v-model="form.dpNf" placeholder="请输入年份" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 基地病虫害数据导入对话框 -->
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的基地病虫害数据数据</div>
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

<script setup name="DiseasePest" lang="ts">
import { globalHeaders } from '@/utils/request';
import { listDiseasePest, getDiseasePest, delDiseasePest, addDiseasePest, updateDiseasePest } from '../api/diseasePest/index';
import { DiseasePestVO, DiseasePestQuery, DiseasePestForm } from '../api/diseasePest/types';
import { baseDictQuery } from '../api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { growth_period, dp_name, is_valid, dp_level } = toRefs<any>(proxy?.useDict('growth_period', 'dp_name', 'is_valid', 'dp_level'));

const diseasePestList = ref<DiseasePestVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const baseDict = ref<DictDataOption[]>([]);

const queryFormRef = ref<ElFormInstance>();
const diseasePestFormRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `病虫害ID`, visible: false, children: [] },
  { key: 1, label: `所属基地`, visible: true, children: [] },
  { key: 2, label: `病虫害名称`, visible: true, children: [] },
  { key: 3, label: `病虫害面积`, visible: true, children: [] },
  { key: 4, label: `危害程度`, visible: true, children: [] },
  { key: 5, label: `谷子生长期`, visible: true, children: [] },
  { key: 6, label: `年份`, visible: true, children: [] },
  { key: 7, label: `备注`, visible: true, children: [] },
  { key: 8, label: `是否有效`, visible: false, children: [] }
]);

// 农药使用记录导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层
  open: false,
  // 弹出层标题
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/diseasePest/importData'
});

const initFormData: DiseasePestForm = {
  dpId: undefined,
  baseId: undefined,
  dpName: undefined,
  dpArea: undefined,
  dpLevel: undefined,
  growthPeriod: undefined,
  dpNf: undefined,
  minYear: undefined,
  maxYear: undefined,
  remark: undefined,
  isValid: undefined
};
const data = reactive<PageData<DiseasePestForm, DiseasePestQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    dpName: undefined,
    dpArea: undefined,
    dpLevel: undefined,
    growthPeriod: undefined,
    dpNf: undefined,
    minYear: undefined,
    maxYear: undefined,
    params: {}
  },
  rules: {
    baseId: [{ required: true, message: '所属基地不能为空', trigger: 'blur' }],
    dpName: [{ required: true, message: '病虫害名称不能为空', trigger: 'change' }],
    dpArea: [{ required: true, message: '病虫害面积不能为空', trigger: 'blur' }],
    dpLevel: [{ required: true, message: '危害程度不能为空', trigger: 'change' }],
    growthPeriod: [{ required: true, message: '谷子生长期不能为空', trigger: 'change' }],
    dpNf: [{ required: true, message: '年份不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询基地病虫害历史数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDiseasePest(queryParams.value);
  diseasePestList.value = res.rows;
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
  diseasePestFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.minYear = '';
  queryParams.value.maxYear = '';
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: DiseasePestVO[]) => {
  ids.value = selection.map((item) => item.dpId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加基地病虫害历史数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: DiseasePestVO) => {
  reset();
  const _dpId = row?.dpId || ids.value[0];
  const res = await getDiseasePest(_dpId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改基地病虫害历史数据';
};

/** 提交按钮 */
const submitForm = () => {
  diseasePestFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.dpId) {
        await updateDiseasePest(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addDiseasePest(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: DiseasePestVO) => {
  const _dpIds = row?.dpId || ids.value;
  await proxy?.$modal.confirm('是否确认删除基地病虫害历史数据编号为"' + _dpIds + '"的数据项？').finally(() => (loading.value = false));
  await delDiseasePest(_dpIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '基地病虫害历史数据导入';
};

const importTemplate = () => {
  proxy?.download('mz-base/diseasePest/importTemplate', {}, `diseasePest_template_${new Date().getTime()}.xlsx`);
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
    'mz-base/diseasePest/export',
    {
      ...queryParams.value
    },
    `diseasePest_${new Date().getTime()}.xlsx`
  );
};

/**
 * 基地字典
 */
const getDicts = async () => {
  const res = await baseDictQuery();
  baseDict.value = res.rows;
};

onMounted(() => {
  getList();
  getDicts();
});
</script>
