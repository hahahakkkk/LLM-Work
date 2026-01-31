<template>
  <div>
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
          <el-select v-model="form.diagnosisModel" placeholder="请选择诊断模型" style="width: 100%">
            <el-option label="无人机模型" value="无人机模型" />
            <el-option label="卫星模型" value="卫星模型" />
          </el-select>
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

<script setup lang="ts">
import { ref, reactive, toRefs, watch, getCurrentInstance, onMounted } from 'vue';
import { addDiagnosis, listDiagnosis, updateDiagnosis } from '@/views/process/growth/diagnosis/api';
import { DiagnosisForm } from '@/views/process/growth/diagnosis/api/types';
import { baseDictQuery, landDictQuery } from '@/views/process/growth/api/tableDict';
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo';
import { listByIds } from '@/api/system/oss';
import { processRgbImageUrl } from '@/views/process/maturity/maturityPred/api/model';
import fileUpload from '@/components/FileUpload/index.vue';
import { addWaf } from '@/views/process/growth/waf/api';
import { waterFertilizerAssessment } from '@/views/process/growth/api/modelForward'; // 添加水肥预测API
import { getWaterSuggestion, getFertilizerSuggestion } from '@/views/process/growth/utils/waterFertilizerSuggestion'; // 导入水肥建议生成函数
import { addSupplyRec } from '@/views/process/growth/supplyRec/api'; // 导入补给记录API

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { growth_period } = toRefs<any>(proxy?.useDict('growth_period'));

const buttonLoading = ref(false);
const diagnosisFormRef = ref<ElFormInstance>();

// 字典数据
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);
const allLandDict = ref<DictDataOption[]>([]);

const addDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 定义事件发射器
const emits = defineEmits(['completed']);

// 存储上传成功后的遥感图像URL
const remoteImageUrl = ref<string | null>(null);

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

