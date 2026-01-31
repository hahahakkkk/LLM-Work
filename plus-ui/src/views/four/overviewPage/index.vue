<template>
  <div>
    <!-- 数据卡片容器 -->
    <div class="data-cards">
      <!-- 四情汇聚数据卡片 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Monitor /></el-icon>
            <span class="header-title">四情汇聚数据</span>
          </div>
        </template>
        <div class="card-content">
          <div class="chart-container">
            <div ref="dashboardChart" class="chart"></div>
          </div>
          <p class="card-description">包含各谷子基地气象监测数据、墒情监测数据、虫情监测数据、生境监测数据，杀虫灯数据及四情监测设备数据。</p>
        </div>
        <div class="button-container">
          <el-button size="small" type="success" class="stat-btn" @click="openStatDrawer = true">数据统计</el-button>
          <el-button size="small" type="primary" class="detail-btn" @click="$router.push('four/microclimate')">查看详细</el-button>
        </div>
      </el-card>

      <!-- 星空地监测数据卡片 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Share /></el-icon>
            <span class="header-title">星空地监测数据</span>
          </div>
        </template>
        <div class="card-content">
          <div class="chart-container">
            <div ref="interfaceChart" class="chart"></div>
          </div>
          <p class="card-description">基于“星空地”一体化数据采集技术，采集获取谷子重要生育期无人机遥感影像、卫星遥感影像及植株尺度病虫害图像。</p>
        </div>
        <div class="button-container">
          <el-button size="small" type="primary" class="detail-btn" @click="$router.push('star/remoteSense')">查看详细</el-button>
        </div>
      </el-card>

      <!-- 土壤基础养分卡片 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Filter /></el-icon>
            <span class="header-title">土壤基础养分</span>
          </div>
        </template>
        <div class="card-content">
          <div class="chart-container">
            <div ref="nutrientChart" class="chart"></div>
          </div>
          <p class="card-description">对谷子基地土壤进行采样，并检测土壤中基础养分含量，包含全氮、全磷、有效磷、速效钾、缓效钾、有机质等指标数据。</p>
        </div>
        <div class="button-container">
          <el-button size="small" type="primary" class="detail-btn" @click="$router.push('soilNutrient')">查看详细</el-button>
        </div>
      </el-card>

      <!-- 植株本体数据卡片 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Sunny /></el-icon>
            <span class="header-title">植株本体数据</span>
          </div>
        </template>
        <div class="card-content">
          <div class="chart-container">
            <div ref="monitorChart" class="chart"></div>
          </div>
          <p class="card-description">对谷子各基地在重要生育期的植株进行实地测量，采集获取植株叶面积数据和叶绿素含量数据。</p>
        </div>
        <div class="button-container">
          <el-button size="small" type="primary" class="detail-btn" @click="$router.push('statistics')">查看详细</el-button>
        </div>
      </el-card>

      <!-- 生产过程数据卡片 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Histogram /></el-icon>
            <span class="header-title">生产过程数据</span>
          </div>
        </template>
        <div class="card-content">
          <div class="chart-container">
            <div ref="productionChart" class="chart"></div>
          </div>
          <p class="card-description">包含每年各基地药品投入、化肥投入、灌溉记录及产量等生产过程数据。</p>
        </div>
        <div class="button-container">
          <el-button size="small" type="primary" class="detail-btn" @click="$router.push('process/fertilizerRecord')">查看详细</el-button>
        </div>
      </el-card>

      <!-- 市场行情数据卡片 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><ShoppingCart /></el-icon>
            <span class="header-title">市场行情数据</span>
          </div>
        </template>
        <div class="card-content">
          <div class="chart-container">
            <div ref="marketChart" class="chart"></div>
          </div>
          <p class="card-description">包含陕西、河北、山西、内蒙古、辽宁、吉林等20个省份，每日谷子市场价格数据。</p>
        </div>
        <div class="button-container">
          <el-button size="small" type="primary" class="detail-btn" @click="$router.push('market/marketInfo')">查看详细</el-button>
        </div>
      </el-card>

      <!-- 模型库卡片 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><PieChart /></el-icon>
            <span class="header-title">模型库</span>
          </div>
        </template>
        <div class="card-content">
          <!-- 图表区 -->
          <div class="chart-container">
            <div class="model-info">
              <!-- 决策模型模块 -->
              <div class="model-item">
                <div class="model-label">决策模型</div>
                <div class="model-value">
                  <el-icon class="model-icon"><Grid /></el-icon>
                  <span class="model-count">{{ modelLibStat.modelCount }}个</span>
                </div>
              </div>
              <!-- 数据集模块 -->
              <div class="model-item">
                <div class="model-label">数据集</div>
                <div class="model-value">
                  <el-icon class="data-icon"><TrendCharts /></el-icon>
                  <span class="model-count">{{ modelLibStat.datasetCount }}个，{{ modelLibStat.datasetSize }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 文字描述区 -->
          <p class="card-description">包含穗种期识别、出苗率检测、病虫害识别、长势分析、成熟度检测等生产决策模型，及相应训练数据集。</p>
        </div>
        <!-- 按钮区 -->
        <div class="button-container">
          <el-button size="small" type="primary" class="detail-btn" @click="$router.push('library/dataset')">查看详细</el-button>
        </div>
      </el-card>

      <!-- 知识库卡片 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Document /></el-icon>
            <span class="header-title">知识库</span>
          </div>
        </template>
        <div class="card-content">
          <!-- 图表区 -->
          <div class="chart-container">
            <div ref="knowledgeChart" class="chart"></div>
          </div>
          <!-- 文字描述区 -->
          <p class="card-description">包含谷子种植规范行业标准、研究文献、病虫害症状图像、谷田杂草图像、种植技术指导视频等知识文件。</p>
        </div>
        <!-- 按钮区 -->
        <div class="button-container">
          <el-button size="small" type="primary" class="detail-btn" @click="$router.push('knowledgeBase')">查看详细</el-button>
        </div>
      </el-card>
    </div>

    <!-- 四情监测数据统计抽屉（左侧滑出） -->
    <el-drawer v-model="openStatDrawer" direction="rtl" size="55%" title="四情监测数据统计" destroy-on-close @close="handleDrawerClose">
      <!-- 引入独立组件 -->
      <FourStatistic ref="statComponent" />
    </el-drawer>
  </div>
</template>

<script setup name="OverviewPage" lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud'; // 引入词云扩展
import { Document, PieChart, Sunny, Filter, Histogram, ShoppingCart, Monitor, Share, TrendCharts } from '@element-plus/icons-vue';
import {
  queryFacilityInfo,
  queryKnowledgeData,
  queryPriceTop5Data,
  queryProductionData,
  queryModelLibStat
} from '@/views/four/api/statisticAnalysis/index.js';
import { FacilityData, KnowledgeData, ModelLibStat, OverviewQueryParams } from '@/views/four/api/statisticAnalysis/types';
import { GuZiPriceResponse } from '@/views/four/api/marketInfo/types';
import FourStatistic from '../dataStatistic/index.vue'; // 引入独立组件
// 新增：抽屉相关状态
const openStatDrawer = ref(false);
const statComponent = ref(null); // 组件引用

// 新增：监听抽屉显示状态，打开时触发查询
watch(
  () => openStatDrawer.value,
  (isOpen) => {
    if (isOpen && statComponent.value) {
      // 抽屉打开且组件已实例化，触发查询
      statComponent.value.fetchData();
    }
  }
);

// 抽屉关闭处理
const handleDrawerClose = () => {
  // 调用组件的重置方法
  if (statComponent.value) {
    statComponent.value.resetForm();
  }
};

import useUserStore from '@/store/modules/user';
const userStore = useUserStore();
// 鉴权使用
const targetRoles = ['sysadmin', 'govadmin', 'superadmin', 'allBase'];
// 所有角色都不在目标角色列表中 → 都不包含
const hasNoneTargetRole = userStore.roles.every((role) => !targetRoles.includes(role));

const userRoles = userStore.roles;
const userId = userStore.userId;
const tenantId = userStore.tenantId;

console.log('用户角色', userRoles);
console.log('用户id', userId);
console.log('租户id', tenantId);

// 组装参数对象（关键：统一传递给接口）
const requestParams: OverviewQueryParams = {
  userRoles: userStore.roles, // ['onlyBase']
  userId: userStore.userId, // 1971840392485486600
  tenantId: userStore.tenantId // '000000'
};
console.log('请求参数', requestParams);

// 图表引用
const knowledgeChart = ref(null);
const modelChart = ref(null);
const monitorChart = ref(null);
const nutrientChart = ref(null);
const productionChart = ref(null);
const marketChart = ref(null);
const dashboardChart = ref(null);
const interfaceChart = ref(null);

// 图表实例存储
const chartInstances = ref([]);

// 返回按钮处理
const handleBack = () => {
  // 实际应用中可以使用路由返回
  console.log('返回上一页');
};

// 防抖函数：delay 为延迟时间（ms），默认 300ms
const debounce = (fn: Function, delay = 300) => {
  let timer: number | null = null;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer); // 清除之前的定时器
    timer = window.setTimeout(() => {
      fn.apply(this, args); // 延迟后执行目标函数
      timer = null;
    }, delay);
  };
};

