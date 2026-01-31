<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="模型名称" prop="modelName">
              <el-input v-model="queryParams.modelName" placeholder="请输入模型名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="是否默认" prop="isDefault">
              <el-input v-model="queryParams.isDefault" placeholder="请输入1或0（1表示默认）" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="模型类型" prop="modelType">
              <el-input v-model="queryParams.modelType" placeholder="请输入模型类型" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input v-model="queryParams.description" placeholder="请输入描述" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mizhipestcontrol:identifyModel:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate()"
              v-hasPermi="['mizhipestcontrol:identifyModel:edit']"
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
              v-hasPermi="['mizhipestcontrol:identifyModel:remove']"
              >删除</el-button
            >
          </el-col>
          <!--          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mizhipestcontrol:identifyModel:export']">导出</el-button>
          </el-col>-->
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="identifyModelList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="模型id" align="center" prop="modelId" v-if="true" />
        <el-table-column label="模型名称" align="center" prop="modelName" v-if="true" />
        <el-table-column label="模型类型" align="center" prop="modelType" />
        <el-table-column label="是否默认" align="center" prop="isDefault" />
        <el-table-column label="访问地址" align="center" prop="modelUrl" />
        <el-table-column label="描述" align="center" prop="description" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
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
                v-hasPermi="['mizhipestcontrol:identifyModel:edit']"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['mizhipestcontrol:identifyModel:remove']"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改病虫害模型对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="identifyModelFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模型名称" prop="isDefault">
          <el-input v-model="form.modelName" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="模型类型" prop="modelType">
          <el-select v-model="form.modelType" placeholder="请选择模型类型" clearable>
            <el-option v-for="item in modelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-select v-model="form.isDefault" placeholder="请选择是否默认" clearable>
            <el-option v-for="item in isDefaultOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="访问地址" prop="modelUrl">
          <el-input v-model="form.modelUrl" placeholder="请输入访问地址" />
        </el-form-item>
        <el-form-item label="描述信息" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="IdentifyModel" lang="ts">
import { listIdentifyModel, getIdentifyModel, delIdentifyModel, addIdentifyModel, updateIdentifyModel } from '@/views/model/api/pestModel/index';
import { IdentifyModelVO, IdentifyModelQuery, IdentifyModelForm } from '@/views/model/api/pestModel/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const identifyModelList = ref<IdentifyModelVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const identifyModelFormRef = ref<ElFormInstance>();
const modelTypeOptions = ref([
  { value: '病虫害识别模型', label: '病虫害识别模型' },
  { value: '病虫害区域检测模型', label: '病虫害区域检测模型' },
  { value: '生育阶段识别模型', label: '生育阶段识别模型' },
  { value: '出苗率模型', label: '出苗率模型' },
  { value: '播种期模型', label: '播种期模型' }
]);
const isDefaultOptions = ref([
  { value: 1, label: '默认' },
  { value: 0, label: '非默认' }
]);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: IdentifyModelForm = {
  modelName: undefined,
  modelType: undefined,
  isDefault: undefined,
  modelUrl: undefined,
  description: undefined
};
const data = reactive<PageData<IdentifyModelForm, IdentifyModelQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    modelName: undefined,
    modelType: undefined,
    isDefault: undefined,
    modelUrl: undefined,
    description: undefined,
    params: {}
  },
  rules: {}
});

const { queryParams, form, rules } = toRefs(data);

/** 查询病虫害模型列表 */
const getList = async () => {
  loading.value = true;
  const res = await listIdentifyModel(queryParams.value);
  identifyModelList.value = res.rows;
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
  identifyModelFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: IdentifyModelVO[]) => {
  ids.value = selection.map((item) => item.modelId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加病虫害模型';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: IdentifyModelVO) => {
  reset();
  const _modelId = row?.modelId || ids.value[0];
  const res = await getIdentifyModel(_modelId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改病虫害模型';
};

/** 提交按钮 */
const submitForm = () => {
  identifyModelFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.modelId) {
        await updateIdentifyModel(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addIdentifyModel(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: IdentifyModelVO) => {
  const _modelIds = row?.modelId || ids.value;
  await proxy?.$modal.confirm('是否确认删除模型编号为"' + _modelIds + '"的数据项？').finally(() => (loading.value = false));
  await delIdentifyModel(_modelIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'mizhipestcontrol/identifyModel/export',
    {
      ...queryParams.value
    },
    `identifyModel_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
