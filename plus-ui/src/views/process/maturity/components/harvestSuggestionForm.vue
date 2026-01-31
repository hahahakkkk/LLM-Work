<template>
  <div class="growth-diagnosis-form">
    <!-- 左下：成熟度诊断组件 -->
    <el-form ref="maturityFormRef" :model="form" :rules="rules" label-width="0px">
      <div class="base-form">
        <div class="form-item">
          <span class="form-maturity-label">地块编号：</span>
          <span class="form-value">
            <el-select v-model="form.plotId" placeholder="请选择地块编号" clearable @change="fetchPlantingAreaByPlot">
              <el-option v-for="dict in landDict" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </span>
        </div>
        <div class="form-item">
          <span class="form-maturity-label">作物品种：</span>
          <span class="form-value">
            <el-input v-model="form.variety" placeholder="请输入作物品种" />
          </span>
        </div>
        <div class="form-item">
          <span class="form-maturity-label">种植面积：</span>
          <span class="form-value">
            <el-input v-model="form.plantingArea" placeholder="根据地块自动填充">
              <template #append>亩</template>
            </el-input>
          </span>
        </div>

        <div class="form-item">
          <span class="form-maturity-label">原始图像：</span>
          <div prop="originalImage" class="no-bold-label" style="margin-left: 5%">
            <!-- 修改：添加 @select 事件监听 -->
            <remote-sense-upload
              v-model="form.originalImageUrl"
              :limit="1"
              :file-size="500"
              :file-type="['tif', 'tiff']"
              :is-show-tip="true"
              @select="handleRemoteSenseSelect"
            />
          </div>
          <!--          <FileUpload-->
          <!--            v-model="form.originalImageOss"-->
          <!--            :limit="1"-->
          <!--            :file-size="2000"-->
          <!--            :file-type="['tif', 'tiff']"-->
          <!--            :is-show-tip="true"-->
          <!--            style="margin-top: 2vh"-->
          <!--          />-->
        </div>
      </div>
      <!-- 按钮将通过 CSS 定位沉底 -->
    </el-form>
    <el-form-item>
      <el-button type="primary" :loading="buttonLoading" :disabled="!form.originalImageOss" style="width: 100%" @click="submitDiagnosis"
        >提交诊断</el-button
      >
    </el-form-item>

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
import { reactive, ref, toRefs, getCurrentInstance, watch, nextTick, computed } from 'vue';
import MaturityMap1 from '@/views/process/maturity/components/map_1.vue';
import RealtimeWeather from '@/views/process/maturity/components/RealtimeWeather.vue';
import { baseDictQuery, landDictQuery } from '@/views/process/growth/api/tableDict';
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo';
// import FileUpload from '@/views/process/maturity/maturityPred/components/fileUpload.vue';
import FileUpload from '@/views/process/growth/components/fileUpload.vue';

const { proxy } = getCurrentInstance() as any;
import { listByIds } from '@/api/system/oss';
import remoteSenseUpload from '@/views/process/maturity/components/remoteSenseUpload.vue';
import { getLandUnit } from '@/views/powland/api/landUnit'; // 获取地块详情
import { processRgbImageUrl } from '@/views/process/maturity/maturityPred/api/model';
const { growth_period } = toRefs<any>(proxy?.useDict('growth_period'));
import { getHarvestSuggestion } from '@/views/process/maturity/utils/harvestingRecommendations';
import { ForecastForm } from '@/views/process/maturity/forecast/api/types';
import { addForecast, getForecast, delForecast, listForecast, updateForecast } from '@/views/process/maturity/forecast/api';
import { ripenessPrediction } from '@/views/process/growth/api/modelForward';
import { addWaf, listWaf, updateWaf } from '@/views/process/maturity/alert/api';
import { listWarning } from '@/api/disaster/warning';
import { queryWeather } from '@/views/process/maturity/api/index';
import { WafForm } from '@/views/process/maturity/alert/api/types';
import dayjs from 'dayjs';

const maturityFormRef = ref<ElFormInstance>();
const mapRef = ref();

