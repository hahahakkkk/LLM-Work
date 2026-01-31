<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地编号" prop="baseId">
              <el-select v-model="queryParams.baseId" placeholder="请输入基地编号" clearable>
                <el-option v-for="dict in baseDict" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="地块编号" prop="plotId">
              <el-select v-model="queryParams.plotId" placeholder="请输入地块编号" clearable :disabled="!queryParams.baseId">
                <el-option v-for="dict in filteredLandDict" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="预警时间" prop="alertTime">
              <el-date-picker v-model="queryParams.alertTime" clearable type="date" value-format="YYYY-MM-DD" placeholder="请选择预警时间" />
            </el-form-item> -->
            <!-- <el-form-item label="预警信息" prop="alertInfo">
              <el-input v-model="queryParams.alertInfo" placeholder="请输入预警信息" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="是否处理" prop="isProcessed">
              <el-input v-model="queryParams.isProcessed" placeholder="请输入是否处理" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="影像类型" prop="growthPeriod">
              <el-input v-model="queryParams.device" placeholder="请输入影像类型" clearable @keyup.enter="handleQuery" />
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              <!-- <el-button @click="testRipenessAPI">测试成熟度接口</el-button> -->
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['maturity:waf:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['maturity:waf:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['maturity:waf:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['maturity:waf:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="wafList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="基地编号" align="center" prop="baseId">
          <template #default="scope">
            <el-tag>{{ getBaseLabel(scope.row.baseId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="地块编号" align="center" prop="plotId">
          <template #default="scope">
            <span>{{ getPlotLabel(scope.row.plotId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预警时间" align="center" prop="alertTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.alertTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预警信息" align="center" prop="alertInfo" />
        <el-table-column label="影像类型" align="center" prop="device" />
        <el-table-column label="状态" align="center" prop="isProcessed">
          <template #default="scope">
            <el-tag :type="scope.row.isProcessed === 1 ? 'success' : 'danger'">
              {{ scope.row.isProcessed === 1 ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['maturity:waf:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['maturity:waf:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改谷子成熟预警信息记录对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="wafFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="基地编号" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请输入基地编号" clearable>
            <el-option v-for="dict in baseDict" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="地块编号" prop="plotId">
          <el-select v-model="form.plotId" placeholder="请输入地块编号" clearable :disabled="!form.baseId">
            <el-option v-for="dict in landDict" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警时间" prop="alertTime">
          <el-date-picker v-model="form.alertTime" clearable type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择预警时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预警信息" prop="alertInfo">
          <el-input v-model="form.alertInfo" placeholder="请输入预警信息" />
        </el-form-item>
        <el-form-item label="是否处理" prop="isProcessed">
          <el-input v-model="form.isProcessed" placeholder="请输入是否处理：0.处理 1.未处理" />
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

<script setup name="Waf" lang="ts">
import { listWaf, getWaf, delWaf, addWaf, updateWaf } from './api';
import { WafVO, WafQuery, WafForm } from './api/types';
import { baseDictQuery, landDictQuery } from '@/views/process/maturity/api/tableDict';
import { ripenessAssessment } from '@/views/process/maturity/api/modelForward';
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo';
import { getHarvestSuggestion } from '@/views/process/maturity/utils/harvestingRecommendations';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const wafList = ref<WafVO[]>([]);

// 基地和地块字典
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const wafFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: WafForm = {
  id: undefined,
  baseId: undefined,
  plotId: undefined,
  alertTime: undefined,
  alertInfo: undefined,
  alertType: undefined,
  isProcessed: undefined,
  growthPeriod: undefined
};
const data = reactive<PageData<WafForm, WafQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    plotId: undefined,
    alertTime: undefined,
    alertInfo: undefined,
    alertType: undefined,
    isProcessed: undefined,
    device: undefined,
    growthPeriod: undefined,
    // 按预警时间倒序排序，保证全部数据最新在前
    orderByColumn: 'alertTime',
    isAsc: 'desc',
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '基地编号不能为空', trigger: 'blur' }],
    plotId: [{ required: true, message: '地块编号不能为空', trigger: 'blur' }],
    alertTime: [{ required: true, message: '预警时间不能为空', trigger: 'blur' }],
    alertInfo: [{ required: true, message: '预警信息不能为空', trigger: 'blur' }],
    isProcessed: [{ required: true, message: '是否处理不能为空', trigger: 'blur' }],
    growthPeriod: [{ required: true, message: '生长时期不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询谷子成熟预警信息记录列表 */
const getList = async () => {
  loading.value = true;
  const res = await listWaf(queryParams.value);
  wafList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 获取基地和地块字典 */
const getDicts = async () => {
  try {
    // 获取基地字典
    const baseRes = await baseDictQuery();
    baseDict.value =
      baseRes.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];

    // 获取地块字典 - 使用新的接口
    const landRes = await fetchFarmerLands({});
    console.log(landRes);
    landDict.value =
      landRes.rows?.map((item) => ({
        value: String(item.landId),
        label: String(item.landCode),
        baseId: String(item.baseId)
      })) || [];
  } catch (err) {
    console.error('获取字典数据失败', err);
  }
};

/** 根据选中的基地过滤地块 */
const filteredLandDict = computed(() => {
  if (!queryParams.value.baseId) return landDict.value;

  // 过滤出指定基地的地块
  const filtered = landDict.value.filter((plot) => plot.baseId === queryParams.value.baseId);

  // 按地块标签排序
  return filtered.sort((a, b) => {
    return a.label.localeCompare(b.label);
  });
});

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

// 测试函数
function testRipenessAPI() {
  ripenessAssessment({ maturityLevel: '成熟' })
    .then((res) => {
      console.log('后端返回结果：', res);
    })
    .catch((err) => {
      console.error('请求失败：', err);
    });
}

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  wafFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 根据基地ID获取基地标签 */
const getBaseLabel = (baseId: string | undefined) => {
  if (!baseId) return '';

  const base = baseDict.value.find((item) => item.value === baseId);
  return base ? base.label : baseId;
};

/** 根据地块ID获取地块标签 */
const getPlotLabel = (plotId: string | undefined) => {
  if (!plotId) return '';

  const plot = landDict.value.find((item) => item.value === plotId);
  return plot ? plot.label : plotId;
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: WafVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加谷子成熟预警信息记录';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: WafVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getWaf(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改谷子成熟预警信息记录';
};

/** 提交按钮 */
const submitForm = () => {
  wafFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateWaf(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWaf(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: WafVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除谷子成熟预警信息记录编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delWaf(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/**
 * 使用指定的URL处理图像并更新预测结果
 */
const processImageAndUpdateWithUrl = async (recordId: string | number, imageUrl: string, formData: WafForm = form.value) => {
  try {
    // --------------------------
    // ② 生成采收建议
    // --------------------------

    const maturityLevel = updateData.ripenessStatus === 1 ? '成熟' : '未成熟';
    const weather = '晴天';
    const disaster = '无灾害';
    const harvestSuggestion = getHarvestSuggestion(maturityLevel, weather, disaster);

    // --------------------------
    // ③ 查询 WAF 是否已存在
    // --------------------------
    const existResp = await listWaf({
      baseId: formData.baseId,
      plotId: formData.plotId,
      problemType: '成熟期'
    });

    const rows = existResp.data?.rows || existResp.data || [];
    const exist = rows.length > 0;
    const existId = exist ? rows[0].id : null;

    console.log('WAF 查询：', exist, existId);

    const wafData: WafForm = {
      baseId: formData.baseId,
      plotId: formData.plotId,
      alertTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      alertInfo: harvestSuggestion,
      isProcessed: 0,
      problemType: '成熟期'
    };

    // --------------------------
    // ④ 已存在 → update，不存在 → add
    // --------------------------
    if (exist && existId && updateData.ripenessStatus === 1) {
      wafData.id = existId;
      await updateWaf(wafData);
      console.log('WAF 已存在 → 修改成功：', wafData);
    } else if (updateData.ripenessStatus === 1) {
      await addWaf(wafData);
      console.log('WAF 不存在 → 新增成功：', wafData);
    }

    proxy?.$modal.msgSuccess('图像处理完成并已更新数据');
    emits('completed', recordId);
    // 可以添加一个专门的地图刷新事件
    emits('map-refresh'); // 添加这一行
  } catch (error) {
    // 可选：删除已创建但未完成处理的记录
    if (recordId) {
      try {
        await delForecast(recordId);
        console.log('已清理未完成的记录:', recordId);
      } catch (deleteError) {
        console.error('清理记录失败:', deleteError);
      }
    }
    // 明确处理网络错误或服务不可用情况
    console.error('模型预测失败:', error);
    proxy?.$modal.msgError('模型服务调用失败，请检查服务状态');
    return; // 中断执行，不进行数据库更新
  } finally {
    buttonLoading.value = false;
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    '/process/maturity/waf/export',
    {
      ...queryParams.value
    },
    `waf_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
  getDicts();
});
</script>
