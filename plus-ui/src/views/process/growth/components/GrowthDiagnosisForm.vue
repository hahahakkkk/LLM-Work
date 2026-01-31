<template>
  <div class="growth-diagnosis-form">
    <el-form ref="diagnosisFormRef" :model="form" :rules="rules">
      <el-form-item label="地块编号:" prop="plotId" class="no-bold-label">
        <plot-selector v-model="form.plotId" :base-id="defaultBaseId || ''" placeholder="请选择地块" style="width: 100%" />
      </el-form-item>
      <el-form-item label="生长时期:" prop="growthPeriod" class="no-bold-label">
        <el-select v-model="form.growthPeriod" placeholder="请选择生长时期" style="width: 100%" @change="handleGrowthPeriodChange">
          <el-option v-for="dict in growth_diagnose_period" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="原始图像:" prop="originalImage" class="no-bold-label"> </el-form-item>
      <el-form-item prop="originalImage" class="no-bold-label" style="margin-left: 5%">
        <!-- 修改：添加 @select 事件监听 -->
        <remote-sense-upload
          v-model="form.originalImage"
          :limit="1"
          :file-size="500"
          :file-type="['tif', 'tiff']"
          :is-show-tip="true"
          @select="handleRemoteSenseSelect"
        />
      </el-form-item>
    </el-form>
    <el-form-item>
      <el-button type="primary" :loading="buttonLoading" style="width: 100%" @click="submitForm">提交诊断</el-button>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, watch, getCurrentInstance, onMounted } from 'vue';
import { addDiagnosis, listDiagnosis, updateDiagnosis } from '@/views/process/growth/diagnosis/api';
import { DiagnosisForm } from '@/views/process/growth/diagnosis/api/types';
import { baseDictQuery, landDictQuery } from '@/views/process/growth/api/tableDict';
import { listByIds as listOssByIds } from '@/api/system/oss'; // 重命名系统 OSS 接口
import { listByIds as listFourOssByIds } from '@/views/four/api/oss'; // 新增：导入 four 模块 OSS 接口
import { getRemoteSense } from '@/views/four/api/remoteSense';
import { processRgbImageUrl } from '@/views/process/maturity/maturityPred/api/model';
import remoteSenseUpload from '@/views/process/growth/components/remoteSenseUpload.vue';
import { addWaf } from '@/views/process/growth/waf/api';
import { waterFertilizerAssessment } from '@/views/process/growth/api/modelForward'; // 添加水肥预测API
import { getWaterSuggestion, getFertilizerSuggestion } from '@/views/process/growth/utils/waterFertilizerSuggestion'; // 导入水肥建议生成函数
import { addSupplyRec } from '@/views/process/growth/supplyRec/api'; // 导入补给记录API
import PlotSelector from '@/views/process/growth/components/PlotSelector.vue'; // 引入地块选择器组件

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { growth_diagnose_period } = toRefs<any>(proxy?.useDict('growth_diagnose_period'));

const buttonLoading = ref(false);
const diagnosisFormRef = ref<ElFormInstance>();

// 字典数据
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);
const allLandDict = ref<DictDataOption[]>([]);

// 设置默认基地为侯家沟基地
const setDefaultBase = () => {
  const defaultBase = baseDict.value.find((dict) => dict.label.includes('侯家沟'));
  if (defaultBase) {
    form.value.baseName = defaultBase.value;
    defaultBaseId.value = defaultBase.value;
  }
};

// 定义事件发射器
const emits = defineEmits(['completed', 'formChange']);

// 存储上传成功后的遥感图像URL
const remoteImageUrl = ref<string | null>(null);

// 设置默认诊断时间
const defaultDiagnosisTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

const initFormData: DiagnosisForm = {
  id: undefined,
  baseName: undefined,
  plotId: undefined,
  originalImage: undefined,
  growthPeriod: undefined,
  diagnosisTime: defaultDiagnosisTime, // 设置默认诊断时间
  diagnosisModel: '无人机模型', // 默认值设置为"无人机模型"
  laiInversionImage: undefined,
  spadInversionImage: undefined,
  laiPrediction: undefined,
  spadPrediction: undefined,
  growthLevel: undefined,
  isPredicted: 0, // 默认为未预测
  remark: undefined
};

const data = reactive<PageData<DiagnosisForm, any>>({
  form: { ...initFormData },
  queryParams: {},
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    plotId: [{ required: true, message: '地块编号不能为空', trigger: 'blur' }],
    growthPeriod: [{ required: true, message: '生长时期不能为空', trigger: 'blur' }],
    originalImage: [{ required: true, message: '原始图像不能为空', trigger: 'blur' }]
  }
});

