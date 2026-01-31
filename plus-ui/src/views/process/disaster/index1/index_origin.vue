<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="灾害类型" prop="disasterType">
              <el-select v-model="queryParams.disasterType" placeholder="请选择灾害类型" clearable>
                <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="指数名称" prop="indexName">
              <el-input v-model="queryParams.indexName" placeholder="请输入指数名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!--            <el-form-item label="指数值" prop="indexValue">
              <el-input v-model="queryParams.indexValue" placeholder="请输入指数值" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="指数单位" prop="indexUnit">
              <el-input v-model="queryParams.indexUnit" placeholder="请输入指数单位" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="检测区域" prop="detectionArea">
              <el-input v-model="queryParams.detectionArea" placeholder="请输入检测区域" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              <el-button type="info" @click="calculateDrought">旱灾指数计算</el-button>
              <el-button type="info" @click="calculateFlood">洪涝指数计算</el-button>
              <el-button type="info" @click="calculateHail">冰雹指数计算</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['disaster:index:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['disaster:index:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['disaster:index:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['disaster:index:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="indexList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="主键ID" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="灾害类型" align="center" prop="disasterType">
          <template #default="scope">
            <dict-tag :options="sys_disaster_type" :value="scope.row.disasterType" />
          </template>
        </el-table-column>
        <!--        <el-table-column label="灾害等级" align="center">
          <template #default="scope">
            <span :class="getDisasterLevelClass(scope.row)">
              {{ getDisasterLevel(scope.row) }}
            </span>
          </template>
        </el-table-column> -->
        <el-table-column label="灾害等级" align="center" width="120">
          <template #default="scope">
            <el-tooltip :content="`${scope.row.indexName}=${scope.row.indexValue}`">
              <el-tag :type="getDisasterLevel(scope.row).tagType" effect="dark">
                {{ getDisasterLevel(scope.row).level }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="指数名称" align="center" prop="indexName" />
        <el-table-column label="指数值" align="center" prop="indexValue" />
        <el-table-column label="指数单位" align="center" prop="indexUnit" />
        <el-table-column label="检测区域" align="center" prop="detectionArea" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['disaster:index:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['disaster:index:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改灾害预警指数信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="indexFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="灾害类型" prop="disasterType">
          <el-select v-model="form.disasterType" placeholder="请选择灾害类型">
            <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="指数名称" prop="indexName">
          <el-input v-model="form.indexName" placeholder="请输入指数名称" />
        </el-form-item>
        <el-form-item label="指数值" prop="indexValue">
          <el-input v-model="form.indexValue" placeholder="请输入指数值" />
        </el-form-item>
        <el-form-item label="指数单位" prop="indexUnit">
          <el-input v-model="form.indexUnit" placeholder="请输入指数单位" />
        </el-form-item>
        <el-form-item label="检测区域" prop="detectionArea">
          <el-input v-model="form.detectionArea" placeholder="请输入检测区域" />
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

<script setup name="Index" lang="ts">
import { listIndex, getIndex, delIndex, addIndex, updateIndex } from '@/api/disaster/index';
import { IndexVO, IndexQuery, IndexForm } from '@/api/disaster/index/types';
import request from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_disaster_type } = toRefs<any>(proxy?.useDict('sys_disaster_type'));

const indexList = ref<IndexVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const indexFormRef = ref<ElFormInstance>();

const calculateDrought = async () => {
  proxy?.$modal.loading('正在计算旱灾指数...');
  try {
    const res = await request.get('/disaster/drought/calculate'); // 替换为你真实接口
    proxy?.$modal.msgSuccess('旱灾指数计算完成');
    getList();
  } catch (e) {
    proxy?.$modal.msgError('旱灾指数计算失败');
  } finally {
    proxy?.$modal.closeLoading();
  }
};

const calculateFlood = async () => {
  proxy?.$modal.loading('正在计算洪涝指数...');
  try {
    const res = await request.get('/disaster/flood/calculate');
    proxy?.$modal.msgSuccess('洪涝指数计算完成');
    getList();
  } catch (e) {
    proxy?.$modal.msgError('洪涝指数计算失败');
  } finally {
    proxy?.$modal.closeLoading();
  }
};

const calculateHail = async () => {
  proxy?.$modal.loading('正在计算冰雹指数...');
  try {
    const res = await request.get('/disaster/hail/calculate');
    proxy?.$modal.msgSuccess('冰雹指数计算完成');
    getList();
  } catch (e) {
    proxy?.$modal.msgError('冰雹指数计算失败');
  } finally {
    proxy?.$modal.closeLoading();
  }
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: IndexForm = {
  id: undefined,
  disasterType: undefined,
  indexName: undefined,
  indexValue: undefined,
  indexUnit: undefined,
  detectionArea: undefined
};
const data = reactive<PageData<IndexForm, IndexQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    disasterType: undefined,
    indexName: undefined,
    indexValue: undefined,
    indexUnit: undefined,
    detectionArea: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    disasterType: [{ required: true, message: '灾害类型不能为空', trigger: 'change' }],
    indexName: [{ required: true, message: '指数名称不能为空', trigger: 'blur' }],
    indexValue: [{ required: true, message: '指数值不能为空', trigger: 'blur' }],
    indexUnit: [{ required: true, message: '指数单位不能为空', trigger: 'blur' }],
    detectionArea: [{ required: true, message: '检测区域不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询灾害预警指数信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listIndex(queryParams.value);
  indexList.value = res.rows;
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
  indexFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: IndexVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加灾害预警指数信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: IndexVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getIndex(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改灾害预警指数信息';
};

/** 提交按钮 */
const submitForm = () => {
  indexFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateIndex(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addIndex(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: IndexVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除灾害预警指数信息编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delIndex(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'disaster/index/export',
    {
      ...queryParams.value
    },
    `index_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});

const getDisasterLevel = (row: IndexVO) => {
  const value = Number(row.indexValue);
  if (isNaN(value)) return { level: '数据异常', tagType: 'danger' };

  switch (row.indexName) {
    // 冰雹灾害
    case 'K':
      if (value >= 35) return { level: '特重冰雹', tagType: 'danger' };
      if (value >= 30) return { level: '重度冰雹', tagType: 'warning' };
      if (value >= 25) return { level: '中度冰雹', tagType: '' };
      if (value >= 20) return { level: '轻度冰雹', tagType: 'info' };
      return { level: '无冰雹风险', tagType: 'success' };

    case 'TT':
      if (value >= 55) return { level: '特重冰雹', tagType: 'danger' };
      if (value >= 50) return { level: '重度冰雹', tagType: 'warning' };
      if (value >= 45) return { level: '中度冰雹', tagType: '' };
      return { level: '无冰雹风险', tagType: 'success' };

    // 旱灾
    case 'NDVI':
      if (value < 0.2) return { level: '特旱', tagType: 'danger' };
      if (value < 0.3) return { level: '重旱', tagType: 'warning' };
      if (value < 0.4) return { level: '中旱', tagType: '' };
      if (value < 0.5) return { level: '轻旱', tagType: 'info' };
      return { level: '正常', tagType: 'success' };

    case 'TVDI':
      if (value > 0.8) return { level: '特旱', tagType: 'danger' };
      if (value > 0.7) return { level: '重旱', tagType: 'warning' };
      if (value > 0.6) return { level: '中旱', tagType: '' };
      return { level: '正常', tagType: 'success' };

    // 洪涝
    case 'NDWI':
      if (value > 0.6) return { level: '特别重大洪涝', tagType: 'danger' };
      if (value > 0.5) return { level: '重大洪涝', tagType: 'warning' };
      if (value > 0.4) return { level: '较大洪涝', tagType: '' };
      if (value > 0.3) return { level: '一般洪涝', tagType: 'info' };
      return { level: '正常', tagType: 'success' };

    case 'SWI':
      if (value > 0.85) return { level: '特别重大洪涝', tagType: 'danger' };
      if (value > 0.75) return { level: '重大洪涝', tagType: 'warning' };
      if (value > 0.65) return { level: '较大洪涝', tagType: '' };
      return { level: '正常', tagType: 'success' };

    default:
      return { level: '未定义指数', tagType: 'info' };
  }
};
// // 冰雹灾害等级判断
// const getDisasterLevel = (row: IndexVO) => {
//   if (row.disasterType !== '2') return 'N/A'; // 非冰雹类型不处理

// const kValue = Number(row.indexValue);
// if (isNaN(kValue)) return '数据异常';

//   // K指数判断逻辑
//   if (kValue >= 35) return '特重冰雹';
//   else if (kValue >= 30) return '重度冰雹';
//   else if (kValue >= 25) return '中度冰雹';
//   else if (kValue >= 20) return '轻度冰雹';
//   else return '无冰雹风险';
// };

// // 可选：根据等级设置文字颜色
// const getDisasterLevelClass = (row: IndexVO) => {
//   const level = getDisasterLevel(row);
//   return {
//     'text-red-500': level.includes('极重'),
//     'text-orange-500': level.includes('重度'),
//     'text-yellow-500': level.includes('中度'),
//     'text-blue-500': level.includes('轻度')
//   };
// };
</script>
