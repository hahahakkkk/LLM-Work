<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="知识类型" prop="knowledgeType">
              <el-select v-model="queryParams.knowledgeType" placeholder="请选择知识类型" clearable>
                <el-option v-for="dict in four_knowledge_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="文件名称" prop="originalName">
              <el-input v-model="queryParams.originalName" placeholder="请输入文件名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!--<el-form-item label="文件后缀" prop="fileSuffix">
              <el-input v-model="queryParams.fileSuffix" placeholder="请输入文件后缀" clearable @keyup.enter="handleQuery" />
            </el-form-item>-->
            <el-form-item label="上传时间" style="width: 308px">
              <el-date-picker
                v-model="dateRangeCreateTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:know:upload']" type="primary" plain icon="Upload" @click="handleFile">上传文件</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:know:download']" type="warning" plain icon="Download" :disabled="multiple" @click="handleBatchDownload">
              批量下载
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:know:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table
        v-if="showTable"
        v-loading="loading"
        :data="ossList"
        :header-cell-class-name="handleHeaderClass"
        @selection-change="handleSelectionChange"
        @header-click="handleHeaderCLick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="对象存储主键" align="center" prop="ossId" />
        <el-table-column label="文件类型" align="center" width="100">
          <template #default="scope">
            <el-tag :type="getFileTypeTag(scope.row.fileSuffix).type">
              {{ getFileTypeTag(scope.row.fileSuffix).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="知识类型" align="center" prop="knowledgeType">
          <template #default="scope">
            <dict-tag :options="four_knowledge_type" :value="scope.row.knowledgeType" />
          </template>
        </el-table-column>
        <el-table-column label="文件名称" align="center" prop="originalName" width="290" />
        <!--<el-table-column label="文件后缀" align="center" prop="fileSuffix" />-->
        <el-table-column label="文件预览" align="center" prop="url">
          <template #default="scope">
            <imagePreview v-if="isImage(scope.row.fileSuffix)" :width="100" :height="100" :src="scope.row.url" />
            <videoPreview v-else-if="isVideo(scope.row.fileSuffix)" :src="scope.row.url" :width="180" :height="90" />
            <a v-else-if="!isImage(scope.row.fileSuffix)" :href="scope.row.url" target="_blank" rel="noopener noreferrer" class="file-link">
              查看文件
            </a>
            <span v-else v-text="scope.row.url" />
          </template>
        </el-table-column>
        <el-table-column label="文件大小" align="center">
          <template #default="scope">
            <!-- 调用格式化方法转换为 MB -->
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column v-if="false" label="文件URL" align="center" prop="url" />
        <el-table-column label="上传时间" align="center" prop="createTime" width="180" sortable="custom">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上传人" align="center" prop="createByName" width="80" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="downloadLoading[scope.row.ossId] ? '下载中' : '下载'" placement="top">
              <el-button
                v-hasPermi="['four:know:download']"
                link
                type="primary"
                :icon="downloadLoading[scope.row.ossId] ? 'Loading' : 'Download'"
                :loading="downloadLoading[scope.row.ossId]"
                @click="handleDownload(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['four:know:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改OSS对象存储对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="ossFormRef" :model="form" :rules="rules" label-width="80px">
        <!-- 新增：知识类型下拉框 -->
        <el-form-item label="知识类型" prop="knowledgeType">
          <el-select v-model="form.knowledgeType" placeholder="请选择知识类型" clearable @change="handleKnowledgeTypeChange">
            <el-option v-for="dict in four_knowledge_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="文件名">
          <knowUpload
            v-model="form.file"
            :file-size="500"
            :limit="50"
            :file-type="['png', 'jpg', 'webp', 'docx', 'xlsx', 'pptx', 'txt', 'pdf', 'mp4', 'avi', 'mov', 'wmv', 'zip', 'rar', '7z']"
            :config-key="'knowledge'"
            :knowledge-type="form.knowledgeType"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="KnowledgeBase" lang="ts">
import { listOss, deleteOss } from '../api/oss';
import { OssForm, OssQuery, OssVO } from '../api/oss/types';
import fileUpload from '@/views/four/components/fileUpload/index.vue';
import knowUpload from '@/views/four/components/knowUpload/index.vue';
import imagePreview from '@/views/four/components/imagePreview/index.vue';
import videoPreview from '@/views/four/components/videoPreview/index.vue';
import { downloadOss } from '../plugins/download';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_knowledge_type } = toRefs<any>(proxy?.useDict('four_knowledge_type'));

const ossList = ref<OssVO[]>([]);
const showTable = ref(true);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const type = ref(0);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 默认排序
const defaultSort = ref({ prop: 'createTime', order: 'ascending' });

const ossFormRef = ref<ElFormInstance>();
const queryFormRef = ref<ElFormInstance>();

const initFormData = {
  file: undefined,
  knowledgeType: ''
};
const data = reactive<PageData<OssForm, OssQuery>>({
  form: { ...initFormData },
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fileName: '',
    originalName: '',
    fileSuffix: '',
    createTime: '',
    service: '',
    knowledgeType: '',
    orderByColumn: defaultSort.value.prop,
    isAsc: defaultSort.value.order
  },
  rules: {
    file: [{ required: true, message: '文件不能为空', trigger: 'blur' }],
    knowledgeType: [{ required: true, message: '知识类型不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询OSS对象存储列表 */
const getList = async () => {
  loading.value = true;
  const response = await listOss(proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'CreateTime'));
  console.log('知识库中的listOss', response);
  ossList.value = response.rows;
  total.value = response.total;
  loading.value = false;
  showTable.value = true;
};

// 判断是否图片
function isImage(fileSuffix: string) {
  const arr = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tif', '.jfif'];
  const suffixArray = Array.isArray(fileSuffix) ? fileSuffix : [fileSuffix];
  return suffixArray.some((suffix) => arr.includes(suffix.toLowerCase()));
}

function isVideo(fileSuffix: string) {
  const arr = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
  const suffixArray = Array.isArray(fileSuffix) ? fileSuffix : [fileSuffix];
  return suffixArray.some((suffix) => arr.includes(suffix.toLowerCase()));
}

// 获取文件类型标签
function getFileTypeTag(fileSuffix: string) {
  fileSuffix = (fileSuffix || '').toLowerCase().replace('.', '');

  // 图片类型
  const imageTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tif', 'svg'];
  // 文档类型
  const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
  // 视频类型
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
  // 音频类型
  const audioTypes = ['mp3', 'wav', 'aac', 'flac', 'ogg'];
  // 压缩包类型
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];

  if (imageTypes.includes(fileSuffix)) {
    return { type: 'success', text: '图像' };
  } else if (documentTypes.includes(fileSuffix)) {
    return { type: 'primary', text: '文档' };
  } else if (videoTypes.includes(fileSuffix)) {
    return { type: 'warning', text: '视频' };
  } else if (audioTypes.includes(fileSuffix)) {
    return { type: 'default', text: '音频' };
  } else if (archiveTypes.includes(fileSuffix)) {
    return { type: 'danger', text: '压缩包' };
  } else {
    return { type: 'info', text: '其他' };
  }
}
/** 取消按钮 */
function cancel() {
  dialog.visible = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = { ...initFormData };
  ossFormRef.value?.resetFields();
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  showTable.value = false;
  dateRangeCreateTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  queryParams.value.orderByColumn = defaultSort.value.prop;
  queryParams.value.isAsc = defaultSort.value.order;
  handleQuery();
}
/** 选择条数  */
function handleSelectionChange(selection: OssVO[]) {
  ids.value = selection.map((item) => item.ossId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 设置列的排序为我们自定义的排序 */
const handleHeaderClass = ({ column }: any): any => {
  column.order = column.multiOrder;
};
/** 点击表头进行排序 */
const handleHeaderCLick = (column: any) => {
  if (column.sortable !== 'custom') {
    return;
  }
  switch (column.multiOrder) {
    case 'descending':
      column.multiOrder = 'ascending';
      break;
    case 'ascending':
      column.multiOrder = '';
      break;
    default:
      column.multiOrder = 'descending';
      break;
  }
  handleOrderChange(column.property, column.multiOrder);
};
const handleOrderChange = (prop: string, order: string) => {
  let orderByArr = queryParams.value.orderByColumn ? queryParams.value.orderByColumn.split(',') : [];
  let isAscArr = queryParams.value.isAsc ? queryParams.value.isAsc.split(',') : [];
  let propIndex = orderByArr.indexOf(prop);
  if (propIndex !== -1) {
    if (order) {
      //排序里已存在 只修改排序
      isAscArr[propIndex] = order;
    } else {
      //如果order为null 则删除排序字段和属性
      isAscArr.splice(propIndex, 1); //删除排序
      orderByArr.splice(propIndex, 1); //删除属性
    }
  } else {
    //排序里不存在则新增排序
    orderByArr.push(prop);
    isAscArr.push(order);
  }
  //合并排序
  queryParams.value.orderByColumn = orderByArr.join(',');
  queryParams.value.isAsc = isAscArr.join(',');
  getList();
};

/** 文件按钮操作 */
const handleFile = () => {
  reset();
  type.value = 0;
  dialog.visible = true;
  dialog.title = '上传文件';
};
/** 提交按钮 */
const submitForm = () => {
  dialog.visible = false;
  getList();
};

// 用于控制每个下载按钮的加载状态
const downloadLoading = ref<Record<string | number, boolean>>({});

/** 下载按钮操作 */
const handleDownload = async (row?: OssVO) => {
  if (!row || !row.ossId) {
    proxy?.$modal.msgError('无有效下载链接');
    return;
  }

  const ossId = row.ossId;
  downloadLoading.value[ossId] = true; // 显示加载状态

  try {
    proxy?.$modal.msgSuccess('下载开始，文件将自动保存');
    await downloadOss(row.ossId); // 调用你原来的下载方法
    // 下载成功后，延迟一小会儿恢复图标（视觉更自然）
    setTimeout(() => {
      downloadLoading.value[ossId] = false;
    }, 500);
  } catch (error) {
    console.error('下载失败:', error);
    proxy?.$modal.msgError('下载失败，请重试');
    downloadLoading.value[ossId] = false; // 立即恢复图标
  }
};

/** 批量下载按钮操作 */
const handleBatchDownload = async () => {
  if (ids.value.length === 0) {
    proxy?.$modal.msgWarning('请至少选择一个文件进行下载');
    return;
  }
  try {
    proxy?.$modal.msgSuccess('批量下载开始，文件将自动保存');
    await downloadOss(ids.value); // 调用插件中支持数组的 downloadOss 方法
  } catch (error) {
    console.error('批量下载失败:', error);
    proxy?.$modal.msgError('批量下载失败，请重试');
  }
};

/** 删除按钮操作 */
const handleDelete = async (row?: OssVO) => {
  const ossIds = row?.ossId || ids.value;
  await proxy?.$modal.confirm('是否确认删除OSS对象存储编号为"' + ossIds + '"的数据项?');
  loading.value = true;
  // await delOss(ossIds).finally(() => (loading.value = false));
  await deleteOss(ossIds).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

// 格式化文件大小工具方法,转换为MB
const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes || bytes === 0) return '0.00MB';

  const gb = 1024 * 1024;
  const size = (bytes / gb).toFixed(2); // 直接转换为 MB 并保留两位小数

  return `${size}MB`;
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.file-link {
  color: #409eff; /* 蓝色链接 */
  text-decoration: none; /* 去掉下划线 */
  cursor: pointer; /* 鼠标悬停时显示手型 */
}
</style>