const initChart = (refEl, option) => {
  if (!refEl) return null;

  // 1. 初始化 ECharts 实例（确保首次渲染稳定）
  let chart = echarts.init(refEl);
  chart.setOption(option);
  chartInstances.value.push(chart);

  // 2. 防抖处理 resize 事件（核心优化）
  const handleResize = debounce(() => {
    const { width, height } = refEl.getBoundingClientRect();
    if (width > 0 && height > 0) {
      // 优化：重绘前先清空画布，避免新旧内容叠加
      chart.clear();
      // 重绘时复用原配置，减少参数波动
      chart.setOption(option);
      // 强制同步尺寸
      chart.resize({ width, height });
    }
  }, 20); // 300ms 延迟，可根据需求调整（建议 200-500ms）

  // 3. 监听容器和窗口（双重保障）
  const resizeObserver = new ResizeObserver(handleResize); // 容器变化直接触发防抖函数
  resizeObserver.observe(refEl);
  window.addEventListener('resize', handleResize); // 窗口变化触发防抖函数

  // 4. 组件卸载时清理（避免内存泄漏）
  return () => {
    resizeObserver.disconnect();
    window.removeEventListener('resize', handleResize);
    chart.dispose();
  };
};

// 初始化知识库图表
const knowledgeData = ref<KnowledgeData[]>([]);
const initKnowledgeChart = async () => {
  try {
    // 从后端获取数据
    const res = await queryKnowledgeData();
    knowledgeData.value = res.data;

    const option = {
      tooltip: {
        trigger: 'item',
        // formatter: '{a} <br/>{b}: {d}%'
        formatter: '{a} <br/>{b}: {c} 个'
      },
      legend: {
        show: false
      },
      series: [
        {
          name: '内容类型',
          type: 'pie',
          radius: ['35%', '55%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          /*itemStyle: {
            // borderRadius: 5,
            // borderColor: '#fff',
            // borderWidth: 2,
            color: function (params) {
              // 定义扇形颜色（也可以使用ECharts默认颜色）
              const sectorColors = ['#409eff', '#67c23a', '#fac858'];
              return sectorColors[params.dataIndex];
            }
          },*/
          label: {
            show: true,
            // formatter: ['{a|{b}}', '{b|{c} 个}'].join('\n'),
            formatter: ['{a|{b}}', '{b|{d}%}'].join('\n'),
            rich: {
              a: {
                color: '#333',
                fontSize: 12,
                align: 'left'
              },
              b: {
                color: '#333',
                fontSize: 12,
                lineHeight: 22,
                align: 'left'
              }
            }
          },
          labelLine: {
            show: true,
            length: 10
          },
          data: knowledgeData.value.map((item) => ({
            name: item.fileType, // ECharts 要求的“标签名”字段
            value: item.fileAmount // ECharts 要求的“数值”字段
          })) // 使用从后端获取的数据
        }
      ]
    };

    if (knowledgeChart.value) {
      return initChart(knowledgeChart.value, option);
    }
  } catch (error) {
    console.error('获取知识库数据失败:', error);
  }
};

