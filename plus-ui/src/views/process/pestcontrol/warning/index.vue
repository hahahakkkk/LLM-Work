<template>
  <div class="pestcontrol-warning">
    <el-row :gutter="20">
      <!-- Main -->
      <el-col :xs="24" :sm="24" :md="18" :lg="18" :xl="18">
        <el-alert :title="warnMessage" type="warning" :closable="false" show-icon class="mb-20">
          <template #default>
            <el-select v-model="selectedFarmlandIndex" placeholder="选择农田" class="farmland-select" size="default">
              <el-option v-for="(item, index) in results" :key="item.farmlandId" :label="item.farmlandName" :value="index" />
            </el-select>
          </template>
        </el-alert>

        <el-card shadow="hover" class="preview-card">
          <template #header>
            <el-row justify="space-between" align="middle">
              <el-col :span="12">
                <el-tag size="large" effect="plain">预览图</el-tag>
              </el-col>
              <el-col :span="12" class="text-right">
                <el-space>
                  <el-tag size="small" type="info">版本: {{ version }}</el-tag>
                  <el-tag size="small" type="info">创建时间: {{ createTime }}</el-tag>
                </el-space>
              </el-col>
            </el-row>
          </template>

          <el-space direction="vertical" fill class="w-100">
            <el-switch v-model="isProcessedImage" active-text="处理后图像" inactive-text="原始图像" inline-prompt @change="handleImageTypeChange" />

            <el-skeleton :loading="!imageUrl" animated>
              <template #template>
                <el-skeleton-item variant="image" style="width: 100%; height: 400px" />
              </template>
              <template #default>
                <el-image :src="imageUrl" fit="contain" class="preview-image" loading="lazy" :initial-index="0">
                  <template #error>
                    <el-empty description="图片加载失败" />
                  </template>
                </el-image>
              </template>
            </el-skeleton>
          </el-space>
        </el-card>
      </el-col>

      <!-- Side -->
      <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="mb-20 info-card">
          <template #header>
            <div class="d-flex align-center">
              <el-icon class="mr-5">
                <Aim />
              </el-icon>
              <span>病虫害类别</span>
            </div>
          </template>
          <el-result v-if="selectedFarmlandIndex === null" icon="info" title="请先选择农田" sub-title="选择农田后查看病虫害类别" />
          <div v-else>
            <!-- Pest type and occurrence rate table -->
            <el-table :data="pestTableData" border stripe style="width: 100%">
              <el-table-column prop="name" label="病虫害名称" align="center" />
              <el-table-column prop="rate" label="发生率" align="center">
                <template #default="scope">
                  <el-progress
                    :percentage="Number(scope.row.rate.toFixed(1))"
                    :status="getOccurrenceStatus(scope.row.rate, scope.row.name)"
                    :stroke-width="15"
                    :format="(val) => val + '%'"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <el-card shadow="hover" class="strategy-card">
          <template #header>
            <div class="d-flex align-center">
              <el-icon class="mr-5">
                <Brush />
              </el-icon>
              <span>防治策略</span>
            </div>
          </template>
          <el-result v-if="selectedFarmlandIndex === null" icon="info" title="请先选择农田" sub-title="选择农田后查看防治策略" />
          <el-empty v-else-if="!strategies.length" description="暂无防治策略" />
          <el-collapse v-else accordion>
            <el-collapse-item v-for="(strategy, index) in strategies" :key="index" :title="strategy.class">
              <el-descriptions border direction="vertical" :column="1" size="small">
                <el-descriptions-item v-if="typeof strategy.strategy === 'string'" label="策略">
                  {{ strategy.strategy }}
                </el-descriptions-item>
                <template v-else>
                  <el-descriptions-item v-for="(value, key) in strategy.strategy" :key="String(key)" :label="String(key)">
                    {{ value }}
                  </el-descriptions-item>
                </template>
              </el-descriptions>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { imageType, type WarningData } from '@/views/process/api/pestcontrol/warning/types';
import { fetchWarningSummary } from '@/views/process/api/pestcontrol/warning';
import { Aim, Brush } from '@element-plus/icons-vue';

const results = ref<WarningData[]>([]);
const fetchResults = async () => {
  const res = await fetchWarningSummary();
  results.value = res.data || [];
};

const selectedFarmlandIndex = ref<number | null>(null);
const imageType = ref<imageType>('origin');
const isProcessedImage = ref(false);

const warnMessage = computed(() => {
  if (selectedFarmlandIndex.value === null || !results.value[selectedFarmlandIndex.value]) {
    return '请选择农田查看病虫害预警信息';
  }
  return results.value[selectedFarmlandIndex.value].warnMessage;
});

const pestTableData = computed(() => {
  if (selectedFarmlandIndex.value === null || !results.value[selectedFarmlandIndex.value]) {
    return [];
  }

  const strategies = results.value[selectedFarmlandIndex.value].resultStrategies || [];
  return strategies.map((strategy) => ({
    name: strategy.class,
    rate: strategy.average_occurrence_rate
  }));
});

const strategies = computed(() => {
  if (selectedFarmlandIndex.value === null || !results.value[selectedFarmlandIndex.value]) {
    return [];
  }
  return results.value[selectedFarmlandIndex.value].resultStrategies || [];
});

const version = computed(() => {
  if (selectedFarmlandIndex.value === null || !results.value[selectedFarmlandIndex.value]) {
    return '暂无';
  }
  return results.value[selectedFarmlandIndex.value].version || '暂无';
});

const createTime = computed(() => {
  if (selectedFarmlandIndex.value === null || !results.value[selectedFarmlandIndex.value]) {
    return '暂无';
  }
  return results.value[selectedFarmlandIndex.value].createTime || '暂无';
});

const handleImageTypeChange = (val: boolean) => {
  imageType.value = val ? 'processed' : 'origin';
};

const imageUrl = computed(() => {
  if (selectedFarmlandIndex.value === null || !results.value[selectedFarmlandIndex.value]) {
    return '';
  }

  const farmland = results.value[selectedFarmlandIndex.value];
  return imageType.value === 'origin' ? farmland.originImageUrl : farmland.processedImageUrl;
});

const getOccurrenceStatus = (rate: number, pestName: string) => {
  if (pestName === '健康谷子') {
    if (rate >= 70) return 'success';
    if (rate >= 30) return 'warning';
    return 'exception';
  } else {
    if (rate >= 70) return 'exception';
    if (rate >= 30) return 'warning';
    return 'success';
  }
};

onMounted(() => {
  fetchResults().then(() => {
    if (results.value.length > 0) {
      selectedFarmlandIndex.value = 0;
    }
  });
});
</script>

<style scoped>
.pestcontrol-warning {
  padding: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mr-5 {
  margin-right: 5px;
}

.text-right {
  text-align: right;
}

.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.w-100 {
  width: 100%;
}

.preview-image {
  width: 100%;
  height: 400px;
  transition: all 0.3s ease;
}

.farmland-select {
  margin-top: 10px;
  width: 100%;
}

/* Responsive styles */
@media (max-width: 768px) {
  .text-right {
    text-align: left;
    margin-top: 8px;
  }

  .preview-image {
    height: 300px;
  }

  .pestcontrol-warning {
    padding: 10px;
  }
}
</style>
