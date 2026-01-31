<template>
  <div class="satellite-data-container">
    <div class="left-panel">
      <div class="data-cards">
        <!-- 无人机数据卡片 -->
        <el-card class="data-card" header="无人机数据">
          <el-table
            :data="uavData"
            height="calc((100vh - 200px) / 3)"
            style="width: 100%"
            @selection-change="handleUavSelectionChange"
            @row-click="handleUavRowClick"
            ref="uavTableRef"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="dateRange" label="诊断时间" width="120" />
            <el-table-column prop="growthPeriod" label="生育期" width="80" />
            <el-table-column prop="lai" label="LAI" width="60" />
            <el-table-column prop="spad" label="SPAD" width="70" />
            <el-table-column prop="dataCount" label="数据量" width="80" />
            <el-table-column prop="growthStatus" label="长势分布" width="100" />
          </el-table>
        </el-card>

        <!-- 卫星数据卡片 -->
        <el-card class="data-card" header="卫星数据">
          <el-table
            :data="satelliteData"
            height="calc((100vh - 200px) / 3)"
            style="width: 100%"
            @selection-change="handleSatelliteSelectionChange"
            @row-click="handleSatelliteRowClick"
            ref="satelliteTableRef"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="date" label="诊断时间" width="120" />
            <el-table-column prop="growthPeriod" label="生育期" width="80" />
            <el-table-column prop="lai" label="LAI" width="60" />
            <el-table-column prop="spad" label="SPAD" width="70" />
            <el-table-column prop="dataCount" label="数据量" width="80" />
            <el-table-column prop="growthStatus" label="长势分布" width="100" />
          </el-table>
        </el-card>

        <!-- 实测数据卡片 -->
        <el-card class="data-card" header="实测数据">
          <el-table
            :data="measuredData"
            height="calc((100vh - 200px) / 3)"
            style="width: 100%"
            @selection-change="handleMeasuredSelectionChange"
            @row-click="handleMeasuredRowClick"
            ref="measuredTableRef"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="dateRange" label="诊断时间" width="120" />
            <el-table-column prop="growthPeriod" label="生育期" width="80" />
            <el-table-column prop="lai" label="LAI" width="60" />
            <el-table-column prop="spad" label="SPAD" width="70" />
            <el-table-column prop="dataCount" label="数据量" width="80" />
            <el-table-column prop="growthStatus" label="长势分布" width="100" />
          </el-table>
        </el-card>
      </div>
    </div>

    <div class="right-panel">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-card class="stat-card stat-card-wide">
          <div class="stat-content">
            <span class="stat-title">数据范围</span>
            <span class="stat-value">{{ stats.dataRange }}</span>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <span class="stat-title">平均LAI</span>
            <span class="stat-value">{{ stats.avgLai }}</span>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <span class="stat-title">平均SPAD</span>
            <span class="stat-value">{{ stats.avgSpad }}</span>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <span class="stat-title">地块总数</span>
            <span class="stat-value">{{ stats.totalPlots }}</span>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <span class="stat-title">长势良好</span>
            <span class="stat-value">{{ stats.good }}</span>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <span class="stat-title">长势正常</span>
            <span class="stat-value">{{ stats.normal }}</span>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <span class="stat-title">长势较差</span>
            <span class="stat-value">{{ stats.poor }}</span>
          </div>
        </el-card>
      </div>

      <div class="map-container">
        <!-- 使用新创建的卫星地图组件 -->
        <SatelliteMap
          ref="satelliteMapRef"
          :geo-data="mapGeoData"
          :base-name="selectedBase"
          :loading="loading"
          :error="error"
          :growth-data="mockGrowthData"
          @map-loaded="onMapLoaded"
          @feature-click="onFeatureClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, getCurrentInstance, toRefs, watch, nextTick } from 'vue';
import { listDiagnosis } from '@/views/process/growth/diagnosis/api';
import { listStatistics } from '@/views/process/growth/statistics/api';
// 引入新创建的卫星地图组件
import SatelliteMap from '@/views/process/growth/components/SatelliteMap.vue';
import type { GeoData } from '@/components/Map/MzMap';
import { Style, Fill, Stroke } from 'ol/style'; // 添加OpenLayers样式导入
import { landDictQuery, baseDictQuery } from '../api/tableDict';
import { getInfo } from '@/api/login';
import { listSatellite } from './api';

const { proxy } = getCurrentInstance() as any;
const { growth_diagnose_period } = toRefs<any>(proxy?.useDict('growth_diagnose_period'));
const { growth_period } = toRefs<any>(proxy?.useDict('growth_period'));
const { four_growth_period } = toRefs<any>(proxy?.useDict('four_growth_period'));

// 表格引用
const uavTableRef = ref();
const satelliteTableRef = ref();
const measuredTableRef = ref();

// 卫星地图组件引用
const satelliteMapRef = ref();

// 地图相关数据
const mapGeoData = ref<GeoData[]>([]);
const baseName = ref('侯家沟数字化种植基地'); // 默认基地名称
const mockGrowthData = ref<Record<string, string>>({});

// 当前基地ID变量
const currentBaseId = ref<string | undefined>();
const currentBaseName = ref<string | undefined>('侯家沟基地');

// 字典数据
const baseDict = ref<DictDataOption[]>([]);

