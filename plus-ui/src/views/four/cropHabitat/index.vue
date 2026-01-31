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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['four:cropHabitat:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['four:cropHabitat:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['four:cropHabitat:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['four:cropHabitat:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="cropHabitatList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!--<el-table-column label="主键" align="center" prop="fourId" v-if="true" />-->
        <el-table-column label="基地" align="center" prop="baseId" width="170">
          <template #default="scope">
            <dict-tag :options="four_base_name" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="设备编号" align="center" prop="facilityId" />
        <el-table-column label="视频文件存放位置" align="center" prop="fileLocation" width="190" />
        <el-table-column label="作物种类" align="center" prop="cropType" />
        <el-table-column label="生长状态" align="center" prop="growthStatus" />
        <el-table-column label="受害状态" align="center" prop="victimizeStatus" />
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
        <!--<el-table-column label="扩展字段1" align="center" prop="ext1" />
        <el-table-column label="扩展字段2" align="center" prop="ext2" />
        <el-table-column label="扩展字段3" align="center" prop="ext3" />
        <el-table-column label="扩展字段4" align="center" prop="ext4" />
        <el-table-column label="扩展字段5" align="center" prop="ext5" />
        <el-table-column label="扩展字段6" align="center" prop="ext6" />-->
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['four:cropHabitat:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['four:cropHabitat:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改作物生境监测数据对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="cropHabitatFormRef" :model="form" :rules="rules" label-width="125px">
        <el-form-item label="基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地">
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号" prop="facilityId">
          <el-input v-model="form.facilityId" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="视频文件存放位置" prop="fileLocation">
          <el-input v-model="form.fileLocation" placeholder="请输入视频文件存放位置" />
        </el-form-item>
        <el-form-item label="作物种类" prop="cropType">
          <el-input v-model="form.cropType" placeholder="请输入作物种类" />
        </el-form-item>
        <el-form-item label="生长状态" prop="growthStatus">
          <el-input v-model="form.growthStatus" placeholder="请输入生长状态" />
        </el-form-item>
        <el-form-item label="受害状态" prop="victimizeStatus">
          <el-input v-model="form.victimizeStatus" placeholder="请输入受害状态" />
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
        <!--<el-form-item label="扩展字段1" prop="ext1">
          <el-input v-model="form.ext1" placeholder="请输入扩展字段1" />
        </el-form-item>
        <el-form-item label="扩展字段2" prop="ext2">
          <el-input v-model="form.ext2" placeholder="请输入扩展字段2" />
        </el-form-item>
        <el-form-item label="扩展字段3" prop="ext3">
          <el-input v-model="form.ext3" placeholder="请输入扩展字段3" />
        </el-form-item>
        <el-form-item label="扩展字段4" prop="ext4">
          <el-input v-model="form.ext4" placeholder="请输入扩展字段4" />
        </el-form-item>
        <el-form-item label="扩展字段5" prop="ext5">
          <el-input v-model="form.ext5" placeholder="请输入扩展字段5" />
        </el-form-item>
        <el-form-item label="扩展字段6" prop="ext6">
          <el-input v-model="form.ext6" placeholder="请输入扩展字段6" />
        </el-form-item>-->
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

<script setup name="CropHabitat" lang="ts">
import { listCropHabitat, getCropHabitat, delCropHabitat, addCropHabitat, updateCropHabitat } from '../api/cropHabitat';
import { CropHabitatVO, CropHabitatQuery, CropHabitatForm } from '../api/cropHabitat/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_growth_period, four_base_name } = toRefs<any>(proxy?.useDict('four_growth_period', 'four_base_name'));

const cropHabitatList = ref<CropHabitatVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCollectTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const cropHabitatFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: CropHabitatForm = {
  fourId: undefined,
  baseId: undefined,
  facilityId: undefined,
  fileLocation: undefined,
  cropType: undefined,
  growthStatus: undefined,
  victimizeStatus: undefined,
  growthPeriod: undefined,
  collectTime: undefined,
  ext1: undefined,
  ext2: undefined,
  ext3: undefined,
  ext4: undefined,
  ext5: undefined,
  ext6: undefined,
  remark: undefined
};
const data = reactive<PageData<CropHabitatForm, CropHabitatQuery>>({
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
    fourId: [{ required: true, message: '主键不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '基地不能为空', trigger: 'change' }],
    facilityId: [{ required: true, message: '设备编号不能为空', trigger: 'blur' }],
    growthPeriod: [{ required: true, message: '谷子生育期不能为空', trigger: 'change' }],
    collectTime: [{ required: true, message: '上传时间不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询作物生境监测数据列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCollectTime.value, 'CollectTime');
  const res = await listCropHabitat(queryParams.value);
  cropHabitatList.value = res.rows;
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
  cropHabitatFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: CropHabitatVO[]) => {
  ids.value = selection.map((item) => item.fourId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加作物生境监测数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: CropHabitatVO) => {
  reset();
  const _fourId = row?.fourId || ids.value[0];
  const res = await getCropHabitat(_fourId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改作物生境监测数据';
};

/** 提交按钮 */
const submitForm = () => {
  cropHabitatFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.fourId) {
        await updateCropHabitat(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCropHabitat(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: CropHabitatVO) => {
  const _fourIds = row?.fourId || ids.value;
  await proxy?.$modal.confirm('是否确认删除作物生境监测数据编号为"' + _fourIds + '"的数据项？').finally(() => (loading.value = false));
  await delCropHabitat(_fourIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'four/cropHabitat/export',
    {
      ...queryParams.value
    },
    `cropHabitat_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
