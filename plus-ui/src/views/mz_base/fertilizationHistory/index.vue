<template>
  <div class="p-2">
    <div v-show="showSearch" class="mb-[10px]">
      <el-card shadow="hover">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
          <!-- 2. 修改搜索栏中的地块名称输入框为下拉选择器 -->
          <el-form-item label="地块名称" prop="landId">
            <el-select v-model="queryParams.landId" placeholder="请选择配方施肥地块" clearable filterable @keyup.enter="handleQuery">
              <el-option v-for="dict in getSortedLandOptions()" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>

          <!-- 将年份输入框修改为日期选择器(年份选择器) -->
          <el-form-item label="年份" prop="yearFertilization">
            <el-date-picker
              v-model="queryParams.yearFertilization"
              type="year"
              placeholder="请选择年份"
              value-format="YYYY"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <el-card shadow="never">
      <el-table v-loading="loading" :data="fertilization_historyList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="配方施肥ID" align="center" prop="fertilizationId" v-if="false" />
        <el-table-column label="地块名称" align="center" prop="landCode" />
        <el-table-column label="配方概述" align="center" prop="summary" />
        <el-table-column label="年份" align="center" prop="yearFertilization" />
        <el-table-column label="操作人" align="center" prop="operationByName" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看" placement="top">
              <el-button
                link
                type="primary"
                icon="Search"
                @click="handleView(scope.row)"
                v-hasPermi="['mz_base:fertilization_history:query']"
              ></el-button>
            </el-tooltip>
            <!-- <el-tooltip content="下载" placement="top">
              <el-button link type="primary" icon="download" @click="handleDownload(scope.row)" v-hasPermi="['mz_base:fertilization_history:download']"></el-button>
            </el-tooltip> -->
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['mz_base:fertilization_history:remove']"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
  <el-dialog title="配方单" v-model="lookPdf" append-to-body>
    <iframe :src="pdfDataUrl" width="100%" height="800px"></iframe>
  </el-dialog>
  <div>
    <pdfTemplate v-if="onDown" ref="pdfContentRef" :info="info"></pdfTemplate>
  </div>
</template>

