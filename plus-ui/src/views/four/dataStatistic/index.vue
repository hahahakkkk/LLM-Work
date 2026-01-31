<template>
  <div class="stat-container">
    <!-- 搜索筛选区 -->
    <div class="search-form">
      <el-form :inline="true" :model="searchForm" class="form-inline">
        <!-- 基地名称下拉框 -->
        <el-form-item label="基地名称" class="form-item" v-has-roles="['superadmin', 'sysadmin', 'govadmin']">
          <el-select v-model="searchForm.baseName" placeholder="请选择基地" clearable style="width: 130px">
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>

        <!-- 统计维度下拉框 -->
        <el-form-item label="统计周期" class="form-item">
          <el-select v-model="searchForm.statDimension" placeholder="请选择统计周期" style="width: 90px" @change="handleDimensionChange">
            <el-option label="年度" value="year"></el-option>
            <el-option label="月度" value="month"></el-option>
            <el-option label="生育期" value="growthPeriod"></el-option>
          </el-select>
        </el-form-item>

        <!-- 动态时间选择框 -->
        <el-form-item v-if="searchForm.statDimension === 'year'" label="年份" class="form-item dynamic-label-item">
          <el-date-picker
            v-model="searchForm.dateValue"
            type="year"
            placeholder="选择年份"
            format="YYYY"
            value-format="YYYY"
            style="width: 120px"
          ></el-date-picker>
        </el-form-item>

        <el-form-item v-if="searchForm.statDimension === 'month'" label="月份" class="form-item dynamic-label-item">
          <el-date-picker
            v-model="searchForm.dateValue"
            type="month"
            placeholder="选择年月"
            format="YYYY-MM"
            value-format="YYYY-MM"
            style="width: 120px"
          ></el-date-picker>
        </el-form-item>

        <el-form-item v-if="searchForm.statDimension === 'growthPeriod'" label="生育期" class="form-item dynamic-label-item">
          <!-- 自定义生育期选择组件 -->
          <growthPeriodPicker v-model="searchForm.dateValue" :growth-period-dict="four_growth_period" />
        </el-form-item>

        <!-- 查询按钮 -->
        <el-form-item class="form-item">
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>

        <!-- 导出按钮 -->
        <el-form-item class="form-item">
          <el-button type="success" @click="exportToPdf">导出</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <!-- 气象监测数据表格 -->
      <div class="table-section">
        <h3 class="table-title">表1 气象监测数据</h3>
        <el-table
          :data="weatherTableData"
          border
          stripe
          size="small"
          :header-cell-style="{ textAlign: 'center' }"
          :cell-style="{ textAlign: 'center', padding: '8px 0', fontSize: '12px' }"
        >
          <el-table-column label="统计项" prop="statItem" width="90" fixed="left"></el-table-column>
          <el-table-column label="空气湿度（%）" prop="airHumidity" width="110"></el-table-column>
          <el-table-column label="空气温度（℃）" prop="airTemperature" width="110"></el-table-column>
          <el-table-column label="光照强度（lux）" prop="lightIntensity" width="110"></el-table-column>
          <el-table-column label="风速（m/s）" prop="windSpeed" width="110"></el-table-column>
          <el-table-column label="降雨量（mm）" prop="rainfall" width="110"></el-table-column>
        </el-table>
      </div>

      <!-- 墒情监测数据表格 -->
      <div class="table-section">
        <h3 class="table-title">表2 墒情监测数据</h3>
        <el-table
          :data="soilTableData"
          border
          stripe
          size="small"
          :header-cell-style="{ textAlign: 'center', fontWeight: 'bold' }"
          :cell-style="{ textAlign: 'center', padding: '8px 0', fontSize: '12px' }"
        >
          <el-table-column label="统计项" prop="statItem" width="90" fixed="left"></el-table-column>
          <el-table-column label="土壤湿度（%）" prop="shallowWater" width="135"></el-table-column>
          <el-table-column label="土壤温度（℃）" prop="shallowTemperature" width="135"></el-table-column>
          <el-table-column label="土壤电导率（uS/cm）" prop="soilDdl" width="140"></el-table-column>
          <el-table-column label="土壤盐分（ppm）" prop="soilYf" width="140"></el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 新增：图表区域 -->
    <div class="chart-container">
      <!-- 降雨量柱状图 -->
      <div class="chart-section">
        <h3 class="chart-title">降雨量</h3>
        <div ref="rainfallChart" class="chart"></div>
      </div>

      <!-- 活动积温仪表盘 -->
      <div class="chart-section">
        <h3 class="chart-title">活动积温</h3>
        <div ref="temperatureGauge" class="chart"></div>
      </div>
    </div>

    <!-- 新增：隐藏导出容器 -->
    <!-- 修复：简化导出容器，避免复杂的DOM操作 -->
    <div
      ref="exportContainer"
      class="export-container"
      style="position: fixed; top: -10000px; left: -10000px; width: 210mm; background: white; padding: 20mm; box-sizing: border-box"
    >
      <div id="pdf-content">
        <h2 style="text-align: center; margin-bottom: 40px; font-size: 18px; font-weight: bold">
          {{ pdfTitle }}
        </h2>

        <!-- 表格区域 -->
        <div style="margin-bottom: 15px">
          <h3 style="text-align: center; margin-bottom: 20px; font-size: 16px">表1 气象监测数据</h3>
          <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px">
            <thead>
              <tr style="background-color: #f5f5f5">
                <th style="width: 90px">统计项</th>
                <th style="width: 110px">空气湿度（%）</th>
                <th style="width: 110px">空气温度（℃）</th>
                <th style="width: 110px">光照强度（lux）</th>
                <th style="width: 110px">风速（m/s）</th>
                <th style="width: 110px">降雨量（mm）</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in weatherTableData" :key="index">
                <td style="text-align: center">{{ row['statItem'] }}</td>
                <td style="text-align: center">{{ row['airHumidity'] }}</td>
                <td style="text-align: center">{{ row['airTemperature'] }}</td>
                <td style="text-align: center">{{ row['lightIntensity'] }}</td>
                <td style="text-align: center">{{ row['windSpeed'] }}</td>
                <td style="text-align: center">{{ row['rainfall'] }}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="text-align: center; margin-bottom: 20px; font-size: 16px">表2 墒情监测数据</h3>
          <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px">
            <thead>
              <tr style="background-color: #f5f5f5">
                <th style="width: 90px">统计项</th>
                <th style="width: 135px">土壤湿度（%）</th>
                <th style="width: 135px">土壤温度（℃）</th>
                <th style="width: 140px">土壤电导率（uS/cm）</th>
                <th style="width: 140px">土壤盐分（ppm）</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in soilTableData" :key="index">
                <td style="text-align: center">{{ row['statItem'] }}</td>
                <td style="text-align: center">{{ row['shallowWater'] }}</td>
                <td style="text-align: center">{{ row['shallowTemperature'] }}</td>
                <td style="text-align: center">{{ row['soilDdl'] }}</td>
                <td style="text-align: center">{{ row['soilYf'] }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 修改：图表区域 - 左右排列 -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 15px">
          <!-- 降雨量图表 -->
          <div style="flex: 1; text-align: center">
            <h3 style="margin: 20px 0 20px 0; font-size: 16px">降雨量</h3>
            <img
              :src="rainfallChartImage"
              alt="降雨量图表"
              style="max-width: 100%; height: auto; display: block; margin: 20px auto 20px; padding: 10px; border: 1px solid #ddd"
            />
          </div>

          <!-- 活动积温图表 -->
          <div style="flex: 1; text-align: center">
            <h3 style="margin: 20px 0 20px 0; font-size: 16px">活动积温</h3>
            <img
              :src="temperatureGaugeImage"
              alt="活动积温图表"
              style="max-width: 100%; height: auto; display: block; margin: 20px auto 20px; padding: 10px; border: 1px solid #ddd"
            />
          </div>
        </div>

        <div style="text-align: right; margin-top: 30px; color: #666; font-size: 12px">生成时间：{{ new Date().toLocaleString() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup name="DataStatistic" lang="ts">
import { reactive, ref, onMounted, getCurrentInstance, ComponentInternalInstance, toRefs } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';
import growthPeriodPicker from '../components/growthPeriodPicker/index.vue';
// 导入html2pdf库
import html2pdf from 'html2pdf.js';
// 导入echarts
import * as echarts from 'echarts';
import { StatSoilData, StatWeatherData } from '@/views/four/api/statisticAnalysis/types';
import { queryStatData } from '@/views/four/api/statisticAnalysis';

import useUserStore from '@/store/modules/user';
const userStore = useUserStore();

// 鉴权使用
const targetRoles = ['sysadmin', 'govadmin', 'superadmin', 'allBase'];
// 所有角色都不在目标角色列表中 → 都不包含
const hasNoneTargetRole = userStore.roles.every((role) => !targetRoles.includes(role));

// 获取当前用户部门id对应基地id
const getCurrentBaseId = () => {
  return four_deptid_baseid.value.find((item) => item.label === String(userStore.deptId))?.value;
};

// 获取字典表
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_growth_period, four_base_name, four_deptid_baseid } = toRefs<any>(
  proxy?.useDict('four_growth_period', 'four_base_name', 'four_deptid_baseid')
);

// 图表DOM引用
const rainfallChart = ref<HTMLDivElement | null>(null);
const temperatureGauge = ref<HTMLDivElement | null>(null);

// 图表实例
let rainfallChartInstance: echarts.ECharts | null = null;
let temperatureGaugeInstance: echarts.ECharts | null = null;

// 新增：ResizeObserver 实例
let rainfallChartResizeObserver: ResizeObserver | null = null;
let temperatureGaugeResizeObserver: ResizeObserver | null = null;

// 响应式数据
const weatherTableData = ref<StatWeatherData[]>([]); // 气象监测表格数据
const soilTableData = ref<StatSoilData[]>([]); // 墒情监测表格数据
const currentBaseRainfall = ref<number>(0); // 下面三个为图表数据
const allBaseRainfall = ref<number>(0);
const activeTemperatureSum = ref<number>(0);

// 搜索表单数据
const searchForm = reactive({
  baseName: four_base_name.value[0]?.value || '1',
  statDimension: 'year',
  dateValue: new Date().getFullYear().toString()
});

// 统计维度变化处理
const handleDimensionChange = () => {
  searchForm.dateValue = '';
  if (searchForm.statDimension === 'year') {
    searchForm.dateValue = new Date().getFullYear().toString();
  }
};

// 查询按钮处理
const handleQuery = async () => {
  console.log('查询参数：', searchForm);
  if (!searchForm.baseName) {
    ElMessage.warning('请选择基地名称');
    return;
  }
  if (!searchForm.statDimension) {
    ElMessage.warning('请选择统计维度');
    return;
  }
  if (!searchForm.dateValue) {
    const tip = searchForm.statDimension === 'year' ? '年份' : searchForm.statDimension === 'month' ? '月份' : '生育期';
    ElMessage.warning(`请选择${tip}`);
    return;
  }

  try {
    const loadingInstance = ElLoading.service({
      text: '正在加载数据...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    if (hasNoneTargetRole) {
      searchForm.baseName = getCurrentBaseId();
    }

    const res = await queryStatData({
      baseName: searchForm.baseName,
      statDimension: searchForm.statDimension,
      dateValue: searchForm.dateValue
    });

    // 更新表格数据
    weatherTableData.value = res.data.weatherTableData;
    soilTableData.value = res.data.soilTableData;

    // 更新图表数据
    currentBaseRainfall.value = res.data.currentBaseRainfall;
    allBaseRainfall.value = res.data.allBaseRainfall;
    activeTemperatureSum.value = res.data.activeTemperatureSum;

    // 查询后更新图表数据
    updateCharts();

    ElMessage.success('数据加载成功');
  } catch (error) {
    ElMessage.error('数据加载失败，请重试');
    console.error('查询失败:', error);
  } finally {
    ElLoading.service().close();
  }
};

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    // 初始化降雨量柱状图
    if (rainfallChart.value) {
      // 销毁旧实例
      if (rainfallChartInstance) {
        rainfallChartInstance.dispose();
      }
      rainfallChartInstance = echarts.init(rainfallChart.value);

      const baseName = four_base_name.value.find((item: any) => item.value === searchForm.baseName)?.label || '未知基地';

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}: {c} mm',
          textStyle: {
            fontSize: 12 // 修改：工具提示字体大小
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '5%', // 从 3% 改为 15%（增加底部间距，避免标签超出边框）
          top: '15%', // 修改：增加顶部间距，让图表与标题更近
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: [baseName, '全部基地'],
          axisLabel: {
            fontSize: 12 // 修改：X轴标签字体大小
          }
        },
        yAxis: {
          type: 'value',
          name: 'mm',
          nameTextStyle: {
            padding: [0, 0, 0, -20],
            fontSize: 12 // 修改：Y轴名称字体大小
          },
          axisLabel: {
            fontSize: 12 // 修改：Y轴标签字体大小
          }
        },
        series: [
          {
            name: '降雨量',
            type: 'bar',
            barWidth: '13%', // 从20%改为13%，缩小直方图宽度
            data: [
              {
                value: Math.floor(Math.random() * 30 + 1),
                itemStyle: {
                  color: '#5470c6'
                }
              },
              {
                value: Math.floor(Math.random() * 30 + 30),
                itemStyle: {
                  color: '#91cc75'
                }
              }
            ],
            label: {
              show: true,
              position: 'top',
              formatter: '{c} mm',
              fontSize: 12 // 修改：柱状图标签字体大小
            }
          }
        ]
      };

      rainfallChartInstance.setOption(option);

      // 新增：使用 ResizeObserver 监听容器大小变化
      rainfallChartResizeObserver = new ResizeObserver(() => {
        rainfallChartInstance?.resize();
      });
      rainfallChartResizeObserver.observe(rainfallChart.value);
    }

    // 初始化活动积温仪表盘
    if (temperatureGauge.value) {
      // 销毁旧实例
      if (temperatureGaugeInstance) {
        temperatureGaugeInstance.dispose();
      }
      temperatureGaugeInstance = echarts.init(temperatureGauge.value);

      const random = +(Math.random() * 4000).toFixed(2); // 4100.52;
      const option = {
        series: [
          {
            type: 'gauge',
            center: ['50%', '65%'], // 仪表盘中心位置 (水平50%, 垂直80%)
            radius: '80%', // 新增：调大半径，让整个环更大
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 4000,
            splitNumber: 10, // 刻度分割数量 (分成10段)
            itemStyle: {
              color: '#FFAB91'
            },
            progress: {
              show: true,
              width: 20 // 从 30 改为 20（减小进度条宽度）
            },
            pointer: {
              show: false
            },
            axisLine: {
              lineStyle: {
                width: 20 // 从 30 改为 20（减小轴线宽度）
              }
            },
            axisTick: {
              distance: -32, // 从 -45 改为 -30（调整刻度距离）
              splitNumber: 5,
              lineStyle: {
                width: 2,
                color: '#999'
              }
            },
            splitLine: {
              distance: -37, // 从 -52 改为 -35（调整分割线距离）
              length: 10, // 从 14 改为 10（减小分割线长度）
              lineStyle: {
                width: 2, // 从 3 改为 2（减小分割线宽度）
                color: '#999'
              }
            },
            axisLabel: {
              distance: -2, // 从 -20 改为 -5（减小距离，让数字更靠近刻度环）
              color: '#999',
              fontSize: 12, // 修改：仪表盘刻度标签字体大小
              rotate: 'tangential' // 新增：让标签数字始终与环切面垂直
              // rotate: 45, // 固定角度
            },
            anchor: {
              show: false
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              width: '60%',
              lineHeight: 40,
              borderRadius: 8,
              offsetCenter: [0, '-10%'], // 仪表盘中心数相对于中心的偏移 (向上偏移10%)
              fontSize: 14, // 修改：仪表盘中心数值字体大小 从 24 改为 20（进一步减小中心数值字体大小）
              fontWeight: 'bolder',
              formatter: '{value} ℃·d',
              color: 'inherit'
            },
            data: [
              {
                value: random
              }
            ]
          },
          {
            type: 'gauge',
            center: ['50%', '65%'],
            radius: '80%', // 同样调大第二层的半径
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 4000,
            itemStyle: {
              color: '#FD7347'
            },
            progress: {
              show: true,
              width: 6 // 从 8 改为 6（减小第二层进度条宽度）
            },
            pointer: {
              show: false
            },
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            detail: {
              show: false
            },
            data: [
              {
                value: random
              }
            ]
          }
        ]
      };

      temperatureGaugeInstance.setOption(option);

      // 新增：使用 ResizeObserver 监听容器大小变化
      temperatureGaugeResizeObserver = new ResizeObserver(() => {
        temperatureGaugeInstance?.resize();
      });
      temperatureGaugeResizeObserver.observe(temperatureGauge.value);
    }
  });
};

