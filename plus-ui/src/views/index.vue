<template>
  <!-- 整体布局容器，使用网格布局 -->
  <div class="dashboard-container">
    <!-- 左上角：四情监测设备状态 -->
    <div class="dashboard-item top-left">
      <div class="title-container">
        <el-icon :size="17" class="title-icon">
          <Setting />
        </el-icon>
        <span class="title-text">四情监测设备状态</span>
      </div>
      <div class="p-2">
        <el-row :gutter="12">
          <el-col v-for="item in FacilityInfo" :key="item.facilityType" :xs="24" :sm="12" :md="12" :lg="12">
            <el-card class="device-status-card" shadow="hover">
              <div class="device-card-header">
                <span class="device-name">{{ getFacilityTypeName(item.facilityType) }}</span>
                <el-tag :type="getStatusTagType(item)" size="small" style="font-size: 11px; line-height: 20px; padding: 0 5px" effect="dark">
                  在线率 {{ calculateOnlineRate(item) }}%
                </el-tag>
              </div>
              <div class="device-status-details">
                <div class="device-status-item">
                  <span class="device-status-label">在线</span>
                  <span class="device-status-value">{{ item.online }}</span>
                </div>
                <div class="device-status-item">
                  <span class="device-status-label">离线</span>
                  <span class="device-status-value">{{ item.offline }}</span>
                </div>
                <div class="device-status-item">
                  <span class="device-status-label">故障</span>
                  <span class="device-status-value">{{ item.fault }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 右上角：作物生境监测 -->
    <div class="dashboard-item top-right">
      <div class="title-container" style="justify-content: space-between">
        <div style="display: flex; align-items: center">
          <el-icon :size="17" class="title-icon">
            <Monitor />
          </el-icon>
          <span class="title-text">作物生境监测</span>
        </div>
        <div class="filter-selector">
          <div class="filter-item" style="margin-right: 5px">
            <!--<label>选择基地：</label>-->
            <el-select
              v-model="selectedBase4Monitor"
              v-hasPermi="['four:dataBoard:selectBase']"
              placeholder="请选择基地"
              style="width: 130px"
              @change="fetchMonitors"
            >
              <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" class="custom-option" />
            </el-select>
          </div>
          <div class="filter-item">
            <label v-hasPermi="['four:dataBoard:selectBase']">-</label>
            <el-select
              v-model="selectedMonitor"
              :loading="loadingMonitor"
              placeholder="请选择设备"
              style="width: 130px"
              :disabled="!selectedBase4Monitor"
              @change="changeVideoStream"
            >
              <el-option
                v-for="monitor in monitorList"
                :key="monitor.facilityId"
                :label="`摄像头_${monitor.facilityId}`"
                :value="monitor.facilityId"
              />
            </el-select>
          </div>
        </div>
      </div>

      <div class="video-container">
        <video ref="videoPlayer" class="video-js vjs-default-skin" controls preload="auto"></video>
        <!-- 未选择设备或设备状态异常时的占位 -->
        <div v-if="!selectedMonitor || monitorStatus !== 's1'" class="video-placeholder">
          <el-empty :description="!selectedMonitor ? '请选择监控设备' : getStatusText(monitorStatus)"></el-empty>
        </div>
      </div>
    </div>

    <!-- 左下角：基地小气候气象 -->
    <div class="dashboard-item bottom-left">
      <div class="title-container" style="justify-content: space-between">
        <div style="display: flex; align-items: center">
          <el-icon :size="17" class="title-icon">
            <Pouring />
          </el-icon>
          <span class="title-text">农田气象监测</span>
        </div>
        <!-- 指标切换按钮 -->
        <div class="weather-metric-switcher">
          <el-radio-group v-model="currentMetric" :disabled="weatherDataLoading" @change="updateWeatherChart">
            <el-radio-button value="temperature">温度(℃)</el-radio-button>
            <el-radio-button value="humidity">湿度(%)</el-radio-button>
            <el-radio-button value="light">光照(lux)</el-radio-button>
            <el-radio-button value="rainfall">降雨量(mm)</el-radio-button>
            <el-radio-button value="windSpeed">风速(m/s)</el-radio-button>
          </el-radio-group>
        </div>
        <div class="filter-selector">
          <!--<label for="base-select">选择基地：</label>-->
          <el-select
            v-model="selectedBase4Weather"
            v-hasPermi="['four:dataBoard:selectBase']"
            placeholder="请选择基地"
            style="width: 130px"
            @change="fetchWeatherData"
          >
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value" class="custom-option" />
          </el-select>
        </div>
      </div>
      <div class="weather-dashboard">
        <!-- 加载状态提示 -->
        <el-alert v-if="weatherDataLoading" title="数据加载中..." type="info" :closable="false" show-icon class="loading-alert" />
        <!-- 原生ECharts容器（必须指定宽高） -->
        <div ref="weatherChartDom" class="weather-chart-container"></div>
      </div>
    </div>

    <!-- 右下角：土壤墒情监测 -->
    <div class="dashboard-item bottom-right">
      <div class="title-container" style="justify-content: space-between">
        <div style="display: flex; align-items: center">
          <el-icon :size="17" class="title-icon">
            <Odometer />
          </el-icon>
          <span class="title-text">土壤墒情监测</span>
        </div>
        <div class="filter-selector">
          <!--<label for="base-select">选择基地：</label>-->
          <el-select
            v-model="selectedBase"
            v-hasPermi="['four:dataBoard:selectBase']"
            placeholder="请选择基地"
            style="width: 130px"
            @change="fetchSoilData"
          >
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value" class="custom-option" />
          </el-select>
        </div>
      </div>
      <div class="soil-dashboard">
        <div ref="soilChartRef" class="soil-chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup name="Cache" lang="ts">
import * as echarts from 'echarts';
import useUserStore from '@/store/modules/user';
const userStore = useUserStore();

// 鉴权使用，方式二：前端判断
const targetRoles = ['sysadmin', 'govadmin', 'superadmin', 'allBase'];
// 所有角色都不在目标角色列表中 → 都不包含
const hasNoneTargetRole = userStore.roles.every((role) => !targetRoles.includes(role));

// 获取当前用户部门id对应基地id
const getCurrentBaseId = () => {
  return four_deptid_baseid.value.find((item) => item.label === String(userStore.deptId))?.value;
};

// 获取基地名称字典
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_base_name, four_deptid_baseid } = toRefs<any>(proxy?.useDict('four_base_name', 'four_deptid_baseid'));