// 初始化模型库图表
const modelLibStat = ref<ModelLibStat>({
  modelCount: 0,
  datasetCount: 0,
  datasetSize: '0GB'
});

const initModelLib = async () => {
  const res = await queryModelLibStat();
  modelLibStat.value = res.data;
  // 返回空清理函数即可，这里无 canvas
  return () => {};
};

const initModelChart = () => {
  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 15,
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'category',
      data: ['数据集', '决策模型'],
      axisLabel: {
        interval: 0,
        rotate: 0
      },
      splitLine: {
        show: false
      }
    },
    series: [
      {
        data: [13, 11],
        type: 'bar',
        itemStyle: {
          color: function (params) {
            const colorList = ['#409eff', '#67c23a'];
            return colorList[params.dataIndex];
          }
        },
        label: {
          show: true,
          position: 'right'
        }
      }
    ]
  };

  return initChart(modelChart.value, option);
};

// 初始化植株本体数据图表（词云版本）
const initMonitorChart = () => {
  // 1. 准备词云数据：格式为 [{ name: '关键词', value: 权重（数值越大，字体越大）}]
  // 可根据实际业务数据生成（例如从后端接口获取）
  const wordCloudData = [
    { name: 'LAI', value: 50 },
    { name: 'SPAD', value: 55 }
    // { name: '虫情数据', value: 30 },
    // { name: '杀虫灯数据', value: 27 },
    // { name: '四情监测设备', value: 20 },
    // { name: '生境监测数据', value: 25 }
  ];

  const option = {
    tooltip: {
      // 鼠标悬浮时显示关键词和权重
      formatter: (params: any) => `${params.name}权重: ${params.value}`
    },
    series: [
      {
        type: 'wordCloud', // 图表类型：词云（由扩展组件提供）
        name: '植株本体数据词云', // 系列名称（用于tooltip显示）

        // 词云的绘制范围（相对于容器的百分比或像素值）
        left: '5%',
        top: '5%',
        right: '5%',
        bottom: '5%',
        width: '90%',
        height: '90%',

        // 词云核心配置
        sizeRange: [30, 35], // 词语字体大小范围（最小12px，最大60px）// 核心优化：降低最小字体，缩小字体范围，让小权重词语也能显示
        rotationRange: [-45, 45], // 词语旋转角度范围（-45°到45°）
        rotationStep: 45, // 旋转角度的步长（仅允许45°的倍数）
        gridSize: 10, // 词语之间的间距（像素）
        drawOutOfBound: false, // 是否允许词语超出绘制范围（建议关闭）
        layoutAnimation: false, // 关闭布局动画，避免动态隐藏

        // 词语的颜色配置（支持数组、回调函数）
        textStyle: {
          color: (params: any) => {
            // 自定义颜色逻辑：根据权重动态分配颜色
            const colors = ['#58a55c', '#5087ec', '#d95040', '#ee752f', '#f2bd42', '#68bbc4'];
            return colors[params.dataIndex % colors.length];
          }
        },

        // 词云数据（必填，格式：[{name, value}]）
        data: wordCloudData,

        // 可选：词语点击事件（如需交互）
        emphasis: {
          focus: 'self',
          textStyle: {
            shadowBlur: 10, // 点击时的阴影效果
            shadowColor: '#333'
          }
        }
      }
    ]
  };

  // 初始化图表（与原逻辑一致，确保 monitorChart.value 是DOM容器）
  return initChart(monitorChart.value, option);
};

