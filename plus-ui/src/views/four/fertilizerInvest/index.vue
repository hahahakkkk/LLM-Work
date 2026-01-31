<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="购买日期" prop="buyTime">
              <el-date-picker
                clearable
                v-model="queryParams.buyTime"
                type="date"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
            <!-- <el-form-item label="采购日期" prop="buyTime">
              <el-date-picker clearable v-model="queryParams.buyTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择采购日期" />
            </el-form-item> -->
            <el-form-item label="肥料名称" prop="fertilizerId">
              <el-select v-model="queryParams.fertilizerId" placeholder="请选择肥料名称" clearable>
                <el-option v-for="dict in fertilizerDict" :label="dict.label" :value="dict.value" />
              </el-select>
              <!-- <el-input v-model="queryParams.fertilizerId" placeholder="请输入肥料名称" clearable @keyup.enter="handleQuery" /> -->
            </el-form-item>
            <!-- <el-form-item label="采购数量" prop="buyAmount">
              <el-input v-model="queryParams.buyAmount" placeholder="请输入采购数量" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="采购人" prop="farmerId">
              <el-select v-model="queryParams.farmerId" placeholder="请选择采购人" clearable filterable @keyup.enter="handleQuery">
                <el-option v-for="dict in sortedFarmerLandDict" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="采购人" prop="buyBy">
              <el-input v-model="queryParams.buyBy" placeholder="请输入采购人" clearable @keyup.enter="handleQuery" />
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
      <!--<template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:fertilizerBuy:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:fertilizerBuy:edit']"
            >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:fertilizerBuy:remove']"
            >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['mz_base:fertilizer:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:fertilizerBuy:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>-->

      <el-table v-loading="loading" :data="fertilizerBuyList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="采购记录ID" align="center" prop="buyId" v-if="false" />
        <el-table-column label="采购日期" align="center" prop="buyTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.buyTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="肥料名称" align="center" prop="fertilizerId">
          <template #default="scope">
            <dict-tag :options="fertilizerDict" :value="scope.row.fertilizerId" />
          </template>
        </el-table-column>
        <el-table-column label="采购数量" align="center" prop="buyAmount" />
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
        <!-- <el-table-column label="采购人" align="center" prop="buyBy" /> -->
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="是否有效" align="center" prop="isValid" v-if="false">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <!--<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:fertilizerBuy:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:fertilizerBuy:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>-->
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改肥料采购记录对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="fertilizerBuyFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="采购日期" prop="buyTime">
          <el-date-picker clearable v-model="form.buyTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择采购日期"> </el-date-picker>
        </el-form-item>
        <el-form-item label="肥料名称" prop="fertilizerId">
          <el-select v-model="form.fertilizerId" placeholder="请选择肥料名称" clearable>
            <el-option v-for="dict in fertilizerDict" :label="dict.label" :value="dict.value" />
          </el-select>
          <!-- <el-input v-model="form.fertilizerId" placeholder="请输入肥料名称" /> -->
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
            <el-option v-for="dict in sortedFarmerLandDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <!-- 非农户输入（当buyerType=1时显示） -->
        <el-form-item v-if="form.buyerType === '1'" label="采购人" prop="nonFarmer" key="non-farmer-input">
          <el-input v-model="form.nonFarmer" placeholder="请输入非农户名称" />
        </el-form-item>

        <!-- <el-form-item label="采购人" prop="buyBy">
          <el-input v-model="form.buyBy" placeholder="请输入采购人" />
        </el-form-item> -->
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
    <!-- 用户导入对话框 -->
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的肥料购买记录数据</div>
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

<script setup name="FertilizerBuy" lang="ts">
import { globalHeaders } from '@/utils/request';
import {
  listFertilizerBuy,
  getFertilizerBuy,
  delFertilizerBuy,
  addFertilizerBuy,
  updateFertilizerBuy
} from '@/views/mz_base/api/fertilizerBuy/index';
import { FertilizerBuyVO, FertilizerBuyQuery, FertilizerBuyForm } from '@/views/mz_base/api/fertilizerBuy/types';

import { farmerDictQuery, fertilizerDictQuery, farmerLandDictQuery, farmerBaseDictQuery } from '@/views/mz_base/api/tableDict';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid } = toRefs<any>(proxy?.useDict('is_valid'));