/*四情监测设备状态*/
//方案三：卡片式展示设备状态
import { FacilityData, OverviewQueryParams } from '@/views/four/api/statisticAnalysis/types';
import { queryFacilityInfo } from '@/views/four/api/statisticAnalysis';

// 设备信息
const FacilityInfo = ref<FacilityData[]>([]);
const loading = ref(false);
// 设备类型字典映射
const facilityTypeMap = {
  '1': '农田气象站',
  '2': '墒情监测站',
  '3': '虫情测报仪',
  '4': '生境监测仪'
};
// 获取设备类型名称
const getFacilityTypeName = (typeCode: string) => {
  return facilityTypeMap[typeCode] || `未知设备(${typeCode})`;
};
// 计算在线率
const calculateOnlineRate = (item: FacilityData) => {
  const total = item.online + item.offline + item.fault;
  return total > 0 ? Math.round((item.online / total) * 100) : 0;
};
// 获取标签类型（根据在线率）
const getStatusTagType = (item: FacilityData) => {
  const rate = calculateOnlineRate(item);
  return rate >= 90 ? 'success' : rate >= 70 ? 'warning' : 'danger';
};
// 获取数据
const fetchFacilityInfoData = async () => {
  loading.value = true;
  try {
    let deptId = null;
    if (hasNoneTargetRole) {
      deptId = userStore.deptId;
    }
    const res = await queryFacilityInfo(deptId);
    if (res.code === 200) {
      FacilityInfo.value = res.data;
    } else {
      console.error('请求失败:', res.msg);
    }
  } catch (error) {
    console.error('请求异常:', error);
  } finally {
    loading.value = false;
  }
};

