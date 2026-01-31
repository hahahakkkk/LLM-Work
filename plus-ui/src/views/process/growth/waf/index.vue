<template>
  <div class="waf-container">
    <!-- 左侧区域 -->
    <div class="left-panel">
      <!-- 左上：基地信息（参考deficiency页面的基地详情） -->
      <div class="base-info-section">
        <div class="base-info-card">
          <div class="card-header">
            <i class="el-icon-office-building"></i>
            <span class="header-title">基地详情</span>
          </div>

          <div class="base-info-content">
            <div class="base-form">
              <div class="form-item">
                <span class="form-label">基地名称：</span>
                <span class="form-value">
                  <el-tag type="primary">{{ getBaseNameLabel(currentBaseId) || '侯家沟基地' }}</el-tag>
                </span>
              </div>
              <div class="form-item">
                <span class="form-label">田间持水量：</span>
                <span class="form-value"> 20.5% </span>
              </div>
              <div class="form-item">
                <span class="form-label">土壤容重：</span>
                <span class="form-value"> 1.35g/cm³ </span>
              </div>
              <div class="form-item">
                <span class="form-label">灌溉上限：</span>
                <span class="form-value"> 20.5% × 90% </span>
              </div>
              <div class="form-item">
                <span class="form-label">灌溉下限：</span>
                <span class="form-value"> 20.5% × 50% </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 左下：新增水肥诊断组件 -->
      <div class="add-waf-section">
        <div class="waf-form-card">
          <div class="card-header">
            <span>水肥诊断</span>
          </div>

          <div class="waf-form-content">
            <el-form ref="wafFormRef" :model="form" :rules="rules" label-width="0px">
              <div class="base-form">
                <div class="form-item">
                  <span class="form-waf-label">地块编号：</span>
                  <span class="form-value">
                    <el-select v-model="form.plotId" placeholder="请选择地块编号" clearable>
                      <el-option v-for="dict in landDict" :key="dict.value" :label="dict.label" :value="dict.value" />
                    </el-select>
                  </span>
                </div>
                <div class="form-item">
                  <span class="form-waf-label">生长时期：</span>
                  <span class="form-value">
                    <el-select v-model="form.growthPeriod" placeholder="请选择生长时期" clearable>
                      <el-option v-for="dict in growth_diagnose_period" :key="dict.value" :label="dict.label" :value="dict.value" />
                    </el-select>
                  </span>
                </div>
                <div class="form-item">
                  <span class="form-waf-label">LAI：</span>
                  <span class="form-value">
                    <el-input v-model="form.lai" placeholder="请输入LAI" />
                  </span>
                </div>
                <div class="form-item">
                  <span class="form-waf-label">SPAD值：</span>
                  <span class="form-value">
                    <el-input v-model="form.spad" placeholder="请输入SPAD值" />
                  </span>
                </div>
                <div class="form-item">
                  <span class="form-waf-label">长势等级：</span>
                  <span class="form-value">
                    <el-select v-model="form.growthLevel" placeholder="请选择长势等级" clearable>
                      <el-option label="良好" value="良好" />
                      <el-option label="正常" value="正常" />
                      <el-option label="较差" value="较差" />
                    </el-select>
                  </span>
                </div>
              </div>
              <div class="form-item" style="justify-content: center; margin-top: 2vh">
                <el-button type="primary" :loading="predictLoading" style="width: 100%" @click="autoPredict">提交诊断</el-button>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧区域：地图 -->
    <div class="right-panel">
      <div class="map-card">
        <GrowthMap ref="mapRef" :initial-base-name="selectedBase" @feature-click="handleMapFeatureClick" />
      </div>
    </div>
    <!-- 诊断结果弹窗 (直接使用 DiagnosisResult.vue 组件) -->
    <DiagnosisResult
      v-if="showDiagnosisResult"
      v-model="showDiagnosisResult"
      :plot-id="mapDiagnosisData.plotId"
      :growth-period="mapDiagnosisData.growthPeriod"
      :lai="mapDiagnosisData.lai"
      :spad="mapDiagnosisData.spad"
      :growth-level="mapDiagnosisData.growthLevel"
    />
  </div>
</template>

<script setup name="Waf" lang="ts">
import { reactive, ref, toRefs, getCurrentInstance, ComponentInternalInstance, watch, computed } from 'vue';
import { listWaf, addWaf, waterFertilizerAssessment } from './api';
import { WafVO, WafQuery, WafForm } from './api/types';
import { addAlert } from '@/views/process/growth/alert/api'; // 导入预警API
import DiagnosisResult from './components/wafResult.vue';
import GrowthMap from '@/views/process/growth/components/wafMap.vue';
import { baseDictQuery, landDictQuery } from '@/views/process/growth/api/tableDict'; // 统一字典接口
import { fetchFarmerLands } from '@/views/process/growth/api/baseInfo'; // 特定地块接口
import { getFertilizerSuggestion, getWaterSuggestion } from '@/views/process/growth/utils/waterFertilizerSuggestion';

