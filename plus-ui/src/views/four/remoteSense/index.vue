<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地" prop="baseId" v-has-roles="['superadmin', 'sysadmin', 'govadmin']">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable>
                <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <!--<el-form-item label="谷子生育期" prop="growthPeriod" label-width="90px">
              <el-select v-model="queryParams.growthPeriod" placeholder="请选择谷子生育期" clearable>
                <el-option v-for="dict in four_growth_period" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>-->
            <el-form-item label="采集时间" style="width: 308px">
              <el-date-picker
                v-model="dateRangeCollectTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              />
            </el-form-item>
            <!--<el-form-item label="采集方式" prop="collectWay">
              <el-select v-model="queryParams.collectWay" placeholder="请选择采集方式" clearable>
                <el-option v-for="dict in four_collect_way" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>-->
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
            <el-button v-hasPermi="['four:remoteSense:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:remoteSense:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:remoteSense:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <!--<el-col :span="1.5">
            <el-button v-hasPermi="['four:remoteSense:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>-->
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="remoteSenseList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!--<el-table-column label="遥感数据ID" align="center" prop="fourId" v-if="true" />-->
        <el-table-column label="基地" align="center" prop="baseId">
          <template #default="scope">
            <dict-tag :options="four_base_name" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="地块" align="center" prop="plotId">
          <template #default="scope">
            <dict-tag :options="allLandDict" :value="scope.row.plotId" />
          </template>
        </el-table-column>
        <el-table-column label="生育期" align="center" prop="growthPeriod">
          <template #default="scope">
            <dict-tag :options="four_growth_period" :value="scope.row.growthPeriod" />
          </template>
        </el-table-column>
        <el-table-column label="预览图" align="center" prop="previewImage">
          <template #default="scope">
            <imagePreview :width="100" :height="100" :src="scope.row.previewImage" />
          </template>
        </el-table-column>
        <el-table-column label="采集时间" align="center" prop="collectTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.collectTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <!--<el-table-column label="采集方式" align="center" prop="collectWay">
          <template #default="scope">
            <dict-tag :options="four_collect_way" :value="scope.row.collectWay" />
          </template>
        </el-table-column>-->
        <el-table-column label="用途" align="center" prop="useFor">
          <template #default="scope">
            <dict-tag :options="four_image_usefor" :value="scope.row.useFor" />
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center" prop="imageType">
          <template #default="scope">
            <dict-tag :options="four_image_type" :value="scope.row.imageType" />
          </template>
        </el-table-column>
        <el-table-column label="大小" align="center" prop="fileSize" :formatter="(_, __, cellValue) => formatFileSize(cellValue)" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['four:remoteSense:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip :content="downloadLoading[scope.row.fourId] ? '下载中' : '下载'" placement="top">
              <el-button
                v-hasPermi="['four:remoteSense:download']"
                link
                type="primary"
                :icon="downloadLoading[scope.row.fourId] ? 'Loading' : 'Download'"
                :loading="downloadLoading[scope.row.fourId]"
                @click="handleDownload(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['four:remoteSense:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改无人机遥感数据对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="remoteSenseFormRef" :model="form" :rules="rules" label-width="95px">
        <el-form-item label="基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地">
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地块" prop="plotId">
          <el-select
            v-model="form.plotId"
            placeholder="请选择地块"
            clearable
            filterable
            @focus="dialog.title === '修改无人机遥感数据' && (isEditingPlotInUpdate = true)"
            @blur="isEditingPlotInUpdate = false"
          >
            <!-- 新增用landDict（有效地块），修改时：未主动编辑，用allLandDict（全部地块）；主动编辑（点击下拉框），用 landDict（有效地块） -->
            <el-option
              v-for="dict in dialog.title === '添加无人机遥感数据' ? landDict : isEditingPlotInUpdate ? landDict : allLandDict"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生育期" prop="growthPeriod">
          <el-select v-model="form.growthPeriod" placeholder="请选择谷子生育期">
            <el-option v-for="dict in four_growth_period" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预览图" prop="previewImage">
          <el-button type="primary" plain icon="Upload" style="width: 50%" @click="openPreviewUploadDialog">{{
            form.previewImage ? '已上传' : '上传预览图'
          }}</el-button>
        </el-form-item>
        <el-form-item label="遥感图像" prop="fileLocation">
          <el-button type="primary" plain icon="Upload" style="width: 50%" @click="openUploadDialog">{{
            form.fileLocation ? '已上传' : '上传无人机遥感图像'
          }}</el-button>
        </el-form-item>
        <el-form-item label="采集时间" prop="collectTime" style="width: 100%">
          <el-date-picker v-model="form.collectTime" clearable type="date" value-format="YYYY-MM-DD" placeholder="请选择采集时间" style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <!--<el-form-item label="采集方式" prop="collectWay">
          <el-select v-model="form.collectWay" placeholder="请选择采集方式">
            <el-option v-for="dict in four_collect_way" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>-->
        <el-form-item label="用途" prop="useFor">
          <el-select v-model="form.useFor" placeholder="请选择用途">
            <el-option v-for="dict in four_image_usefor" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="imageType">
          <el-select v-model="form.imageType" placeholder="请选择类型">
            <el-option v-for="dict in four_image_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="大小" prop="fileSize">
          <el-input v-model="form.fileSize" :value="formatFileSize(form.fileSize)" placeholder="文件大小，不可编辑" readonly />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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

    <!-- 遥感图像上传OSS对话框 -->
    <el-dialog v-model="uploadDialog.visible" :title="uploadDialog.title" width="500px" append-to-body>
      <el-form ref="ossFormRef" :model="form" label-width="80px">
        <el-form-item label="文件名">
          <fileUpload v-model="form.fileLocation" :config-key="'rsi'" @file-all-size="(bytes) => (form.fileSize = bytes)" />
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

<script setup name="RemoteSense" lang="ts">
import { listRemoteSense, getRemoteSense, delRemoteSense, addRemoteSense, updateRemoteSense } from '../api/remoteSense';
import { RemoteSenseVO, RemoteSenseQuery, RemoteSenseForm } from '../api/remoteSense/types';
import { deleteOss } from '../api/oss';
import { downloadOss } from '../plugins/download';
import { landDictQuery } from '@/views/mz_base/api/tableDict';
import imagePreview from '@/views/four/components/imagePreview/index.vue';
import fileUpload from '@/views/four/components/fileUpload/index.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_base_name, four_collect_way, four_growth_period, four_image_usefor, four_image_type } = toRefs<any>(
  proxy?.useDict('four_base_name', 'four_collect_way', 'four_growth_period', 'four_image_usefor', 'four_image_type')
);

