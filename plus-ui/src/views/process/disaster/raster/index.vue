<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadRawFile, UploadUserFile } from 'element-plus';
import { Refresh, Document, Picture, Search, Calendar } from '@element-plus/icons-vue';
import { listCompute, uploadCompute } from '@/api/disaster/compute';

// 更新响应类型，匹配后端返回的高清预览图和栅格数据地址
type JobResp = {
  taskId: string;
  pngUrl?: string; // 高清可视化图地址 (300 DPI)
  tifUrl?: string; // NDVI/TVDI 栅格 TIF 地址
  message: string;
};

// 历史记录类型定义
type MinioFileVO = {
  name: string;
  shortName: string;
  url: string;
  size: number;
  lastModified: string;
};

const activeTab = ref<'ndvi' | 'tvdi'>('ndvi');

// 文件列表，严格限制长度为 1
const ndviFileList = ref<UploadUserFile[]>([]);
const tvdiFileList = ref<UploadUserFile[]>([]);

// NDVI 输入：Red 和 NIR
const ndviBands = ref({ red: 3, nir: 4 });
// TVDI 输入：改为 NDVI 波段和 LST 波段
const tvdiBands = ref({ ndvi: 1, lst: 2 });

const ndviLoading = ref(false);
const tvdiLoading = ref(false);

const ndviTaskId = ref<string>('');
const tvdiTaskId = ref<string>('');

// 存储计算结果对象
const ndviResult = ref<JobResp | null>(null);
const tvdiResult = ref<JobResp | null>(null);

// 历史记录状态
const historyList = ref<MinioFileVO[]>([]);
const historyLoading = ref(false);

// 查询条件
const ndviSearchQuery = ref({
  keyword: '',
  dateRange: [] as string[]
});

const tvdiSearchQuery = ref({
  keyword: '',
  dateRange: [] as string[]
});

// 分页配置
const ndviPagination = ref({
  currentPage: 1,
  pageSize: 5,
  total: 0
});

const tvdiPagination = ref({
  currentPage: 1,
  pageSize: 5,
  total: 0
});

// 任务配置
const taskId = ref<string>(`task-id-${Date.now()}`);
const bucket = 'disaster-bkt';
const inputObject = ref<string>('');
const resultPrefix = 'rs_result/'; // 修改为结果文件夹路径

// 计算属性：筛选 NDVI 相关的历史记录
const ndviHistory = computed(() => {
  return historyList.value.filter((file) => {
    const lowerName = file.name.toLowerCase();
    // 匹配包含 ndvi 关键字或特定模式的文件
    return lowerName.includes('ndvi') && (lowerName.endsWith('.png') || lowerName.endsWith('.tif') || lowerName.endsWith('.tiff'));
  });
});

// 计算属性：筛选 TVDI 相关的历史记录
const tvdiHistory = computed(() => {
  return historyList.value.filter((file) => {
    const lowerName = file.name.toLowerCase();
    // 匹配包含 tvdi 关键字或特定模式的文件
    return lowerName.includes('tvdi') && (lowerName.endsWith('.png') || lowerName.endsWith('.tif') || lowerName.endsWith('.tiff'));
  });
});

// 计算属性：根据查询条件筛选 NDVI 历史记录
const filteredNdviHistory = computed(() => {
  let result = [...ndviHistory.value];

  // 按关键词筛选
  if (ndviSearchQuery.value.keyword) {
    const keyword = ndviSearchQuery.value.keyword.toLowerCase();
    result = result.filter((file) => file.name.toLowerCase().includes(keyword) || file.shortName.toLowerCase().includes(keyword));
  }

  // 按时间范围筛选
  if (ndviSearchQuery.value.dateRange && ndviSearchQuery.value.dateRange.length === 2) {
    const [startDate, endDate] = ndviSearchQuery.value.dateRange;
    result = result.filter((file) => {
      const fileDate = new Date(file.lastModified).toISOString().split('T')[0];
      return fileDate >= startDate && fileDate <= endDate;
    });
  }

  return result;
});

