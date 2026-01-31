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
            <el-form-item label="采集时间" prop="collectTime">
              <el-date-picker clearable v-model="queryParams.collectTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择采集时间" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['four:pestLamp:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['four:pestLamp:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['four:pestLamp:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['four:pestLamp:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="pestLampList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键" align="center" prop="fourId" v-if="false" />
        <el-table-column label="基地" align="center" prop="baseId">
          <template #default="scope">
            <dict-tag :options="four_base_name" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="设备编号" align="center" prop="facilityId" />
        <el-table-column label="大气温度" align="center" prop="airTemperature" />
        <el-table-column label="大气湿度" align="center" prop="airHumidity" />
        <el-table-column label="击虫次数" align="center" prop="pestKills" />
        <el-table-column label="生育期" align="center" prop="growthPeriod">
          <template #default="scope">
            <dict-tag :options="four_growth_period" :value="scope.row.growthPeriod" />
          </template>
        </el-table-column>
        <el-table-column label="采集时间" align="center" prop="collectTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.collectTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['four:pestLamp:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['four:pestLamp:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改杀虫灯数据对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="pestLampFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地">
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号" prop="facilityId">
          <el-input v-model="form.facilityId" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="大气温度" prop="airTemperature">
          <el-input v-model="form.airTemperature" placeholder="请输入大气温度" />
        </el-form-item>
        <el-form-item label="大气湿度" prop="airHumidity">
          <el-input v-model="form.airHumidity" placeholder="请输入大气湿度" />
        </el-form-item>
        <el-form-item label="击虫次数" prop="pestKills">
          <el-input v-model="form.pestKills" placeholder="请输入击虫次数" />
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

<script setup name="PestLamp" lang="ts">
import { listPestLamp, getPestLamp, delPestLamp, addPestLamp, updatePestLamp } from '@/views/four/api/pestLamp';
import { PestLampVO, PestLampQuery, PestLampForm } from '@/views/four/api/pestLamp/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_growth_period, four_base_name } = toRefs<any>(proxy?.useDict('four_growth_period', 'four_base_name'));

const pestLampList = ref<PestLampVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const pestLampFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PestLampForm = {
  fourId: undefined,
  baseId: undefined,
  facilityId: undefined,
  pestKills: undefined,
  airTemperature: undefined,
  airHumidity: undefined,
  growthPeriod: undefined,
  collectTime: undefined,
  remark: undefined
};
const data = reactive<PageData<PestLampForm, PestLampQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    collectTime: undefined,
    params: {}
  },
  rules: {
    fourId: [{ required: true, message: '主键不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '基地不能为空', trigger: 'change' }],
    facilityId: [{ required: true, message: '设备编号不能为空', trigger: 'blur' }],
    airTemperature: [{ required: true, message: '大气温度不能为空', trigger: 'blur' }],
    airHumidity: [{ required: true, message: '大气湿度不能为空', trigger: 'blur' }],
    pestKills: [{ required: true, message: '击虫次数不能为空', trigger: 'blur' }],
    growthPeriod: [{ required: true, message: '谷子生育期不能为空', trigger: 'blur' }],
    collectTime: [{ required: true, message: '采集时间不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询杀虫灯数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPestLamp(queryParams.value);
  pestLampList.value = res.rows;
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
  pestLampFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PestLampVO[]) => {
  ids.value = selection.map((item) => item.fourId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加杀虫灯数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: PestLampVO) => {
  reset();
  const _fourId = row?.fourId || ids.value[0];
  const res = await getPestLamp(_fourId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改杀虫灯数据';
};

/** 提交按钮 */
const submitForm = () => {
  pestLampFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.fourId) {
        await updatePestLamp(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPestLamp(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: PestLampVO) => {
  const _fourIds = row?.fourId || ids.value;
  await proxy?.$modal.confirm('是否确认删除杀虫灯数据编号为"' + _fourIds + '"的数据项？').finally(() => (loading.value = false));
  await delPestLamp(_fourIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'four/pestLamp/export',
    {
      ...queryParams.value
    },
    `pestLamp_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