// 更新图表数据
const updateCharts = () => {
  if (rainfallChartInstance) {
    const baseName = four_base_name.value.find((item: any) => item.value === searchForm.baseName)?.label || '未知基地';
    const option = {
      xAxis: {
        data: [baseName, '全部基地']
      },
      series: [
        {
          data: [
            {
              value: currentBaseRainfall.value,
              itemStyle: {
                color: '#5470c6'
              }
            },
            {
              value: allBaseRainfall.value,
              itemStyle: {
                color: '#91cc75'
              }
            }
          ]
        }
      ]
    };
    rainfallChartInstance.setOption(option);
  }

  if (temperatureGaugeInstance) {
    const option = {
      series: [
        {
          data: [
            {
              value: activeTemperatureSum.value
            }
          ]
        },
        {
          data: [
            {
              value: activeTemperatureSum.value
            }
          ]
        }
      ]
    };
    temperatureGaugeInstance.setOption(option);
  }
};

// 主动查询方法（供父组件调用）
// 优化 fetchData：确保字典和 DOM 都就绪
const fetchData = () => {
  // 等待字典加载完成后再查询
  if (dictLoaded.value) {
    handleQuery();
  } else {
    // 若字典未加载，延迟查询（避免数据异常）
    const timer = setTimeout(() => {
      if (dictLoaded.value) {
        handleQuery();
        clearTimeout(timer);
      }
    }, 100);
  }
};

