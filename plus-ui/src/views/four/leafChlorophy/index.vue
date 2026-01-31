<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地名称" prop="baseName">
              <el-select v-model="queryParams.baseName" placeholder="请选择基地" clearable @change="filterLandDict">
                <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="地块编号" prop="baseName">
              <el-select v-model="queryParams.baseId" placeholder="请选择地块" clearable>
                <el-option v-for="dict in filteredLandDict" :label="dict.label" :value="dict.label ? String(dict.label).slice(-3) : ''" />
              </el-select>
            </el-form-item>

            <el-form-item label="谷子生育期" prop="period" label-width="100px">
              <el-select v-model="queryParams.period" placeholder="请选择生长时期" clearable>
                <el-option v-for="dict in four_growth_period" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button v-hasPermi="['process/growth:statistics:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['process/growth:statistics:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['process/growth:statistics:remove']"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['process/growth:statistics:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>-->

      <el-table v-loading="loading" :data="statisticsList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="id" align="center" prop="id" />
        <el-table-column label="基地" align="center" prop="baseName" width="170">
          <template #default="scope">
            <dict-tag :options="baseDict" :value="scope.row.baseName" />
          </template>
        </el-table-column>
        <el-table-column label="地块编号" align="center" prop="baseId" />
        <el-table-column label="LAI" align="center" prop="realLai" />
        <el-table-column label="SPAD" align="center" prop="realSpad" />
        <el-table-column label="谷子生育期" align="center" prop="period">
          <template #default="scope">
            <dict-tag :options="four_growth_period" :value="scope.row.period" />
          </template>
        </el-table-column>
        <el-table-column label="采集时间" align="center" prop="time" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.time, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <!--<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['process/growth:statistics:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['process/growth:statistics:remove']"
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>-->
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改实测数据对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="statisticsFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="基地名称" prop="baseName">
          <el-select v-model="form.baseName" placeholder="请选择基地" clearable>
            <el-option v-for="dict in baseDict" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="地块编号" prop="baseId">
          <el-input v-model="form.baseId" placeholder="请输入地块编号" />
        </el-form-item>
        <el-form-item label="采集时间" prop="time">
          <el-date-picker v-model="form.time" clearable type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择采集时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="生育期" prop="growthPeriod">
          <el-select v-model="form.period" placeholder="请选择谷子生育期">
            <el-option v-for="dict in four_growth_period" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="LAI" prop="realLai">
          <el-input v-model="form.realLai" placeholder="请输入LAI" />
        </el-form-item>
        <el-form-item label="SPAD" prop="realSpad">
          <el-input v-model="form.realSpad" placeholder="请输入SPAD" />
        </el-form-item>
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

<script setup name="LeafChlorophy" lang="ts">
import { listStatistics, getStatistics, delStatistics, addStatistics, updateStatistics } from '@/views/process/growth/statistics/api';
import { StatisticsVO, StatisticsQuery, StatisticsForm } from '@/views/process/growth/statistics/api/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const statisticsList = ref<StatisticsVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const statisticsFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: StatisticsForm = {
  baseName: undefined,
  baseId: undefined,
  time: undefined,
  period: undefined,
  realLai: undefined,
  realSpad: undefined,
  remark: undefined
};
const data = reactive<PageData<StatisticsForm, StatisticsQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseName: undefined,
    baseId: undefined,
    time: undefined,
    period: undefined,
    realLai: undefined,
    realSpad: undefined,
    params: {}
  },
  rules: {
    baseName: [{ required: true, message: '基地名称不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '地块编号不能为空', trigger: 'blur' }],
    time: [{ required: true, message: '采集时间不能为空', trigger: 'blur' }],
    period: [{ required: true, message: '生长时期不能为空', trigger: 'blur' }],
    realLai: [{ required: true, message: 'LAI不能为空', trigger: 'blur' }],
    realSpad: [{ required: true, message: 'SPAD不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { four_growth_period } = toRefs<any>(proxy?.useDict('four_growth_period'));

import { baseDictQuery } from '@/views/process/growth/api/tableDict';
import { TableDict } from '@/views/process/growth/api/tableDict/types';
import { landDictQuery } from '@/views/mz_base/api/tableDict';

const baseDict = ref<TableDict[]>([]);
const landDict = ref<DictDataOption[]>([]);

/**
 * 基地、农户字典
 */
const getDicts = async () => {
  let res = await landDictQuery();
  landDict.value = res.rows;
  console.log(res);
  res = await baseDictQuery();
  baseDict.value = res.rows;
  console.log(res);
};

// 创建过滤后的地块字典
const filteredLandDict = ref<DictDataOption[]>([]);

// 基地变化时过滤地块
const filterLandDict = () => {
  // 查找选中的基地字典项
  const selectedBase = baseDict.value.find((item) => item.value === queryParams.value.baseName);

  if (!selectedBase) {
    console.log('未选择有效基地');
    filteredLandDict.value = [...landDict.value];
    return;
  }

  // 获取基地名称（label）
  const baseNameLabel = selectedBase.label.replace('基地', '');

  // 根据基地名称过滤地块
  filteredLandDict.value = landDict.value.filter((item) => {
    if (!item.label || item.label.length < 3) return false;

    const basePart = item.label.slice(0, -3); // 去除后三位数字
    console.log('地块前缀:', basePart, '基地名称:', baseNameLabel);
    return basePart === baseNameLabel;
  });

  console.log('过滤后的地块数量:', filteredLandDict.value.length);
};

/** 查询实测数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listStatistics(queryParams.value);
  statisticsList.value = res.rows;
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
  statisticsFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  filterLandDict(); // 重置后更新地块列表
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: StatisticsVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加实测数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: StatisticsVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getStatistics(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改实测数据';
};

/** 提交按钮 */
const submitForm = () => {
  statisticsFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateStatistics(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addStatistics(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: StatisticsVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除实测数据编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delStatistics(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'process/growth/statistics/export',
    {
      ...queryParams.value
    },
    `statistics_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
  getDicts().then(() => {
    // 初始化过滤字典
    filterLandDict();
  });
});
</script>