// 修改selectedBase的定义，根据currentBaseId动态设置显示名称
const selectedBase = computed(() => {
  let baseName = currentBaseName.value;
  // 去除末尾的"基地"两个字
  if (baseName && baseName.endsWith('基地')) {
    baseName = baseName.slice(0, -2);
  }

  // 根据基地名称返回地图中存在的基地名称
  if (baseName?.includes('姜兴庄')) {
    return '姜兴庄智慧引领种植基地';
  } else if (baseName?.includes('高家硷')) {
    return '高硷村';
  } else if (baseName?.includes('冯渠')) {
    return '冯渠';
  } else if (baseName?.includes('岳家岔')) {
    return '岳岔';
  } else if (baseName?.includes('李家寺')) {
    return '李家寺';
  } else if (baseName?.includes('侯家沟') && baseName?.includes('数字化')) {
    return '侯家沟南';
  } else if (baseName?.includes('侯家沟')) {
    return '侯家沟数字化种植基地';
  } else if (baseName?.includes('杨家沟')) {
    return '杨家沟';
  } else {
    // 默认返回侯家沟数字化种植基地
    return '侯家沟数字化种植基地';
  }
});

// 无人机数据
const uavData = ref([]);

// 卫星数据
const satelliteData = ref([{ dataCount: 10, date: '05/12', lai: 4.0, spad: 45.7, growthStatus: '6:2:2', growthPeriod: '抽穗期' }]);

// 存储原始卫星数据
const rawSatelliteData = ref<{
  jointing: any[];
  heading: any[];
  filling: any[];
}>({
  jointing: [],
  heading: [],
  filling: []
});

// 实测数据
const measuredData = ref([]);

// 选中数据
const selectedUavData = ref<any[]>([]);
const selectedSatelliteData = ref<any[]>([]);
const selectedMeasuredData = ref<any[]>([]);

// 添加一个响应式变量来跟踪当前选中的表格类型
const currentSelectedTable = ref<'uav' | 'satellite' | 'measured' | null>(null);

// 统计数据
const stats = computed(() => {
  // 合并所有选中的数据
  const allSelectedData = [...selectedUavData.value, ...selectedSatelliteData.value, ...selectedMeasuredData.value];

  if (allSelectedData.length === 0) {
    return {
      dataRange: '请选择左侧数据',
      avgLai: '0.0',
      avgSpad: '0.0',
      good: 0,
      normal: 0,
      poor: 0,
      totalPlots: 0
    };
  }

  // 计算统计数据
  let totalLai = 0;
  let totalSpad = 0;
  let totalGood = 0;
  let totalNormal = 0;
  let totalPoor = 0;
  let totalPlots = 0;

  allSelectedData.forEach((item) => {
    totalLai += parseFloat(item.laiValue) || 0;
    totalSpad += parseFloat(item.spadValue) || 0;
    totalPlots += item.dataCount || 0;

    // 解析长势分布数据 (格式: "良好:正常:较差")
    if (item.growthStatus) {
      const [good, normal, poor] = item.growthStatus.split(':').map(Number);
      totalGood += good || 0;
      totalNormal += normal || 0;
      totalPoor += poor || 0;
    }
  });

  // 确定数据范围（从最早到最晚的日期）
  let dataRange = '未选择数据';
  const dateRanges: string[] = [];

  // 收集所有日期范围
  allSelectedData.forEach((item) => {
    if (item.dateRange) {
      dateRanges.push(item.dateRange);
    }
  });

  if (dateRanges.length > 0) {
    // 处理日期范围，找到最早的开始日期和最晚的结束日期
    let minStartDate = '';
    let maxEndDate = '';

    dateRanges.forEach((range) => {
      // 处理日期范围格式 "MM/dd-MM/dd" 或 "MM/dd~MM/dd" 或单个日期 "MM/dd"
      const separator = range.includes('~') ? '~' : '-';
      const dates = range.split(separator);
      const startDate = dates[0];
      const endDate = dates.length > 1 ? dates[1] : startDate;

      if (!minStartDate || compareDates(startDate, minStartDate) < 0) {
        minStartDate = startDate;
      }
      if (!maxEndDate || compareDates(endDate, maxEndDate) > 0) {
        maxEndDate = endDate;
      }
    });

    if (minStartDate && maxEndDate) {
      if (minStartDate === maxEndDate) {
        // 如果开始和结束日期相同，只显示一个日期
        dataRange = minStartDate;
      } else {
        // 如果开始和结束日期不同，显示日期范围
        dataRange = `${minStartDate}-${maxEndDate}`;
      }
    }
  }

  return {
    dataRange,
    avgLai: (totalLai / allSelectedData.length).toFixed(2),
    avgSpad: (totalSpad / allSelectedData.length).toFixed(2),
    good: totalGood,
    normal: totalNormal,
    poor: totalPoor,
    totalPlots
  };
});

const loading = ref(false);
const error = ref('');

/**
 * 基地字典
 */