// 初始化土壤基础养分图表
// 词云版
const initNutrientChart = () => {
  // 1. 准备词云数据：格式为 [{ name: '关键词', value: 权重（数值越大，字体越大）}]
  // 可根据实际业务数据生成（例如从后端接口获取）
  const wordCloudData = [
    { name: '速效钾', value: 35 },
    { name: '有效磷', value: 45 },
    { name: '缓效钾', value: 30 },
    { name: '有机质', value: 27 },
    { name: '全氮', value: 20 },
    { name: '酸碱度', value: 25 }
  ];

  const option = {
    tooltip: {
      // 鼠标悬浮时显示关键词和权重
      formatter: (params: any) => `${params.name}权重: ${params.value}`
    },
    series: [
      {
        type: 'wordCloud', // 图表类型：词云（由扩展组件提供）
        name: '土壤基础养分词云', // 系列名称（用于tooltip显示）

        // 词云的绘制范围（相对于容器的百分比或像素值）
        left: '5%',
        top: '5%',
        right: '5%',
        bottom: '5%',
        width: '90%',
        height: '90%',

        // 词云核心配置
        sizeRange: [15, 25], // 词语字体大小范围（最小12px，最大60px）// 核心优化：降低最小字体，缩小字体范围，让小权重词语也能显示
        rotationRange: [-45, 45], // 词语旋转角度范围（-45°到45°）
        rotationStep: 45, // 旋转角度的步长（仅允许45°的倍数）
        gridSize: 15, // 词语之间的间距（像素）
        drawOutOfBound: false, // 是否允许词语超出绘制范围（建议关闭）
        layoutAnimation: false, // 关闭布局动画，避免动态隐藏

        // 词语的颜色配置（支持数组、回调函数）
        textStyle: {
          color: (params: any) => {
            // 自定义颜色逻辑：根据权重动态分配颜色
            const colors = ['#4786b4', '#4e9c8f', '#d97559', '#e4c477', '#2e4552', '#daa67b'];
            return colors[params.dataIndex % colors.length];
          }
        },

        // 词云数据（必填，格式：[{name, value}]）
        data: wordCloudData,

        // 可选：词语点击事件（如需交互）
        emphasis: {
          focus: 'self',
          textStyle: {
            shadowBlur: 10, // 点击时的阴影效果
            shadowColor: '#333'
          }
        }
      }
    ]
  };

  return initChart(nutrientChart.value, option);
};

