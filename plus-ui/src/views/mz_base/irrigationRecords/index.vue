<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="灌溉日期" prop="irrigationTimes">
              <el-date-picker
                clearable
                v-model="queryParams.irrigationTimes"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>

            <el-form-item label="灌溉地块" prop="landId">
              <el-select v-model="queryParams.landId" placeholder="请选择灌溉地块" clearable filterable>
                <el-option v-for="dict in landDict.filter((it) => it.isValid === 1)" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="灌溉方式" prop="irrigationMethod">
              <el-select v-model="queryParams.irrigationMethod" placeholder="请选择灌溉方式" clearable>
                <el-option v-for="dict in irrigation_method" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:irrigationRecords:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:irrigationRecords:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
              v-hasPermi="['mz_base:irrigationRecords:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="upload" @click="handleImport" v-hasPermi="['mz_base:irrigationRecords:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:irrigationRecords:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="irrigationRecordsList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="灌溉记录ID" align="center" prop="irrigationId" v-if="false" />

        <el-table-column label="灌溉时间" align="center" prop="irrigationTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.irrigationTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="灌溉地块" align="center" prop="landId">
          <template #default="scope">
            <dict-tag :options="landDict" :value="scope.row.landId" />
          </template>
        </el-table-column>
        <el-table-column label="灌溉能力" align="center" prop="irrigationCapacity" v-if="false">
          <template #default="scope">
            <dict-tag :options="irrigation_capacity" :value="scope.row.irrigationCapacity" />
          </template>
        </el-table-column>
        <el-table-column label="灌溉方式" align="center" prop="irrigationMethod">
          <template #default="scope">
            <dict-tag :options="irrigation_method" :value="scope.row.irrigationMethod" />
          </template>
        </el-table-column>
        <el-table-column label="灌溉总量(方)" align="center" prop="irrigationAmount" />
        <el-table-column label="操作人类型" align="center" prop="operatorType" v-if="false">
          <template #default="scope">
            <dict-tag :options="user_type" :value="scope.row.operatorType" />
          </template>
        </el-table-column>
        <!-- 新增合并后的采购人列 -->
        <el-table-column label="操作人" align="center" prop="mergedOperator" v-if="true">
          <template #default="scope">
            <div v-if="scope.row.operatorType === '0'">
              <!-- 农户信息显示 -->
              <template v-if="scope.row.farmerId">
                <el-tag style="color: #409eff; font-weight: 500">
                  {{ getFarmerName(scope.row.farmerId) ? getFarmerName(scope.row.farmerId) : `无效农户(ID：${scope.row.farmerId})` }}
                </el-tag>
              </template>
            </div>

            <!-- 非农户信息显示 -->
            <div v-else-if="scope.row.operatorType === '1'" class="non-farmer">
              <el-tag type="info">
                {{ scope.row.nonFarmer || '未命名操作人' }}
              </el-tag>
            </div>

            <span v-else style="color: #909399">N/A</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" v-if="false" />
        <el-table-column label="是否有效" align="center" prop="isValid" v-if="false">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:irrigationRecords:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['mz_base:irrigationRecords:remove']"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改灌溉记录对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="irrigationRecordsFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="灌溉时间" prop="irrigationTime">
          <el-date-picker clearable v-model="form.irrigationTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择灌溉时间">
          </el-date-picker>
        </el-form-item>

        <!-- 单选地块 -->
        <el-form-item label="灌溉地块" prop="landId" v-if="display1">
          <el-select v-model="form.landId" placeholder="请选择灌溉地块" clearable filterable>
            <el-option v-for="dict in landDict.filter((it) => it.isValid === 1)" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <!-- 多选地块 -->
        <el-form-item label="灌溉地块" prop="landIds" v-if="display2">
          <el-select
            v-model="form.landIds"
            placeholder="请选择灌溉地块(可多选)"
            clearable
            multiple
            collapse-tags
            :collapse-tags-tooltip="true"
            filterable
          >
            <el-option v-for="dict in landDict.filter((it) => it.isValid === 1)" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="灌溉方式" prop="irrigationMethod">
          <el-select v-model="form.irrigationMethod" placeholder="请选择灌溉方式">
            <el-option v-for="dict in irrigation_method" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="灌溉总量(方)" prop="irrigationAmount">
          <el-input v-model="form.irrigationAmount" placeholder="请输入灌溉总量" />
        </el-form-item>
        <el-form-item label="操作人类型" prop="operatorType">
          <el-radio-group v-model="form.operatorType">
            <el-radio v-for="dict in user_type" :key="dict.value" :label="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 农户下拉选择（当operatorType=0时显示） -->
        <el-form-item v-if="form.operatorType === '0'" label="操作人" prop="farmerId" key="farmer-select">
          <el-select v-model="form.farmerId" placeholder="请输入操作人" clearable filterable>
            <el-option v-for="dict in getSortedFarmerOptions()" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <!-- 非农户输入（当operatorType=1时显示） -->
        <el-form-item v-if="form.operatorType === '1'" label="操作人" prop="nonFarmer" key="non-farmer-input">
          <el-input v-model="form.nonFarmer" placeholder="请输入非农户名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 灌溉记录导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div class="el-upload__tip" slot="tip">
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的灌溉记录数据</div>
        <span>仅允许导入xls、xlsx格式文件。</span>
        <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
      </div>
      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="IrrigationRecords" lang="ts">
import { globalHeaders } from '@/utils/request';
import {
  listIrrigationRecords,
  getIrrigationRecords,
  delIrrigationRecords,
  addIrrigationRecords,
  updateIrrigationRecords
} from '../api/irrigationRecords';
import { IrrigationRecordsVO, IrrigationRecordsQuery, IrrigationRecordsForm } from '../api/irrigationRecords/types';
import { landDictQuery, farmerDictQuery, farmerBaseDictQuery } from '../api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid, irrigation_capacity, irrigation_method, user_type } = toRefs<any>(
  proxy?.useDict('is_valid', 'irrigation_capacity', 'irrigation_method', 'user_type')
);

