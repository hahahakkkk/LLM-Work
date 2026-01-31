<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="采购日期" prop="buyTimes">
              <el-date-picker
                clearable
                v-model="queryParams.buyTimes"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleDateChange"
              />
            </el-form-item>
            <el-form-item label="农药名称" prop="chemicalId">
              <el-select v-model="queryParams.chemicalId" placeholder="请选择农药名称" clearable>
                <el-option v-for="dict in chemicalStore.chemicalDict.filter((c) => c.isValid === 1)" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="采购人" prop="farmerId">
              <el-select v-model="queryParams.farmerId" placeholder="请选择采购人" clearable filterable @keyup.enter="handleQuery">
                <el-option v-for="dict in sortedFarmerLandDict.filter((c) => c.isValid === 1)" :label="dict.label" :value="dict.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:chemicalBuy:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:chemicalBuy:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:chemicalBuy:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="upload" @click="handleImport" v-hasPermi="['mz_base:chemicalBuy:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:chemicalBuy:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" :columns="columns" :search="true" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="chemicalBuyList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="columns[0].visible" key="buyId" label="采购记录ID" align="center" prop="buyId" />
        <el-table-column v-if="columns[1].visible" key="buyTime" label="采购日期" align="center" prop="buyTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.buyTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[2].visible" key="chemicalId" label="农药名称" align="center" prop="chemicalId">
          <template #default="scope">
            <dict-tag :options="chemicalStore.chemicalDict" :value="scope.row.chemicalId" />
          </template>
        </el-table-column>
        <el-table-column v-if="columns[3].visible" key="buyAmount" label="采购数量" align="center" prop="buyAmount" />
        <el-table-column label="采购人类型" align="center" prop="buyerType" v-if="false">
          <template #default="scope">
            <dict-tag :options="user_type" :value="scope.row.buyerType" />
          </template>
        </el-table-column>
        <!-- 新增合并后的采购人列 -->
        <el-table-column label="采购人" align="center" prop="mergedBuyer" v-if="true">
          <template #default="scope">
            <div v-if="scope.row.buyerType === '0'">
              <!-- 农户信息显示 -->
              <template v-if="getFarmerName(scope.row.farmerId)">
                <el-tag style="color: #409eff; font-weight: 500">
                  {{ getFarmerName(scope.row.farmerId) }}
                </el-tag>
              </template>
              <span v-else style="color: #f56c6c">无效农户ID：{{ scope.row.farmerId }}</span>
            </div>

            <!-- 非农户信息显示 -->
            <div v-else-if="scope.row.buyerType === '1'" class="non-farmer">
              <el-tag type="info">
                {{ scope.row.nonFarmer || '未命名采购方' }}
              </el-tag>
            </div>

            <span v-else style="color: #909399">N/A</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[5].visible" key="remark" label="备注" align="center" prop="remark" />
        <el-table-column v-if="columns[6].visible" key="isValid" label="是否有效" align="center" prop="isValid">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:chemicalBuy:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:chemicalBuy:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改农药采购记录对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="chemicalBuyFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="采购日期" prop="buyTime">
          <el-date-picker clearable v-model="form.buyTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择采购日期"> </el-date-picker>
        </el-form-item>
        <el-form-item label="农药名称" prop="chemicalId">
          <el-select v-model="form.chemicalId" placeholder="请选择农药名称" clearable>
            <el-option v-for="dict in chemicalStore.chemicalDict.filter((c) => c.isValid === 1)" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="采购数量" prop="buyAmount">
          <el-input v-model="form.buyAmount" placeholder="请输入采购数量" />
        </el-form-item>
        <el-form-item label="采购人类型" prop="buyerType">
          <el-radio-group v-model="form.buyerType">
            <el-radio v-for="dict in user_type" :key="dict.value" :label="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 农户下拉选择（当buyerType=0时显示） -->
        <el-form-item v-if="form.buyerType === '0'" label="采购人" prop="farmerId" key="farmer-select">
          <el-select v-model="form.farmerId" placeholder="请输入采购人" clearable filterable>
            <el-option v-for="dict in sortedFarmerLandDict.filter((c) => c.isValid === 1)" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <!-- 非农户输入（当buyerType=1时显示） -->
        <el-form-item v-if="form.buyerType === '1'" label="采购人" prop="nonFarmer" key="non-farmer-input">
          <el-input v-model="form.nonFarmer" placeholder="请输入非农户名称" />
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
    <!-- 农药采购记录导入对话框 -->
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的农药采购记录数据</div>
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

<script setup name="ChemicalBuy" lang="ts">
import { globalHeaders } from '@/utils/request';
import { listChemicalBuy, getChemicalBuy, delChemicalBuy, addChemicalBuy, updateChemicalBuy } from '../api/chemicalBuy/index';
import { ChemicalBuyVO, ChemicalBuyQuery, ChemicalBuyForm } from '../api/chemicalBuy/types';
import { chemicalDictQuery, farmerBaseDictQuery, farmerDictQuery, farmerLandDictQuery } from '../api/tableDict';
import { useChemicalStore } from '../store/chemical';

const chemicalStore = useChemicalStore();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid } = toRefs<any>(proxy?.useDict('is_valid'));
const { user_type } = toRefs<any>(proxy?.useDict('user_type'));

