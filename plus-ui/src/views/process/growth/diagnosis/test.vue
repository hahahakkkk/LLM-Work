<template>
  <div class="p-2">
    <el-row :gutter="20" class="main-container">
      <!-- 左侧基地详情和新增表单 -->
      <el-col :span="8" class="left-panel">
        <div v-show="!isHistoryExpanded">
          <!--          <div class="progress-steps">-->
          <!--            <el-steps :active="activeStep" finish-status="success" align-center>-->
          <!--              <el-step title="长势诊断" />-->
          <!--              <el-step title="水肥诊断" />-->
          <!--              <el-step title="水肥推荐" />-->
          <!--            </el-steps>-->
          <!--          </div>-->
          <el-card shadow="never" class="base-info-card">
            <template #header>
              <div class="card-header">
                <i class="el-icon-office-building"></i>
                <span class="header-title">基地详情</span>
              </div>
            </template>

            <div class="base-info-content">
              <el-form :model="baseInfo" label-width="90px" class="base-form">
                <el-form-item label="基地名称">
                  <el-select v-model="baseInfo.baseName" placeholder="请选择基地" style="width: 100%">
                    <el-option v-for="dict in baseDict" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="生育期">
                  <el-select v-model="baseInfo.growthPeriod" placeholder="请选择生育期" style="width: 100%">
                    <el-option v-for="dict in growth_period" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-form>

              <div class="base-details">
                <div class="detail-item">
                  <span class="detail-label">种植面积：</span>
                  <span class="detail-value">1000亩</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">LAI：</span>
                  <span class="detail-value">4.12</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">作物品种：</span>
                  <span class="detail-value">米谷211号</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">SPAD：</span>
                  <span class="detail-value">46.8</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">操作人：</span>
                  <span class="detail-value">admin</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">长势等级：</span>
                  <el-tag type="success" size="small">正常</el-tag>
                </div>
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="diagnosis-form-card">
            <template #header>
              <div class="card-header">
                <span>新增诊断</span>
              </div>
            </template>

            <el-form ref="diagnosisFormRef" :model="form" :rules="rules" label-width="90px">
              <el-form-item label="地块编号" prop="plotId">
                <el-select v-model="form.plotId" placeholder="请选择地块" style="width: 100%">
                  <el-option v-for="dict in landDict" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
              <!--              <div class="progress-steps">-->
              <!--                <el-steps :active="activeStep" finish-status="success" align-center>-->
              <!--                  <el-step title="长势诊断" />-->
              <!--                  <el-step title="水肥诊断" />-->
              <!--                  <el-step title="水肥推荐" />-->
              <!--                </el-steps>-->
              <!--              </div>-->
              <el-form-item label="原始图像" prop="originalImage">
                <file-upload v-model="form.originalImage" :limit="1" :file-size="500" :file-type="['tif', 'tiff']" :is-show-tip="true" />
              </el-form-item>

              <el-button type="primary" :loading="buttonLoading" style="width: 100%" @click="submitForm">提交诊断</el-button>
              <div class="result-buttons">
                <el-button type="primary" plain :disabled="!hasDiagnosisResult" @click="viewDiagnosisResult"> 诊断结果 </el-button>
                <el-button type="success" plain :disabled="!hasPrescription" @click="downloadPrescription"> 处方单下载 </el-button>
              </div>
            </el-form>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧历史记录 -->
      <el-col :span="isHistoryExpanded ? 24 : 16" class="right-panel">
        <div class="expand-toggle">
          <div class="expand-btn-wrapper">
            <el-button :icon="isHistoryExpanded ? 'arrow-right' : 'arrow-left'" class="expand-btn" @click="toggleHistoryExpand"> </el-button>
          </div>
        </div>

        <el-card shadow="never" class="history-card">
          <template #header>
            <div class="flex justify-between items-center">
              <div class="header-left">
                <span>诊断记录</span>
              </div>
            </div>
          </template>
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="地块编号" prop="plotId">
              <el-select v-model="queryParams.plotId" placeholder="请选择地块" clearable>
                <el-option v-for="dict in landDict" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="生育期" prop="growthPeriod">
              <el-select v-model="queryParams.growthPeriod" placeholder="请选择生育期" clearable>
                <el-option v-for="dict in growth_period" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
          <div v-loading="loading" class="history-table-container">
            <!-- 非全屏模式表格 -->
            <el-table v-if="!isHistoryExpanded" :data="diagnosisList" highlight-current-row @row-click="handleView">
              <el-table-column label="地块编号" align="center" prop="plotId">
                <template #default="scope">
                  <span>{{ getPlotLabel(scope.row.plotId) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="生育期" align="center" prop="growthPeriod">
                <template #default="scope">
                  <dict-tag :options="growth_period" :value="scope.row.growthPeriod" />
                </template>
              </el-table-column>
              <el-table-column label="LAI预测值" align="center" prop="laiPrediction" />
              <el-table-column label="SPAD预测值" align="center" prop="spadPrediction" />
              <el-table-column label="长势等级" align="center" prop="growthLevel">
                <template #default="scope">
                  <el-tag :type="getGrowthLevelType(scope.row.growthLevel)" size="small">
                    {{ scope.row.growthLevel }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>

            <!-- 展开模式表格 -->
            <div v-else>
              <el-row :gutter="10" class="mb8">
                <el-col :span="1.5">
                  <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
                </el-col>
              </el-row>

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
                <el-table-column label="生育期" align="center" prop="growthPeriod">
                  <template #default="scope">
                    <dict-tag :options="growth_period" :value="scope.row.growthPeriod" />
                  </template>
                </el-table-column>
                <el-table-column label="诊断时间" align="center" prop="diagnosisTime" width="180">
                  <template #default="scope">
                    <span>{{ parseTime(scope.row.diagnosisTime, '{y}-{m}-{d}') }}</span>
                  </template>
                </el-table-column>
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
                      <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
                    </el-tooltip>
                    <el-tooltip content="修改" placement="top">
                      <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
                    </el-tooltip>
                    <el-tooltip content="删除" placement="top">
                      <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <pagination
              v-show="total > 0"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              :total="total"
              class="mt-3"
              :pager-count="5"
              @pagination="getList"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

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

    <!-- 新增/修改弹窗 -->
    <el-dialog v-model="editDialog.visible" :title="editDialog.title" width="500px" append-to-body>
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
        <el-form-item label="生育期" prop="growthPeriod">
          <el-select v-model="form.growthPeriod" placeholder="请选择生育期" style="width: 100%">
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
  </div>
</template>

<script setup name="Diagnosis" lang="ts">
import { toRefs, ref, reactive, watch, onMounted, computed } from 'vue';
import fileUpload from '@/components/FileUpload/index.vue';
import imagePreview from '@/components/ImagePreview/index.vue';
import dictTag from '@/components/DictTag/index.vue';
import pagination from '@/components/Pagination/index.vue';
import { listDiagnosis } from './api';
import { landDictQuery, baseDictQuery } from '@/views/process/growth/api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { growth_period } = toRefs<any>(proxy?.useDict('growth_period'));

// 数据状态
const diagnosisList = ref([]);
const buttonLoading = ref(false);
const loading = ref(true);
const activeItemId = ref(null);
const isHistoryExpanded = ref(false); // 控制历史记录是否展开
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);

// 表单相关
const queryFormRef = ref();
const diagnosisFormRef = ref();

// 字典数据
const baseDict = ref([]);
const landDict = ref([]);
const allLandDict = ref([]);

// 对话框配置
const dialog = reactive({
  visible: false,
  title: ''
});

const editDialog = reactive({
  visible: false,
  title: ''
});

// 分页数据
const total = ref(0);

// 基地信息
const baseInfo = ref({
  baseName: '侯家沟基地', // 默认基地名称
  growthPeriod: '1' // 默认生育期
});

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  plotId: undefined,
  growthPeriod: undefined,
  isPredicted: undefined,
  baseName: undefined,
  params: {}
});