const fertilizerBuyList = ref<FertilizerBuyVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const { user_type } = toRefs<any>(proxy?.useDict('user_type'));

const queryFormRef = ref<ElFormInstance>();
const fertilizerBuyFormRef = ref<ElFormInstance>();
// const fertilizerBuyimport = ref<ElFormInstance>();
const fertilizerBuyimport = ref<ElUploadInstance>();
const fertilizerDict = ref<DictDataOption[]>([]);
const farmerDict = ref<DictDataOption[]>([]);
const landDict2 = ref<DictDataOption[]>([]);
const farmerLandDict = ref<DictDataOption[]>([]);
const uploadRef = ref<ElUploadInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const upload = reactive<ImportOption>({
  open: false,
  title: '',
  isUploading: false,
  updateSupport: 0,
  headers: globalHeaders(),
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/fertilizerBuy/importData'
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

const initFormData: FertilizerBuyForm = {
  buyId: undefined,
  buyTime: undefined,
  fertilizerId: undefined,
  buyAmount: undefined,
  buyBy: undefined,
  nonFarmer: undefined,
  buyerType: '0'
};
const data = reactive<PageData<FertilizerBuyForm, FertilizerBuyQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    useTimes: [],
    buyTime: undefined,
    fertilizerId: undefined,
    buyAmount: undefined,
    buyBy: undefined,
    nonFarmer: undefined,
    buyerType: undefined,
    params: {}
  },
  rules: {
    buyId: [{ required: true, message: '采购记录ID不能为空', trigger: 'blur' }],
    buyTime: [{ required: true, message: '采购日期不能为空', trigger: 'blur' }],
    fertilizerId: [{ required: true, message: '肥料名称不能为空', trigger: 'blur' }],
    buyAmount: [{ required: true, message: '采购数量不能为空', trigger: 'blur' }]
    // buyBy: [{ required: true, message: '采购人不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询肥料采购记录列表 */
const getList = async () => {
  loading.value = true;
  console.log(queryParams.value);
  const res = await listFertilizerBuy(queryParams.value);
  console.log(res);
  fertilizerBuyList.value = res.rows;
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
  fertilizerBuyFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: FertilizerBuyVO[]) => {
  ids.value = selection.map((item) => item.buyId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加肥料采购记录';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: FertilizerBuyVO) => {
  reset();
  const _buyId = row?.buyId || ids.value[0];
  const res = await getFertilizerBuy(_buyId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改肥料采购记录';
};

/** 提交按钮 */
const submitForm = () => {
  fertilizerBuyFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.buyId) {
        await updateFertilizerBuy(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFertilizerBuy(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作（肥料采购） */
const handleDelete = async (row?: FertilizerBuyVO) => {
  const _keys = row?.buyId || ids.value;
  const _ids = row?.buyId || ids.value;
  const keyArray = Array.isArray(_keys) ? _keys : [_keys];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除化肥采购记录已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delFertilizerBuy(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'mz-base/fertilizerBuy/export',
    {
      ...queryParams.value
    },
    `fertilizerBuy_${new Date().getTime()}.xlsx`
  );
};
/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '导入肥料购买信息';
};

/** 下载模板操作 */
const importTemplate = () => {
  proxy?.download('mz-base/fertilizerBuy/importTemplate', 1, `fertilizerBuyTemplate.xlsx`);
};

// 文件上传中处理
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
// 文件上传成功处理
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  alert(response.msg);
  fertilizerBuyimport.value?.handleRemove(file);
  // upload.open = false;
  // upload.isUploading = false;
  // upload.$refs.upload.clearFiles();

  // upload.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true });
  getList();
};
// 提交上传文件
const submitFileForm = () => {
  uploadRef.value?.submit();
};
/**
 * 肥料字典
 */
const getDicts = async () => {
  let res;
  res = await fertilizerDictQuery();
  fertilizerDict.value = res.rows;

  res = await farmerDictQuery();
  console.log(res);
  farmerDict.value = res.rows;

  res = await farmerBaseDictQuery();
  landDict2.value = res.rows;

  getFarmerLandDict();
};
onMounted(() => {
  getList();
  getDicts();
});
</script>