<script setup lang="ts">
import {
  listFertilization_history,
  getFertilization,
  delFertilization_history,
  addFertilization_history,
  updateFertilization_history,
  lookAtFertilization
} from '../api/fertilizationHistory/index';
import { FertilizationHistoryVO, FertilizationHistoryQuery, FertilizationHistoryForm } from '../api/fertilizationHistory/types';
import { FertilizationForm, LandUnitVO, PdfData } from '../api/fertilization/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getLandUnit } from '../api/fertilization';
import pdfTemplate from '../fertilization/pdfTemplate.vue';
import { landDictQuery } from '../api/tableDict';
import { useRouter } from 'vue-router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const fertilization_historyList = ref<FertilizationHistoryVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const fertilization_historyFormRef = ref<ElFormInstance>();
const onDown = ref(false);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FertilizationHistoryForm = {
  fertilizationId: undefined,
  landId: undefined,
  landCode: undefined,
  nutrientLand: undefined,
  outputTarget: undefined,
  nutrientNeed: undefined,
  nutrientRateSoil: undefined,
  nutrientRateOFertilizer: undefined,
  nutrientRateCFertilizer: undefined,
  situationOFertilizer: undefined,
  fertilizerCompound: undefined,
  fertilizerN: undefined,
  fertilizerP: undefined,
  fertilizerK: undefined,
  fertilizerCompoundVolumn: undefined,
  fertilizerNVolumn: undefined,
  fertilizerPVolumn: undefined,
  fertilizerKVolumn: undefined,
  summary: undefined,
  yearFertilization: undefined,
  operationBy: undefined,
  operationByName: undefined,
  remark: undefined,
  isValid: undefined,
  fertilizerCompoundVolumnAdjust: undefined,
  fertilizerNVolumnAdjust: undefined,
  fertilizerPVolumnAdjust: undefined,
  fertilizerKVolumnAdjust: undefined
};
const data = reactive<PageData<FertilizationHistoryForm, FertilizationHistoryQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    landId: undefined,
    landCode: undefined,
    yearFertilization: undefined,
    params: {}
  },
  rules: {
    landId: [{ required: true, message: '配方施肥地块不能为空', trigger: 'blur' }],
    nutrientLand: [{ required: true, message: '地块养分不能为空', trigger: 'blur' }],
    outputTarget: [{ required: true, message: '目标产量不能为空', trigger: 'blur' }],
    nutrientNeed: [{ required: true, message: '生成100kg籽粒所需的营养不能为空', trigger: 'blur' }],
    nutrientRateSoil: [{ required: true, message: '土壤养分利用率不能为空', trigger: 'blur' }],
    nutrientRateOFertilizer: [{ required: true, message: '有机肥养分利用率不能为空', trigger: 'blur' }],
    nutrientRateCFertilizer: [{ required: true, message: '肥料养分利用率不能为空', trigger: 'blur' }],
    fertilizerCompound: [{ required: true, message: '复合肥ID不能为空', trigger: 'blur' }],
    fertilizerN: [{ required: true, message: '氮肥ID不能为空', trigger: 'blur' }],
    fertilizerP: [{ required: true, message: '磷肥ID不能为空', trigger: 'blur' }],
    fertilizerK: [{ required: true, message: '钾肥ID不能为空', trigger: 'blur' }],
    fertilizerCompoundVolumn: [{ required: true, message: '复合肥施肥量不能为空', trigger: 'blur' }],
    fertilizerNVolumn: [{ required: true, message: '氮肥施肥量不能为空', trigger: 'blur' }],
    fertilizerPVolumn: [{ required: true, message: '磷肥施肥量不能为空', trigger: 'blur' }],
    fertilizerKVolumn: [{ required: true, message: '钾肥施肥量不能为空', trigger: 'blur' }],
    summary: [{ required: true, message: '配方概述不能为空', trigger: 'blur' }],
    yearFertilization: [{ required: true, message: '年份不能为空', trigger: 'blur' }],
    operationBy: [{ required: true, message: '操作人ID不能为空', trigger: 'blur' }],
    fertilizerCompoundVolumnAdjust: [{ required: true, message: '调整后复合肥施肥量不能为空', trigger: 'blur' }],
    fertilizerNVolumnAdjust: [{ required: true, message: '调整后氮肥施肥量不能为空', trigger: 'blur' }],
    fertilizerPVolumnAdjust: [{ required: true, message: '调整后磷肥施肥量不能为空', trigger: 'blur' }],
    fertilizerKVolumnAdjust: [{ required: true, message: '调整后钾肥施肥量不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 1. 首先，在script部分添加地块排序函数
function getSortedLandOptions() {
  // 创建普通数组，不是响应式的
  const options = landDict.value.filter((item) => item.isValid === 1).sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));

  // 假设landDict是您的地块字典数据源
  // if (landDict.value && landDict.value.length) {
  //   // 首先去重
  //   const uniqueValues = new Set();

  //   for (let i = 0; i < landDict.value.length; i++) {
  //     const item = landDict.value[i];
  //     if (!item || !item.value || !item.label) continue;

  //     // 去重处理
  //     if (uniqueValues.has(item.label)) continue;
  //     uniqueValues.add(item.label);

  //     // 添加到结果数组
  //     options.push({
  //       label: item.label,
  //       value: item.value
  //     });
  //   }
  // }

  // // 按照中文拼音排序
  // options.sort((a, b) => {
  //   return String(a.label).localeCompare(String(b.label), 'zh-CN', { sensitivity: 'accent' });
  // });

  return options;
}

/** 查询配方施肥历史列表 */
const getList = async () => {
  loading.value = true;
  const res = await listFertilization_history(queryParams.value);
  fertilization_historyList.value = res.rows;
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
  fertilization_historyFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: FertilizationHistoryVO[]) => {
  ids.value = selection.map((item) => item.fertilizationId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 删除按钮操作 */
const handleDelete = async (row?: FertilizationHistoryVO) => {
  const _fertilizationIds = row?.fertilizationId || ids.value;
  await proxy?.$modal.confirm('是否确认删除配方施肥历史编号为"' + _fertilizationIds + '"的数据项？').finally(() => (loading.value = false));
  await delFertilization_history(_fertilizationIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const info = ref<PdfData>({
  data_land: reactive<LandUnitVO>({
    landId: undefined,
    landCode: undefined,
    farmerId: undefined,
    farmerName: undefined,
    landLevel: undefined,
    slopeDirection: undefined,
    irrigation: undefined,
    drainage: undefined,
    landTexture: undefined,
    landArea: undefined,
    altitude: undefined,
    soilDensity: undefined,
    slope: undefined,
    rootDepth: undefined
  }),
  data_form: reactive<FertilizationForm>({
    fertilizationID: undefined,
    landId: undefined,
    landCode: undefined,
    area: undefined,
    rootDepth: undefined,
    soilDensity: undefined,
    nutrientLand: undefined,
    nutrientLandN: undefined,
    nutrientLandP: undefined,
    nutrientLandK: undefined,
    outputTarget: undefined,
    nutrientNeed: undefined,
    nutrientNeedN: undefined,
    nutrientNeedP: undefined,
    nutrientNeedK: undefined,
    nutrientRateSoil: undefined,
    nutrientRateSoilN: undefined,
    nutrientRateSoilP: undefined,
    nutrientRateSoilK: undefined,
    nutrientRateOFertilizer: undefined,
    nutrientRateOFertilizerN: undefined,
    nutrientRateOFertilizerP: undefined,
    nutrientRateOFertilizerK: undefined,
    nutrientRateCFertilizer: undefined,
    nutrientRateCFertilizerN: undefined,
    nutrientRateCFertilizerP: undefined,
    nutrientRateCFertilizerK: undefined,
    situationOFertilizer: undefined,
    fertilizerCompound: undefined,
    fertilizerN: undefined,
    fertilizerP: undefined,
    fertilizerK: undefined,
    fertilizerCompoundVolumn: undefined,
    fertilizerNVolumn: undefined,
    fertilizerPVolumn: undefined,
    fertilizerKVolumn: undefined,
    fertilizerCompoundVolumnAdjust: undefined,
    fertilizerNVolumnAdjust: undefined,
    fertilizerPVolumnAdjust: undefined,
    fertilizerKVolumnAdjust: undefined,
    yearFertilization: undefined,
    operationBy: undefined,
    summary: undefined,
    situation: undefined
  }),
  o_situation: [],
  schedule_desc: [],
  adjust_desc: [],
  hasAdjust: undefined,
  date: undefined
});

const pdfContentRef = ref(null);
const pdf = ref(null);
const pdfDataUrl = ref<string | null>(null);
const lookPdf = ref(false);

/** 查看按钮操作*/
const handleView = async (row?: FertilizationHistoryVO) => {
  const form = (await getFertilization(row.fertilizationId)).data;
  console.log(form);
  Object.assign(info.value.data_land, (await getLandUnit(row.landId)).data);
  Object.assign(info.value.data_form, form);
  const nu = form.nutrientLand.split(' ');
  info.value.data_land.rootDepth = 20;
  info.value.data_form.nutrientLandN = Number.parseFloat(nu[0]);
  info.value.data_form.nutrientLandP = Number.parseFloat(nu[1]);
  info.value.data_form.nutrientLandK = Number.parseFloat(nu[2]);
  const need = form.nutrientNeed.split(' ');
  info.value.data_form.nutrientNeedN = Number.parseFloat(need[0]);
  info.value.data_form.nutrientNeedP = Number.parseFloat(need[1]);
  info.value.data_form.nutrientNeedK = Number.parseFloat(need[2]);
  const soil = form.nutrientRateSoil.split(' ');
  info.value.data_form.nutrientRateSoilN = Number.parseFloat(soil[0]);
  info.value.data_form.nutrientRateSoilP = Number.parseFloat(soil[1]);
  info.value.data_form.nutrientRateSoilK = Number.parseFloat(soil[2]);
  const o = form.nutrientRateOFertilizer.split(' ');
  info.value.data_form.nutrientRateOFertilizerN = Number.parseFloat(o[0]);
  info.value.data_form.nutrientRateOFertilizerP = Number.parseFloat(o[1]);
  info.value.data_form.nutrientRateOFertilizerK = Number.parseFloat(o[2]);
  const c = form.nutrientRateCFertilizer.split(' ');
  info.value.data_form.nutrientRateCFertilizerN = Number.parseFloat(c[0]);
  info.value.data_form.nutrientRateCFertilizerP = Number.parseFloat(c[1]);
  info.value.data_form.nutrientRateCFertilizerK = Number.parseFloat(c[2]);
  info.value.o_situation = row.situation.split('；');
  info.value.schedule_desc = row.fertilizationDescribe.split('；');
  info.value.hasAdjust = form.fertilizerPVolumnAdjust !== null && form.fertilizerCompoundVolumnAdjust !== undefined;
  if (info.value.hasAdjust) {
    info.value.adjust_desc = row.fertilizationAdjustDescribe.split('；');
  }
  info.value.date = new Date();
  onDown.value = true;
  exportToPDF();
};

/** 下载按钮操作*/
const handleDownload = async (row?: FertilizationHistoryVO) => {
  pdf.value.save(row.landCode + '_' + row.yearFertilization + '.pdf');
};

const exportToPDF = async () => {
  await nextTick();

  const element = pdfContentRef.value?.pdfContent;
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2 });

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  pdf.value = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.value.internal.pageSize.getWidth();
  const pageHeight = pdf.value.internal.pageSize.getHeight();
  const imgProps = {
    width: canvas.width,
    height: canvas.height
  };

  // 将图片按比例缩放到 A4 纸大小
  const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
  const imgWidth = imgProps.width * ratio;
  const imgHeight = imgProps.height * ratio;

  pdf.value.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  pdfDataUrl.value = pdf.value.output('bloburl');
  lookPdf.value = true;
};

// 在script部分
const landDict = ref<DictDataOption[]>([]);

// 获取地块数据
const getDicts = async () => {
  let res = await landDictQuery(); // 使用您的API
  landDict.value = res.rows.filter((it) => it.isValid === 1);
};

onMounted(() => {
  getList();
  getDicts();
});

/*onMounted(() => {
  getList();
});*/
</script>