// 计算属性：根据查询条件筛选 TVDI 历史记录
const filteredTvdiHistory = computed(() => {
  let result = [...tvdiHistory.value];

  // 按关键词筛选
  if (tvdiSearchQuery.value.keyword) {
    const keyword = tvdiSearchQuery.value.keyword.toLowerCase();
    result = result.filter((file) => file.name.toLowerCase().includes(keyword) || file.shortName.toLowerCase().includes(keyword));
  }

  // 按时间范围筛选
  if (tvdiSearchQuery.value.dateRange && tvdiSearchQuery.value.dateRange.length === 2) {
    const [startDate, endDate] = tvdiSearchQuery.value.dateRange;
    result = result.filter((file) => {
      const fileDate = new Date(file.lastModified).toISOString().split('T')[0];
      return fileDate >= startDate && fileDate <= endDate;
    });
  }

  return result;
});

// 计算属性：NDVI 分页数据
const pagedNdviHistory = computed(() => {
  const { currentPage, pageSize } = ndviPagination.value;
  const filtered = filteredNdviHistory.value;
  ndviPagination.value.total = filtered.length;

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return filtered.slice(start, end);
});

// 计算属性：TVDI 分页数据
const pagedTvdiHistory = computed(() => {
  const { currentPage, pageSize } = tvdiPagination.value;
  const filtered = filteredTvdiHistory.value;
  tvdiPagination.value.total = filtered.length;

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return filtered.slice(start, end);
});

// 重置查询条件
const resetNdviSearch = () => {
  ndviSearchQuery.value = { keyword: '', dateRange: [] };
  ndviPagination.value.currentPage = 1; // 重置到第一页
};

const resetTvdiSearch = () => {
  tvdiSearchQuery.value = { keyword: '', dateRange: [] };
  tvdiPagination.value.currentPage = 1; // 重置到第一页
};

// 分页处理
const handleNdviPageChange = (page: number) => {
  ndviPagination.value.currentPage = page;
};

const handleTvdiPageChange = (page: number) => {
  tvdiPagination.value.currentPage = page;
};

// 获取历史记录
const fetchHistory = async () => {
  historyLoading.value = true;
  try {
    const res = await listCompute({ bucket: bucket, prefix: resultPrefix });
    // 注意：对应后端 Result 类，数据在 res.data 中
    historyList.value = (res as any).data || [];
  } catch (e: any) {
    console.error('获取历史记录失败', e);
  } finally {
    historyLoading.value = false;
  }
};

onMounted(() => {
  fetchHistory();
});

const beforeUploadTif = (rawFile: UploadRawFile) => {
  const name = rawFile.name?.toLowerCase() || '';
  const ok = name.endsWith('.tif') || name.endsWith('.tiff');
  if (!ok) ElMessage.error('只支持 .tif / .tiff 文件');
  return ok;
};

// 单文件限制警告
const limit1Warn = () => ElMessage.warning('当前仅支持单影像分析，请先移除旧文件再上传新文件');

// 通用下载函数
const handleDownload = (url: string | undefined) => {
  if (!url) return ElMessage.warning('下载地址不存在');
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.click();
};

const submitNDVI = async () => {
  if (ndviFileList.value.length === 0) return ElMessage.warning('请先上传 NDVI 待算影像');

  const form = new FormData();
  form.append('file', ndviFileList.value[0].raw as File);
  form.append('bands', JSON.stringify({ redBand: ndviBands.value.red, nirBand: ndviBands.value.nir }));
  form.append('taskId', taskId.value);
  form.append('bucket', bucket);
  form.append('inputObject', inputObject.value);
  form.append('resultPrefix', resultPrefix);

  ndviLoading.value = true;
  ndviResult.value = null;
  try {
    const resp = await uploadCompute(form);
    ndviTaskId.value = resp.taskId || '';
    ndviResult.value = resp;
    ElMessage.success(resp?.message || 'NDVI 任务计算完成');
    fetchHistory(); // 成功后刷新历史记录
  } catch (e: any) {
    ElMessage.error(e?.message || 'NDVI 提交失败');
  } finally {
    ndviLoading.value = false;
  }
};