/*基地小气候气象*/
import { WeatherData } from '@/views/four/api/statisticAnalysis/types';
import { queryWeatherData } from '@/views/four/api/statisticAnalysis';

const selectedBase4Weather = ref<string>(four_base_name.value[0]?.value || '1'); // 默认选中第一个基地

// 数据状态
const weatherData = ref<WeatherData[]>([]);
const weatherDataLoading = ref(false);
const error = ref(null);

// DOM引用和图表实例
const weatherChartDom = ref<HTMLElement>();
let weatherChartInstance: echarts.ECharts | null = null;
const currentMetric = ref('temperature');

// 指标映射配置
const metricConfig = {
  temperature: { name: '温度', unit: '℃', key: 'airTemperature', color: '#FF6384' },
  humidity: { name: '湿度', unit: '%', key: 'airHumidity', color: '#36A2EB' },
  light: { name: '光照', unit: 'lux', key: 'lightIntensity', color: '#FFCE56' },
  rainfall: { name: '降雨量', unit: 'mm', key: 'rainfall', color: '#4BC0C0' },
  windSpeed: { name: '风速', unit: 'm/s', key: 'windSpeed', color: '#9966FF' }
};

// 获取最新气象数据
const fetchWeatherData = async () => {
  weatherDataLoading.value = true;
  error.value = null;
  try {
    const params = {
      baseId: selectedBase4Weather.value
    };
    if (userStore.roles.length === 0) {
      ElMessage.warning('当前用户角色为空');
      return;
    }
    if (hasNoneTargetRole) {
      params.baseId = getCurrentBaseId();
    }

    const res = await queryWeatherData(params.baseId);

    // 按日期排序
    const sortedData = res.data.sort((a, b) => new Date(a.collect_time).getTime() - new Date(b.collect_time).getTime());

    if (sortedData.length === 0) {
      ElMessage.warning('当前基地没有可用数据');
      return;
    }
    weatherData.value = sortedData;
    updateWeatherChart();
  } catch (err) {
    console.error('获取气象数据失败:', err);
  } finally {
    weatherDataLoading.value = false;
  }
};

// 初始化图表
let weatherChartResizeObserver: ResizeObserver | null = null;
const initWeatherChart = () => {
  if (!weatherChartDom.value) return;

  // 销毁旧实例
  if (weatherChartInstance) {
    weatherChartInstance.dispose();
  }

  // 创建新实例
  weatherChartInstance = echarts.init(weatherChartDom.value);

  // 使用ResizeObserver 调整窗口大小变化时自适应
  weatherChartResizeObserver = new ResizeObserver(() => {
    weatherChartInstance?.resize();
  });
  weatherChartResizeObserver.observe(weatherChartDom.value);

  fetchWeatherData(); // 初始化时获取数据
};

// 更新图表数据
const updateWeatherChart = () => {
  if (!weatherChartInstance || !weatherData.value.length) return;

  const { name, unit, key, color } = metricConfig[currentMetric.value];

  // 准备图表数据
  // x轴用时间，y轴用对应指标值
  const times = weatherData.value.map((item) => {
    // 格式化时间（示例：2024-05-20 14:30），可根据需求调整
    return formatTime(item.collectTime).split(' ')[0];
  });
  const values = weatherData.value.map((item) => item[key]);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const value = params[0].value;
        return `${params[0].name}<br/>${name}: ${value}${unit}`;
      }
    },
    grid: {
      // bottom: '10%' // 为时间显示留出空间
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: times,
        axisLabel: {
          rotate: 0,
          interval: 1,
          fontSize: 12
        },
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: {
      type: 'value',
      name: `${name}(${unit})`,
      axisLabel: {
        formatter: `{value} ${unit}`,
        fontSize: 12
      },
      nameTextStyle: {
        fontSize: 12,
        padding: [0, 0, 0, -30]
      }
    },
    series: [
      {
        name: name,
        type: 'line', // 改为折线图
        areaStyle: {
          // 添加面积图效果
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: color + '80' // 起始颜色
            },
            {
              offset: 1,
              color: color + '10' // 结束颜色（更透明）
            }
          ])
        },
        lineStyle: {
          width: 2,
          color: color
        },
        itemStyle: {
          color: color
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 2,
            borderColor: color
          }
        },
        data: values,
        smooth: true, // 平滑曲线
        symbol: 'circle', // 数据点样式
        symbolSize: 6
      }
    ]
  };

  weatherChartInstance.setOption(option);
};

