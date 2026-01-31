<template>
  <div class="agriculture-dashboard">
    <div class="dashboard-content">
      <!-- 主要内容区域 - 修改为网格布局 -->
      <div class="main-grid-layout">
        <!-- 左侧：基地分布占比 -->
        <div class="chart-card">
          <div class="card-header">
            <span class="header-icon">📊</span>
            <span>基地分布占比</span>
          </div>
          <div class="chart-container">
            <div ref="baseChartRef" class="chart-box"></div>
            <div class="legend-list">
              <div v-for="area in baseAreas" :key="area.name" class="legend-item">
                <span class="legend-dot" :style="{ backgroundColor: area.color }"></span>
                <span class="legend-name">{{ area.name }}</span>
                <span class="legend-value">{{ area.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间：溯源数据统计趋势 -->
        <div class="chart-card trend-card">
          <div class="card-header">
            <span class="header-icon">📈</span>
            <span>溯源数据统计趋势</span>
          </div>
          <div ref="trendChartRef" class="trend-chart"></div>
        </div>

        <!-- 右侧：统计卡片垂直排列 -->
        <div class="stat-cards-vertical">
          <div class="stat-card" v-for="(stat, index) in statCards" :key="index">
            <div class="stat-icon" :style="{ background: stat.color }">
              <span class="icon-text">{{ stat.icon }}</span>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-change">
                <span class="change-tag">↗ {{ stat.change }}</span>
                <span class="change-text">{{ stat.changeText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细信息区域 - 调整网格布局 -->
      <div class="detail-section">
        <!-- 最新更新详情 -->
        <div class="info-card expanded">
          <div class="card-header">
            <span class="header-icon">🕐</span>
            <span>最新更新详情</span>
            <span class="tag-success">实时更新</span>
          </div>
          <div class="update-list">
            <div v-for="update in recentUpdates" :key="update.id" class="update-item">
              <div class="update-dot" :style="{ background: update.color }"></div>
              <div class="update-content">
                <h4>{{ update.title }}</h4>
                <p>{{ update.description }}</p>
                <div class="update-meta">
                  <span class="meta-time">{{ update.time }}</span>
                  <span class="meta-operator">{{ update.operator }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 溯源链条完整性分析 - 扩大宽度 -->
        <div class="info-card expanded trace-chain-card">
          <div class="card-header">
            <span class="header-icon">🔗</span>
            <span>溯源链条完整性分析</span>
            <el-tooltip effect="dark" content="展示每个溯源环节的数据完整性，帮助识别数据录入的薄弱环节" placement="top">
              <span class="help-icon">❓</span>
            </el-tooltip>
          </div>
          <div class="trace-chain-analysis">
            <div class="chain-stats">
              <div class="stat-item">
                <span class="stat-label">完整链条数量</span>
                <span class="stat-value">{{ traceChainStats.completeChains }}</span>
                <span class="stat-desc">占总溯源数{{ Math.round((traceChainStats.completeChains / 1268) * 100) }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">数据完整性</span>
                <span class="stat-value">{{ traceChainStats.dataIntegrity }}%</span>
                <span class="stat-desc">整体数据覆盖率</span>
              </div>
            </div>

            <div class="chain-progress">
              <div v-for="stage in traceChainStages" :key="stage.name" class="stage-item">
                <div class="stage-header">
                  <span class="stage-name">{{ stage.name }}</span>
                  <span class="stage-percent">{{ stage.percent }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: stage.percent + '%', background: stage.color }"></div>
                </div>
                <div class="stage-info">
                  <span class="info-text">{{ stage.complete }}/{{ stage.total }} 条记录</span>
                  <span class="info-status" :class="stage.statusClass">{{ stage.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速操作 - 缩小宽度 -->
        <div class="info-card expanded quick-action-card">
          <div class="card-header">
            <span class="header-icon">⚡</span>
            <span>快速操作</span>
          </div>
          <div class="action-list">
            <div class="action-item" v-for="action in quickActions" :key="action.name" @click="handleQuickAction(action)">
              <div class="action-icon" :style="{ background: action.color }">
                <span>{{ action.emoji }}</span>
              </div>
              <span class="action-name">{{ action.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
import * as echarts from 'echarts';

// 响应式数据
const currentTime = ref('');
const baseChartRef = ref(null);
const trendChartRef = ref(null);
let baseChart = null;
let trendChartInstance = null;
let timer = null;

// 统计卡片数据
const statCards = ref([
  {
    icon: '📊',
    value: '12,934',
    label: '累计溯源记录',
    change: '+247',
    changeText: '较昨日',
    color: 'linear-gradient(135deg, #409EFF 0%, #67C23A 100%)'
  },
  {
    icon: '🔗',
    value: '856',
    label: '完整溯源链条数量',
    change: '+23',
    changeText: '本周新增',
    color: 'linear-gradient(135deg, #E6A23C 0%, #F56C6C 100%)'
  },
  {
    icon: '📈',
    value: '34',
    label: '今日新增数据',
    change: '+8%',
    changeText: '增长率',
    color: 'linear-gradient(135deg, #909399 0%, #C0C4CC 100%)'
  }
]);

// 基地区域数据
const baseAreas = ref([
  { name: '冯渠基地', percentage: 15.5, color: '#409EFF' },
  { name: '高硷村基地', percentage: 12.8, color: '#E6A23C' },
  { name: '侯家沟基地', percentage: 22.1, color: '#67C23A' },
  { name: '侯家沟南基地', percentage: 8.9, color: '#F56C6C' },
  { name: '姜兴庄基地', percentage: 10.3, color: '#909399' },
  { name: '李家寺基地', percentage: 7.6, color: '#ab47bc' },
  { name: '寺沟基地', percentage: 9.2, color: '#26c6da' },
  { name: '杨家沟基地', percentage: 6.7, color: '#66bb6a' },
  { name: '岳岔基地', percentage: 6.9, color: '#ff7043' }
]);

// 最新更新数据
const recentUpdates = ref([
  {
    id: 1,
    title: '侯家沟基地玉米种植记录',
    description: '溯源码：2025hjg001-3847 | 种子信息：先玉335 | 地块信息：侯家沟3号地 | 播种时间：2025-03-15',
    time: '刚刚',
    operator: '操作人：张建华',
    color: '#67C23A'
  },
  {
    id: 2,
    title: '高硷村基地施肥记录',
    description: '溯源码：2025hjg001-9251 | 肥料名称：尿素 | 地块信息：高硷村1号地 | 施肥量：50kg/亩',
    time: '2分钟前',
    operator: '操作人：李明',
    color: '#409EFF'
  },
  {
    id: 3,
    title: '冯渠基地灌溉记录',
    description: '溯源码：2025hjg001-6423 | 灌溉方法：滴灌 | 地块信息：冯渠2号地 | 灌溉日期：2025-07-20',
    time: '5分钟前',
    operator: '操作人：王强',
    color: '#E6A23C'
  },
  {
    id: 4,
    title: '姜兴庄基地打药记录',
    description: '溯源码：2025hjg001-7894 | 农药名称：吡虫啉 | 地块信息：姜兴庄4号地 | 打药计量：1.2L/亩',
    time: '8分钟前',
    operator: '操作人：赵丽',
    color: '#F56C6C'
  },
  {
    id: 5,
    title: '李家寺基地收割记录',
    description: '溯源码：2025hjg001-1357 | 地块信息：李家寺5号地 | 收割时间：2025-09-10',
    time: '12分钟前',
    operator: '操作人：刘伟',
    color: '#909399'
  }
]);

// 溯源链条统计数据
const traceChainStats = ref({
  completeChains: 856,
  maxStages: 7,
  dataIntegrity: 68.04
});

// 溯源环节完成率数据
const traceChainStages = ref([
  {
    name: '种植环节',
    percent: (85600 / 1258).toFixed(2),
    complete: 856,
    total: 1258,
    status: '良好',
    statusClass: 'status-green',
    color: '#67C23A',
    description: '记录种子信息、地块信息、播种时间等'
  },
  {
    name: '施肥环节',
    percent: (85600 / 2486).toFixed(2),
    complete: 856,
    total: 2486,
    status: '良好',
    statusClass: 'status-blue',
    color: '#409EFF',
    description: '记录肥料名称、施肥时间、施肥量等'
  },
  {
    name: '灌溉环节',
    percent: (85600 / 3072).toFixed(2),
    complete: 856,
    total: 3072,
    status: '良好',
    statusClass: 'status-blue',
    color: '#E6A23C',
    description: '记录灌溉方法、灌溉日期等'
  },
  {
    name: '打药环节',
    percent: (85600 / 3571).toFixed(2),
    complete: 856,
    total: 3571,
    status: '正常',
    statusClass: 'status-yellow',
    color: '#F56C6C',
    description: '记录农药名称、打药时间、打药计量等'
  },
  {
    name: '收割环节',
    percent: (85600 / 856).toFixed(2),
    complete: 856,
    total: 856,
    status: '正常',
    statusClass: 'status-yellow',
    color: '#909399',
    description: '记录收割时间、地块信息等'
  }
]);

// 快速操作
const quickActions = ref([
  { name: '溯源信息查询', emoji: '🔍', color: '#409EFF', url: '/process/traceability/info' },
  { name: '责任追溯查询', emoji: '👤', color: '#67C23A', url: '/process/traceability/responsibility' },
  { name: '播种溯源', emoji: '🌱', color: '#E6A23C', url: '/process/traceability/plant' },
  { name: '灌漑溯源', emoji: '💧', color: '#F56C6C', url: '/process/traceability/irrigation' },
  { name: '施肥溯源', emoji: '🌿', color: '#909399', url: '/process/traceability/fertilization' },
  { name: '打药溯源', emoji: '💊', color: '#ab47bc', url: '/process/traceability/pesticide' },
  { name: '收割溯源', emoji: '✂️', color: '#26c6da', url: '/process/traceability/harvest' }
]);

// 方法
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString('zh-CN');
};

// 初始化饼图
const initBaseChart = () => {
  if (baseChartRef.value) {
    baseChartRef.value.innerHTML = `
      <svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
        <circle cx="100" cy="100" r="60" fill="none" stroke="#409EFF" stroke-width="30" stroke-dasharray="31 169" transform="rotate(-90 100 100)"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="#E6A23C" stroke-width="30" stroke-dasharray="25.6 174.4" stroke-dashoffset="-31" transform="rotate(-90 100 100)"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="#67C23A" stroke-width="30" stroke-dasharray="44.2 155.8" stroke-dashoffset="-56.6" transform="rotate(-90 100 100)"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="#F56C6C" stroke-width="30" stroke-dasharray="17.8 182.2" stroke-dashoffset="-100.8" transform="rotate(-90 100 100)"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="#909399" stroke-width="30" stroke-dasharray="20.6 179.4" stroke-dashoffset="-118.6" transform="rotate(-90 100 100)"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="#ab47bc" stroke-width="30" stroke-dasharray="15.2 184.8" stroke-dashoffset="-139.2" transform="rotate(-90 100 100)"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="#26c6da" stroke-width="30" stroke-dasharray="18.4 181.6" stroke-dashoffset="-154.4" transform="rotate(-90 100 100)"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="#66bb6a" stroke-width="30" stroke-dasharray="13.4 186.6" stroke-dashoffset="-172.8" transform="rotate(-90 100 100)"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="#ff7043" stroke-width="30" stroke-dasharray="13.8 186.2" stroke-dashoffset="-186.2" transform="rotate(-90 100 100)"/>
      </svg>
    `;
  }
};

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return;

  if (trendChartInstance) {
    trendChartInstance.dispose();
  }

  trendChartInstance = echarts.init(trendChartRef.value);

  const mockData = [
    { month: '4月', value: 1200 },
    { month: '5月', value: 1900 },
    { month: '6月', value: 1500 },
    { month: '7月', value: 2200 },
    { month: '8月', value: 1800 },
    { month: '9月', value: 2500 }
  ];

  const option = {
    title: {
      text: '月度溯源数据趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#303133'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let tooltipText = params[0].name + '<br/>';
        tooltipText += params[0].marker + params[0].seriesName + ': ' + params[0].value;
        return tooltipText;
      }
    },
    xAxis: {
      type: 'category',
      data: mockData.map((item) => item.month),
      boundaryGap: false,
      axisLine: { show: true, lineStyle: { color: '#DCDFE6' } },
      axisTick: { show: false },
      axisLabel: { color: '#606266' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#EBEEF5'
        }
      },
      axisLabel: { color: '#606266' }
    },
    series: [
      {
        name: '溯源数据量',
        type: 'line',
        data: mockData.map((item) => item.value),
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ]
          }
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  };

  trendChartInstance.setOption(option);

  const handleResize = () => {
    if (trendChartInstance) {
      trendChartInstance.resize();
    }
  };
  window.addEventListener('resize', handleResize);

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (trendChartInstance) {
      trendChartInstance.dispose();
      trendChartInstance = null;
    }
  });
};

const handleQuickAction = (action) => {
  if (action.url) {
    router.push(action.url);
  } else {
    console.warn('No URL defined for action:', action.name);
  }
};

// 生命周期
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);

  nextTick(() => {
    initBaseChart();
    setTimeout(() => {
      initTrendChart();
    }, 0);
  });
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.agriculture-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 16px;
  box-sizing: border-box;
}

/* 修改内容区域为铺满屏幕 */
.dashboard-content {
  width: 100%;
  max-width: 100%;
  height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  gap: 0; /* 移除整体间距，改为单独控制 */
  box-sizing: border-box;
}

/* 主网格布局 - 增大基地分布占比卡片宽度 */
.main-grid-layout {
  display: grid;
  grid-template-columns: 420px 1fr 260px; /* 增大基地分布占比宽度到420px */
  gap: 12px;
  flex: 0.7;
  min-height: 0;
}

/* 统计卡片垂直排列容器 */
.stat-cards-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 调整统计卡片样式 */
.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
  flex: 1;
  width: 100%;
  height: 100px;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 22px;
  color: white;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 6px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 6px;
}

.change-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #f0f9ff;
  color: #409eff;
}

