<template>
  <div class="maturity-container">
    <!-- 左侧区域 -->
    <div class="left-panel">
      <!-- 左上：实时气象 -->
      <div class="base-info-section">
        <div class="base-info-card">
          <div class="card-header">
            <i class="el-icon-office-building"></i>
            <span class="header-title">实时气象</span>
          </div>

          <div class="base-info-content">
            <RealtimeWeather :base-id="currentBaseId" />
          </div>
        </div>
      </div>

      <!-- 左下：新增诊断组件 -->
      <div class="add-diagnosis-section">
        <div class="diagnosis-form-card">
          <div class="card-header">
            <span>成熟度诊断</span>
          </div>

          <div class="diagnosis-form-content">
            <!-- 直接嵌入 GrowthDiagnosis 表单，而非使用弹窗 -->
            <harvest-suggestion-form ref="harvestSuggestionFormRef" @map-refresh="refreshMap" @completed="handleDiagnosisCompleted" />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧区域：地图 -->
    <div class="right-panel">
      <el-card class="map-card" shadow="hover" :body-style="{ height: '100%', width: '100%', boxSizing: 'border-box' }">
        <div class="card-content">
          <MaturityMap1 ref="mapRef" :initial-base-name="selectedBase" @feature-click="handleMapFeatureClick" />
        </div>
      </el-card>
    </div>

    <!-- 弹窗组件 -->
    <DiagnosisResult
      v-if="selectedCellData"
      v-model="dialogVisible"
      :diagnosis-id="selectedCellData.id"
      :plot-id="selectedCellData.plotNumber"
      :ripeness-status="selectedCellData.ripenessStatus"
      :growth-period="selectedCellData.growthPeriod"
    />

    <!-- 诊断结果弹窗 -->
    <!--    <MaturityResult-->
    <!--      v-if="showDiagnosisResult"-->
    <!--      v-model="showDiagnosisResult"-->
    <!--      :plot-id="mapDiagnosisData.plotId"-->
    <!--      :growth-period="mapDiagnosisData.growthPeriod"-->
    <!--      :maturity-index="mapDiagnosisData.maturityIndex"-->
    <!--      :spad="mapDiagnosisData.spad"-->
    <!--      :growth-status="mapDiagnosisData.growthStatus"-->
    <!--    />-->
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRefs, getCurrentInstance, watch, nextTick, computed, onMounted } from 'vue';
import MaturityMap1 from '@/views/process/maturity/components/map.vue';
import RealtimeWeather from '@/views/process/maturity/components/RealtimeWeather.vue';
import { baseDictQuery, landDictQuery } from '@/views/process/growth/api/tableDict';
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo';
// import FileUpload from '@/views/process/maturity/maturityPred/components/fileUpload.vue';
import FileUpload from '@/views/process/growth/components/fileUpload.vue';
const { proxy } = getCurrentInstance() as any;
import { listByIds } from '@/api/system/oss';
import { processRgbImageUrl } from '@/views/process/maturity/maturityPred/api/model';
const { growth_period } = toRefs<any>(proxy?.useDict('growth_period'));
import { getHarvestSuggestion } from '@/views/process/maturity/utils/harvestingRecommendations';
import { ForecastForm } from '@/views/process/maturity/forecast/api/types';
import { addForecast, getForecast, listForecast, updateForecast } from '@/views/process/maturity/forecast/api';
import { ripenessPrediction } from '@/views/process/growth/api/modelForward';
import { addWaf } from '@/views/process/maturity/alert/api';
import HarvestSuggestionForm from '@/views/process/maturity/components/harvestSuggestionForm.vue';
import { listDiagnosis } from '@/views/process/growth/diagnosis/api';
import DiagnosisResult from '@/views/process/maturity/components/DiagnosisResult.vue';

const maturityFormRef = ref<ElFormInstance>();
const mapRef = ref();

const refreshMap = () => {
  mapRef.value?.refreshUAVData();
};

// 存储上传成功后的遥感图像URL
const remoteImageUrl = ref<string | null>(null);
// 当前基地ID变量
const currentBaseId = ref<string | undefined>('1880899316147232770');

const buttonLoading = ref(false);

// 字典数据
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);
// 存储所有地块数据，避免重复请求
const allLandDict = ref<DictDataOption[]>([]);

// 引用 GrowthDiagnosisForm 组件
const harvestSuggestionFormRef = ref<InstanceType<typeof HarvestSuggestionForm> | null>(null);

// 文件上传相关
const fileList = ref([]);

// 添加响应式数据
const dialogVisible = ref(false);

const selectedCellData = ref<DiagnosisRecord | null>(null);

// 定义事件发射器
const emits = defineEmits(['completed']);

// 默认基地ID
const defaultBaseId = ref<string | undefined>(undefined);