// 格式化时间函数
const formatTime = (timeString: string) => {
  if (!timeString) return '未知时间';
  try {
    const date = new Date(timeString);
    // return date.toLocaleString(); // 可以根据需要调整格式
    // 自定义格式，例如: "YYYY-MM-DD HH:mm:ss"
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  } catch (e) {
    return timeString; // 如果无法解析，返回原始字符串
  }
};

/*土壤墒情监测*/
import { SoilData } from '@/views/four/api/statisticAnalysis/types';
import { querySoilData } from '@/views/four/api/statisticAnalysis';

const selectedBase = ref<string>(four_base_name.value[0]?.value || '1');
const soilChartRef = ref<HTMLElement | null>(null);
let soilChartInstance: echarts.ECharts | null = null;

// 从API获取数据
const fetchSoilData = async () => {
  try {
    const params = {
      baseId: selectedBase.value
    };
    if (userStore.roles.length === 0) {
      ElMessage.warning('当前用户角色为空');
      return;
    }
    if (hasNoneTargetRole) {
      params.baseId = getCurrentBaseId();
    }
    const res = await querySoilData(params.baseId);

    // 按日期排序
    const sortedData = res.data.sort((a, b) => new Date(a.collect_time).getTime() - new Date(b.collect_time).getTime());

    if (sortedData.length === 0) {
      ElMessage.warning('当前基地没有可用数据');
      return;
    }

    updateSoilChart(sortedData);
  } catch (error) {
    ElMessage.error(`数据加载失败: ${error}`);
  }
};

// 初始化图表
let soilChartResizeObserver: ResizeObserver | null = null;
const initSoilChart = () => {
  if (!soilChartRef.value) return;

  if (soilChartInstance) {
    soilChartInstance.dispose();
  }

  soilChartInstance = echarts.init(soilChartRef.value);

  // 使用ResizeObserver 调整窗口大小变化时自适应
  soilChartResizeObserver = new ResizeObserver(() => {
    soilChartInstance?.resize();
  });
  soilChartResizeObserver.observe(soilChartRef.value);

  fetchSoilData();
};

