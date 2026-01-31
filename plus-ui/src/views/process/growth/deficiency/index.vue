<template>
  <div class="deficiency-container">
    <!-- 左侧区域 -->
    <div class="left-panel">
      <!-- 左上：基地信息（参考diagnosis页面的基地详情） -->
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
                  <el-tag type="primary">{{ getBaseNameLabel(currentBaseName) }}</el-tag>
                </span>
              </div>
              <div class="form-item">
                <span class="form-label">LAI：</span>
                <span class="form-value"> {{ currentBaseInfo.lai }} </span>
              </div>
              <div class="form-item">
                <span class="form-label">SPAD：</span>
                <span class="form-value"> {{ currentBaseInfo.spad }} </span>
              </div>
              <div class="form-item">
                <span class="form-label">长势等级：</span>
                <span class="form-value">
                  <el-tag :type="getGrowthLevelType(currentBaseInfo.growth)">
                    {{ currentBaseInfo.growth }}
                  </el-tag>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 左下：新增诊断组件 -->
      <div class="add-diagnosis-section">
        <div class="diagnosis-form-card">
          <div class="card-header">
            <span>长势诊断</span>
          </div>

          <div class="diagnosis-form-content">
            <!-- 直接嵌入 GrowthDiagnosis 表单，而非使用弹窗 -->
            <GrowthDiagnosisForm ref="growthDiagnosisFormRef" @completed="handleDiagnosisCompleted" @form-change="handleFormChange" />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧区域：长势地图 -->
    <div class="right-panel">
      <GrowthStatusMap
        ref="growthStatusMapRef"
        :growth-data="diagnosisHistory"
        :base-name="currentBaseName"
        :initial-base-name="currentBaseName"
        :base-id="currentBaseId"
        @map-loaded="onMapLoaded"
        @feature-click="handleMapFeatureClick"
      />
    </div>
    <!-- 弹窗组件 -->
    <DiagnosisResult
      v-if="selectedCellData"
      v-model="dialogVisible"
      :diagnosis-id="selectedCellData.id"
      :plot-id="selectedCellData.plotNumber"
      :lai="selectedCellData.laiValue"
      :spad="selectedCellData.spadValue"
      :growth-level="selectedCellData.growthStatus"
      :growth-period="selectedCellData.growthPeriod"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, watch } from 'vue';
import { listDiagnosis } from '@/views/process/growth/diagnosis/api';
import { landDictQuery, baseDictQuery } from '@/views/process/growth/api/tableDict';
import { listIntegratedData } from '@/views/process/growth/api/baseInfo/index';
import DiagnosisResult from '@/views/process/growth/diagnosis/components/DiagnosisResult.vue';
import GrowthDiagnosisForm from '@/views/process/growth/components/GrowthDiagnosisForm.vue';
import GrowthStatusMap from '@/views/process/growth/components/GrowthStatusMap.vue';
import GeoJSON from 'ol/format/GeoJSON';

// 获取字典数据
const { proxy } = getCurrentInstance() as any;
const { base_id2name_map } = toRefs<any>(proxy?.useDict('base_id2name_map'));
const { growth_diagnose_period } = toRefs<any>(proxy?.useDict('growth_diagnose_period'));

// 定义生育期数据
const period = ref('抽穗期');
const selectedPeriod = ref('抽穗期');
const periodDiagnosisData = ref<DiagnosisRecord[]>([]);

interface DiagnosisRecord {
  id: string | number;
  baseName: string;
  plotNumber: string;
  growthPeriod: string;
  diagnosisTime: string;
  laiValue: number;
  spadValue: number;
  growthStatus: string;
}
const diagnosisHistory = ref<DiagnosisRecord[]>([]);

// 全局变量：当前基地名称和基地ID
// 当前基地ID变量
const currentBaseId = ref<string | undefined>(undefined);

// 修改currentBaseName的定义，根据currentBaseId动态设置显示名称
const currentBaseName = computed(() => {
  // 使用基地ID到名称的字典进行转换
  if (currentBaseId.value && baseDict.value) {
    const matchedEntry = baseDict.value.find((entry) => entry.value === currentBaseId.value);
    if (matchedEntry) {
      return matchedEntry.label;
    }
  }
  return '侯家沟基地';
});

