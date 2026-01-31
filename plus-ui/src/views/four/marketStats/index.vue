<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <!-- 地区选择 -->
            <el-form-item label="地区" prop="area">
              <el-select v-model="queryParams.area" placeholder="请选择或输入地区" clearable filterable>
                <el-option v-for="dict in market_area" :key="dict.value" :label="dict.label" :value="dict.label" />
              </el-select>
            </el-form-item>
            <!-- 时间范围选择 -->
            <el-form-item label="时间范围">
              <el-select v-model="queryParams.dateType">
                <el-option label="近一月" :value="30" />
                <el-option label="近半年" :value="180" />
                <el-option label="近一年" :value="365" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <!-- 查询结果容器 -->
    <el-row>
      <!-- 左侧价格极值 -->
      <el-col :span="6" class="card-box">
        <el-card shadow="hover">
          <template #header>
            <span>查询结果</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium" style="height: 420px">
            <!-- 时间范围 -->
            <div class="query-section">
              <span class="icon">🕐</span> 时间范围
              <div class="timeRange" style="margin-top: 8px; font-size: 14px">{{ startDate }} 至 {{ endDate }}</div>
            </div>

            <!-- 虚线分隔 -->
            <hr class="divider" />
            <!-- 最大指标值 -->
            <div class="query-section">
              <span class="icon">📈</span> 最高价格: <span class="price">{{ maxPrice.price }}元/斤</span>
              <div class="details">地区：{{ maxPrice.area }}</div>
              <div class="details">品类：{{ maxPrice.category }}</div>
              <div class="details">时间：{{ maxPrice.dataTime }}</div>
            </div>

            <!-- 虚线分隔 -->
            <hr class="divider" />
            <!-- 最小指标值 -->
            <div class="query-section">
              <span class="icon">📉</span> 最低价格: <span class="price">{{ minPrice.price }}元/斤</span>
              <div class="details">地区：{{ minPrice.area }}</div>
              <div class="details">品类：{{ minPrice.category }}</div>
              <div class="details">时间：{{ minPrice.dataTime }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧面积图 -->
      <el-col :span="18">
        <el-card shadow="hover">
          <template #header>
            <span>谷子价格走势</span>
          </template>
          <div ref="chartRef" style="height: 420px; width: 100%"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="MarketStats" lang="ts">
import * as echarts from 'echarts';
import { getPriceExtremes, getPriceTrend } from '../api/marketInfo';
import { format, subDays } from 'date-fns';
import { EChartsOption } from 'echarts';
import { GuZiPriceResponse } from '@/views/four/api/marketInfo/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { market_area } = toRefs<any>(proxy?.useDict('market_area'));
const showSearch = ref(true);
const queryParams = ref({
  area: '陕西',
  dateType: 30
});
const endDate = format(new Date(), 'yyyy-MM-dd'); // 当前日期
const startDate = format(subDays(endDate, queryParams.value.dateType), 'yyyy-MM-dd'); // 开始日期
const chartRef = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts;

const maxPrice = ref({ dataTime: '', area: '', category: '', price: 0 });
const minPrice = ref({ dataTime: '', area: '', category: '', price: 0 });

// 定义 ResizeObserver 实例变量
let resizeObserver: ResizeObserver | null = null;

const loadLeft = async () => {
  try {
    const res = await getPriceExtremes({
      area: queryParams.value.area,
      dateType: queryParams.value.dateType
    });
    // 处理空数据场景，使用空对象而非null，避免模板报错
    maxPrice.value = res.data.max || { dataTime: '', area: '', category: '', price: 0 };
    minPrice.value = res.data.min || { dataTime: '', area: '', category: '', price: 0 };

    // 可以添加空数据提示
    if (!res.data.max || !res.data.min) {
      proxy?.$modal.msg('该条件下暂无数据');
    }
  } catch (error) {
    // 捕获其他异常
    console.error('查询失败', error);
  }
};

const loadRight = async () => {
  const res = await getPriceTrend({
    area: queryParams.value.area,
    dateType: queryParams.value.dateType
  });
  // 渲染面积图
  renderChart(res.data);
  await nextTick(() => chartInstance?.resize());
};

const renderChart = (list: GuZiPriceResponse[]) => {
  if (!chartRef.value) return;

  // 1. 初始化或复用实例
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
    initResizeObserver();
  }

  // 2. 组装数据
  const xData = list.map((item) => item.dataTime);
  const yData = list.map((item) => item.price);

  // 3. 配置项
  const option: EChartsOption = {
    dataZoom: [
      {
        type: 'slider', // 滑块型缩放组件
        start: 0, // 初始缩放开始位置（0-100）
        end: 100, // 初始缩放结束位置（0-100）
        height: 15, // 组件高度
        bottom: 7 // 距离底部距离
      },
      {
        type: 'inside', // 内置型缩放（鼠标拖拽）
        zoomLock: true // 锁定缩放比例（锁定后鼠标滚轮不再支持缩放）
      }
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const [p] = params;
        return `${p.axisValue}<br/>${p.seriesName}: ${p.value} 元/斤`;
      }
    },
    grid: {
      left: '4%', // 用百分比，适配不同宽度
      right: '4%',
      top: '10%',
      bottom: '10%',
      containLabel: true // 确保grid包含标签，防止标签超出grid范围
    },
    xAxis: {
      type: 'category',
      boundaryGap: true, // 改为true，让首尾标签与边缘保留间隙（原配置为false可能导致标签贴边被截断）
      data: xData
    },
    yAxis: {
      type: 'value',
      name: '价格（元/斤）'
    },
    series: [
      {
        name: '均价',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: {
          width: 2,
          color: '#5B8FF9' // 明确设置线的颜色
        },
        itemStyle: {
          color: '#FFFFFF', // 点内部填充色（白色）
          borderColor: '#5B8FF9', // 点边缘颜色（浅蓝色）
          borderWidth: 1 // 边缘宽度（建议1-2px）
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(80, 141, 255, 0.5)' },
            { offset: 1, color: 'rgba(80, 141, 255, 0.1)' }
          ])
        },
        data: yData
      }
    ]
  };

  // 4. 渲染
  chartInstance.setOption(option, true);
};

