<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="模型名称" prop="modelName">
              <el-input v-model="queryParams.modelName" placeholder="请输入模型名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="模型用途" prop="modelType">
              <el-input v-model="queryParams.modelType" placeholder="请输入模型用途" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!--<el-form-item label="是否默认" prop="isDefault">
              <el-select v-model="queryParams.isDefault" placeholder="请选择是否默认" clearable>
                <el-option v-for="dict in four_model_default" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>-->
            <el-form-item label="描述信息" prop="remark">
              <el-input v-model="queryParams.remark" placeholder="请输入描述信息" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['four:model:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['four:model:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['four:model:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['four:model:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="modelList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" width="55" align="center">
          <template #default="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="主键" align="center" prop="modelId" v-if="false" />
        <el-table-column label="模型名称" align="center" prop="modelName" />
        <el-table-column label="模型用途" align="center" prop="modelType" />
        <!--<el-table-column label="访问地址" align="center" prop="modelUrl" />
        <el-table-column label="是否默认" align="center" prop="isDefault">
          <template #default="scope">
            <dict-tag :options="four_model_default" :value="scope.row.isDefault" />
          </template>
        </el-table-column>-->
        <el-table-column label="描述" align="center" prop="remark" />
        <el-table-column label="创建时间" align="center" prop="modelCreate" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.modelCreate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="modelUpdate" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.modelUpdate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['four:model:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="downloadLoading[scope.row.modelId] ? '下载中' : '下载'" placement="top">
              <el-button
                v-hasPermi="['four:model:download']"
                link
                type="primary"
                :icon="downloadLoading[scope.row.modelId] ? 'Loading' : 'Download'"
                :loading="downloadLoading[scope.row.modelId]"
                @click="handleDownload(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['four:model:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改智能决策模型对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="modelFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="form.modelName" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="模型用途" prop="modelType">
          <el-input v-model="form.modelType" placeholder="请输入模型用途" />
        </el-form-item>
        <!--<el-form-item label="访问地址" prop="modelUrl">
          <el-input v-model="form.modelUrl" placeholder="请输入访问地址" />
        </el-form-item>-->
        <el-form-item label="模型文件" prop="fileLocation">
          <el-button type="primary" plain icon="Upload" style="width: 50%" @click="openUploadDialog">{{
            form.fileLocation ? '已上传' : '上传模型文件'
          }}</el-button>
        </el-form-item>
        <!--<el-form-item label="是否默认" prop="isDefault">
          <el-select v-model="form.isDefault" placeholder="请选择是否默认">
            <el-option v-for="dict in four_model_default" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>-->
        <el-form-item label="描述" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请描述模型的输入输出" />
        </el-form-item>
        <el-form-item label="创建时间" prop="modelCreate">
          <el-date-picker clearable v-model="form.modelCreate" type="date" value-format="YYYY-MM-DD" placeholder="请选择模型创建时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="更新时间" prop="modelUpdate">
          <el-date-picker clearable v-model="form.modelUpdate" type="date" value-format="YYYY-MM-DD" placeholder="请选择模型更新时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 模型文件上传OSS对话框 -->
    <el-dialog v-model="uploadDialog.visible" :title="uploadDialog.title" width="500px" append-to-body>
      <el-form ref="ossFormRef" :model="form" label-width="80px">
        <el-form-item label="文件名">
          <fileUpload v-model="form.fileLocation" :file-type="['zip', 'rar', '7z']" :config-key="'model'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitUploadForm">确 定</el-button>
          <el-button @click="closeUploadDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Model" lang="ts">
import { listModel, getModel, delModel, addModel, updateModel } from '@/views/four/api/model';
import { ModelVO, ModelQuery, ModelForm } from '@/views/four/api/model/types';
import { downloadOss } from '@/views/four/plugins/download';
import fileUpload from '@/views/four/components/fileUpload/index.vue';
import { deleteOss } from '@/views/four/api/oss';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_model_type, four_model_default } = toRefs<any>(proxy?.useDict('four_model_type', 'four_model_default'));

const modelList = ref<ModelVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const fileLocations = ref<Array<string | number>>([]); // 多选时获取所有选中的 fileLocation
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const modelFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ModelForm = {
  modelId: undefined,
  modelName: undefined,
  modelType: undefined,
  modelUrl: undefined,
  fileLocation: undefined,
  isDefault: undefined,
  remark: undefined,
  modelCreate: undefined,
  modelUpdate: undefined
};
const data = reactive<PageData<ModelForm, ModelQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    modelName: undefined,
    modelType: undefined,
    isDefault: undefined,
    remark: undefined,
    params: {}
  },
  rules: {
    modelName: [{ required: true, message: '模型名称不能为空', trigger: 'blur' }],
    modelType: [{ required: true, message: '模型用途不能为空', trigger: 'change' }],
    // fileLocation: [{ required: true, message: '模型文件不能为空', trigger: 'blur' }],
    //modelUrl: [{ required: true, message: '访问地址不能为空', trigger: 'blur' }],
    //isDefault: [{ required: true, message: '是否默认不能为空', trigger: 'change' }],
    remark: [{ required: true, message: '描述信息不能为空', trigger: 'blur' }],
    modelCreate: [{ required: true, message: '模型创建时间不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询智能决策模型列表 */
const getList = async () => {
  loading.value = true;
  const res = await listModel(queryParams.value);
  modelList.value = res.rows;
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
  modelFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ModelVO[]) => {
  ids.value = selection.map((item) => item.modelId);
  fileLocations.value = selection.map((item) => item.fileLocation); // 多选时获取所有选中的 fileLocation
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加智能决策模型';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ModelVO) => {
  reset();
  const _modelId = row?.modelId || ids.value[0];
  const res = await getModel(_modelId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改智能决策模型';
};

/** 提交按钮 */
const submitForm = () => {
  modelFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.modelId) {
        await updateModel(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addModel(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ModelVO) => {
  const _modelIds = row?.modelId || ids.value;
  const _fileLocations = row?.fileLocation || fileLocations.value;
  await proxy?.$modal.confirm('是否确认删除智能决策模型编号为"' + _modelIds + '"的数据项？').finally(() => (loading.value = false));
  await deleteOss(_fileLocations); //先删除文件
  await delModel(_modelIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'four/model/export',
    {
      ...queryParams.value
    },
    `model_${new Date().getTime()}.xlsx`
  );
};

/** 以下为上传模型文件-ltq */

/** 上传文件对话框 */
const uploadDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

/** 打开上传文件对话框 */
const openUploadDialog = () => {
  uploadDialog.visible = true;
  uploadDialog.title = '上传文件';
};

/** 取消按钮-关闭上传文件对话框 */
const closeUploadDialog = async () => {
  uploadDialog.visible = false;
};

/** 确定按钮-关闭上传文件对话框 */
const submitUploadForm = () => {
  uploadDialog.visible = false;
};

// 用于控制每个下载按钮的加载状态
const downloadLoading = ref<Record<string | number, boolean>>({});

/** 下载按钮操作 */
const handleDownload = async (row?: ModelVO) => {
  if (!row || !row.fileLocation) {
    proxy?.$modal.msgError('无有效下载链接');
    return;
  }

  const modelId = row.modelId;
  downloadLoading.value[modelId] = true; // 显示加载状态

  try {
    proxy?.$modal.msgSuccess('下载开始，文件将自动保存');
    await downloadOss(row.fileLocation); // 调用你原来的下载方法
    // 下载成功后，延迟一小会儿恢复图标（视觉更自然）
    setTimeout(() => {
      downloadLoading.value[modelId] = false;
    }, 500);
  } catch (error) {
    console.error('下载失败:', error);
    proxy?.$modal.msgError('下载失败，请重试');
    downloadLoading.value[modelId] = false; // 立即恢复图标
  }
};

onMounted(() => {
  getList();
});
</script>
