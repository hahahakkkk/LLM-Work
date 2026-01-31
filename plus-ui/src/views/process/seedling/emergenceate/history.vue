<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Search, List } from '@element-plus/icons-vue';
import Pagination from '@/components/Pagination/index.vue';
// 导入detailInfo组件
import DetailInfo from './detailInfo.vue';
// 导入API函数
import { handleExportResult as exportReportPdf, fetchErHistoryPdf, fetchErHistoryRecords } from './api/index';
import { ErHistoryRecord } from './api/types';
import { useEmergenceState } from './hooks';
import { EmergenceStatusMap } from './const';

defineOptions({
  name: 'EmergenceRateHistory'
});

// 类型定义 - 与index.vue保持一致
interface HistoryRecord {
  id: number;
  baseName: string;
  landCode: string;
  detectionDate: string;
  detectionTime: string;
  emergenceRate: number;
  emergenceStatus: string;
  notes: string;
  originImage: string;
  resultImage: string;
  totalSeedlings: number; // 总出苗数量
  seedlingDensity: number; // 出苗密度
}

// 响应式数据
const historyRecords = ref<HistoryRecord[]>([]);
const filteredRecords = ref<HistoryRecord[]>([]); // 筛选后的记录
const paginatedRecords = ref<HistoryRecord[]>([]); // 当前页的记录
const historyLoading = ref(false);
const selectedRecord = ref<any>(null);
const detailInfoVisible = ref(false);

// 分页参数
const pagination = reactive({
  pageNum: 1,
  pageSize: 5,
  total: 0
});

// 搜索表单数据
const searchForm = reactive({
  baseId: '',
  landId: '',
  detectionDate: '',
  emergenceRateRange: '',
  emergenceStatus: ''
});