.change-text {
  font-size: 12px;
  color: #909399;
}

/* 图表卡片基础样式 */
.chart-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 340px;
}

/* 调整趋势图卡片宽度 */
.trend-card {
  max-width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  flex-shrink: 0;
}

.header-icon {
  font-size: 20px;
}

.help-icon {
  font-size: 14px;
  color: #909399;
  cursor: help;
  margin-left: auto;
}

/* 饼图容器 - 增大内部间距以适应更宽卡片 */
.chart-container {
  display: flex;
  align-items: center;
  gap: 20px; /* 增大间距 */
  flex: 1;
  min-height: 0;
}

.chart-box {
  width: 200px; /* 略微增大饼图 */
  height: 200px;
  flex-shrink: 0;
}

.legend-list {
  flex: 1;
  overflow: visible;
  max-height: none;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  height: 24px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 8px;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  font-size: 14px; /* 略微增大字体 */
  color: #606266;
}

.legend-value {
  font-size: 14px; /* 略微增大字体 */
  font-weight: bold;
  color: #303133;
  flex-shrink: 0;
}

/* 趋势图 */
.trend-chart {
  flex: 1;
  min-height: 200px;
  overflow: hidden;
  background-color: #fafafa;
  border-radius: 8px;
}

/* 详情区域 - 调整网格布局 */
.detail-section {
  display: grid;
  grid-template-columns: 420px 1fr 260px; /* 修改为与主网格布局相同的列宽 */
  gap: 12px;
  flex: 1.3;
  min-height: 0;
  margin-top: 65px; /* 增加上边距，使第二行整体下移 */
}

