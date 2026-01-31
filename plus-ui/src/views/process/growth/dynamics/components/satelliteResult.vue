<template>
  <div class="base-results-container">
    <h1 class="title">基地长势监测结果</h1>

    <div class="base-grid">
      <div v-for="(base, index) in baseData" :key="index" class="base-card">
        <div class="base-header">
          <h2>{{ base.name }}</h2>
        </div>

        <div class="indicators-container">
          <!-- LAI指标 -->
          <div class="indicator-card">
            <div class="image-container" @click="openImageDialog(base, 'lai')">
              <img :src="base.laiImage" alt="LAI监测图" class="result-image" />
              <div class="image-overlay">
                <span class="overlay-text">点击放大</span>
              </div>
            </div>
            <div class="indicator-header">
              <span class="indicator-title">叶面积指数(LAI)：</span>
              <span class="indicator-value">{{ base.laiValue }}</span>
            </div>
          </div>

          <!-- SPAD指标 -->
          <div class="indicator-card">
            <div class="image-container" @click="openImageDialog(base, 'spad')">
              <img :src="base.spadImage" alt="SPAD监测图" class="result-image" />
              <div class="image-overlay">
                <span class="overlay-text">点击放大</span>
              </div>
            </div>
            <div class="indicator-header">
              <span class="indicator-title">叶绿素含量(SPAD)：</span>
              <span class="indicator-value">{{ base.spadValue }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片放大对话框 -->
    <el-dialog v-model="imageDialog.visible" :title="imageDialog.title" width="80%" top="5vh" custom-class="image-dialog" @close="closeImageDialog">
      <div class="dialog-content">
        <div class="dialog-image-container">
          <img :src="imageDialog.imageUrl" :alt="imageDialog.title" class="dialog-image" />

          <!-- 左上角信息 -->
          <div class="image-info-top">
            <div class="info-item"><strong>基地:</strong> {{ imageDialog.baseName }}</div>
            <div class="info-item">
              <strong>{{ imageDialog.indicatorType === 'lai' ? 'LAI值' : 'SPAD值' }}:</strong>
              {{ imageDialog.indicatorValue }}
            </div>
          </div>

          <!-- 右下角图例 -->
          <div class="image-legend">
            <div class="legend-title">图例</div>
            <div class="legend-items">
              <div class="legend-item">
                <div class="legend-color" style="background-color: #00ce00"></div>
                <span>良好</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #02fd00"></div>
                <span>正常</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #bae471"></div>
                <span>较差</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #fda400"></div>
                <span>过生长</span>
              </div>
            </div>
          </div>
          <!-- 轮播导航箭头 -->
          <div class="carousel-nav">
            <div class="nav-arrow left-arrow" @click="showPrevImage">
              <el-icon><ArrowLeft /></el-icon>
            </div>
            <div class="nav-arrow right-arrow" @click="showNextImage">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>

          <!-- 图片计数器 -->
          <div class="image-counter">{{ currentImageIndex + 1 }} / {{ allImages.length }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';

// 模拟6个基地的数据
const baseData = ref([
  {
    name: '侯家沟基地',
    laiValue: 1.05,
    laiImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121626514.png',
    spadValue: 36.37,
    spadImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121626205.png'
  },
  {
    name: '侯家沟南基地',
    laiValue: 0.82,
    laiImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121626231.png',
    spadValue: 28.16,
    spadImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121626729.png'
  },
  {
    name: '李家寺基地',
    laiValue: 0.63,
    laiImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121626930.png',
    spadValue: 39.37,
    spadImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121626323.png'
  },
  {
    name: '寺沟基地',
    laiValue: 0.63,
    laiImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121626479.png',
    spadValue: 32.67,
    spadImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121626963.png'
  },
  {
    name: '杨家沟基地',
    laiValue: 1.34,
    laiImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121627409.png',
    spadValue: 33.14,
    spadImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121627024.png'
  },
  {
    name: '岳岔基地',
    laiValue: 1.85,
    laiImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121627193.png',
    spadValue: 35.92,
    spadImage: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507121627646.png'
  }
]);

// 图片对话框状态
const imageDialog = ref({
  visible: false,
  title: '',
  imageUrl: '',
  baseName: '',
  indicatorType: '',
  indicatorValue: ''
});

// 当前显示的图片索引
const currentImageIndex = ref(0);

// 新增计算属性：生成所有图片的扁平化数组
const allImages = computed(() => {
  return baseData.value.flatMap((base) => {
    return [
      {
        baseName: base.name,
        indicatorType: 'lai',
        url: base.laiImage,
        title: '叶面积指数(LAI)监测图',
        indicatorValue: base.laiValue
      },
      {
        baseName: base.name,
        indicatorType: 'spad',
        url: base.spadImage,
        title: '叶绿素含量(SPAD)监测图',
        indicatorValue: base.spadValue
      }
    ];
  });
});

// 优化后的 openImageDialog 方法
const openImageDialog = (base, type) => {
  const index = allImages.value.findIndex((img) => img.baseName === base.name && img.indicatorType === type);

  if (index !== -1) {
    currentImageIndex.value = index;
    imageDialog.value.visible = true;
  }
};

// 更新对话框内容
const updateDialogContent = (index) => {
  const img = allImages.value[index];
  imageDialog.value = {
    visible: true,
    title: img.title,
    imageUrl: img.url,
    baseName: img.baseName,
    indicatorType: img.indicatorType,
    indicatorValue: img.indicatorValue
  };
};

// 显示下一张图片
const showNextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % allImages.value.length;
  updateDialogContent(currentImageIndex.value);
};

// 显示上一张图片
const showPrevImage = () => {
  currentImageIndex.value = (currentImageIndex.value - 1 + allImages.value.length) % allImages.value.length;
  updateDialogContent(currentImageIndex.value);
};

// 关闭图片对话框
const closeImageDialog = () => {
  imageDialog.value.visible = false;
};
</script>

<style scoped>
.base-results-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 1.8rem;
}