// 初始化生产过程图表（表格样式）
const initProductionChart = async () => {
  try {
    // 调用后端接口获取年度生成过程数据
    const res = await queryProductionData(requestParams);
    const pro: Record<string, number> = res.data;
    console.log('请求后端接口', res.data);
    console.log('请求后端接口', pro);

    // 生产数据 - 可根据实际数据替换
    const productionData = {
      year: pro.year ? `${pro.year}年` : `${new Date().getFullYear()}年`,
      items: [
        { label: '施肥量', value: `${pro.fertilizer || 0}公斤` },
        { label: '喷药量', value: `${pro.pesticide || 0}毫升` },
        { label: '灌溉量', value: `${pro.irrigation || 0}方` },
        { label: '产量', value: `${pro.yield || 0}公斤` }
      ]
    };

    const option = {
      // 关闭不需要的默认组件
      tooltip: { show: false },
      legend: { show: false },
      xAxis: { show: false },
      yAxis: { show: false },
      // 调整网格边距，为内容留出空间
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        containLabel: true
      },
      series: [
        {
          type: 'custom',
          // 关键：使用绝对坐标计算位置
          renderItem: (params, api) => {
            // 获取图表容器尺寸（用于精确计算位置）
            const containerWidth = api.getWidth();
            const containerHeight = api.getHeight();

            // 基础间距和尺寸配置
            const basePadding = 20; // 整体内边距
            const rowHeight = 30; // 每行高度
            const yearWidth = 70; // 年份区域宽度
            const lineLength = containerWidth - yearWidth - basePadding * 4; // 下划线长度

            // 年份文本
            const yearText = {
              type: 'text',
              x: basePadding,
              y: containerHeight / 2, // 垂直居中
              style: {
                text: productionData.year,
                fontSize: 14,
                // fontWeight: 'bold',
                fill: '#333',
                textVerticalAlign: 'middle' // 垂直居中对齐
              }
            };

            // 表格行和下划线
            const tableElements = [];
            productionData.items.forEach((item, index) => {
              // 计算每行的垂直位置（从顶部往下排列）
              const rowY = basePadding + (index + 1) * rowHeight;

              // 左侧标签
              tableElements.push({
                type: 'text',
                x: yearWidth + basePadding,
                y: rowY,
                style: {
                  text: item.label,
                  fontSize: 12,
                  fill: '#666',
                  textVerticalAlign: 'middle'
                }
              });

              // 右侧数值
              tableElements.push({
                type: 'text',
                x: yearWidth + basePadding + 80, // 固定标签宽度，确保数值对齐
                y: rowY,
                style: {
                  text: item.value,
                  fontSize: 12,
                  fill: '#333',
                  // fontWeight: 500,
                  textVerticalAlign: 'middle'
                }
              });

              // 下划线（分隔线）
              tableElements.push({
                type: 'line',
                shape: {
                  x1: yearWidth + basePadding,
                  y1: rowY + 10, // 文本下方10px
                  x2: yearWidth + basePadding + lineLength, // 延伸到右侧
                  y2: rowY + 10
                },
                style: {
                  stroke: '#e5e7eb', // 浅灰色下划线
                  lineWidth: 1,
                  lineDash: [0] // 实线
                }
              });
            });

            // 组合所有元素
            return {
              type: 'group',
              children: [yearText, ...tableElements]
            };
          },
          data: [1] // 触发渲染的必要数据
        }
      ]
    };

    return initChart(productionChart.value, option);
  } catch (error) {
    console.error('获取生产过程数据失败:', error);
  }
};