const getDicts = async () => {
  // 获取用户信息并输出到控制台
  try {
    const userInfoRes = await getInfo();
    console.log('用户信息:', userInfoRes.data);

    // 获取基地字典
    try {
      const res = await baseDictQuery();
      baseDict.value =
        res.rows?.map((item) => ({
          value: String(item.value),
          label: item.label
        })) || [];

      // 将基地字典第一条作为当前基地ID
      if (res.rows && res.rows.length > 0) {
        currentBaseId.value = String(res.rows[0].value);
        currentBaseName.value = res.rows[0].label;
        // console.log('当前基地ID:', currentBaseId.value);
      }

      // 根据用户信息自动设置基地（如果用户信息中有部门名称）
      if (userInfoRes.data?.user?.deptName) {
        const deptName = userInfoRes.data.user.deptName;
        // 查找匹配的基地
        console.log('匹配的基地:', deptName);
        if (deptName) {
          currentBaseName.value = deptName;
        }
      }
    } catch (error) {
      console.error('获取基地字典失败:', error);
      baseDict.value = [];
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

/** 获取基地名称标签 */
const getBaseNameLabel = (baseValue: string | undefined) => {
  if (!baseValue) return '';

  const baseOption = baseDict.value.find((option) => option.value === baseValue);
  return baseOption ? baseOption.label : baseValue;
};

// 处理无人机表格选中项变化
const handleUavSelectionChange = async (selection: any[]) => {
  // 更新地图显示选中的无人机数据
  await updateMapWithSelectedUavData(selection);
};

// 处理卫星表格选中项变化
const handleSatelliteSelectionChange = (selection: any[]) => {
  // 更新地图显示选中的卫星数据
  updateMapWithSelectedSatelliteData(selection);
};

// 处理实测表格选中项变化
const handleMeasuredSelectionChange = async (selection: any[]) => {
  // 更新地图显示选中的实测数据
  await updateMapWithSelectedMeasuredData(selection);
};

// 清除非指定表格外的其他表格选中状态的函数
const clearOtherSelections = (tableType: 'uav' | 'satellite' | 'measured') => {
  if (tableType !== 'uav' && uavTableRef.value) {
    uavTableRef.value.clearSelection();
    selectedUavData.value = [];
  }

  if (tableType !== 'satellite' && satelliteTableRef.value) {
    satelliteTableRef.value.clearSelection();
    selectedSatelliteData.value = [];
  }

  if (tableType !== 'measured' && measuredTableRef.value) {
    measuredTableRef.value.clearSelection();
    selectedMeasuredData.value = [];
  }
};

// 处理无人机表格行点击事件（单选）
const handleUavRowClick = async (row: any) => {
  // 设置当前选中的表格为无人机数据表格
  currentSelectedTable.value = 'uav';
  // 清除其他表格的选中状态
  clearOtherSelections('uav');

  // 清除其他选中项，只保留当前点击的行
  if (uavTableRef.value) {
    // 清空所有选中项
    uavTableRef.value.clearSelection();
    // 选中当前行
    uavTableRef.value.toggleRowSelection(row);
  }

  // 更新地图显示选中的无人机数据
  await updateMapWithSelectedUavData([row]);
};

// 处理卫星表格行点击事件（单选）
const handleSatelliteRowClick = (row: any) => {
  // 设置当前选中的表格为卫星数据表格
  currentSelectedTable.value = 'satellite';
  // 清除其他表格的选中状态
  clearOtherSelections('satellite');

  // 清除其他选中项，只保留当前点击的行
  if (satelliteTableRef.value) {
    // 清空所有选中项
    satelliteTableRef.value.clearSelection();
    // 选中当前行
    satelliteTableRef.value.toggleRowSelection(row);
  }

  // 更新地图显示选中的卫星数据
  updateMapWithSelectedSatelliteData([row]);
};

// 处理实测表格行点击事件（单选）
const handleMeasuredRowClick = async (row: any) => {
  // 设置当前选中的表格为实测数据表格
  currentSelectedTable.value = 'measured';
  // 清除其他表格的选中状态
  clearOtherSelections('measured');

  // 清除其他选中项，只保留当前点击的行
  if (measuredTableRef.value) {
    // 清空所有选中项
    measuredTableRef.value.clearSelection();
    // 选中当前行
    measuredTableRef.value.toggleRowSelection(row);
  }

  // 更新地图显示选中的实测数据
  await updateMapWithSelectedMeasuredData([row]);
};

// 获取生育期标签
const getGrowthPeriodLabel = (value: string) => {
  // 添加安全检查，确保 growth_period.value 存在
  if (!growth_period || !growth_period.value) {
    console.warn('growth_period 字典数据未加载');
    return value;
  }

  const period = growth_period.value.find((item: any) => item.value === value);
  return period ? period.label : value;
};

// 获取生长诊断期间标签
const getGrowthDiagnosePeriodLabel = (value: string) => {
  // 添加安全检查，确保 growth_diagnose_period.value 存在
  if (!growth_diagnose_period || !growth_diagnose_period.value) {
    console.warn('growth_diagnose_period 字典数据未加载');
    return value;
  }

  const period = growth_diagnose_period.value.find((item: any) => item.value === value);
  return period ? period.label : value;
};

const getFourGrowthPeriodLabel = (value: string) => {
  const period = four_growth_period.value.find((item: any) => item.value === value);
  return period ? period.label : value;
};

// 地图加载完成回调
const onMapLoaded = (mapInstance: any) => {
  console.log('卫星地图加载完成', mapInstance);
  // 可以在这里执行一些地图初始化操作
};

// 地图要素点击回调
const onFeatureClick = (eventData: any) => {
  console.log('点击了地图要素:', eventData);
  // 可以在这里处理地图要素点击事件
};

// 监听统计数据变化，更新地图
watch(
  stats,
  (newStats) => {
    // 当统计数据变化时，可以更新地图显示内容
    updateMapData();
  },
  { deep: true }
);

// 更新地图数据 - 通用方法
const updateMapData = () => {
  // 这里可以根据统计数据生成地图图层数据
  // 示例：创建一个简单的 GeoJSON 数据
  const geoJsonData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: '地块A',
          lai: stats.value.avgLai,
          spad: stats.value.avgSpad,
          growthStatus: `良好:${stats.value.good},正常:${stats.value.normal},较差:${stats.value.poor}`
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [116.4, 39.9],
              [116.41, 39.9],
              [116.41, 39.91],
              [116.4, 39.91],
              [116.4, 39.9]
            ]
          ]
        }
      }
    ]
  };

  // 更新地图GeoData
  mapGeoData.value = [
    {
      id: 'satellite-layer',
      name: '卫星数据图层',
      type: 'polygon',
      data: geoJsonData,
      visible: true,
      zIndex: 10,
      emitEvent: true
    }
  ];
};
// 根据选中的无人机数据更新地图
const updateMapWithSelectedUavData = async (selectedRows: any[]) => {
  if (selectedRows.length === 0) {
    // 如果没有选中行，清空地图显示
    mockGrowthData.value = {};
    console.log('未选择任何行，清空地图');
    return;
  }

  try {
    // 收集所有选中行的生育期
    const growthPeriods = selectedRows.map((row) => getGrowthDiagnosePeriodValue(row.growthPeriod)); // 使用正确的函数

    // 获取所有选中行对应的数据
    const allGrowthData: Record<string, string> = {};

    for (const period of growthPeriods) {
      const res: any = await listDiagnosis({
        pageSize: 1000,
        pageNum: 1,
        growthPeriod: period
      });

      if (res.rows && res.rows.length > 0) {
        res.rows.forEach((item: any) => {
          // 使用plotId作为地块ID，growthLevel作为长势等级
          if (item.plotId && item.growthLevel) {
            allGrowthData[item.plotId] = item.growthLevel;
          }
        });
      }
    }

    // 更新地图组件的growthData属性
    mockGrowthData.value = allGrowthData;
    console.log('更新地图长势数据:', allGrowthData);
  } catch (error) {
    console.error('获取诊断数据失败:', error);

    // 出错时使用默认的模拟数据
    const growthData = {
      '1943553602039209985': '良好',
      '1943553591196934145': '正常',
      '1943553593625436161': '较差'
    };

    mockGrowthData.value = growthData;
    console.log('使用默认地图长势数据:', growthData);
  }
};

