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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['four:soilMoisture:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['four:soilMoisture:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['four:soilMoisture:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['four:soilMoisture:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="soilMoistureList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!--<el-table-column label="墒情数据ID" align="center" prop="fourId" v-if="true" />-->
        <el-table-column label="基地" align="center" prop="baseId" width="95">
          <template #default="scope">
            <dict-tag :options="four_base_name" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="设备编号" align="center" prop="facilityId" />
        <el-table-column label="土壤湿度（%）" align="center" prop="shallowWater" />
        <!--<el-table-column align="center" prop="middleWater">
          <template #header> 20-40cm<br />土壤水分 </template>
        </el-table-column>
        <el-table-column align="center" prop="deepWater">
          <template #header> 40-60cm<br />土壤水分 </template>
        </el-table-column>-->
        <el-table-column label="土壤温度（℃）" align="center" prop="shallowTemperature" />
        <!--<el-table-column align="center" prop="middleTemperature">
          <template #header> 20-40cm<br />土壤温度 </template>
        </el-table-column>
        <el-table-column align="center" prop="deepTemperature">
          <template #header> 40-60cm<br />土壤温度 </template>
        </el-table-column>-->
        <el-table-column label="土壤电导率（uS/cm）" align="center" prop="soilDdl" />
        <el-table-column label="土壤盐分（ppm）" align="center" prop="soilYf" />
        <!--<el-table-column label="土壤pH值" align="center" prop="soilPh" />-->
        <el-table-column label="生育期" align="center" prop="growthPeriod">
          <template #default="scope">
            <dict-tag :options="four_growth_period" :value="scope.row.growthPeriod" />
          </template>
        </el-table-column>
        <el-table-column label="采集时间" align="center" prop="collectTime" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.collectTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <!--<el-table-column label="备注" align="center" prop="remark" />-->
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['four:soilMoisture:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['four:soilMoisture:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改土壤墒情监测数据对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="soilMoistureFormRef" :model="form" :rules="rules" label-width="160px">
        <el-form-item label="基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地">
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号" prop="facilityId">
          <el-input v-model="form.facilityId" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="土壤湿度（%）" prop="shallowWater">
          <el-input v-model="form.shallowWater" placeholder="请输入土壤湿度" />
        </el-form-item>
        <!--<el-form-item label="20-40cm土壤水分" prop="shallowWater">
          <template #label>
            <div style="line-height: 1.4">20-40cm<br />土壤水分</div>
          </template>
          <el-input v-model="form.middleWater" placeholder="请输入20-40cm土层土壤水分含量" />
        </el-form-item>
        <el-form-item label="40-60cm土壤水分" prop="shallowWater">
          <template #label>
            <div style="line-height: 1.4">40-60cm<br />土壤水分</div>
          </template>
          <el-input v-model="form.deepWater" placeholder="请输入40-60cm土层土壤水分含量" />
        </el-form-item>
        <el-form-item label="20-40cm土壤温度" prop="shallowTemperature">
          <template #label>
            <div style="line-height: 1.4">20-40cm<br />土壤温度</div>
          </template>
          <el-input v-model="form.middleTemperature" placeholder="请输入20-40cm土层土壤温度" />
        </el-form-item>
        <el-form-item label="40-60cm土壤温度" prop="shallowTemperature">
          <template #label>
            <div style="line-height: 1.4">40-60cm<br />土壤温度</div>
          </template>
          <el-input v-model="form.deepTemperature" placeholder="请输入40-60cm土层土壤温度" />
        </el-form-item>-->
        <el-form-item label="土壤温度（℃）" prop="shallowTemperature">
          <el-input v-model="form.shallowTemperature" placeholder="请输入土壤温度" />
        </el-form-item>
        <el-form-item label="土壤电导率（uS/cm）" prop="soilDdl">
          <el-input v-model="form.soilDdl" placeholder="请输入土壤电导率" />
        </el-form-item>
        <el-form-item label="土壤盐分（ppm）" prop="soilYf">
          <el-input v-model="form.soilYf" placeholder="请输入土壤盐分" />
        </el-form-item>
        <!--<el-form-item label="土壤pH值" prop="soilPh">
          <el-input v-model="form.soilPh" placeholder="请输入土壤pH值" />
        </el-form-item>-->
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

<script setup name="SoilMoisture" lang="ts">
import { listSoilMoisture, getSoilMoisture, delSoilMoisture, addSoilMoisture, updateSoilMoisture } from '../api/soilMoisture';
import { SoilMoistureVO, SoilMoistureQuery, SoilMoistureForm } from '../api/soilMoisture/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_growth_period, four_base_name } = toRefs<any>(proxy?.useDict('four_growth_period', 'four_base_name'));

const soilMoistureList = ref<SoilMoistureVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCollectTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const soilMoistureFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: SoilMoistureForm = {
  fourId: undefined,
  baseId: undefined,
  facilityId: undefined,
  shallowWater: undefined,
  middleWater: undefined,
  deepWater: undefined,
  soilDdl: undefined,
  soilYf: undefined,
  soilPh: undefined,
  growthPeriod: undefined,
  collectTime: undefined,
  remark: undefined
};
const data = reactive<PageData<SoilMoistureForm, SoilMoistureQuery>>({
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
    fourId: [{ required: true, message: '主键不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询土壤墒情监测数据列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCollectTime.value, 'CollectTime');
  const res = await listSoilMoisture(queryParams.value);
  soilMoistureList.value = res.rows;
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
  soilMoistureFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: SoilMoistureVO[]) => {
  ids.value = selection.map((item) => item.fourId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加土壤墒情监测数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: SoilMoistureVO) => {
  reset();
  const _fourId = row?.fourId || ids.value[0];
  const res = await getSoilMoisture(_fourId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改土壤墒情监测数据';
};

/** 提交按钮 */
const submitForm = () => {
  soilMoistureFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.fourId) {
        await updateSoilMoisture(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSoilMoisture(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: SoilMoistureVO) => {
  const _fourIds = row?.fourId || ids.value;
  await proxy?.$modal.confirm('是否确认删除土壤墒情监测数据编号为"' + _fourIds + '"的数据项？').finally(() => (loading.value = false));
  await delSoilMoisture(_fourIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'four/soilMoisture/export',
    {
      ...queryParams.value
    },
    `soilMoisture_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