// 存储上传成功后的遥感图像URL
const remoteImageUrl = ref<string | null>(null);
// 当前基地ID变量
const currentBaseId = ref<string | undefined>('1886244367296888838');

const buttonLoading = ref(false);

const diagnosisFormRef = ref<ElFormInstance>();

// 字典数据
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);
// 存储所有地块数据，避免重复请求
const allLandDict = ref<DictDataOption[]>([]);

// 文件上传相关
const fileList = ref([]);

// 定义事件发射器
const emits = defineEmits(['completed']);

// 默认基地ID
const defaultBaseId = ref<string | undefined>(undefined);

// 设置默认诊断时间
const defaultDiagnosisTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

// 修改selectedBase的定义，根据currentBaseId动态设置显示名称
const selectedBase = computed(() => {
  let baseName = getBaseNameLabel(currentBaseId.value);
  // 去除末尾的"基地"两个字
  if (baseName && baseName.endsWith('基地')) {
    baseName = baseName.slice(0, -2);
  }

  if (baseName.includes('姜兴庄')) {
    return baseName + '智慧引领种植基地';
  } else if (baseName === '侯家沟') {
    return baseName + '数字化种植基地';
  } else {
    // 对于岳岔或杨家沟，只显示基地名称
    return baseName;
  }
});

/** 监听遥感图片选择事件 */
const handleRemoteSenseSelect = (sense: any) => {
  if (!sense) return;

  // 1. 自动更新地块编号
  if (sense.plotId) {
    form.value.plotId = String(sense.plotId);
  }

  proxy?.$modal.msgSuccess('已根据选定图片自动关联地块及生长时期');
};

const initFormData: ForecastForm = {
  id: undefined,
  baseId: undefined,
  plotId: undefined,
  ndviImageUrl: undefined,
  diagnosisTime: defaultDiagnosisTime,
  diagnosisModel: '无人机模型',
  originalImageOss: undefined,
  originalImageUrl: undefined,
  resultImageUrl: undefined,
  ripenessStatus: 0,
  plantingYear: '2026',
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
    maturityIndex: [{ required: true, message: '成熟度指数不能为空', trigger: 'blur' }],
    growthStatus: [{ required: true, message: '生长状态不能为空', trigger: 'blur' }]
  }
});

// 新增的响应式数据
const showDiagnosisResult = ref(false);
const mapDiagnosisData = ref({
  plotId: null,
  growthPeriod: '',
  maturityIndex: null,
  spad: null,
  growthStatus: ''
});

const { form, rules } = toRefs(data);

// 2. getDicts：先拿基地，再遍历基地拉所有地块
const getDicts = async () => {
  try {
    const baseRes = await baseDictQuery();
    baseDict.value =
      baseRes.rows?.map((item) => ({
        value: String(item.value),
        label: item.label
      })) || [];

    // 用所有基地拼一个“全量地块列表”，plotId 完全按 fetchFarmerLands 的 landId 来
    const allLands: DictDataOption[] = [];

    // 顺序调用就行，基地数量不大问题不大；如果以后性能有压力再优化成 Promise.all
    for (const base of baseDict.value) {
      const landRes = await fetchFarmerLands({ baseId: base.value as string });
      (landRes.rows || []).forEach((item: any) => {
        allLands.push({
          value: String(item.landId), // ✅ 这里用的是 fetchFarmerLands 的 landId，plotId 统一
          label: String(item.landCode), // 显示地块编号
          baseId: base.value, // 添加基地ID
          baseLabel: base.label // 添加基地名称
        });
      });
    }

    allLandDict.value = allLands;
    landDict.value = [...allLandDict.value]; // 下拉显示全部
  } catch (error) {
    console.error('初始化基地/地块失败:', error);
    baseDict.value = [];
    allLandDict.value = [];
    landDict.value = [];
  }
};

// 通过 plotId 查找对应的 baseId
const findBaseIdByPlotId = (plotId: string | number | undefined) => {
  if (!plotId) return undefined;

  const landItem = allLandDict.value.find((item) => item.value === String(plotId));
  return landItem ? landItem.baseId : undefined;
};
// 响应式数据存储天气数据
const weatherData = ref([]);
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
    // 自动设置基地ID
  }
);

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

