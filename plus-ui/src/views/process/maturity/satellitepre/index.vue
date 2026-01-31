<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="诊断时间" prop="diagnosisTime">
              <el-date-picker v-model="queryParams.diagnosisTime" clearable type="date" value-format="YYYY-MM-DD" placeholder="请选择诊断时间" />
            </el-form-item>
            <el-form-item label="生育期" prop="period">
              <el-input v-model="queryParams.period" placeholder="请输入生育期" clearable @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['ripeness:data:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['ripeness:data:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['ripeness:data:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['ripeness:data:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <!--          <el-col :span="1.5">-->
          <!--            <el-button @click="satellite">注入</el-button>-->
          <!--          </el-col>-->
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="诊断时间" align="center" prop="diagnosisTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.diagnosisTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="生育期" align="center" prop="period" />
        <el-table-column label="输入图像URL" align="center" prop="inputImageUrl" />
        <el-table-column label="预测GJSON文件URL" align="center" prop="predictGjsonUrl" />
        <el-table-column label="预测结果JSON文件URL" align="center" prop="predictResultJsonUrl" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['ripeness:data:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['ripeness:data:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改成熟度检测（卫星）对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="dataFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="诊断时间" prop="diagnosisTime">
          <el-date-picker v-model="form.diagnosisTime" clearable type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择诊断时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="生育期" prop="period">
          <el-input v-model="form.period" placeholder="请输入生育期" />
        </el-form-item>
        <el-form-item label="输入图像OSS路径" prop="inputImageOss">
          <el-input v-model="form.inputImageOss" placeholder="请输入输入图像OSS路径" />
        </el-form-item>
        <el-form-item label="输入图像URL" prop="inputImageUrl">
          <el-input v-model="form.inputImageUrl" placeholder="请输入输入图像URL" />
        </el-form-item>
        <el-form-item label="预测GJSON文件URL" prop="predictGjsonUrl">
          <el-input v-model="form.predictGjsonUrl" placeholder="请输入预测GJSON文件URL" />
        </el-form-item>
        <el-form-item label="预测结果JSON文件URL" prop="predictResultJsonUrl">
          <el-input v-model="form.predictResultJsonUrl" placeholder="请输入预测结果JSON文件URL" />
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

<script setup name="Data" lang="ts">
import { listData, getData, delData, addData, updateData } from '@/views/process/maturity/satellitepre/api';
import { DataVO, DataQuery, DataForm } from '@/views/process/maturity/satellitepre/api/type';
import { ForecastForm } from '@/views/process/maturity/forecast/api/types';
import { addWaf, listWaf, updateWaf } from '@/views/process/maturity/alert/api';
import { WafForm } from '@/views/process/maturity/alert/api/types';
import { queryWeather } from '@/views/process/maturity/api';
import { listWarning } from '@/api/disaster/warning';
import dayjs from 'dayjs';
import { getHarvestSuggestion } from '@/views/process/maturity/utils/harvestingRecommendations';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const dataList = ref<DataVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const dataFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DataForm = {
  id: undefined,
  diagnosisTime: undefined,
  period: undefined,
  inputImageOss: undefined,
  inputImageUrl: undefined,
  predictGjsonUrl: undefined,
  predictResultJsonUrl: undefined,
  taskStatus: undefined
};
const data = reactive<PageData<DataForm, DataQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    diagnosisTime: undefined,
    period: undefined,
    inputImageOss: undefined,
    inputImageUrl: undefined,
    predictGjsonUrl: undefined,
    predictResultJsonUrl: undefined,
    taskStatus: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    diagnosisTime: [{ required: true, message: '诊断时间不能为空', trigger: 'blur' }],
    period: [{ required: true, message: '生育期不能为空', trigger: 'blur' }],
    inputImageOss: [{ required: true, message: '输入图像OSS路径不能为空', trigger: 'blur' }],
    inputImageUrl: [{ required: true, message: '输入图像URL不能为空', trigger: 'blur' }],
    predictGjsonUrl: [{ required: true, message: '预测GJSON文件URL不能为空', trigger: 'blur' }],
    predictResultJsonUrl: [{ required: true, message: '预测结果JSON文件URL不能为空', trigger: 'blur' }],
    taskStatus: [{ required: true, message: '任务状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询成熟度检测（卫星）列表 */
const getList = async () => {
  loading.value = true;
  const res = await listData(queryParams.value);
  dataList.value = res.rows;
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
  dataFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: DataVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加成熟度检测（卫星）';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: DataVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getData(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改成熟度检测（卫星）';
};

/** 提交按钮 */
const submitForm = () => {
  dataFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateData(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addData(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: DataVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除成熟度检测（卫星）编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delData(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'ripeness/data/export',
    {
      ...queryParams.value
    },
    `data_${new Date().getTime()}.xlsx`
  );
};

import { baseDictQuery } from '@/views/process/maturity/api/tableDict';
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo';
// 基地和地块字典
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);

/** 根据地块ID获取地块标签 */
const getPlotLabel = (landCode: string | undefined) => {
  if (!landCode) return '';

  const plot = landDict.value.find((item) => item.label === landCode);
  return plot ? plot.value : landCode;
};

/** 获取基地名称标签 */
const getBaseNameLabel = (baseLabel: string | undefined) => {
  if (!baseLabel) return '';

  const baseOption = baseDict.value.find((option) => option.label === baseLabel);
  return baseOption ? baseOption.value : baseLabel;
};
/** 获取基地和地块字典 */
const getDicts = async () => {
  try {
    // 获取基地字典
    const baseRes = await baseDictQuery();
    console.log(baseRes);
    baseDict.value =
      baseRes.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];

    // 获取地块字典 - 使用新的接口
    const landRes = await fetchFarmerLands({});
    console.log(landRes);
    landDict.value =
      landRes.rows?.map((item) => ({
        value: String(item.landId),
        label: String(item.landCode)
      })) || [];
  } catch (err) {
    console.error('获取字典数据失败', err);
  }
};
// 响应式数据存储天气数据
const weatherData = ref([]);
const satellite = async () => {
  // 加载卫星数据
  const satelliteResponse = await fetch('/map-json/B_filled.geojson');
  const satelliteData = await satelliteResponse.json();

  // 遍历 features 数组
  for (const feature of satelliteData.features) {
    // 这里根据你的业务提取需要的字段
    console.log(feature);
    const ripenessStatus = feature.properties.maturity;

    // 生成收获建议
    const suggestion = await generateHarvestSuggestion(ripenessStatus);
    console.log(suggestion);
    const plot_name = feature.properties.block_name;
    // 同步记录
    await syncWafRecord(ripenessStatus, plot_name, suggestion);
  }
};

const generateHarvestSuggestion = async (ripenessStatus: string): Promise<string> => {
  const res = await queryWeather();
  if (res.code !== 200) throw new Error('天气接口异常');
  weatherData.value = res.data.forecast.forecastData.slice(0, 7);
  const currentWeather = weatherData.value[0]?.weatherLabel || '';
  const maturityLevel = ripenessStatus;

  const response1 = await listWarning({ pageNum: 1, pageSize: 10 });
  const disaster = response1.rows[0];
  const issueTime = dayjs(disaster.issueTime);
  const now = dayjs();
  const diffInHours = now.diff(issueTime, 'hour');
  const disasterStatus = diffInHours <= 48 ? warningLevelMap[disaster.warningLevel] : '无灾害';
  return getHarvestSuggestion(maturityLevel, currentWeather, disasterStatus, weatherData.value);
};

const syncWafRecord = async (ripenessStatus: string, plot_name: string, suggestion: string) => {
  const basename = plot_name.startsWith('高硷')
    ? plot_name.substring(0, plot_name.length - 3) + '村基地'
    : plot_name.substring(0, plot_name.length - 3) + '基地';

  const baseId = getBaseNameLabel(basename);

  const plotId = getPlotLabel(plot_name);

  const existResp = await listWaf({
    baseId: baseId,
    plotId: plotId
  });

  const rows = existResp.data?.rows || existResp.data || [];
  const exist = rows.length > 0;
  const existId = exist ? rows[0].id : null;

  const wafData: WafForm = {
    baseId: baseId,
    plotId: plotId,
    alertTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    alertInfo: suggestion,
    isProcessed: 0,
    device: '卫星'
  };

  if (exist && existId && ripenessStatus === '成熟') {
    wafData.id = existId;
    await updateWaf(wafData);
  } else if (ripenessStatus === '成熟') {
    await addWaf(wafData);
  }
};

onMounted(() => {
  getList();
  getDicts();
});
</script>