// 根据选中的卫星数据更新地图
const updateMapWithSelectedSatelliteData = (selectedRows: any[]) => {
  if (selectedRows.length === 0) {
    // 如果没有选中行，清空地图显示
    mockGrowthData.value = {};
    console.log('未选择任何卫星数据行，清空地图');
    return;
  }

  // 使用已获取的卫星数据
  const allGrowthData: Record<string, string> = {};

  // 为每个选中的行获取对应的卫星数据
  selectedRows.forEach((row) => {
    let rawData: any[] = [];

    // 根据生育期确定使用哪部分数据
    switch (row.growthPeriod) {
      case '拔节期':
        rawData = rawSatelliteData.value.jointing;
        break;
      case '抽穗期':
        rawData = rawSatelliteData.value.heading;
        break;
      case '灌浆期':
        rawData = rawSatelliteData.value.filling;
        break;
      default:
        return;
    }

    // 处理数据，将plotId和growthLevel映射到allGrowthData
    rawData.forEach((item: any) => {
      if (item.plotId && item.growthLevel) {
        allGrowthData[item.plotId] = item.growthLevel;
      }
    });
  });

  // 更新地图组件的growthData属性
  mockGrowthData.value = allGrowthData;
  console.log('更新卫星数据地图长势数据:', allGrowthData);
};