// 初始化市场行情图表
const marketData = ref<GuZiPriceResponse[]>([]);
const initMarketChart = async () => {
  try {
    // 调用后端接口获取今日谷子价格TOP5数据
    const res = await queryPriceTop5Data();
    marketData.value = res.data || []; // 确保数据默认是空数组

    // 新增判断：如果接口成功但无数据，使用降级方案
    if (marketData.value.length === 0) {
      console.warn('接口调用成功，但未返回数据，使用默认数据');
      return initChart(marketChart.value, getMarketChartDefaultOption());
    }

    // 提取省份和价格数据（根据后端返回格式调整）
    const areas = marketData.value.map((item) => item.area);
    const prices = marketData.value.map((item) => item.price);

    const option = {
      title: {
        text: `今日谷子市场价格`,
        left: 'center',
        // bottom: 0, // 距离底部0px（最底部），配合grid.bottom为15%使用
        textStyle: {
          fontSize: 12,
          fontWeight: 'normal' // 取消加粗（默认是bold）
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: areas,
        axisLabel: {
          interval: 0,
          rotate: 0,
          fontSize: 12,
          color: '#606266'
        },
        splitLine: {
          show: false // 隐藏X轴网格线，简洁美观
        }
      },
      yAxis: {
        type: 'value',
        name: '价格(元/斤)', // 轴名称，说明数值含义('元/斤       ')
        nameTextStyle: {
          fontSize: 12,
          color: '#606266'
        },
        min: 1.5, // 最小刻度设为1.5，避免数据差异过小导致图表不明显 //min: Math.min(...prices) - 0.5,  // 动态计算最小值
        splitLine: {
          lineStyle: {
            color: '#f0f0f0' // 网格线设为浅灰色，提升可读性
          }
        }
      },
      series: [
        {
          name: '市场价格',
          type: 'bar',
          barWidth: '40%', // 柱子宽度，避免过宽或过窄
          data: prices,
          itemStyle: {
            // color: '#722ed1' // 保持原紫色系，确保风格统一
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            color: '#333' // 标签文字颜色，确保与背景对比清晰
          }
        }
      ]
    };

    return initChart(marketChart.value, option);
  } catch (error) {
    console.error('获取市场价格数据失败:', error);
    // 显示默认数据作为降级方案
    return initChart(marketChart.value, getMarketChartDefaultOption());
  }
};

// 定义市场行情默认数据（降级方案）
const getMarketChartDefaultOption = () => ({
  // ... 保持与上面相同的结构，使用静态数据
  title: {
    text: `今日谷子市场价格`,
    left: 'center',
    // bottom: 0, // 距离底部0px（最底部），配合grid.bottom为15%使用
    textStyle: {
      fontSize: 12,
      fontWeight: 'normal' // 取消加粗（默认是bold）
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['内蒙古', '山西', '河北', '陕西', '辽宁'],
    axisLabel: {
      interval: 0,
      rotate: 0,
      fontSize: 12,
      color: '#606266'
    },
    splitLine: {
      show: false // 隐藏X轴网格线，简洁美观
    }
  },
  yAxis: {
    type: 'value',
    name: '价格(元/斤)', // 轴名称，说明数值含义
    nameTextStyle: {
      fontSize: 12,
      color: '#606266'
    },
    min: 1.5, // 最小刻度设为1.5，避免数据差异过小导致图表不明显 //min: Math.min(...prices) - 0.5,  // 动态计算最小值
    splitLine: {
      lineStyle: {
        color: '#f0f0f0' // 网格线设为浅灰色，提升可读性
      }
    }
  },
  series: [
    {
      name: '市场价格',
      type: 'bar',
      barWidth: '40%', // 柱子宽度，避免过宽或过窄
      data: [2.5, 2.3, 2.1, 1.9, 2.0],
      itemStyle: {
        // color: '#722ed1' // 保持原紫色系，确保风格统一
      },
      label: {
        show: true,
        position: 'top',
        fontSize: 11,
        color: '#333' // 标签文字颜色，确保与背景对比清晰
      }
    }
  ]
});

// 初始化数据看板图表
// 设备信息
const FacilityInfo = ref<FacilityData[]>([]);

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

const initDashboardChart = async () => {
  try {
    let deptId = null;
    if (hasNoneTargetRole) {
      deptId = userStore.deptId;
    }
    const res = await queryFacilityInfo(deptId);
    FacilityInfo.value = res.data;

    // 提取设备类型和数量（根据后端返回格式调整）
    const types = FacilityInfo.value.map((item) => getFacilityTypeName(item.facilityType));
    const amounts = FacilityInfo.value.map((item) => item.online + item.offline + item.fault);

    // 组合成ECharts需要的data格式：[{name: '类型1', value: 数量1}, ...]
    const chartData = types.map((type, index) => ({
      name: type,
      value: amounts[index]
    }));

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} 台'
      },
      legend: {
        show: false // 若需要显示图例，可改为 show: true 并配置 left: 'center'
      },
      series: [
        {
          name: '设备数量',
          type: 'pie',
          radius: [30, 55],
          center: ['50%', '50%'],
          // 关键配置：南丁格尔玫瑰图的面积模式
          roseType: 'area',
          // 扇区样式
          itemStyle: {
            borderRadius: 4, // 扇区边缘圆角
            borderColor: '#fff',
            borderWidth: 2
          },
          // 标签显示
          label: {
            show: true,
            formatter: ['{a|{b}}', '{b|{c} 台}'].join('\n'),
            rich: {
              a: {
                color: '#333',
                fontSize: 12,
                align: 'left'
              },
              b: {
                color: '#333',
                fontSize: 12,
                lineHeight: 22,
                align: 'left'
              }
            },
            position: 'outside',
            fontSize: 12 // 缩小标签字体，防止挤压图表
          },
          labelLine: {
            show: true,
            length: 5, // 缩短标签线，避免超出容器
            length2: 10 // 标签线第二段长度，控制整体延伸范围
          },
          data: chartData
        }
      ]
    };

    if (dashboardChart.value) {
      return initChart(dashboardChart.value, option);
    }
  } catch (error) {
    console.error('获取四情监测设备数据失败:', error);
  }
};

