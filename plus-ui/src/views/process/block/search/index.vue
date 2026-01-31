<!-- TraceabilityDetail.vue -->
<template>
  <div class="traceability-container">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>{{ dynamicTitle }}</h1>
        <p>{{ plotInfo }}</p>
        <p>来自{{ baseInfo }}的优质谷物 · 全程可追溯</p>
      </div>

      <!-- Navigation - 完全保留您的原生实现 -->
      <div class="nav-tabs">
        <button class="nav-tab" :class="{ active: activeTab === 'trace' }" @click="activeTab = 'trace'">溯源信息</button>
        <button class="nav-tab" :class="{ active: activeTab === 'origin' }" @click="activeTab = 'origin'">产地介绍</button>
      </div>

      <!-- Content -->
      <transition name="fade" mode="out-in">
        <!-- 溯源信息 -->
        <div v-if="activeTab === 'trace'" class="content-section" key="trace">
          <h2 class="section-title">生产全过程追溯</h2>

          <!-- 完全复用您原有的时间轴结构 -->
          <div class="timeline">
            <div class="timeline-item" v-for="(item, index) in traceData" :key="index">
              <div class="timeline-content">
                <!-- 使用 item.time 作为日期，typeName 作为标题，content 作为描述 -->
                <div class="timeline-date">{{ item.time }}</div>
                <div class="timeline-title">{{ item.typeName }}</div>
                <div class="timeline-desc" v-html="item.content"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 产地介绍 -->
        <div v-else class="content-section" key="origin">
          <h2 class="section-title">侯家沟村产地介绍</h2>

          <!-- 产地风光图片 -->
          <div class="origin-image">
            <!-- TODO: 图片路径需要根据您的项目结构调整 -->
            <!-- <img src="/images/chande.jpg" alt="侯家沟村梯田风光" class="landscape-img" /> -->
            <div class="image-caption">侯家沟村梯田风光 - 陕北黄土高原特色地貌</div>
          </div>

          <div class="info-grid">
            <!-- 使用 el-card 替换原生卡片 -->
            <el-card class="info-card">
              <h3 class="card-title">地理方位</h3>
              <div class="info-item">
                <span class="info-label">位置：</span>
                <span class="info-value">米脂县城东南25公里处</span>
              </div>
              <div class="info-item">
                <span class="info-label">总土地面积：</span>
                <span class="info-value">7.2平方公里</span>
              </div>
            </el-card>

            <el-card class="info-card">
              <h3 class="card-title">地貌地形</h3>
              <div class="info-item">
                <span class="info-label">地貌类型：</span>
                <span class="info-value">陕北黄土地貌</span>
              </div>
              <div class="info-item">
                <span class="info-label">地形特点：</span>
                <span class="info-value">沟壑纵横</span>
              </div>
            </el-card>

            <el-card class="info-card">
              <h3 class="card-title">土地资源</h3>
              <div class="info-item">
                <span class="info-label">耕地面积：</span>
                <span class="info-value">3100亩</span>
              </div>
              <div class="info-item">
                <span class="info-label">人均耕地：</span>
                <span class="info-value">2.4亩</span>
              </div>
              <div class="info-item">
                <span class="info-label">退耕还林：</span>
                <span class="info-value">580亩</span>
              </div>
            </el-card>

            <el-card class="info-card">
              <h3 class="card-title">森林资源</h3>
              <div class="info-item">
                <span class="info-label">林地面积：</span>
                <span class="info-value">1790亩</span>
              </div>
            </el-card>
          </div>

          <!-- 土特产品 -->
          <el-card class="info-card" style="margin-top: 25px">
            <h3 class="card-title">土特产品</h3>
            <div class="product-list">
              <div class="product-item" v-for="product in products" :key="product.name">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-details">{{ product.details }}</div>
              </div>
            </div>
          </el-card>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, getCurrentInstance, toRefs, ComponentInternalInstance } from 'vue';
import { useRoute } from 'vue-router';
// 导入封装好的 API 函数
import { getTraceInfo } from '@/views/process/api/block/info/index';
import { da } from 'element-plus/es/locale/index.mjs';

// 从路由中获取溯源码
const route = useRoute();
const traceCode = computed(() => route.params.traceCode as string);

// 响应式数据
const activeTab = ref('trace');
const dynamicTitle = ref('农产品溯源');
const baseInfo = ref('侯家沟村');
const plotInfo = ref('地块：侯家沟001号');
const products = ref([
  {
    name: '山地谷子',
    details: '种植面积：600亩，年产量约20万斤'
  },
  {
    name: '山地苹果',
    details: '种植面积：340亩，年产量约15万斤'
  }
]);

// 用于存储溯源数据 - 现在使用与 sortedEvents 一致的结构
const traceData = ref<
  {
    time: string;
    typeName: string;
    content: string;
  }[]
>([]);

