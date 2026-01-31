<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地名称" prop="baseName">
              <el-input v-model="queryParams.baseName" placeholder="请输入基地名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="地块编号" prop="plotId">
              <el-input v-model="queryParams.plotId" placeholder="请输入地块编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="生长时期" prop="growthPeriod">
              <el-input v-model="queryParams.growthPeriod" placeholder="请输入生长时期" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="诊断模型" prop="diagnosisModel">
              <el-input v-model="queryParams.diagnosisModel" placeholder="请输入诊断模型" clearable @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['process/growth:diagnosis:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['process/growth:diagnosis:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['process/growth:diagnosis:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['process/growth:diagnosis:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <!--          <el-col :span="1.5">-->
          <!--            <el-button v-hasPermi="['process/growth:diagnosis:import']" type="success" plain icon="Upload" @click="handleImport">导入</el-button>-->
          <!--          </el-col>-->
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="diagnosisList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="基地名称" align="center" prop="baseName">
          <template #default="scope">
            <el-tag type="primary">{{ getBaseNameLabel(scope.row.baseName) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="地块编号" align="center" prop="plotId">
          <template #default="scope">
            <span>{{ getPlotLabel(scope.row.plotId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="原始图像" align="center" prop="originalImage" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.originalImage" :width="50" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="生长时期" align="center" prop="growthPeriod">
          <template #default="scope">
            <dict-tag :options="growth_period" :value="scope.row.growthPeriod" />
          </template>
        </el-table-column>
        <el-table-column label="诊断时间" align="center" prop="diagnosisTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.diagnosisTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="诊断模型" align="center" prop="diagnosisModel" />
        <el-table-column label="LAI反演图" align="center" prop="laiInversionImage" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.laiInversionImage" :width="50" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="SPAD反演图" align="center" prop="spadInversionImage" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.spadInversionImage" :width="50" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="LAI预测值" align="center" prop="laiPrediction" />
        <el-table-column label="SPAD预测值" align="center" prop="spadPrediction" />
        <el-table-column label="长势等级" align="center" prop="growthLevel">
          <template #default="scope">
            <el-tag :type="getGrowthLevelType(scope.row.growthLevel)" size="large" class="custom-tag">
              {{ scope.row.growthLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预测状态" align="center" prop="isPredicted">
          <template #default="scope">
            <el-tag :type="scope.row.isPredicted ? 'success' : 'warning'">
              {{ scope.row.isPredicted ? '已完成' : '预测中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看" placement="top">
              <el-button v-hasPermi="['process/growth:diagnosis:view']" link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['process/growth:diagnosis:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['process/growth:diagnosis:remove']"
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
    <!-- 查看弹窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="80%" append-to-body>
      <div class="result-container">
        <div class="result-card">
          <div class="image-comparison">
            <div class="image-section">
              <div class="image-header">
                <h3 class="image-title">{{ getPlotLabel(form.plotId) }}号</h3>
              </div>
              <div class="image-wrapper">
                <el-image
                  :src="previewOriginalImageUrl"
                  :preview-src-list="[previewOriginalImageUrl, previewLaiInversionImageUrl, previewSpadInversionImageUrl]"
                  class="result-image"
                >
                  <template #error>
                    <div class="image-error">
                      <i class="el-icon-picture-outline"></i>
                      <p>图片加载失败</p>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>
            <div class="image-section">
              <div class="image-header">
                <h3 class="image-title">LAI反演结果</h3>
              </div>
              <div class="image-wrapper">
                <el-image
                  :src="previewLaiInversionImageUrl"
                  :preview-src-list="[previewOriginalImageUrl, previewLaiInversionImageUrl, previewSpadInversionImageUrl]"
                  class="result-image"
                >
                  <template #error>
                    <div class="image-error">
                      <i class="el-icon-picture-outline"></i>
                      <p>图片加载失败</p>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>
            <div class="image-section">
              <div class="image-header combined-header">
                <h3 class="image-title">SPAD反演结果</h3>
              </div>
              <div class="image-wrapper">
                <el-image
                  :src="previewSpadInversionImageUrl"
                  :preview-src-list="[previewOriginalImageUrl, previewLaiInversionImageUrl, previewSpadInversionImageUrl]"
                  class="result-image"
                >
                  <template #error>
                    <div class="image-error">
                      <i class="el-icon-picture-outline"></i>
                      <p>分析结果加载失败</p>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>

          <div class="conclusion-section">
            <div class="growth-metrics">
              <div class="indicator-group">
                <div class="indicator-item">
                  <span class="indicator-label">长势等级：</span>
                  <el-tag :type="getGrowthLevelType(form.growthLevel)" size="large" class="custom-tag">
                    {{ form.growthLevel }}
                  </el-tag>
                </div>
                <div class="indicator-item">
                  <span class="indicator-label">LAI值：</span>
                  <el-tag size="large" class="custom-tag">
                    {{ form.laiPrediction }}
                  </el-tag>
                </div>
                <div class="indicator-item">
                  <span class="indicator-label">SPAD值：</span>
                  <el-tag size="large" class="custom-tag"> {{ form.spadPrediction }} </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="addDialog.visible" :title="addDialog.title" width="500px" append-to-body>
      <el-form ref="diagnosisFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="基地名称" prop="baseName">
          <el-select v-model="form.baseName" placeholder="请选择基地" style="width: 100%">
            <el-option v-for="dict in baseDict" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="地块编号" prop="plotId">
          <el-select v-model="form.plotId" placeholder="请选择地块" style="width: 100%" :disabled="!form.baseName">
            <el-option v-for="dict in landDict" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="原始图像" prop="originalImage">
          <file-upload v-model="form.originalImage" :limit="1" :file-size="500" :file-type="['tif', 'tiff']" :is-show-tip="true" />
        </el-form-item>
        <el-form-item label="生长时期" prop="growthPeriod">
          <el-select v-model="form.growthPeriod" placeholder="请选择生长时期" style="width: 100%">
            <el-option v-for="dict in growth_period" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="诊断时间" prop="diagnosisTime">
          <el-date-picker v-model="form.diagnosisTime" clearable type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择诊断时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="诊断模型" prop="diagnosisModel">
          <el-input v-model="form.diagnosisModel" placeholder="请输入诊断模型" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" :loading="buttonLoading" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog v-model="importDialog.visible" :title="importDialog.title" width="500px" append-to-body>
      <el-upload class="upload-demo" drag :auto-upload="false" :on-change="handleFileChange" :file-list="[]" :limit="1" accept=".csv, .txt">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            请上传CSV或TXT格式文件，确保包含以下列（第一行为标题）：<br />
            基地名称、地块、LAI、SPAD、长势等级、生长期、诊断模型、诊断时间、预测状态<br />
            支持制表符或逗号分隔的数据格式
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialog.visible = false">取 消</el-button>
          <el-button type="primary" :loading="buttonLoading" @click="submitImport">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Diagnosis" lang="ts">
import { listDiagnosis, getDiagnosis, delDiagnosis, addDiagnosis, updateDiagnosis } from '@/views/process/growth/diagnosis/api';
import { DiagnosisVO, DiagnosisQuery, DiagnosisForm } from '@/views/process/growth/diagnosis/api/types';
import { toRefs, ref, reactive, watch, onMounted, computed } from 'vue';
import { parseTime } from '@/utils/ruoyi';
import { baseDictQuery, landDictQuery } from '@/views/process/growth/api/tableDict'; // 统一字典接口
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo'; // 特定地块接口
import fileUpload from '@/components/FileUpload/index.vue';
import { listByIds } from '@/api/system/oss';
import { processRgbImageUrl } from '@/views/process/maturity/maturityPred/api/model'; // 引入OSS API获取文件URL

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { growth_period } = toRefs<any>(proxy?.useDict('growth_period'));

const diagnosisList = ref<DiagnosisVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

// 存储上传成功后的遥感图像URL
const remoteImageUrl = ref<string | null>(null);

// 计算属性用于预览图片URL
const previewOriginalImageUrl = computed(() => {
  return (form.value as any).originalImage || '';
});

const previewLaiInversionImageUrl = computed(() => {
  return (form.value as any).laiInversionImage || (form.value as any).laiInversionImage || '';
});

const previewSpadInversionImageUrl = computed(() => {
  return (form.value as any).spadInversionImage || (form.value as any).spadInversionImage || '';
});

const queryFormRef = ref<ElFormInstance>();
const diagnosisFormRef = ref<ElFormInstance>();

// 字典数据
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const addDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const importDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 导入文件
const importFile = ref<File | null>(null);

const initFormData: DiagnosisForm = {
  id: undefined,
  baseName: undefined,
  plotId: undefined,
  originalImage: undefined,
  growthPeriod: undefined,
  diagnosisTime: undefined,
  diagnosisModel: undefined,
  laiInversionImage: undefined,
  spadInversionImage: undefined,
  laiPrediction: undefined,
  spadPrediction: undefined,
  growthLevel: undefined,
  isPredicted: 0, // 默认为未预测
  remark: undefined
};
const data = reactive<PageData<DiagnosisForm, DiagnosisQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseName: undefined,
    plotId: undefined,
    growthPeriod: undefined,
    diagnosisTime: undefined,
    diagnosisModel: undefined,
    isPredicted: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    baseName: [{ required: true, message: '基地名称不能为空', trigger: 'blur' }],
    plotId: [{ required: true, message: '地块编号不能为空', trigger: 'blur' }],
    // originalImage: [{ required: true, message: '原始图像不能为空', trigger: 'blur' }],
    growthPeriod: [{ required: true, message: '生长时期不能为空', trigger: 'blur' }],
    diagnosisTime: [{ required: true, message: '诊断时间不能为空', trigger: 'blur' }],
    diagnosisModel: [{ required: true, message: '诊断模型不能为空', trigger: 'blur' }],
    isPredicted: [{ required: true, message: '是否已完成预测不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 监听原始图像ID变化，获取完整URL
watch(
  () => form.value.originalImage,
  async (newId) => {
    console.log('监听到originalImage变化:', newId);
    if (newId) {
      // 检查newId是否是URL格式（以http开头）
      if (typeof newId === 'string' && newId.startsWith('http')) {
        // 如果是URL，直接使用
        remoteImageUrl.value = newId;
        console.log('原始图像URL（将传递给模型后端）:', remoteImageUrl.value);
      } else {
        // 如果是ID，通过ID获取完整文件信息
        try {
          console.log('通过ID获取图像URL:', newId);
          const res = await listByIds(newId);
          console.log('获取图像URL结果:', res);
          if (res.data && res.data.length > 0) {
            remoteImageUrl.value = res.data[0].url;
            console.log('原始图像URL（将传递给模型后端）:', remoteImageUrl.value);
          } else {
            console.warn('未获取到图像URL');
            remoteImageUrl.value = null;
          }
        } catch (error) {
          console.error('获取原始图像URL失败:', error);
          remoteImageUrl.value = null;
        }
      }
    } else {
      console.log('originalImage为空，重置remoteImageUrl');
      remoteImageUrl.value = null;
    }
  },
  { immediate: true } // 立即触发一次
);

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
    landDict.value =
      res.rows?.map((item) => ({
        value: String(item.value),
        label: String(item.label)
      })) || [];
  } catch (error) {
    console.error('获取地块字典失败:', error);
    landDict.value = [];
  }
};

// 存储所有地块数据，避免重复请求
const allLandDict = ref<DictDataOption[]>([]);

// 初始化时加载所有地块数据
const loadAllLandDict = async () => {
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
  () => queryParams.value.baseName,
  async (newBaseName) => {
    if (!newBaseName) {
      queryParams.value.plotId = undefined;
      // 使用已缓存的所有地块数据
      landDict.value = [...allLandDict.value];
      return;
    }

    // 加载选中基地下的地块
    try {
      const res = await fetchFarmerLands({ baseId: newBaseName });
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
  () => form.value.baseName,
  async (newBaseName) => {
    if (!newBaseName) {
      form.value.plotId = undefined;
      // 使用已缓存的所有地块数据
      landDict.value = [...allLandDict.value];
      return;
    }

    // 加载选中基地下的地块
    try {
      const res = await fetchFarmerLands({ baseId: newBaseName });
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

/** 查询长势模型诊断结果列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDiagnosis(queryParams.value);
  diagnosisList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  addDialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  remoteImageUrl.value = null; // 重置遥感图像URL
  diagnosisFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: DiagnosisVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  addDialog.visible = true;
  addDialog.title = '添加长势模型诊断结果';
  // 初始化为未预测状态
  form.value.isPredicted = 0;
};

/** 修改按钮操作 */
const handleUpdate = async (row?: DiagnosisVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getDiagnosis(_id);
  Object.assign(form.value, res.data);
  addDialog.visible = true;
  addDialog.title = '修改长势模型诊断结果';
};

/** 查看按钮操作 */
const handleView = (row: DiagnosisVO) => {
  form.value = {
    ...row,
    diagnosisTime: row.diagnosisTime ? parseTime(row.diagnosisTime, '{y}-{m}-{d} {h}:{i}:{s}') : ''
  } as any;

  dialog.visible = true;
  dialog.title = row.isPredicted ? '长势诊断详情' : '长势诊断详情（预测中）';
};

/** 提交按钮 */
const submitForm = () => {
  console.log('submitForm函数被调用');
  diagnosisFormRef.value?.validate(async (valid: boolean) => {
    console.log('表单验证结果:', valid);
    if (valid) {
      buttonLoading.value = true;
      try {
        let response;
        let recordId;
        const isNewRecord = !form.value.id;

        // 保存当前的remoteImageUrl值
        const currentRemoteImageUrl = remoteImageUrl.value;
        console.log('保存的图像URL:', currentRemoteImageUrl);

        // 提交表单到长势后端（包含原始图像信息）
        if (isNewRecord) {
          console.log('新增记录，表单数据:', form.value);
          response = await addDiagnosis(form.value);
          console.log('新增记录响应:', response);

          // 尝试获取新增记录的ID
          if (response.data && typeof response.data === 'object' && response.data.id) {
            recordId = response.data.id;
          } else if (response.data && typeof response.data === 'number') {
            recordId = response.data;
          } else {
            // 如果响应中没有ID，则通过查询获取
            console.log('通过查询获取新增记录ID');
            recordId = await getNewlyAddedRecordId(form.value);
            console.log('通过查询获取到的记录ID:', recordId);
          }

          if (recordId) {
            form.value.id = recordId;
          }
          proxy?.$modal.msgSuccess('新增成功');
        } else {
          console.log('更新记录，表单数据:', form.value);
          response = await updateDiagnosis(form.value);
          recordId = form.value.id;
          proxy?.$modal.msgSuccess('修改成功');
        }

        // 立即关闭对话框
        addDialog.visible = false;
        console.log('是否为新记录:', isNewRecord, '记录ID:', recordId);

        // 如果是新增记录，则触发模型预测
        if (isNewRecord && recordId) {
          console.log('准备触发模型预测，图像URL:', currentRemoteImageUrl);
          // 使用保存的remoteImageUrl值而不是依赖当前值
          if (currentRemoteImageUrl) {
            // 直接调用处理函数，传入保存的URL
            setTimeout(async () => {
              try {
                console.log('开始执行模型预测，记录ID:', recordId, '图像URL:', currentRemoteImageUrl);
                await processImageAndUpdateWithUrl(recordId, currentRemoteImageUrl);
              } catch (error) {
                console.error('模型预测失败:', error);
              }
            }, 100);
          } else {
            console.warn('未找到图像URL，跳过模型预测');
          }
        }

        await getList();
      } finally {
        buttonLoading.value = false;
      }
    } else {
      console.log('表单验证失败');
    }
  });
};

/**
 * 通过查询获取新增记录的ID
 * @param formData 新增的表单数据
 */
const getNewlyAddedRecordId = async (formData: DiagnosisForm): Promise<string | number | undefined> => {
  try {
    // 根据表单中的唯一标识字段查询记录
    // 这里我们使用基地名称、地块编号作为查询条件（避免使用日期格式问题）
    const queryParam = {
      baseName: formData.baseName,
      plotId: formData.plotId,
      pageSize: 5,
      pageNum: 1,
      orderByColumn: 'id',
      isAsc: 'desc' // 按ID降序排列，确保获取最新记录
    };

    const response = await listDiagnosis(queryParam);
    console.log('查询新增记录的结果:', response);

    if (response.rows && response.rows.length > 0) {
      // 查找匹配的记录
      for (const record of response.rows) {
        console.log('检查记录:', record);
        // 检查基地名称和地块编号是否匹配（使用==而不是===，因为可能是不同类型）
        if (record.baseName == formData.baseName && record.plotId == formData.plotId) {
          console.log('找到匹配记录，ID为:', record.id);
          // 可以进一步检查其他字段以确保是正确的记录
          return record.id;
        } else {
          console.log(
            '记录不匹配:',
            'baseName:',
            record.baseName,
            formData.baseName,
            record.baseName == formData.baseName,
            'plotId:',
            record.plotId,
            formData.plotId,
            record.plotId == formData.plotId
          );
        }
      }
    } else {
      console.log('没有查询到记录');
    }
  } catch (error) {
    console.error('查询新增记录失败:', error);
  }

  console.log('未找到匹配的记录ID');
  return undefined;
};

/**
 * 使用指定的URL处理图像并更新预测结果
 */
const processImageAndUpdateWithUrl = async (recordId: string | number, imageUrl: string) => {
  try {
    // 调用模型处理接口
    const response = await processRgbImageUrl('1', imageUrl);

    if (response.data) {
      // 构造更新数据对象，包含所有必填字段
      const updateData: DiagnosisForm = {
        id: recordId,
        baseName: form.value.baseName,
        plotId: form.value.plotId,
        originalImage: response.data.resultData.originalUrl.url,
        growthPeriod: form.value.growthPeriod,
        diagnosisTime: form.value.diagnosisTime,
        diagnosisModel: form.value.diagnosisModel || 'RGB图像智能诊断模型',
        laiPrediction: response.data.resultData.mean_lai?.toFixed(2),
        spadPrediction: response.data.resultData.mean_spad?.toFixed(2),
        growthLevel: response.data.resultData.level,
        laiInversionImage:
          response.data.resultData.processedUrls?.length >= 3
            ? response.data.resultData.processedUrls[1].url // lai.png
            : undefined,
        spadInversionImage:
          response.data.resultData.processedUrls?.length >= 3
            ? response.data.resultData.processedUrls[2].url // spad.png
            : undefined,
        isPredicted: 1 // 标记为已预测
      };

      // 使用现有的接口更新数据库中的记录
      await updateDiagnosis(updateData);

      proxy?.$modal.msgSuccess('图像处理完成并已更新数据');

      // 刷新列表
      await getList();
    }
  } catch (error) {
    console.error('处理失败:', error);
    proxy?.$modal.msgError('图像处理失败: ' + (error as Error).message);
  }
};

/** 删除按钮操作 */
const handleDelete = async (row?: DiagnosisVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除长势模型诊断结果编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delDiagnosis(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'process/growth/diagnosis/export',
    {
      ...queryParams.value
    },
    `diagnosis_${new Date().getTime()}.xlsx`
  );
};

/** 导入按钮操作 */
const handleImport = () => {
  importDialog.visible = true;
  importDialog.title = '批量导入长势模型诊断结果';
};

/** 处理文件选择 */
const handleFileChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    importFile.value = uploadFile.raw;
  }
  return false; // 阻止默认上传行为
};

/** 提交导入 */
const submitImport = async () => {
  if (!importFile.value) {
    proxy?.$modal.msgError('请选择要导入的CSV文件');
    return;
  }

  try {
    const csvData = await readFileAsText(importFile.value);
    const parsedData = parseCSV(csvData);
    await processImportData(parsedData);
    proxy?.$modal.msgSuccess('导入成功');
    importDialog.visible = false;
    await getList();
  } catch (error) {
    console.error('导入失败:', error);
    proxy?.$modal.msgError('导入失败: ' + (error as Error).message);
  }
};

/** 读取文件内容 */
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8'); // 指定编码格式
  });
};

/** 解析CSV数据 */
const parseCSV = (csvText: string): any[] => {
  // 处理不同的换行符
  const lines = csvText.trim().split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error('CSV文件内容不完整');
  }

  // 尝试不同的分隔符
  let headers: string[] = [];
  let separator = '\t'; // 默认制表符

  // 检查是否使用逗号分隔
  if (lines[0].includes(',') && !lines[0].includes('\t')) {
    separator = ',';
  }

  headers = lines[0].split(separator).map((header) => header.trim());

  // 检查是否包含必要的列
  const requiredHeaders = ['基地名称', '地块', 'LAI', 'SPAD', '长势等级', '生长期', '诊断模型', '诊断时间', '预测状态'];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    console.warn('CSV文件缺少必要的列:', missingHeaders);
    console.log('实际的列:', headers);
  }

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // 跳过空行

    const currentLine = lines[i].split(separator);
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = currentLine[index] ? currentLine[index].trim() : '';
    });

    // 只添加有效的数据行
    if (obj['基地名称'] && obj['地块']) {
      result.push(obj);
    }
  }

  console.log('解析后的数据:', result);
  return result;
};

/** 处理导入数据 */
const processImportData = async (data: any[]) => {
  if (data.length === 0) {
    throw new Error('没有解析到有效数据');
  }

  // 获取所有基地字典数据
  const baseDictMap = new Map(baseDict.value.map((item) => [item.label, item.value]));

  // 生长期字典数据
  const growthPeriodMap = new Map(growth_period.value.map((item) => [item.label, item.value]));

  console.log('基地字典映射:', Array.from(baseDictMap.entries()));
  console.log('生长期字典映射:', Array.from(growthPeriodMap.entries()));

  let successCount = 0;
  let failCount = 0;

  // 批量处理数据
  for (const item of data) {
    try {
      console.log('正在处理数据项:', item);

      // 查找对应的基地字典值
      const baseNameValue = baseDictMap.get(item['基地名称']);
      const growthPeriodValue = growthPeriodMap.get(item['生长期']);

      if (!baseNameValue) {
        console.warn(`未找到基地名称"${item['基地名称']}"对应的字典值`);
        failCount++;
        continue;
      }

      if (!growthPeriodValue) {
        console.warn(`未找到生长期"${item['生长期']}"对应的字典值`);
        failCount++;
        continue;
      }

      // 根据基地动态获取地块字典
      let landDictForBase: DictDataOption[] = [];
      try {
        const res = await fetchFarmerLands({ baseId: baseNameValue });
        landDictForBase =
          res.rows?.map((item) => ({
            value: String(item.landId),
            label: String(item.landCode)
          })) || [];
      } catch (error) {
        console.error('获取基地地块字典失败:', error);
        failCount++;
        continue;
      }

      // 创建地块字典映射
      const landDictMap = new Map(landDictForBase.map((item) => [item.label, item.value]));

      console.log('地块字典映射:', Array.from(landDictMap.entries()));

      // 查找对应的地块字典值
      let plotIdValue = landDictMap.get(item['地块']);

      // 如果直接通过地块名称找不到，尝试通过地块编码查找
      if (!plotIdValue) {
        // 尝试在所有地块中查找包含该编码的地块
        for (const [label, value] of landDictMap.entries()) {
          // 检查标签是否以地块编码结尾
          if (label.endsWith(item['地块'])) {
            plotIdValue = value;
            break;
          }
        }
      }

      // 添加额外的处理逻辑，处理地块ID本身就是数字的情况
      if (!plotIdValue) {
        // 检查CSV中的地块字段是否是地块ID本身
        // 如果是数字，并且在landDict的value中存在，则直接使用
        if (/^\d+$/.test(item['地块'])) {
          const plotId = item['地块'];
          // 检查这个ID是否在字典中存在
          const exists = landDictForBase.some((item) => item.value === plotId);
          if (exists) {
            plotIdValue = plotId;
          }
        }
      }

      if (!plotIdValue) {
        console.warn(`未找到地块"${item['地块']}"对应的字典值`);
        failCount++;
        continue;
      }

      // 处理日期格式
      let formattedDate = item['诊断时间'];
      if (formattedDate) {
        // 将 yyyy/m/d 或 yyyy/mm/dd 格式转换为 yyyy-mm-dd 格式
        formattedDate = formattedDate.replace(/\//g, '-');
        // 确保月份和日期是两位数
        const parts = formattedDate.split('-');
        if (parts.length === 3) {
          const year = parts[0];
          const month = parts[1].padStart(2, '0');
          const day = parts[2].padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      }

      // 构造表单数据
      const formData: DiagnosisForm = {
        id: undefined,
        baseName: baseNameValue,
        plotId: plotIdValue,
        originalImage: '1968631877277138945', // 使用默认图像ID
        growthPeriod: growthPeriodValue,
        diagnosisTime: '2025-09-18 20:30:51',
        diagnosisModel: item['诊断模型'],
        laiPrediction: parseFloat(item['LAI']) || 0,
        spadPrediction: parseFloat(item['SPAD']) || 0,
        growthLevel: item['长势等级'],
        isPredicted: parseInt(item['预测状态'], 10) || 0,
        remark: undefined,
        laiInversionImage: undefined,
        spadInversionImage: undefined
      };

      console.log('提交表单数据:', formData);

      // 提交数据
      await addDiagnosis(formData);
      successCount++;
    } catch (error) {
      console.error('处理数据失败:', item, error);
      failCount++;
    }
  }

  proxy?.$modal.msgSuccess(`导入完成！成功: ${successCount}, 失败: ${failCount}`);
};

/** 长势等级类型映射 */
const getGrowthLevelType = (level: string) => {
  if (level === '良好') return 'success';
  if (level === '正常') return 'info';
  return 'danger';
};

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

/** 格式化地块编号（前补零到3位） */
const formatPlotId = (plotId: string | undefined) => {
  if (!plotId) return '000';

  // 如果是数字，格式化为3位数字（前补零）
  const num = parseInt(plotId, 10);
  if (!isNaN(num)) {
    return num.toString().padStart(3, '0');
  }

  // 如果不是数字，直接返回原值
  return plotId;
};

onMounted(() => {
  getList();
  getDicts();
  loadAllLandDict();
});
</script>

<style scoped>
/* 保持原有样式不变，新增或修改以下样式 */
.result-container {
  padding: 10px;
  margin: 0 auto;
}

.result-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

/* 图片对比区域 */
.image-comparison {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.image-section {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.image-header {
  background: #f5f7fa;
  padding: 10px;
  font-size: 16px;
}

.image-title {
  margin: 0;
}

.image-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  min-height: 400px;
}

.result-image {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.image-error {
  color: #909399;
  text-align: center;
}

/* 结论区域 */
.conclusion-section {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

/* 指标组样式 */
.indicator-group {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 60px;
  width: 70%;
}

.indicator-item {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.indicator-label {
  font-weight: bold;
  font-size: 14px;
  color: #606266;
  width: 90px;
  text-align: right;
  margin-right: 10px;
}

.custom-tag {
  font-size: 14px;
  padding: 4px 8px;
  height: auto;
  width: 80px;
  text-align: center;
}
</style>