// 更新分页数据
const updatePaginatedData = () => {
  const start = (pagination.pageNum - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  paginatedRecords.value = filteredRecords.value.slice(start, end);
  pagination.total = filteredRecords.value.length;
};

// 处理分页变化
const handlePaginationChange = () => {
  updatePaginatedData();
};

const initHistoryData = () => {
  fetchErHistoryRecords().then((response) => {
    console.log('API response for history records:', response.rows);
    historyRecords.value = response.rows.map((record: ErHistoryRecord) => ({
      id: record.id,
      baseName: record.baseName,
      landCode: record.plotName,
      detectionDate: record.createTime.split(' ')[0],
      detectionTime: record.createTime.split(' ')[1].slice(0, 5),
      emergenceRate: record.emergenceRate || 0,
      emergenceStatus: useEmergenceState(record.emergenceRate || 0),
      notes: '',
      originImage: record.originImage,
      resultImage: record.resultImage,
      totalSeedlings: record.totalSeedlings || 0, // 实际的总出苗数量
      seedlingDensity: record.seedlingDensity || 0 // 实际的出苗密度
    }));
    filteredRecords.value = [...historyRecords.value];
    pagination.pageNum = 1; // 重置到第一页
    updatePaginatedData();
  });
};

// 搜索筛选函数
const searchRecords = () => {
  historyLoading.value = true;

  try {
    let filtered = [...historyRecords.value];

    // 按基地筛选
    if (searchForm.baseId) {
      const baseName = searchForm.baseId === '1' ? '侯家沟基地' : '张家庄基地';
      filtered = filtered.filter((record) => record.baseName === baseName);
    }

    // 按地块筛选
    if (searchForm.landId) {
      filtered = filtered.filter((record) => record.landCode.toLowerCase().includes(searchForm.landId.toLowerCase()));
    }

    // 按检测日期筛选
    if (searchForm.detectionDate) {
      filtered = filtered.filter((record) => {
        return record.detectionDate === searchForm.detectionDate;
      });
    }

    // 按出苗率范围筛选
    if (searchForm.emergenceRateRange) {
      const rangeMatch = searchForm.emergenceRateRange.match(/(\d+)-(\d+)/);
      if (rangeMatch) {
        const [, min, max] = rangeMatch;
        filtered = filtered.filter((record) => {
          return record.emergenceRate >= parseInt(min) && record.emergenceRate <= parseInt(max);
        });
      }
    }

    // 按出苗情况筛选
    if (searchForm.emergenceStatus) {
      filtered = filtered.filter((record) => record.emergenceStatus === searchForm.emergenceStatus);
    }

    filteredRecords.value = filtered;
    pagination.pageNum = 1; // 重置到第一页
    updatePaginatedData();
    ElMessage.success(`搜索完成，找到 ${filtered.length} 条记录`);
  } catch (error) {
    ElMessage.error('搜索失败，请重试');
  } finally {
    historyLoading.value = false;
  }
};

// 重置搜索
const resetSearch = () => {
  searchForm.baseId = '';
  searchForm.landId = '';
  searchForm.detectionDate = '';
  searchForm.emergenceRateRange = '';
  searchForm.emergenceStatus = '';
  filteredRecords.value = [...historyRecords.value];
  pagination.pageNum = 1; // 重置到第一页
  updatePaginatedData();
  ElMessage.info('搜索条件已重置');
};

// 刷新数据
const refreshData = () => {
  historyLoading.value = true;
  setTimeout(() => {
    initHistoryData();
    searchRecords(); // 重新应用当前搜索条件
    ElMessage.success('数据已刷新');
    historyLoading.value = false;
  }, 500);
};

const pdfExportLoading = ref(new Map<number, boolean>());

// 查看详情
const viewDetail = (record: HistoryRecord) => {
  console.log('查看详情 - 记录ID:', record.id, '数据:', record);

  // 根据出苗率动态生成检测分析报告
  const generateAnalysisReport = (rate: number, seedlings: number, status: string) => {
    // 这里可以根据实际需要计算地块总面积和出苗区域面积
    // 暂时使用出苗率和数量来生成报告
    return `经检测，该地块出苗率为 ${rate.toFixed(2)}%，检测到的出苗数量为 ${seedlings} 株，质量等级判定为"${status}"。`;
  };

  // 根据出苗率生成建议措施
  const generateRecommendation = (rate: number) => {
    if (rate > 80) {
      return '该地块出苗情况正常，继续保持当前管理水平，注意后期生长监测。';
    } else if (rate >= 65) {
      return '该地块低度缺苗，建议加强田间管理，确保苗期正常生长。适当增加水肥供应，关注苗情发展。';
    } else if (rate >= 50) {
      return '该地块中度缺苗，建议进行补种，检查种子质量和播种条件。加强土壤湿度和温度管理，适当补充水分和养分。';
    } else {
      return '该地块高度缺苗，建议重新播种，检查土壤条件和种子质量问题。必要时进行土壤改良和重新整地。';
    }
  };

  // 将历史记录数据转换为detailInfo组件需要的格式
  selectedRecord.value = {
    id: record.id,
    modelName: '出苗率检测模型 V1.2',
    baseName: record.baseName,
    landCode: record.landCode,
    detectionDate: `${record.detectionDate} ${record.detectionTime}:00`,
    emergenceRate: record.emergenceRate,
    completionRate: record.emergenceRate, // detailInfo组件需要这个字段
    emergenceStatus: record.emergenceStatus,
    qualityLevel: record.emergenceStatus, // 质量等级使用出苗状态
    totalSeedlings: record.totalSeedlings, // 使用实际的总出苗数量
    avgDensity: record.seedlingDensity.toFixed(1), // 使用实际的出苗密度
    notes: generateAnalysisReport(record.emergenceRate, record.totalSeedlings, record.emergenceStatus), // 动态生成报告
    recommendedAction: generateRecommendation(record.emergenceRate), // 动态生成建议措施
    imageUrl: record.originImage,
    resultImageUrl: record.resultImage
  };

  console.log('转换后的详情数据:', selectedRecord.value);
  detailInfoVisible.value = true;
};

// 下载报告
const downloadReport = async (record: HistoryRecord) => {
  try {
    pdfExportLoading.value.set(record.id, true);
    const blob = await fetchErHistoryPdf(record.id);
    pdfExportLoading.value.set(record.id, false);
    // 检查响应是否为有效的Blob对象
    if (!(blob instanceof Blob)) {
      throw new Error('下载失败：响应数据不是有效的 Blob');
    }
    // 创建下载链接
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `EmergenceRate_Report_${record.id}.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // 清理内存
    URL.revokeObjectURL(downloadUrl);
    ElMessage.success(`检测编号 ${record.id} 的报告下载成功`);
  } catch (error) {
    ElMessage.error('报告下载失败，请稍后重试');
  }
};

// 生命周期
onMounted(() => {
  initHistoryData();
});
</script>

<template>
  <div class="history-content">
    <div class="history-layout">
      <!-- 左侧：搜索筛选区域 -->
      <div class="filter-sidebar">
        <el-card class="filter-card">
          <template #header>
            <div class="filter-header">
              <el-icon><Search /></el-icon>
              <span>搜索筛选</span>
            </div>
          </template>

          <div class="filter-form">
            <div class="filter-item">
              <label class="filter-label">检测地块</label>
              <el-input v-model="searchForm.landId" placeholder="搜索地块代码，如：hjg001" clearable prefix-icon="Search" />
            </div>

            <div class="filter-item">
              <label class="filter-label">检测日期</label>
              <el-date-picker
                v-model="searchForm.detectionDate"
                type="date"
                placeholder="选择检测日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </div>

            <div class="filter-item">
              <label class="filter-label">出苗率范围</label>
              <el-select v-model="searchForm.emergenceRateRange" placeholder="选择范围" clearable>
                <el-option label="0-25%" value="0-25" />
                <el-option label="25-50%" value="25-50" />
                <el-option label="50-75%" value="50-75" />
                <el-option label="75-100%" value="75-100" />
              </el-select>
            </div>

            <div class="filter-item">
              <label class="filter-label">出苗情况</label>
              <el-select v-model="searchForm.emergenceStatus" placeholder="选择情况" clearable>
                <el-option label="正常" value="正常" />
                <el-option label="低度缺苗" value="低度缺苗" />
                <el-option label="中度缺苗" value="中度缺苗" />
                <el-option label="高度缺苗" value="高度缺苗" />
              </el-select>
            </div>

            <div class="filter-actions">
              <el-button type="primary" :loading="historyLoading" @click="searchRecords">
                <el-icon class="mr-1"><Search /></el-icon>
                搜索
              </el-button>
              <el-button style="margin: 0" @click="resetSearch">重置</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：检测记录列表 -->
      <div class="records-main">
        <el-card>
          <template #header>
            <div class="records-header">
              <div class="records-title">
                <el-icon><List /></el-icon>
                <span>检测记录</span>
                <el-tag type="info" class="ml-2">{{ filteredRecords.length }} 条</el-tag>
              </div>
              <div class="records-actions">
                <el-button type="success" icon="Download" size="small">导出</el-button>
                <el-button type="primary" icon="Refresh" size="small" :loading="historyLoading" @click="refreshData">刷新</el-button>
              </div>
            </div>
          </template>

          <div class="history-records">
            <el-table
              v-loading="historyLoading"
              :data="paginatedRecords"
              stripe
              :header-cell-style="{ background: 'var(--el-fill-color-light)', fontWeight: '600' }"
            >
              <el-table-column prop="id" label="编号" min-width="140" />
              <el-table-column prop="baseName" label="基地" min-width="110" />
              <el-table-column prop="landCode" label="地块" min-width="90" />
              <el-table-column prop="detectionDate" label="日期" min-width="110" />
              <el-table-column prop="detectionTime" label="时间" width="90">
                <template #default="{ row }">
                  <span>{{ row.detectionTime || '14:30' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="emergenceRate" label="出苗率" width="90">
                <template #default="{ row }">
                  <span style="color: var(--el-color-success); font-weight: 600">{{ row.emergenceRate }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="emergenceStatus" label="状态" min-width="110">
                <template #default="{ row }">
                  <el-tag :type="EmergenceStatusMap[row.emergenceStatus]?.btnType || 'info'" size="small">
                    {{ EmergenceStatusMap[row.emergenceStatus]?.label || row.emergenceStatus }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="viewDetail(row)">查看</el-button>
                  <!-- <el-button type="success" size="small" @click="downloadReport(row)">下载</el-button> -->
                  <el-button type="success" size="small" :loading="pdfExportLoading.get(row.id) || false" @click="downloadReport(row)">
                    下载
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页组件 -->
            <div v-show="pagination.total > 0" class="pagination-wrapper">
              <pagination
                v-model:page="pagination.pageNum"
                v-model:limit="pagination.pageSize"
                :total="pagination.total"
                @pagination="handlePaginationChange"
              />
            </div>

            <!-- 空状态 -->
            <div v-if="!historyLoading && historyRecords.length === 0" class="empty-state">
              <el-empty description="暂无历史检测记录" />
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- DetailInfo弹窗组件 -->
    <DetailInfo v-model="detailInfoVisible" :detection-data="selectedRecord" />
  </div>
</template>

<style lang="scss" scoped>
.history-content {
  height: 100%;
}

.history-layout {
  display: flex;
  gap: 16px;
  height: 100%;
}

// 左侧筛选栏
.filter-sidebar {
  width: 280px;
  flex-shrink: 0;

  .filter-card {
    position: sticky;
    top: 16px;

    :deep(.el-card__header) {
      padding: 16px 20px;
      background: var(--el-fill-color-light);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .filter-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    .el-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }
  }

  .filter-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .filter-item {
    .filter-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-regular);
      margin-bottom: 8px;
    }

    .el-select,
    .el-date-picker {
      width: 100%;
    }
  }

  .filter-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;

    .el-button {
      width: 100%;
    }
  }
}

// 右侧记录列表
.records-main {
  flex: 1;
  min-width: 0;

  .records-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .records-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;

      .el-icon {
        font-size: 18px;
        color: var(--el-color-primary);
      }
    }

    .records-actions {
      display: flex;
      gap: 8px;
    }
  }

  .history-records {
    .el-table {
      margin-bottom: 16px;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding: 16px 0;
      margin-top: 8px;
    }

    .empty-state {
      padding: 40px 0;
    }
  }
}

// 响应式布局
@media (max-width: 1200px) {
  .history-layout {
    flex-direction: column;
  }

  .filter-sidebar {
    width: 100%;

    .filter-card {
      position: static;
    }

    .filter-form {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .filter-actions {
        grid-column: span 2;
        flex-direction: row;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .filter-sidebar {
    .filter-form {
      grid-template-columns: 1fr;

      .filter-actions {
        grid-column: span 1;
      }
    }
  }
}
</style>
