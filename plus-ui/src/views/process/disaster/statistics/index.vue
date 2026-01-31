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
            <el-form-item label="统计月份" prop="statMonth">
              <el-input v-model="queryParams.statMonth" placeholder="请输入统计月份(xxxx年-xx月)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="预警数量" prop="warningCount">
              <el-input v-model="queryParams.warningCount" placeholder="请输入本月预警数量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="解除数量" prop="resolvedCount">
              <el-input v-model="queryParams.resolvedCount" placeholder="请输入本月解除数量" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['disaster:statistics:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['disaster:statistics:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['disaster:statistics:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['disaster:statistics:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="statisticsList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!--        <el-table-column label="主键ID" align="center" prop="id" v-if="true" / -->>
        <el-table-column label="灾害类型" align="center" prop="disasterType">
          <template #default="scope">
            <dict-tag :options="sys_disaster_type" :value="scope.row.disasterType" />
          </template>
        </el-table-column>
        <el-table-column label="统计月份" align="center" prop="statMonth" />
        <el-table-column label="预警数量" align="center" prop="warningCount" />
        <el-table-column label="解除数量" align="center" prop="resolvedCount" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['disaster:statistics:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['disaster:statistics:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改灾害统计分析（按月）对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="statisticsFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="灾害类型" prop="disasterType">
          <el-select v-model="form.disasterType" placeholder="请选择灾害类型">
            <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="统计月份" prop="statMonth">
          <el-input v-model="form.statMonth" placeholder="请输入统计月份" />
        </el-form-item>
        <el-form-item label="预警数量" prop="warningCount">
          <el-input v-model="form.warningCount" placeholder="请输入本月预警数量" />
        </el-form-item>
        <el-form-item label="解除数量" prop="resolvedCount">
          <el-input v-model="form.resolvedCount" placeholder="请输入本月解除数量" />
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

<script setup name="Statistics" lang="ts">
import { listStatistics, getStatistics, delStatistics, addStatistics, updateStatistics } from '@/api/disaster/statistics';
import { StatisticsVO, StatisticsQuery, StatisticsForm } from '@/api/disaster/statistics/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_disaster_type } = toRefs<any>(proxy?.useDict('sys_disaster_type'));

const statisticsList = ref<StatisticsVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const statisticsFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: StatisticsForm = {
  id: undefined,
  disasterType: undefined,
  statMonth: undefined,
  warningCount: undefined,
  resolvedCount: undefined
};
const data = reactive<PageData<StatisticsForm, StatisticsQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    disasterType: undefined,
    statMonth: undefined,
    warningCount: undefined,
    resolvedCount: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    disasterType: [{ required: true, message: '灾害类型不能为空', trigger: 'change' }],
    statMonth: [{ required: true, message: '统计月份不能为空', trigger: 'blur' }],
    warningCount: [{ required: true, message: '本月预警数量不能为空', trigger: 'blur' }],
    resolvedCount: [{ required: true, message: '本月解除数量不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询灾害统计分析（按月）列表 */
const getList = async () => {
  loading.value = true;
  const res = await listStatistics(queryParams.value);
  statisticsList.value = res.rows;
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
  statisticsFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: StatisticsVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加灾害统计分析（按月）';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: StatisticsVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getStatistics(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改灾害统计分析（按月）';
};

/** 提交按钮 */
const submitForm = () => {
  statisticsFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateStatistics(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addStatistics(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: StatisticsVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除灾害统计分析（按月）编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delStatistics(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'disaster/statistics/export',
    {
      ...queryParams.value
    },
    `statistics_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