const { form, rules } = toRefs(data);

// 默认基地ID
const defaultBaseId = ref<string | undefined>(undefined);

// 监听 defaultBaseId 变化，确保 form.baseName 也同步更新
watch(defaultBaseId, (newBaseId) => {
  if (newBaseId && form.value.baseName !== newBaseId) {
    form.value.baseName = newBaseId;
  }
});

// 监听 form.baseName 变化，确保 defaultBaseId 也同步更新
watch(
  () => form.value.baseName,
  (newBaseName) => {
    if (newBaseName && defaultBaseId.value !== newBaseName) {
      defaultBaseId.value = newBaseName;
    }
  }
);

// 监听原始图像ID变化，获取完整URL
watch(
  () => form.value.originalImage,
  async (newId) => {
    if (newId) {
      if (typeof newId === 'string' && newId.startsWith('http')) {
        remoteImageUrl.value = newId;
      } else {
        try {
          // 1. 优先尝试从 four 模块 OSS 获取（针对本地上传到 four OSS 的情况）
          const fourRes = await listFourOssByIds(newId);
          if (fourRes.data && fourRes.data.length > 0) {
            remoteImageUrl.value = fourRes.data[0].url;
            return;
          }

          // 2. 如果 four OSS 查不到，说明可能是业务 ID 或系统 OSS ID
          // 并行查询业务详情和系统 OSS
          const results = await Promise.allSettled([getRemoteSense(newId), listOssByIds(newId)]);

          const senseRes = results[0];
          const systemRes = results[1];

          // 检查是否为业务 ID (RemoteSense fourId)
          if (senseRes.status === 'fulfilled' && senseRes.value.data?.fileLocation) {
            const fileRes = await listFourOssByIds(senseRes.value.data.fileLocation);
            if (fileRes.data && fileRes.data.length > 0) {
              remoteImageUrl.value = fileRes.data[0].url;
              return;
            }
          }

          // 检查是否为系统原有 OSS ID
          if (systemRes.status === 'fulfilled' && systemRes.value.data?.length > 0) {
            remoteImageUrl.value = systemRes.value.data[0].url;
            return;
          }

          remoteImageUrl.value = null;
        } catch (error) {
          console.error('获取原始图像URL解析失败:', error);
          remoteImageUrl.value = null;
        }
      }
    } else {
      remoteImageUrl.value = null;
    }
  },
  { immediate: true }
);

// 监听表单变化并发出事件
watch(
  () => form.value,
  (newForm) => {
    emits('formChange', { ...newForm });
  },
  { deep: true }
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
    allLandDict.value =
      res.rows?.map((item) => ({
        value: String(item.value),
        label: String(item.label)
      })) || [];
    landDict.value = [...allLandDict.value];
  } catch (error) {
    console.error('获取地块字典失败:', error);
    allLandDict.value = [];
    landDict.value = [];
  }
};

/** 处理生长时期变化 */
const handleGrowthPeriodChange = (value: string) => {
  emits('formChange', { ...form.value, growthPeriod: value });
};

/** 设置表单默认值 */
const setDefaultValues = async (values: any) => {
  console.log('设置表单默认值:', values);

  // 确保字典数据已加载
  if (baseDict.value.length === 0) {
    await getDicts();
  }

  // 设置默认诊断时间
  const defaultDiagnosisTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // 通过基地ID查找并设置基地名称
  if (values.baseId) {
    const selectedBase = baseDict.value.find((item) => item.value === values.baseId);
    if (selectedBase) {
      form.value.baseName = selectedBase.value;
      // 同时更新 defaultBaseId 以确保地块选择器可以启用
      defaultBaseId.value = selectedBase.value;
    }
  } else {
    // 如果没有提供基地ID，则设置默认基地为侯家沟基地
    setDefaultBase();
  }

  // 设置地块编号（ID）
  if (values.plotId) {
    form.value.plotId = values.plotId;
  }

  // 设置生长时期 - 将传入的值用growth_diagnose_period映射转换
  if (values.growthPeriod !== undefined && values.growthPeriod !== null) {
    // 通过字典映射转换值
    const mappedPeriod = growth_diagnose_period.value?.find((item) => item.label === values.growthPeriod || item.value === values.growthPeriod);
    form.value.growthPeriod = mappedPeriod.value;
  } else {
    // 设置默认生长时期为抽穗期
    const defaultGrowthPeriod = growth_diagnose_period.value?.find((item) => item.label === '抽穗期');
    if (defaultGrowthPeriod) {
      form.value.growthPeriod = defaultGrowthPeriod.value;
    }
  }

  // 设置诊断时间默认为当前时间
  form.value.diagnosisTime = defaultDiagnosisTime;

  // 设置诊断模型，默认为无人机模型（已在初始化时设置）
  if (values.diagnosisModel) {
    form.value.diagnosisModel = values.diagnosisModel;
  }

  // 重置表单到初始状态
  // reset();
};

