<script setup lang="ts">
import { ref, onMounted } from 'vue';
import service from '@/utils/request';
import md5 from 'crypto-js/md5'; // 需要安装 crypto-js 库
import { ElMessage } from 'element-plus';

// 定义作物生长状态数据类型
interface ExternalCropGrowth {
  baseName: string;
  detectionTime: string;
  growthStage: string;
  temperature: number;
  humidity: number;
  rainfall: number;
}

// 响应式数据
const cropGrowthList = ref<ExternalCropGrowth[]>([]);
const loading = ref(false);
// 添加参数相关的响应式数据
const queryParams = ref({
  baseName: '',
  startTime: '',
  endTime: ''
});

// 密钥，实际使用时应从环境变量或配置文件读取
const SECRET_KEY = 'HdkfDfEchaSdDGESsdfFGdsGDFFdSDFdss';

// 生成签名的方法
const generateSignature = () => {
  const nonce =
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10); // 生成32位随机字符串
  const timestamp = Date.now().toString(); // 当前时间戳(13位)

  // 按照API文档要求生成签名字符串
  const signStr = `nonce=${nonce}&timestamp=${timestamp}&key=${SECRET_KEY}`;
  const sign = md5(signStr).toString(); // 生成MD5签名

  return {
    nonce,
    timestamp,
    sign
  };
};

// 获取作物生长状态数据
const fetchCropGrowthData = async () => {
  loading.value = true;
  try {
    // 生成签名参数
    const { nonce, timestamp, sign } = generateSignature();

    // 构造带参数的URL
    let url = `extapi/mz-soil-moisture-api/list?nonce=${nonce}&timestamp=${timestamp}&sign=${sign}`;

    // 添加可选参数
    if (queryParams.value.baseName) {
      url += `&baseName=${queryParams.value.baseName}`;
    }
    if (queryParams.value.startTime) {
      url += `&startTime=${queryParams.value.startTime}`;
    }
    if (queryParams.value.endTime) {
      url += `&endTime=${queryParams.value.endTime}`;
    }

    // 构造带签名参数的URL
    const response = await service.get(url);
    console.log('获取作物生长状态数据成功:', response);
    if (response.code === 200) {
      cropGrowthList.value = response.data;
      console.log('数据处理完成', response.data);
    } else {
      ElMessage.error('获取数据失败: ' + (response.data?.msg || '未知错误'));
    }
  } catch (error: any) {
    console.error('获取作物生长状态数据失败:', error);
    ElMessage.error('获取数据失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 重置查询条件
const resetQuery = () => {
  queryParams.value.baseName = '';
  queryParams.value.startTime = '';
  queryParams.value.endTime = '';
  fetchCropGrowthData();
};

// 组件挂载时获取数据
onMounted(() => {
  fetchCropGrowthData();
});
</script>

<template>
  <div class="app-container">
    <h2>作物生长状态数据</h2>
    <el-alert
      title="接口说明"
      type="info"
      description="此页面调用后端接口 /mz-planting-forecast-api/list 获取作物生长状态数据，支持基地名称、开始时间和结束时间参数过滤。"
      show-icon
      style="margin-bottom: 20px"
    />

    <!-- 添加查询条件表单 -->
    <el-form :model="queryParams" label-width="100px" style="margin-bottom: 20px">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="基地名称">
            <el-input v-model="queryParams.baseName" placeholder="请输入基地名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="queryParams.startTime"
              type="datetime"
              placeholder="请选择开始时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="queryParams.endTime"
              type="datetime"
              placeholder="请选择结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="fetchCropGrowthData"> 查询 </el-button>
            <el-button @click="resetQuery"> 重置 </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="cropGrowthList" style="width: 100%; margin-top: 20px" border>
      <el-table-column prop="baseName" label="基地名称" width="180" />
      <el-table-column prop="detectionTime" label="检测时间" width="180" />
      <el-table-column prop="growthStage" label="生长阶段" width="120" />
      <el-table-column prop="temperature" label="温度(℃)" width="100" />
      <el-table-column prop="humidity" label="湿度(%)" width="100" />
      <el-table-column prop="rainfall" label="降水量(mm)" width="120" />
    </el-table>

    <div v-if="cropGrowthList.length === 0 && !loading" style="text-align: center; padding: 40px">
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.el-button {
  margin-bottom: 20px;
}
</style>