// 根据选中的实测数据更新地图
const updateMapWithSelectedMeasuredData = async (selectedRows: any[]) => {
  if (selectedRows.length === 0) {
    // 如果没有选中行，清空地图显示
    mockGrowthData.value = {};
    console.log('未选择任何实测数据行，清空地图');
    return;
  }

  try {
    // 获取所有选中行对应的生育期值
    const periods = selectedRows.map((row) => getFourGrowthPeriodValue(row.growthPeriod));

    // 处理实测数据，生成地块ID到长势等级的映射
    const allGrowthData: Record<string, string> = {};

    // 获取当前基地的前缀
    // 根据基地名称生成前缀，例如"姜兴庄"->"姜兴庄"
    let basePrefix = 'hjg'; // 默认使用侯家沟前缀
    if (currentBaseName.value) {
      // 移除"基地"后缀并用作前缀
      basePrefix = currentBaseName.value
        .replace('基地', '')
        .replace('智慧引领种植', '')
        .replace('侯家沟数字化种植', '侯家沟n')
        .replace('侯家沟', '侯家沟')
        .replace('数字化种植', '')
        .replace('后台管理', '侯家沟')
        .replace('岳家岔', '岳岔');
    }

    // 获取所有选中行对应的数据
    for (const period of periods) {
      const res: any = await listStatistics({
        pageSize: 1000,
        pageNum: 1,
        period: period
      });

      if (res.rows && res.rows.length > 0) {
        // 按地块ID分组数据
        const plotDataMap = new Map();

        res.rows.forEach((item: any) => {
          // 根据基地前缀和地块编号生成地块ID，例如 姜兴庄001
          const plotLabel = `${basePrefix}${String(item.baseId).padStart(3, '0')}`;
          // 通过字典查找真实的地块ID
          const realPlotId = plotLabel;

          if (!plotDataMap.has(realPlotId)) {
            plotDataMap.set(realPlotId, []);
          }
          plotDataMap.get(realPlotId).push(item);
        });

        // 为每个地块计算平均长势等级
        plotDataMap.forEach((items, plotId) => {
          // 计算平均SPAD值
          const totalSpad = items.reduce((sum: number, item: any) => sum + item.realSpad, 0);
          const avgSpad = totalSpad / items.length;

          // 根据SPAD值确定长势等级
          let growthLevel = '正常';
          if (avgSpad > 45) {
            growthLevel = '良好';
          } else if (avgSpad < 35) {
            growthLevel = '较差';
          }

          allGrowthData[plotId] = growthLevel;
        });
      }
    }

    // 更新地图组件的growthData属性
    mockGrowthData.value = allGrowthData;
    console.log('更新实测数据地图长势数据:', allGrowthData);
  } catch (error) {
    console.error('获取实测数据失败:', error);

    // 出错时使用默认的模拟数据
    // 根据当前基地名称生成前缀
    let basePrefix = 'hjg'; // 默认使用侯家沟前缀
    if (currentBaseName.value) {
      basePrefix = currentBaseName.value.replace('基地', '');
    }

    const growthData = {
      [`${basePrefix}001`]: '良好',
      [`${basePrefix}002`]: '正常',
      [`${basePrefix}003`]: '较差'
    };

    mockGrowthData.value = growthData;
    console.log('使用默认地图长势数据:', growthData);
  }
};

// 获取无人机数据
const fetchUavData = async () => {
  try {
    loading.value = true;
    const res: any = await listDiagnosis({
      pageSize: 100,
      pageNum: 1
    });
    console.log('获取到的无人机数据:', res);

    // 按生育期分组并合并数据
    const groupedData: any = {};

    res.rows.forEach((item: any) => {
      const period = item.growthPeriod;
      const periodLabel = getGrowthDiagnosePeriodLabel(period); // 使用字典转换生育期

      if (!groupedData[periodLabel]) {
        groupedData[periodLabel] = {
          growthPeriod: periodLabel,
          lai: 0,
          spad: 0,
          dataCount: 0,
          good: 0,
          normal: 0,
          poor: 0,
          dates: []
        };
      }

      // 累加数值
      groupedData[periodLabel].lai += item.laiPrediction || 0;
      groupedData[periodLabel].spad += item.spadPrediction || 0;
      groupedData[periodLabel].dataCount += 1;

      // 处理长势分布
      if (item.growthLevel === '良好') {
        groupedData[periodLabel].good += 1;
      } else if (item.growthLevel === '正常') {
        groupedData[periodLabel].normal += 1;
      } else if (item.growthLevel === '较差') {
        groupedData[periodLabel].poor += 1;
      }

      // 收集日期
      if (item.diagnosisTime) {
        const dateStr = item.diagnosisTime.substring(5, 10); // 提取月日
        // 将日期格式从 - 改为 /
        const formattedDate = dateStr.replace('-', '/');
        groupedData[periodLabel].dates.push(formattedDate);
      }
    });

    // 转换为表格数据
    uavData.value = Object.values(groupedData).map((item: any) => {
      // 计算平均值
      const avgLai = item.dataCount > 0 ? item.lai / item.dataCount : 0;
      const avgSpad = item.dataCount > 0 ? item.spad / item.dataCount : 0;

      // 处理日期范围
      let dateRange = '';
      if (item.dates.length > 0) {
        // 排序日期
        item.dates.sort(compareDates);
        const minDate = item.dates[0];
        const maxDate = item.dates[item.dates.length - 1];

        if (minDate === maxDate) {
          dateRange = minDate;
        } else {
          dateRange = `${minDate}-${maxDate}`;
        }
      }

      return {
        growthPeriod: item.growthPeriod,
        lai: Number(avgLai).toFixed(1),
        spad: Number(avgSpad).toFixed(1),
        dataCount: item.dataCount,
        growthStatus: `${item.good}:${item.normal}:${item.poor}`,
        dateRange: dateRange
      };
    });
  } catch (err) {
    console.error('获取无人机数据失败:', err);
    error.value = '获取无人机数据失败';
  } finally {
    loading.value = false;
  }
};

