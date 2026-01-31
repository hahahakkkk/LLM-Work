<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="仓库位置" prop="depositoryAddress">
              <el-input v-model="queryParams.depositoryAddress" placeholder="请输入仓库位置" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="地块名称" prop="landId">
              <el-select v-model="queryParams.landId" placeholder="请选择地块名称" clearable>
                <el-option v-for="dict in landDict"  :label="dict.label":value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="管理员" prop="depositoryManager">
              <el-input v-model="queryParams.depositoryManager" placeholder="请输入管理员名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="是否有效" prop="isValid">
              <el-select v-model="queryParams.isValid" placeholder="请选择是否有效" clearable >
                <el-option v-for="dict in is_valid" :key="dict.value" :label="dict.label" :value="dict.value"/>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:depository:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:depository:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:depository:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:depository:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="depositoryList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="仓库ID" align="center" prop="depositoryId" v-if="false" />
        <el-table-column label="仓库位置" align="center" prop="depositoryAddress" />
        <el-table-column label="地块名称" align="center" prop="landId">
          <template #default="scope">
            <dict-tag :options="landDict" :value="scope.row.landId" />
          </template>
        </el-table-column>
        <el-table-column label="管理员" align="center" prop="depositoryManager" />
        <el-table-column label="管理员EXT" align="center" prop="managerExtend" v-if="false"/>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="是否有效" align="center" prop="isValid">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:depository:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:depository:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改仓库信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="depositoryFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="仓库位置" prop="depositoryAddress">
          <el-input v-model="form.depositoryAddress" placeholder="请输入仓库位置" />
        </el-form-item>
        <el-form-item label="地块名称" prop="landId">
          <el-select v-model="form.landId" placeholder="请选择地块名称" clearable>
            <el-option v-for="dict in landDict"  :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="管理员" prop="depositoryManager">
          <el-input v-model="form.depositoryManager" placeholder="请输入管理员名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="是否有效" prop="isValid">
          <el-select v-model="form.isValid" placeholder="请选择是否有效">
            <el-option
                v-for="dict in is_valid"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
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

<script setup name="Depository" lang="ts">
import { listDepository, getDepository, delDepository, addDepository, updateDepository } from '../api/depository';
import { DepositoryVO, DepositoryQuery, DepositoryForm } from '../api/depository/types';
import { landDictQuery } from '../api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid } = toRefs<any>(proxy?.useDict('is_valid'));

const depositoryList = ref<DepositoryVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const landDict = ref<DictDataOption[]>([]);

const queryFormRef = ref<ElFormInstance>();
const depositoryFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DepositoryForm = {
  depositoryId: undefined,
  depositoryAddress: undefined,
  landId: undefined,
  depositoryManager: undefined,
  managerExtend: undefined,
  remark: undefined,
  isValid: undefined
}
const data = reactive<PageData<DepositoryForm, DepositoryQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    depositoryAddress: undefined,
    landId: undefined,
    depositoryManager: undefined,
    managerExtend: undefined,
    isValid: undefined,
    params: {
    }
  },
  rules: {
    depositoryId: [
      { required: true, message: "仓库ID不能为空", trigger: "blur" }
    ],
    depositoryAddress: [
      { required: true, message: "仓库位置不能为空", trigger: "blur" }
    ],
    landId: [
      { required: true, message: "地块ID不能为空", trigger: "change" }
    ],
    depositoryManager: [
      { required: true, message: "管理员不能为空", trigger: "change" }
    ],
    is_valid: [
      { required: true, message: "是否有效不能为空", trigger: "blur" }
    ],

  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询仓库信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDepository(queryParams.value);
  depositoryList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  depositoryFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: DepositoryVO[]) => {
  ids.value = selection.map(item => item.depositoryId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加仓库信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: DepositoryVO) => {
  reset();
  const _depositoryId = row?.depositoryId || ids.value[0]
  const res = await getDepository(_depositoryId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改仓库信息";
}

/** 提交按钮 */
const submitForm = () => {
  depositoryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.depositoryId) {
        await updateDepository(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addDepository(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: DepositoryVO) => {
  const _depositoryIds = row?.depositoryId || ids.value;
  await proxy?.$modal.confirm('是否确认删除仓库信息编号为"' + _depositoryIds + '"的数据项？').finally(() => loading.value = false);
  await delDepository(_depositoryIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('mz_base/depository/export', {
    ...queryParams.value
  }, `depository_${new Date().getTime()}.xlsx`)
}

/**
 * 地块字典
 */
 const getDicts = async () => {
  let res = await landDictQuery();
  landDict.value = res.rows;

}


onMounted(() => {
  getList();
  getDicts();
});
</script>