const submitTVDI = async () => {
  if (tvdiFileList.value.length === 0) return ElMessage.warning('请先上传 TVDI 待算影像（含NDVI+LST）');

  const form = new FormData();
  form.append('file', tvdiFileList.value[0].raw as File);
  form.append(
    'bands',
    JSON.stringify({
      redBand: tvdiBands.value.ndvi,
      lstBand: tvdiBands.value.lst
    })
  );
  form.append('taskId', taskId.value);
  form.append('bucket', bucket);
  form.append('inputObject', inputObject.value);
  form.append('resultPrefix', resultPrefix);

  tvdiLoading.value = true;
  tvdiResult.value = null;
  try {
    const resp = await uploadCompute(form, {
      headers: { isToken: false, repeatSubmit: false, isEncrypt: false }
    });
    tvdiTaskId.value = resp.taskId || '';
    tvdiResult.value = resp;
    ElMessage.success(resp?.message || 'TVDI 任务计算完成');
    fetchHistory(); // 成功后刷新历史记录
  } catch (e: any) {
    ElMessage.error(e?.message || 'TVDI 提交失败');
  } finally {
    tvdiLoading.value = false;
  }
};
</script>

<template>
  <div class="raster-page">
    <el-card class="raster-card">
      <template #header>
        <div class="header">
          <div class="title">干旱检测</div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="tabs">
        <el-tab-pane label="NDVI 植被指数" name="ndvi">
          <div class="panel">
            <el-alert title="要求：上传单个含 Red/NIR 波段的 TIF 文件。系统将输出 300 DPI 高清分析图及栅格结果。" type="info" show-icon />

            <div class="grid">
              <div class="block">
                <div class="block-title">数据上传 (单影像)</div>
                <el-upload
                  v-model:file-list="ndviFileList"
                  drag
                  :limit="1"
                  :auto-upload="false"
                  :before-upload="beforeUploadTif"
                  :on-exceed="limit1Warn"
                  accept=".tif,.tiff"
                >
                  <div class="el-upload__text">拖拽或点击上传单个影像文件</div>
                  <template #tip>
                    <div class="el-upload__tip">每次分析仅限 1 个文件。</div>
                  </template>
                </el-upload>
              </div>

              <div class="block">
                <div class="block-title">参数设置</div>
                <div class="form-row">
                  <span class="label">红光波段 (Red) 索引</span>
                  <el-input-number v-model="ndviBands.red" :min="1" />
                </div>
                <div class="form-row">
                  <span class="label">近红外波段 (NIR) 索引</span>
                  <el-input-number v-model="ndviBands.nir" :min="1" />
                </div>

                <el-button type="primary" :loading="ndviLoading" @click="submitNDVI" class="submit-btn"> 开始 NDVI 高清分析 </el-button>

                <div v-if="ndviResult" class="result-area">
                  <el-divider>分析结果</el-divider>
                  <el-image class="preview-image" :src="ndviResult.pngUrl" :preview-src-list="[ndviResult.pngUrl]" fit="contain" />
                  <div class="btn-group">
                    <el-button size="small" type="success" @click="handleDownload(ndviResult.pngUrl)">下载高清图</el-button>
                    <el-button size="small" type="primary" @click="handleDownload(ndviResult.tifUrl)">下载栅格TIF</el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- NDVI 历史记录 -->
            <div class="history-section">
              <el-divider>
                <div class="divider-content">
                  <el-icon><Document /></el-icon>
                  <span>历史记录 </span>
                </div>
              </el-divider>

              <!-- NDVI 查询表单 -->
              <div class="history-query">
                <div class="query-form">
                  <el-input
                    v-model="ndviSearchQuery.keyword"
                    placeholder="输入文件名关键词搜索"
                    clearable
                    style="width: 250px; margin-right: 10px"
                    @input="ndviPagination.currentPage = 1"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>

                  <el-date-picker
                    v-model="ndviSearchQuery.dateRange"
                    type="daterange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 280px; margin-right: 10px"
                    @change="ndviPagination.currentPage = 1"
                    ;
                  >
                    <template #prefix>
                      <el-icon><Calendar /></el-icon>
                    </template>
                  </el-date-picker>

                  <el-button type="default" @click="resetNdviSearch" size="small">重置</el-button>
                  <el-button :icon="Refresh" circle size="small" @click="fetchHistory" :loading="historyLoading" style="margin-left: 5px" />
                </div>
              </div>

              <el-table :data="pagedNdviHistory" v-loading="historyLoading" size="small" border stripe max-height="300">
                <el-table-column label="结果文件" min-width="220">
                  <template #default="scope">
                    <div class="file-cell">
                      <el-icon v-if="scope.row.name.endsWith('.png')"><Picture /></el-icon>
                      <el-icon v-else><Document /></el-icon>
                      <span class="file-name">{{ scope.row.shortName }}</span>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column label="文件类型" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.name.endsWith('.tif') ? 'primary' : 'success'" size="small">
                      {{ scope.row.name.endsWith('.tif') ? '栅格' : '图片' }}
                    </el-tag>
                  </template>
                </el-table-column>

                <el-table-column label="大小" width="100">
                  <template #default="scope"> {{ (scope.row.size / 1024 / 1024).toFixed(2) }} MB </template>
                </el-table-column>

                <el-table-column prop="lastModified" label="生成时间" width="160" sortable />

                <el-table-column label="操作" width="90" fixed="right" align="center">
                  <template #default="scope">
                    <el-button link type="primary" @click="handleDownload(scope.row.url)">下载</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- NDVI 分页器 -->
              <div class="pagination-container" v-if="filteredNdviHistory.length > 0">
                <el-pagination
                  v-model:current-page="ndviPagination.currentPage"
                  v-model:page-size="ndviPagination.pageSize"
                  :page-sizes="[5, 10, 20, 50]"
                  :total="ndviPagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  background
                  small
                  @current-change="handleNdviPageChange"
                  @size-change="
                    (size) => {
                      ndviPagination.pageSize = size;
                      ndviPagination.currentPage = 1;
                    }
                  "
                />
              </div>

              <div v-if="filteredNdviHistory.length === 0 && !historyLoading" class="empty-tip">
                <el-empty description="暂无NDVI历史记录" />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="TVDI 旱情监测" name="tvdi">
          <div class="panel">
            <el-alert title="要求：上传已合并 NDVI 和 LST 波段的单文件 TIF，系统将拟合干湿边进行计算。" type="warning" show-icon />

            <div class="grid">
              <div class="block">
                <div class="block-title">数据上传 (NDVI+LST 合并图)</div>
                <el-upload
                  v-model:file-list="tvdiFileList"
                  drag
                  :limit="1"
                  :auto-upload="false"
                  :before-upload="beforeUploadTif"
                  :on-exceed="limit1Warn"
                  accept=".tif,.tiff"
                >
                  <div class="el-upload__text">上传合并后的分析影像</div>
                </el-upload>
              </div>

              <div class="block">
                <div class="block-title">波段索引设置</div>
                <div class="form-row">
                  <span class="label">NDVI 波段索引</span>
                  <el-input-number v-model="tvdiBands.ndvi" :min="1" />
                </div>
                <div class="form-row">
                  <span class="label">LST (地表温度) 索引</span>
                  <el-input-number v-model="tvdiBands.lst" :min="1" />
                </div>

                <el-button type="warning" :loading="tvdiLoading" @click="submitTVDI" class="submit-btn"> 开始 TVDI 旱情监测 </el-button>

                <div v-if="tvdiResult" class="result-area">
                  <el-divider>监测结果</el-divider>
                  <el-image class="preview-image" :src="tvdiResult.pngUrl" :preview-src-list="[tvdiResult.pngUrl]" fit="contain" />
                  <div class="btn-group">
                    <el-button size="small" type="success" @click="handleDownload(tvdiResult.pngUrl)">保存可视化</el-button>
                    <el-button size="small" type="primary" @click="handleDownload(tvdiResult.tifUrl)">导出数据</el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- TVDI 历史记录 -->
            <div class="history-section">
              <el-divider>
                <div class="divider-content">
                  <el-icon><Document /></el-icon>
                  <span>历史记录</span>
                </div>
              </el-divider>

              <!-- TVDI 查询表单 -->
              <div class="history-query">
                <div class="query-form">
                  <el-input
                    v-model="tvdiSearchQuery.keyword"
                    placeholder="输入文件名关键词搜索"
                    clearable
                    style="width: 250px; margin-right: 10px"
                    @input="tvdiPagination.currentPage = 1"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>

                  <el-date-picker
                    v-model="tvdiSearchQuery.dateRange"
                    type="daterange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 280px; margin-right: 10px"
                    @change="tvdiPagination.currentPage = 1"
                  >
                    <template #prefix>
                      <el-icon><Calendar /></el-icon>
                    </template>
                  </el-date-picker>

                  <el-button type="default" @click="resetTvdiSearch" size="small">重置</el-button>
                  <el-button :icon="Refresh" circle size="small" @click="fetchHistory" :loading="historyLoading" style="margin-left: 5px" />
                </div>
              </div>

              <el-table :data="pagedTvdiHistory" v-loading="historyLoading" size="small" border stripe max-height="300">
                <el-table-column label="结果文件" min-width="220">
                  <template #default="scope">
                    <div class="file-cell">
                      <el-icon v-if="scope.row.name.endsWith('.png')"><Picture /></el-icon>
                      <el-icon v-else><Document /></el-icon>
                      <span class="file-name">{{ scope.row.shortName }}</span>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column label="文件类型" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.name.endsWith('.tif') ? 'primary' : 'success'" size="small">
                      {{ scope.row.name.endsWith('.tif') ? '栅格' : '图片' }}
                    </el-tag>
                  </template>
                </el-table-column>

                <el-table-column label="大小" width="100">
                  <template #default="scope"> {{ (scope.row.size / 1024 / 1024).toFixed(2) }} MB </template>
                </el-table-column>

                <el-table-column prop="lastModified" label="生成时间" width="160" sortable />

                <el-table-column label="操作" width="90" fixed="right" align="center">
                  <template #default="scope">
                    <el-button link type="primary" @click="handleDownload(scope.row.url)">下载</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- TVDI 分页器 -->
              <div class="pagination-container" v-if="filteredTvdiHistory.length > 0">
                <el-pagination
                  v-model:current-page="tvdiPagination.currentPage"
                  v-model:page-size="tvdiPagination.pageSize"
                  :page-sizes="[5, 10, 20, 50]"
                  :total="tvdiPagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  background
                  small
                  @current-change="handleTvdiPageChange"
                  @size-change="
                    (size) => {
                      tvdiPagination.pageSize = size;
                      tvdiPagination.currentPage = 1;
                    }
                  "
                />
              </div>

              <div v-if="filteredTvdiHistory.length === 0 && !historyLoading" class="empty-tip">
                <el-empty description="暂无TVDI历史记录" />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.raster-page {
  padding: 12px;
  background-color: #f5f7fa;
  min-height: 90vh;
}
.raster-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}
.header .title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}
.panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
}
.block {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
}
.block-title {
  font-weight: 700;
  margin-bottom: 12px;
  color: #409eff;
}
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  .label {
    color: #606266;
    font-size: 13px;
  }
}
.submit-btn {
  width: 100%;
  margin-top: 8px;
  font-weight: bold;
}