// 获取实测数据
const fetchMeasuredData = async () => {
  try {
    loading.value = true;
    const res: any = await listStatistics({
      pageSize: 1000,
      pageNum: 1
    });

    console.log('获取到的实测数据:', res);

    // 按生育期分组并合并数据
    const groupedData: any = {};

    res.rows.forEach((item: any) => {
      const period = item.period;
      const periodLabel = getFourGrowthPeriodLabel(period); // 使用字典转换生育期

      if (!groupedData[periodLabel]) {
        groupedData[periodLabel] = {
          growthPeriod: periodLabel,
          lai: 0,
          spad: 0,
          dataCount: 0,
          good: 0,
          normal: 0,
          poor: 0,
          dates: []
        };
      }

      // 累加数值
      groupedData[periodLabel].lai += item.realLai || 0;
      groupedData[periodLabel].spad += item.realSpad || 0;
      groupedData[periodLabel].dataCount += 1;

      // 先判断remark，好中差分别对应良好、正常、较差，没有备注在继续判断
      if (item.remark && typeof item.remark === 'string') {
        if (item.remark.includes('好')) {
          groupedData[periodLabel].good += 1;
        } else if (item.remark.includes('中')) {
          groupedData[periodLabel].normal += 1;
        } else if (item.remark.includes('差')) {
          groupedData[periodLabel].poor += 1;
        } else {
          // 如果remark不包含好中差，则根据SPAD值估算长势分布（SPAD > 45 为良好，35-45 为正常，< 35 为较差）
          if (item.realSpad > 45) {
            groupedData[periodLabel].good += 1;
          } else if (item.realSpad >= 35) {
            groupedData[periodLabel].normal += 1;
          } else {
            groupedData[periodLabel].poor += 1;
          }
        }
      } else {
        // 没有remark，根据SPAD值估算长势分布（SPAD > 45 为良好，35-45 为正常，< 35 为较差）
        if (item.realSpad > 45) {
          groupedData[periodLabel].good += 1;
        } else if (item.realSpad >= 35) {
          groupedData[periodLabel].normal += 1;
        } else {
          groupedData[periodLabel].poor += 1;
        }
      }

      // 收集日期
      if (item.time) {
        const dateStr = item.time.substring(5, 10); // 提取月日
        // 将日期格式从 - 改为 /
        const formattedDate = dateStr.replace('-', '/');
        groupedData[periodLabel].dates.push(formattedDate);
      }
    });

    // 转换为表格数据
    measuredData.value = Object.values(groupedData).map((item: any) => {
      // 计算平均值
      const avgLai = item.dataCount > 0 ? item.lai / item.dataCount : 0;
      const avgSpad = item.dataCount > 0 ? item.spad / item.dataCount : 0;

      // 处理日期范围
      let dateRange = '';
      if (item.dates.length > 0) {
        // 排序日期
        item.dates.sort(compareDates);
        const minDate = item.dates[0];
        const maxDate = item.dates[item.dates.length - 1];

        if (minDate === maxDate) {
          dateRange = minDate;
        } else {
          dateRange = `${minDate}-${maxDate}`;
        }
      }

      return {
        growthPeriod: item.growthPeriod,
        lai: Number(avgLai).toFixed(1),
        spad: Number(avgSpad).toFixed(1),
        dataCount: item.dataCount,
        growthStatus: `${item.good}:${item.normal}:${item.poor}`,
        dateRange: dateRange
      };
    });
  } catch (err) {
    console.error('获取实测数据失败:', err);
    error.value = '获取实测数据失败';
  } finally {
    loading.value = false;
  }
};