// 在其他方法后面添加测试方法
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { growth_diagnose_period } = toRefs<any>(proxy?.useDict('growth_diagnose_period'));
const { base_id2name_map } = toRefs<any>(proxy?.useDict('base_id2name_map'));

const wafList = ref<WafVO[]>([]);
const loading = ref(true);
const total = ref(0);

const wafFormRef = ref<ElFormInstance>();
const mapRef = ref();

// 当前基地ID变量
const currentBaseId = ref<string | undefined>('1886244367296888838');

// 字典数据
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);
// 存储所有地块数据，避免重复请求
const allLandDict = ref<DictDataOption[]>([]);

// 修改selectedBase的定义，根据currentBaseId动态设置显示名称
const selectedBase = computed(() => {
  // 使用基地ID到跳转地点名称的专门字典进行转换
  if (currentBaseId.value && base_id2name_map.value) {
    // 在字典数组中查找匹配的基地ID
    const matchedEntry = base_id2name_map.value.find((entry) => entry.label === currentBaseId.value);
    if (matchedEntry) {
      return matchedEntry.value;
    }
  }

  // 如果没有找到映射，则返回空字符串
  return '';
});

const initFormData: WafForm = {
  id: undefined,
  baseId: undefined,
  plotId: undefined,
  growthPeriod: 'p2', // 修改默认值为 undefined
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
    pageSize: 1000,
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
    waterLevel: [{ required: true, message: "缺水等级('轻微','中度','重度','不缺水')不能为空", trigger: 'blur' }],
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

// 新增的响应式数据
const showDiagnosisResult = ref(false);
const mapDiagnosisData = ref({
  plotId: null,
  growthPeriod: '',
  lai: null,
  spad: null,
  growthLevel: ''
});
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

// 监听currentBaseId的变化，确保及时更新selectedBase
watch(currentBaseId, (newVal) => {
  // 当基地ID改变时也更新基地信息数据
  getList();
});

/** 获取基地名称标签 */
const getBaseNameLabel = (baseValue: string | undefined) => {
  if (!baseValue) return '';

  const baseOption = baseDict.value.find((option) => option.value === baseValue);
  return baseOption ? baseOption.label : baseValue;
};
/** 根据生长时期ID获取生长时期标签 */
const getGrowthPeriodLabel = (growthPeriod: string | undefined) => {
  if (!growthPeriod) return '';

  const growthPeriodOption = growth_diagnose_period.value.find((option: DictDataOption) => option.value === growthPeriod);
  return growthPeriodOption ? growthPeriodOption.label : growthPeriod;
};
/** 查询水肥诊断数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listWaf(queryParams.value);
  console.log('水肥诊断数据列表:', res);

  // 通过第一条数据确定当前基地名称
  if (res.rows && res.rows.length > 0) {
    const firstRow = res.rows[0];
    currentBaseId.value = firstRow.baseId?.toString(); // 存储当前基地ID
  }

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

/** 提交按钮 */
const submitForm = () => {
  wafFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      // 确保数值字段被正确转换为数字类型
      console.log('提交表单数据:', form.value);
      const formData = {
        ...form.value,
        baseId: currentBaseId.value,
        lai: form.value.lai !== undefined && form.value.lai !== null ? parseFloat(form.value.lai.toString()) : undefined,
        spad: form.value.spad !== undefined && form.value.spad !== null ? parseFloat(form.value.spad.toString()) : undefined,
        applyM3PerMu:
          form.value.applyM3PerMu !== undefined && form.value.applyM3PerMu !== null ? parseFloat(form.value.applyM3PerMu.toString()) : undefined,
        upperReal: form.value.upperReal !== undefined && form.value.upperReal !== null ? parseFloat(form.value.upperReal.toString()) : undefined,
        lowerReal: form.value.lowerReal !== undefined && form.value.lowerReal !== null ? parseFloat(form.value.lowerReal.toString()) : undefined,
        growth_period: form.value.growthPeriod
      };

      // 添加水肥预警信息
      try {
        // 如果缺水等级不是"不缺水"，则创建缺水预警
        if (formData.waterLevel && formData.waterLevel !== '不缺水') {
          // 使用 waterFertilizerSuggestion.ts 中的函数生成补水建议
          const waterSuggestion = getWaterSuggestion(getGrowthPeriodLabel(formData.growthPeriod), formData.waterLevel, formData.applyM3PerMu);
          const waterAlertData = {
            baseId: currentBaseId.value,
            plotId: formData.plotId,
            actionTime: new Date().toLocaleString('sv-SE').replace(' ', ' '),
            alertInfo: waterSuggestion,
            alertLevel: formData.waterLevel,
            alertType: '缺水',
            isProcessed: 0,
            growthPeriod: formData.growthPeriod
          };

          await addAlert(waterAlertData);
        }

        // 如果缺肥等级不是"不缺肥"，则创建缺肥预警
        if (formData.nutrientLevel && formData.nutrientLevel !== '不缺肥') {
          // 使用 waterFertilizerSuggestion.ts 中的函数生成补肥建议
          const fertilizerSuggestion = getFertilizerSuggestion(getGrowthPeriodLabel(formData.growthPeriod), formData.nutrientLevel);

          const nutrientAlertData = {
            baseId: currentBaseId.value,
            plotId: formData.plotId,
            actionTime: new Date().toLocaleString('sv-SE').replace(' ', ' '),
            alertInfo: fertilizerSuggestion,
            alertLevel: formData.nutrientLevel,
            alertType: '缺肥',
            isProcessed: 0,
            growthPeriod: formData.growthPeriod
          };

          await addAlert(nutrientAlertData);
        }
      } catch (error) {
        console.error('创建预警信息失败:', error);
      }
      proxy?.$modal.msgSuccess('新建操作成功');
      await addWaf(formData);
      await getList();
    }
  });
};
const predictLoading = ref(false);
// 自动预测方法
const autoPredict = async () => {
  // 使用Promise确保表单验证完成并获取最新值
  if (wafFormRef.value) {
    try {
      await new Promise((resolve, reject) => {
        wafFormRef.value?.validate((valid) => {
          if (valid) {
            resolve(true);
          } else {
            reject(new Error('表单验证失败'));
          }
        });
      });
    } catch (error) {
      proxy?.$modal.msgWarning('请检查表单输入是否正确');
      return;
    }
  }

  // 确保必要的字段都有值
  if (!form.value.lai || !form.value.spad || !form.value.growthLevel) {
    proxy?.$modal.msgWarning('请输入LAI值、SPAD值和选择长势等级');
    return;
  }

  // 确保地块编号已选择
  if (!form.value.plotId) {
    proxy?.$modal.msgWarning('请选择地块编号');
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
      }
      // 显示诊断结果弹窗 (直接使用 DiagnosisResult.vue 组件)
      // 更新弹窗数据确保使用最新的值
      console.log('Form data before submit:', {
        ...form.value,
        waterLevel: form.value.waterLevel,
        nutrientLevel: form.value.nutrientLevel,
        applyM3PerMu: form.value.applyM3PerMu,
        upperReal: form.value.upperReal,
        lowerReal: form.value.lowerReal
      });
      console.log('About to call submitwafForm');
      submitForm();
      console.log('Called submitwafForm');
      mapDiagnosisData.value = {
        plotId: form.value.plotId,
        growthPeriod: getGrowthPeriodLabel(form.value.growthPeriod) || '',
        lai: form.value.lai,
        spad: form.value.spad,
        growthLevel: form.value.growthLevel
      };
      showDiagnosisResult.value = true;

      proxy?.$modal.msgSuccess('自动预测完成');
    }
  } catch (error) {
    console.error('自动预测失败:', error);
    proxy?.$modal.msgError('自动预测失败: ' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    predictLoading.value = false;
  }
};

