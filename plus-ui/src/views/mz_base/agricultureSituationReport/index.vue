<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item label="上报记录ID" prop="reportId">
              <el-input v-model="queryParams.reportId" placeholder="请输入上报记录ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="农情发生地块" prop="landId">
              <el-input v-model="queryParams.landId" placeholder="请输入农情发生地块" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="上报内容" prop="reportContent">
              <el-input v-model="queryParams.reportContent" placeholder="请输入上报内容" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="上报时间" prop="reportTime">
              <el-date-picker clearable
                v-model="queryParams.reportTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择上报时间"
              />
            </el-form-item>
            <el-form-item label="上报人" prop="reportBy">
              <el-input v-model="queryParams.reportBy" placeholder="请输入上报人" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="是否有效" prop="isValid">
              <el-select v-model="queryParams.isValid" placeholder="请选择是否有效" clearable >
                <el-option v-for="dict in is_valid" :key="dict.value" :label="dict.label" :value="dict.value"/>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:agricultureSituationReport:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:agricultureSituationReport:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:agricultureSituationReport:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['mz_base:agricultureSituationReport:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:agricultureSituationReport:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="agricultureSituationReportList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="上报记录ID" align="center" prop="reportId" v-if="true" />
        <el-table-column label="农情发生地块" align="center" prop="landId" />
        <el-table-column label="上报内容" align="center" prop="reportContent" />
        <el-table-column label="上报时间" align="center" prop="reportTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.reportTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上报人" align="center" prop="reportBy" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="是否有效" align="center" prop="isValid">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:agricultureSituationReport:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:agricultureSituationReport:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改农情信息上报对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="agricultureSituationReportFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="农情发生地块" prop="landId">
          <el-input v-model="form.landId" placeholder="请输入农情发生地块" />
        </el-form-item>
        <el-form-item label="上报内容" prop="reportContent">
            <el-input v-model="form.reportContent" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="上报时间" prop="reportTime">
          <el-date-picker clearable
            v-model="form.reportTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择上报时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="上报人" prop="reportBy">
          <el-input v-model="form.reportBy" placeholder="请输入上报人" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="是否有效" prop="isValid">
          <el-select v-model="form.isValid" placeholder="请选择是否有效">
            <el-option
                v-for="dict in is_valid"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 农情上报对话框 -->
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
          <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的农情上报数据
          <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
      </div>
      <div class="el-upload__tip" style="color:red" slot="tip">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AgricultureSituationReport" lang="ts">
import { globalHeaders } from '@/utils/request';
import { listAgricultureSituationReport, getAgricultureSituationReport, delAgricultureSituationReport, addAgricultureSituationReport, updateAgricultureSituationReport } from '../api/agricultureSituationReport/index';
import { AgricultureSituationReportVO, AgricultureSituationReportQuery, AgricultureSituationReportForm } from '../api/agricultureSituationReport/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid } = toRefs<any>(proxy?.useDict('is_valid'));

const agricultureSituationReportList = ref<AgricultureSituationReportVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const agricultureSituationReportFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 农情上报导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层（农情上报导入）
  open: false,
  // 弹出层标题（农情上报导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的农情上报数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址a
  url: import.meta.env.VITE_APP_BASE_API + "/mz-base/agricultureSituationReport/importData"
});

const uploadRef = ref<ElUploadInstance>();


const initFormData: AgricultureSituationReportForm = {
  reportId: undefined,
  landId: undefined,
  reportContent: undefined,
  reportTime: undefined,
  reportBy: undefined,
  remark: undefined,
  isValid: undefined,
}
const data = reactive<PageData<AgricultureSituationReportForm, AgricultureSituationReportQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    reportId: undefined,
    landId: undefined,
    reportContent: undefined,
    reportTime: undefined,
    reportBy: undefined,
    isValid: undefined,
    params: {
    }
  },
  rules: {
    landId: [
      { required: true, message: "农情发生地块不能为空", trigger: "blur" }
    ],
    reportContent: [
      { required: true, message: "上报内容不能为空", trigger: "blur" }
    ],
    reportTime: [
      { required: true, message: "上报时间不能为空", trigger: "blur" }
    ],
    reportBy: [
      { required: true, message: "上报人不能为空", trigger: "blur" }
    ],
    isValid: [
      { required: true, message: "是否有效不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询农情信息上报列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAgricultureSituationReport(queryParams.value);
  agricultureSituationReportList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  agricultureSituationReportFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: AgricultureSituationReportVO[]) => {
  ids.value = selection.map(item => item.reportId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加农情信息上报";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: AgricultureSituationReportVO) => {
  reset();
  const _reportId = row?.reportId || ids.value[0]
  const res = await getAgricultureSituationReport(_reportId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改农情信息上报";
}

/** 提交按钮 */
const submitForm = () => {
  agricultureSituationReportFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.reportId) {
        await updateAgricultureSituationReport(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addAgricultureSituationReport(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: AgricultureSituationReportVO) => {
  const _reportIds = row?.reportId || ids.value;
  await proxy?.$modal.confirm('是否确认删除农情信息上报编号为"' + _reportIds + '"的数据项？').finally(() => loading.value = false);
  await delAgricultureSituationReport(_reportIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('mz-base/agricultureSituationReport/export', {
    ...queryParams.value
  }, `agricultureSituationReport_${new Date().getTime()}.xlsx`)
}

const handleImport = () => {
  upload.open = true;
  upload.title = "农情上报信息导入";
}

const importTemplate = () => {
  proxy?.download('mz-base/agricultureSituationReport/importTemplate', {}, `agricultureSituationReportImportTemplate.xlsx`)
}

const handleFileUploadProgress = () => {
  upload.isUploading = true;
}

const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>', '导入结果', {
    dangerouslyUseHTMLString: true
  });
  getList();
}

const submitFileForm = () => {
  uploadRef.value?.submit();
}

onMounted(() => {
  getList();
});
</script>