// 当前基地信息
const currentBaseInfo = ref({
  name: '侯家沟基地',
  lai: '4.12',
  spad: '46.8',
  growth: '正常'
});

// 引用 GrowthDiagnosisForm 组件
const growthDiagnosisFormRef = ref<InstanceType<typeof GrowthDiagnosisForm> | null>(null);
// 引用 GrowthStatusMap 组件
const growthStatusMapRef = ref<InstanceType<typeof GrowthStatusMap> | null>(null);

// 字典数据
const baseDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);
// 存储所有地块数据，避免重复请求
const allLandDict = ref<DictDataOption[]>([]);

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

    // 设置当前基地ID为第一个基地
    if (res.rows && res.rows.length > 0) {
      currentBaseId.value = String(res.rows[0].value);
    }
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

/** 获取基地名称标签 */
const getBaseNameLabel = (baseValue: string | undefined) => {
  if (!baseValue) return '';

  const baseOption = baseDict.value.find((option) => option.value === baseValue);
  return baseOption ? baseOption.label : baseValue;
};

// 根据长势等级获取标签类型
const getGrowthLevelType = (level: string) => {
  switch (level) {
    case '良好':
      return 'success';
    case '正常':
      return '';
    case '较差':
      return 'warning';
    default:
      return '';
  }
};

// 生长期映射 - 使用 growth_diagnose_period 字典
const growthPeriodMap = computed(() => {
  const map: Record<string, string> = {};
  if (growth_diagnose_period.value) {
    growth_diagnose_period.value.forEach((item: any) => {
      map[item.label] = item.value;
      map[item.value] = item.label; // 双向映射
    });
  }
  return map;
});

// 根据生育期更新基地信息数据
const fetchBaseInfoData = async () => {
  try {
    if (!currentBaseId.value) return;

    // 调用API获取集成数据
    const params = {
      baseId: currentBaseId.value,
      period: growthPeriodMap.value[selectedPeriod.value] || '3'
    };

    const res: any = await listIntegratedData(params);

    // 解析返回的数据并更新基地信息
    // 更安全地处理API响应数据
    let dataArray = [];
    if (res && typeof res === 'object' && Array.isArray(res.data)) {
      // 如果res有data字段且data是数组
      dataArray = res.data;
    }

    // 确保数组至少有一项数据
    if (dataArray.length > 0) {
      const data = dataArray[0];

      // 提取需要的字段
      const lai = data.avgLai !== undefined ? data.avgLai.toFixed(2) : 'N/A';
      const spad = data.avgSpad !== undefined ? data.avgSpad.toFixed(1) : 'N/A';
      // 简单处理长势等级，实际应该根据具体业务逻辑确定
      let growth = '正常'; // 默认值
      if (data.growthDistribution) {
        // 解析"良好:正常:较差"格式的比例数据
        const parts = data.growthDistribution.split(':');
        if (parts.length === 3) {
          const good = parseInt(parts[0]) || 0;
          const normal = parseInt(parts[1]) || 0;
          const poor = parseInt(parts[2]) || 0;

          // 选择数值最大的作为主要长势，如果一样则以前面的为准
          if (good >= normal && good >= poor) {
            growth = '良好';
          } else if (normal >= poor) {
            growth = '正常';
          } else {
            growth = '较差';
          }
        }
      }

      // 更新基地信息数据
      currentBaseInfo.value = {
        ...currentBaseInfo.value,
        lai: String(lai),
        spad: String(spad),
        growth: growth
      };
    }
  } catch (error) {
    console.error('获取基地信息数据失败:', error);
  }
};

const fetchDiagnosisData = async () => {
  try {
    const res = await listDiagnosis({ pageNum: 1, pageSize: 1000 });
    // 生育期字典转换，使用 growth_diagnose_period 字典
    const growthPeriodMap: Record<string, string> = {};
    if (growth_diagnose_period.value) {
      growth_diagnose_period.value.forEach((item: any) => {
        growthPeriodMap[item.value] = item.label;
      });
    }

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
        growthPeriod: growthPeriodMap[item.growthPeriod],
        diagnosisTime: item.diagnosisTime,
        laiValue: item.laiPrediction,
        spadValue: item.spadPrediction,
        growthStatus: item.growthLevel
      })) || [];
    // console.log('转换后数据:', diagnosisHistory.value);
  } catch (error) {
    console.error('获取诊断数据失败:', error);
  }
};