/** 初始化 ResizeObserver 监听图表容器 */
const initResizeObserver = () => {
  if (!chartRef.value) return;

  // 创建 ResizeObserver 实例，监听容器尺寸变化
  resizeObserver = new ResizeObserver((entries) => {
    // 遍历所有变化的元素（这里只关注图表容器）
    entries.forEach((entry) => {
      // 当容器尺寸变化时，触发图表重绘
      if (chartInstance) {
        chartInstance.resize();
      }
    });
  });

  // 开始监听图表容器
  resizeObserver.observe(chartRef.value);
};

/** 搜索按钮操作 */
const handleQuery = () => {
  loadLeft();
  loadRight();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {
    area: '陕西',
    dateType: 30
  };
  loadLeft();
  loadRight();
};

onMounted(() => {
  loadLeft();
  loadRight();
});

onBeforeUnmount(() => {
  // 销毁 ResizeObserver 实例，避免内存泄漏
  if (resizeObserver && chartRef.value) {
    resizeObserver.unobserve(chartRef.value);
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  // 销毁图表实例
  chartInstance?.dispose();
});
</script>

<style scoped>
.query-section {
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 10px; /* 减小内边距 */
}

.icon {
  font-size: 14px;
  margin-right: 4px;
}

.price {
  color: #f5222d;
  font-weight: bold;
  display: inline-block; /* 确保价格在同一行 */
  margin-bottom: 10px; /* 为价格添加下边距 */
}

.details {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.divider {
  border-top: 1px dashed #ccc;
  margin: 20px 0;
}
</style>