const remoteSenseList = ref<RemoteSenseVO[]>([]);
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
const remoteSenseFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: RemoteSenseForm = {
  fourId: undefined,
  baseId: undefined,
  plotId: undefined,
  growthPeriod: undefined,
  previewImage: undefined,
  fileLocation: undefined,
  fileSize: undefined,
  collectTime: undefined,
  collectWay: undefined,
  useFor: undefined,
  imageType: undefined,
  remark: undefined
};
const data = reactive<PageData<RemoteSenseForm, RemoteSenseQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    growthPeriod: undefined,
    collectWay: undefined,
    params: {
      collectTime: undefined
    }
  },
  rules: {
    fourId: [{ required: true, message: '主键不能为空', trigger: 'blur' }],
    baseId: [{ required: true, message: '基地不能为空', trigger: 'blur' }],
    plotId: [{ required: true, message: '地块不能为空', trigger: 'blur' }],
    growthPeriod: [{ required: true, message: '生育期不能为空', trigger: 'blur' }],
    previewImage: [{ required: true, message: '预览图不能为空', trigger: 'blur' }],
    fileLocation: [{ required: true, message: '遥感图像不能为空', trigger: 'blur' }],
    collectTime: [{ required: true, message: '采集时间不能为空', trigger: 'blur' }],
    collectWay: [{ required: true, message: '采集方式不能为空', trigger: 'blur' }],
    useFor: [{ required: true, message: '用途不能为空', trigger: 'blur' }],
    imageType: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
    fileSize: [{ required: true, message: '文件大小不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询无人机遥感数据列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCollectTime.value, 'CollectTime');
  const res = await listRemoteSense(queryParams.value);
  console.log('listRemoteSense', res);
  remoteSenseList.value = res.rows;
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
  remoteSenseFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: RemoteSenseVO[]) => {
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
  dialog.title = '添加无人机遥感数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: RemoteSenseVO) => {
  reset();
  // 每次打开修改弹窗，重置编辑状态（默认false显示全部地块）
  isEditingPlotInUpdate.value = false;
  const _fourId = row?.fourId || ids.value[0];
  const res = await getRemoteSense(_fourId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改无人机遥感数据';
};

/** 提交按钮 */
const submitForm = () => {
  remoteSenseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.fourId) {
        await updateRemoteSense(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addRemoteSense(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: RemoteSenseVO) => {
  const _fourIds = row?.fourId || ids.value;
  const _previewImages = row?.previewImage || previewImages.value;
  const _fileLocations = row?.fileLocation || fileLocations.value;
  await proxy?.$modal.confirm('是否确认删除遥感数据编号为"' + _fourIds + '"的数据项？').finally(() => (loading.value = false));
  await deleteOss(_previewImages); //先删除文件
  await deleteOss(_fileLocations); //先删除文件
  await delRemoteSense(_fourIds); //再删除记录
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/*const handleDelete = async (row?: RemoteSenseVO) => {
  const _fourIds = row?.fourId ? [row.fourId] : ids.value; // 多选时获取所有选中的 ID
  const isSingleDelete = !!row; // 判断是否是单条删除

  // 提示用户确认删除
  await proxy?.$modal.confirm('是否确认删除遥感数据编号为"' + _fourIds.join(',') + '"的数据项？').finally(() => (loading.value = false));

  if (isSingleDelete) {
    // 单条删除逻辑
    if (row?.previewImage) {
      await deleteOss(row.previewImage); // 删除预览图像
    }
    if (row?.fileLocation) {
      await deleteOss(row.fileLocation); // 删除图像文件
    }
    await delRemoteSense(_fourIds); // 再删除该条记录
  } else {
    // 多条删除逻辑
    const selectedRows = remoteSenseList.value.filter(item => ids.value.includes(item.fourId)); // 获取所有选中的记录
    const deletePromises = selectedRows.map(async (selectedRow) => {
      if (selectedRow.previewImage) {
        return deleteOss(selectedRow.previewImage); // 删除预览图像
      }
      if (selectedRow.fileLocation) {
        return deleteOss(selectedRow.fileLocation); // 删除图像文件
      }
    });

    try {
      await Promise.all(deletePromises); // 并行删除图像文件
    } catch (error) {
      proxy?.$modal.msgError('删除图像文件时出错');
      return;
    }

    await delRemoteSense(_fourIds); // 删除数据库记录
  }

  proxy?.$modal.msgSuccess('删除成功');
  await getList(); // 刷新列表
};*/

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'four/remoteSense/export',
    {
      ...queryParams.value
    },
    `remoteSense_${new Date().getTime()}.xlsx`
  );
};

/** 以下为上传图像-ltq */

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
// const handleDownload = (row?: RemoteSenseVO) => {
//   downloadOss(row.fileLocation);
// };
const handleDownload = async (row?: RemoteSenseVO) => {
  if (!row || !row.fileLocation) {
    proxy?.$modal.msgError('无有效下载链接');
    return;
  }

  const fourId = row.fourId;
  downloadLoading.value[fourId] = true; // 显示加载状态

  try {
    proxy?.$modal.msgSuccess('下载开始，文件将自动保存');
    await downloadOss(row.fileLocation); // 调用你原来的下载方法
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

/**
 * 地块字典
 */
// 标记修改场景下是否主动编辑地块（默认false：显示全部地块；true：切换为有效地块）
const isEditingPlotInUpdate = ref(false);
// 存储全部地块字典（用于列表显示、修改数据）
const allLandDict = ref<DictDataOption[]>([]);
// isValid=1的地块字典（用于新增数据）
const landDict = ref<DictDataOption[]>([]);

const getDicts = async () => {
  let res = await landDictQuery();
  console.log('查询出的地块字典：', JSON.stringify(res, null, 2));
  // 处理原始数据并转换格式
  const processedData = res.rows.map((item: any) => ({
    label: item.label,
    value: String(item.value),
    elTagType: item.elTagType,
    elTagClass: item.elTagClass,
    // 保留isValid字段用于过滤
    isValid: item.isValid
  }));

  // 按中文拼音排序
  processedData.sort((a, b) => a.label.localeCompare(b.label, 'zh'));

  // 全部数据赋值（用于列表显示）
  allLandDict.value = processedData;

  // 下拉框只保留有效数据（isValid为1）
  landDict.value = processedData.filter((item) => item.isValid === 1);
  // 打印过滤后的字典对数量
  console.log('过滤后的地块字典数量：', landDict.value.length);
  console.log('过滤后的地块字典：', JSON.stringify(landDict.value, null, 2));
};

onMounted(() => {
  getDicts();
  getList();
});
</script>
