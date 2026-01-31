<script setup lang="ts">
import useUserStore from '@/store/modules/user';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

// 获取路由实例
const router = useRouter();

// 获取用户信息
const userStore = useUserStore();
const nickName = computed(() => userStore.nickname);

// 修改接收参数的方式，支持手动传入基地信息
const props = defineProps<{
  baseInfo?: {
    name: string;
    lai: string;
    spad: string;
    growth: string;
    fieldCapacity: string;
    soilBulkDensity: string;
  };
}>();

// 默认基地信息
const defaultBaseInfo = {
  name: '侯家沟基地',
  lai: '4.12',
  spad: '46.8',
  growth: '正常',
  fieldCapacity: '20.5%',
  soilBulkDensity: '1.35 g/cm³'
};

// 使用传入的信息或默认信息
const computedBaseInfo = computed(() => {
  return props.baseInfo || defaultBaseInfo;
});
</script>

<template>
  <div class="base-info-container">
    <div class="base-info-section">
      <div class="section-title">
        <span>基地信息</span>
      </div>
      <div class="base-info-content">
        <el-row :gutter="1" class="info-row">
          <el-col :span="12" class="info-label">基地名称：</el-col>
          <el-col :span="12" class="info-value value-large">
            <el-tag class="info-value value-large" type="primary">{{ computedBaseInfo.name }}</el-tag>
          </el-col>
        </el-row>
        <el-row :gutter="1" class="info-row">
          <el-col :span="12" class="info-label">LAI：</el-col>
          <el-col :span="12" class="info-value value-large">{{ computedBaseInfo.lai }}</el-col>
        </el-row>
        <el-row :gutter="1" class="info-row">
          <el-col :span="12" class="info-label">SPAD：</el-col>
          <el-col :span="12" class="info-value value-large">{{ computedBaseInfo.spad }}</el-col>
        </el-row>
        <el-row :gutter="1" class="info-row info-row-center">
          <el-col :span="12" class="info-label">长势等级：</el-col>
          <el-col :span="12" class="info-value">
            <el-tag type="success" class="custom-tag">{{ computedBaseInfo.growth }}</el-tag>
          </el-col>
        </el-row>
        <el-row :gutter="1" class="info-row info-row-center">
          <el-col :span="12" class="info-label">田间持水量：</el-col>
          <el-col :span="12" class="info-value value-large">{{ computedBaseInfo.fieldCapacity }}</el-col>
        </el-row>
        <el-row :gutter="1" class="info-row info-row-center">
          <el-col :span="12" class="info-label">土壤容重：</el-col>
          <el-col :span="12" class="info-value value-large">{{ computedBaseInfo.soilBulkDensity }}</el-col>
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
    font-size: 16px;
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
        text-align: right;
        font-weight: normal;
        color: #606266;
        line-height: 40px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .info-value {
        font-size: 14px;
        line-height: 40px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: normal;

        &.value-large {
          font-size: 14px;
          font-weight: normal;
        }

        .custom-tag {
          font-size: 12px;
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