// 初始化星空地监测数据图表
const initInterfaceChart = () => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} GB'
    },
    series: [
      {
        name: '星空地监测数据',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 29.3, name: '无人机遥感影像' },
          { value: 145, name: '卫星遥感影像' },
          { value: 3.7, name: '植株尺度图像' }
        ],
        // 标签显示
        label: {
          show: true,
          formatter: ['{a|{b}}', '{b|{c} GB}'].join('\n'),
          rich: {
            a: {
              color: '#333',
              fontSize: 12,
              align: 'left'
            },
            b: {
              color: '#333',
              fontSize: 12,
              lineHeight: 22,
              align: 'left'
            }
          },
          position: 'outside',
          fontSize: 12 // 缩小标签字体，防止挤压图表
        },
        labelLine: {
          show: true,
          length: 10, // 缩短标签线，避免超出容器
          length2: 20 // 标签线第二段长度，控制整体延伸范围
        }
      }
    ]
  };

  return initChart(interfaceChart.value, option);
};

// 页面挂载时初始化所有图表
onMounted(() => {
  // 使用nextTick确保DOM完全渲染
  nextTick(() => {
    const cleanups = [
      initKnowledgeChart(),
      // initModelChart(),
      initModelLib(),
      initMonitorChart(),
      initNutrientChart(),
      initProductionChart(),
      initMarketChart(),
      initDashboardChart(),
      initInterfaceChart()
    ];

    // 组件卸载时清理图表
    return () => {
      cleanups.forEach((cleanup) => cleanup && cleanup());
      chartInstances.value.forEach((chart) => chart.dispose());
    };
  });
});
</script>

<style scoped>
.data-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4列 */
  grid-template-rows: repeat(2, 1fr); /* 2行 */
  gap: 16px;
  padding: 16px;
  background: #f7f9fc;
}

.data-card {
  height: 100%;
  transition: all 0.3s ease;
  /* 确保卡片有足够高度 */
  min-height: 415px;
  position: relative; /* 确保按钮的绝对定位相对于卡片 */
}

.data-card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  /*transform: translateY(-5px);*/
}

.card-header {
  display: flex;
  align-items: center;
}

