<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <div class="flex items-center justify-between gap-4">
            <!-- 搜索表单 -->
            <el-form ref="queryFormRef" :model="areaDetectionQueryParams" :inline="true" class="flex-1">
              <el-form-item label="区域名称" prop="farmlandName">
                <el-input v-model="areaDetectionQueryParams.farmlandName" placeholder="请输入区域名称" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 检测类型切换按钮组 -->
            <div class="header-right-tools">
              <el-button :type="detectionType === 'area' ? 'primary' : 'default'" @click="detectionType = 'area'">
                <el-icon><MapLocation /></el-icon>
                <span>病害区域检测结果</span>
              </el-button>
              <el-button :type="detectionType === 'plant' ? 'primary' : 'default'" @click="detectionType = 'plant'">
                <el-icon><MessageBox /></el-icon>
                <span>病虫害植株检测结果</span>
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </transition>

    <!-- 病害区域检测结果展示 -->
    <el-card v-if="detectionType === 'area'" shadow="never" class="detection-result-card">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <el-icon class="text-green-600" :size="20"><MapLocation /></el-icon>
            <span class="text-lg font-semibold text-gray-800">病害区域检测结果</span>
            <el-tag type="success" size="small" effect="plain">{{ total }} 条记录</el-tag>
          </div>
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button v-hasPermi="['pestcontrol:farmland:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
                >修改</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['pestcontrol:farmland:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
                >删除</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['pestcontrol:farmland:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
          </el-row>
        </div>
      </template>

      <!-- 区域检测结果列表 -->
      <el-table v-loading="loading" :data="areaDetectionRecords" class="detection-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="区域名称" align="center" prop="farmlandName" min-width="160">
          <template #default="scope">
            <span class="font-medium">{{ `${scope.row.baseName}-${scope.row.plotName}` }}</span>
          </template>
        </el-table-column>
        <el-table-column label="病害名" align="center" prop="diseaseType" min-width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.diseaseType" type="danger" size="small" effect="plain">
              {{ scope.row.diseaseType }}
            </el-tag>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="病害发生率" align="center" prop="incidenceRate" min-width="100">
          <template #default="scope">
            <div class="flex items-center justify-center gap-1">
              <span
                class="text-sm font-semibold"
                :class="{
                  'text-green-600': scope.row.incidenceRate < 10,
                  'text-yellow-600': scope.row.incidenceRate >= 10 && scope.row.incidenceRate < 30,
                  'text-red-600': scope.row.incidenceRate >= 30
                }"
              >
                {{ scope.row.incidenceRate ? scope.row.incidenceRate.toFixed(2) + '%' : '-' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="病害程度" align="center" min-width="80">
          <template #default="scope">
            <el-tag :type="DiseaseSeverityMap[useDiseaseState(scope.row.incidenceRate)].btnType" size="small">
              {{ DiseaseSeverityMap[useDiseaseState(scope.row.incidenceRate)].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="检测图像" align="center" min-width="240">
          <template #default="scope">
            <div class="flex items-center justify-center gap-3">
              <div class="image-preview-wrapper">
                <ImagePreview class="w-20 h-16 rounded border border-gray-200" :src="scope.row.rgbOriginalImage" />
                <span class="text-xs text-gray-500 mt-1">原始图像</span>
              </div>
              <el-icon class="text-gray-400"><Right /></el-icon>
              <div class="image-preview-wrapper">
                <ImagePreview class="w-20 h-16 rounded border border-gray-200" :src="scope.row.rgbResultImage" />
                <span class="text-xs text-green-600 mt-1 font-medium">检测结果</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="检测时间" align="center" prop="createTime" width="160">
          <template #default="scope">
            <div class="flex items-center justify-center gap-1 text-sm text-gray-600">
              <el-icon :size="14"><Clock /></el-icon>
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template #default="scope">
            <div class="flex items-center justify-center gap-1">
              <el-button
                v-hasPermi="['pestcontrol:farmland:query']"
                link
                type="primary"
                icon="Download"
                title="下载报告"
                @click="handleDownloadAreaDetectionReport(scope.row)"
              />
              <el-button
                v-hasPermi="['pestcontrol:farmland:remove']"
                link
                type="danger"
                icon="Delete"
                title="删除"
                @click="handleDelete(scope.row)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="areaDetectionQueryParams.pageNum"
        v-model:limit="areaDetectionQueryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <!-- 病害植株检测结果展示 -->
    <el-card v-if="detectionType === 'plant'" shadow="never" class="detection-result-card">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <el-icon class="text-blue-600" :size="20"><MessageBox /></el-icon>
            <span class="text-lg font-semibold text-gray-800">病虫害植株检测结果</span>
            <el-tag type="primary" size="small" effect="plain">{{ plantTotal }} 条记录</el-tag>
          </div>
          <div class="flex gap-2">
            <el-button type="primary" plain icon="Plus" @click="handleAddPlantDetection">新增检测</el-button>
            <el-button type="warning" plain icon="Download" @click="handleExportPlantDetection">导出</el-button>
          </div>
        </div>
      </template>

      <!-- 植株检测结果表格展示 -->
      <el-table v-loading="plantLoading" :data="plantDetectionList" class="detection-table">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="基地名" align="center" prop="baseName" min-width="100">
          <template #default="scope">
            <span class="font-medium">{{ scope.row.baseName || '侯家沟' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="地块名" align="center" prop="plotCode" min-width="100">
          <template #default="scope">
            <span class="font-medium">{{ scope.row.plotCode || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="病虫害类型" align="center" prop="diseaseType" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.diseaseType" type="danger" size="small" effect="plain">
              {{ scope.row.diseaseType }}
            </el-tag>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="病虫害名" align="center" prop="diseaseType" min-width="120">
          <template #default="scope">
            <span class="font-medium">{{ scope.row.diseaseType || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="监测图像" align="center" min-width="120">
          <template #default="scope">
            <div class="flex items-center justify-center gap-3">
              <div class="image-preview-wrapper">
                <el-image
                  v-if="scope.row.resultImageUrl"
                  :src="scope.row.resultImageUrl"
                  :preview-src-list="[scope.row.resultImageUrl]"
                  fit="cover"
                  class="w-20 h-16 rounded border border-gray-200 cursor-pointer"
                  :preview-teleported="true"
                >
                  <template #error>
                    <div class="w-20 h-16 flex items-center justify-center bg-gray-100 rounded">
                      <el-icon class="text-gray-400"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-else class="w-20 h-16 flex items-center justify-center bg-gray-100 rounded">
                  <el-icon class="text-gray-400"><Picture /></el-icon>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="检测时间" align="center" prop="createTime" min-width="160">
          <template #default="scope">
            <div class="flex items-center justify-center gap-2">
              <el-icon class="text-blue-500"><Clock /></el-icon>
              <span>{{ scope.row.createTime || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="120">
          <template #default="scope">
            <div class="flex items-center justify-center gap-1">
              <el-button type="success" link icon="Download" title="下载" @click="handleDownloadPlantReport(scope.row)" />
              <el-button type="danger" link icon="Delete" title="删除" @click="handleDeletePlant(scope.row)" />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="plantTotal > 0"
        v-model:page="plantResultQueryParams.pageNum"
        v-model:limit="plantResultQueryParams.pageSize"
        :total="plantTotal"
        @pagination="getPlantList"
      />

      <!-- 空状态 -->
      <el-empty v-if="!plantLoading && plantDetectionList.length === 0" description="暂无植株检测记录" :image-size="120" class="my-8">
        <el-button type="primary" @click="handleAddPlantDetection">开始检测</el-button>
      </el-empty>
    </el-card>
    <!-- 添加或修改区域信息对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="farmlandFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="区域名称" prop="farmlandName">
          <el-input v-model="form.farmlandName" placeholder="请输入区域名称" />
        </el-form-item>
        <el-form-item label="病虫害类别" prop="pestTypes">
          <el-input v-model="form.pestTypes" placeholder="请输入病虫害类别" />
        </el-form-item>
        <el-form-item label="病虫害防治策略" prop="pestTactics">
          <el-input v-model="form.pestTactics" placeholder="请输入病虫害防治策略" />
        </el-form-item>
        <el-form-item label="原始全景图像" prop="originImageUrl">
          <el-input v-model="form.originImageUrl" placeholder="请输入原始全景图像" />
        </el-form-item>
        <el-form-item label="识别处理全景图像" prop="processedImageUrl">
          <el-input v-model="form.processedImageUrl" placeholder="请输入识别处理全景图像" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 区域检测详情对话框 -->
    <DetailDialog v-model="detailDialogVisible" :data="currentDetailData" />
  </div>
</template>

<script setup name="Farmland" lang="ts">
import { DataAnalysis, MapLocation, MessageBox, Location, Picture, Right, Clock, View, Download, Edit, Delete, Plus } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import {
  listFarmland,
  getFarmland,
  delFarmland,
  addFarmland,
  updateFarmland,
  listAreaDetectionRecords,
  delAreaDetectionRecord,
  downloadAreaDetectionReport,
  downloadPlantReport,
  listPlantResults,
  delPlantResult
} from './api';
import { FarmlandVO, FarmlandQuery, FarmlandForm, AreaDetectionRecord, AreaDetectionQuery, PlantResultRecord, PlantResultQuery } from './api/types';
import DetailDialog from './components/DetailDialog.vue';
import { useDiseaseState } from './hooks';
import { DiseaseSeverityMap } from './const';
import { ElMessage } from 'element-plus';
import ImagePreview from '@/views/four/components/imagePreview/index.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

// 检测类型切换
const detectionType = ref<'area' | 'plant'>('area');
const detectionTypeOptions = [
  {
    label: '病害区域检测记录',
    value: 'area',
    icon: MapLocation
  },
  {
    label: '病虫害植株检测记录',
    value: 'plant',
    icon: MessageBox
  }
];

const farmlandList = ref<FarmlandVO[]>([]);
const areaDetectionRecords = ref<AreaDetectionRecord[]>([]);

// 植株检测数据
const plantDetectionList = ref<PlantResultRecord[]>([]);
const plantLoading = ref(false);
const plantTotal = ref(0);

// 详情对话框
const detailDialogVisible = ref(false);
const currentDetailData = ref<AreaDetectionRecord | null>(null);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const farmlandFormRef = ref<ElFormInstance>();
const router = useRouter();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FarmlandForm = {
  farmlandId: undefined,
  farmlandName: undefined,
  pestTypes: undefined,
  pestTactics: undefined,
  originImageUrl: undefined,
  processedImageUrl: undefined
};
const data = reactive<PageData<FarmlandForm, FarmlandQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    farmlandId: undefined,
    farmlandName: undefined,
    pestTypes: undefined,
    params: {}
  },
  rules: {
    farmlandName: [{ required: true, message: '区域名称不能为空', trigger: 'blur' }],
    pestType: [{ required: true, message: '病虫害类别不能为空', trigger: 'change' }],
    originImageUrl: [{ required: true, message: '原始全景图像不能为空', trigger: 'blur' }],
    processedImageUrl: [{ required: true, message: '识别处理全景图像不能为空', trigger: 'blur' }]
  }
});

// 区域检测记录查询参数
const areaDetectionQueryParams = reactive<AreaDetectionQuery>({
  pageNum: 1,
  pageSize: 5,
  farmlandName: undefined,
  diseaseType: undefined,
  params: {}
});

// 植株检测记录查询参数
const plantResultQueryParams = reactive<PlantResultQuery>({
  pageNum: 1,
  pageSize: 5,
  baseName: undefined,
  diseaseType: undefined,
  params: {}
});

const { queryParams, form, rules } = toRefs(data);
const { pageNum, pageSize, farmlandName, diseaseType } = toRefs(areaDetectionQueryParams);

/** 查询区域信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAreaDetectionRecords(areaDetectionQueryParams);
  areaDetectionRecords.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 查询植株检测结果列表 */
const getPlantList = async () => {
  plantLoading.value = true;
  try {
    const res = await listPlantResults(plantResultQueryParams);
    plantDetectionList.value = res.rows;
    plantTotal.value = res.total;
  } catch (error) {
    console.error('获取植株检测数据失败:', error);
    proxy?.$modal.msgError('获取植株检测数据失败');
  } finally {
    plantLoading.value = false;
  }
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  farmlandFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  areaDetectionQueryParams.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: FarmlandVO[]) => {
  ids.value = selection.map((item) => item.farmlandId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加区域信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: FarmlandVO) => {
  reset();
  const _farmlandId = row?.farmlandId || ids.value[0];
  const res = await getFarmland(_farmlandId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改区域信息';
};

/** 提交按钮 */
const submitForm = () => {
  farmlandFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.farmlandId) {
        await updateFarmland(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFarmland(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: AreaDetectionRecord) => {
  const id = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除区域信息编号为"' + id + '"的数据项？').finally(() => (loading.value = false));
  await delAreaDetectionRecord(id);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 下载区域检测报告 */
const handleDownloadAreaDetectionReport = async (row: AreaDetectionRecord) => {
  try {
    ElMessage.info(`正在下载${row.baseName}-${row.plotName}的检测报告...`);
    const blob = await downloadAreaDetectionReport(row.id);

    // 检查响应是否为有效的Blob对象
    if (!(blob instanceof Blob)) {
      throw new Error('下载失败：响应数据不是有效的 Blob');
    }

    // 创建下载链接
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `区域检测报告_${row.baseName}_${row.plotName}_${row.id}.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理内存
    URL.revokeObjectURL(downloadUrl);
    ElMessage.success('报告下载成功');
  } catch (error) {
    console.error('下载报告失败:', error);
    ElMessage.error('报告下载失败，请稍后重试');
  }
};

/** 下载植株尺度报告 */
const handleDownloadPlantReport = async (row: PlantResultRecord) => {
  try {
    ElMessage.info(`正在下载${row.baseName}-${row.plotCode}的检测报告...`);
    const blob = await downloadPlantReport(row.id);

    // 检查响应是否为有效的Blob对象
    if (!(blob instanceof Blob)) {
      throw new Error('下载失败：响应数据不是有效的 Blob');
    }

    // 创建下载链接
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `病虫害检测报告_${row.baseName}_${row.plotCode}_${row.id}.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理内存
    URL.revokeObjectURL(downloadUrl);
    ElMessage.success('报告下载成功');
  } catch (error) {
    console.error('下载报告失败:', error);
    ElMessage.error('报告下载失败，请稍后重试');
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'pestcontrol/areaDetection/export',
    {
      ...queryParams.value
    },
    `farmland_${new Date().getTime()}.xlsx`
  );
};

/** 查看区域检测详情 */
const handleViewDetail = (row: AreaDetectionRecord) => {
  currentDetailData.value = row;
  detailDialogVisible.value = true;
};

/** 新增植株检测 */
const handleAddPlantDetection = () => {
  router.push('/process/pestcontrol/identify');
};

/** 导出植株检测报告 */
const handleExportPlantDetection = () => {
  proxy?.download('pestcontrol/PlantResults/export?', {}, `plant_detection_${new Date().getTime()}.xlsx`);
};

/** 删除植株检测记录 */
const handleDeletePlant = async (row: PlantResultRecord) => {
  await proxy?.$modal.confirm(`是否确认删除${row.baseName}-${row.plotCode}的检测记录？`);
  await delPlantResult(row.id);
  proxy?.$modal.msgSuccess('删除成功');
  await getPlantList();
};

onMounted(() => {
  getList();
  getPlantList();

  // 检查URL查询参数,如果有type参数则设置对应的检测类型
  if (route.query.type) {
    const typeParam = route.query.type as string;
    if (typeParam === 'area' || typeParam === 'plant') {
      detectionType.value = typeParam;
    }
  }
});
</script>

<style lang="scss" scoped>
.detection-result-card {
  :deep(.el-card__header) {
    background: linear-gradient(to right, #f8fafc, #f1f5f9);
    border-bottom: 2px solid #e2e8f0;
    padding: 16px 20px;
  }
}

.detection-table {
  :deep(.el-table__header) {
    th {
      background-color: #f9fafb;
      color: #374151;
      font-weight: 600;
    }
  }
}

.image-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.detection-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;

  &:hover {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
    border-color: #3b82f6;
  }
}

// 响应式优化
@media (max-width: 768px) {
  .detection-card {
    margin-bottom: 16px;
  }
}
</style>