// 设置默认诊断时间
const defaultDiagnosisTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

// 修改currentBaseName的定义，根据currentBaseId动态设置显示名称,自动更新
const currentBaseName = computed(() => {
  // 直接使用currentBaseId作为基地名称
  return currentBaseId.value || '侯家沟基地';
});

// 修改selectedBase的定义，根据currentBaseId动态设置显示名称
const selectedBase = computed(() => {
  let baseName = getBaseNameLabel(currentBaseId.value);
  console.log('selectedBase', baseName);
  // 去除末尾的"基地"两个字
  if (baseName && baseName.endsWith('基地')) {
    baseName = baseName.slice(0, -2);
  }
  if (baseName.includes('姜兴庄')) {
    return '姜兴庄智慧引领种植基地';
  } else if (baseName.includes('高家硷')) {
    return '高硷村';
  } else if (baseName.includes('冯渠')) {
    return '冯渠';
  } else if (baseName.includes('岳家岔')) {
    return '岳岔';
  } else if (baseName.includes('李家寺')) {
    return '李家寺';
  } else if (baseName.includes('侯家沟') && baseName.includes('数字化')) {
    return '侯家沟南';
  } else if (baseName.includes('侯家沟')) {
    return '侯家沟数字化种植基地';
  } else if (baseName.includes('杨家沟')) {
    return '杨家沟';
  } else {
    // 对于岳岔或杨家沟，只显示基地名称
    return baseName;
  }
});

// // 处理地图点击事件：转发给成熟度诊断表单组件，由组件内部完成地块编号和面积等信息的自动填充
// const handleMapFeatureClick = (featureData: any) => {
//   console.log('地图点击事件:', featureData);
//   if (harvestSuggestionFormRef.value && typeof (harvestSuggestionFormRef.value as any).handleMapFeatureClick === 'function') {
//     (harvestSuggestionFormRef.value as any).handleMapFeatureClick(featureData);
//   }
// };

// 处理地图点击事件：转发给成熟度诊断表单组件或者直接处理
const handleMapFeatureClick = async (featureData: any) => {
  console.log('地图点击事件:', featureData);

  if (featureData && featureData.properties && featureData.properties.landId) {
    const landId = featureData.properties.landId;

    // 查找是否有该地块的诊断记录
    try {
      const res = await listForecast({
        plotId: landId,
        pageNum: 1,
        pageSize: 1
      });

      if (res.rows && res.rows.length > 0) {
        // 如果找到诊断记录，显示诊断结果弹窗
        const record = res.rows[0];
        selectedCellData.value = {
          id: record.id,
          plotNumber: landId,
          ripenessStatus: record.ripenessStatus,
          growthPeriod: record.growthPeriod || '成熟期'
        };
        dialogVisible.value = true;
        // 转发给表单组件处理（用于新建诊断）
        if (harvestSuggestionFormRef.value && typeof (harvestSuggestionFormRef.value as any).handleMapFeatureClick === 'function') {
          (harvestSuggestionFormRef.value as any).handleMapFeatureClick(featureData);
        } else {
          proxy?.$modal.msgWarning('该地块暂无诊断数据');
        }
      } else {
        // 转发给表单组件处理（用于新建诊断）
        if (harvestSuggestionFormRef.value && typeof (harvestSuggestionFormRef.value as any).handleMapFeatureClick === 'function') {
          (harvestSuggestionFormRef.value as any).handleMapFeatureClick(featureData);
        } else {
          proxy?.$modal.msgWarning('该地块暂无诊断数据');
        }
      }
    } catch (error) {
      console.error('查询诊断数据失败:', error);
      proxy?.$modal.msgError('数据查询失败');
    }
  }
};

// 处理诊断完成事件
const handleDiagnosisCompleted = (recordId?: string | number) => {
  // // 重置表单
  // if (harvestSuggestionFormRef.value) {
  //   harvestSuggestionFormRef.value.reset();
  // }
  console.log(harvestSuggestionFormRef.value);
  // 如果传入了recordId，则显示对应的诊断结果弹窗
  if (recordId) {
    setTimeout(() => {
      fetchDiagnosisData().then(() => {
        const targetRecord = diagnosisHistory.value.find((record) => record.id == recordId);
        if (targetRecord) {
          selectedCellData.value = targetRecord;
          dialogVisible.value = true;
        }
      });
    }, 300);
  }
};

const initFormData: ForecastForm = {
  id: undefined,
  baseId: undefined,
  plotId: undefined,
  growthPeriod: '成熟期',
  diagnosisTime: defaultDiagnosisTime,
  diagnosisModel: '无人机模型',
  originalImageOss: undefined,
  originalImageUrl: undefined,
  resultImageUrl: undefined,
  ripenessStatus: 0,
  plantingYear: undefined,
  variety: '米谷1号',
  plantingArea: undefined
};

