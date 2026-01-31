<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="品种" prop="variety">
              <el-input v-model="queryParams.variety" placeholder="请输入品种" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="开始日期" prop="sowingStartDate">
              <el-date-picker
                v-model="queryParams.sowingStartDate"
                clearable
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择预测播种开始日期"
              />
            </el-form-item>
            <el-form-item label="结束日期" prop="sowingEndDate">
              <el-date-picker
                v-model="queryParams.sowingEndDate"
                clearable
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择预测播种结束日期"
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
            <el-button v-hasPermi="['pestcontrol:predict:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pestcontrol:predict:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pestcontrol:predict:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pestcontrol:predict:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="predictList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="基地名" align="center" prop="baseName" />
        <el-table-column label="品种" align="center" prop="variety" />
        <el-table-column label="颜色特征" align="center" prop="grainColorInfo" />
        <el-table-column label="形态特征" align="center" prop="growthFormInfo" />
        <el-table-column label="预测播种开始日期" align="center" prop="sowingStartDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.sowingStartDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预测播种结束日期" align="center" prop="sowingEndDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.sowingEndDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['mizhipestcontrol:predict:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['mizhipestcontrol:predict:remove']"
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改基地播种计划对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="predictFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="基地名" prop="baseName">
          <el-input v-model="form.baseName" placeholder="请输入基地名" />
        </el-form-item>
        <el-form-item label="品种" prop="variety">
          <el-input v-model="form.variety" placeholder="请输入品种" />
        </el-form-item>
        <el-form-item label="开始日期" prop="sowingStartDate">
          <el-date-picker
            v-model="form.sowingStartDate"
            clearable
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择预测播种开始日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="sowingEndDate">
          <el-date-picker
            v-model="form.sowingEndDate"
            clearable
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择预测播种结束日期"
          >
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
  </div>
</template>

<script setup name="Predict" lang="ts">
import { listPredict, getPredict, delPredict, addPredict, updatePredict } from './api';
import { PredictVO, PredictQuery, PredictForm } from './api/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const predictList = ref<PredictVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const predictFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PredictForm = {
  id: undefined,
  baseName: undefined,
  variety: undefined,
  sowingStartDate: undefined,
  sowingEndDate: undefined
};
const data = reactive<PageData<PredictForm, PredictQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: undefined,
    baseName: undefined,
    variety: undefined,
    sowingStartDate: undefined,
    sowingEndDate: undefined,
    createTime: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    baseName: [{ required: true, message: '基地名不能为空', trigger: 'blur' }],
    variety: [{ required: true, message: '品种不能为空', trigger: 'blur' }],
    sowingStartDate: [{ required: true, message: '预测播种开始日期不能为空', trigger: 'blur' }],
    sowingEndDate: [{ required: true, message: '预测播种结束日期不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询基地播种计划列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPredict(queryParams.value);
  predictList.value = res.rows;
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
  predictFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PredictVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加基地播种计划';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: PredictVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getPredict(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改基地播种计划';
};

/** 提交按钮 */
const submitForm = () => {
  predictFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updatePredict(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPredict(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: PredictVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除基地播种计划编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delPredict(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'pestcontrol/predict/export',
    {
      ...queryParams.value
    },
    `predict_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
