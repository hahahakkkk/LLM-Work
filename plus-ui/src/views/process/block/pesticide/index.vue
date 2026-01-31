<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="溯源码" prop="traceCode">
              <el-input v-model="queryParams.traceCode" placeholder="请输入溯源码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="地块信息" prop="plotInfo">
              <el-input v-model="queryParams.plotInfo" placeholder="请输入地块信息" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="农药名称" prop="pesticideName">
              <el-input v-model="queryParams.pesticideName" placeholder="请输入农药名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>

            <!-- 新增打药计量搜索字段 -->
            <el-form-item label="打药计量" prop="pesticideDosage">
              <el-input v-model="queryParams.pesticideDosage" placeholder="请输入打药计量" clearable @keyup.enter="handleQuery" />
            </el-form-item>

            <el-form-item label="打药时间" prop="pesticideTime">
              <el-input v-model="queryParams.pesticideTime" placeholder="请输入打药时间" clearable @keyup.enter="handleQuery" />
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
      <el-table v-loading="loading" :data="pesticideList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <!-- <el-table-column label="打药记录ID" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="溯源码" align="center" prop="traceCode" />
        <el-table-column label="地块信息" align="center" prop="plotInfo" />
        <el-table-column label="农药名称" align="center" prop="pesticideName" />
        <el-table-column label="打药时间" align="center" prop="pesticideTime" />

        <!-- 新增打药计量列 -->
        <el-table-column label="打药计量" align="center">
          <template #default="scope"> {{ scope.row.pesticideDosage }} ml/亩 </template>
        </el-table-column>

        <el-table-column label="操作人" align="center" prop="operator" />
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 添加或修改打药溯源对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="pesticideFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="溯源码" prop="traceCode">
          <el-input v-model="form.traceCode" placeholder="请输入溯源码" />
        </el-form-item>
        <el-form-item label="地块信息" prop="plotInfo">
          <el-input v-model="form.plotInfo" placeholder="请输入地块信息" />
        </el-form-item>
        <el-form-item label="农药名称" prop="pesticideName">
          <el-input v-model="form.pesticideName" placeholder="请输入农药名称" />
        </el-form-item>

        <!-- 新增打药计量字段 -->
        <el-form-item label="打药计量" prop="pesticideDosage">
          <el-input v-model="form.pesticideDosage" placeholder="请输入打药计量" />
        </el-form-item>

        <el-form-item label="打药时间" prop="pesticideTime">
          <el-input v-model="form.pesticideTime" placeholder="请输入打药时间" />
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

<script setup name="Pesticide" lang="ts">
import { listPesticide, getPesticide, delPesticide, addPesticide, updatePesticide } from '@/views/process/api/block/pesticide';
import { PesticideVO, PesticideQuery, PesticideForm } from '@/views/process/api/block/pesticide/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const pesticideList = ref<PesticideVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const pesticideFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PesticideForm = {
  id: undefined,
  traceCode: undefined,
  plotInfo: undefined,
  pesticideName: undefined,
  pesticideDosage: undefined,
  pesticideTime: undefined,
  operator: undefined
};

const data = reactive<PageData<PesticideForm, PesticideQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    traceCode: undefined,
    plotInfo: undefined,
    pesticideName: undefined,
    pesticideDosage: undefined,
    pesticideTime: undefined,
    operator: undefined,
    params: {}
  },
  rules: {
    // id: [{ required: true, message: '打药记录ID不能为空', trigger: 'blur' }],
    traceCode: [{ required: true, message: '溯源码不能为空', trigger: 'blur' }],
    plotInfo: [{ required: true, message: '地块信息不能为空', trigger: 'blur' }],
    pesticideName: [{ required: true, message: '农药名称不能为空', trigger: 'blur' }],
    pesticideDosage: [
      // 新增验证规则
      { required: true, message: '打药计量不能为空', trigger: 'blur' },
      { pattern: /^\d+(\.\d+)?$/, message: '打药计量必须为数字', trigger: 'blur' }
    ],
    pesticideTime: [{ required: true, message: '打药时间不能为空', trigger: 'blur' }],
    operator: [{ required: true, message: '操作人不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询打药溯源列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPesticide(queryParams.value);
  pesticideList.value = res.rows;
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
  pesticideFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PesticideVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加打药溯源';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: PesticideVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getPesticide(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改打药溯源';
};

/** 提交按钮 */
const submitForm = () => {
  pesticideFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updatePesticide(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPesticide(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: PesticideVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除打药溯源编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delPesticide(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'block/pesticide/export',
    {
      ...queryParams.value
    },
    `pesticide_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