const irrigationRecordsList = ref<IrrigationRecordsVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const landDict = ref<DictDataOption[]>([]);
const farmerDict = ref<DictDataOption[]>([]);
const landDict2 = ref<DictDataOption[]>([]);
const baseDict2 = ref<DictDataOption[]>([]);
const farmerLandDict = ref<DictDataOption[]>([]);
const farmerBaseDict = ref<DictDataOption[]>([]);

const queryFormRef = ref<ElFormInstance>();
const irrigationRecordsFormRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();

const display1 = ref(false);
const display2 = ref(false);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 灌溉记录导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层
  open: false,
  // 弹出层标题
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/irrigationRecords/importData'
});

// 使用 Map 提高查询效率
const farmerMap = computed(() => {
  return new Map(farmerDict.value.map((item) => [item.value, item.label]));
});

const getFarmerName = (farmerId) => {
  return farmerMap.value.get(farmerId);
};

// 显示农户-地块字典
const getFarmerBaseDict = async () => {
  // 获取农户和地块的名称
  const newMap = new Map<string, string>();
  for (const value1 of farmerDict.value) {
    for (const value2 of baseDict2.value) {
      if (value2.label === value1.value) {
        newMap.set(value1.value, `${value1.label}-${value2.value}`);
      }
    }
  }

  // 将 Map 转换为数组，并赋值给 farmerBaseDict
  farmerBaseDict.value = Array.from(newMap, ([key, value]) => ({
    label: value,
    value: key
  }));
  return newMap;
};

