<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item label="农艺活动ID" prop="activityId">
              <el-input v-model="queryParams.activityId" placeholder="请输入农艺活动ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="农艺活动地块" prop="landId">
              <el-input v-model="queryParams.landId" placeholder="请输入农艺活动地块" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="谷子品种" prop="milletType">
              <el-select v-model="queryParams.milletType" placeholder="请选择谷子品种" clearable >
                <el-option v-for="dict in crop_variety" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="农艺活动" prop="activityName">
              <el-select v-model="queryParams.activityName" placeholder="请选择农艺活动" clearable >
                <el-option v-for="dict in agriculture_activity" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="用法" prop="useMethod">
              <el-input v-model="queryParams.useMethod" placeholder="请输入用法" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用量" prop="useAmount">
              <el-input v-model="queryParams.useAmount" placeholder="请输入用量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="下发人" prop="issueBy">
              <el-input v-model="queryParams.issueBy" placeholder="请输入下发人" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="执行人" prop="executeBy">
              <el-input v-model="queryParams.executeBy" placeholder="请输入执行人" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="执行时间" prop="executeTime">
              <el-date-picker clearable
                v-model="queryParams.executeTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择执行时间"
              />
            </el-form-item>
            <el-form-item label="任务完成状态" prop="taskProgress">
              <el-select v-model="queryParams.taskProgress" placeholder="请选择任务完成状态" clearable >
                <el-option v-for="dict in agriculture_task_progress" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:agricultureActivity:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:agricultureActivity:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:agricultureActivity:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['mz_base:agricultureActivity:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:agricultureActivity:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="agricultureActivityList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="农艺活动ID" align="center" prop="activityId" v-if="true" />
        <el-table-column label="农艺活动地块" align="center" prop="landId" />
        <el-table-column label="谷子品种" align="center" prop="milletType">
          <template #default="scope">
            <dict-tag :options="crop_variety" :value="scope.row.milletType"/>
          </template>
        </el-table-column>
        <el-table-column label="农艺活动" align="center" prop="activityName">
          <template #default="scope">
            <dict-tag :options="agriculture_activity" :value="scope.row.activityName"/>
          </template>
        </el-table-column>
        <el-table-column label="用法" align="center" prop="useMethod" />
        <el-table-column label="用量" align="center" prop="useAmount" />
        <el-table-column label="下发人" align="center" prop="issueBy" />
        <el-table-column label="执行人" align="center" prop="executeBy" />
        <el-table-column label="执行时间" align="center" prop="executeTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.executeTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="任务完成状态" align="center" prop="taskProgress">
          <template #default="scope">
            <dict-tag :options="agriculture_task_progress" :value="scope.row.taskProgress"/>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="是否有效" align="center" prop="isValid">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:agricultureActivity:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:agricultureActivity:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改农艺活动对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="agricultureActivityFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="农艺活动地块" prop="landId">
          <el-input v-model="form.landId" placeholder="请输入农艺活动地块" />
        </el-form-item>
        <el-form-item label="谷子品种" prop="milletType">
          <el-select v-model="form.milletType" placeholder="请选择谷子品种">
            <el-option
                v-for="dict in crop_variety"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="农艺活动" prop="activityName">
          <el-select v-model="form.activityName" placeholder="请选择农艺活动">
            <el-option
                v-for="dict in agriculture_activity"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用法" prop="useMethod">
          <el-input v-model="form.useMethod" placeholder="请输入用法" />
        </el-form-item>
        <el-form-item label="用量" prop="useAmount">
          <el-input v-model="form.useAmount" placeholder="请输入用量" />
        </el-form-item>
        <el-form-item label="下发人" prop="issueBy">
          <el-input v-model="form.issueBy" placeholder="请输入下发人" />
        </el-form-item>
        <el-form-item label="执行人" prop="executeBy">
          <el-input v-model="form.executeBy" placeholder="请输入执行人" />
        </el-form-item>
        <el-form-item label="执行时间" prop="executeTime">
          <el-date-picker clearable
            v-model="form.executeTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择执行时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="任务完成状态" prop="taskProgress">
          <el-select v-model="form.taskProgress" placeholder="请选择任务完成状态">
            <el-option
                v-for="dict in agriculture_task_progress"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
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

    <!-- 农艺活动对话框 -->
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
          <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的农艺活动数据
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

<script setup name="AgricultureActivity" lang="ts">
import { globalHeaders } from '@/utils/request';
import { listAgricultureActivity, getAgricultureActivity, delAgricultureActivity, addAgricultureActivity, updateAgricultureActivity } from '../api/agricultureActivity';
import { AgricultureActivityVO, AgricultureActivityQuery, AgricultureActivityForm } from '../api/agricultureActivity/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { crop_variety, is_valid, agriculture_task_progress, agriculture_activity } = toRefs<any>(proxy?.useDict('crop_variety', 'is_valid', 'agriculture_task_progress', 'agriculture_activity'));

const agricultureActivityList = ref<AgricultureActivityVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const agricultureActivityFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 农艺活动导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层（农艺活动导入）
  open: false,
  // 弹出层标题（农艺活动导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的农艺活动数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/mz-base/agricultureActivity/importData"
});

