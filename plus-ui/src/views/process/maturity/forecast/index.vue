<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地编号" prop="baseId">
              <BaseSelector v-model="queryParams.baseId" width="150px" placeholder="请选择基地" @change="handleBaseChange" />
            </el-form-item>

            <el-form-item label="地块编号" prop="plotId">
              <PlotSelector v-model="queryParams.plotId" :base-id="queryParams.baseId" width="150px" placeholder="请选择地块" />
            </el-form-item>
            <el-form-item label="品种" prop="variety">
              <el-select v-model="queryParams.variety" placeholder="请选择品种" clearable filterable>
                <el-option v-for="dict in crop_variety" :key="dict.value" :label="dict.label" :value="dict.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="成熟度" prop="">
              <el-select v-model="queryParams.ripenessStatus" placeholder="请选择成熟度" clearable filterable>
                <el-option v-for="dict in ripenessStatusDict" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
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
            <el-button v-hasPermi="['maturity:forecast:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['maturity:forecast:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['maturity:forecast:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['maturity:forecast:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="forecastList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="基地编号" align="center" prop="baseId">
          <template #default="scope">
            <span>{{ getBaseNameLabel(scope.row.baseId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="地块编号" align="center" prop="plotId">
          <template #default="scope">
            <span>{{ getPlotLabel(scope.row.plotId) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="诊断时间" align="center" prop="diagnosisTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.diagnosisTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="原始图像" align="center" prop="originalImageUrl">
          <template #default="scope">
            <el-image
              :src="scope.row.originalImageUrl"
              :preview-src-list="[scope.row.originalImageUrl]"
              preview-teleported
              style="width: 80px; height: 60px"
              fit="cover"
              lazy
            >
              <template #error>
                <div class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column label="NDVI图像" align="center" prop="ndviImageUrl">
          <template #default="scope">
            <el-image
              :src="scope.row.ndviImageUrl"
              :preview-src-list="[scope.row.ndviImageUrl]"
              preview-teleported
              style="width: 80px; height: 60px"
              fit="cover"
              lazy
            >
              <template #error></template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column label="结果图像" align="center" prop="resultImageUrl">
          <template #default="scope">
            <el-image
              :src="scope.row.resultImageUrl"
              :preview-src-list="[scope.row.resultImageUrl]"
              preview-teleported
              style="width: 80px; height: 60px"
              fit="cover"
              lazy
            >
              <template #error>
                <div class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column label="成熟度" align="center" prop="ripenessStatus">
          <template #default="scope">
            <el-tag v-if="String(scope.row.ripenessStatus) === '0'" type="warning">未成熟</el-tag>
            <el-tag v-else-if="String(scope.row.ripenessStatus) === '1'" type="success">已成熟</el-tag>
            <span v-else>{{ getRipenessStatusLabel(scope.row.ripenessStatus) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="种植年份" align="center" prop="plantingYear" />
        <el-table-column label="种植品种" align="center" prop="variety">
          <template #default="scope">
            <span>{{ getVarietyLabel(scope.row.variety) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="种植面积" align="center" prop="plantingArea">
          <template #default="scope">
            <span>{{ scope.row.plantingArea }}亩</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150px">
          <template #default="scope">
            <el-tooltip content="查看" placement="top">
              <el-button v-hasPermi="['maturity:forecast:query']" link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="处方单下载" placement="top">
              <el-button link type="primary" icon="Download" @click="handleDownloadPrescription(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['maturity:forecast:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['maturity:forecast:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改种植预测对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="forecastFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="基地编号" prop="baseId">
          <BaseSelector v-model="form.baseId" width="100%" placeholder="请选择基地" @change="handleFormBaseChange" />
        </el-form-item>
        <el-form-item label="地块编号" prop="plotId">
          <PlotSelector v-model="form.plotId" :base-id="form.baseId" width="100%" placeholder="请选择地块" />
        </el-form-item>
        <el-form-item label="诊断时间" prop="diagnosisTime">
          <el-date-picker v-model="form.diagnosisTime" clearable type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择诊断时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="原始图像" prop="originalImageOss">
          <file-upload v-model="form.originalImageOss" :limit="1" :file-size="1024" :file-type="['tif', 'tiff']" />
          <el-button v-if="form.originalImageOss" type="primary" style="margin-top: 10px" @click="fetchPredictionResult">成熟度预测</el-button>
        </el-form-item>

        <el-form-item label="原始图像" prop="originalImageUrl">
          <el-input v-model="form.originalImageUrl" placeholder="请输入原始图像URL" />
        </el-form-item>
        <el-form-item label="NDVI图像" prop="originalImageUrl">
          <el-input v-model="form.ndviImageUrl" placeholder="请输入NDVI图像URL" />
        </el-form-item>
        <el-form-item label="成熟度结果" prop="resultImageUrl">
          <el-input v-model="form.resultImageUrl" placeholder="请输入结果图像URL" />
        </el-form-item>
        <el-form-item label="种植年份" prop="plantingYear">
          <el-input v-model="form.plantingYear" placeholder="请输入种植年份" />
        </el-form-item>
        <el-form-item label="品种" prop="variety">
          <el-select v-model="form.variety" placeholder="请选择种植谷子品种">
            <el-option v-for="dict in crop_variety" :key="dict.value" :label="dict.label" :value="dict.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="种植面积" prop="plantingArea">
          <el-input v-model="form.plantingArea" placeholder="请输入种植面积">
            <template #suffix>亩</template>
          </el-input>
        </el-form-item>
        <el-form-item label="成熟度" prop="ripenessStatus">
          <el-select v-model="form.ripenessStatus" placeholder="请选择成熟度">
            <el-option v-for="dict in ripenessStatusDict" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
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

    <!-- 采收推荐结果展示卡片 -->
    <recommend-card
      v-model:visible="viewCardVisible"
      :base="resultData?.baseId ? getBaseNameLabel(resultData?.baseId) : ''"
      :plot-label="resultData?.plotId ? getPlotLabel(resultData?.plotId) : ''"
      :mature-level="resultData?.ripenessStatus === 1 ? '成熟' : '未成熟'"
      :variety="resultData?.variety || ''"
      :weather-conditions="'晴天'"
      :planting-area="resultData?.plantingArea || 0"
      :disaster-situation="'无灾害'"
    />

    <div style="position: absolute; left: -9999px">
      <PrescriptionForm
        ref="prescriptionFormRef"
        :base="currentPrescriptionData?.base || ''"
        :plot-label="currentPrescriptionData?.plotLabel || ''"
        :mature-level="currentPrescriptionData?.matureLevel === 1 ? '成熟' : '未成熟'"
        :variety="currentPrescriptionData?.variety || ''"
        :weather-conditions="'晴天'"
        :planting-area="currentPrescriptionData?.plantingArea || 0"
        :disaster-situation="'无灾害'"
        :growth-period="'成熟期'"
        :harvesting-suggestion="currentPrescriptionData?.harvestingSuggestion || ''"
      />
    </div>
  </div>
</template>

<script setup name="Forecast" lang="ts">
import { listForecast, getForecast, delForecast, addForecast, updateForecast } from './api';
import { ForecastVO, ForecastQuery, ForecastForm } from './api/types';
import BaseSelector from '@/views/process/growth/components/BaseSelector.vue';
import PlotSelector from '@/views/process/growth/components/PlotSelector.vue';
// 引入播种与收割相关API和类型
import { listSowHarvest } from '@/views/mz_base/api/sowHarvest';
import PrescriptionForm from '@/views/process/maturity/components/PrescriptionForm.vue';
import type { SowHarvestQuery } from '@/views/mz_base/api/sowHarvest/types';
import { baseDictQuery, landDictQuery } from '@/views/process/growth/api/tableDict'; // 统一字典接口
// 特定地块接口
import { getLandUnit } from '@/views/powland/api/landUnit'; // 获取地块详情
import { ripenessPrediction } from '@/views/process/growth/api/modelForward'; // 成熟度预测接口
import { listByIds } from '@/api/system/oss';
import { nextTick, ref } from 'vue';
import RecommendCard from '@/views/process/maturity/components/RecommendCard.vue'; // 添加这一行用于获取文件URL
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { crop_variety } = toRefs<any>(proxy?.useDict('crop_variety'));

// 成熟度状态字典
const ripenessStatusDict = ref<DictDataOption[]>([
  { label: '未成熟', value: '0' },
  { label: '已成熟', value: '1' }
]);

// 获取成熟度标签
const getRipenessStatusLabel = (value: string | number | undefined) => {
  if (value === undefined || value === null) return '';
  // 首先检查是否已经是标签文本
  if (value === '未成熟' || value === '已成熟') {
    return value;
  }
  // 如果是数字代码，则进行转换
  const option = ripenessStatusDict.value.find((item) => item.value === String(value));
  return option ? option.label : String(value);
};

const forecastList = ref<ForecastVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

// 字典数据
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);
// 存储所有地块数据，避免重复请求
const allLandDict = ref<DictDataOption[]>([]);

// 获取品种标签
const getVarietyLabel = (varietyValue: string | number | undefined) => {
  if (!varietyValue) return '';

  // 先尝试在字典中查找匹配的标签
  const varietyOption = crop_variety.value?.find((option: DictDataOption) => option.value === String(varietyValue));
  if (varietyOption) {
    return varietyOption.label;
  }

  // 如果没找到，则认为传入的就是明文
  return String(varietyValue);
};

// 获取基地名称标签
const getBaseNameLabel = (baseValue: string | number | undefined) => {
  if (!baseValue) return '';

  const baseOption = baseDict.value.find((option) => option.value === String(baseValue));
  return baseOption ? baseOption.label : String(baseValue);
};

// 获取地块标签
const getPlotLabel = (plotValue: string | number | undefined) => {
  if (!plotValue) return '';

  const plotOption = landDict.value.find((option) => option.value === String(plotValue));
  return plotOption ? plotOption.label : String(plotValue);
};

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
    console.log('allLandDict.value:', allLandDict.value);
    // 同时更新当前显示的地块数据
    landDict.value = [...allLandDict.value];
  } catch (error) {
    console.error('获取地块字典失败:', error);
    allLandDict.value = [];
    landDict.value = [];
  }
};

const queryFormRef = ref<ElFormInstance>();
const forecastFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ForecastForm = {
  id: undefined,
  baseId: undefined,
  plotId: undefined,
  ndviImageUrl: undefined,
  diagnosisTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  diagnosisModel: '无人机模型',
  originalImageOss: undefined,
  originalImageUrl: undefined,
  resultImageUrl: undefined,
  ripenessStatus: undefined,
  plantingYear: new Date().getFullYear(),
  variety: undefined,
  plantingArea: undefined
};
const data = reactive<PageData<ForecastForm, ForecastQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    plotId: undefined,
    ndvi_image_url: undefined,
    diagnosisTime: undefined,
    diagnosisModel: '无人机模型',
    originalImageOss: undefined,
    originalImageUrl: undefined,
    resultImageUrl: undefined,
    ripenessStatus: undefined,
    plantingYear: new Date().getFullYear(),
    variety: undefined,
    plantingArea: undefined,
    // 按诊断时间倒序排序，保证“全部数据”层面最新在前
    orderByColumn: 'diagnosisTime',
    isAsc: 'desc',
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    // baseId: [{ required: true, message: '基地编号不能为空', trigger: 'blur' }],
    plotId: [{ required: true, message: '地块编号不能为空', trigger: 'blur' }],
    diagnosisTime: [{ required: true, message: '诊断时间不能为空', trigger: 'blur' }],
    diagnosisModel: [{ required: true, message: '诊断模型不能为空', trigger: 'blur' }],
    ripenessStatus: [{ required: true, message: '成熟度不能为空', trigger: 'change' }],
    variety: [{ required: true, message: '品种不能为空', trigger: 'blur' }],
    plantingArea: [{ required: true, message: '种植面积不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const resultData = ref<ForecastVO | null>(null);
const viewCardVisible = ref(false);

/** 查询种植预测列表 */
const getList = async () => {
  loading.value = true;
  console.log('queryParams', queryParams.value);
  const res = await listForecast(queryParams.value);
  console.log('listForecast:', res);
  // 这里不再前端排序，改为通过后端 orderByColumn/isAsc 对“全表”排序
  forecastList.value = res.rows;
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
  forecastFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ForecastVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加种植预测';
};

// 添加处方单相关引用和数据
const prescriptionFormRef = ref<InstanceType<typeof PrescriptionForm> | null>(null);

// 当前处方单数据
const currentPrescriptionData = ref<any>(null);

/** 处方单下载按钮操作 */
const handleDownloadPrescription = async (row: ForecastVO) => {
  // 设置当前处方单数据
  currentPrescriptionData.value = {
    base: row.baseId ? getBaseNameLabel(row.baseId) : '',
    plotLabel: row.plotId ? getPlotLabel(row.plotId) : '',
    matureLevel: row.ripenessStatus,
    variety: row.variety,
    weatherConditions: '晴天',
    disasterSituation: '无灾害',
    plantingArea: row.plantingArea || 0,
    harvestingSuggestion: '' // 这里可以添加具体的建议内容
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
    pdf.save(`${plotLabel}号地采收推荐诊断处方单.pdf`);
  } catch (error) {
    console.error('下载处方单失败:', error);
  }
};

/** 查看按钮操作 */
const handleView = (row: ForecastVO) => {
  resultData.value = row;
  viewCardVisible.value = true;
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ForecastVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getForecast(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改种植预测';
};

/** 提交按钮 */
const submitForm = () => {
  forecastFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateForecast(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addForecast(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ForecastVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除种植预测编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delForecast(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'process/maturity/forecast/export',
    {
      ...queryParams.value
    },
    `forecast_${new Date().getTime()}.xlsx`
  );
};

/**
 * 处理基地选择变化
 */
const handleBaseChange = (baseId: string | undefined) => {
  // 清空已选择的地块
  queryParams.value.plotId = undefined;
};

/**
 * 处理表单中基地选择变化
 */
const handleFormBaseChange = (baseId: string | undefined) => {
  // 清空已选择的地块
  form.value.plotId = undefined;
};

/**
 * 根据年份和地块查询品种
 * @param year 年份
 * @param plotId 地块ID
 */
const fetchVarietyByYearAndPlot = async (year: string | number, plotId: string | number) => {
  if (!year || !plotId) return;

  try {
    // 构造查询参数
    const query: SowHarvestQuery = {
      shYear: String(year),
      landId: String(plotId),
      pageNum: 1,
      pageSize: 10
    };

    // 调用API查询播种与收割记录
    const res = await listSowHarvest(query);

    // 如果查询到数据且有cropVariety字段
    if (res.rows && res.rows.length > 0 && res.rows[0].cropVariety) {
      // 设置品种字段，确保使用明文而不是编码
      const varietyCode = res.rows[0].cropVariety;
      const varietyLabel = getVarietyLabel(varietyCode);
      form.value.variety = varietyLabel;
    } else {
      // 未查到品种信息，弹出警告
      proxy?.$modal.msgWarning(`未找到${year}年份在该地块的种植品种信息`);
    }
  } catch (error) {
    console.error('查询品种信息失败:', error);
    proxy?.$modal.msgError('查询品种信息失败');
  }
};

// 监听年份和地块的变化
watch([() => form.value.plantingYear, () => form.value.plotId], ([newYear, newPlotId]) => {
  // 当年份和地块都有值时触发查询
  if (newYear && newPlotId) {
    fetchVarietyByYearAndPlot(newYear, newPlotId);
  }
});

/**
 * 当地块选择变化时，自动填充种植面积
 * @param plotId 地块ID
 */
const fetchPlantingAreaByPlot = async (plotId: string | number | undefined) => {
  if (!plotId) {
    // 如果没有选择地块，清空种植面积
    form.value.plantingArea = undefined;
    return;
  }

  try {
    // 调用API获取地块详情
    console.log('获取地块信息', plotId);
    const res = await getLandUnit(plotId);
    console.log('获取地块信息', res);
    // 如果获取到数据且有landArea字段，设置种植面积
    if (res.data && res.data.landArea) {
      form.value.plantingArea = res.data.landArea;
    } else {
      form.value.plantingArea = undefined;
    }
  } catch (error) {
    console.error('获取地块信息失败:', error);
    proxy?.$modal.msgError('获取地块信息失败');
    form.value.plantingArea = undefined;
  }
};

// 监听表单中地块选择的变化，自动填充种植面积
watch(
  () => form.value.plotId,
  (newPlotId) => {
    fetchPlantingAreaByPlot(newPlotId);
  }
);

/**
 * 获取预测结果
 */
const fetchPredictionResult = async () => {
  if (!form.value.originalImageOss) {
    proxy?.$modal.msgWarning('请先上传原始图像');
    return;
  }

  buttonLoading.value = true;
  try {
    // 检查originalImageOss是否是URL格式（以http开头）
    let imageUrl = '';
    if (typeof form.value.originalImageOss === 'string' && form.value.originalImageOss.startsWith('http')) {
      // 如果是URL，直接使用
      imageUrl = form.value.originalImageOss;
    } else {
      // 如果是ID，通过ID获取完整文件信息
      try {
        const res = await listByIds(form.value.originalImageOss);
        if (res.data && res.data.length > 0) {
          imageUrl = res.data[0].url;
        } else {
          throw new Error('无法获取图像URL');
        }
      } catch (error) {
        console.error('获取原始图像URL失败:', error);
        proxy?.$modal.msgError('获取原始图像URL失败: ' + (error as Error).message);
        buttonLoading.value = false;
        return;
      }
    }

    // 使用获取到的imageUrl进行预测
    const response = await ripenessPrediction({ image: imageUrl });

    // 将返回的结果设置到表单中
    // 根据实际返回结果调整字段
    if (response.data && (response.data.ndviAutoscalePng || response.data.ndviThresholdPng)) {
      // 使用 ndviThresholdPng 作为结果图像，因为这应该是二值化的成熟度结果图
      form.value.originalImageUrl = response.data.ndviAutoscalePng?.url;
      form.value.resultImageUrl = response.data.ndviThresholdPng?.url;

      // 根据NDVI平均值判断成熟度状态
      // 根据项目经验，NDVI平均值小于0.3为成熟('1')，大于等于0.3为未成熟('0')
      if (response.data.mean_ndvi !== undefined) {
        form.value.ripenessStatus = response.data.mean_ndvi < 0.706 ? '1' : '0';
      }

      proxy?.$modal.msgSuccess('预测成功');
    } else {
      proxy?.$modal.msgError('预测失败，未返回结果图像URL');
    }
  } catch (error) {
    console.error('获取预测结果失败:', error);
    proxy?.$modal.msgError('获取预测结果失败: ' + (error as Error).message);
  } finally {
    buttonLoading.value = false;
  }
};

onMounted(() => {
  getDicts();
  getList();
});
</script>