const initFormData: IrrigationRecordsForm = {
  irrigationId: undefined,
  landId: undefined,
  irrigationTime: undefined,
  irrigationCapacity: '0',
  irrigationMethod: undefined,
  farmerId: undefined,
  nonFarmer: undefined,
  remark: undefined,
  operatorType: '0',
  irrigationAmount: '0',
  landIds: undefined,
  irrigationTimes: []
};
const data = reactive<PageData<IrrigationRecordsForm, IrrigationRecordsQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    landId: '',
    irrigationTime: undefined,
    irrigationMethod: undefined,
    farmerId: undefined,
    irrigationAmount: '0',
    irrigationTimes: [],
    params: {}
  },
  rules: {
    irrigationId: [{ required: true, message: '灌溉记录ID不能为空', trigger: 'blur' }],
    // landId: [
    //   { required: true, message: "地块ID不能为空", trigger: "blur" }
    // ],
    irrigationTime: [{ required: true, message: '灌溉时间不能为空', trigger: 'blur' }],
    irrigationMethod: [{ required: true, message: '灌溉方式不能为空', trigger: 'change' }],
    irrigationAmount: [{ required: true, message: '灌溉总量不能为空', trigger: 'change' }],
    landIds: [
      { required: true, message: '地块不能为空', trigger: 'blur', type: 'array' },
      { type: 'array', min: 1, message: '至少选择一个地块' }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 添加这个辅助函数，用于获取排序后的去重地块选项
function getSortedLandOptions() {
  // 创建普通数组，不是响应式的
  const options = [];

  // 避免响应式依赖，使用普通for循环
  if (landDict.value && landDict.value.length) {
    // 首先去重
    const uniqueValues = new Set();

    for (let i = 0; i < landDict.value.length; i++) {
      const item = landDict.value[i];
      if (!item || !item.value || !item.label) continue;

      // 去重处理 - 使用label而不是value进行去重，因为可能存在不同value但label相同的情况
      if (uniqueValues.has(item.label)) continue;
      uniqueValues.add(item.label);

      // 添加到结果数组
      options.push({
        label: item.label,
        value: item.value
      });
    }
  }

  // 按照中文拼音排序
  options.sort((a, b) => {
    return String(a.label).localeCompare(String(b.label), 'zh-CN', { sensitivity: 'accent' });
  });

  return options;
}

// 添加这个辅助函数，用于获取排序后的操作人选项
function getSortedFarmerOptions() {
  // 创建普通数组，不是响应式的
  const options = [];

  // 处理农户-地块组合数据
  if (farmerBaseDict.value && farmerBaseDict.value.length) {
    // 首先去重
    const uniqueValues = new Set();

    for (let i = 0; i < farmerBaseDict.value.length; i++) {
      const item = farmerBaseDict.value[i];
      if (!item || !item.value || !item.label) continue;

      // 去重处理 - 使用label作为唯一标识，避免重复显示相同的农户-地块组合
      if (uniqueValues.has(item.label)) continue;
      uniqueValues.add(item.label);

      // 添加到结果数组
      options.push({
        label: item.label,
        value: item.value
      });
    }
  }

  // 按照中文拼音排序 - 使用人名部分进行排序
  options.sort((a, b) => {
    // 提取人名部分（通常是"-"前的部分）
    const nameA = a.label.split('-')[0] || '';
    const nameB = b.label.split('-')[0] || '';

    // 按人名的中文拼音排序
    return nameA.localeCompare(nameB, 'zh-CN', { sensitivity: 'accent' });
  });

  return options;
}

/** 查询灌溉记录列表 */
const getList = async () => {
  loading.value = true;
  const res = await listIrrigationRecords(queryParams.value);
  irrigationRecordsList.value = res.rows;
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
  irrigationRecordsFormRef.value?.resetFields();
};

const handleDateChange = (date) => {
  if (date) {
    // 在选择日期后，附加时间信息（例如：00:00:00）
    queryParams.value.irrigationTime = `${date} 00:00:00`;
  } else {
    // 如果日期为空，可以根据需求处理
    queryParams.value.irrigationTime = '';
  }
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
const handleSelectionChange = (selection: IrrigationRecordsVO[]) => {
  ids.value = selection.map((item) => item.irrigationId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  display1.value = false;
  display2.value = true;
  dialog.visible = true;
  dialog.title = '添加灌溉记录';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: IrrigationRecordsVO) => {
  reset();
  display1.value = true;
  display2.value = false;
  const _irrigationId = row?.irrigationId || ids.value[0];
  const res = await getIrrigationRecords(_irrigationId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改灌溉记录';
};

/** 提交按钮 */
const submitForm = () => {
  irrigationRecordsFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.irrigationId) {
        await updateIrrigationRecords(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addIrrigationRecords(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: IrrigationRecordsVO) => {
  const _keys = row?.irrigationId || ids.value;
  const _ids = row?.irrigationId || ids.value;
  const keyArray = Array.isArray(_keys) ? _keys : [_keys];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除灌溉记录已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delIrrigationRecords(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '灌溉记录导入';
};

const importTemplate = () => {
  proxy?.download('mz-base/irrigationRecords/importTemplate', {}, `irrigationRecords_template_${new Date().getTime()}.xlsx`);
};

const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};

const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  alert(response.msg);
  uploadRef.value?.handleRemove(file);
  getList();
};

const submitFileForm = () => {
  uploadRef.value?.submit();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'mz-base/irrigationRecords/export',
    {
      ...queryParams.value
    },
    `irrigationRecords_${new Date().getTime()}.xlsx`
  );
};

/**
 * 基地、农户字典
 */
const getDicts = async () => {
  let res = await landDictQuery();
  landDict.value = res.rows;

  res = await farmerDictQuery();
  farmerDict.value = res.rows;

  res = await farmerBaseDictQuery();
  baseDict2.value = res.rows;

  getFarmerBaseDict();
};

onMounted(() => {
  getDicts();
  getList();
});
</script>