/* 溯源链条完整性分析卡片 - 扩大宽度 */
.trace-chain-card {
  /* 继承1fr的宽度，与溯源数据统计趋势卡片保持一致 */
}

/* 快速操作卡片 - 缩小宽度 */
.quick-action-card {
  /* 宽度固定为260px，与统计卡片保持一致 */
}

/* 增加卡片高度 */
.info-card.expanded {
  background: white;
  border-radius: 8px;
  padding: 18px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tag-success {
  margin-left: auto;
  padding: 2px 8px;
  background: #f0f9ff;
  color: #67c23a;
  border-radius: 4px;
  font-size: 12px;
  flex-shrink: 0;
}

/* 更新列表 */
.update-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.update-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  padding: 14px;
  background: #fafafa;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid #f5f7fa;
}

.update-item:hover {
  background: #f5f7fa;
  border-color: #ebeef5;
}

.update-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.update-content {
  flex: 1;
  min-width: 0;
}

.update-content h4 {
  margin: 0 0 6px;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  word-break: break-word;
}

.update-content p {
  margin: 0 0 6px;
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.update-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
  flex-wrap: wrap;
}

/* 溯源链条分析 */
.trace-chain-analysis {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chain-stats {
  display: flex;
  justify-content: space-around;
  gap: 16px;
  margin-bottom: 16px;
  padding: 14px;
  background: #fafafa;
  border-radius: 6px;
  flex-shrink: 0;
}

.stat-item {
  text-align: center;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 3px;
}

.stat-desc {
  display: block;
  font-size: 11px;
  color: #c0c4cc;
}

.chain-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.stage-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f5f7fa;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stage-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.stage-percent {
  font-size: 14px;
  font-weight: bold;
  color: #409eff;
}

.progress-bar {
  height: 6px;
  background: #ebeef5;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stage-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.info-text {
  color: #909399;
}

.info-status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  flex-shrink: 0;
}

