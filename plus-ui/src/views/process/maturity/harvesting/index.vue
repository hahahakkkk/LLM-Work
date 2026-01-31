<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地名称" prop="baseName">
              <el-input v-model="queryParams.baseName" placeholder="请输入基地名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="地块编号" prop="baseId">
              <el-input v-model="queryParams.baseId" placeholder="请输入地块编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="成熟度" prop="measure">
              <el-select v-model="queryParams.measure" placeholder="请选择成熟度" clearable>
                <el-option label="成熟" value="成熟" />
                <el-option label="未成熟" value="未成熟" />
              </el-select>
            </el-form-item>
            <el-form-item label="预警时间" prop="actionTime">
              <el-date-picker v-model="queryParams.actionTime" clearable type="date" value-format="YYYY-MM-DD" placeholder="请选择预警时间" />
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
            <el-button v-hasPermi="['process/growth:supplyRec:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['process/growth:supplyRec:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['process/growth:supplyRec:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['process/growth:supplyRec:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="supplyRecList" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="基地名称" align="center" prop="baseName" min-width="40" />
        <el-table-column label="地块编号" align="center" prop="baseId" min-width="40" />
        <el-table-column label="成熟度" align="center" prop="measure" min-width="40" />
        <el-table-column label="预警时间" align="center" width="150">
          <template #default="scope">
            <span>{{ parseTime(scope.row.actionTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预警信息" align="left" prop="alertInfo" min-width="250" />
        <el-table-column label="最佳收获时间" align="center" width="120">
          <template #default="scope">
            <span>{{ extractHarvestTime(scope.row.alertInfo) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['process/growth:supplyRec:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['process/growth:supplyRec:remove']"
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改补给对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="supplyRecFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="基地名称" prop="baseName">
          <el-select v-model="form.baseName" placeholder="请选择基地名称" clearable>
            <el-option label="侯家沟" value="侯家沟" />
            <el-option label="李家寺" value="李家寺" />
            <el-option label="姜兴庄" value="姜兴庄" />
          </el-select>
        </el-form-item>
        <el-form-item label="基地编号" prop="baseId">
          <el-input v-model="form.baseId" placeholder="请输入基地编号" />
        </el-form-item>
        <el-form-item label="成熟度" prop="maturity">
          <el-select v-model="form.measure" placeholder="请选择成熟度" clearable>
            <el-option label="成熟" value="成熟" />
            <el-option label="未成熟" value="未成熟" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警时间" prop="actionTime">
          <el-date-picker v-model="form.actionTime" clearable type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择预警时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预警信息" prop="alertInfo">
          <el-input v-model="form.alertInfo" placeholder="请输入预警信息" />
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

<script setup name="SupplyRec" lang="ts">
import { listSupplyRec, getSupplyRec, delSupplyRec, addSupplyRec, updateSupplyRec } from './api';
import { SupplyRecVO, SupplyRecQuery, SupplyRecForm } from './api/types';

import { ref, onMounted, reactive, getCurrentInstance, toRefs } from 'vue';
import Pagination from '@/components/Pagination/index.vue';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const supplyRecList = ref<SupplyRecVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const supplyRecFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: SupplyRecForm = {
  baseId: undefined,
  baseName: undefined,
  actionTime: undefined,
  alertInfo: undefined,
  measure: undefined,
  problemType: '成熟期'
};
const data = reactive<PageData<SupplyRecForm, SupplyRecQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    baseName: undefined,
    actionTime: undefined,
    alertInfo: undefined,
    measure: undefined,
    problemType: '成熟期',
    params: {}
  },
  rules: {
    baseId: [{ required: true, message: '基地编号不能为空', trigger: 'blur' }],
    baseName: [{ required: true, message: '基地名称不能为空', trigger: 'blur' }],
    actionTime: [{ required: true, message: '预警时间不能为空', trigger: 'blur' }],
    alertInfo: [{ required: true, message: '预警信息不能为空', trigger: 'blur' }],
    measure: [{ required: true, message: '方法措施不能为空', trigger: 'blur' }],
    problemType: [{ required: true, message: '必须选择生长时期', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 从预警信息中提取最佳收获时间
const extractHarvestTime = (alertInfo: string) => {
  if (!alertInfo) return '未知';

  // 匹配时间模式的正则表达式
  const timePattern = /(\d+)(?:-(\d+))?天/;
  const match = alertInfo.match(timePattern);

  if (match) {
    if (match[2]) {
      return `${match[1]}-${match[2]}天`; // 如 "3-5天"
    }
    return `${match[1]}天`; // 如 "3天"
  }

  return '未知';
};

// 在script setup部分添加以下代码
import { watch, computed } from 'vue';
import axios from 'axios';

// 配置问题类型选项
// const problemTypeOptions = computed(() => {
//   return form.value.measure === '补水'
//       ? [{ label: '缺水', value: '缺水' }]
//       : form.value.measure === '追肥'
//           ? [{ label: '缺肥', value: '缺肥' }]
//           : [];
// });

/** 查询补给列表 */
const getList = async () => {
  loading.value = true;
  const res = await listSupplyRec(queryParams.value);
  supplyRecList.value = res.rows;
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
  supplyRecFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: SupplyRecVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加补给';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: SupplyRecVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getSupplyRec(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改补给';
};

/** 提交按钮 */
const submitForm = () => {
  supplyRecFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateSupplyRec(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSupplyRec(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: SupplyRecVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除补给编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delSupplyRec(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'process/growth/supplyRec/export',
    {
      ...queryParams.value
    },
    `supplyRec_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
