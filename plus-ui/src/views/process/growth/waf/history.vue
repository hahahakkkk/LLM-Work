<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="基地" prop="baseId">
                  <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable>
                    <el-option v-for="dict in baseDict" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="地块" prop="plotId">
                  <el-select v-model="queryParams.plotId" placeholder="请选择地块" clearable :disabled="!queryParams.baseId">
                    <el-option v-for="dict in landDict" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生长时期" prop="growthPeriod">
                  <el-select v-model="queryParams.growthPeriod" placeholder="请选择生长时期" clearable>
                    <el-option v-for="dict in growth_diagnose_period" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <!-- <el-col :span="6">
                <el-form-item label="诊断模型" prop="diagnosisModel">
                  <el-select v-model="queryParams.diagnosisModel" placeholder="请选择诊断模型" clearable>
                    <el-option label="水肥亏缺诊断模型" value="水肥亏缺诊断模型" />
                    <el-option label="LAI_SPAD诊断模型" value="LAI_SPAD诊断模型" />
                    <el-option label="长势分析模型" value="长势分析模型" />
                  </el-select>
                </el-form-item>
              </el-col> -->
              <el-col :span="6">
                <el-form-item label="长势等级" prop="growthLevel">
                  <el-select v-model="queryParams.growthLevel" placeholder="请选择长势等级" clearable>
                    <el-option label="良好" value="良好" />
                    <el-option label="正常" value="正常" />
                    <el-option label="较差" value="较差" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="缺水等级" prop="waterLevel">
                  <el-select v-model="queryParams.waterLevel" placeholder="请选择缺水等级" clearable>
                    <el-option label="重度" value="重度" />
                    <el-option label="中度" value="中度" />
                    <el-option label="轻微" value="轻微" />
                    <el-option label="不缺水" value="不缺水" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="缺肥等级" prop="nutrientLevel">
                  <el-select v-model="queryParams.nutrientLevel" placeholder="请选择缺肥等级" clearable>
                    <el-option label="重度" value="重度" />
                    <el-option label="中度" value="中度" />
                    <el-option label="轻微" value="轻微" />
                    <el-option label="不缺肥" value="不缺肥" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-row>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb6">
          <el-col :span="1.5">
            <el-button v-hasPermi="['growth:waf:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['growth:waf:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['growth:waf:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['growth:waf:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="wafList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="基地" align="center" prop="baseId">
          <template #default="scope">
            <span>{{ getBaseNameLabel(scope.row.baseId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="地块" align="center" prop="plotId">
          <template #default="scope">
            <span>{{ getPlotLabel(scope.row.plotId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="生长时期" align="center" prop="growthPeriod">
          <template #default="scope">
            <dict-tag :options="growth_diagnose_period" :value="scope.row.growthPeriod" />
          </template>
        </el-table-column>
        <el-table-column label="LAI" align="center" prop="lai" />
        <el-table-column label="SPAD" align="center" prop="spad" />
        <el-table-column label="长势等级" align="center" prop="growthLevel">
          <template #default="scope">
            <el-tag :type="getGrowthLevelType(scope.row.growthLevel)">
              {{ scope.row.growthLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="缺水等级" align="center" prop="waterLevel">
          <template #default="scope">
            <el-tag :type="getWaterLevelType(scope.row.waterLevel)">
              {{ scope.row.waterLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="灌水量" align="center" prop="applyM3PerMu" width="120">
          <template #default="scope">
            <span>{{ scope.row.applyM3PerMu }} m³/亩</span>
          </template>
        </el-table-column>

        <el-table-column label="灌溉上限" align="center" prop="upperReal" />
        <el-table-column label="灌溉下限" align="center" prop="lowerReal" />
        <el-table-column label="缺肥等级" align="center" prop="nutrientLevel">
          <template #default="scope">
            <el-tag :type="getNutrientLevelType(scope.row.nutrientLevel)">
              {{ scope.row.nutrientLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150px">
          <template #default="scope">
            <el-tooltip content="查看" placement="top">
              <el-button v-hasPermi="['growth:waf:query']" link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="处方单下载" placement="top">
              <el-button link type="primary" icon="Download" @click="handleDownloadPrescription(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['growth:waf:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['growth:waf:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改水肥诊断数据对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="wafFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="基地编号" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地编号" clearable>
            <el-option v-for="dict in baseDict" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="地块编号" prop="plotId">
          <el-select v-model="form.plotId" placeholder="请选择地块编号" clearable>
            <el-option v-for="dict in landDict" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="生长时期" prop="growthPeriod">
          <el-select v-model="form.growthPeriod" placeholder="请选择生长时期" clearable>
            <el-option v-for="dict in growth_diagnose_period" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="LAI" prop="lai">
          <el-input v-model="form.lai" placeholder="请输入LAI" />
        </el-form-item>
        <el-form-item label="SPAD值" prop="spad">
          <el-input v-model="form.spad" placeholder="请输入SPAD值" />
        </el-form-item>
        <el-form-item label="长势等级" prop="growthLevel">
          <el-select v-model="form.growthLevel" placeholder="请选择长势等级" clearable>
            <el-option label="良好" value="良好" />
            <el-option label="正常" value="正常" />
            <el-option label="较差" value="较差" />
          </el-select>
        </el-form-item>
        <el-form-item label="缺水等级" prop="waterLevel">
          <el-select v-model="form.waterLevel" placeholder="请选择缺水等级" clearable>
            <el-option label="重度" value="重度" />
            <el-option label="中度" value="中度" />
            <el-option label="轻微" value="轻微" />
            <el-option label="不缺水" value="不缺水" />
          </el-select>
        </el-form-item>
        <el-form-item label="缺肥等级" prop="nutrientLevel">
          <el-select v-model="form.nutrientLevel" placeholder="请选择缺肥等级" clearable>
            <el-option label="重度" value="重度" />
            <el-option label="中度" value="中度" />
            <el-option label="轻微" value="轻微" />
            <el-option label="不缺肥" value="不缺肥" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="predictLoading" @click="autoPredict">自动预测</el-button>
        </el-form-item>
        <el-form-item label="缺水等级" prop="waterLevel">
          <el-input v-model="form.waterLevel" placeholder="请输入缺水等级" readonly />
        </el-form-item>
        <el-form-item label="灌水量" prop="applyM3PerMu">
          <el-input v-model="form.applyM3PerMu" placeholder="请输入本次应灌水量(m³/亩)" readonly />
        </el-form-item>
        <el-form-item label="灌溉上限" prop="upperReal">
          <el-input v-model="form.upperReal" placeholder="请输入模型给出的灌溉上限" readonly />
        </el-form-item>
        <el-form-item label="灌溉下限" prop="lowerReal">
          <el-input v-model="form.lowerReal" placeholder="请输入模型给出的灌溉下限" readonly />
        </el-form-item>
        <el-form-item label="缺肥等级" prop="nutrientLevel">
          <el-input v-model="form.nutrientLevel" placeholder="请输入缺肥等级" readonly />
        </el-form-item>
        <el-form-item label="诊断模型" prop="diagnosisModel">
          <el-select v-model="form.diagnosisModel" placeholder="请选择诊断模型" clearable>
            <el-option label="水肥亏缺诊断模型" value="水肥亏缺诊断模型" />
            <el-option label="LAI_SPAD诊断模型" value="LAI_SPAD诊断模型" />
            <el-option label="长势分析模型" value="长势分析模型" />
          </el-select>
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
    <!-- 水肥诊断结果展示卡片 -->
    <water-fertilizer-card
      v-model:visible="viewCardVisible"
      :base="resultData?.baseId ? getBaseNameLabel(resultData?.baseId) : ''"
      :plot-label="resultData?.plotId ? getPlotLabel(resultData?.plotId) : ''"
      :fertilizer-deficit-level="resultData?.nutrientLevel || ''"
      :water-deficit-level="resultData?.waterLevel || ''"
      :millet-water-trait="'抗旱持水'"
      :field-water-info="resultData?.upperReal || 0"
      :soil-moisture-level="'轻旱'"
      :irrigation-upper-limit="resultData?.upperReal || 0"
      :irrigation-lower-limit="resultData?.lowerReal || 0"
      :irrigation-water-amount="resultData?.applyM3PerMu?.toString() || ''"
      :growth-period="resultData?.growthPeriod ? getGrowthDiagnosePeriodLabel(resultData?.growthPeriod) : ''"
      :lai="resultData?.lai"
      :spad="resultData?.spad"
      :growth-level="resultData?.growthLevel"
    />

    <!-- 隐藏的处方单组件，仅用于生成PDF -->
    <div style="position: absolute; left: -9999px">
      <PrescriptionForm
        ref="prescriptionFormRef"
        :base="currentPrescriptionData?.base || ''"
        :plot-label="currentPrescriptionData?.plotLabel || ''"
        :growth-period="currentPrescriptionData?.growthPeriod ? getGrowthDiagnosePeriodLabel(currentPrescriptionData?.growthPeriod) : ''"
        :lai="currentPrescriptionData?.lai"
        :spad="currentPrescriptionData?.spad"
        :growth-level="currentPrescriptionData?.growthLevel"
        :fertilizer-deficit-level="currentPrescriptionData?.nutrientLevel || ''"
        :water-deficit-level="currentPrescriptionData?.waterLevel || ''"
        :millet-water-trait="currentPrescriptionData?.milletWaterTrait || '抗旱持水'"
        :field-water-info="currentPrescriptionData?.upperReal || 0"
        :soil-moisture-level="currentPrescriptionData?.soilMoistureLevel || '轻旱'"
        :irrigation-upper-limit="currentPrescriptionData?.upperReal || 0"
        :irrigation-lower-limit="currentPrescriptionData?.lowerReal || 0"
        :irrigation-water-amount="currentPrescriptionData?.applyM3PerMu?.toString() || ''"
        :water-suggestion="currentPrescriptionData?.waterSuggestion || ''"
        :fertilizer-suggestion="currentPrescriptionData?.fertilizerSuggestion || ''"
      />
    </div>
  </div>
</template>

<script setup name="Waf" lang="ts">
import { nextTick, reactive, ref, toRefs, getCurrentInstance, ComponentInternalInstance, watch } from 'vue';
import { listWaf, getWaf, delWaf, addWaf, updateWaf, waterFertilizerAssessment } from './api';
import { WafVO, WafQuery, WafForm } from './api/types';
import WaterFertilizerCard from '@/views/process/growth/components/WaterFertilizerCard.vue';
import PrescriptionForm from '@/views/process/growth/components/PrescriptionForm.vue';
import { baseDictQuery, landDictQuery } from '@/views/process/growth/api/tableDict'; // 统一字典接口
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo'; // 特定地块接口
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 在其他方法后面添加测试方法
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { growth_diagnose_period } = toRefs<any>(proxy?.useDict('growth_diagnose_period')); // 使用 growth_diagnose_period 字典

const wafList = ref<WafVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const wafFormRef = ref<ElFormInstance>();

// 字典数据
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);
// 存储所有地块数据，避免重复请求
const allLandDict = ref<DictDataOption[]>([]);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: WafForm = {
  id: undefined,
  baseId: undefined,
  plotId: undefined,
  growthPeriod: undefined,
  lai: undefined,
  spad: undefined,
  growthLevel: undefined,
  waterLevel: undefined,
  applyM3PerMu: undefined,
  upperReal: undefined,
  lowerReal: undefined,
  nutrientLevel: undefined,
  diagnosisModel: '水肥亏缺诊断模型', // 设置默认值
  remark: undefined
};
const data = reactive<PageData<WafForm, WafQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    plotId: undefined,
    growthPeriod: undefined,
    lai: undefined,
    spad: undefined,
    growthLevel: undefined,
    waterLevel: undefined,
    applyM3PerMu: undefined,
    upperReal: undefined,
    lowerReal: undefined,
    nutrientLevel: undefined,
    diagnosisModel: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '基地不能为空', trigger: 'blur' }],
    plotId: [{ required: true, message: '地块不能为空', trigger: 'blur' }],
    growthPeriod: [{ required: true, message: '生长时期不能为空', trigger: 'blur' }],
    lai: [{ required: true, message: 'LAI不能为空', trigger: 'blur' }],
    spad: [{ required: true, message: 'SPAD值不能为空', trigger: 'blur' }],
    growthLevel: [{ required: true, message: "长势等级 ('良好', '正常', '较差')不能为空", trigger: 'blur' }],
    waterLevel: [{ required: true, message: "缺水等级('重度','中度','轻微','不缺水')不能为空", trigger: 'blur' }],
    applyM3PerMu: [{ required: true, message: '本次应灌水量(m³/亩)不能为空', trigger: 'blur' }],
    upperReal: [{ required: true, message: '模型给出的灌溉上限不能为空', trigger: 'blur' }],
    lowerReal: [{ required: true, message: '模型给出的灌溉下限不能为空', trigger: 'blur' }],
    nutrientLevel: [{ required: true, message: "缺肥等级('轻微', '中度', '重度')不能为空", trigger: 'blur' }],
    diagnosisModel: [{ required: true, message: '诊断模型不能为空', trigger: 'blur' }]
  }
});
reactive<DialogOption>({
  visible: false,
  title: '水肥诊断结果'
});
const resultData = ref<WafVO | null>(null);
const viewCardVisible = ref(false);

/** 查看按钮操作 */
const handleView = (row: WafVO) => {
  resultData.value = row;
  viewCardVisible.value = true;
};

const { queryParams, form, rules } = toRefs(data);

/**
 * 基地、地块字典
 */
const getDicts = async () => {
  // 获取基地字典
  try {
    const res = await baseDictQuery();
    baseDict.value =
      res.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];
  } catch (error) {
    console.error('获取基地字典失败:', error);
    baseDict.value = [];
  }

  // 初始化时获取所有地块数据
  try {
    const res = await landDictQuery();
    allLandDict.value =
      res.rows?.map((item) => ({
        value: String(item.value),
        label: String(item.label)
      })) || [];
    // 同时更新当前显示的地块数据
    landDict.value = [...allLandDict.value];
  } catch (error) {
    console.error('获取地块字典失败:', error);
    allLandDict.value = [];
    landDict.value = [];
  }
};

// 监听搜索表单中基地选择变化，加载对应地块选项
watch(
  () => queryParams.value.baseId,
  async (newBaseId) => {
    if (!newBaseId) {
      queryParams.value.plotId = undefined;
      // 使用已缓存的所有地块数据
      landDict.value = [...allLandDict.value];
      return;
    }

    // 加载选中基地下的地块
    try {
      const res = await fetchFarmerLands({ baseId: newBaseId });
      landDict.value =
        res.rows?.map((item) => ({
          value: String(item.landId),
          label: String(item.landCode)
        })) || [];
    } catch (error) {
      console.error('获取地块字典失败:', error);
      landDict.value = [];
    }
  }
);

// 监听表单中基地选择变化，加载对应地块选项
watch(
  () => form.value.baseId,
  async (newBaseId) => {
    if (!newBaseId) {
      form.value.plotId = undefined;
      // 使用已缓存的所有地块数据
      landDict.value = [...allLandDict.value];
      return;
    }

    // 加载选中基地下的地块
    try {
      const res = await fetchFarmerLands({ baseId: newBaseId });
      landDict.value =
        res.rows?.map((item) => ({
          value: String(item.landId),
          label: String(item.landCode)
        })) || [];
    } catch (error) {
      console.error('获取地块字典失败:', error);
      landDict.value = [];
    }
  }
);

/** 获取基地名称标签 */
const getBaseNameLabel = (baseValue: string | undefined) => {
  if (!baseValue) return '';

  const baseOption = baseDict.value.find((option) => option.value === baseValue);
  return baseOption ? baseOption.label : baseValue;
};

/** 根据地块ID获取地块标签 */
const getPlotLabel = (plotId: string | number | undefined) => {
  if (!plotId) return '';

  // 使用所有地块字典来获取标签，而不是表单用的地块字典
  const plotOption = allLandDict.value.find((option) => option.value == plotId);
  let label = plotOption ? plotOption.label : plotId;

  // 特殊处理：替换特定编码前缀为中文名称
  if (typeof label === 'string') {
    if (label.startsWith('hjg') && !label.startsWith('hjgn')) {
      return label.replace('hjg', '侯家沟');
    }
    if (label.startsWith('hjgn')) {
      return label.replace('hjgn', '侯家沟南');
    }
  }

  // 对于数字类型的ID，尝试在字典中查找对应的标签
  if (typeof label === 'string' && /^\d+$/.test(label)) {
    // 如果label是纯数字，再次确认是否能在字典中找到对应的标签
    const dictOption = allLandDict.value.find((option) => option.value == label);
    if (dictOption) {
      label = dictOption.label;
    }
  }

  return label;
};

/** 根据生长时期ID获取生长时期标签 */
const getGrowthPeriodLabel = (growthPeriod: string | undefined) => {
  if (!growthPeriod) return '';

  const growthPeriodOption = growth_diagnose_period.value.find((option: DictDataOption) => option.value === growthPeriod);
  return growthPeriodOption ? growthPeriodOption.label : growthPeriod;
};

// 获取生长诊断期间标签
const getGrowthDiagnosePeriodLabel = (value: string) => {
  // 添加安全检查，确保 growth_diagnose_period.value 存在
  if (!growth_diagnose_period || !growth_diagnose_period.value) {
    console.warn('growth_diagnose_period 字典数据未加载');
    return value;
  }

  const period = growth_diagnose_period.value.find((item: any) => item.value === value);
  return period ? period.label : value;
};

/** 获取长势等级类型 */
const getGrowthLevelType = (level: string) => {
  if (level === '良好') return 'success';
  if (level === '正常') return 'info';
  if (level === '较差') return 'danger';
  return 'info';
};

/** 获取缺水等级类型 */
const getWaterLevelType = (level: string) => {
  if (level.includes('重度')) return 'danger';
  if (level.includes('中度')) return 'warning';
  if (level.includes('轻微')) return 'info';
  return 'info';
};

/** 获取缺肥等级类型 */
const getNutrientLevelType = (level: string) => {
  if (level.includes('重度')) return 'danger';
  if (level.includes('中度')) return 'warning';
  if (level.includes('轻微')) return 'info';
  return 'info';
};

/** 查询水肥诊断数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listWaf(queryParams.value);
  console.log('水肥诊断数据列表:', res);

  // 确保数值字段正确显示
  wafList.value = res.rows.map((item) => {
    return {
      ...item,
      lai: item.lai !== undefined ? parseFloat(item.lai.toString()) : undefined,
      spad: item.spad !== undefined ? parseFloat(item.spad.toString()) : undefined,
      applyM3PerMu: item.applyM3PerMu !== undefined ? parseFloat(item.applyM3PerMu.toString()) : undefined,
      upperReal: item.upperReal !== undefined ? parseFloat(item.upperReal.toString()) : undefined,
      lowerReal: item.lowerReal !== undefined ? parseFloat(item.lowerReal.toString()) : undefined
    };
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
  wafFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: WafVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加水肥诊断数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: WafVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getWaf(_id);

  // 确保数值字段正确处理
  const data = {
    ...res.data,
    lai: res.data.lai !== undefined ? parseFloat(res.data.lai.toString()) : undefined,
    spad: res.data.spad !== undefined ? parseFloat(res.data.spad.toString()) : undefined,
    applyM3PerMu: res.data.applyM3PerMu !== undefined ? parseFloat(res.data.applyM3PerMu.toString()) : undefined,
    upperReal: res.data.upperReal !== undefined ? parseFloat(res.data.upperReal.toString()) : undefined,
    lowerReal: res.data.lowerReal !== undefined ? parseFloat(res.data.lowerReal.toString()) : undefined
  };

  Object.assign(form.value, data);
  dialog.visible = true;
  dialog.title = '修改水肥诊断数据';
};

/** 提交按钮 */
const submitForm = () => {
  wafFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      // 确保数值字段被正确转换为数字类型
      const formData = {
        ...form.value,
        lai: form.value.lai !== undefined && form.value.lai !== null ? parseFloat(form.value.lai.toString()) : undefined,
        spad: form.value.spad !== undefined && form.value.spad !== null ? parseFloat(form.value.spad.toString()) : undefined,
        applyM3PerMu:
          form.value.applyM3PerMu !== undefined && form.value.applyM3PerMu !== null ? parseFloat(form.value.applyM3PerMu.toString()) : undefined,
        upperReal: form.value.upperReal !== undefined && form.value.upperReal !== null ? parseFloat(form.value.upperReal.toString()) : undefined,
        lowerReal: form.value.lowerReal !== undefined && form.value.lowerReal !== null ? parseFloat(form.value.lowerReal.toString()) : undefined
      };

      if (form.value.id) {
        await updateWaf(formData).finally(() => (buttonLoading.value = false));
      } else {
        await addWaf(formData).finally(() => (buttonLoading.value = false));
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
  await proxy?.$modal.confirm('是否确认删除水肥诊断数据编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delWaf(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'process/growth/waf/export',
    {
      ...queryParams.value
    },
    `waf_${new Date().getTime()}.xlsx`
  );
};

const predictLoading = ref(false);

// 自动预测方法
const autoPredict = async () => {
  if (!form.value.lai || !form.value.spad || !form.value.growthLevel) {
    proxy?.$modal.msgWarning('请输入LAI值、SPAD值和选择长势等级');
    return;
  }

  try {
    predictLoading.value = true;
    const testData = {
      lai: parseFloat(form.value.lai.toString()),
      spadValue: parseFloat(form.value.spad.toString()),
      growthLevel: form.value.growthLevel
    };

    const res = await waterFertilizerAssessment(testData);
    console.log('自动预测结果:', res);

    // 根据返回结果填充表单
    if (res.data) {
      // 检查返回的数据结构
      const waterData = res.data.data.water_assess;
      const fertilizerData = res.data.data.fertilization_assess;

      console.log('waterData:', waterData);
      console.log('fertilizerData:', fertilizerData);

      if (waterData) {
        form.value.waterLevel = waterData.water_level;
        // 保持浮点数精度
        form.value.applyM3PerMu = parseFloat(waterData.irrigation_amount_m3_per_mu);
        form.value.upperReal = parseFloat(waterData.upper_limit_actual);
        form.value.lowerReal = parseFloat(waterData.lower_limit_actual);
      }

      if (fertilizerData) {
        form.value.nutrientLevel = fertilizerData.deficit_level;
        // 保持用户选择的长势等级
      }

      proxy?.$modal.msgSuccess('自动预测完成');
    }
  } catch (error) {
    console.error('自动预测失败:', error);
    proxy?.$modal.msgError('自动预测失败: ' + error);
  } finally {
    predictLoading.value = false;
  }
};

// 添加处方单相关引用和数据
const prescriptionFormRef = ref<InstanceType<typeof PrescriptionForm> | null>(null);

// 当前处方单数据
const currentPrescriptionData = ref<any>(null);

/** 处方单下载按钮操作 */
const handleDownloadPrescription = async (row: WafVO) => {
  // 设置当前处方单数据
  currentPrescriptionData.value = {
    base: row.baseId ? getBaseNameLabel(row.baseId) : '',
    plotLabel: row.plotId ? getPlotLabel(row.plotId) : '',
    growthPeriod: row.growthPeriod ? getGrowthPeriodLabel(row.growthPeriod) : '',
    lai: row.lai,
    spad: row.spad,
    growthLevel: row.growthLevel,
    nutrientLevel: row.nutrientLevel || '',
    waterLevel: row.waterLevel || '',
    milletWaterTrait: '抗旱持水',
    fieldWaterInfo: row.upperReal || 0,
    soilMoistureLevel: '轻旱',
    upperReal: row.upperReal || 0,
    lowerReal: row.lowerReal || 0,
    applyM3PerMu: row.applyM3PerMu,
    waterSuggestion: '', // 这里可以添加具体的建议内容
    fertilizerSuggestion: '' // 这里可以添加具体的建议内容
  };

  // 等待DOM更新
  await nextTick();

  // 确保处方单组件引用存在
  if (!prescriptionFormRef.value) {
    console.error('处方单组件引用不存在');
    return;
  }

  // 获取处方单元素
  const prescriptionElement = prescriptionFormRef.value.prescriptionRef;
  if (!prescriptionElement) {
    console.error('处方单元素不存在');
    return;
  }

  try {
    // 使用html2canvas截图
    const canvas = await html2canvas(prescriptionElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff'
    });

    // 创建PDF (A4尺寸: 210mm x 297mm)
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 计算图像在PDF中的尺寸
    const imgWidth = 210; // A4宽度
    const pageHeight = 297; // A4高度
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // 只有当内容高度超过一页时才分页
    if (imgHeight > pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 如果内容高度超过一页，则添加新页面
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    } else {
      // 内容未超过一页，居中显示
      const yOffset = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
    }

    // 生成文件名并下载
    const plotLabel = row.plotId ? getPlotLabel(row.plotId) : '未知地块';
    pdf.save(`${plotLabel}号地水肥亏缺诊断处方单.pdf`);
  } catch (error) {
    console.error('下载处方单失败:', error);
  }
};

onMounted(() => {
  getList();
  getDicts();
});
</script>
