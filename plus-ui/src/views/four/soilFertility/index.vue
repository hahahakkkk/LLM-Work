<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="年份" prop="llYear">
              <el-input v-model="queryParams.llYear" placeholder="请输入年份" clearable @keyup.enter="handleQuery" />
            </el-form-item>

            <el-form-item label="所属基地" prop="baseId">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable>
                <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="地块名称" prop="landId">
              <el-select v-model="queryParams.landId" placeholder="请选择地块名称" clearable>
                <el-option v-for="dict in landDict" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="地力综合指数" prop="landIfi" label-width="100">
              <el-input v-model="queryParams.landIfi" placeholder="请输入地力综合指数" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="地力等级" prop="landLevel">
              <el-input v-model="queryParams.landLevel" placeholder="请输入地力等级" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:landLevel:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:landLevel:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:landLevel:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:landLevel:export']">导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Document" @click="handleEvaluation" v-hasPermi="['powland:point:evaluation']">地力评价</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>-->

      <el-table v-loading="loading" :data="landLevelList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="地力ID" align="center" prop="llId" v-if="false" />

        <el-table-column label="年份" align="center" prop="llYear" />
        <el-table-column label="所属基地" align="center" prop="baseId">
          <template #default="scope">
            <dict-tag :options="baseDict" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="地块名称" align="center" prop="landId">
          <template #default="scope">
            <dict-tag :options="landDict" :value="scope.row.landId" />
          </template>
        </el-table-column>
        <el-table-column label="地力综合指数" align="center" prop="landIfi" />
        <el-table-column label="地力等级" align="center" prop="landLevel" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="是否有效" align="center" prop="isValid" v-if="false">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <!--<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:landLevel:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:landLevel:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>-->
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改地力等级对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="landLevelFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="地块名称" prop="landId">
          <el-select v-model="form.landId" placeholder="请选择地块名称" clearable>
            <el-option v-for="dict in landDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="年份" prop="llYear">
          <el-input v-model="form.llYear" placeholder="请输入年份" />
        </el-form-item>
        <el-form-item label="所属基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择所属基地" clearable>
            <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="地力综合指数" prop="landIfi">
          <el-input v-model="form.landIfi" placeholder="请输入地力综合指数" />
        </el-form-item> -->
        <el-form-item label="地力等级" prop="landLevel">
          <el-input v-model="form.landLevel" placeholder="请输入地力等级" />
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
  </div>
</template>

<script setup name="SoilFertility" lang="ts">
import { listLandLevel, getLandLevel, delLandLevel, addLandLevel, updateLandLevel } from '@/views/mz_base/api/landLevel';
import { LandLevelVO, LandLevelQuery, LandLevelForm } from '@/views/mz_base/api/landLevel/types';
import { landDictQuery, baseDictQuery } from '@/views/mz_base/api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid } = toRefs<any>(proxy?.useDict('is_valid'));

const landLevelList = ref<LandLevelVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const landDict = ref<DictDataOption[]>([]);

const baseDict = ref<DictDataOption[]>([]);

const queryFormRef = ref<ElFormInstance>();
const landLevelFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: LandLevelForm = {
  llId: undefined,
  landId: undefined,
  llYear: undefined,
  landIfi: undefined,
  landLevel: undefined,
  remark: undefined
};
const data = reactive<PageData<LandLevelForm, LandLevelQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    landId: undefined,
    llYear: undefined,
    landIfi: undefined,
    landLevel: undefined,
    params: {}
  },
  rules: {
    llId: [{ required: true, message: '地力ID不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '基地ID不能为空', trigger: 'blur' }],
    landId: [{ required: true, message: '地块名称不能为空', trigger: 'change' }],
    llYear: [{ required: true, message: '年份不能为空', trigger: 'blur' }],
    landIfi: [{ required: false, message: '地力综合指数不能为空', trigger: 'blur' }],
    landLevel: [{ required: true, message: '地力等级不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询地力等级列表 */
const getList = async () => {
  loading.value = true;
  const res = await listLandLevel(queryParams.value);
  landLevelList.value = res.rows;
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
  landLevelFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: LandLevelVO[]) => {
  ids.value = selection.map((item) => item.llId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加地力等级';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: LandLevelVO) => {
  reset();
  const _llId = row?.llId || ids.value[0];
  const res = await getLandLevel(_llId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改地力等级';
};

/** 提交按钮 */
const submitForm = () => {
  landLevelFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.llId) {
        await updateLandLevel(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addLandLevel(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: LandLevelVO) => {
  const _llIds = row?.llId || ids.value;
  await proxy?.$modal.confirm('是否确认删除地力等级编号为"' + _llIds + '"的数据项？').finally(() => (loading.value = false));
  await delLandLevel(_llIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'mz-base/landLevel/export',
    {
      ...queryParams.value
    },
    `landLevel_${new Date().getTime()}.xlsx`
  );
};
const handleEvaluation = () => {
  window.open('/static/soil-evaluation.html', '_blank');
};
/**
 * 地块字典
 */
const getDicts = async () => {
  let res = await landDictQuery();
  landDict.value = res.rows;

  res = await baseDictQuery();
  baseDict.value = res.rows;
};

onMounted(() => {
  getList();
  getDicts();
});
</script>