// 更新图表
const updateSoilChart = (data: SoilData[]) => {
  if (!soilChartInstance || data.length === 0) return;

  const option: echarts.EChartsOption = {
    /*title: {
      text: `${getCurrentBaseName()} - 土壤墒情数据`,
      left: 'center',
      textStyle: {
        fontSize: 13
      }
    },*/
    tooltip: {
      trigger: 'axis',
      /*axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },*/
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br>`;
        params.forEach((param: any) => {
          const value = param.seriesName.includes('水分') ? (param.value * 100).toFixed(2) + '%' : param.value.toFixed(1) + '℃';
          result += `${param.marker} ${param.seriesName}: ${value}<br>`;
        });
        return result;
      }
    },
    legend: {
      data: ['0-20cm水分', '20-40cm水分', '40-60cm水分', '0-20cm温度', '20-40cm温度', '40-60cm温度'],
      bottom: 20,
      // itemWidth: 14,
      // itemHeight: 14,
      textStyle: {
        fontSize: 10
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '13%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.collectTime.split('T')[0]),
      axisLabel: {
        // rotate: 30,
        fontSize: 12
      },
      axisPointer: {
        type: 'shadow'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '土壤水分(%)',
        min: 0,
        max: 0.25,
        axisLabel: {
          formatter: (value: number) => (value * 100).toFixed(0) + '%',
          fontSize: 12
        },
        nameTextStyle: {
          fontSize: 12,
          padding: [0, 0, 0, -30]
        }
      },
      {
        type: 'value',
        name: '土壤温度(℃)',
        min: 0,
        max: 25,
        axisLabel: {
          formatter: '{value} ℃',
          fontSize: 12
        },
        nameTextStyle: {
          fontSize: 12,
          padding: [0, 0, 0, 40]
        }
      }
    ],
    series: [
      {
        name: '0-20cm水分',
        type: 'bar',
        barWidth: 12,
        data: data.map((item) => item.shallowWater),
        itemStyle: {
          color: '#5470C6'
          // borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '20-40cm水分',
        type: 'bar',
        barWidth: 12,
        data: data.map((item) => item.middleWater),
        itemStyle: {
          color: '#91CC75'
          // borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '40-60cm水分',
        type: 'bar',
        barWidth: 12,
        data: data.map((item) => item.deepWater),
        itemStyle: {
          color: '#FAC858'
          // borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '0-20cm温度',
        type: 'line',
        yAxisIndex: 1,
        data: data.map((item) => item.shallowTemperature),
        itemStyle: {
          color: '#EE6666'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      },
      {
        name: '20-40cm温度',
        type: 'line',
        yAxisIndex: 1,
        data: data.map((item) => item.middleTemperature),
        itemStyle: {
          color: '#73C0DE'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'diamond',
        symbolSize: 8
      },
      {
        name: '40-60cm温度',
        type: 'line',
        yAxisIndex: 1,
        data: data.map((item) => item.deepTemperature),
        itemStyle: {
          color: '#3BA272'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'triangle',
        symbolSize: 8
      }
    ] /*,
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: true },
        magicType: { show: true, type: ['line', 'bar'] },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    }*/
  };

  soilChartInstance.setOption(option);
  // 窗口大小变化时自适应
  window.addEventListener('resize', () => soilChartInstance?.resize());
};

/*作物生境监测*/
import { ElMessage } from 'element-plus';
import flvjs from 'flv.js';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

import { videoData } from '@/views/four/api/statisticAnalysis/types';
import { queryVideoData } from '@/views/four/api/statisticAnalysis';

// 使用字典数据
const { four_facility_status } = toRefs<any>(proxy?.useDict('four_facility_status'));

const selectedBase4Monitor = ref<number>(parseInt(four_base_name.value[0]?.value) || 1);
const selectedMonitor = ref<string>('');
const monitorList = ref<videoData[]>([]);
const monitorStatus = ref<string>('s1');
const loadingMonitor = ref(false);
const videoPlayer = ref<HTMLVideoElement | null>(null);
let player: any = null;
let flvPlayer: flvjs.Player | null = null;

// 获取监控设备状态文本
const getStatusText = (status: string) => {
  const statusText = four_facility_status.value?.find((item) => item.value === status)?.label || '未知状态';
  return `设备${statusText}`; // 在前面拼接"设备"
};

// 获取监控设备列表
const fetchMonitors = async () => {
  if (!selectedBase4Monitor.value) return;

  loadingMonitor.value = true;
  selectedMonitor.value = '';
  monitorList.value = [];
  await destroyPlayer();

  try {
    const params = {
      baseId: selectedBase4Monitor.value
    };
    if (userStore.roles.length === 0) {
      ElMessage.warning('当前用户角色为空');
      return;
    }
    if (hasNoneTargetRole) {
      params.baseId = getCurrentBaseId();
    }
    const res = await queryVideoData(params.baseId);

    if (res.code === 200) {
      monitorList.value = res.data;

      // 默认选择第一个设备
      if (monitorList.value.length > 0) {
        selectedMonitor.value = monitorList.value[0].facilityId;
        await changeVideoStream();
      } else {
        ElMessage.warning('该基地没有监控设备');
      }
    } else {
      throw new Error(res.msg || '获取监控数据失败');
    }
  } catch (error) {
    ElMessage.error('获取设备列表失败');
  } finally {
    loadingMonitor.value = false;
  }
};

// 切换视频流
const changeVideoStream = async () => {
  await destroyPlayer();

  // 确保DOM更新完成
  await nextTick();

  if (!selectedMonitor.value || !videoPlayer.value) return;

  const monitor = monitorList.value.find((d) => d.facilityId === selectedMonitor.value);
  if (!monitor) return;

  monitorStatus.value = monitor.facilityStatus;

  if (monitor.facilityStatus !== 's1') {
    ElMessage.warning(`设备状态: ${getStatusText(monitor.facilityStatus)}`);
    return;
  }

  try {
    loadingMonitor.value = true;

    // 确保video元素在DOM中
    if (!document.body.contains(videoPlayer.value)) {
      const videoContainer = document.querySelector('.video-container');
      if (videoContainer) {
        const newVideo = document.createElement('video');
        newVideo.className = 'video-js vjs-default-skin';
        newVideo.controls = true;
        newVideo.preload = 'auto';
        newVideo.width = Number('100%');
        newVideo.height = Number('500');
        videoContainer.insertBefore(newVideo, videoContainer.firstChild);
        videoPlayer.value = newVideo;
      }
    }

    if (monitor.fileLocation.endsWith('.flv')) {
      // 使用FLV播放
      flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: monitor.fileLocation,
        isLive: true
      });

      flvPlayer.attachMediaElement(videoPlayer.value);
      flvPlayer.load();

      // 不自动播放，等待用户交互
      videoPlayer.value.muted = true; // 静音可以绕过部分浏览器的限制

      try {
        await flvPlayer.play();
      } catch (error) {
        console.error('FLV播放错误:', error);
        ElMessage.error('FLV播放失败，请检查流地址');
      }
    } else {
      // 确保使用新的video元素初始化Video.js
      player = videojs(
        videoPlayer.value,
        {
          autoplay: 'muted',
          controls: true,
          preload: 'auto',
          fluid: true,
          techOrder: ['html5']
        },
        function () {
          // 播放器就绪回调
          this.src({
            type: monitor.fileLocation.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4',
            src: monitor.fileLocation
          });
          this.load();
        }
      );
    }
  } catch (error) {
    console.error('视频播放初始化失败:', error);
    ElMessage.error('视频播放初始化失败');
  } finally {
    loadingMonitor.value = false;
  }
};

// 销毁播放器
const destroyPlayer = async () => {
  loadingMonitor.value = true;

  try {
    // 销毁FLV播放器
    if (flvPlayer) {
      flvPlayer.pause();
      flvPlayer.unload();
      flvPlayer.detachMediaElement();
      flvPlayer.destroy();
      flvPlayer = null;
    }

    // 销毁Video.js播放器
    if (player) {
      // 先检查player是否仍然关联到有效的DOM元素
      if (player.el() && document.body.contains(player.el())) {
        player.dispose();
      }
      player = null;
    }
  } catch (error) {
    console.error('销毁播放器错误:', error);
  } finally {
    loadingMonitor.value = false;
  }
};

// 定义是否已初始化图表的标记（避免重复初始化）
const isChartInited = ref(false);

onMounted(() => {
  // 先执行其他不需要字典的初始化逻辑
  fetchFacilityInfoData();

  // 3. 监听 four_deptid_baseid 数据变化，等待加载完成
  watch(
    () => four_deptid_baseid.value, // 监听字典数据
    (newVal) => {
      // 当字典数据非空，且图表未初始化时，执行初始化
      if (newVal?.length > 0 && !isChartInited.value) {
        initSoilChart(); // 此时字典数据已加载，getCurrentBaseId() 能正确获取
        fetchMonitors();
        initWeatherChart();
        isChartInited.value = true; // 标记为已初始化，避免重复执行
      }
    },
    { immediate: true } // 立即执行一次（防止字典已提前加载完成）
  );
});

onBeforeUnmount(() => {
  if (weatherChartResizeObserver) {
    weatherChartResizeObserver.disconnect();
  }
  if (weatherChartInstance) {
    weatherChartInstance.dispose();
  }

  if (soilChartResizeObserver) {
    soilChartResizeObserver.disconnect();
  }
  if (soilChartInstance) {
    soilChartInstance.dispose();
  }

  destroyPlayer();
});
</script>

<style scoped>
/* 新增的网格布局样式 - 主要调整部分 */
.dashboard-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto; /* 改为auto让高度自适应 */
  gap: 10px;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.dashboard-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.top-left {
  grid-column: 1;
  grid-row: 1;
}

.top-right {
  grid-column: 2;
  grid-row: 1;
}

.bottom-left {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
}

.bottom-right {
  grid-column: 2;
  grid-row: 2;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
    height: auto;
  }

  .dashboard-item {
    grid-column: 1;
  }

  .top-left {
    grid-row: 1;
  }
  .top-right {
    grid-row: 2;
  }
  .bottom-left {
    grid-row: 3;
  }
  .bottom-right {
    grid-row: 4;
  }
}

/*标题行样式*/
.title-container {
  display: flex;
  align-items: center;
  padding-top: 10px;
  padding-left: 5px;
}

.title-icon {
  margin-right: 5px; /* 图标与文字间距 */
  color: #409eff; /* 图标颜色（Element主题色） */
}

.title-text {
  font-size: 14px;
  font-weight: bold;
}

/*四情监测设备状态-卡片样式*/
.device-status-card {
  margin-bottom: 5px;
  border-radius: 6px;
  //padding-bottom: -20px;
  //border: none;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}

.device-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  //margin-bottom: 1px;
}

.device-name {
  font-weight: bold;
  font-size: 14px;
}

.device-status-details {
  padding: 5px;
}

.device-status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
  align-items: center;
  font-size: 13px; /* 缩小字体 */
}

.device-status-label {
  color: #666;
  //padding-right: 8px; /* 标签与数字的间距 */
}

.device-status-value {
  font-weight: bold;
  //min-width: 20px; /* 确保数字对齐 */
  //text-align: right;
}

/*基地小气候气象*/
.weather-dashboard {
  width: 100%;
  height: 370px;
  padding: 0 10px; /* 减少内边距 */
  display: flex;
  //border: 1px solid #eee;
  border-radius: 8px;
  flex-direction: column;
}

.weather-metric-switcher {
  margin-left: auto; /* 将切换按钮推到右侧 */
  margin-right: 10px;
}

.weather-metric-switcher .el-radio-button :deep(.el-radio-button__inner) {
  padding: 6px 8px; /* 减小按钮内边距 */
  font-size: 13px; /* 减小字体大小 */
}

.weather-chart-container {
  width: 100%;
  height: 100%;
  //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/*土壤墒情监测样式*/
.filter-selector {
  margin-right: 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 1px;
}

.soil-dashboard {
  width: 100%;
  height: 370px;
  //border: 1px solid #eee;
  border-radius: 8px;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
}

.soil-chart-container {
  width: 100%;
  height: 100%;
  //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/*作物生境监测样式*/
.filter-item {
  display: flex;
  align-items: center;
  width: 100%; /* 让选择框宽度自适应 */
}

.filter-item label {
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
  margin-right: 6px;
}

/* 自定义选择框-选项的样式 */
.custom-option {
  font-size: 13px; /* 设置选项的字体大小 */
}

.video-container {
  display: block !important; /* 确保容器始终可见 */
  position: relative;
  width: 100%;
  min-height: 250px; /* 设置最小高度 */
  max-height: 350px; /* 设置最小高度 */
  height: 320px; /* 改为自动高度 */
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto; /* 居中 */
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  z-index: 1;
}

.video-js {
  width: 100%;
  height: 100%;
  z-index: 2;
}
</style>
