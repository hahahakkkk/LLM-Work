<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getDeskINfo } from '@/views/process/api/pestcontrol/areaDetection';
import type { PestDetectionMapVO } from '@/views/process/api/pestcontrol/areaDetection/types';

// 定义地块预警信息类型
interface PlotAlert {
  id: number;
  landCode: string;
  baseName: string;
  diseaseType: string;
  incidenceRate: number;
  leval: number;
  imageUrl: string;
  levelText: string;
  levelType: 'danger' | 'warning';
  createTime: string;
}

// 定义props
const props = defineProps<{
  baseName?: string;
  monitorType?: string; // 监测类型
  subType?: string; // 二级类型
  seedlingDiseaseData?: any[]; // 出苗期病害数据
  suHuiMingData?: any[]; // 粟灰螟检测数据
}>();

// 发送事件给父组件
const emit = defineEmits<{
  'plot-click': [landCode: string];
}>();

// 预警数据
const alertData = ref<PestDetectionMapVO[]>([]);
const isLoading = ref(false);

// 获取预警数据
const fetchAlertData = async () => {
  isLoading.value = true;
  try {
    const response = await getDeskINfo();
    const data = response.data || [];

    // 筛选 leval 为 2 和 3 的数据（中度和重度）
    alertData.value = data.filter((item) => item.leval === 2 || item.leval === 3);

    console.log('预警数据加载完成:', alertData.value);
  } catch (error) {
    console.error('获取预警数据失败:', error);
    alertData.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 生成预警列表
const alertList = computed(() => {
  // 出苗期模式 - 显示出苗期病害数据
  if (props.monitorType === '出苗期' && props.seedlingDiseaseData && props.seedlingDiseaseData.length > 0) {
    return props.seedlingDiseaseData.map((item, index) => {
      // 根据 diseaseCode 确定病害类型
      let diseaseType = '';
      let levelType: 'danger' | 'warning' = 'warning';

      switch (item.diseaseCode) {
        case 1:
          diseaseType = '负泥虫虫害';
          levelType = 'danger'; // 改为 danger 类型，使用红色系
          break;
        case 2:
          diseaseType = '叶斑病病害';
          levelType = 'danger'; // 改为 danger 类型，使用红色系
          break;
        case 3:
          diseaseType = '负泥虫虫害和叶斑病病害';
          levelType = 'danger';
          break;
      }

      // 设置标签文本（图例名称）
      const tagLabels = {
        1: '负泥虫',
        2: '叶斑病',
        3: '负+叶'
      };

      return {
        id: index,
        landCode: item.plotCode,
        baseName: '',
        diseaseType,
        incidenceRate: 0,
        leval: item.diseaseCode,
        imageUrl: '',
        levelText: tagLabels[item.diseaseCode as keyof typeof tagLabels] || '',
        levelType
      } as PlotAlert;
    });
  }

  // 粟灰螟模式 - 显示粟灰螟检测数据
  if (props.monitorType === '拔节期' && props.subType === '粟灰螟' && props.suHuiMingData && props.suHuiMingData.length > 0) {
    return props.suHuiMingData.map((item, index) => {
      return {
        id: index,
        landCode: item.plotCode,
        baseName: '',
        diseaseType: '粟灰螟虫害',
        incidenceRate: 0,
        leval: 0,
        imageUrl: '',
        levelText: '粟灰螟',
        levelType: 'danger' as 'danger' | 'warning'
      } as PlotAlert;
    });
  }

  // 默认模式（拔节期白发病、抽穗期等）- 显示原有的预警数据
  return alertData.value
    .map((item) => {
      // 根据 leval 确定等级文本和类型
      const levelText = item.leval === 3 ? '重度' : '中度';
      const levelType = item.leval === 3 ? 'danger' : 'warning';

      console.log('item:::::::', item);
      return {
        id: item.id,
        landCode: item.landCode,
        baseName: item.baseName,
        diseaseType: item.diseaseType,
        incidenceRate: item.incidenceRate,
        leval: item.leval,
        imageUrl: item.imageUrl,
        createTime: item.createTime,
        levelText,
        levelType
      } as PlotAlert;
    })
    .sort((a, b) => {
      // 按等级排序，重度优先
      return b.leval - a.leval;
    });
});

// 处理地块点击
const handlePlotClick = (landCode: string) => {
  emit('plot-click', landCode);
};

// 获取标签的自定义类名（根据图例颜色）
const getTagClass = (alert: PlotAlert) => {
  // 出苗期和粟灰螟模式不需要自定义类名，使用 Element Plus 默认的 danger 样式
  return '';
};

// 组件挂载时加载数据
onMounted(() => {
  fetchAlertData();
});

// 暴露刷新方法给父组件
defineExpose({
  refresh: fetchAlertData
});
</script>

<template>
  <div class="warning-alerts-container">
    <div class="alerts-content">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <el-icon class="is-loading"><i-ep-loading /></el-icon>
        <span class="loading-text">加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="alertList.length === 0" class="empty-state">
        <span class="empty-text">暂无预警信息</span>
      </div>

      <!-- 预警列表 -->
      <div v-else class="alerts-list">
        <div v-for="alert in alertList" :key="alert.id" class="alert-item" @click="handlePlotClick(alert.landCode)">
          <div class="alert-main">
            <!-- 出苗期和粟灰螟模式 - 简化显示 -->
            <template v-if="props.monitorType === '出苗期' || (props.monitorType === '拔节期' && props.subType === '粟灰螟')">
              <div class="alert-title-simple">
                {{ alert.landCode }}地块出现{{ alert.diseaseType }}
                <el-tag :type="alert.levelType" size="small" class="level-tag">
                  {{ alert.levelText }}
                </el-tag>
              </div>
            </template>

            <!-- 默认模式 - 详细显示 -->
            <template v-else>
              <div class="alert-title">
                {{ alert.landCode }}号地块病害预警
                <el-tag :type="alert.levelType" size="small" class="level-tag">
                  {{ alert.levelText }}
                </el-tag>
              </div>
              <div class="alert-info">
                <div class="info-item">
                  <span class="info-label">预警时间：</span>
                  <span class="info-value">{{ alert.createTime }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">病害类型：</span>
                  <span class="info-value">{{ alert.diseaseType }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">病害发生率：</span>
                  <span class="info-value highlight">{{ alert.incidenceRate }}%</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.warning-alerts-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .alerts-content {
    flex: 1;
    overflow: hidden;

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100px;
      color: var(--el-text-color-secondary);
      font-size: 14px;
      gap: 8px;

      .is-loading {
        font-size: 24px;
      }
    }

    .alerts-list {
      height: 100%;
      overflow-y: auto;
      padding-bottom: 8px;

      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: var(--el-fill-color-lighter);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color);
        border-radius: 3px;
        transition: background 0.2s ease;

        &:hover {
          background: var(--el-border-color-dark);
        }
      }

      // Firefox 滚动条样式
      scrollbar-width: thin;
      scrollbar-color: var(--el-border-color) var(--el-fill-color-lighter);

      .alert-item {
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color);
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 6px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 2px 8px var(--el-color-primary-light-7);
        }

        &:last-child {
          margin-bottom: 0;
        }

        .alert-main {
          .alert-title,
          .alert-title-simple {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .level-tag {
              margin-left: 8px;
            }
          }

          .alert-title-simple {
            justify-content: space-between;
          }

          .alert-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-top: 6px;

            .info-item {
              display: flex;
              align-items: center;
              font-size: 12px;
              line-height: 1.4;

              .info-label {
                color: var(--el-text-color-secondary);
                min-width: 90px;
              }

              .info-value {
                color: var(--el-text-color-regular);
                font-weight: 500;

                &.highlight {
                  color: var(--el-color-danger);
                  font-weight: 600;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
