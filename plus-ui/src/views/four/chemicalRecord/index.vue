<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <!--<el-form-item label="使用日期" prop="useTimes">
              <el-date-picker
                clearable
                v-model="queryParams.useTimes"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>-->
            <el-form-item label="使用日期" prop="useTime">
              <el-date-picker
                clearable
                v-model="queryParams.useTime"
                type="date"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                placeholder="请选择使用日期"
              />
            </el-form-item>
            <el-form-item label="农药名称" prop="chemicalId">
              <el-select v-model="queryParams.chemicalId" placeholder="请选择农药名称" clearable>
                <el-option v-for="dict in chemicalDict.filter((it) => it.isValid === 1)" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <!--<el-form-item label="操作人" prop="farmerId">
              <el-select v-model="queryParams.farmerId" placeholder="请选择操作人" clearable @keyup.enter="handleQuery">
                <el-option v-for="dict in farmerDict" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>-->
            <el-form-item label="使用地块" prop="landId">
              <el-select v-model="queryParams.landId" placeholder="请选择使用地块" clearable>
                <el-option v-for="dict in landDict.filter((it) => it.isValid === 1)" :label="dict.label" :value="dict.value" />
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
      <!--<template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:chemicalUse:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:chemicalUse:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:chemicalUse:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="upload" @click="handleImport" v-hasPermi="['mz_base:chemicalUse:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:chemicalUse:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" :columns="columns" :sesrch="true" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>-->

      <el-table v-loading="loading" :data="chemicalUseList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="columns[0].visible" key="useId" label="使用记录ID" align="center" prop="useId" />
        <el-table-column v-if="columns[1].visible" key="useTime" label="使用日期" align="center" prop="useTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.useTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[2].visible" key="chemicalId" label="农药名称" align="center" prop="chemicalId">
          <template #default="scope">
            <dict-tag :options="chemicalDict" :value="scope.row.chemicalId" />
          </template>
        </el-table-column>
        <el-table-column v-if="columns[3].visible" key="useFor" label="用途" align="center" prop="useFor" />
        <el-table-column v-if="columns[4].visible" key="useAmount" label="使用量(毫升)" align="center" prop="useAmount" />
        <el-table-column label="操作人类型" align="center" prop="userType" v-if="false">
          <template #default="scope">
            <dict-tag :options="user_type" :value="scope.row.userType" />
          </template>
        </el-table-column>
        <!-- 新增合并后的采购人列 -->
        <el-table-column label="操作人" align="center" prop="mergedUser" v-if="true">
          <template #default="scope">
            <div v-if="scope.row.userType === '0'">
              <!-- 农户信息显示 -->
              <template v-if="scope.row.farmerId">
                <el-tag style="color: #409eff; font-weight: 500">
                  {{ getFarmerName(scope.row.farmerId) }}
                </el-tag>
              </template>
            </div>

            <!-- 非农户信息显示 -->
            <div v-else-if="scope.row.userType === '1'" class="non-farmer">
              <el-tag type="info">
                {{ scope.row.nonFarmer || '未命名操作人' }}
              </el-tag>
            </div>

            <span v-else style="color: #909399">N/A</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[6].visible" key="landId" label="使用地块" align="center" prop="landId">
          <template #default="scope">
            <dict-tag :options="landDict" :value="scope.row.landId" />
          </template>
        </el-table-column>
        <el-table-column v-if="columns[7].visible" key="remark" label="备注" align="center" prop="remark" />
        <el-table-column v-if="columns[8].visible" key="isValid" label="是否有效" align="center" prop="isValid">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <!--<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:chemicalUse:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:chemicalUse:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>-->
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改农药使用记录对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="chemicalUseFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="使用日期" prop="useTime">
          <el-date-picker clearable v-model="form.useTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择使用日期"> </el-date-picker>
        </el-form-item>
        <el-form-item label="农药名称" prop="chemicalId">
          <el-select v-model="form.chemicalId" placeholder="请选择农药名称" clearable>
            <el-option v-for="dict in chemicalDict.filter((it) => it.isValid === 1)" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="使用量(毫升)" prop="useAmount">
          <el-input v-model="form.useAmount" placeholder="请输入使用量" />
        </el-form-item>
        <!--<el-form-item label="操作人类型" prop="userType">
          <el-radio-group v-model="form.userType">
            <el-radio v-for="dict in user_type" :key="dict.value" :label="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>-->
        <el-form-item label="操作人类型" prop="userType">
          <el-radio-group v-model="form.userType" @change="handleUserTypeChange">
            <el-radio label="0">农户</el-radio>
            <el-radio label="1">非农户</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 农户下拉选择（当userType=0时显示） -->
        <!--el-form-item v-if="form.userType === '0'" label="操作人" prop="farmerId" key="farmer-select">
          <el-select v-model="form.farmerId" placeholder="请输入操作人" clearable>
            <el-option v-for="dict in farmerLandDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>-->
        <!--<el-form-item v-if="form.userType === '0'" label="操作人" prop="farmerId" key="farmer-select">
          <el-select
            v-model="form.farmerId"
            placeholder="请输入操作人"
            clearable
            filterable
            :filter-method="customFarmerFilter"
          >
            <el-option
              v-for="dict in filteredFarmerLandDict"
              :label="dict.label"
              :value="dict.value"
              :key="dict.value"
            />
          </el-select>
        </el-form-item>-->
        <!-- 农户下拉选择（当userType=0时显示） -->
        <el-form-item v-if="form.userType === '0'" label="操作人" key="farmer-select">
          <el-select v-model="form.farmerId" placeholder="请输入操作人" clearable filterable :filter-method="customFarmerFilter">
            <el-option v-for="dict in filteredFarmerBaseDict" :label="dict.label" :value="dict.value" :key="dict.value" />
          </el-select>
        </el-form-item>
        <!-- 非农户输入（当userType=1时显示） -->
        <el-form-item v-if="form.userType === '1'" label="操作人" prop="nonFarmer" key="non-farmer-input">
          <el-input v-model="form.nonFarmer" placeholder="请输入非农户名称" />
        </el-form-item>
        <!--<el-form-item label="使用地块" prop="landId" v-if="display1">
          <el-select v-model="form.landId" placeholder="请选择使用地块" clearable>
            <el-option v-for="dict in landDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="使用地块" prop="landIds" v-if="display2">
          <el-select v-model="form.landIds" placeholder="请选择使用地块(可多选)" clearable multiple collapse-tags :collapse-tags-tooltip="true">
            <el-option v-for="dict in landDict" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>-->
        <el-form-item label="使用地块" prop="landId" v-if="display1">
          <el-select v-model="form.landId" placeholder="请选择使用地块" clearable filterable :filter-method="customFilter">
            <el-option v-for="dict in sortedLandDict" :label="dict.label" :value="dict.value" :key="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="使用地块" prop="landIds" v-if="display2">
          <el-select
            v-model="form.landIds"
            placeholder="请选择使用地块(可多选)"
            clearable
            multiple
            collapse-tags
            :collapse-tags-tooltip="true"
            filterable
            :filter-method="customFilter"
          >
            <el-option v-for="dict in filteredLandDict" :label="dict.label" :value="dict.value" :key="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 农药使用记录导入对话框 -->
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的农药使用记录数据</div>
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