/** 表单重置 */
const reset = () => {
  // 重置时设置默认时间为当前时间
  const defaultDiagnosisTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  form.value = { ...initFormData, diagnosisTime: defaultDiagnosisTime };
  remoteImageUrl.value = null; // 重置遥感图像URL
  diagnosisFormRef.value?.resetFields();
};

/** 监听遥感图片选择事件 */
const handleRemoteSenseSelect = (sense: any) => {
  if (!sense) return;

  // 1. 自动更新地块编号
  if (sense.plotId) {
    form.value.plotId = String(sense.plotId);
  }

  // 2. 自动更新生长时期
  // 注意：需要确保 sense.growthPeriod 的值与字典 growth_diagnose_period 中的 value 对应
  if (sense.growthPeriod) {
    form.value.growthPeriod = sense.growthPeriod;
  }

  proxy?.$modal.msgSuccess('已根据选定图片自动关联地块及生长时期');
};

/** 提交按钮 */
const submitForm = () => {
  diagnosisFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        let response;
        let recordId;
        const isNewRecord = !form.value.id;
        setDefaultBase();
        // 保存当前的remoteImageUrl值和表单数据快照
        const currentRemoteImageUrl = remoteImageUrl.value;
        const currentFormData = { ...form.value }; // 创建表单数据快照

        // 提交表单到长势后端（包含原始图像信息）
        if (isNewRecord) {
          console.log('提交表单到长势后端（包含原始图像信息）', currentFormData);
          response = await addDiagnosis(currentFormData);

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
          proxy?.$modal.msgSuccess('新增成功');
        } else {
          response = await updateDiagnosis(currentFormData);
          recordId = currentFormData.id;
          proxy?.$modal.msgSuccess('修改成功');
        }
        console.log('提交表单到长势后端（包含原始图像信息）成功', currentFormData);
        // 如果是新增记录，则触发模型预测
        if (isNewRecord && recordId) {
          // 使用保存的remoteImageUrl值而不是依赖当前值
          console.log('使用保存的remoteImageUrl值', currentFormData);
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
            }, 100);
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

    // 注意：这里需要导入listDiagnosis方法
    const response = await listDiagnosis(queryParam);
    // console.log('0000000000000000000000', response);
    if (response.rows && response.rows.length > 0) {
      // 查找匹配的记录
      for (const record of response.rows) {
        // 检查基地名称和地块编号是否匹配（使用==而不是===，因为可能是不同类型）
        if (record.baseName == formData.baseName && record.plotId == formData.plotId) {
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

/**
 * 使用指定的URL处理图像并更新预测结果
 */
const processImageAndUpdateWithUrl = async (recordId: string | number, imageUrl: string, formData: DiagnosisForm = form.value) => {
  try {
    // 调用模型处理接口
    const response = await processRgbImageUrl('1', imageUrl);
    // console.log('模型处理结果:', response.data);
    setDefaultBase();
    if (response.data) {
      // 构造更新数据对象，包含所有必填字段，使用传入的formData
      const updateData: DiagnosisForm = {
        id: recordId,
        baseName: formData.baseName,
        plotId: formData.plotId,
        originalImage: response.data.resultData.originalUrl.url,
        growthPeriod: formData.growthPeriod,
        diagnosisTime: formData.diagnosisTime,
        diagnosisModel: formData.diagnosisModel || 'RGB图像智能诊断模型',
        laiPrediction: response.data.resultData.mean_lai?.toFixed(2),
        spadPrediction: response.data.resultData.mean_spad?.toFixed(2),
        // growthLevel: response.data.resultData.level,
        growthLevel: '较差',
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
      console.log(updateData);
      // 使用现有的接口更新数据库中的记录
      // console.log('更新数据库中的记录:', updateData);
      await updateDiagnosis(updateData);

      // 只有当长势等级为"较差"时才执行水肥诊断相关操作
      if (response.data.resultData.level === '较差') {
        // 添加水肥模型预测数据
        try {
          // 调用水肥一体化评估接口获取预测结果
          const assessmentResponse = await waterFertilizerAssessment({
            lai: parseFloat(response.data.resultData.mean_lai.toFixed(2)),
            growthLevel: response.data.resultData.level,
            spadValue: parseFloat(response.data.resultData.mean_spad.toFixed(2))
          });

          if (assessmentResponse.data) {
            const waterData = assessmentResponse.data.data.water_assess;
            const fertilizerData = assessmentResponse.data.data.fertilization_assess;

            const wafData = {
              baseId: formData.baseName || defaultBaseId.value, // 基地ID
              plotId: formData.plotId, // 地块ID
              growthPeriod: formData.growthPeriod, // 生长时期ID
              lai: parseFloat(response.data.resultData.mean_lai?.toFixed(2)), // LAI值
              spad: parseFloat(response.data.resultData.mean_spad?.toFixed(2)), // SPAD值
              growthLevel: response.data.resultData.level, // 长势等级
              waterLevel: waterData?.water_level, // 缺水等级
              applyM3PerMu: waterData ? parseFloat(waterData.irrigation_amount_m3_per_mu) : 0, // 本次应灌水量
              upperReal: waterData ? parseFloat(waterData.upper_limit_actual) : 0, // 灌溉上限
              lowerReal: waterData ? parseFloat(waterData.lower_limit_actual) : 0, // 灌溉下限
              nutrientLevel: fertilizerData?.deficit_level, // 缺肥等级
              diagnosisModel: '水肥亏缺诊断模型' // 诊断模型
            };

            await addWaf(wafData);

            // 添加补水和追肥的预测建议
            // 生成补水建议
            const waterSuggestion = getWaterSuggestion(formData.growthPeriod, waterData?.water_level, waterData?.applyM3PerMu);

            // 生成追肥建议
            const fertilizerSuggestion = getFertilizerSuggestion(formData.growthPeriod, fertilizerData?.deficit_level);

            // 保存补水建议到补给记录
            if (waterData?.water_level && waterData?.water_level !== '适宜') {
              const waterSupplyData = {
                baseId: formData.plotId,
                baseName: getBaseNameById(formData.baseName || defaultBaseId.value),
                actionTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                alertInfo: waterSuggestion,
                measure: '补水',
                problemType: formData.growthPeriod
              };

              await addSupplyRec(waterSupplyData);
            }

            // 保存追肥建议到补给记录
            if (fertilizerData?.deficit_level && fertilizerData?.deficit_level !== '适宜') {
              const fertilizerSupplyData = {
                baseId: formData.plotId,
                baseName: getBaseNameById(formData.baseName || defaultBaseId.value),
                actionTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                alertInfo: fertilizerSuggestion,
                measure: '追肥',
                problemType: formData.growthPeriod
              };

              await addSupplyRec(fertilizerSupplyData);
            }
          }
        } catch (wafError) {
          console.error('添加水肥模型预测数据失败:', wafError);
          // 不阻塞主流程，仅记录错误
        }
      }

      proxy?.$modal.msgSuccess('图像处理完成并已更新数据');

      // 发出completed事件，通知父组件刷新地图，并传递记录ID
      setDefaultBase();
    }
    emits('completed', recordId);
  } catch (error) {
    console.error('处理失败:', error);
    proxy?.$modal.msgError('图像处理失败: ' + (error as Error).message);
  } finally {
    buttonLoading.value = false;
  }
};

// 通过基地ID获取基地名称
const getBaseNameById = (baseId: string) => {
  const selectedBase = baseDict.value.find((item) => item.value === baseId);
  return selectedBase ? selectedBase.label : baseId;
};

// 通过地块ID获取地块编号
const getPlotCodeById = (plotId: string) => {
  // 由于现在使用PlotSelector组件，需要从所有地块中查找
  const selectedPlot = allLandDict.value.find((item) => item.value === plotId);
  return selectedPlot ? selectedPlot.label : plotId;
};

// 暴露方法和数据给父组件
defineExpose({
  setDefaultValues,
  getDicts,
  reset,
  baseDict // 暴露基地字典数据
});

onMounted(() => {
  getDicts().then(() => {
    setDefaultBase();

    // 设置默认生长时期
    if (!form.value.growthPeriod) {
      const defaultGrowthPeriod = growth_diagnose_period.value?.find((item) => item.label === '拔节期');
      if (defaultGrowthPeriod) {
        form.value.growthPeriod = defaultGrowthPeriod.value;
      }
    }
  });
});
</script>
<style>
.form-label {
  font-weight: 100;
}

.no-bold-label .el-form-item__label {
  font-weight: normal;
}
</style>