onMounted(() => {
  getList();
  getDicts();
});

// 添加处理地图点击事件的方法
const handleMapFeatureClick = async (featureData: any) => {
  console.log('地图点击事件:', featureData);
  // 从featureData中获取地块信息
  if (featureData && featureData.properties && featureData.properties.landId) {
    const landId = featureData.properties.landId;
    // 查找对应的水肥数据
    const waf = wafList.value.find((item) => item.plotId == landId);

    // 设置地块编号（无论是否找到对应的水肥数据）
    form.value.plotId = landId;

    if (waf) {
      // 使用水肥数据填充表单
      form.value.growthPeriod = getGrowthPeriodLabel(waf.growthPeriod);
      form.value.lai = waf.lai;
      form.value.spad = waf.spad;
      form.value.growthLevel = waf.growthLevel;

      // 设置弹窗数据并显示弹窗
      mapDiagnosisData.value = {
        plotId: waf.plotId,
        growthPeriod: form.value.growthPeriod,
        lai: form.value.lai,
        spad: form.value.spad,
        growthLevel: form.value.growthLevel
      };

      showDiagnosisResult.value = true;
    } else {
      // 没有找到对应的水肥数据，从lai_spad_growth_result.json中读取数据
      try {
        // 获取json数据
        const response = await fetch('/map-json/lai_spad_growth_result.json');
        const jsonData = await response.json();

        // 查找对应地块的数据
        const landData = jsonData.find((item: any) => item.plotId == landId);

        if (landData) {
          // 填充表单数据
          form.value.lai = landData.laiValue;
          form.value.spad = landData.spadValue;
          form.value.growthLevel = landData.growthLevel;

          // 设置弹窗数据并显示弹窗
          mapDiagnosisData.value = {
            plotId: landId,
            growthPeriod: form.value.growthPeriod || '拔节期',
            lai: form.value.lai,
            spad: form.value.spad,
            growthLevel: form.value.growthLevel
          };
          proxy?.$modal.msgSuccess('已查询到遥感卫星长势数据');
          // showDiagnosisResult.value = true;
        } else {
          // 没有找到对应数据，重置表单字段
          form.value.growthPeriod = '';
          form.value.lai = undefined;
          form.value.spad = undefined;
          form.value.growthLevel = '';

          proxy?.$modal.msgWarning('该地块暂无长势数据');
        }
      } catch (error) {
        console.error('读取LAI/SPAD数据失败:', error);
        proxy?.$modal.msgError('数据加载失败');
      }
    }
  }
};
</script>

