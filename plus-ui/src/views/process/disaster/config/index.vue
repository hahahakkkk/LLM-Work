<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="灾害类型" prop="disasterType">
              <el-select v-model="queryParams.disasterType" placeholder="请选择灾害类型" clearable>
                <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="预警阈值" prop="thresholdValue">
              <el-input v-model="queryParams.thresholdValue" placeholder="请输入预警阈值" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="是否启用自动预警" prop="autoWarningEnabled">
              <el-input v-model="queryParams.autoWarningEnabled" placeholder="请输入是否启用自动预警" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['disaster:config:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['disaster:config:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['disaster:config:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['disaster:config:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!--        <el-table-column label="主键ID" align="center" prop="id" v-if="true" / -->>
        <el-table-column label="灾害类型" align="center" prop="disasterType">
          <template #default="scope">
            <dict-tag :options="sys_disaster_type" :value="scope.row.disasterType" />
          </template>
        </el-table-column>
        <el-table-column label="预警阈值" align="center" prop="thresholdValue" />
        <el-table-column label="是否启用自动预警" align="center" prop="autoWarningEnabled" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['disaster:config:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['disaster:config:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改灾害预警配置对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="configFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="灾害类型" prop="disasterType">
          <el-select v-model="form.disasterType" placeholder="请选择灾害类型">
            <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预警阈值" prop="thresholdValue">
          <el-input v-model="form.thresholdValue" placeholder="请输入预警阈值" />
        </el-form-item>
        <el-form-item label="是否启用自动预警" prop="autoWarningEnabled">
          <el-input v-model="form.autoWarningEnabled" placeholder="请输入是否启用自动预警" />
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

<script setup name="Config" lang="ts">
import { listConfig, getConfig, delConfig, addConfig, updateConfig } from '@/api/disaster/config';
import { ConfigVO, ConfigQuery, ConfigForm } from '@/api/disaster/config/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_disaster_type } = toRefs<any>(proxy?.useDict('sys_disaster_type'));

const configList = ref<ConfigVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const configFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ConfigForm = {
  id: undefined,
  disasterType: undefined,
  thresholdValue: undefined,
  autoWarningEnabled: undefined
};
const data = reactive<PageData<ConfigForm, ConfigQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    disasterType: undefined,
    thresholdValue: undefined,
    autoWarningEnabled: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    disasterType: [{ required: true, message: '灾害类型不能为空', trigger: 'change' }],
    thresholdValue: [{ required: true, message: '预警阈值不能为空', trigger: 'blur' }],
    autoWarningEnabled: [{ required: true, message: '是否启用自动预警不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询灾害预警配置列表 */
const getList = async () => {
  loading.value = true;
  const res = await listConfig(queryParams.value);
  configList.value = res.rows;
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
  configFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ConfigVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加灾害预警配置';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ConfigVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getConfig(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改灾害预警配置';
};

/** 提交按钮 */
const submitForm = () => {
  configFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateConfig(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addConfig(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ConfigVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除灾害预警配置编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delConfig(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'disaster/config/export',
    {
      ...queryParams.value
    },
    `config_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