/* 状态颜色 */
.status-green {
  background: #f0f9ff;
  color: #67c23a;
}

.status-blue {
  background: #f0f9ff;
  color: #409eff;
}

.status-yellow {
  background: #fdf6ec;
  color: #e6a23c;
}

.status-red {
  background: #fef0f0;
  color: #f56c6c;
}

/* 快速操作 - 调整网格以适应更窄的宽度 */
.action-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 改为2列布局适应更窄宽度 */
  gap: 12px;
  flex: 1;
  align-content: start;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  background: #fafafa;
  border: 1px solid #f5f7fa;
}

.action-item:hover {
  background: #f5f7fa;
  border-color: #ebeef5;
  transform: translateY(-1px);
}

.action-item:hover .action-icon {
  transform: scale(1.05);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  font-size: 20px;
}

.action-name {
  font-size: 13px;
  color: #606266;
  text-align: center;
  word-break: break-word;
}

/* 动画 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}

/* 响应式设计 */
@media screen and (max-width: 1400px) {
  .main-grid-layout {
    grid-template-columns: 380px 1fr 240px;
  }

  .detail-section {
    grid-template-columns: 380px 1fr 240px; /* 保持与主网格一致 */
  }
}

@media screen and (max-width: 1200px) {
  .main-grid-layout {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }

  .stat-cards-vertical {
    grid-column: span 2;
    flex-direction: row;
    order: 1;
  }

  .chart-card:first-of-type {
    order: 2;
  }

  .trend-card {
    order: 3;
  }

  .detail-section {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, 1fr);
    margin-top: 12px; /* 响应式下调整上边距 */
  }
}

@media screen and (max-width: 992px) {
  .main-grid-layout {
    grid-template-columns: 1fr;
  }

  .stat-cards-vertical {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .stat-card {
    flex: 1 1 200px;
  }

  .detail-section {
    margin-top: 10px; /* 响应式下调整上边距 */
  }
}

@media screen and (max-width: 768px) {
  .agriculture-dashboard {
    padding: 12px;
  }

  .dashboard-content {
    height: calc(100vh - 24px);
  }

  .main-grid-layout {
    gap: 8px;
  }

  .detail-section {
    gap: 8px;
    margin-top: 8px; /* 响应式下调整上边距 */
  }

  .stat-cards-vertical {
    flex-direction: column;
  }

  .chart-container {
    flex-direction: column;
  }

  .chart-box {
    width: 100%;
    margin-bottom: 16px;
  }

  .action-list {
    grid-template-columns: repeat(2, 1fr); /* 保持2列布局 */
  }
}

/* 美化滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
</style>
