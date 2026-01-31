<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="标题" prop="dataTitle">
              <el-input v-model="queryParams.dataTitle" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="采集时间" style="width: 308px">
              <el-date-picker
                v-model="dateRangeCollectTime"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              />
            </el-form-item>
            <el-form-item label="用途" prop="useFor">
              <el-select v-model="queryParams.useFor" placeholder="请选择用途" clearable>
                <el-option v-for="dict in four_image_usefor" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:dataset:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:dataset:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:dataset:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:dataset:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <!-- ================= 卡片区域 ================= -->
      <el-row v-loading="loading" :gutter="16">
        <el-col v-for="item in datasetList" :key="item.fourId" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <!-- 卡片 -->
          <el-card :body-style="{ padding: 0 }" shadow="hover" style="position: relative; border-radius: 8px; margin-bottom: 15px">
            <!-- 1. 顶部预览图 -->
            <div style="width: 100%; height: 160px; overflow: hidden; border-radius: 8px">
              <imagePreview width="100%" height="160" :src="item.previewImage" fit="cover" />
            </div>

            <!-- 2. 中部信息 -->
            <div style="padding: 12px 0px 20px 0px">
              <div class="font-bold text-base mb-1">{{ item.dataTitle }}</div>

              <!-- 信息列表 -->
              <div style="font-size: 12px; color: #666; line-height: 20px">
                <!-- 第一行 -->
                <div style="display: flex; margin-top: 8px">
                  <div style="flex: 1">大小：{{ formatFileSize(item.dataSize) }}</div>
                  <div style="flex: 1">文件数量：{{ item.dataAmount }}</div>
                </div>

                <!-- 第二行 -->
                <div style="display: flex; margin-top: 2px">
                  <div style="flex: 1; display: flex; align-items: center">
                    <span>用途：</span>
                    <dict-tag :options="four_image_usefor" :value="item.useFor" />
                  </div>
                  <div style="flex: 1">采集时间：{{ parseTime(item.collectTime, '{y}-{m}-{d}') }}</div>
                </div>
              </div>

              <!-- 说明信息 -->
              <div class="card-description">
                <span class="font-bold text-gray-500">说明:</span>
                <el-scrollbar height="100px">
                  <pre class="remark-pre">{{ item.remark }}</pre>
                </el-scrollbar>
              </div>
            </div>

            <!-- 3. 复选框 + 操作按钮（合并到同一行） -->
            <div
              style="
                position: absolute;
                bottom: 5px;
                left: 0;
                right: 0;
                padding: 0 20px; /* 与中部信息左右 12px 保持一致 */
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <!-- 左：复选框 -->
              <el-checkbox v-model="selectionMap[item.fourId]" style="margin: 0" @change="toggleSelect(item)" />

              <!-- 右：操作按钮 -->
              <div style="display: flex; align-items: center">
                <el-button v-hasPermi="['four:dataset:edit']" link type="primary" icon="Edit" @click="handleUpdate(item)" />
                <el-tooltip :content="downloadLoading[item.fourId] ? '下载中' : '下载'" placement="top">
                  <el-button
                    v-hasPermi="['four:dataset:download']"
                    link
                    type="primary"
                    :icon="downloadLoading[item.fourId] ? 'Loading' : 'Download'"
                    :loading="downloadLoading[item.fourId]"
                    @click="handleDownload(item)"
                  ></el-button>
                </el-tooltip>
                <el-button v-hasPermi="['four:dataset:remove']" link type="primary" icon="Delete" @click="handleDelete(item)" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        :page-sizes="[8, 16, 24, 32]"
        @pagination="getList"
      />
    </el-card>

    <!-- 添加或修改模型库数据集对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="datasetFormRef" :model="form" :rules="rules" label-width="95px">
        <el-form-item label="标题" prop="dataTitle">
          <el-input v-model="form.dataTitle" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="预览图" prop="previewImage">
          <el-button type="primary" plain icon="Upload" style="width: 50%" @click="openPreviewUploadDialog">{{
            form.previewImage ? '已上传' : '上传预览图'
          }}</el-button>
        </el-form-item>
        <el-form-item label="上传数据集" prop="fileLocation">
          <el-button type="primary" plain icon="Upload" style="width: 50%" @click="openUploadDialog">{{
            form.fileLocation ? '已上传' : '上传文件'
          }}</el-button>
        </el-form-item>
        <el-form-item label="大小" prop="dataSize">
          <el-input v-model="form.dataSize" :value="formatFileSize(form.dataSize)" placeholder="数据集大小，不可编辑" readonly />
        </el-form-item>
        <el-form-item label="文件数量" prop="dataAmount">
          <el-input v-model="form.dataAmount" placeholder="请输入数据集文件数量" />
        </el-form-item>
        <el-form-item label="采集时间" prop="collectTime">
          <el-date-picker v-model="form.collectTime" clearable type="date" value-format="YYYY-MM-DD" placeholder="请选择采集时间"> </el-date-picker>
        </el-form-item>
        <el-form-item label="用途" prop="useFor">
          <el-select v-model="form.useFor" placeholder="请选择用途">
            <el-option v-for="dict in four_image_usefor" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="说明" prop="remark">
          <el-input v-model="form.remark" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }" placeholder="请输入说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览图上传OSS对话框 -->
    <el-dialog v-model="previewUploadDialog.visible" :title="previewUploadDialog.title" width="500px" append-to-body>
      <el-form ref="previewOssFormRef" :model="form" label-width="80px">
        <el-form-item label="文件名">
          <fileUpload v-model="form.previewImage" :file-size="100" :file-type="['tif', 'png', 'jpg', 'webp']" :config-key="'preview'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitPreviewUploadForm">确 定</el-button>
          <el-button @click="closePreviewUploadDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 数据集上传OSS对话框 -->
    <el-dialog v-model="uploadDialog.visible" :title="uploadDialog.title" width="500px" append-to-body>
      <el-form ref="ossFormRef" :model="form" label-width="80px">
        <el-form-item label="文件名">
          <fileUpload
            v-model="form.fileLocation"
            :file-type="['zip', 'rar', '7z']"
            :config-key="'dataset'"
            @file-all-size="(bytes) => (form.dataSize = bytes)"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitUploadForm">确 定</el-button>
          <el-button @click="closeUploadDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Dataset" lang="ts">
