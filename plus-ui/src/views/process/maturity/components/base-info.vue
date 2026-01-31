<script setup lang="ts">
import useUserStore from '@/store/modules/user';
import { useRouter } from 'vue-router';
import { ElCarousel, ElCarouselItem } from 'element-plus';
import { ref, computed, nextTick } from 'vue';

const carouselRef = ref();
const activeStage = ref(0);

const setActiveStage = (index: number) => {
  activeStage.value = index;
  nextTick(() => {
    carouselRef.value?.setActiveItem(index);
  });
};

const handleCarouselChange = (index: number) => {
  activeStage.value = index;
};
// 获取路由实例
const router = useRouter();

// 获取用户信息
const userStore = useUserStore();
const nickName = computed(() => userStore.nickname);

// 定义谷子成熟标准科普数据
const maturityStages = ref([
  {
    id: 1,
    title: '乳熟期',
    images: [
      'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202512112252079.jpg',
      'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202512112252349.jpg'
    ],
    description: '谷粒由白色乳浆状逐渐变硬，含水量约30-40%，籽粒颜色由白色转为浅黄色。此期是决定产量的关键时期。'
  },
  {
    id: 2,
    title: '蜡熟期',
    images: [
      'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202512112252093.jpg',
      'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202512112252399.jpg',
      'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202512112252794.jpg'
    ],
    description: '谷粒变硬但仍可剥出完整的籽粒，含水量约20-30%，籽粒颜色加深呈黄色或金黄色。'
  },
  {
    id: 3,
    title: '完熟期',
    images: [
      'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202512112252975.jpg',
      'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202512112252248.jpg',
      'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202512112252731.jpg'
    ],
    description: '谷粒完全硬化，含水量降至20%以下，籽粒颜色呈深黄色或褐色，此时收获产量最高。'
  }
]);
</script>

<template>
  <div class="base-info-container">
    <div class="base-info-section">
      <div class="section-title">
        <span>谷子成熟标准</span>
      </div>
      <div class="maturity-carousel">
        <!-- 添加按钮导航 -->
        <div class="stage-buttons">
          <el-button
            v-for="(stage, index) in maturityStages"
            :key="stage.id"
            :type="activeStage === index ? 'primary' : 'default'"
            size="small"
            @click="setActiveStage(index)"
          >
            {{ stage.title }}
          </el-button>
        </div>
        <el-carousel ref="carouselRef" indicator-position="outside" height="300px" :interval="5000" :autoplay="false">
          <el-carousel-item v-for="stage in maturityStages" :key="stage.id">
            <div class="carousel-item">
              <div class="stage-content">
                <!-- 小轮播图容器 -->
                <div class="stage-image-carousel">
                  <el-carousel :interval="3000" height="200px" indicator-position="bottom" arrow="hover" :loop="true" :initial-index="0">
                    <el-carousel-item v-for="(img, imgIndex) in stage.images" :key="imgIndex">
                      <img :src="img" :alt="`${stage.title}-图片${imgIndex + 1}`" class="stage-image" />
                    </el-carousel-item>
                  </el-carousel>
                </div>
                <div class="stage-text">
                  <h3 class="stage-title">{{ stage.title }}</h3>
                  <p class="stage-description">{{ stage.description }}</p>
                </div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-info-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .section-title {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    padding: 1.2vh 0;
    border-bottom: 0.1vh solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stage-buttons {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 0px;
    margin-bottom: 10px;

    :deep(.el-button) {
      font-size: 12px;
      padding: 8px 20px;
    }
  }

  .maturity-carousel {
    flex: 1;

    :deep(.el-carousel__item) {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .carousel-item {
      width: 100%;
      height: 100%;
      padding: 1px;
      text-align: center;

      .stage-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;

        .stage-image-carousel {
          width: 100%;
          margin-bottom: 1vh;
          box-shadow: 0 1vh 2vh rgba(0, 0, 0, 0.1);
          border-radius: 0.5vh;
          overflow: hidden;

          :deep(.el-carousel__container) {
            height: 200px !important;
          }

          :deep(.el-carousel__item) {
            height: 100%;

            .stage-image {
              width: 100%;
              height: 100%;
              object-fit: cover; /* 使用 fill 模式确保图片完全铺满容器 */
              display: block;
            }
          }

          :deep(.el-carousel__indicators) {
            margin-bottom: 0.5vh;
          }

          :deep(.el-carousel__arrow) {
            background-color: rgba(31, 45, 61, 0.5);
          }
        }

        .stage-image {
          width: 100%;
          height: 100%;
          object-fit: cover; /* 确保图片完全填充容器 */
          border-radius: 0.5vh;
          display: block;
        }

        .stage-text {
          .stage-title {
            font-size: 14px;
            color: #333;
            margin-bottom: 1vh;
          }

          .stage-description {
            font-size: 12px;
            color: #666;
            line-height: 1.6;
            max-width: 90%;
            margin: 0 auto;
          }
        }
      }
    }
  }
}
</style>
