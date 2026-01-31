<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地" prop="baseId">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable>
                <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="谷子生育期" prop="growthPeriod" label-width="90px">
              <el-select v-model="queryParams.growthPeriod" placeholder="请选择谷子生育期" clearable>
                <el-option v-for="dict in four_growth_period" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="土壤墒情等级" prop="moistureLevel" class="no-wrap-label">
              <el-select v-model="queryParams.moistureLevel" placeholder="请选择土壤墒情等级" clearable filterable>
                <el-option v-for="dict in soil_moisture_levels" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
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
            <el-button v-hasPermi="['four:soilMoisture:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:soilMoisture:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:soilMoisture:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:soilMoisture:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="soilMoistureList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!--<el-table-column label="墒情数据ID" align="center" prop="fourId" v-if="true" />-->
        <el-table-column label="基地" align="center" prop="baseId" width="170">
          <template #default="scope">
            <dict-tag :options="four_base_name" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="设备编号" align="center" prop="facilityId" />
        <el-table-column align="center" prop="shallowWater">
          <template #header> 0-20cm<br />土壤水分 </template>
        </el-table-column>
        <el-table-column align="center" prop="middleWater">
          <template #header> 20-40cm<br />土壤水分 </template>
        </el-table-column>
        <el-table-column align="center" prop="deepWater">
          <template #header> 40-60cm<br />土壤水分 </template>
        </el-table-column>
        <!-- 表格列修改 -->
        <el-table-column label="谷子生育期" align="center" prop="growthPeriod">
          <template #default="scope">
            <dict-tag :options="four_growth_period" :value="scope.row.growthPeriod" />
          </template>
        </el-table-column>
        <el-table-column label="采集时间" align="center" prop="collectTime" width="150">
          <template #default="scope">
            <span>{{ parseTime(scope.row.collectTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="土壤墒情等级" align="center">
          <template #default="scope">
            <el-tag :type="getSoilMoistureLevel(scope.row.shallowWater).type">
              {{ getSoilMoistureLevel(scope.row.shallowWater).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['four:soilMoisture:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['four:soilMoisture:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改土壤墒情监测数据对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="soilMoistureFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地">
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号" prop="facilityId">
          <el-input v-model="form.facilityId" placeholder="请输入设备编号" />
        </el-form-item>
        <!--<el-form-item label="监测设备位置经度" prop="facilityLongitude">
          <el-input v-model="form.facilityLongitude" placeholder="请输入监测设备位置经度" />
        </el-form-item>-->
        <el-form-item label="0-20cm土壤水分" prop="shallowWater">
          <template #label>
            <div style="line-height: 1.4">0-20cm<br />土壤水分</div>
          </template>
          <el-input v-model="form.shallowWater" placeholder="请输入0-20cm土层土壤水分含量" />
        </el-form-item>
        <el-form-item label="20-40cm土壤水分" prop="shallowWater">
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
        <el-form-item label="0-20cm土壤温度" prop="shallowTemperature">
          <template #label>
            <div style="line-height: 1.4">0-20cm<br />土壤温度</div>
          </template>
          <el-input v-model="form.shallowTemperature" placeholder="请输入0-20cm土层土壤温度" />
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
        </el-form-item>
        <!--<el-form-item label="土壤温度" prop="soilWd">
          <el-input v-model="form.soilWd" placeholder="请输入土壤温度" />
        </el-form-item>-->
        <el-form-item label="土壤电导率" prop="soilDdl">
          <el-input v-model="form.soilDdl" placeholder="请输入土壤电导率" />
        </el-form-item>
        <el-form-item label="土壤pH值" prop="soilPh">
          <el-input v-model="form.soilPh" placeholder="请输入土壤pH值" />
        </el-form-item>
        <el-form-item label="谷子生育期" prop="growthPeriod">
          <el-select v-model="form.growthPeriod" placeholder="请选择谷子生育期">
            <el-option v-for="dict in four_growth_period" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采集时间" prop="collectTime">
          <el-date-picker v-model="form.collectTime" clearable type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择采集时间">
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
  facilityLongitude: undefined,
  shallowWater: undefined,
  middleWater: undefined,
  deepWater: undefined,
  soilWd: undefined,
  soilDdl: undefined,
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
      collectTime: undefined,
      moistureLevel: undefined
    }
  },
  rules: {
    fourId: [{ required: true, message: '主键不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 墒情等级计算逻辑（直接返回中文和颜色类型）
const getSoilMoistureLevel = (water: number) => {
  // 田间持水量为20.5%
  const fieldCapacity = 0.205;
  // 计算土壤相对含水量
  const relativeWater = water / fieldCapacity;

  // 根据陕西省和榆林市标准进行判断
  if (relativeWater > 80) return { label: '过湿', type: 'warning' }; // 过湿
  if (relativeWater >= 60) return { label: '适宜', type: 'success' }; // 适宜
  if (relativeWater >= 50) return { label: '轻旱', type: 'warning' }; // 轻旱
  if (relativeWater >= 40) return { label: '中旱', type: 'danger' }; // 中旱
  return { label: '重旱', type: 'danger' }; // 重旱
};

/** 查询土壤墒情监测数据列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCollectTime.value, 'CollectTime');

  // 获取所有数据（不进行前端过滤）
  const res = await listSoilMoisture({
    ...queryParams.value,
    moistureLevel: undefined // 不传递等级参数到后端
  });

  // 直接使用从接口获取的所有数据
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

// 在组件内部添加土壤墒情等级字典
const soil_moisture_levels = [
  { value: '1', label: '过湿' },
  { value: '2', label: '适宜' },
  { value: '3', label: '轻旱' },
  { value: '4', label: '中旱' },
  { value: '5', label: '重旱' }
];
</script>
<style scoped>
:deep(.no-wrap-label .el-form-item__label) {
  white-space: nowrap;
  margin-left: 20px;
  /* 增加左边距 */
}
</style>