// 获取卫星数据
const fetchSatelliteData = async () => {
  try {
    loading.value = true;

    // 直接从API获取最新的卫星数据
    const response = await listSatellite({
      pageNum: 1,
      pageSize: 1000 // 获取足够多的数据
    });

    console.log('satellite data response:', response);

    const satelliteList = response.rows || response.data || [];
    console.log('satellite data:', satelliteList);

    // 按生育期分组数据，并选取每个时期最新的数据
    const groupedData: any = {
      jointing: null, // 拔节期
      heading: null, // 抽穗期
      filling: null // 灌浆期
    };

    // 存储各生育期最新的诊断时间
    const latestDiagnosisTimes: any = {
      jointing: '',
      heading: '',
      filling: ''
    };

    satelliteList.forEach((item: any) => {
      // 根据period字段分组数据并选择最新的
      switch (item.period) {
        case 'p2': // 拔节期
          if (!groupedData.jointing || new Date(item.createTime) > new Date(groupedData.jointing.createTime)) {
            groupedData.jointing = item;
            // 保存拔节期的诊断时间
            if (item.diagnosisTime) {
              const dateStr = item.diagnosisTime.substring(5, 10); // 提取月日
              latestDiagnosisTimes.jointing = dateStr.replace('-', '/');
            }
            console.log('groupedData.jointing', groupedData.jointing);
          }
          break;
        case 'p3': // 抽穗期
          if (!groupedData.heading || new Date(item.createTime) > new Date(groupedData.heading.createTime)) {
            groupedData.heading = item;
            // 保存抽穗期的诊断时间
            if (item.diagnosisTime) {
              const dateStr = item.diagnosisTime.substring(5, 10); // 提取月日
              latestDiagnosisTimes.heading = dateStr.replace('-', '/');
            }
          }
          break;
        case 'p4': // 灌浆期
          if (!groupedData.filling || new Date(item.createTime) > new Date(groupedData.filling.createTime)) {
            groupedData.filling = item;
            // 保存灌浆期的诊断时间
            if (item.diagnosisTime) {
              const dateStr = item.diagnosisTime.substring(5, 10); // 提取月日
              latestDiagnosisTimes.filling = dateStr.replace('-', '/');
            }
          }
          break;
      }
    });

    // 为每个时期获取详细的JSON数据
    const detailedSatelliteData: any = {
      jointing: [],
      heading: [],
      filling: []
    };

    // 获取拔节期详细数据
    if (groupedData.jointing && groupedData.jointing.predictResultJsonUrl) {
      try {
        const jsonResponse = await fetch(groupedData.jointing.predictResultJsonUrl);
        console.log('获取拔节期详细数据成功');
        if (jsonResponse.ok) {
          detailedSatelliteData.jointing = await jsonResponse.json();
        }
      } catch (error) {
        console.error('获取拔节期详细数据失败:', error);
      }
    }

    // 获取抽穗期详细数据
    if (groupedData.heading && groupedData.heading.predictResultJsonUrl) {
      try {
        const jsonResponse = await fetch(groupedData.heading.predictResultJsonUrl);
        if (jsonResponse.ok) {
          detailedSatelliteData.heading = await jsonResponse.json();
        }
      } catch (error) {
        console.error('获取抽穗期详细数据失败:', error);
      }
    }

    // 获取灌浆期详细数据
    if (groupedData.filling && groupedData.filling.predictResultJsonUrl) {
      try {
        const jsonResponse = await fetch(groupedData.filling.predictResultJsonUrl);
        if (jsonResponse.ok) {
          detailedSatelliteData.filling = await jsonResponse.json();
        }
      } catch (error) {
        console.error('获取灌浆期详细数据失败:', error);
      }
    }

    // 根据基地ID过滤数据
    const filterDataByBaseId = (data: any[]) => {
      if (!currentBaseId.value) return data;
      // 过滤出属于当前基地的数据
      console.log('当前基地ID:', currentBaseId.value);
      return data.filter((item) => item.baseId == currentBaseId.value);
    };

    // 保存原始数据（已过滤）
    const filteredSatelliteData = {
      jointing: filterDataByBaseId(detailedSatelliteData.jointing),
      heading: filterDataByBaseId(detailedSatelliteData.heading),
      filling: filterDataByBaseId(detailedSatelliteData.filling)
    };

    rawSatelliteData.value = filteredSatelliteData;

    // 处理拔节期数据
    let totalLaiJointing = 0;
    let totalSpadJointing = 0;
    let goodJointing = 0;
    let normalJointing = 0;
    let poorJointing = 0;
    let countJointing = 0;

    if (Array.isArray(filteredSatelliteData.jointing)) {
      countJointing = filteredSatelliteData.jointing.length;
      filteredSatelliteData.jointing.forEach((item: any) => {
        totalLaiJointing += parseFloat(item.laiValue) || 0;
        totalSpadJointing += parseFloat(item.spadValue) || 0;

        if (item.growthLevel === '良好') {
          goodJointing++;
        } else if (item.growthLevel === '正常') {
          normalJointing++;
        } else if (item.growthLevel === '较差') {
          poorJointing++;
        }
      });
    }

    // 处理抽穗期数据
    let totalLaiHeading = 0;
    let totalSpadHeading = 0;
    let goodHeading = 0;
    let normalHeading = 0;
    let poorHeading = 0;
    let countHeading = 0;

    if (Array.isArray(filteredSatelliteData.heading)) {
      countHeading = filteredSatelliteData.heading.length;
      filteredSatelliteData.heading.forEach((item: any) => {
        totalLaiHeading += parseFloat(item.laiValue) || 0;
        totalSpadHeading += parseFloat(item.spadValue) || 0;

        if (item.growthLevel === '良好') {
          goodHeading++;
        } else if (item.growthLevel === '正常') {
          normalHeading++;
        } else if (item.growthLevel === '较差') {
          poorHeading++;
        }
      });
    }

    // 处理灌浆期数据
    let totalLaiFilling = 0;
    let totalSpadFilling = 0;
    let goodFilling = 0;
    let normalFilling = 0;
    let poorFilling = 0;
    let countFilling = 0;

    if (Array.isArray(filteredSatelliteData.filling)) {
      countFilling = filteredSatelliteData.filling.length;
      filteredSatelliteData.filling.forEach((item: any) => {
        totalLaiFilling += parseFloat(item.laiValue) || 0;
        totalSpadFilling += parseFloat(item.spadValue) || 0;

        if (item.growthLevel === '良好') {
          goodFilling++;
        } else if (item.growthLevel === '正常') {
          normalFilling++;
        } else if (item.growthLevel === '较差') {
          poorFilling++;
        }
      });
    }

    // 从实际数据中获取LAI和SPAD值（如果有数据的话）
    // 如果没有数据则使用默认值
    const getAvgLai = (total: number, count: number) => {
      if (count > 0) {
        return (total / count).toFixed(1);
      }
      // 默认值
      return '0';
    };

    const getAvgSpad = (total: number, count: number) => {
      if (count > 0) {
        return (total / count).toFixed(1);
      }
      // 默认值
      return '0';
    };

    // 创建拔节期数据对象
    const jointingPeriodData = {
      dataCount: countJointing,
      date: latestDiagnosisTimes.jointing || '05/12', // 使用保存的诊断时间
      dateRange: latestDiagnosisTimes.jointing || '05/12', // 添加dateRange字段
      lai: parseFloat(getAvgLai(totalLaiJointing, countJointing)),
      spad: parseFloat(getAvgSpad(totalSpadJointing, countJointing)),
      growthStatus: `${goodJointing}:${normalJointing}:${poorJointing}`,
      growthPeriod: '拔节期'
    };

    // 创建抽穗期数据对象
    const headingPeriodData = {
      dataCount: countHeading,
      date: latestDiagnosisTimes.heading || '05/12', // 使用保存的诊断时间
      dateRange: latestDiagnosisTimes.heading || '05/12', // 添加dateRange字段
      lai: parseFloat(getAvgLai(totalLaiHeading, countHeading)),
      spad: parseFloat(getAvgSpad(totalSpadHeading, countHeading)),
      growthStatus: `${goodHeading}:${normalHeading}:${poorHeading}`,
      growthPeriod: '抽穗期'
    };

    // 创建灌浆期数据对象
    const fillingPeriodData = {
      dataCount: countFilling,
      date: latestDiagnosisTimes.filling || '05/12', // 使用保存的诊断时间
      dateRange: latestDiagnosisTimes.filling || '05/12', // 添加dateRange字段
      lai: parseFloat(getAvgLai(totalLaiFilling, countFilling)),
      spad: parseFloat(getAvgSpad(totalSpadFilling, countFilling)),
      growthStatus: `${goodFilling}:${normalFilling}:${poorFilling}`,
      growthPeriod: '灌浆期'
    };

    // 将新数据添加到卫星数据
    satelliteData.value = [jointingPeriodData, headingPeriodData, fillingPeriodData];
  } catch (err) {
    console.error('获取卫星数据失败:', err);
    error.value = '获取卫星数据失败';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // 获取基地相关信息
  await getDicts();

  // 获取无人机数据
  fetchUavData();
  // 获取卫星数据
  fetchSatelliteData();
  // 获取实测数据
  fetchMeasuredData();

  // 初始化地图数据
  updateMapData();

  // 确保地图组件加载完成后定位到相应基地
  nextTick(() => {
    if (satelliteMapRef.value && typeof satelliteMapRef.value.mapRef?.locate === 'function') {
      // 延迟执行以确保地图完全初始化
      setTimeout(() => {
        // 根据当前选定的基地进行定位
        const baseName = selectedBase.value;
        satelliteMapRef.value.mapRef.locate(baseName);
      }, 300);
    }
  });
});