// 处理地图要素点击事件
const handleMapFeatureClick = (featureData: any) => {
  console.log('地图要素被点击:', featureData);

  // 检查是否是地块图层
  if (featureData.layerId === 'land_unit') {
    const plotId = featureData.properties.landId;

    // 设置表单的地块ID
    if (growthDiagnosisFormRef.value) {
      // 使用 nextTick 确保在 DOM 更新后设置值
      setTimeout(() => {
        // 确保基地ID也被正确设置
        if (currentBaseId.value) {
          growthDiagnosisFormRef.value?.setDefaultValues({
            baseId: currentBaseId.value,
            plotId: plotId
          });
        }
      }, 0);
    }

    // 查找对应的诊断数据
    const diagnosisData = diagnosisHistory.value.find((item) => item.plotNumber === plotId);

    // 如果找到了诊断数据，则显示诊断结果弹窗
    if (diagnosisData) {
      selectedCellData.value = diagnosisData;
      dialogVisible.value = true;
    }
  }
};

// 处理表单变更事件
const handleFormChange = (formData: any) => {
  // 当表单中的生长时期发生变化时，更新基地信息
  if (formData.growthPeriod) {
    // 将生长时期ID转换为标签
    const periodLabel = growthPeriodMap.value[formData.growthPeriod];
    if (periodLabel && selectedPeriod.value !== periodLabel) {
      selectedPeriod.value = periodLabel;
      fetchBaseInfoData();
    }
  }
};

// 添加响应式数据
const dialogVisible = ref(false);
const selectedCellData = ref<DiagnosisRecord | null>(null);

// 处理诊断完成事件
const handleDiagnosisCompleted = (recordId?: string | number) => {
  // 重置表单
  if (growthDiagnosisFormRef.value) {
    growthDiagnosisFormRef.value.reset();
  }

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
    }, 500);
  }

  // 更新基地信息
  fetchBaseInfoData();
};

// 添加响应式数据用于跟踪当前显示的数据类型 ('lai' 或 'spad')
const dataType = ref<'lai' | 'spad'>('lai');

// 数据范围配置
const dataRange = ref({
  min: 0.5,
  max: 3,
  unit: '',
  precision: 2,
  name: 'LAI指数' // 数据名称，显示在图例标题
});

// 切换数据类型的函数
const toggleDataType = () => {
  // 先切换数据类型
  if (dataType.value === 'lai') {
    dataType.value = 'spad';
    dataRange.value.name = 'SPAD指数';
  } else {
    dataType.value = 'lai';
    dataRange.value.name = 'LAI指数';
  }

  // 根据当前所有数据动态计算范围
  calculateDataRange();
};

// 根据当前数据动态计算范围
const calculateDataRange = () => {
  // 收集所有可能的数据值（包括诊断数据和JSON数据）
  const allValues: number[] = [];

  // 从诊断历史数据中提取当前数据类型的值
  if (diagnosisHistory.value.length > 0) {
    const diagnosisValues = diagnosisHistory.value
      .map((record) => (dataType.value === 'lai' ? record.laiValue : record.spadValue))
      .filter((value) => typeof value === 'number' && !isNaN(value));

    allValues.push(...diagnosisValues);
  }

  // 从JSON数据中提取当前数据类型的值
  if (laiSpadGrowthData.value && Object.keys(laiSpadGrowthData.value).length > 0) {
    const jsonValues = Object.values(laiSpadGrowthData.value)
      .map((item: any) => (dataType.value === 'lai' ? item.laiValue : item.spadValue))
      .filter((value) => typeof value === 'number' && !isNaN(value));

    allValues.push(...jsonValues);
  }

  // 如果没有任何数据，设置默认范围
  if (allValues.length === 0) {
    if (dataType.value === 'lai') {
      dataRange.value.min = 0;
      dataRange.value.max = 5;
    } else {
      dataRange.value.min = 0;
      dataRange.value.max = 100;
    }
    return;
  }

  // 计算最小值和最大值
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  // 添加一些边距，使图表不那么拥挤
  const margin = (max - min) * 0.1;
  dataRange.value.min = Math.max(0, min - margin);
  dataRange.value.max = max + margin;
};