<script setup name="ChemicalRecord" lang="ts">
import { globalHeaders } from '@/utils/request';
import { listChemicalUse, getChemicalUse, delChemicalUse, addChemicalUse, updateChemicalUse } from '@/views/mz_base/api/chemicalUse/index';
import { ChemicalUseVO, ChemicalUseQuery, ChemicalUseForm } from '@/views/mz_base/api/chemicalUse/types';
import { chemicalDictQuery, landDictQuery, farmerDictQuery, farmerBaseDictQuery } from '@/views/mz_base/api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid, user_type } = toRefs<any>(proxy?.useDict('is_valid', 'user_type'));

const chemicalUseList = ref<ChemicalUseVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const chemicalDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);
const farmerDict = ref<DictDataOption[]>([]);
const landDict2 = ref<DictDataOption[]>([]);
const baseDict2 = ref<DictDataOption[]>([]);
const farmerLandDict = ref<DictDataOption[]>([]);
const farmerBaseDict = ref<DictDataOption[]>([]); // 新增农户-基地字典

const queryFormRef = ref<ElFormInstance>();
const chemicalUseFormRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();

const display1 = ref(false);
const display2 = ref(false);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `使用记录ID`, visible: false, children: [] },
  { key: 1, label: `使用日期`, visible: true, children: [] },
  { key: 2, label: `农药名称`, visible: true, children: [] },
  { key: 3, label: `用途`, visible: false, children: [] },
  { key: 4, label: `使用量(ml)`, visible: true, children: [] },
  { key: 5, label: `使用量(ml)`, visible: true, children: [] },
  { key: 6, label: `使用地块`, visible: true, children: [] },
  { key: 7, label: `备注`, visible: false, children: [] },
  { key: 8, label: `是否有效`, visible: false, children: [] }
]);

