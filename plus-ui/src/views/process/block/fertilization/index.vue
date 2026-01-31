<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="跟踪代码" prop="traceCode">
              <el-input v-model="queryParams.traceCode" placeholder="请输入跟踪代码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="地块信息" prop="plotInfo">
              <el-input v-model="queryParams.plotInfo" placeholder="请输入地块信息" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="肥料名称" prop="fertilizerName">
              <el-input v-model="queryParams.fertilizerName" placeholder="请输入肥料名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="施肥时间" prop="fertilizationTime">
              <el-input v-model="queryParams.fertilizationTime" placeholder="请输入施肥时间" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="操作人" prop="operator">
              <el-input v-model="queryParams.operator" placeholder="请输入操作人" clearable @keyup.enter="handleQuery" />
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
      <!-- <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['block:fertilization:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['block:fertilization:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['block:fertilization:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['block:fertilization:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template> -->

      <el-table v-loading="loading" :data="fertilizationList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <!-- <el-table-column label="施肥记录ID" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="溯源码" align="center" prop="traceCode" />
        <el-table-column label="地块信息" align="center" prop="plotInfo" />
        <el-table-column label="肥料名称" align="center" prop="fertilizerName" />
        <el-table-column label="施肥时间" align="center" prop="fertilizationTime" />
        <el-table-column label="施肥量" align="center" prop="fertilizerDosage">
          <template #default="scope"> {{ scope.row.fertilizerDosage }} kg/亩 </template>
        </el-table-column>

        <el-table-column label="施肥方式" align="center">
          <template #default="scope">
            <dict-tag :options="use_method" :value="scope.row.fertilizationMethod" />
          </template>
        </el-table-column>
        <el-table-column label="操作人" align="center" prop="operator" />
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改施肥溯源对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="fertilizationFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="跟踪代码" prop="traceCode">
          <el-input v-model="form.traceCode" placeholder="请输入跟踪代码" />
        </el-form-item>
        <el-form-item label="地块信息" prop="plotInfo">
          <el-input v-model="form.plotInfo" placeholder="请输入地块信息" />
        </el-form-item>
        <el-form-item label="肥料名称" prop="fertilizerName">
          <el-input v-model="form.fertilizerName" placeholder="请输入肥料名称" />
        </el-form-item>
        <el-form-item label="施肥时间" prop="fertilizationTime">
          <el-input v-model="form.fertilizationTime" placeholder="请输入施肥时间" />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="form.operator" placeholder="请输入操作人" />
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

<script setup name="Fertilization" lang="ts">
import {
  listFertilization,
  getFertilization,
  delFertilization,
  addFertilization,
  updateFertilization
} from '@/views/process/api/block/fertilization';
import { FertilizationVO, FertilizationQuery, FertilizationForm } from '@/views/process/api/block/fertilization/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { use_method } = toRefs<any>(proxy?.useDict('use_method'));

const fertilizationList = ref<FertilizationVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const fertilizationFormRef = ref<ElFormInstance>();
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FertilizationForm = {
  id: undefined,
  traceCode: undefined,
  plotInfo: undefined,
  fertilizerName: undefined,
  fertilizerDosage: undefined,
  fertilizationMethod: undefined,
  fertilizationTime: undefined,
  operator: undefined
};
const data = reactive<PageData<FertilizationForm, FertilizationQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    traceCode: undefined,
    plotInfo: undefined,
    fertilizerName: undefined,
    fertilizationTime: undefined,
    operator: undefined,
    params: {}
  },
  rules: {
    // id: [{ required: true, message: '施肥记录ID不能为空', trigger: 'blur' }],
    traceCode: [{ required: true, message: '跟踪代码不能为空', trigger: 'blur' }],
    plotInfo: [{ required: true, message: '地块信息不能为空', trigger: 'blur' }],
    fertilizerName: [{ required: true, message: '肥料名称不能为空', trigger: 'blur' }],
    fertilizationTime: [{ required: true, message: '施肥时间不能为空', trigger: 'blur' }],
    operator: [{ required: true, message: '操作人不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询施肥溯源列表 */
const getList = async () => {
  loading.value = true;
  const res = await listFertilization(queryParams.value);
  fertilizationList.value = res.rows;
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
  fertilizationFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: FertilizationVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加施肥溯源';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: FertilizationVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getFertilization(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改施肥溯源';
};

/** 提交按钮 */
const submitForm = () => {
  fertilizationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateFertilization(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFertilization(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: FertilizationVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除施肥溯源编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delFertilization(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'block/fertilization/export',
    {
      ...queryParams.value
    },
    `fertilization_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