// 添加响应式数据用于存储LAISPAGrowth数据
const laiSpadGrowthData = ref<Record<string, any>>({});

// 添加响应式数据用于存储 predictionClass 数据
const predictionClassData = ref<InstanceType<typeof GeoJSON> | null>(null);

// 加载LAISPAGrowth数据
const loadLaiSpadGrowthData = async () => {
  try {
    const response = await fetch('/map-json/lai_spad_growth_result.json');
    const data = await response.json();

    // 构建以plotId为键的数据映射
    const dataMap: Record<string, any> = {};
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.plotId) {
          dataMap[item.plotId] = item;
        }
      });
    }

    laiSpadGrowthData.value = dataMap;
    console.log('LAISPADGrowth数据加载完成，数据项数量:', Object.keys(dataMap).length);
  } catch (error) {
    console.error('加载LAISPADGrowth数据失败:', error);
  }
};

// 加载 prediction_class2.geojson 数据
const loadPredictionClassData = async () => {
  try {
    const predictionClassResponse = await fetch('/map-json/prediction_class2.geojson');
    predictionClassData.value = await predictionClassResponse.json();
    console.log('prediction_class2.geojson 数据加载完成');
  } catch (error) {
    console.error('加载 prediction_class2.geojson 数据失败:', error);
  }
};

// 事件处理
const onMapLoaded = () => {
  console.log('长势地图加载完成');

  // 地图加载完成后定位到当前基地
  if (growthStatusMapRef.value && currentBaseName) {
    // 使用基地ID到跳转地点名称的专门字典进行转换
    let fullBaseName = '';
    if (currentBaseId.value && base_id2name_map.value) {
      // 在字典数组中查找匹配的基地ID
      const matchedEntry = base_id2name_map.value.find((entry: any) => entry.label === currentBaseId.value);
      if (matchedEntry) {
        fullBaseName = matchedEntry.value;
      }
    }

    // 如果没有找到映射，则使用原来的逻辑
    if (!fullBaseName) {
      // 基于基地名称确定要定位的基地全称
      let baseNameLabel = getBaseNameLabel(currentBaseName.value);
      // 去掉基地名称最后两个字"基地"
      if (baseNameLabel.endsWith('基地') && baseNameLabel.length > 2) {
        baseNameLabel = baseNameLabel.substring(0, baseNameLabel.length - 2);
      }

      if (baseNameLabel === '侯家沟') {
        fullBaseName = '侯家沟数字化种植基地';
      } else if (baseNameLabel === '姜兴庄') {
        fullBaseName = '姜兴庄智慧引领种植基地';
      }
    }

    // 延迟执行确保地图完全初始化
    setTimeout(() => {
      // 获取地图实例并定位到基地
      if (growthStatusMapRef.value && typeof growthStatusMapRef.value.mapRef === 'object') {
        // 通过 mapRef.locate 方法定位到基地
        if (growthStatusMapRef.value.mapRef && typeof growthStatusMapRef.value.mapRef.locate === 'function') {
          growthStatusMapRef.value.mapRef.locate(fullBaseName);
          console.log(`地图已定位到基地: ${fullBaseName}`);
        }
      }
    }, 500);
  }
};

// 组件挂载时初始化
onMounted(async () => {
  await fetchDiagnosisData();
  await getDicts();

  // 加载地块数据
  await loadLaiSpadGrowthData();
  // 加载 prediction_class2.geojson 数据
  await loadPredictionClassData();
  // 初始化 GrowthDiagnosisForm 组件
  if (growthDiagnosisFormRef.value) {
    await growthDiagnosisFormRef.value.getDicts();
    // 设置默认基地
    setTimeout(() => {
      if (currentBaseId.value && growthDiagnosisFormRef.value) {
        // 直接设置表单的基地ID，确保地块选择器可以启用
        growthDiagnosisFormRef.value.setDefaultValues({
          baseId: currentBaseId.value
        });
      }
    }, 100);
  }

  // 初始化数据范围
  calculateDataRange();

  // 获取初始基地信息
  fetchBaseInfoData();
});

// 监听生长时期变化
watch(selectedPeriod, () => {
  fetchBaseInfoData();
});
</script>