import { listDataset, getDataset, delDataset, addDataset, updateDataset } from '@/views/four/api/dataset';
import { DatasetVO, DatasetQuery, DatasetForm } from '@/views/four/api/dataset/types';
import fileUpload from '@/views/four/components/fileUpload/index.vue';
import imagePreview from '@/views/four/components/imagePreview/index.vue';
import { deleteOss } from '@/views/four/api/oss';
import { downloadOss } from '@/views/four/plugins/download';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_image_usefor } = toRefs<any>(proxy?.useDict('four_image_usefor'));

const datasetList = ref<DatasetVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const previewImages = ref<Array<string | number>>([]); // 多选时获取所有选中的 previewImage
const fileLocations = ref<Array<string | number>>([]); // 多选时获取所有选中的 fileLocation
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCollectTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const datasetFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DatasetForm = {
  fourId: undefined,
  dataTitle: undefined,
  dataSize: undefined,
  dataAmount: undefined,
  previewImage: undefined,
  fileLocation: undefined,
  collectTime: undefined,
  useFor: undefined,
  remark: undefined
};
const data = reactive<PageData<DatasetForm, DatasetQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 8,
    dataTitle: undefined,
    collectTime: undefined,
    useFor: undefined,
    params: {}
  },
  rules: {
    fourId: [{ required: true, message: '主键不能为空', trigger: 'blur' }],
    dataTitle: [{ required: true, message: '标题不能为空', trigger: 'change' }],
    dataSize: [{ required: true, message: '大小不能为空', trigger: 'change' }],
    // dataAmount: [{ required: true, message: '文件数量不能为空', trigger: 'change' }],
    dataAmount: [
      { required: true, message: '文件数量不能为空', trigger: 'change' },
      {
        validator: (rule, value, callback) => {
          if (value === '' || value === undefined || value === null) {
            callback(new Error('文件数量不能为空'));
          } else if (!Number.isInteger(Number(value))) {
            callback(new Error('请输入整数'));
          } else if (Number(value) < 0) {
            callback(new Error('请输入正整数'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ],
    previewImage: [{ required: true, message: '预览图不能为空', trigger: 'change' }],
    fileLocation: [{ required: true, message: '上传文件不能为空', trigger: 'change' }],
    collectTime: [{ required: true, message: '采集时间不能为空', trigger: 'blur' }],
    useFor: [{ required: true, message: '用途不能为空', trigger: 'change' }],
    remark: [{ required: true, max: 2000, message: '说明长度不能超过2000字符', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 用来绑定 checkbox
const selectionMap = ref<Record<string | number, boolean>>({});

// 每次列表重新加载时清空 map
watch(datasetList, () => {
  selectionMap.value = {};
});

// 手动触发 el-table 里的 selection-change
function toggleSelect(row: DatasetVO) {
  // 临时构造一个 fake 的 selection 数组
  const checkedRows = datasetList.value.filter((d) => selectionMap.value[d.fourId]);
  handleSelectionChange(checkedRows);
}

/** 查询模型库数据集列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCollectTime.value, 'CollectTime');
  const res = await listDataset(queryParams.value);
  datasetList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  datasetFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangeCollectTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: DatasetVO[]) => {
  ids.value = selection.map((item) => item.fourId);
  previewImages.value = selection.map((item) => item.previewImage); // 多选时获取所有选中的 previewImage
  fileLocations.value = selection.map((item) => item.fileLocation); // 多选时获取所有选中的 fileLocation
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加模型库数据集';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: DatasetVO) => {
  reset();
  const _fourId = row?.fourId || ids.value[0];
  const res = await getDataset(_fourId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改模型库数据集';
};

/** 提交按钮 */
const submitForm = () => {
  datasetFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.fourId) {
        await updateDataset(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addDataset(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: DatasetVO) => {
  const _fourIds = row?.fourId || ids.value;
  const _previewImages = row?.previewImage || previewImages.value;
  const _fileLocations = row?.fileLocation || fileLocations.value;
  await proxy?.$modal.confirm('是否确认删除模型库数据集编号为"' + _fourIds + '"的数据项？').finally(() => (loading.value = false));
  await deleteOss(_previewImages); // 先删除文件
  await deleteOss(_fileLocations); // 先删除文件
  await delDataset(_fourIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'four/dataset/export',
    {
      ...queryParams.value
    },
    `dataset_${new Date().getTime()}.xlsx`
  );
};

/** 预览图上传对话框 */
const previewUploadDialog = reactive<DialogOption>({
  visible: false,
  title: '上传文件'
});

/** 打开预览图上传对话框 */
const openPreviewUploadDialog = () => {
  previewUploadDialog.visible = true;
};

/** 取消按钮-关闭预览图上传对话框 */
const closePreviewUploadDialog = async () => {
  previewUploadDialog.visible = false;
};

/** 确定按钮-关闭预览图上传对话框 */
const submitPreviewUploadForm = () => {
  previewUploadDialog.visible = false;
};

/** 上传文件对话框 */
const uploadDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

/** 打开上传文件对话框 */
const openUploadDialog = () => {
  uploadDialog.visible = true;
  uploadDialog.title = '上传文件';
};

/** 取消按钮-关闭上传文件对话框 */
const closeUploadDialog = async () => {
  uploadDialog.visible = false;
};

/** 确定按钮-关闭上传文件对话框 */
const submitUploadForm = () => {
  uploadDialog.visible = false;
};

// 格式化文件大小工具方法,转换为GB
const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes || bytes === 0) return;

  const gb = 1024 * 1024 * 1024; // 1GB = 1073741824 字节
  const size = (bytes / gb).toFixed(2); // 直接转换为 GB 并保留两位小数

  return `${size}GB`;
};

// 用于控制每个下载按钮的加载状态
const downloadLoading = ref<Record<string | number, boolean>>({});

/** 下载按钮操作 */
const handleDownload = async (item?: DatasetVO) => {
  if (!item || !item.fileLocation) {
    proxy?.$modal.msgError('无有效下载链接');
    return;
  }

  const fourId = item.fourId;
  downloadLoading.value[fourId] = true; // 显示加载状态

  try {
    proxy?.$modal.msgSuccess('下载开始，文件将自动保存');
    await downloadOss(item.fileLocation); // 调用你原来的下载方法
    // 下载成功后，延迟一小会儿恢复图标（视觉更自然）
    setTimeout(() => {
      downloadLoading.value[fourId] = false;
    }, 500);
  } catch (error) {
    console.error('下载失败:', error);
    proxy?.$modal.msgError('下载失败，请重试');
    downloadLoading.value[fourId] = false; // 立即恢复图标
  }
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.card-description {
  flex-grow: 1;
  font-size: 13px;
  margin-top: 20px;
}
.remark-pre {
  white-space: pre-wrap;
  word-break: break-word;
  color: #666;
  margin-top: 5px;
  line-height: 1.6;
}
</style>