// 农药使用记录导入参数
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
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/chemicalUse/importData'
});

// 使用 Map 提高查询效率
const farmerMap = computed(() => {
  return new Map(farmerDict.value.map((item) => [item.value, item.label]));
});

const getFarmerName = (farmerId) => {
  return farmerMap.value.get(farmerId) || `无效农户(ID: ${farmerId})`;
};

// 显示农户-地块字典
/*const getFarmerLandDict = async () => {
  // 获取农户和地块的名称
  const newMap = new Map<string, string>();
  for (const value1 of farmerDict.value) {
    for (const value2 of landDict2.value) {
      if (value2.label === value1.value) {
        newMap.set(value1.value, `${value1.label}-${value2.value}`);
      }
    }
  }

  // 将 Map 转换为数组，并赋值给 farmerLandDict
  farmerLandDict.value = Array.from(newMap, ([key, value]) => ({
    label: value,
    value: key
  }));
  return newMap;
};*/
const getFarmerBaseDict = async () => {
  const newMap = new Map<string, string>();
  for (const value1 of farmerDict.value) {
    for (const value2 of baseDict2.value) {
      if (value2.label === value1.value) {
        newMap.set(value1.value, `${value1.label}-${value2.value}`);
      }
    }
  }
  const farmerBaseDictArray = Array.from(newMap, ([key, value]) => ({
    label: value,
    value: key
  }));
  // 对农户-基地字典进行正序排序
  farmerBaseDict.value = farmerBaseDictArray.sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));
  return newMap;
};
/*const getFarmerBaseDict = async () => {
  try {
    // 直接从API获取农户-基地数据
    const res = await farmerBaseDictQuery();
    const farmerBaseDictArray = res.rows || [];

    // 对农户-基地字典进行中文正序排序
    farmerBaseDict.value = farmerBaseDictArray.sort((a, b) =>
      a.label.localeCompare(b.label, 'zh-CN')
    );

    // 为了兼容性，同时更新原来的变量
    farmerLandDict.value = farmerBaseDict.value;
  } catch (error) {
    console.error('获取农户-基地数据失败:', error);
  }
};*/

const initFormData: ChemicalUseForm = {
  useId: undefined,
  useTime: undefined,
  chemicalId: undefined,
  useFor: undefined,
  useAmount: undefined,
  landId: undefined,
  remark: undefined,
  landIds: undefined,
  userType: '0',
  //useTimes: [],
  farmerId: undefined,
  nonFarmer: undefined
};
const data = reactive<PageData<ChemicalUseForm, ChemicalUseQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    useTime: undefined,
    chemicalId: undefined,
    useFor: undefined,
    useAmount: undefined,
    landId: undefined,
    landIds: undefined,
    userType: '0',
    //useTimes: [],
    params: {}
  },
  rules: {
    useId: [{ required: true, message: '使用记录ID不能为空', trigger: 'blur' }],
    useTime: [{ required: true, message: '使用日期不能为空', trigger: 'blur' }],
    chemicalId: [{ required: true, message: '农药名称不能为空', trigger: 'blur' }],
    useFor: [{ required: true, message: '用途不能为空', trigger: 'blur' }],
    useAmount: [{ required: true, message: '使用量不能为空', trigger: 'blur' }],
    landIds: [
      { required: true, message: '地块不能为空', trigger: 'blur', type: 'array' },
      { type: 'array', min: 1, message: '至少选择一个地块' }
    ],
    farmerId: [{ required: true, message: '操作人不能为空', trigger: 'blur' }],
    nonFarmer: [{ required: true, message: '操作人不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

import { ref, computed } from 'vue';
// 计算属性：排序后的地块列表
const sortedLandDict = computed(() => {
  return [...landDict.value].filter((it) => it.isValid === 1).sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));
});
// 筛选后的地块列表
const filteredLandDict = ref(sortedLandDict.value);
// 自定义筛选函数
const customFilter = (value) => {
  if (!value) {
    filteredLandDict.value = sortedLandDict.value;
    return;
  }
  filteredLandDict.value = sortedLandDict.value.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()));
};

