<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="地块编号" prop="plotId">
              <el-select v-model="queryParams.plotId" placeholder="请选择地块编号" clearable>
                <el-option v-for="item in landDict" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="是否处理" prop="isProcessed">
              <el-select v-model="queryParams.isProcessed" placeholder="请选择是否处理" clearable>
                <el-option v-for="item in isProcessedDict" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item> -->
            <el-form-item label="生长时期" prop="growthPeriod">
              <el-select v-model="queryParams.growthPeriod" placeholder="请选择生长时期" clearable>
                <el-option v-for="item in growth_diagnose_period" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="预警种类" prop="alertType">
              <el-select v-model="queryParams.alertType" placeholder="请选择预警种类" clearable>
                <el-option
                  v-for="item in alertTypeDict"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item> -->
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
            <el-button v-hasPermi="['process/growth:alert:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['process/growth:alert:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['process/growth:alert:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['process/growth:alert:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="alertList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="主键ID" align="center" prop="id" />
        <el-table-column label="基地编号" align="center" prop="baseId" width="110">
          <template #default="scope">
            <el-tag>{{ getBaseLabel(scope.row.baseId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="地块编号" align="center" prop="plotId">
          <template #default="scope">
            <span>{{ getPlotLabel(scope.row.plotId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预警时间" align="center" prop="actionTime" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.actionTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="生长时期" align="center" prop="growthPeriod">
          <template #default="scope">
            <dict-tag :options="growth_diagnose_period" :value="scope.row.growthPeriod" />
          </template>
        </el-table-column>
        <el-table-column label="预警种类" align="center" prop="alertType">
          <template #default="scope">
            <el-tag :type="getAlertTypeTagType(scope.row.alertType)">
              {{ getAlertTypeLabel(scope.row.alertType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预警信息" align="center" prop="alertInfo" width="400" />
        <el-table-column label="状态" align="center" prop="isProcessed">
          <template #default="scope">
            <el-tag :type="scope.row.isProcessed === 1 ? 'success' : 'danger'">
              {{ scope.row.isProcessed === 1 ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预警等级" align="center" prop="alertLevel">
          <template #default="scope">
            <el-tag :type="getAlertLevelType(scope.row.alertLevel)">
              {{ scope.row.alertLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['growth:alert:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['growth:alert:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改水肥预警信息对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="alertFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="基地编号" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地编号" :disabled="!!form.id" @change="onBaseIdChange">
            <el-option v-for="item in baseDict" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="地块编号" prop="plotId">
          <el-select v-model="form.plotId" placeholder="请选择地块编号">
            <el-option v-for="item in filteredLandDict" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警时间" prop="actionTime">
          <el-date-picker v-model="form.actionTime" clearable type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择预警时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预警信息" prop="alertInfo">
          <el-input v-model="form.alertInfo" placeholder="请输入预警信息" />
        </el-form-item>
        <el-form-item label="预警等级" prop="alertLevel">
          <el-input v-model="form.alertLevel" placeholder="请输入预警等级" />
        </el-form-item>
        <el-form-item label="预警种类" prop="alertType">
          <el-select v-model="form.alertType" placeholder="请选择预警种类">
            <el-option v-for="item in alertTypeDict" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否处理" prop="isProcessed">
          <el-select v-model="form.isProcessed" placeholder="请选择是否处理">
            <el-option v-for="item in isProcessedDict" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="生长时期" prop="growthPeriod">
          <el-select v-model="form.growthPeriod" placeholder="请选择生长时期">
            <el-option v-for="item in growth_diagnose_period" :key="item.value" :label="item.label" :value="item.value" />
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
  </div>
</template>

<script setup name="Alert" lang="ts">
import { Script } from 'vm';
import { listAlert, getAlert, delAlert, addAlert, updateAlert } from './api';
import { AlertVO, AlertQuery, AlertForm } from './api/types';
import { baseDictQuery, landDictQuery } from '@/views/process/growth/api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { growth_diagnose_period } = toRefs<any>(proxy?.useDict('growth_diagnose_period')); // 使用 growth_diagnose_period 字典

// 定义处理状态字典
const isProcessedDict = [
  { label: '未处理', value: '0', elTagType: 'danger' as const },
  { label: '已处理', value: '1', elTagType: 'success' as const }
];

// 定义预警种类字典
const alertTypeDict = [
  { label: '缺水', value: '缺水', elTagType: 'warning' as const },
  { label: '缺肥', value: '缺肥', elTagType: 'danger' as const }
];

const alertList = ref<AlertVO[]>([]);
// 基地和地块字典
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);

// 根据选择的基地过滤地块字典
const filteredLandDict = computed(() => {
  if (!form.value.baseId) {
    return landDict.value;
  }
  // 假设地块字典中的值是以基地ID为前缀的
  return landDict.value.filter((item) => item.value.startsWith(form.value.baseId));
});

// 当基地ID改变时，重置地块ID选择
const onBaseIdChange = () => {
  form.value.plotId = undefined;
};

const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const alertFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: AlertForm = {
  id: undefined,
  baseId: undefined,
  plotId: undefined,
  actionTime: undefined,
  alertInfo: undefined,
  alertLevel: undefined,
  alertType: undefined,
  isProcessed: undefined,
  growthPeriod: undefined
};
const data = reactive<PageData<AlertForm, AlertQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    plotId: undefined,
    actionTime: undefined,
    alertInfo: undefined,
    alertLevel: undefined,
    alertType: undefined,
    isProcessed: undefined,
    growthPeriod: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '基地编号不能为空', trigger: 'blur' }],
    plotId: [{ required: true, message: '地块编号不能为空', trigger: 'blur' }],
    actionTime: [{ required: true, message: '预警时间不能为空', trigger: 'blur' }],
    alertInfo: [{ required: true, message: '预警信息不能为空', trigger: 'blur' }],
    alertLevel: [{ required: true, message: '预警等级不能为空', trigger: 'blur' }],
    alertType: [{ required: true, message: '预警种类不能为空', trigger: 'change' }],
    isProcessed: [{ required: true, message: '是否处理不能为空', trigger: 'blur' }],
    growthPeriod: [{ required: true, message: '生长时期不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询水肥预警信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAlert(queryParams.value);
  alertList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 获取基地和地块字典 */
const getDicts = async () => {
  try {
    // 获取基地字典
    const baseRes = await baseDictQuery();
    baseDict.value =
      baseRes.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];

    // 获取地块字典
    const landRes = await landDictQuery();
    landDict.value =
      landRes.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];
  } catch (err) {
    console.error('获取字典数据失败', err);
  }
};

onMounted(async () => {
  await getDicts();
  getList();
});

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  alertFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 根据基地ID获取基地标签 */
const getBaseLabel = (baseId: string | undefined) => {
  if (!baseId) return '';

  const base = baseDict.value.find((item) => item.value === baseId);
  return base ? base.label : baseId;
};

/** 根据地块ID获取地块标签 */
const getPlotLabel = (plotId: string | undefined) => {
  if (!plotId) return '';

  const plot = landDict.value.find((item) => item.value === plotId);
  return plot ? plot.label : plotId;
};

/** 根据预警等级获取标签类型 */
const getAlertLevelType = (alertLevel: string | undefined) => {
  if (!alertLevel) return '';

  // 根据等级设置对应颜色：'良好'为绿色，'正常'为蓝色，'较差'为红色；'严重'为红色，'中度'为橙色，'轻微'为蓝色。
  if (alertLevel.includes('严重') || alertLevel.includes('较差')) {
    return 'danger';
  } else if (alertLevel.includes('中度')) {
    return 'warning';
  } else if (alertLevel.includes('轻微') || alertLevel.includes('良好')) {
    return 'success';
  } else if (alertLevel.includes('正常')) {
    return 'primary';
  }
  return '';
};

// 获取预警种类标签
const getAlertTypeLabel = (value: string) => {
  if (!value) return '';

  const alertType = alertTypeDict.find((item: any) => item.value === value);
  return alertType ? alertType.label : value;
};

// 获取预警种类标签类型
const getAlertTypeTagType = (value: string) => {
  if (!value) return 'info';

  const alertType = alertTypeDict.find((item: any) => item.value === value);
  return alertType ? alertType.elTagType : 'info';
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: AlertVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加水肥预警信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: AlertVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getAlert(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改水肥预警信息';
};

/** 提交按钮 */
const submitForm = () => {
  alertFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateAlert(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addAlert(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: AlertVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除水肥预警信息编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delAlert(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'process/growth/alert/export',
    {
      ...queryParams.value
    },
    `alert_${new Date().getTime()}.xlsx`
  );
};

/** 根据是否处理值获取标签类型 */
const getIsProcessedType = (value: string | undefined) => {
  if (value === '1') return 'success';
  return 'danger';
};

/** 根据是否处理值获取标签文本 */
const getIsProcessedLabel = (value: string | undefined) => {
  if (value === '1') return '已处理';
  return '未处理';
};
// 获取生长诊断期间标签
const getGrowthDiagnosePeriodLabel = (value: string) => {
  // 添加安全检查，确保 growth_diagnose_period.value 存在
  if (!growth_diagnose_period || !growth_diagnose_period.value) {
    console.warn('growth_diagnose_period 字典数据未加载');
    return value;
  }

  const period = growth_diagnose_period.value.find((item: any) => item.value === value);
  return period ? period.label : value;
};

// 根据生长诊断期间标签获取值
const getGrowthDiagnosePeriodValue = (label: string) => {
  // 添加安全检查，确保 growth_diagnose_period.value 存在
  if (!growth_diagnose_period || !growth_diagnose_period.value) {
    console.warn('growth_diagnose_period 字典数据未加载');
    return '';
  }

  const period = growth_diagnose_period.value.find((item: any) => item.label === label);
  return period ? period.value : '';
};
</script>