.header-icon {
  margin-right: 8px;
  color: #409eff;
  font-size: 18px;
}

.header-title {
  font-weight: 500;
  font-size: 16px;
}

/* 3. 卡片内容区：用 Flex 布局固定按钮位置 */
.card-content {
  display: flex;
  flex-direction: column;
  /* 关键：用固定高度替代 calc，避免父容器尺寸波动导致计算错误 */
  height: 280px; /* 可根据卡片总高度调整，确保 chart-container 有足够空间 */
  position: relative; /* 父容器相对定位，用于按钮绝对定位 */
  padding: 10px; /* 确保 card-content 的内边距一致 */
  box-sizing: border-box; /* 确保内边距不会影响宽度 */
}

/* 关键修复：为图表容器添加明确的宽高 */
.chart-container {
  flex: 1;
  width: 100%;
  /* 关键：添加 min-height 和 max-height，固定容器尺寸范围 */
  min-height: 180px;
  max-height: 220px;
  position: relative;
  background-color: #fff;
  border-radius: 4px;
  display: flex; /* 新增：使用 Flex 布局 */
  justify-content: center; /* 新增：水平居中 */
  align-items: center; /* 新增：垂直居中 */
  /* 防止 ECharts Canvas 溢出容器 */
  overflow: hidden;
}

/* 确保图表元素充满容器 */
.chart {
  width: 100% !important;
  height: 100% !important;
}

/* 文字描述：高度自适应，不影响按钮 */
.card-description {
  font-size: 13px;
  color: #606266;
  margin: 15px 0; /* 调整文字上下间距，避免与其他元素重叠 */
  line-height: 1.5;
  flex: none; /* 文字区不拉伸，高度随内容变化 */
  overflow: hidden; /* 防止内容溢出 */
  text-overflow: ellipsis; /* 显示省略号 */
  display: block; /* 标准的 line-clamp 需要 block 或 inline-block */
  line-clamp: 3; /* 标准的 line-clamp 属性 */
}

/* 4. 查看详细按钮：固定在卡片右下角，距离下边缘距离固定 */
.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: auto; /* 按钮区固定在底部 */
  position: absolute;
  bottom: 0;
  width: calc(100% - 20px); /* 确保宽度与 card-content 一致，减去内边距 */
  padding: 10px; /* 调整内边距，使其与 card-description 一致 */
  box-sizing: border-box; /* 确保内边距不会影响宽度 */
}

.detail-btn {
  margin-bottom: 10px; /* 按钮距离底部的间距 */
  margin-right: 10px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .data-cards {
    grid-template-columns: repeat(3, 1fr); /* 中等屏幕3列 */
  }
}

@media (max-width: 992px) {
  .data-cards {
    grid-template-columns: repeat(2, 1fr); /* 平板2列 */
  }
  .card-content {
    height: 250px; /* 小屏幕缩小卡片内容高度 */
  }
  .chart-container {
    max-height: 190px;
  }
}

@media (max-width: 768px) {
  .data-cards {
    grid-template-columns: 1fr; /* 手机1列 */
  }
  .card-content {
    height: 220px;
  }
  .chart-container {
    max-height: 160px;
  }
}

/* 模型库信息容器：横向排列三个模块 */
.model-info {
  display: flex;
  justify-content: space-between; /* 横向均匀分布 */
  align-items: center; /* 垂直居中 */
  height: 100%; /* 占满父容器高度 */
  width: 100%; /* 确保宽度占满父容器 */
  padding: 0 10px; /* 添加左右内边距，避免内容紧贴边缘 */
}

/* 单个模块：包含标签和值 */
.model-item {
  display: flex;
  flex-direction: column; /* 标签和值垂直排列 */
  align-items: flex-start; /* 左对齐 */
}

/* 模块标签（如“决策模型”“数据集”） */
.model-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

/* 模块值（图标+数量） */
.model-value {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 左对齐 */
}

/* 模块图标 */
.model-icon {
  font-size: 45px;
  margin-right: 1px;
  color: #5087ec;
}

/* 模块图标 */
.data-icon {
  font-size: 45px;
  margin-right: 1px;
  color: #58a55c;
}

/* 模块数量文字 */
.model-count {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-top: 15px;
}

/* 新增统计按钮样式 */
.stat-btn {
  margin-bottom: 10px;
  margin-right: 10px;
}
</style>