<style scoped lang="scss">
.waf-container {
  display: flex;
  width: auto;
  height: 90vh;
  padding: 16px; /* 修改为16px */
  box-sizing: border-box;
  gap: 2vh;
  font-size: 14px; /* 修改为14px */
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
  padding: 16px; /* 修改为16px */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.waf-form-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.waf-form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.add-waf-section {
  flex: 2;
  height: auto;
  background: #fff;
  border-radius: 1vh;
  padding: 16px; /* 修改为16px */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* 基地信息样式（参考diagnosis页面） */
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
  /* 删除font-weight: bold; */
  color: #606266;
  text-align: right;
  margin-right: 1vh;
}

.form-waf-label {
  width: 12vh;
  /* 删除font-weight: bold; */
  color: #606266;
  text-align: right;
  margin-right: 1vh;
}

.form-value {
  flex: 1;
  display: flex;
  :deep(.el-tag) {
    height: 3vh;
    font-size: 14px; /* 修改为14px */
  }

  :deep(.el-select) {
    height: 3vh;
    font-size: 14px; /* 修改为14px */
  }

  :deep(.el-select .el-select__wrapper) {
    height: 3vh;
    min-height: 0;
    font-size: 14px; /* 修改为14px */
  }

  :deep(.el-select-dropdown__item) {
    font-size: 14px; /* 修改为14px */
    height: 2vh;
    line-height: 2vh;
  }

  // 确保下拉菜单整体大小适配
  :deep(.el-select-dropdown) {
    font-size: 14px; /* 修改为14px */
  }
  // 添加上传组件提示文字的字体大小调整
  :deep(.el-upload__tip) {
    font-size: 14px; /* 修改为14px */
  }
}

:deep(.el-button) {
  height: 3vh;
  font-size: 14px; /* 修改为14px */
}

:deep(.el-input) {
  height: 3vh;
  font-size: 14px; /* 修改为14px */
}

:deep(.el-input .el-input__wrapper) {
  height: 3vh;
  min-height: 0;
  font-size: 14px; /* 修改为14px */
}

.base-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.8vh;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-label {
  color: #606266;
  white-space: nowrap;
}

.detail-value {
  color: #303133;
  /* 删除font-weight: 500; */
  :deep(.el-tag) {
    height: 3vh;
    font-size: 14px; /* 修改为14px */
  }
}

.base-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.8vh;
}

.result-buttons {
  display: flex;
  gap: 1vh;
  justify-content: center;
  margin-top: 2vh;
  flex: 1;
  align-items: flex-end;
}

.result-buttons :deep(.el-button) {
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1vh;
}

/* 仿照 DiagnosisResult.vue 的样式 */
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

.conclusion-section {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 98%;
  margin-left: 1.5%;
  margin-bottom: 20px;
}

.indicator-group {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 30px;
  width: 100%;
}

.indicator-item {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.indicator-label {
  /* 删除font-weight: bold; */
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
  width: auto;
  min-width: 80px;
  text-align: center;
}

/* 水肥监测结果模块 */
.water-fertilizer-status {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-title {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  /* 删除font-weight: 500; */
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  color: #409eff;
}

/* 指标网格布局 */
.indicators-grid {
  display: flex;
  flex-direction: column;
}

.four-column-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.indicator-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-label {
  /* 删除font-weight: bold; */
  font-size: 14px;
  color: #606266;
  min-width: 100px;
  text-align: left;
}

.custom-tag {
  font-size: 14px;
  padding: 4px 8px;
  height: auto;
  width: auto;
  min-width: 80px;
}

.highlight-tag {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 采收建议模块 */
.harvest-suggestion {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.suggestion-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-line;
}

.suggestion-title {
  /* 删除font-weight: bold; */
  margin-bottom: 5px;
}

.suggestion-content {
  text-indent: 2em;
}
</style>