const uploadRef = ref<ElUploadInstance>();

const initFormData: AgricultureActivityForm = {
  activityId: undefined,
  landId: undefined,
  milletType: undefined,
  activityName: undefined,
  useMethod: undefined,
  useAmount: undefined,
  issueBy: undefined,
  executeBy: undefined,
  executeTime: undefined,
  taskProgress: undefined,
  remark: undefined,
  isValid: undefined,
}
const data = reactive<PageData<AgricultureActivityForm, AgricultureActivityQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    activityId: undefined,
    landId: undefined,
    milletType: undefined,
    activityName: undefined,
    useMethod: undefined,
    useAmount: undefined,
    issueBy: undefined,
    executeBy: undefined,
    executeTime: undefined,
    taskProgress: undefined,
    isValid: undefined,
    params: {
    }
  },
  rules: {
    landId: [
      { required: true, message: "农艺活动地块不能为空", trigger: "blur" }
    ],
    milletType: [
      { required: true, message: "谷子品种不能为空", trigger: "change" }
    ],
    activityName: [
      { required: true, message: "农艺活动不能为空", trigger: "change" }
    ],
    useMethod: [
      { required: true, message: "用法不能为空", trigger: "blur" }
    ],
    useAmount: [
      { required: true, message: "用量不能为空", trigger: "blur" }
    ],
    issueBy: [
      { required: true, message: "下发人不能为空", trigger: "blur" }
    ],
    executeBy: [
      { required: true, message: "执行人不能为空", trigger: "blur" }
    ],
    executeTime: [
      { required: true, message: "执行时间不能为空", trigger: "blur" }
    ],
    taskProgress: [
      { required: true, message: "任务完成状态不能为空", trigger: "change" }
    ],
    isValid: [
      { required: true, message: "是否有效不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询农艺活动列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAgricultureActivity(queryParams.value);
  agricultureActivityList.value = res.rows;
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
  agricultureActivityFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: AgricultureActivityVO[]) => {
  ids.value = selection.map(item => item.activityId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加农艺活动";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: AgricultureActivityVO) => {
  reset();
  const _activityId = row?.activityId || ids.value[0]
  const res = await getAgricultureActivity(_activityId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改农艺活动";
}

/** 提交按钮 */
const submitForm = () => {
  agricultureActivityFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.activityId) {
        await updateAgricultureActivity(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addAgricultureActivity(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: AgricultureActivityVO) => {
  const _activityIds = row?.activityId || ids.value;
  await proxy?.$modal.confirm('是否确认删除农艺活动编号为"' + _activityIds + '"的数据项？').finally(() => loading.value = false);
  await delAgricultureActivity(_activityIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('mz-base/agricultureActivity/export', {
    ...queryParams.value
  }, `agricultureActivity_${new Date().getTime()}.xlsx`)
}

const handleImport = () => {
  upload.open = true;
  upload.title = "农艺活动导入";
}

const importTemplate = () => {
  proxy?.download('mz-base/agricultureActivity/importTemplate', {}, `agricultureActivityImportTemplate.xlsx`)
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