// 设置默认基地为侯家沟基地
const setDefaultBase = () => {
  const defaultBase = baseDict.value.find((dict) => dict.label.includes('侯家沟'));
  if (defaultBase) {
    form.value.baseId = defaultBase.value;
    defaultBaseId.value = defaultBase.value;
  }
};

/** 提交诊断 */
const submitDiagnosis = () => {
  form.value.id = undefined;
  maturityFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      console.log('提交表单到成熟度后端（包含原始图像信息）');
      buttonLoading.value = true;
      try {
        let response;
        let recordId;
        const isNewRecord = !form.value.id;

        // 保存当前的remoteImageUrl值和表单数据快照
        const currentRemoteImageUrl = remoteImageUrl.value;
        form.value.baseId = findBaseIdByPlotId(form.value.plotId);
        const currentFormData = { ...form.value }; // 创建表单数据快照

        // 提交表单到长势后端（包含原始图像信息）
        if (isNewRecord) {
          console.log('提交表单到长势后端（包含原始图像信息）', currentFormData);
          response = await addForecast(currentFormData);

          // 尝试获取新增记录的ID
          if (response.data && typeof response.data === 'object' && response.data.id) {
            recordId = response.data.id;
          } else if (response.data && typeof response.data === 'number') {
            recordId = response.data;
          } else {
            // 如果响应中没有ID，则通过查询获取
            recordId = await getNewlyAddedRecordId(currentFormData);
          }

          if (recordId) {
            form.value.id = recordId;
          }
          proxy?.$modal.msgSuccess('上传成功');
        } else {
          recordId = currentFormData.id;
          proxy?.$modal.msgSuccess('修改成功');
        }
        console.log('提交表单到成熟度后端（包含原始图像信息）成功', currentFormData);
        // 如果是新增记录，则触发模型预测
        if (recordId) {
          // 使用保存的remoteImageUrl值而不是依赖当前值
          if (currentRemoteImageUrl) {
            // 直接调用处理函数，传入保存的URL和表单数据快照
            setTimeout(async () => {
              try {
                // console.log('开始模型预测', currentFormData);
                // 修改processImageAndUpdateWithUrl函数，传入快照数据
                await processImageAndUpdateWithUrl(recordId, currentRemoteImageUrl, currentFormData);
              } catch (error) {
                console.error('模型预测失败:', error);
              }
            }, 200);
          } else {
            console.warn('未找到图像URL，跳过模型预测');
          }
        }
      } finally {
        setDefaultBase();
      }
    }
  });
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

// 添加处理地图点击事件的方法
const handleMapFeatureClick = async (featureData: any) => {
  console.log('地图点击事件:', featureData);
  // 从featureData中获取地块信息
  if (featureData && featureData.properties && featureData.properties.landId) {
    const landId = featureData.properties.landId;
    const landArea = featureData.properties.landArea;
    const landCode = featureData.properties.landCode;

    // 设置地块编号（使用landCode作为显示值，但需要在选项中找到对应的landId）
    // 先在当前地块字典中查找匹配的选项
    const matchingLandOption = landDict.value.find((option) => option.value === landId);
    if (matchingLandOption) {
      form.value.plotId = matchingLandOption.value;
    } else {
      // 如果在当前字典中找不到，则直接使用landId
      form.value.plotId = landId;
    }

    // 设置种植面积
    if (landArea) {
      form.value.plantingArea = landArea;
    }
  }
};

// 文件上传处理
const handleFileChange = (file: any, fileList: any) => {
  console.log('文件已选择:', file, fileList);
  // 在这里可以处理文件选择后的逻辑
};

