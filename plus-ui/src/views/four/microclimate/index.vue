<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地" prop="baseId" v-has-roles="['superadmin', 'sysadmin', 'govadmin']">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable>
                <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="设备编号" prop="facilityId">
              <el-input v-model="queryParams.facilityId" placeholder="请输入设备编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="生育期" prop="growthPeriod" label-width="90px">
              <el-select v-model="queryParams.growthPeriod" placeholder="请选择谷子生育期" clearable>
                <el-option v-for="dict in four_growth_period" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="采集时间" style="width: 308px">
              <el-date-picker
                v-model="dateRangeCollectTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['four:microclimate:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['four:microclimate:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['four:microclimate:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['four:microclimate:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="microclimateList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!--<el-table-column label="小气候数据" align="center" prop="fourId" v-if="true" />-->
        <el-table-column label="基地" align="center" prop="baseId" width="95">
          <template #default="scope">
            <dict-tag :options="four_base_name" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="设备编号" align="center" prop="facilityId" />
        <el-table-column label="空气温度（℃）" align="center" prop="airTemperature" />
        <el-table-column label="空气湿度（%）" align="center" prop="airHumidity" />
        <el-table-column label="光照强度（lux）" align="center" prop="lightIntensity" />
        <el-table-column label="二氧化碳浓度（ppm）" align="center" prop="carbonDensity" width="110" />
        <el-table-column label="风速（m/s）" align="center" prop="windSpeed" />
        <el-table-column label="风向" align="center" prop="windDirection" />
        <el-table-column label="降雨量（mm）" align="center" prop="rainfall" />
        <el-table-column label="大气压强（hpa）" align="center" prop="atmosPressure" />
        <el-table-column label="土壤温度（℃）" align="center" prop="soilTemperature" />
        <el-table-column label="土壤湿度（%）" align="center" prop="soilHumidity" />
        <el-table-column label="生育期" align="center" prop="growthPeriod" width="90">
          <template #default="scope">
            <dict-tag :options="four_growth_period" :value="scope.row.growthPeriod" />
          </template>
        </el-table-column>
        <el-table-column label="采集时间" align="center" prop="collectTime" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.collectTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <!--<el-table-column label="是否有效" align="center" prop="isValid" />-->
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['four:microclimate:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['four:microclimate:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改小气候气象数据对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="microclimateFormRef" :model="form" :rules="rules" label-width="160px">
        <el-form-item label="基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地">
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号" prop="facilityId">
          <el-input v-model="form.facilityId" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="空气温度（℃）" prop="airTemperature">
          <el-input v-model="form.airTemperature" placeholder="请输入空气温度" />
        </el-form-item>
        <el-form-item label="空气湿度（%）" prop="airHumidity">
          <el-input v-model="form.airHumidity" placeholder="请输入空气湿度" />
        </el-form-item>
        <el-form-item label="光照强度（lux）" prop="lightIntensity">
          <el-input v-model="form.lightIntensity" placeholder="请输入光照强度" />
        </el-form-item>
        <el-form-item label="二氧化碳浓度（ppm）" prop="carbonDensity">
          <el-input v-model="form.carbonDensity" placeholder="请输入二氧化碳浓度" />
        </el-form-item>
        <el-form-item label="风速（m/s）" prop="windSpeed">
          <el-input v-model="form.windSpeed" placeholder="请输入风速" />
        </el-form-item>
        <el-form-item label="风向" prop="windDirection">
          <el-input v-model="form.windDirection" placeholder="请输入风向" />
        </el-form-item>
        <el-form-item label="降雨量（mm）" prop="rainfall">
          <el-input v-model="form.rainfall" placeholder="请输入降雨量" />
        </el-form-item>
        <el-form-item label="大气压强（hpa）" prop="atmosPressure">
          <el-input v-model="form.atmosPressure" placeholder="请输入大气压强" />
        </el-form-item>
        <el-form-item label="土壤温度（℃）" prop="soilTemperature">
          <el-input v-model="form.soilTemperature" placeholder="请输入土壤温度" />
        </el-form-item>
        <el-form-item label="土壤湿度（%）" prop="soilHumidity">
          <el-input v-model="form.soilHumidity" placeholder="请输入土壤湿度" />
        </el-form-item>
        <el-form-item label="生育期" prop="growthPeriod">
          <el-select v-model="form.growthPeriod" placeholder="请选择谷子生育期">
            <el-option v-for="dict in four_growth_period" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采集时间" prop="collectTime">
          <el-date-picker clearable v-model="form.collectTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择采集时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <!--<el-form-item label="是否有效" prop="isValid">
          <el-input v-model="form.isValid" placeholder="请输入是否有效" />
        </el-form-item>-->
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

<script setup name="Microclimate" lang="ts">
import { listMicroclimate, getMicroclimate, delMicroclimate, addMicroclimate, updateMicroclimate } from '../api/microclimate';
import { MicroclimateVO, MicroclimateQuery, MicroclimateForm } from '../api/microclimate/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_growth_period, four_base_name } = toRefs<any>(proxy?.useDict('four_growth_period', 'four_base_name'));

const microclimateList = ref<MicroclimateVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCollectTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const microclimateFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MicroclimateForm = {
  fourId: undefined,
  baseId: undefined,
  facilityId: undefined,
  airTemperature: undefined,
  airHumidity: undefined,
  lightIntensity: undefined,
  carbonDensity: undefined,
  windSpeed: undefined,
  windDirection: undefined,
  rainfall: undefined,
  atmosPressure: undefined,
  soilTemperature: undefined,
  soilHumidity: undefined,
  growthPeriod: undefined,
  collectTime: undefined,
  remark: undefined,
  isValid: undefined
};
const data = reactive<PageData<MicroclimateForm, MicroclimateQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    facilityId: undefined,
    growthPeriod: undefined,
    params: {
      collectTime: undefined
    }
  },
  rules: {
    fourId: [{ required: true, message: '小气候数据不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询小气候气象数据列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCollectTime.value, 'CollectTime');
  const res = await listMicroclimate(queryParams.value);
  microclimateList.value = res.rows;
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
  microclimateFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangeCollectTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: MicroclimateVO[]) => {
  ids.value = selection.map((item) => item.fourId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加小气候气象数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: MicroclimateVO) => {
  reset();
  const _fourId = row?.fourId || ids.value[0];
  const res = await getMicroclimate(_fourId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改小气候气象数据';
};

/** 提交按钮 */
const submitForm = () => {
  microclimateFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.fourId) {
        await updateMicroclimate(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addMicroclimate(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: MicroclimateVO) => {
  const _fourIds = row?.fourId || ids.value;
  await proxy?.$modal.confirm('是否确认删除小气候气象数据编号为"' + _fourIds + '"的数据项？').finally(() => (loading.value = false));
  await delMicroclimate(_fourIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'four/microclimate/export',
    {
      ...queryParams.value
    },
    `microclimate_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