/*const filteredFarmerLandDict = ref(farmerLandDict.value);
const customFarmerFilter = (value) => {
  if (!value) {
    filteredFarmerLandDict.value = farmerLandDict.value;
    return;
  }
  filteredFarmerLandDict.value = farmerLandDict.value.filter((item) =>
    item.label.toLowerCase().includes(value.toLowerCase())
  );
};*/
const filteredFarmerBaseDict = ref([]);
const customFarmerFilter = (value) => {
  if (!value) {
    filteredFarmerBaseDict.value = farmerBaseDict.value;
    return;
  }
  filteredFarmerBaseDict.value = farmerBaseDict.value.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()));
};

const handleUserTypeChange = (userType) => {
  form.value.userType = userType;
};

/** 查询农药使用记录列表 */
const getList = async () => {
  loading.value = true;
  const res = await listChemicalUse(queryParams.value);
  chemicalUseList.value = res.rows;
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
  chemicalUseFormRef.value?.resetFields();
};

/*const handleDateChange = (date) => {
  if (date) {
    // 在选择日期后，附加时间信息（例如：00:00:00）
    queryParams.value.useTime = `${date} 00:00:00`;
  } else {
    // 如果日期为空，可以根据需求处理
    queryParams.value.useTime = '';
  }
};*/

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
/*const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};*/
/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  // 重置时清除日期
  queryParams.value.useTime = undefined;
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: ChemicalUseVO[]) => {
  ids.value = selection.map((item) => item.useId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  display1.value = false;
  display2.value = true;
  dialog.visible = true;
  dialog.title = '添加喷药记录';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ChemicalUseVO) => {
  reset();
  display1.value = true;
  display2.value = false;
  const _useId = row?.useId || ids.value[0];
  const res = await getChemicalUse(_useId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改喷药记录';
};

/** 提交按钮 */
const submitForm = () => {
  chemicalUseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.useId) {
        await updateChemicalUse(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addChemicalUse(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作（喷药记录） */
const handleDelete = async (row?: ChemicalUseVO) => {
  const _keys = row?.useId || ids.value;
  const _ids = row?.useId || ids.value;
  const keyArray = Array.isArray(_keys) ? _keys : [_keys];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除喷药记录已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delChemicalUse(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '喷药记录导入';
};

const importTemplate = () => {
  proxy?.download('mz-base/chemicalUse/importTemplate', {}, `chemicalUse_template_${new Date().getTime()}.xlsx`);
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
    'mz-base/chemicalUse/export',
    {
      ...queryParams.value
    },
    `chemicalUse_${new Date().getTime()}.xlsx`
  );
};

/**
 * 农药、地块、农户字典
 */
/*const getDicts = async () => {
  let res = await chemicalDictQuery();
  chemicalDict.value = res.rows;

  res = await landDictQuery();
  landDict.value = res.rows;

  res = await farmerDictQuery();
  farmerDict.value = res.rows;

  res = await farmerLandDictQuery();
  landDict2.value = res.rows;

  getFarmerLandDict();
};*/
/*const getDicts = async () => {
  let res = await chemicalDictQuery();
  chemicalDict.value = res.rows;
  res = await landDictQuery();
  // 对获取到的地块数据进行排序
  landDict.value = res.rows.sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));
  res = await farmerDictQuery();
  farmerDict.value = res.rows;
  res = await farmerLandDictQuery();
  landDict2.value = res.rows;
  getFarmerLandDict();
};*/
const getDicts = async () => {
  let res = await chemicalDictQuery();
  chemicalDict.value = res.rows;

  res = await landDictQuery();
  // 对获取到的地块数据进行排序

  landDict.value = res.rows.sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));

  res = await farmerDictQuery();
  farmerDict.value = res.rows;

  // 使用新的农户-基地API替代原来的农户-地块API
  res = await farmerBaseDictQuery();
  baseDict2.value = res.rows;
  getFarmerBaseDict();

  // 初始化筛选数据
  filteredFarmerBaseDict.value = farmerBaseDict.value;
};

onMounted(() => {
  getList();
  getDicts();
  filteredFarmerBaseDict.value = farmerBaseDict.value;
});
</script>