<style scoped lang="scss">
.deficiency-container {
  display: flex;
  width: auto;
  height: 90vh;
  padding: 16px;
  box-sizing: border-box;
  gap: 2vh;
  font-size: 14px;
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
  min-height: 40%;
  background: #fff;
  border-radius: 1vh;
  padding: 1vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.diagnosis-form-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.diagnosis-form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.add-diagnosis-section {
  flex: 2;
  height: auto;
  background: #fff;
  border-radius: 1vh;
  padding: 2vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.right-panel {
  flex: 1;
  width: 70%;
  height: 100%;
  background: #fff;
  border-radius: 1vh;
  padding: 0; /* 移除内边距，让地图组件占满整个区域 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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
  color: #606266;
  text-align: right;
  margin-right: 1vh;
  font-weight: normal;
}

.form-value {
  flex: 1;
  :deep(.el-tag) {
    height: 3vh;
    font-size: 14px;
  }

  :deep(.el-select) {
    height: 3vh;
    font-size: 14px;
  }

  :deep(.el-select .el-select__wrapper) {
    height: 3vh;
    min-height: 0;
    font-size: 14px;
  }

  :deep(.el-select-dropdown__item) {
    font-size: 14px;
    height: 2vh;
    line-height: 2vh;
  }

  // 确保下拉菜单整体大小适配
  :deep(.el-select-dropdown) {
    font-size: 14px;
  }
  // 添加上传组件提示文字的字体大小调整
  :deep(.el-upload__tip) {
    font-size: 12px;
  }
}

:deep(.el-button) {
  height: 3vh;
  font-size: 2vh;
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
  // font-weight: 500;

  :deep(.el-tag) {
    height: 3vh;
    font-size: 2vh;
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

/* 历史诊断记录样式 */
.history-diagnosis-container {
  //height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 2vh;
}

.history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 1vh 0;

  :deep(.el-pager li) {
    font-size: 1.8vh;
    min-width: 2.5vh;
    height: 2.5vh;
    line-height: 2.5vh;
  }

  :deep(.btn-prev),
  :deep(.btn-next) {
    font-size: 1.8vh;
    min-width: 2.5vh;
    height: 2.5vh;
    line-height: 2.5vh;
  }

  :deep(.el-pagination__sizes) {
    display: none;
  }

  :deep(.el-pagination__jump) {
    display: none;
  }
}

.data-analysis-section {
  margin-bottom: 2vh;
  padding-bottom: 2vh;
  border-bottom: 1px solid #eee;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2vh;

  .section-title {
    // font-weight: bold;
    font-size: 2.2vh;
    color: #333;
  }

  :deep(.el-select) {
    height: 3vh;
    font-size: 1.8vh;
  }

  :deep(.el-select .el-select__wrapper) {
    height: 3vh;
    min-height: 0;
  }
}

.analysis-card {
  display: flex;
  background: #fafafa;
  border-radius: 1vh;
  padding: 1.5vh;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  }

  .card-icon {
    width: 8vh;
    height: 8vh;
    border-radius: 1vh;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1.5vh;
    transition: all 0.2s ease-in-out;
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .card-value {
      font-size: 2vh;
      // font-weight: bold;
      color: #333;
      margin-bottom: 0.5vh;
    }

    .card-label {
      font-size: 1.6vh;
    }
  }
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2vh;
}

.chart-item {
  background: #fafafa;
  border-radius: 1vh;
  padding: 2vh;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .chart-placeholder {
    height: 15vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 1vh;
    border: 1px dashed #dcdfe6;
  }
}

.growth-period-charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2vh;
  margin-top: 2vh;
}

.period-chart-item {
  background: #fafafa;
  border-radius: 1vh;
  padding: 2vh;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .chart-title {
    font-size: 2vh;
    // font-weight: bold;
    color: #333;
    margin-bottom: 1.5vh;
  }

  .chart-placeholder {
    height: 12vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 1vh;
    border: 1px dashed #dcdfe6;
  }
}

.growth-period-chart {
  width: 100%;
  height: 100%;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 3vh;
  margin-bottom: 2vh;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 1vh;
    font-size: 1.8vh;
  }

  .legend-color {
    width: 2vh;
    height: 2vh;
    border-radius: 0.5vh;

    &.lai {
      background-color: #409eff;
    }

    &.spad {
      background-color: #67c23a;
    }
  }
}