const chemicalBuyList = ref<ChemicalBuyVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
// const chemicalDict = ref<DictDataOption[]>([]);
const farmerDict = ref<DictDataOption[]>([]);
const landDict2 = ref<DictDataOption[]>([]);
const farmerLandDict = ref<DictDataOption[]>([]);

const queryFormRef = ref<ElFormInstance>();
const chemicalBuyFormRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `采购记录ID`, visible: false, children: [] },
  { key: 1, label: `采购日期`, visible: true, children: [] },
  { key: 2, label: `农药名称`, visible: true, children: [] },
  { key: 3, label: `采购数量`, visible: true, children: [] },
  { key: 4, label: `采购人`, visible: true, children: [] },
  { key: 5, label: `备注`, visible: true, children: [] },
  { key: 6, label: `是否有效`, visible: false, children: [] }
]);

// 农药采购记录导入参数
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
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/chemicalBuy/importData'
});

// 使用 Map 提高查询效率
const farmerMap = computed(() => {
  return new Map(farmerDict.value.map((item) => [item.value, item.label]));
});

const getFarmerName = (farmerId) => {
  return farmerMap.value.get(farmerId) || `无效农户(ID: ${farmerId})`;
};

// 显示农户-地块字典
const getFarmerLandDict = async () => {
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
};

const sortedFarmerLandDict = computed(() => {
  // 对农户和地块进行排序
  return [...farmerLandDict.value].sort((a, b) => a.label.localeCompare(b.label));
});

const initFormData: ChemicalBuyForm = {
  buyId: undefined,
  buyTime: undefined,
  chemicalId: undefined,
  buyAmount: undefined,
  farmerId: undefined,
  remark: undefined,
  nonFarmer: undefined,
  buyerType: '0',
  buyTimes: []
};
const data = reactive<PageData<ChemicalBuyForm, ChemicalBuyQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    buyTime: undefined,
    chemicalId: undefined,
    farmerId: undefined,
    nonFarmer: undefined,
    buyerType: undefined,
    buyTimes: [],
    params: {}
  },
  rules: {
    buyId: [{ required: true, message: '采购记录ID不能为空', trigger: 'blur' }],
    buyTime: [{ required: true, message: '采购日期不能为空', trigger: 'blur' }],
    chemicalId: [{ required: true, message: '农药名称不能为空', trigger: 'blur' }],
    buyAmount: [{ required: true, message: '采购数量不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询农药采购记录列表 */
const getList = async () => {
  loading.value = true;
  const res = await listChemicalBuy(queryParams.value);
  console.log(queryParams.value);
  console.log(res);
  chemicalBuyList.value = res.rows;
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
  chemicalBuyFormRef.value?.resetFields();
};

const handleDateChange = (value) => {
  if (value && value.length === 2) {
    // 为开始日期添加 00:00:00
    const startDate = `${value[0]} 00:00:00`;

    // 为结束日期添加 00:00:00（或根据需要设为 23:59:59）
    const endDate = `${value[1]} 00:00:00`;
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
const handleSelectionChange = (selection: ChemicalBuyVO[]) => {
  ids.value = selection.map((item) => item.buyId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加农药采购记录';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ChemicalBuyVO) => {
  reset();
  const _buyId = row?.buyId || ids.value[0];
  const res = await getChemicalBuy(_buyId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改农药采购记录';
};

/** 提交按钮 */
const submitForm = () => {
  chemicalBuyFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.buyId) {
        await updateChemicalBuy(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addChemicalBuy(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作（农药采购） */
const handleDelete = async (row?: ChemicalBuyVO) => {
  const _keys = row?.buyId || ids.value;
  const _ids = row?.buyId || ids.value;
  const keyArray = Array.isArray(_keys) ? _keys : [_keys];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除农药采购信息已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delChemicalBuy(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '农药采购记录导入';
};

const importTemplate = () => {
  proxy?.download('mz-base/chemicalBuy/importTemplate', {}, `chemicalBuy_template_${new Date().getTime()}.xlsx`);
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
    'mz-base/chemicalBuy/export',
    {
      ...queryParams.value
    },
    `chemicalBuy_${new Date().getTime()}.xlsx`
  );
};

/**
 * 农药字典
 */
const getDicts = async () => {
  // let res = await chemicalDictQuery();
  // console.log(res);
  chemicalStore.loadChemicalDict();
  // chemicalDict.value = res.rows;

  let res = await farmerBaseDictQuery();
  landDict2.value = res.rows;

  res = await farmerDictQuery();
  farmerDict.value = res.rows;

  getFarmerLandDict();
};

onMounted(() => {
  getDicts();
  getList();
});
</script>
