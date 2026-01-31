<template>
  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-2 h-[calc(100vh-120px)]">
    <div class="flex flex-col gap-2 h-full overflow-hidden">
      <el-card class="flex flex-col overflow-hidden">
        <template #header>
          <div class="flex justify-between items-center">
            <span>预警结果</span>
            <div class="flex gap-2">
              <el-button type="primary" plain icon="Plus" size="small" @click="handleAdd" v-hasPermi="['mizhipestcontrol:warning:add']"
                >新增</el-button
              >
              <el-button
                type="success"
                plain
                icon="Edit"
                size="small"
                :disabled="single"
                @click="handleUpdate()"
                v-hasPermi="['mizhipestcontrol:warning:edit']"
                >修改</el-button
              >
              <el-button
                type="danger"
                plain
                icon="Delete"
                size="small"
                :disabled="multiple"
                @click="handleDelete()"
                v-hasPermi="['mizhipestcontrol:warning:remove']"
                >删除</el-button
              >
              <el-button type="warning" plain icon="Download" size="small" @click="handleExport" v-hasPermi="['mizhipestcontrol:warning:export']"
                >导出</el-button
              >
            </div>
          </div>
        </template>
        <div class="flex-1 overflow-hidden flex flex-col">
          <div class="flex-1 overflow-auto">
            <el-table v-loading="loading" :data="warningList" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column label="预警等级" align="center" prop="warningLevel" />
              <el-table-column label="预测日期" align="center" prop="predictionDate" width="180">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.predictionDate, '{y}-{m}-{d}') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="平均温度" align="center" prop="tmean" />
              <el-table-column label="平均相对湿度" align="center" prop="rhMean" />
              <!-- TODO: 临时隐藏 -->
              <!-- <el-table-column label="日照时间" align="center" prop="ssd" /> -->
              <el-table-column label="累计降水量" align="center" prop="rf" />
              <!-- <el-table-column label="参考作物蒸散量" align="center" prop="et0" /> -->
              <el-table-column label="建议措施" align="center" prop="recommendation" show-overflow-tooltip />
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
                <template #default="scope">
                  <el-tooltip content="修改" placement="top">
                    <el-button
                      link
                      type="primary"
                      icon="Edit"
                      @click="handleUpdate(scope.row)"
                      v-hasPermi="['mizhipestcontrol:warning:edit']"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button
                      link
                      type="primary"
                      icon="Delete"
                      @click="handleDelete(scope.row)"
                      v-hasPermi="['mizhipestcontrol:warning:remove']"
                    ></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="flex-shrink-0 pt-2">
            <pagination
              v-show="total > 0"
              :total="total"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              @pagination="getList"
            />
          </div>
        </div>
      </el-card>
    </div>
    <div class="flex flex-col gap-2 h-full overflow-y-auto">
      <el-card class="flex-shrink-0">
        <template #header> <span>最新状态</span></template>
        <el-descriptions :column="1" v-if="latestWarning">
          <el-descriptions-item label="功能状态"><el-tag size="small">启用</el-tag></el-descriptions-item>
          <el-descriptions-item label="白发病等级">
            <el-tag :type="getWarningLevelType(latestWarning.warningLevel)" size="small">
              {{ latestWarning.warningLevel }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预测日期">
            {{ parseTime(latestWarning.predictionDate, '{y}-{m}-{d}') }}
          </el-descriptions-item>
          <el-descriptions-item label="平均温度">{{ latestWarning.tmean }}℃</el-descriptions-item>
          <el-descriptions-item label="平均相对湿度">{{ latestWarning.rhMean }}%</el-descriptions-item>
          <el-descriptions-item label="日照时间">{{ latestWarning.ssd }}小时</el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="暂无数据" :image-size="80" />
      </el-card>
      <el-card class="flex-shrink-0">
        <template #header> <span>模型设置</span></template>
        <div class="flex flex-col gap-2">
          <el-date-picker
            v-model="modelEnableDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
          <div class="flex justify-end">
            <el-button>保存</el-button>
          </div>
        </div>
      </el-card>
      <el-card class="flex-shrink-0">
        <template #header> <span>数据筛选</span></template>
        <el-form ref="queryFormRef" :model="queryParams" label-position="top" size="small">
          <el-form-item label="预警等级" prop="warningLevel">
            <el-select v-model="queryParams.warningLevel" placeholder="请选择预警等级" clearable style="width: 100%">
              <el-option v-for="item in warningLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="预测日期" prop="predictionDate">
            <el-date-picker
              clearable
              v-model="queryParams.predictionDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择预测日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item>
            <div class="flex gap-2 w-full">
              <el-button type="primary" icon="Search" @click="handleQuery" class="flex-1">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery" class="flex-1">重置</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 添加或修改气象预警与建议数据对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="warningFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="预警等级" prop="warningLevel">
          <el-input v-model="form.warningLevel" placeholder="请输入预警等级" />
        </el-form-item>
        <el-form-item label="预测日期" prop="predictionDate">
          <el-date-picker
            clearable
            v-model="form.predictionDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择预测日期"
            style="width: 100%"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="平均温度" prop="tMean">
          <el-input v-model="form.tMean" placeholder="请输入平均温度" />
        </el-form-item>
        <el-form-item label="平均相对湿度" prop="rhMean">
          <el-input v-model="form.rhMean" placeholder="请输入平均相对湿度" />
        </el-form-item>
        <el-form-item label="日照时间" prop="SSD">
          <el-input v-model="form.SSD" placeholder="请输入日照时间" />
        </el-form-item>
        <el-form-item label="累计降水量" prop="RF">
          <el-input v-model="form.RF" placeholder="请输入累计降水量" />
        </el-form-item>
        <el-form-item label="参考作物蒸散量" prop="ET0">
          <el-input v-model="form.ET0" placeholder="请输入参考作物蒸散量" />
        </el-form-item>
        <el-form-item label="建议措施" prop="recommendation">
          <el-input v-model="form.recommendation" type="textarea" placeholder="请输入内容" :rows="3" />
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

<script setup lang="ts" name="Whitehead">
import { listWarning, getWarning, delWarning, addWarning, updateWarning } from './api';
import { WarningVO, WarningQuery, WarningForm } from './api/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 预警等级枚举
enum WarningLevel {
  LIGHT = '轻度',
  MODERATE = '中度',
  SEVERE = '重度'
}

// 预警等级选项
const warningLevelOptions = [
  { label: '轻度', value: '轻度' },
  { label: '中度', value: '中度' },
  { label: '重度', value: '重度' }
];

// TODO: 暂时固定为 6.1 - 6.15
const modelEnableDate = ref(['2025-06-01', '2025-06-15']);

const warningList = ref<WarningVO[]>([]);
const latestWarning = ref<WarningVO | null>(null);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const warningFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: WarningForm = {
  warningLevel: undefined,
  predictionDate: undefined,
  tMean: undefined,
  rhMean: undefined,
  SSD: undefined,
  RF: undefined,
  ET0: undefined,
  recommendation: undefined
};

const data = reactive<PageData<WarningForm, WarningQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: undefined,
    warningLevel: undefined,
    predictionDate: undefined,
    tMean: undefined,
    rhMean: undefined,
    SSD: undefined,
    RF: undefined,
    ET0: undefined,
    recommendation: undefined,
    params: {}
  },
  rules: {
    warningLevel: [{ required: true, message: '预警等级不能为空', trigger: 'blur' }],
    predictionDate: [{ required: true, message: '预测日期不能为空', trigger: 'blur' }],
    tMean: [{ required: true, message: '平均温度不能为空', trigger: 'blur' }],
    rhMean: [{ required: true, message: '平均相对湿度不能为空', trigger: 'blur' }],
    SSD: [{ required: true, message: '日照时间不能为空', trigger: 'blur' }],
    RF: [{ required: true, message: '累计降水量不能为空', trigger: 'blur' }],
    ET0: [{ required: true, message: '参考作物蒸散量不能为空', trigger: 'blur' }],
    recommendation: [{ required: true, message: '建议措施不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询气象预警与建议数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listWarning(queryParams.value);
  warningList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const dataInit = async () => {
  await getList();
  // 仅在首次获取数据时，初始化最新状态
  latestWarning.value = warningList.value[0];
};

/** 根据预警等级获取标签类型 */
const getWarningLevelType = (level: string) => {
  switch (level) {
    case '轻度':
      return 'success';
    case '中度':
      return 'warning';
    case '重度':
      return 'danger';
    default:
      return 'info';
  }
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  warningFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: WarningVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加气象预警与建议数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: WarningVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getWarning(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改气象预警与建议数据';
};

/** 提交按钮 */
const submitForm = () => {
  warningFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateWarning(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWarning(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: WarningVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除气象预警与建议数据编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delWarning(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'pestcontrol/warning/export',
    {
      ...queryParams.value
    },
    `warning_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  dataInit();
});
</script>