// 重置表单方法
const resetForm = () => {
  searchForm.baseName = four_base_name.value[0]?.value || '1';
  searchForm.statDimension = 'year';
  searchForm.dateValue = new Date().getFullYear().toString();

  // 可选：清空表格数据（让表格显示“暂无数据”）
  weatherTableData.value = [];
  soilTableData.value = [];
};

// 暴露方法给父组件
defineExpose({
  resetForm,
  fetchData
});

/*导出pdf*/
// 图表图片
const rainfallChartImage = ref<string>('');
const temperatureGaugeImage = ref<string>('');
const exportContainer = ref<HTMLDivElement | null>(null);

// 辅助方法：获取基地名称
const getBaseName = () => {
  const base = four_base_name.value.find((item: any) => item.value === searchForm.baseName);
  return base ? base.label : '未知基地';
};

// 辅助方法：获取统计维度文本
const getStatDimensionText = () => {
  switch (searchForm.statDimension) {
    case 'year':
      return '按年度统计';
    case 'month':
      return '按月度统计';
    case 'growthPeriod':
      return '按生育期统计';
    default:
      return '未知维度';
  }
};

// 计算属性：生成PDF标题
const pdfTitle = computed(() => {
  const baseName = getBaseName();
  const dimensionText = getStatDimensionText();
  const dateValue = searchForm.dateValue || '未知时间';

  // 如果是生育期，格式化为 "2025-播种期"
  let formattedDateValue = dateValue;
  if (searchForm.statDimension === 'growthPeriod') {
    const parts = dateValue.split('-');
    const year = parts[0];
    const growthPeriodCode = parts[1];
    const growthPeriod = four_growth_period.value.find((item: any) => item.value === growthPeriodCode);
    const periodName = growthPeriod ? growthPeriod.label : '未知生育期';
    formattedDateValue = `${year}-${periodName}`;
  }

  return `四情监测数据统计 —— ${baseName} | ${dimensionText} | ${formattedDateValue}`;
});