/* 结果展示样式 */
.result-area {
  margin-top: 20px;
  text-align: center;
  animation: slideUp 0.4s ease-out;
}
.preview-image {
  width: 100%;
  height: 200px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background: #fafafa;
  cursor: zoom-in;
}
.btn-group {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* 历史记录部分样式 */
.history-section {
  margin-top: 20px;
  .divider-content {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    color: #606266;
  }

  .history-query {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #ebeef5;

    .query-form {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .file-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    .file-name {
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }
  }

  .empty-tip {
    text-align: center;
    padding: 40px 0;
    color: #909399;
  }

  /* 分页容器样式 */
  .pagination-container {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    padding: 12px 0;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #ebeef5;

    /* 修改分页器字体大小 */
    :deep(.el-pagination) {
      font-size: 16px; /* 调整整个分页器的字体大小 */
    }

    /* 调整页码按钮字体大小 */
    :deep(.el-pagination__sizes),
    :deep(.el-pagination__jump),
    :deep(.el-pagination__total) {
      font-size: 16px;
    }

    /* 调整页码数字字体大小 */
    :deep(.number) {
      font-size: 16px;
    }

    /* 调整翻页按钮大小 */
    :deep(.btn-prev),
    :deep(.btn-next) {
      .el-icon {
        font-size: 20px; /* 调整箭头图标大小 */
      }
    }

    /* 调整跳转输入框字体大小 */
    :deep(.el-pagination__editor) {
      .el-input__inner {
        font-size: 16px;
        padding: 0 8px;
        height: 32px;
      }
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1000px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .history-query .query-form {
    flex-direction: column;
    align-items: stretch;

    .el-input,
    .el-date-picker,
    .el-button {
      width: 100% !important;
      margin-right: 0 !important;
      margin-bottom: 8px;
    }
  }
}
</style>