/** 表单重置 */
const reset = () => {
  // 重置时设置默认时间为当前时间
  const defaultDiagnosisTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  form.value = { ...initFormData, diagnosisTime: defaultDiagnosisTime };
  remoteImageUrl.value = null; // 重置遥感图像URL
  diagnosisFormRef.value?.resetFields();
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

// 暴露方法和数据给父组件
defineExpose({
  getDicts,
  reset,
  handleMapFeatureClick
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

const warningLevelMap: Record<string | number, string> = {
  0: '轻度冰雹',
  1: '中度冰雹',
  2: '重度冰雹',
  3: '极重冰雹',
  4: '轻旱',
  5: '中旱',
  6: '重旱',
  7: '极旱',
  8: '一般洪涝',
  9: '特大洪涝',
  10: '一般特大洪涝',
  11: '特别重大洪涝',
  99: '无灾害风险'
};

const processImageAndUpdateWithUrl = async (recordId: string | number, imageUrl: string, formData: ForecastForm = form.value) => {
  try {
    console.log('使用指定的URL处理图像并更新预测结果');
    const prediction = await ripenessPrediction({ image: imageUrl });
    setDefaultBase();

    if (!prediction?.data) {
      proxy?.$modal.msgError('模型服务不可用，请联系管理员');
      return;
    }

    const updateData = await handlePredictionResult(recordId, prediction.data, formData);
    const suggestion = await generateHarvestSuggestion(updateData.ripenessStatus);
    await syncWafRecord(updateData.ripenessStatus, formData, suggestion);

    proxy?.$modal.msgSuccess('图像处理完成并已更新数据');
    emits('completed', recordId);
    emits('map-refresh');
  } catch (error) {
    if (recordId) {
      try {
        await delForecast(recordId);
        console.log('已清理未完成的记录:', recordId);
      } catch (deleteError) {
        console.error('清理记录失败:', deleteError);
      }
    }
    console.error('模型预测失败:', error);
    proxy?.$modal.msgError('模型服务调用失败，请检查服务状态');
  } finally {
    buttonLoading.value = false;
  }
};

const handlePredictionResult = async (recordId: string | number, data: any, formData: ForecastForm): Promise<ForecastForm> => {
  const updateData: ForecastForm = {
    id: recordId,
    baseId: formData.baseId,
    plotId: formData.plotId,
    diagnosisTime: formData.diagnosisTime,
    ndviImageUrl: data.ndviPng?.url,
    diagnosisModel: formData.diagnosisModel || 'RGB图像智能诊断模型',
    ripenessStatus: data.mean_ndvi < 0.706 ? 1 : 0,
    originalImageUrl: data.ndviAutoscalePng.url,
    resultImageUrl: data.ndviThresholdPng.url,
    variety: formData.variety,
    plantingArea: formData.plantingArea,
    plantingYear: formData.plantingYear,
    originalImageOss: formData.originalImageOss
  };
  await updateForecast(updateData);
  console.log('成熟度记录更新完毕');
  return updateData;
};

const generateHarvestSuggestion = async (ripenessStatus: number): Promise<string> => {
  const res = await queryWeather();
  if (res.code !== 200) throw new Error('天气接口异常');
  weatherData.value = res.data.forecast.forecastData.slice(0, 7);
  const currentWeather = weatherData.value[0]?.weatherLabel || '';
  const maturityLevel = ripenessStatus === 1 ? '成熟' : '未成熟';

  const response1 = await listWarning({ pageNum: 1, pageSize: 10 });
  const disaster = response1.rows[0];
  const issueTime = dayjs(disaster.issueTime);
  const now = dayjs();
  const diffInHours = now.diff(issueTime, 'hour');
  const disasterStatus = diffInHours <= 48 ? warningLevelMap[disaster.warningLevel] : '无灾害';
  return getHarvestSuggestion(maturityLevel, currentWeather, disasterStatus, weatherData.value);
};

const syncWafRecord = async (ripenessStatus: number, formData: ForecastForm, suggestion: string) => {
  const existResp = await listWaf({
    baseId: formData.baseId,
    plotId: formData.plotId
  });

  const rows = existResp.data?.rows || existResp.data || [];
  const exist = rows.length > 0;
  const existId = exist ? rows[0].id : null;

  const wafData: WafForm = {
    baseId: formData.baseId,
    plotId: formData.plotId,
    alertTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    alertInfo: suggestion,
    isProcessed: 0,
    device: '无人机'
  };

  if (exist && existId && ripenessStatus === 1) {
    wafData.id = existId;
    await updateWaf(wafData);
  } else if (ripenessStatus === 1) {
    await addWaf(wafData);
  }
};
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
</style>