.base-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 25px;
}

.base-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s ease;
}

.base-card:hover {
  transform: translateY(-5px);
}

.base-header {
  text-align: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.base-header h2 {
  margin: 0;
  color: #34495e;
  font-size: 1.4rem;
}

.indicators-container {
  display: flex;
  gap: 20px;
}

.indicator-card {
  flex: 1;
  min-width: 0;
}

.indicator-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.indicator-title {
  font-weight: 600;
  color: #3498db;
  font-size: 1.1rem;
}

.indicator-value {
  font-weight: bold;
  font-size: 1.2rem;
  color: #27ae60;
}

.image-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  border: 1px solid #eee;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.image-container:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.result-image {
  width: 100%;
  height: 250px;
  display: block;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.overlay-text {
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* 对话框样式 */
.dialog-content {
  position: relative;
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-image-container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
}

.dialog-image {
  max-width: 100%;
  max-height: 65vh;
  display: block;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.image-info-top {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(255, 255, 255, 0.85);
  padding: 10px 15px;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.info-item {
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.image-legend {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.85);
  padding: 10px 15px;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  min-width: 200px;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.legend-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 3px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .base-grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
}

@media (max-width: 900px) {
  .base-grid {
    grid-template-columns: 1fr;
  }

  .indicators-container {
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .base-card {
    padding: 15px;
  }

  .base-header h2 {
    font-size: 1.2rem;
  }

  .indicator-title {
    font-size: 1rem;
  }

  .indicator-value {
    font-size: 1.1rem;
  }

  .result-image {
    height: 200px;
  }

  .dialog-image {
    max-height: 50vh;
  }

  .image-info-top,
  .image-legend {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    margin: 10px 0;
  }
}
</style>

<style>
/* 全局对话框样式 */
.image-dialog .el-dialog__header {
  background: linear-gradient(to right, #3498db, #2c3e50);
  margin: 0;
  padding: 15px 20px;
  border-radius: 8px 8px 0 0;
}

.image-dialog .el-dialog__title {
  color: white;
  font-weight: bold;
  font-size: 1.4rem;
}

.image-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 1.5rem;
}

.image-dialog .el-dialog__body {
  padding: 20px;
  background-color: #f5f7fa;
}

/* 轮播导航箭头 */
.carousel-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  pointer-events: none;
}

.nav-arrow {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 10;
}

.nav-arrow:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.nav-arrow .el-icon {
  font-size: 24px;
  color: #333;
}

.left-arrow {
  margin-left: 20px;
}

.right-arrow {
  margin-right: 20px;
}

/* 图片计数器 */
.image-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .nav-arrow {
    width: 40px;
    height: 40px;
  }

  .nav-arrow .el-icon {
    font-size: 20px;
  }
}

@media (max-width: 600px) {
  .nav-arrow {
    width: 30px;
    height: 30px;
  }

  .nav-arrow .el-icon {
    font-size: 16px;
  }

  .image-counter {
    font-size: 0.9rem;
    padding: 3px 10px;
  }
}
.dialog-content {
  position: relative;
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 确保箭头在两侧 */
}

/* 调整图片容器样式 */
.dialog-image-container {
  position: relative;
  max-width: calc(100% - 100px); /* 为箭头留出空间 */
  max-height: 100%;
  flex: 1; /* 占据剩余空间 */
}

/* 修改箭头样式 */
.nav-arrow {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 10;
  flex-shrink: 0; /* 防止缩小 */
}

.nav-arrow:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.nav-arrow .el-icon {
  font-size: 24px;
  color: #333;
}

/* 响应式调整 */
@media (max-width: 900px) {
  .dialog-image-container {
    max-width: calc(100% - 80px); /* 为小屏幕调整空间 */
  }

  .nav-arrow {
    width: 40px;
    height: 40px;
  }

  .nav-arrow .el-icon {
    font-size: 20px;
  }
}

@media (max-width: 600px) {
  .dialog-image-container {
    max-width: calc(100% - 60px); /* 为小屏幕调整空间 */
  }

  .nav-arrow {
    width: 30px;
    height: 30px;
  }

  .nav-arrow .el-icon {
    font-size: 16px;
  }
}
</style>
