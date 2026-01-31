<script setup lang="ts">
import useUserStore from '@/store/modules/user';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

// 获取路由实例
const router = useRouter();

// 获取用户信息
const userStore = useUserStore();
const nickName = computed(() => userStore.nickname);

// 接收当前生育期作为props
const props = defineProps<{
  currentPeriod: string;
}>();

// 根据不同生育期返回不同的基地信息
const getBaseInfo = () => {
  // 默认值
  const defaultInfo = {
    name: '侯家沟基地',
    area: '1000亩',
    variety: '米谷211号',
    lai: '2.45',
    spad: '45.2',
    growth: '良好'
  };

  // 根据生育期返回不同的值
  switch (props.currentPeriod) {
    case '拔节期':
      return {
        ...defaultInfo,
        lai: '3.25',
        spad: '48.6',
        growth: '良好'
      };
    case '抽穗期':
      return {
        ...defaultInfo,
        lai: '4.12',
        spad: '46.8',
        growth: '正常'
      };
    case '灌浆期':
      return {
        ...defaultInfo,
        lai: '3.78',
        spad: '43.5',
        growth: '较差'
      };
    default:
      return defaultInfo;
  }
};

const baseInfo = computed(() => getBaseInfo());

// 返回到生长周期总览页面
const goBack = () => {
  router.push('/process/growth/index');
};
</script>

<template>
  <div class="base-info-container">
    <div class="base-info-section">
      <div class="section-title">
        <span>基地信息</span>
        <el-button type="primary" link class="back-button" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
      <div class="base-info-content">
        <el-row :gutter="10" class="info-row">
          <el-col :span="10" class="info-label">基地名称：</el-col>
          <el-col :span="12" class="info-value value-large">{{ baseInfo.name }}</el-col>
        </el-row>
        <el-row :gutter="10" class="info-row">
          <el-col :span="10" class="info-label">种植面积：</el-col>
          <el-col :span="12" class="info-value value-large">{{ baseInfo.area }}</el-col>
        </el-row>
        <el-row :gutter="10" class="info-row">
          <el-col :span="10" class="info-label">作物品种：</el-col>
          <el-col :span="12" class="info-value value-large">{{ baseInfo.variety }}</el-col>
        </el-row>
        <el-row :gutter="10" class="info-row info-row-center">
          <el-col :span="10" class="info-label">生育期：</el-col>
          <el-col :span="12" class="info-value">
            <el-tag type="warning" class="custom-tag">{{ props.currentPeriod }}</el-tag>
          </el-col>
        </el-row>
        <el-row :gutter="10" class="info-row">
          <el-col :span="10" class="info-label">LAI值：</el-col>
          <el-col :span="12" class="info-value value-large">{{ baseInfo.lai }}</el-col>
        </el-row>
        <el-row :gutter="10" class="info-row">
          <el-col :span="10" class="info-label">SPAD值：</el-col>
          <el-col :span="12" class="info-value value-large">{{ baseInfo.spad }}</el-col>
        </el-row>
        <el-row :gutter="10" class="info-row info-row-center">
          <el-col :span="10" class="info-label">作物长势：</el-col>
          <el-col :span="12" class="info-value">
            <el-tag type="success" class="custom-tag">{{ baseInfo.growth }}</el-tag>
          </el-col>
        </el-row>
        <el-row :gutter="10" class="info-row">
          <el-col :span="10" class="info-label">操作人：</el-col>
          <el-col :span="12" class="info-value value-large">{{ nickName }}</el-col>
        </el-row>
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
    font-size: 18px;
    font-weight: bold;
    color: #333;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .back-button {
      font-size: 14px;
      font-weight: normal;
    }
  }

  .base-info-section {
    .info-row {
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0;
      }

      .info-label {
        font-size: 14px;
        color: #999;
        text-align: right;
        font-weight: 500;
        line-height: 28px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .info-value {
        font-size: 14px;
        color: #333;
        line-height: 28px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &.value-large {
          font-size: 15px;
          font-weight: 500;
          color: #333;
        }

        .custom-tag {
          font-size: 14px;
          height: 26px;
          line-height: 24px;
          padding: 0 10px;
        }
      }

      // 需要居中对齐的行
      &.info-row-center {
        align-items: center;
        display: flex;
      }
    }
  }
}
</style>