const data = reactive({
  form: { ...initFormData },
  rules: {
    id: [{ required: true, message: '不能为空', trigger: 'blur' }],
    plotId: [{ required: true, message: '地块不能为空', trigger: 'blur' }],
    variety: [{ required: true, message: '作物品种不能为空', trigger: 'blur' }],
    plantingArea: [{ required: true, message: '种植面积不能为空', trigger: 'blur' }],
    growthPeriod: [{ required: true, message: '生育时期不能为空', trigger: 'blur' }],
    maturityIndex: [{ required: true, message: '成熟度指数不能为空', trigger: 'blur' }],
    growthStatus: [{ required: true, message: '生长状态不能为空', trigger: 'blur' }]
  }
});

// 新增的响应式数据
const showDiagnosisResult = ref(false);
const mapDiagnosisData = ref({
  plotId: null,
  growthPeriod: '',
  ripenessStatus: 0
});

const { form, rules } = toRefs(data);

/**
 * 基地、地块字典
 */
const getDicts = async () => {
  // 获取基地字典
  try {
    const res = await baseDictQuery();
    console.log('获取的基地字典:', res);
    baseDict.value =
      res.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];
    await handleBaseChange(currentBaseId.value);
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

interface DiagnosisRecord {
  id: string | number;
  baseName: string;
  plotNumber: string;
  growthPeriod: string;
  diagnosisTime: string;
  ripenessStatus: number;
}
const diagnosisHistory = ref<DiagnosisRecord[]>([]);

const fetchDiagnosisData = async () => {
  try {
    const res = await listForecast({ pageNum: 1, pageSize: 1000 });
    // 通过第一条数据确定当前基地名称
    if (res.rows && res.rows.length > 0) {
      const firstRow = res.rows[0];
      currentBaseId.value = firstRow.baseName?.toString(); // 存储当前基地ID
    }

    diagnosisHistory.value =
      res.rows?.map((item) => ({
        id: item.id,
        baseName: currentBaseName.value, // 使用全局变量
        // 确保 plotNumber 是字符串类型
        plotNumber: String(item.plotId),
        growthPeriod: '成熟期',
        diagnosisTime: item.diagnosisTime,
        ripenessStatus: Number(item.ripenessStatus) || 0
      })) || [];
    // console.log('转换后数据:', diagnosisHistory.value);
  } catch (error) {
    console.error('获取诊断数据失败:', error);
  }
};

// 处理基地选择变化
const handleBaseChange = async (newBaseId) => {
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
};

/** 获取基地名称标签 */
const getBaseNameLabel = (baseValue: string | undefined) => {
  if (!baseValue) return '';

  const baseOption = baseDict.value.find((option) => option.value === baseValue);
  return baseOption ? baseOption.label : baseValue;
};

/** 根据生育时期ID获取生育时期标签 */
const getGrowthPeriodLabel = (growthPeriod: string | undefined) => {
  if (!growthPeriod) return '';

  const growthPeriodOption = growth_period.value.find((option: DictDataOption) => option.value === growthPeriod);
  return growthPeriodOption ? growthPeriodOption.label : growthPeriod;
};

// 设置默认基地为侯家沟基地
const setDefaultBase = () => {
  const defaultBase = baseDict.value.find((dict) => dict.label.includes('侯家沟'));
  if (defaultBase) {
    form.value.baseId = defaultBase.value;
    defaultBaseId.value = defaultBase.value;
  }
};

/**
 * 通过查询获取新增记录的ID
 * @param formData 新增的表单数据
 */
const getNewlyAddedRecordId = async (formData: ForecastForm): Promise<string | number | undefined> => {
  try {
    // 根据表单中的唯一标识字段查询记录
    // 这里我们使用基地名称、地块编号作为查询条件（避免使用日期格式问题）
    const queryParam = {
      baseId: formData.baseId,
      plotId: formData.plotId,
      pageSize: 5,
      pageNum: 1,
      orderByColumn: 'id',
      isAsc: 'desc' // 按ID降序排列，确保获取最新记录
    };

    // 注意：这里需要导入listDiagnosis方法
    const response = await listForecast(queryParam);
    if (response.rows && response.rows.length > 0) {
      // 查找匹配的记录
      for (const record of response.rows) {
        // 检查基地名称和地块编号是否匹配（使用==而不是===，因为可能是不同类型）
        if (record.baseId == formData.baseId && record.plotId == formData.plotId) {
          // 可以进一步检查其他字段以确保是正确的记录
          return record.id;
        }
      }
    }
  } catch (error) {
    console.error('查询新增记录失败:', error);
  }

  return undefined;
};

// 文件上传处理
const handleFileChange = (file: any, fileList: any) => {
  console.log('文件已选择:', file, fileList);
  // 在这里可以处理文件选择后的逻辑
};

// 在组件挂载后确保地图定位到侯家沟基地
onMounted(() => {
  getDicts();

  // 确保地图组件加载完成后定位到侯家沟基地
  nextTick(() => {
    if (mapRef.value && typeof mapRef.value.locate === 'function') {
      // 延迟执行以确保地图完全初始化
      setTimeout(() => {
        mapRef.value.locate('侯家沟数字化种植基地');
      }, 300);
    }
  });
});

// 监听原始图像ID变化，获取完整URL
watch(
  () => form.value.originalImageOss,
  async (newId) => {
    if (newId) {
      // 检查newId是否是URL格式（以http开头）
      if (typeof newId === 'string' && newId.startsWith('http')) {
        // 如果是URL，直接使用
        remoteImageUrl.value = newId;
      } else {
        // 如果是ID，通过ID获取完整文件信息
        try {
          const res = await listByIds(newId);
          if (res.data && res.data.length > 0) {
            remoteImageUrl.value = res.data[0].url;
          } else {
            remoteImageUrl.value = null;
          }
        } catch (error) {
          console.error('获取原始图像URL失败:', error);
          remoteImageUrl.value = null;
        }
      }
    } else {
      remoteImageUrl.value = null;
    }
  },
  { immediate: true } // 立即触发一次
);
</script>

<style scoped lang="scss">
.maturity-container {
  display: flex;
  width: auto;
  height: 90vh;
  padding: 2vh;
  box-sizing: border-box;
  gap: 2vh;
  font-size: 2vh;
}

.left-panel {
  display: flex;
  flex-direction: column;
  width: 25%;
  height: 100%;
  gap: 2vh;
}

.base-info-section {
  flex: 1;
  min-height: 42%;
  background: #fff;
  border-radius: 1vh;
  padding: 1vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.maturity-form-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 1vh;
  padding: 2vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.maturity-form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
}

.add-maturity-section {
  flex: 2;
  height: auto;
  display: flex;
  flex-direction: column;
}

.form-actions {
  margin-top: auto;
  padding-top: 2vh;
}

.right-panel {
  flex: 1;
  width: 70%;
  height: 100%;
}

.map-card {
  height: 100%;
  border-radius: 1vh;
  border: none;
  box-shadow: 0 0.2vh 1.2vh 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
}

:deep(.map-wrapper) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
}

