<template>
  <div class="realtime-weather">
    <div class="weather-grid">
      <div v-if="showWarning" class="warning-message">
        {{ warningMessage }}
      </div>
      <div class="weather-card">
        <div class="weather-label">温度</div>
        <div class="weather-value">{{ weatherData.airTemperature }}</div>
      </div>
      <div class="weather-card">
        <div class="weather-label">风向</div>
        <div class="weather-value">{{ weatherData.windDirection }}</div>
      </div>
      <div class="weather-card">
        <div class="weather-label">雨量</div>
        <div class="weather-value">{{ weatherData.rainfall }}</div>
      </div>
      <div class="weather-card">
        <div class="weather-label">湿度</div>
        <div class="weather-value">{{ weatherData.airHumidity }}</div>
      </div>
      <div class="weather-card">
        <div class="weather-label">风速</div>
        <div class="weather-value">{{ weatherData.windSpeed }}</div>
      </div>
      <div class="weather-card">
        <div class="weather-label">光强</div>
        <div class="weather-value">{{ weatherData.lightIntensity }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { listMicroclimate } from '@/views/four/api/microclimate';
import { MicroclimateVO } from '@/views/four/api/microclimate/types';

// 定义天气数据接口
interface WeatherData {
  airTemperature: string;
  windDirection: string;
  rainfall: string;
  airHumidity: string;
  windSpeed: string;
  lightIntensity: string;
}

// 初始化天气数据
const weatherData = ref<WeatherData>({
  airTemperature: '17℃',
  windDirection: '17°',
  rainfall: '4mm/m',
  airHumidity: '88%',
  windSpeed: '15m/s',
  lightIntensity: '1000Lux'
});

const showWarning = ref(false);
const warningMessage = ref('');

const props = defineProps({
  baseId: {
    type: String,
    default: ''
  }
});

/**
 * 从接口获取实时天气数据
 */
const fetchWeatherData = async () => {
  try {
    const res = await listMicroclimate({
      pageNum: 1,
      pageSize: 10,
      growthPeriod: 'p5'
    });
    console.log('接口返回数据：', res);
    if (res.rows && res.rows.length > 0) {
      // 获取最新的数据（数组第一个元素）
      const latestData: MicroclimateVO = res.rows[0];
      console.log('最新数据：', latestData);
      weatherData.value = {
        airTemperature: latestData.airTemperature ? latestData.airTemperature + '℃' : 'N/A',
        windDirection: latestData.windDirection || 'N/A',
        rainfall: latestData.rainfall ? latestData.rainfall + 'mm' : 'N/A',
        airHumidity: latestData.airHumidity ? latestData.airHumidity + '%' : 'N/A',
        windSpeed: latestData.windSpeed ? latestData.windSpeed + 'm/s' : 'N/A',
        lightIntensity: latestData.lightIntensity ? latestData.lightIntensity + 'Lux' : 'N/A'
      };

      showWarning.value = false;
    } else {
      // 没有获取到数据，使用默认值并显示警告
      showWarning.value = true;
      warningMessage.value = '未获取到当前基地的成熟期气象数据，显示默认值';
    }
  } catch (error) {
    console.error('获取天气数据失败:', error);
    showWarning.value = true;
    warningMessage.value = '获取气象数据失败，显示默认值';
  }
};

// 监听基地ID变化
watch(
  () => props.baseId,
  (newBaseId) => {
    if (newBaseId) {
      fetchWeatherData();
    }
  }
);

onMounted(() => {
  if (props.baseId) {
    fetchWeatherData();
  }
});
</script>

<style scoped lang="scss">
.realtime-weather {
  width: 100%;
  height: 100%;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 2vh;
  padding: 1vh;
}

.weather-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5vh;
  background-color: #f5f7fa;
  border-radius: 0.8vh;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .weather-label {
    font-size: 1.8vh;
    color: #606266;
    margin-bottom: 1vh;
  }

  .weather-value {
    font-size: 2vh;
    font-weight: bold;
    color: #303133;
  }
}

.warning-message {
  text-align: center;
  color: #e6a23c;
  font-size: 1.6vh;
  margin-top: 1vh;
  padding: 0.5vh;
}
</style>