const data = reactive<PageData<DiagnosisForm, any>>({
  form: { ...initFormData },
  queryParams: {},
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

const { form, rules } = toRefs(data);

// 监听原始图像ID变化，获取完整URL
watch(
  () => form.value.originalImage,
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

/** 设置表单默认值 */
const setDefaultValues = async (values: any) => {
  console.log('设置表单默认值:', values);

  // 确保字典数据已加载
  if (baseDict.value.length === 0) {
    await getDicts();
  }

  // 重置表单到初始状态
  reset();

  // 通过基地ID查找并设置基地名称
  if (values.baseId) {
    const selectedBase = baseDict.value.find((item) => item.value === values.baseId);
    if (selectedBase) {
      form.value.baseName = selectedBase.value;
    }
  }

  // 设置地块编号（ID）
  if (values.plotId) {
    form.value.plotId = values.plotId;

    // 如果基地ID已提供，加载对应的地块数据
    if (values.baseId) {
      try {
        const res = await fetchFarmerLands({ baseId: values.baseId });
        landDict.value =
          res.rows?.map((item) => ({
            value: String(item.landId),
            label: String(item.landCode)
          })) || [];
      } catch (error) {
        console.error('获取地块字典失败:', error);
      }
    }
  }

  // 设置生长时期 - 将传入的值用growth_period映射转换
  if (values.growthPeriod !== undefined && values.growthPeriod !== null) {
    // 通过字典映射转换值
    const mappedPeriod = growth_period.value?.find((item) => item.label === values.growthPeriod || item.value === values.growthPeriod);
    form.value.growthPeriod = mappedPeriod.value;
  }

  // 设置诊断时间
  if (values.diagnosisTime) {
    form.value.diagnosisTime = values.diagnosisTime;
  }

  // 设置诊断模型，默认为无人机模型
  if (values.diagnosisModel) {
    form.value.diagnosisModel = values.diagnosisModel;
  } else {
    form.value.diagnosisModel = '无人机模型'; // 默认选择无人机模型
  }
};

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

    // 通过基地名称查找基地ID
    const selectedBase = baseDict.value.find((item) => item.label === newBaseName);
    if (selectedBase) {
      // 加载选中基地下的地块
      try {
        const res = await fetchFarmerLands({ baseId: selectedBase.value });
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
  }
);

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

/** 显示新增对话框 */
const showAddDialog = () => {
  // 不再调用reset()，因为setDefaultValues已经处理了表单重置
  addDialog.visible = true;
  addDialog.title = '添加长势模型诊断结果';
  // 初始化为未预测状态
  form.value.isPredicted = 0;
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

        // 保存当前的remoteImageUrl值
        const currentRemoteImageUrl = remoteImageUrl.value;

        // 提交表单到长势后端（包含原始图像信息）
        if (isNewRecord) {
          response = await addDiagnosis(form.value);

          // 尝试获取新增记录的ID
          if (response.data && typeof response.data === 'object' && response.data.id) {
            recordId = response.data.id;
          } else if (response.data && typeof response.data === 'number') {
            recordId = response.data;
          } else {
            // 如果响应中没有ID，则通过查询获取
            recordId = await getNewlyAddedRecordId(form.value);
          }

          if (recordId) {
            form.value.id = recordId;
          }
          proxy?.$modal.msgSuccess('新增成功');
        } else {
          response = await updateDiagnosis(form.value);
          recordId = form.value.id;
          proxy?.$modal.msgSuccess('修改成功');
        }

        // 立即关闭对话框
        addDialog.visible = false;

        // 如果是新增记录，则触发模型预测
        if (isNewRecord && recordId) {
          // 使用保存的remoteImageUrl值而不是依赖当前值
          if (currentRemoteImageUrl) {
            // 直接调用处理函数，传入保存的URL
            setTimeout(async () => {
              try {
                await processImageAndUpdateWithUrl(recordId, currentRemoteImageUrl);
              } catch (error) {
                console.error('模型预测失败:', error);
              }
            }, 100);
          } else {
            console.warn('未找到图像URL，跳过模型预测');
          }
        }

        // emits('completed');
      } finally {
        buttonLoading.value = false;
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
            baseId: form.value.baseName, // 基地ID
            plotId: form.value.plotId, // 地块ID
            growthPeriod: form.value.growthPeriod, // 生长时期ID
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
          const waterSuggestion = getWaterSuggestion(form.value.growthPeriod, waterData?.water_level, waterData?.applyM3PerMu);

          // 生成追肥建议
          const fertilizerSuggestion = getFertilizerSuggestion(form.value.growthPeriod, fertilizerData?.deficit_level);

          // 保存补水建议到补给记录
          if (waterData?.water_level && waterData?.water_level !== '适宜') {
            const waterSupplyData = {
              baseId: form.value.plotId,
              baseName: getBaseNameById(form.value.baseName),
              actionTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
              alertInfo: waterSuggestion,
              measure: '补水',
              problemType: form.value.growthPeriod
            };

            await addSupplyRec(waterSupplyData);
          }

          // 保存追肥建议到补给记录
          if (fertilizerData?.deficit_level && fertilizerData?.deficit_level !== '适宜') {
            const fertilizerSupplyData = {
              baseId: form.value.plotId,
              baseName: getBaseNameById(form.value.baseName),
              actionTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
              alertInfo: fertilizerSuggestion,
              measure: '追肥',
              problemType: form.value.growthPeriod
            };

            await addSupplyRec(fertilizerSupplyData);
          }
        }
      } catch (wafError) {
        console.error('添加水肥模型预测数据失败:', wafError);
        // 不阻塞主流程，仅记录错误
      }

      proxy?.$modal.msgSuccess('图像处理完成并已更新数据');

      // 发出completed事件，通知父组件刷新地图
      emits('completed');
    }
  } catch (error) {
    console.error('处理失败:', error);
    proxy?.$modal.msgError('图像处理失败: ' + (error as Error).message);
  }
};

// 通过基地ID获取基地名称
const getBaseNameById = (baseId: string) => {
  const selectedBase = baseDict.value.find((item) => item.value === baseId);
  return selectedBase ? selectedBase.label : baseId;
};

// 通过地块ID获取地块编号
const getPlotCodeById = (plotId: string) => {
  const selectedPlot = landDict.value.find((item) => item.value === plotId);
  return selectedPlot ? selectedPlot.label : plotId;
};

// 暴露方法和数据给父组件
defineExpose({
  showAddDialog,
  setDefaultValues,
  getDicts,
  baseDict, // 暴露基地字典数据
  landDict // 暴露地块字典数据
});

onMounted(() => {
  getDicts();
});
</script>