// 获取溯源详情的函数
const fetchTraceabilityData = async (code: string) => {
  try {
    // 调用封装好的 API
    const res = await getTraceInfo(code);
    if (res && res.code === 200) {
      const data = res.data;
      console.log('data:', data);

      // 根据 API 返回的数据结构更新页面信息
      dynamicTitle.value = `${data.plantingBo.seedInfo}农产品溯源`;
      plotInfo.value = `${data.plantingBo.plotInfo} · 地块：${data.plantingBo.plotInfo}`;
      baseInfo.value = `${data.plantingBo.plotInfo}`;

      // 构建时间轴数据 - 与 sortedEvents 逻辑保持一致
      const events: {
        time: string;
        typeName: string;
        content: string;
      }[] = [];

      // 1. 处理种植信息
      if (data.plantingBo) {
        const planting = data.plantingBo;
        events.push({
          time: planting.sowingTime,
          typeName: '播种作业',
          content: `品种名称：${planting.seedInfo}<br/>`
        });
      }

      // 2. 处理施肥信息
      if (data.fertilizationBoList?.length) {
        data.fertilizationBoList.forEach((item) => {
          events.push({
            time: item.fertilizationTime,
            typeName: '施肥作业',
            content: `肥料名称：${item.fertilizerName}<br/>
                                 施肥量：${item.fertilizerDosage || '无'} kg/亩<br/>
                                 施肥方式：${item.fertilizationMethod || '未知方式'}<br/>`
          });
        });
      }

      // 3. 处理农药信息
      if (data.pesticideBoList?.length) {
        data.pesticideBoList.forEach((item) => {
          events.push({
            time: item.pesticideTime,
            typeName: '农药作业',
            content: `农药名称：${item.pesticideName}<br/>
                                 打药计量：${item.pesticideDosage || '无'} ml/亩<br/>`
          });
        });
      }

      // 4. 处理灌溉信息
      if (data.irrigationBoList?.length) {
        data.irrigationBoList.forEach((item) => {
          events.push({
            time: item.irrigationDate,
            typeName: '灌溉作业',
            content: `灌溉方式：${item.irrigationMethod}<br/>`
          });
        });
      }

      // 5. 处理收获信息
      if (data.harvestBo) {
        const harvest = data.harvestBo;
        events.push({
          time: harvest.harvestTime,
          typeName: '收获',
          content: ``
        });
      }

      // 按时间升序排序（最早的在上面）
      events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      traceData.value = events;
    } else {
      // 处理 API 返回错误
      console.warn('未找到相关溯源信息或查询失败:', res?.msg || 'Unknown error');
      // 可以在这里使用 ElMessage 显示错误
      // ElMessage.error(res?.msg || '查询失败');
    }
  } catch (error) {
    console.error('Failed to fetch traceability data:', error);
    // 可以在这里使用 ElMessage 显示错误
    // ElMessage.error('网络错误，请稍后重试');
  }
};

// 辅助函数：从地块信息中提取基地信息
// 例如：输入 "侯家沟001号"，输出 "侯家沟"
const getBaseInfoFromPlot = (plotInfo: string): string => {
  if (!plotInfo) return '';

  // 使用正则表达式匹配第一个数字出现的位置
  const match = plotInfo.match(/\d/);
  if (match) {
    // 截取从开始到第一个数字之前的部分
    return plotInfo.substring(0, match.index);
  }

  // 如果没有找到数字，则返回原字符串（或根据需要返回空字符串）
  return plotInfo;
};

// 监听路由参数变化，并立即执行
watch(
  traceCode,
  (newCode) => {
    if (newCode) {
      fetchTraceabilityData(newCode);
    } else {
      // 如果路由参数为空，可以重置数据或显示提示
      traceData.value = [];
      console.warn('未提供溯源码');
    }
  },
  { immediate: true }
);

// 动态设置页面标题
watch([dynamicTitle, baseInfo, plotInfo], ([newTitle, newBase, newPlot]) => {
  document.title = `${newTitle} - ${newBase} ${newPlot}`;
});
</script>

<style scoped>
.traceability-container {
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 10px;
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 5px;
}

/* --- 完全保留您的导航栏样式 --- */
.nav-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 5px;
  backdrop-filter: blur(10px);
}

.nav-tab {
  padding: 15px 30px;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
}

.nav-tab.active {
  background: white;
  color: #4caf50;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* --- 导航栏样式结束 --- */

.content-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 30px;
  color: #2d3748;
}

/* --- 完全复用您的时间轴样式 --- */
.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #4caf50, #2e7d32);
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
  padding-left: 40px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4caf50;
  border: 3px solid white;
  box-shadow: 0 0 0 3px #4caf50;
}

.timeline-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #4caf50;
  /* 确保是绿色 */
}

/* --- 时间轴样式结束 --- */

.timeline-date {
  color: #4caf50;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.timeline-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2d3748;
}

.timeline-desc {
  color: #4a5568;
  line-height: 1.6;
}

/* 产地图片样式 */
.origin-image {
  margin-bottom: 40px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  position: relative;
}

.landscape-img {
  width: 100%;
  height: 350px;
  object-fit: cover;
  border-radius: 15px;
  transition: transform 0.3s ease;
}

.origin-image:hover .landscape-img {
  transform: scale(1.02);
}

.image-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 30px 25px 20px;
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
  backdrop-filter: blur(5px);
}

/* --- 覆盖 el-card 的样式 --- */
:deep(.el-card__body) {
  padding: 0;
  /* 移除 el-card 默认内边距，使用我们自己的 */
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.info-card {
  background: linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%);
  padding: 25px;
  border-radius: 15px;
  border: 1px solid #e2e8f0;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 15px;
  border-bottom: 2px solid #4caf50;
  padding-bottom: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #4a5568;
  font-weight: 500;
}

.info-value {
  color: #2d3748;
  font-weight: 600;
}

.product-list {
  margin-top: 15px;
}

.product-item {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  border-left: 4px solid #48bb78;
}

.product-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
}

.product-details {
  color: #4a5568;
  font-size: 0.9rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .header h1 {
    font-size: 2rem;
  }

  .content-section {
    padding: 25px;
  }

  .nav-tabs {
    flex-direction: column;
    border-radius: 15px;
  }

  .nav-tab {
    border-radius: 10px;
    margin: 2px 0;
  }

  .timeline {
    padding-left: 20px;
  }

  .timeline-item {
    padding-left: 30px;
  }

  .landscape-img {
    height: 250px;
  }

  .image-caption {
    font-size: 1rem;
    padding: 20px 15px 15px;
  }
}
</style>