/* 基地信息样式 */
.base-info-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1.2vh;
  font-weight: bold;
  color: #333;
  padding: 1.5vh 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 2vh;
}

.base-info-content {
  flex: 1;
  overflow-y: auto;
}

// 实时气象网格布局
.weather-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 2vh;
  padding: 1vh;
}

.weather-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5vh;
  background-color: #f5f7fa;
  border-radius: 0.8vh;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .weather-label {
    font-size: 1.8vh;
    color: #606266;
    margin-bottom: 1vh;
  }

  .weather-value {
    font-size: 2vh;
    font-weight: bold;
    color: #303133;
  }
}

.base-form {
  padding-bottom: 2.25vh;
  margin-bottom: 2.25vh;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 2vh;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  width: 16vh;
  font-weight: bold;
  color: #606266;
  text-align: right;
  margin-right: 1vh;
}

.form-maturity-label {
  width: 12vh;
  font-weight: bold;
  color: #606266;
  text-align: right;
  margin-right: 1vh;
}

.form-value {
  flex: 1;
  display: flex;
  :deep(.el-tag) {
    height: 3vh;
    font-size: 2vh;
  }

  :deep(.el-select) {
    height: 3vh;
    font-size: 2vh;
  }

  :deep(.el-select .el-select__wrapper) {
    height: 3vh;
    min-height: 0;
    font-size: 2vh;
  }

  :deep(.el-select-dropdown__item) {
    font-size: 2vh;
    height: 2vh;
    line-height: 2vh;
  }

  // 确保下拉菜单整体大小适配
  :deep(.el-select-dropdown) {
    font-size: 2wh;
  }
  // 添加上传组件提示文字的字体大小调整
  :deep(.el-upload__tip) {
    font-size: 2vh;
  }

  :deep(.el-upload-list) {
    display: none;
  }
}

:deep(.el-button) {
  height: 3vh;
  font-size: 2vh;
}

:deep(.el-input) {
  height: 3vh;
  font-size: 2vh;
}

:deep(.el-input .el-input__wrapper) {
  height: 3vh;
  min-height: 0;
  font-size: 2vh;
}

.add-diagnosis-section {
  flex: 2;
  height: auto;
  background: #fff;
  border-radius: 1vh;
  padding: 2vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.diagnosis-form-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