// 截图图表
const captureChartAsImage = (chartInstance: echarts.ECharts | null): Promise<string> => {
  return new Promise((resolve) => {
    if (!chartInstance) {
      resolve('');
      return;
    }

    // 确保图表渲染完成
    setTimeout(() => {
      try {
        const imgData = chartInstance.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff'
        });
        resolve(imgData);
      } catch (error) {
        console.error('图表截图失败:', error);
        resolve('');
      }
    }, 1000);
  });
};

// 导出PDF - 使用更可靠的方法
const exportToPdf = async () => {
  const loadingInstance = ElLoading.service({
    text: '正在准备导出数据...',
    background: 'rgba(0, 0, 0, 0.7)'
  });

  try {
    updateCharts(); // 确保图表数据是最新的

    // 1. 截图图表
    loadingInstance.setText('正在生成图表截图...');

    const [rainfallImage, temperatureImage] = await Promise.all([
      captureChartAsImage(rainfallChartInstance),
      captureChartAsImage(temperatureGaugeInstance)
    ]);

    if (!rainfallImage || !temperatureImage) {
      throw new Error('图表截图生成失败');
    }

    rainfallChartImage.value = rainfallImage;
    temperatureGaugeImage.value = temperatureImage;

    // 2. 等待DOM更新
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. 使用更简单的导出方法
    loadingInstance.setText('正在生成PDF文件...');

    const element = document.getElementById('pdf-content');
    if (!element) {
      throw new Error('导出内容未找到');
    }

    const options = {
      margin: 10,
      filename: `气象墒情统计_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    // 使用更稳定的导出方式
    const pdf = html2pdf().from(element).set(options);

    // 添加超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF生成超时')), 30000);
    });

    await Promise.race([pdf.save(), timeoutPromise]);

    ElMessage.success('导出成功！');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    loadingInstance.close();
  }
};

// 新增：标记字典是否加载完成
const dictLoaded = ref(false);

// 页面挂载时执行查询
onMounted(() => {
  // 监听 four_base_name 数据变化，等待加载完成
  watch(
    () => four_base_name.value, // 监听字典数据
    (newVal) => {
      // 当字典数据非空，且图表未初始化时，执行初始化
      if (newVal?.length > 0 && !dictLoaded.value) {
        initCharts(); // 此时字典数据已加载
        fetchData();
        dictLoaded.value = true; // 标记为已初始化，避免重复执行
      }
    },
    { immediate: true } // 立即执行一次（防止字典已提前加载完成）
  );
});

// 页面卸载时清理
onBeforeUnmount(() => {
  // 清理 ResizeObserver
  if (rainfallChartResizeObserver) {
    rainfallChartResizeObserver.disconnect();
  }
  if (temperatureGaugeResizeObserver) {
    temperatureGaugeResizeObserver.disconnect();
  }

  // 清理图表实例
  if (rainfallChartInstance) {
    rainfallChartInstance.dispose();
  }
  if (temperatureGaugeInstance) {
    temperatureGaugeInstance.dispose();
  }
});
</script>

<style scoped>
.stat-container {
  padding: 0 10px;
  height: calc(100vh - 210px);
}

.search-form {
  margin-bottom: 5px;
  display: flex;
  justify-content: center;
  height: 50px;
  align-items: center;
}

.form-inline {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
  padding-left: 0;
  justify-content: center;
}

/* 统一表单项间距 */
.form-item {
  margin-bottom: 0;
  margin-right: 0 !important;
}

/* 固定动态label的宽度，确保2字/3字占用相同空间 */
:deep(.dynamic-label-item .el-form-item__label) {
  width: 50px !important; /* 固定宽度（2-3字足够） */
  min-width: 50px !important;
  max-width: 50px !important;
  text-align: right !important; /* 与其他label对齐方式一致 */
  padding-right: 10px !important; /* 与输入框的间距，匹配其他表单项 */
  margin-right: 0 !important;
  white-space: nowrap !important;
}

.table-container {
  height: 440px; /* 明确固定高度（根据需求调整，比如320px） */
  background: transparent !important;
  border-radius: 0;
  padding: 10px 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center; /* 表格区域水平居中 */
  gap: 10px; /* 两个表格组之间的间距，替代原有的 margin-bottom */
}

.table-section {
  height: 50%; /* 两个表格各占一半高度 */
  margin-bottom: 0;
  overflow: auto; /* 表格内容超出时滚动 */
  page-break-inside: avoid; /* PDF导出时避免分页 */
}

.table-title {
  text-align: center;
  margin-bottom: 12px;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
  width: 100%; /* 标题占满表格宽度，居中显示 */
}

/* 图表区域：固定高度（不依赖 flex） */
.chart-container {
  height: calc(100% - 50px - 320px - 20px); /* 总高度 - 搜索区 - 表格区 - 间距 */
  min-height: 220px; /*设置图表容器最小高度，放置缩小窗口时计算出来的高度太小而无法显示图表*/
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 10px 0;
  margin-top: 0;
}

.chart-section {
  width: 48%; /* 两个图表各占一半宽度 */
  height: 100%; /* 继承父容器固定高度 */
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  /*border: 1px solid #e8e8e8;*/ /* 修改：添加细边框替代阴影 */
}

.chart-title {
  text-align: center;
  margin-bottom: 0;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
}
.chart {
  width: 100%;
  height: calc(100% - 20px); /* 减去标题高度，剩下全给图表 */
}

:deep(.el-table) {
  width: 100%;
  table-layout: fixed; /* 关键：固定布局 */
}

:deep(.el-table__body),
:deep(.el-table__header) {
  width: 100% !important;
}

:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  width: 100% !important;
}

:deep(.el-table th),
:deep(.el-table td) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stat-container {
    height: auto;
    min-height: 100vh;
  }

  .form-inline {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 100%;
  }

  .chart-container {
    flex-direction: column;
    gap: 15px;
    flex: none;
    height: 450px; /* 修改：小屏幕固定图表区域高度 */
  }

  .chart-section {
    flex: 0 0 50%;
    max-width: none;
    height: 100%;
  }

  .chart {
    height: 100%;
    min-height: 180px;
  }

  :deep(.el-form-item) {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  :deep(.el-select),
  :deep(.el-date-picker),
  :deep(.growth-period-picker) {
    width: 100% !important;
  }

  /* 响应式下恢复动态label自适应 */
  :deep(.dynamic-label-item .el-form-item__label) {
    width: auto !important;
    min-width: auto !important;
    max-width: none !important;
    text-align: left !important;
    padding-right: 0 !important;
  }
}
</style>
