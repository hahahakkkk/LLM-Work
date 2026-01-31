<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地名称" prop="baseName" v-has-roles="['superadmin', 'sysadmin']">
              <el-select v-model="queryParams.baseName" placeholder="请选择基地名称" clearable>
                <el-option v-for="item in sortedBaseNameOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="基地类型" prop="baseType">
              <el-select v-model="queryParams.baseType" placeholder="请选择基地类型" clearable>
                <el-option v-for="dict in base_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['powland:baseInfo:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['powland:baseInfo:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['powland:baseInfo:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['powland:baseInfo:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="baseInfoList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="编号" align="center" prop="baseId" v-if="false" />
        <el-table-column label="基地名称" align="center" prop="baseName" />
        <el-table-column label="基地所在村" align="center" prop="baseLocation" />
        <el-table-column label="基地类型" align="center" prop="baseType">
          <template #default="scope">
            <dict-tag :options="base_type" :value="scope.row.baseType" />
          </template>
        </el-table-column>
        <el-table-column label="基地面积(亩)" align="center" prop="baseArea" />
        <el-table-column label="经度°" align="center" prop="lng" />
        <el-table-column label="纬度°" align="center" prop="lat" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['powland:baseInfo:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['powland:baseInfo:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改基地信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="baseInfoFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="基地名称" prop="baseName">
          <el-input v-model="form.baseName" placeholder="请输入基地名称" />
        </el-form-item>
        <el-form-item label="基地所在村" prop="baseLocation">
          <el-input v-model="form.baseLocation" placeholder="请输入基地所在村" />
        </el-form-item>
        <el-form-item label="基地类型" prop="baseType">
          <el-select v-model="form.baseType" placeholder="请选择基地类型">
            <el-option v-for="dict in base_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="基地面积" prop="baseArea">
          <el-input v-model.number="form.baseArea" placeholder="请输入基地面积" />
        </el-form-item>
        <el-form-item label="经度" prop="lng">
          <el-input v-model.number="form.lng" placeholder="请输入经度" />
        </el-form-item>
        <el-form-item label="纬度" prop="lat">
          <el-input v-model.number="form.lat" placeholder="请输入纬度" />
        </el-form-item>
        <el-form-item label="备注">
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
  </div>
</template>

<script setup name="BaseInfo" lang="ts">
import { listBaseInfo, getBaseInfo, delBaseInfo, addBaseInfo, updateBaseInfo } from '../api/baseInfo';
import { BaseInfoVO, BaseInfoQuery, BaseInfoForm } from '../api/baseInfo/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { base_type, is_valid } = toRefs<any>(proxy?.useDict('base_type', 'is_valid'));
const baseNameOptions = ref<string[]>([]);
const sortedBaseNameOptions = computed(() => {
  return [...baseNameOptions.value].sort((a, b) => a.localeCompare(b));
});

const baseInfoList = ref<BaseInfoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const baseInfoFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: BaseInfoForm = {
  baseId: undefined,
  baseName: undefined,
  baseLocation: undefined,
  baseType: undefined,
  baseArea: undefined,
  isValid: undefined,
  remark: undefined,
  lng: undefined,
  lat: undefined
};
const data = reactive<PageData<BaseInfoForm, BaseInfoQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseName: undefined,
    baseLocation: undefined,
    baseType: undefined,
    params: {
      isValid: 1
    }
  },
  rules: {
    baseName: [{ required: true, message: '基地名称不能为空', trigger: 'blur' }],
    baseLocation: [{ required: true, message: '基地所在村不能为空', trigger: 'blur' }],
    baseType: [{ required: true, message: '基地类型不能为空', trigger: 'change' }],
    baseArea: [{ type: 'number', message: '必须为数值' }],
    lng: [
      { type: 'number', message: '必须为数值' },
      { required: true, message: '经度不能为空', trigger: 'blur' }
    ],
    lat: [
      { type: 'number', message: '必须为数值' },
      { required: true, message: '纬度不能为空', trigger: 'blur' }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询基地信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listBaseInfo(queryParams.value);
  baseNameOptions.value = [...new Set(res.rows.map((item) => item.baseName).filter((name) => name))];
  baseInfoList.value = res.rows.sort((a, b) => {
    // 定义基地类型的优先级（这里按存储值写）
    const typeOrder = {
      1: 1, // 智慧引领种植基地
      2: 2 // 数字化种植基地
    };
    const aTypeOrder = typeOrder[a.baseType] ?? 99; // 其他类型排后
    const bTypeOrder = typeOrder[b.baseType] ?? 99;
    // 先按类型排序
    if (aTypeOrder !== bTypeOrder) {
      return aTypeOrder - bTypeOrder;
    }
    // 类型相同，再按基地名称拼音排序
    return a.baseName.localeCompare(b.baseName, 'zh-CN');
  });
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
  baseInfoFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.params.isValid = 1; // 保持有效记录筛选
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: BaseInfoVO[]) => {
  ids.value = selection.map((item) => item.baseId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加基地信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: BaseInfoVO) => {
  reset();
  const _baseId = row?.baseId || ids.value[0];
  const res = await getBaseInfo(_baseId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改基地信息';
};

/** 提交按钮 */
const submitForm = () => {
  baseInfoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.baseId) {
        await updateBaseInfo(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addBaseInfo(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: BaseInfoVO) => {
  const _baseIds = row?.baseId || ids.value;
  // 构建确认消息
  let confirmMessage = '';
  if (row) {
    // 单条删除：显示完整编号
    confirmMessage = '是否确认删除基地编号为"' + _baseIds + '"的数据项？';
  } else {
    // 批量删除：显示第一个编号+数量
    const keyArray = Array.isArray(_baseIds) ? _baseIds : [_baseIds];
    const firstKey = keyArray[0] || '';
    const count = keyArray.length;
    if (count === 1) {
      // 单条删除：直接使用_baseIds（可能是字符串或数字）
      confirmMessage = '是否确认删除基地编号为"' + _baseIds + '"的数据项？';
    } else {
      // 批量删除：显示第一个编号+数量
      confirmMessage = `是否确认删除基地编号为"${firstKey}"等的${count}条数据？`;
    }
  }
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delBaseInfo(_baseIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  // 创建导出参数的副本，避免修改原始查询参数
  const exportParams = {
    ...queryParams.value,
    params: {
      ...queryParams.value.params,
      // 移除 isValid 参数，这样后端就不会包含有效状态列
      isValid: undefined
    }
  };

  proxy?.download('powland/baseInfo/export', exportParams, `baseInfo_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  queryParams.value.params.isValid = 1; // 确保只查询有效记录
  getList();
});
</script>