// 监听搜索表单中地块选择变化
// watch(
//   () => queryParams.value.plotId,
//   (newPlotId) => {
//     // 当地块选择变化时，自动触发查询
//     if (newPlotId !== undefined) {
//       handleQuery();
//     }
//   }
// );

// 表单数据
const initFormData = {
  id: undefined,
  baseName: undefined,
  plotId: undefined,
  originalImage: undefined,
  growthPeriod: undefined,
  diagnosisTime: undefined,
  diagnosisModel: '水肥亏缺诊断模型', // 设置默认值
  laiInversionImage: undefined,
  spadInversionImage: undefined,
  laiPrediction: undefined,
  spadPrediction: undefined,
  growthLevel: undefined,
  isPredicted: 0,
  remark: undefined
};

const form = ref({ ...initFormData });

// 表单规则
const rules = {
  baseName: [{ required: true, message: '基地名称不能为空', trigger: 'blur' }],
  plotId: [{ required: true, message: '地块编号不能为空', trigger: 'blur' }],
  growthPeriod: [{ required: true, message: '生育期不能为空', trigger: 'blur' }],
  diagnosisTime: [{ required: true, message: '诊断时间不能为空', trigger: 'blur' }],
  diagnosisModel: [{ required: true, message: '诊断模型不能为空', trigger: 'blur' }],
  isPredicted: [{ required: true, message: '是否已完成预测不能为空', trigger: 'blur' }]
};

