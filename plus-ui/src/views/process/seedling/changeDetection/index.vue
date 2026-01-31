<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地名称" prop="baseName">
              <el-input v-model="queryParams.baseName" placeholder="请输入基地名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="地块名称" prop="landCode">
              <el-input v-model="queryParams.landCode" placeholder="请输入地块名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="年份" prop="year">
              <el-select v-model="selectedYear" placeholder="请选择年份" clearable style="width: 140px" @change="handleQuery">
                <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
              </el-select>
            </el-form-item>
            <el-form-item label="地块面积" prop="landAreaMu">
              <el-input v-model="queryParams.landAreaMu" placeholder="请输入地块面积" clearable @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['pestcontrol:changeAnalysis:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pestcontrol:changeAnalysis:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['pestcontrol:changeAnalysis:remove']"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pestcontrol:changeAnalysis:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="changeAnalysisList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="对比年份" align="center">
          <template #default="scope">
            {{ getYearRange(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="基地名称" align="center" prop="baseName" />
        <el-table-column label="地块名称" align="center" prop="landCode" />
        <el-table-column label="种植面积（持平）/亩" align="center" prop="landAreaMu" :formatter="formatNumber" />
        <el-table-column label="种植面积（同比增加）/亩" align="center" prop="increasedAreaMu" :formatter="formatNumber" />
        <el-table-column label="种植面积（同比减少）/亩" align="center" prop="decreasedAreaMu" :formatter="formatNumber" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                v-hasPermi="['mizhipestcontrol:changeAnalysis:edit']"
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['mizhipestcontrol:changeAnalysis:remove']"
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
    <!-- 添加或修改土地变化分析对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="changeAnalysisFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="基地ID" prop="baseId">
          <el-input v-model="form.baseId" placeholder="请输入基地ID" />
        </el-form-item>
        <el-form-item label="基地名称" prop="baseName">
          <el-input v-model="form.baseName" placeholder="请输入基地名称" />
        </el-form-item>
        <el-form-item label="地块ID" prop="landId">
          <el-input v-model="form.landId" placeholder="请输入地块ID" />
        </el-form-item>
        <el-form-item label="地块编码" prop="landCode">
          <el-input v-model="form.landCode" placeholder="请输入地块编码" />
        </el-form-item>
        <el-form-item label="地块面积" prop="landAreaMu">
          <el-input v-model="form.landAreaMu" placeholder="请输入地块面积" />
        </el-form-item>
        <el-form-item label="新增面积" prop="increasedAreaMu">
          <el-input v-model="form.increasedAreaMu" placeholder="请输入新增面积" />
        </el-form-item>
        <el-form-item label="减少面积" prop="decreasedAreaMu">
          <el-input v-model="form.decreasedAreaMu" placeholder="请输入减少面积" />
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

<script setup name="ChangeAnalysis" lang="ts">
import { listChangeAnalysis, getChangeAnalysis, delChangeAnalysis, addChangeAnalysis, updateChangeAnalysis } from './api/index';
import { ChangeAnalysisVO, ChangeAnalysisQuery, ChangeAnalysisForm } from './api/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const changeAnalysisList = ref<ChangeAnalysisVO[]>([]);
const allChangeAnalysisList = ref<ChangeAnalysisVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const selectedYear = ref<string | undefined>(undefined);

const queryFormRef = ref<ElFormInstance>();
const changeAnalysisFormRef = ref<ElFormInstance>();
//确保表格中展示的数据为四位小数
const formatNumber = (row, column, cellValue, index) => {
  if (cellValue === null || cellValue === undefined) return '0.0000';
  return Number(cellValue).toFixed(4);
};

// 年份选项（从数据中提取唯一年份）
const yearOptions = computed(() => {
  const years = new Set<string>();
  allChangeAnalysisList.value.forEach((item) => {
    if (item.createTime) {
      const y = new Date(item.createTime.replace(/-/g, '/')).getFullYear();
      years.add(String(y));
    }
  });
  return Array.from(years).sort((a, b) => Number(b) - Number(a));
});

// 根据创建时间生成“前年-当年”对比年份文本
const getYearRange = (createTime?: string) => {
  if (!createTime) return '';
  const date = new Date(createTime.replace(/-/g, '/'));
  const currentYear = date.getFullYear();
  const prevYear = currentYear - 1;
  return `${prevYear}-${currentYear}`;
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ChangeAnalysisForm = {
  id: undefined,
  baseId: undefined,
  baseName: undefined,
  landId: undefined,
  landCode: undefined,
  landAreaMu: undefined,
  increasedAreaMu: undefined,
  decreasedAreaMu: undefined
};
const data = reactive<PageData<ChangeAnalysisForm, ChangeAnalysisQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: undefined,
    baseId: undefined,
    baseName: undefined,
    landId: undefined,
    landCode: undefined,
    landAreaMu: undefined,
    increasedAreaMu: undefined,
    decreasedAreaMu: undefined,
    createTime: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID，自增不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '基地ID不能为空', trigger: 'blur' }],
    baseName: [{ required: true, message: '基地名称不能为空', trigger: 'blur' }],
    landId: [{ required: true, message: '地块ID不能为空', trigger: 'blur' }],
    landCode: [{ required: true, message: '地块编码不能为空', trigger: 'blur' }],
    landAreaMu: [{ required: true, message: '地块原始面积不能为空', trigger: 'blur' }],
    increasedAreaMu: [{ required: true, message: '新增面积不能为空', trigger: 'blur' }],
    decreasedAreaMu: [{ required: true, message: '减少面积不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询土地变化分析列表 */
const getList = async () => {
  loading.value = true;
  const res = await listChangeAnalysis(queryParams.value);
  allChangeAnalysisList.value = res.rows;
  applyYearFilter();
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
  changeAnalysisFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  selectedYear.value = undefined;
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: ChangeAnalysisVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

// 按年份筛选展示数据
const applyYearFilter = () => {
  if (!selectedYear.value) {
    changeAnalysisList.value = allChangeAnalysisList.value;
    total.value = allChangeAnalysisList.value.length;
    return;
  }
  changeAnalysisList.value = allChangeAnalysisList.value.filter((item) => {
    if (!item.createTime) return false;
    const y = new Date(item.createTime.replace(/-/g, '/')).getFullYear();
    return String(y) === selectedYear.value;
  });
  total.value = changeAnalysisList.value.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加土地变化分析';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ChangeAnalysisVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getChangeAnalysis(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改土地变化分析';
};

/** 提交按钮 */
const submitForm = () => {
  changeAnalysisFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateChangeAnalysis(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addChangeAnalysis(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ChangeAnalysisVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除土地变化分析编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delChangeAnalysis(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'pestcontrol/changeAnalysis/export',
    {
      ...queryParams.value
    },
    `changeAnalysis_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
