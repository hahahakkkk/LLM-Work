<template>
  <!-- 整体天气容器 -->
  <div class="mckou-weather-content">
    <!-- 天气预报模块 -->
    <div class="weather-container">
      <div class="body-module">
        <div class="forecast-grid">
          <!-- 循环渲染天气预报项 -->
          <div v-for="(item, index) in weatherData" :key="index" class="body-item">
            <!-- 分隔竖线（从第二项开始显示） -->
            <div v-if="index > 0" class="divider-line"></div>

            <div class="day-font">{{ item.dayWeek }}</div>
            <div class="day-time">{{ item.dayLabel }}</div>
            <div class="weather-image">
              <i class="qi" :class="'qi-' + item.weatherIcon"></i>
            </div>
            <div class="weather-font">{{ item.weatherLabel }}</div>
            <div class="max-weather">{{ item.max }}℃</div>
            <div class="min-weather">{{ item.min }}℃</div>
            <div class="feng-font">{{ item.wind }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { queryWeather } from '@/views/process/maturity/api/index';

// 响应式天气预报数据
const weatherData = ref([]);

// 获取天气数据
const fetchWeather = async () => {
  try {
    const res = await queryWeather();
    console.log('API响应:', res);

    if (res.code === 200) {
      // 获取7天的预报数据
      weatherData.value = res.data.forecast.forecastData.slice(0, 7);
      console.log('处理后的天气预报数据:', weatherData.value);
    } else {
      console.error('API返回错误状态码:', res.code);
    }
  } catch (error) {
    console.error('获取天气数据失败:', error);
  }
};

onMounted(() => {
  fetchWeather();
});
</script>

<style lang="scss" scoped>
.mckou-weather-content {
  width: 100%;
  height: 100%;
  color: #333;
  font-family: 'PingFang SC', sans-serif;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0;
  background: transparent;

  /* 天气预报标题样式 */
  .weather-title {
    position: absolute;
    top: 10px;
    left: 15px;
    font-size: 14px;
    font-weight: bold;
    z-index: 3;
    color: #333;
  }

  /* 和风天气图标样式 */
  .qi {
    font-family: 'qweather-icons' !important;
    font-size: 25px;
    color: #333;
    line-height: 1;
  }

  .weather-container {
    position: relative;
    background: #fff;

    width: 100%;
    height: 100%;

    .body-module {
      position: relative;
      z-index: 2;
      height: 100%;
      padding-top: 35px; /* 为标题留出空间 */

      .forecast-grid {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: calc(100% - 35px);
        width: 100%;
        padding: 0 16px;
      }

      .body-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5px 0;
        position: relative;
        flex: 1;
        height: 100%;
        min-width: 0;

        .divider-line {
          position: absolute;
          left: 0;
          top: 1px;
          bottom: 1px;
          width: 1.5px;
          background: rgba(0, 0, 0, 0.1);
        }

        .day-font {
          height: 20px;
          line-height: 25px;
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 5px;
          color: #333;
        }

        .day-time {
          height: 15px;
          line-height: 20px;
          font-size: 12px;
          font-weight: normal;
          opacity: 0.7;
          text-align: center;
          margin-bottom: 7.5px;
          color: #333;
        }

        .weather-font {
          height: 20px;
          line-height: 20px;
          font-size: 14px;
          font-weight: normal;
          text-align: center;
          margin-bottom: 7.5px;
          color: #333;
        }

        .weather-image {
          height: 25px;
          display: flex;
          justify-content: center;
          margin-bottom: 7.5px;
          align-items: center;
        }

        .max-weather {
          height: 15px;
          line-height: 15px;
          font-size: 14px;
          font-weight: normal;
          text-align: center;
          margin-bottom: 2.5px;
          color: #333;
        }

        .min-weather {
          height: 15px;
          line-height: 15px;
          font-size: 14px;
          font-weight: normal;
          opacity: 0.7;
          text-align: center;
          margin-bottom: 7.5px;
          color: #333;
        }

        .feng-font {
          height: 20px;
          line-height: 20px;
          font-size: 12px;
          font-weight: normal;
          opacity: 0.7;
          text-align: center;
          color: #333;
        }
      }
    }
  }
}
</style>