.chart-area {
  display: flex;
  height: 20vh;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 4vh;
  margin-right: 1vh;

  .y-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 1vh;
    font-size: 1.6vh;
    color: #606266;
    /* 修改这里：确保高度与热力图行高一致 */
    height: 6vh;
    box-sizing: border-box;
  }
}

.chart-content {
  flex: 1;
  position: relative;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .grid-line {
    height: 1px;
    background-color: #ebeef5;
  }
}

.chart-data {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.data-series {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.data-point {
  position: absolute;
  width: 1.5vh;
  height: 1.5vh;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  z-index: 2;

  &.lai-point {
    background-color: #409eff;
    border: 0.3vh solid #fff;
  }

  &.spad-point {
    background-color: #67c23a;
    border: 0.3vh solid #fff;
  }
}

.data-line {
  position: absolute;
  height: 0.5vh;
  transform-origin: left center;

  &.lai-line {
    background-color: #409eff;
  }

  &.spad-line {
    background-color: #67c23a;
  }
}

.x-axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3vh;
  display: flex;

  .x-label {
    position: absolute;
    transform: translateX(-50%);
    font-size: 1.6vh;
    color: #606266;
    white-space: nowrap;
  }
}

.value-labels {
  position: relative;
  height: 5vh;
  margin-top: 2vh;
  display: flex;

  .value-label {
    position: absolute;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5vh;
  }

  .value-item {
    display: flex;
    align-items: center;
    gap: 0.5vh;
    font-size: 1.4vh;
    color: #606266;
  }

  .value-color {
    width: 1vh;
    height: 1vh;
    border-radius: 50%;

    &.lai {
      background-color: #409eff;
    }

    &.spad {
      background-color: #67c23a;
    }
  }
}

.heatmap-container {
  display: flex;
  margin-top: 2vh;
}

.y-axis-labels {
  display: flex;
  flex-direction: column;
  width: 8vh;
  margin-right: 1vh;

  .y-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 1vh;
    font-size: 1.6vh;
    color: #606266;
    height: 6vh;
    box-sizing: border-box;
  }
}

.heatmap-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.x-axis-labels {
  display: flex;
  height: 3vh;
  margin-bottom: 1vh;
  flex-shrink: 0; // 防止被压缩

  .x-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4vh;
    color: #606266;

    // 默认横着放
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    // 如果宽度不够则竖着放
    @media screen and (max-width: 1200px) {
      writing-mode: vertical-lr;
      text-orientation: mixed;
    }
  }
}

.heatmap-grid {
  border: 1px solid #dcdfe6;
  border-radius: 0.5vh;
  overflow: hidden;
  flex: 1;
}

.heatmap-row {
  display: flex;
  height: 6vh;
  min-height: 6vh;

  &:not(:last-child) {
    border-bottom: 1px solid #dcdfe6;
  }
}

.heatmap-cell {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #dcdfe6;
  position: relative;

  &:last-child {
    border-right: none;
  }

  .cell-text {
    font-size: 1.4vh;
    color: #fff;
    // font-weight: bold;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
  }
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 3vh;
  margin-bottom: 2vh;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 1vh;
    font-size: 1.8vh;
  }

  .legend-color {
    width: 2vh;
    height: 2vh;
    border-radius: 0.5vh;
  }
}

.diagnosis-result-section {
  margin-top: 2vh;
  padding-top: 2vh;
  border-top: 1px solid #eee;
}

.no-data-placeholder {
  text-align: center;
  color: #909399;
  font-size: 2vh;
  padding: 4vh 0;
}

.data-analysis-layout {
  display: flex;
  gap: 2vh;
  margin-bottom: 3vh;
}

.analysis-left {
  flex: 1;
  .period-analysis-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2vh;
  }
}

.analysis-right {
  flex: 1;
  background: #fafafa;
  border-radius: 1vh;
  padding: 2vh;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .chart-title {
    font-size: 2vh;
    // font-weight: bold;
    color: #333;
    margin-bottom: 1.5vh;
    text-align: center;
  }

  .pie-chart-container {
    height: 20vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.x-axis-title {
  text-align: center;
  font-size: 1.6vh;
  color: #606266;
  margin-top: 1vh;
  margin-right: 10vh;
}

.floating-toggle-button {
  position: absolute;
  top: 3%;
  right: 100px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