// 计算属性
const previewOriginalImageUrl = computed(() => {
  return form.value.originalImage || '';
});

const previewLaiInversionImageUrl = computed(() => {
  return form.value.laiInversionImage || '';
});

const previewSpadInversionImageUrl = computed(() => {
  return form.value.spadInversionImage || '';
});

// 新增状态变量
const activeStep = ref(0); // 进度条步骤
const hasDiagnosisResult = ref(false); // 是否有诊断结果
const hasPrescription = ref(false); // 是否有处方单

// 方法定义
const getList = async () => {
  loading.value = true;
  try {
    // 将基地名称从基地详情中传递到查询参数
    const params = {
      ...queryParams.value
      // baseName: baseInfo.value.baseName
    };

    const res = await listDiagnosis(params);
    diagnosisList.value = res.rows;
    total.value = res.total;

    // 更新总记录数
    total.value = res.total;
  } catch (error) {
    console.error('获取诊断列表失败:', error);
    proxy?.$modal.msgError('获取诊断列表失败');
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const submitForm = () => {
  diagnosisFormRef.value?.validate((valid) => {
    if (valid) {
      buttonLoading.value = true;
      // 模拟提交
      setTimeout(() => {
        buttonLoading.value = false;
        proxy?.$modal.msgSuccess('提交成功');
        editDialog.visible = false;
      }, 1000);
    }
  });
};

const handleView = (row) => {
  form.value = { ...row };
  dialog.visible = true;
  dialog.title = '诊断详情';
};

const handleAdd = () => {
  reset();
  editDialog.visible = true;
  editDialog.title = '添加诊断';
};

const handleUpdate = (row) => {
  if (row) {
    form.value = { ...row };
  } else if (ids.value.length === 1) {
    const row = diagnosisList.value.find((item) => item.id === ids.value[0]);
    form.value = { ...row };
  }
  editDialog.visible = true;
  editDialog.title = '修改诊断';
};

const handleDelete = (row) => {
  const deleteIds = row ? [row.id] : ids.value;
  if (deleteIds.length === 0) {
    proxy?.$modal.msgWarning('请至少选择一条数据');
    return;
  }

  proxy?.$modal.confirm('是否确认删除诊断编号为"' + deleteIds + '"的数据项？').then(() => {
    // 模拟删除操作
    proxy?.$modal.msgSuccess('删除成功');
    getList();
  });
};

const handleExport = () => {
  proxy?.$modal.msgSuccess('导出成功');
};

const cancel = () => {
  editDialog.visible = false;
  reset();
};

const reset = () => {
  form.value = { ...initFormData };
  diagnosisFormRef.value?.resetFields();
};

// 多选框选中数据
const handleSelectionChange = (selection) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

// 切换历史记录展开状态
const toggleHistoryExpand = () => {
  isHistoryExpanded.value = !isHistoryExpanded.value;
};

const getGrowthLevelType = (level) => {
  if (level === '良好') return 'success';
  if (level === '正常') return 'info';
  return 'danger';
};

const getBaseNameLabel = (baseValue) => {
  const baseOption = baseDict.value.find((option) => option.value === baseValue);
  return baseOption ? baseOption.label : baseValue;
};

const getPlotLabel = (plotId) => {
  // 使用所有地块字典来获取标签
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
  } catch (error) {
    console.error('获取地块字典失败:', error);
    allLandDict.value = [];
  }
};

// 当组件挂载且字典数据加载完成后，初始化查询表单中的基地选项
const initQueryBaseOptions = () => {
  if (baseDict.value.length > 0) {
    const hjgBase = baseDict.value.find((item) => item.label === '侯家沟基地');
    if (hjgBase) {
      queryParams.value.baseName = hjgBase.value;
    } else {
      queryParams.value.baseName = baseDict.value[0].value;
    }
  }
};

// 新增方法
const viewDiagnosisResult = () => {
  // 查看诊断结果
  proxy?.$modal.msgSuccess('查看诊断结果');
};

const downloadPrescription = () => {
  // 下载处方单
  proxy?.$modal.msgSuccess('下载处方单');
};

// 监听搜索表单中基地选择变化，加载对应地块选项
watch(
  () => queryParams.value.baseName,
  async (newBaseName) => {
    if (!newBaseName) {
      queryParams.value.plotId = undefined;
      // 清空地块选项
      landDict.value = [];
      return;
    }

    // 加载选中基地下的地块
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
  }
);

// 监听基地信息变化
watch([() => baseInfo.value.baseName, () => baseInfo.value.growthPeriod], () => {
  // 根据基地和生育期筛选数据
  getList();
});

// 监听搜索表单中地块选择变化
watch(
  () => queryParams.value.plotId,
  (newPlotId) => {
    // 当地块选择变化时，自动触发查询
    if (newPlotId !== undefined) {
      handleQuery();
    }
  }
);

onMounted(() => {
  getList();
  getDicts().then(() => {
    // 初始化查询表单中的基地选项
    // initQueryBaseOptions();
  });
});
</script>

<style scoped>
.main-container {
  position: relative;
}

.left-panel {
  transition: all 0.3s ease;
}

.right-panel {
  position: relative;
  transition: all 0.3s ease;
}

.expand-toggle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  z-index: 10;
}

.expand-btn-wrapper {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.expand-btn {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 12px 4px;
  width: 24px;
  height: 60px;
  min-width: auto;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  line-height: 24px;
}

.expand-btn:hover {
  background-color: #f5f7fa;
}

.history-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.history-table-container {
  flex: 1;
  position: relative;
}

.history-table-container :deep(.mt-3) {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 10px 0;
  z-index: 10;
}

.base-info-card .card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.base-info-card .header-title {
  font-weight: bold;
  font-size: 16px;
}

.base-info-content {
  padding: 10px 0;
}

.base-form {
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 15px;
}

.base-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.detail-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.diagnosis-form-card {
  margin-top: 20px;
}

.history-card .header-left {
  display: flex;
  align-items: center;
}

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
  text-align: center;
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

.conclusion-section {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.progress-steps {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.result-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}

.result-buttons .el-button {
  flex: 1;
}
</style>