function initMap() {
  loading.value = true;
  // 地图现在由 SatelliteMap 组件自动初始化
  setTimeout(() => {
    loading.value = false;
  }, 1000);
}

// 添加日期比较函数
function compareDates(date1: string, date2: string): number {
  // 将 MM/dd 格式转换为可比较的形式
  const [month1, day1] = date1.split('/').map(Number);
  const [month2, day2] = date2.split('/').map(Number);

  if (month1 !== month2) {
    return month1 - month2;
  }
  return day1 - day2;
}

// 根据生育期标签获取生育期值
const getGrowthPeriodValue = (label: string) => {
  // 添加安全检查，确保 growth_period.value 存在
  if (!growth_period || !growth_period.value) {
    console.warn('growth_period 字典数据未加载');
    return '';
  }

  const period = growth_period.value.find((item: any) => item.label === label);
  return period ? period.value : '';
};

// 根据生长诊断期间标签获取值
const getGrowthDiagnosePeriodValue = (label: string) => {
  // 添加安全检查，确保 growth_diagnose_period.value 存在
  if (!growth_diagnose_period || !growth_diagnose_period.value) {
    console.warn('growth_diagnose_period 字典数据未加载');
    return '';
  }

  const period = growth_diagnose_period.value.find((item: any) => item.label === label);
  return period ? period.value : '';
};

// 根据四期生育期标签获取生育期值
const getFourGrowthPeriodValue = (label: string) => {
  // 添加安全检查，确保 four_growth_period.value 存在
  if (!four_growth_period || !four_growth_period.value) {
    console.warn('four_growth_period 字典数据未加载');
    return '';
  }

  const period = four_growth_period.value.find((item: any) => item.label === label);
  return period ? period.value : '';
};
</script>

<style scoped lang="scss">
.satellite-data-container {
  display: flex;
  height: calc(100vh - 84px);
  padding: 10px;
  box-sizing: border-box;

  .left-panel {
    width: 40%;
    height: 100%;
    padding-right: 10px;
    box-sizing: border-box;

    .data-cards {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 15px;

      .data-card {
        flex: 1;

        :deep(.el-card__header) {
          font-weight: bold;
          padding: 10px 15px;
        }

        :deep(.el-card__body) {
          padding: 8px;
          height: calc(100% - 40px);
        }

        :deep(.el-table__row) {
          cursor: pointer;

          &:hover {
            background-color: #f5f7fa;
          }
        }

        /* 减少表格单元格内边距以降低每行高度 */
        :deep(.el-table__cell) {
          padding: 5px;
        }
      }

      /* 调整实测数据卡片高度，使其能容纳更多行 */
      .data-card:last-child {
        flex: 1.3; /* 增加实测数据卡片的高度比例 */
      }
    }
  }

  .right-panel {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 10px;

      .stat-card {
        min-width: 120px;
        padding: 1px;

        .stat-content {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .stat-title {
            font-size: 12px;
            color: #666;
          }

          .stat-value {
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }
        }
      }

      .stat-card-wide {
        grid-column: span 2;
      }
    }

    .map-container {
      flex: 1;
      border: 1px solid #ccc;
      border-radius: 4px;
      position: relative;

      // 地图容器需要占满整个空间
      :deep(.satellite-map-container) {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
