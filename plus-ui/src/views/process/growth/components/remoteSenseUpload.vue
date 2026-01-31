<template>
  <div class="upload-file">
    <!-- 修改点：确保容器使用 flex 且垂直居中 -->
    <div class="upload-buttons flex items-center gap-2">
      <!-- 修改点：调整按钮顺序并将选择按钮也放入 flex 流中 -->
      <el-button type="primary" @click="handleSelectExistingImage">选择已有图片</el-button>

      <el-upload
        ref="fileUploadRef"
        multiple
        :action="uploadFileUrl"
        :before-upload="handleBeforeUpload"
        :file-list="fileList"
        :limit="limit"
        :on-error="handleUploadError"
        :on-exceed="handleExceed"
        :on-success="handleUploadSuccess"
        :show-file-list="false"
        :headers="headers"
        class="upload-file-uploader"
      >
        <!-- 上传按钮 -->
        <el-button type="primary">本地上传</el-button>
      </el-upload>
    </div>
    <!-- 上传提示 -->
    <div v-if="showTip" class="el-upload__tip">
      上传<template v-if="fileSize"
        >不超过<b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType"
        >的<b style="color: #f56c6c">{{ fileType.join('/') }}</b> </template
      >文件
    </div>
    <!-- 文件列表 -->
    <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li v-for="(file, index) in fileList" :key="file.uid" class="el-upload-list__item ele-upload-list__item-content">
        <el-link :href="`${file.url}`" :underline="false" target="_blank">
          <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-button type="danger" link @click="handleDelete(index)">删除</el-button>
        </div>
      </li>
    </transition-group>

    <!-- 对话框：选择已有图片集 -->
    <el-dialog v-model="dialogVisible" title="选择已有图片集（点击卡片选择）" width="800px" append-to-body>
      <template v-if="remoteSenseList.length">
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <el-card
            v-for="(sense, index) in remoteSenseList"
            :key="sense.fourId"
            :class="{ active: selectedSenseIndex === index }"
            @click="selectedSenseIndex = index"
            class="sense-card"
            :body-style="{ padding: '0px' }"
          >
            <!-- 图像显示区域 -->
            <div class="sense-image-wrapper">
              <!-- 修改点：使用 imagePreview 组件，它支持直接传入 OSS ID -->
              <imagePreview :width="'100%'" :height="'160px'" :src="sense.previewImage" />
              <!-- 选中标记 -->
              <div v-if="selectedSenseIndex === index" class="selected-badge">
                <el-icon>
                  <Check />
                </el-icon>
              </div>
            </div>
            <!-- 信息显示区域 -->
            <div class="p-3">
              <div class="flex items-center mb-1">
                <span class="text-xs text-gray-400 mr-2">地块编号:</span>
                <span class="text-sm font-medium text-gray-700 truncate flex-1">
                  {{ getPlotLabel(sense.plotId) }}
                </span>
              </div>
              <!-- 显示生长时期，使用字典转化 -->
              <div class="flex items-center">
                <span class="text-xs text-gray-400 mr-2">生长时期:</span>
                <span class="text-sm text-gray-600">
                  {{ growth_diagnose_period.find((item) => item.value === sense.growthPeriod)?.label || '未知' }}
                </span>
              </div>
              <div class="flex items-center">
                <span class="text-xs text-gray-400 mr-2">采集时间:</span>
                <span class="text-sm text-gray-600">
                  {{ sense.collectTime ? sense.collectTime.split(' ')[0] : '未知' }}
                </span>
              </div>
            </div>
          </el-card>
        </div>
      </template>
      <template v-else>
        <el-empty description="暂无可选择的长势分析拼接图像" />
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :disabled="selectedSenseIndex === undefined" @click="handleConfirmSelection">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';
import { delOss as delSystemOss, listByIds as listSystemOssByIds } from '@/api/system/oss';
import { listByIds as listFourOssByIds } from '@/views/four/api/oss'; // 新增：导入 four 模块 OSS 接口
import { globalHeaders } from '@/utils/request';
import { listRemoteSense, getRemoteSense } from '@/views/four/api/remoteSense';
import type { RemoteSenseVO } from '@/views/four/api/remoteSense/types';
import { landDictQuery } from '@/views/mz_base/api/tableDict';
// 修改点：引入 imagePreview 组件
import imagePreview from '@/views/four/components/imagePreview/index.vue';
import { ElMessage } from 'element-plus';
import { Check } from '@element-plus/icons-vue';
// 引入生长时期字典

const props = defineProps({
  modelValue: {
    type: [String, Object, Array],
    default: () => []
  },
  // 数量限制
  limit: propTypes.number.def(5),
  // 大小限制(MB)
  fileSize: propTypes.number.def(5),
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: propTypes.array.def(['doc', 'xls', 'ppt', 'txt', 'pdf']),
  // 是否显示提示
  isShowTip: propTypes.bool.def(true)
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits(['update:modelValue', 'select']);
const number = ref(0);
const uploadList = ref<any[]>([]);
const isInnerChange = ref(false); // 内部变更标记位
const { growth_diagnose_period } = toRefs<any>(proxy?.useDict('growth_diagnose_period')); // 使用 growth_diagnose_period 字典
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadFileUrl = ref(baseUrl + '/four/oss/upload');
const headers = ref(globalHeaders());

const fileList = ref<any[]>([]);
const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize));

const fileUploadRef = ref<ElUploadInstance>();

// 新增：选择图片对话框相关状态
const dialogVisible = ref(false);
const remoteSenseList = ref<RemoteSenseVO[]>([]);
const selectedSenseIndex = ref<number | undefined>(undefined);

// 修改点：内部处理函数，用于从不同来源加载文件详情
const loadFileDetails = async (val: any) => {
  if (!val) return [];

  const ids = Array.isArray(val) ? val : String(val).split(',');
  let finalFileList: any[] = [];

  try {
    // 1. 优先尝试从 four 模块 OSS 获取
    const fourOssRes = await listFourOssByIds(ids.join(','));
    const fourFiles = (fourOssRes.data || []).map((oss) => ({
      name: oss.originalName || oss.fileName,
      url: oss.url,
      ossId: oss.ossId,
      uid: oss.ossId
    }));
    finalFileList = [...fourFiles];

    // 2. 检查缺失的 ID
    const loadedIds = fourFiles.map((f) => String(f.ossId));
    const missingIds = ids.filter((id) => !loadedIds.includes(String(id)));

    if (missingIds.length > 0) {
      for (const id of missingIds) {
        try {
          // 3. 尝试作为 remoteSense 的 fourId 获取
          const senseRes = await getRemoteSense(id);
          if (senseRes.data) {
            const sense = senseRes.data;
            finalFileList.push({
              name: `无人机图像-${sense.fourId}`,
              url: sense.previewImage,
              ossId: sense.fourId,
              fourId: sense.fourId,
              uid: sense.fourId
            });
          } else {
            // 4. 最后兜底尝试系统原有 OSS
            const systemRes = await listSystemOssByIds(id);
            if (systemRes.data && systemRes.data.length > 0) {
              const oss = systemRes.data[0];
              finalFileList.push({
                name: oss.originalName,
                url: oss.url,
                ossId: oss.ossId,
                uid: oss.ossId
              });
            }
          }
        } catch (e) {
          console.warn(`ID ${id} 解析失败`);
        }
      }
    }
  } catch (error) {
    console.error('Failed to load file details:', error);
  }

  return finalFileList;
};

watch(
  () => props.modelValue,
  async (val) => {
    // 修改点：只有在外部触发时才进行远程加载
    if (isInnerChange.value) {
      isInnerChange.value = false;
      return;
    }

    if (val) {
      const list = await loadFileDetails(val);
      let temp = 1;
      fileList.value = list.map((item) => {
        item.uid = item.uid || new Date().getTime() + temp++;
        return item;
      });
    } else {
      fileList.value = [];
    }
  },
  { deep: true, immediate: true }
);

const allLandDict = ref<any[]>([]);
// 新增：获取地块字典
const getDicts = async () => {
  try {
    const res = await landDictQuery();
    allLandDict.value = res.rows || [];
  } catch (error) {
    console.error('Failed to fetch land dict:', error);
  }
};

// 新增：通过ID获取地块标签
const getPlotLabel = (plotId: string | number) => {
  const dict = allLandDict.value.find((item) => String(item.value) === String(plotId));
  return dict ? dict.label : `地块 ID: ${plotId}`;
};

onMounted(() => {
  getDicts();
});

// 新增：打开选择已有图片对话框，只获取长势分析用途的拼接图像
const handleSelectExistingImage = async () => {
  try {
    const res = await listRemoteSense({
      pageNum: 1,
      pageSize: 1000,
      useFor: '2', // 长势分析 (对应你示例中的 "2")
      imageType: '1' // 拼接图像 (对应你示例中的 "1")
    });

    // 过滤出符合条件的数据
    // 使用 String() 转换以确保类型匹配，并修正过滤逻辑
    remoteSenseList.value = (res.rows || []).filter((item) => {
      return String(item.useFor) === '2' && String(item.imageType) === '1';
    });

    selectedSenseIndex.value = undefined;
    dialogVisible.value = true;

    if (remoteSenseList.value.length === 0) {
      ElMessage.warning('暂无符合条件的无人机遥感数据');
    }
  } catch (error) {
    console.error('Failed to fetch remote sense list:', error);
    ElMessage.error('获取图片集失败');
  }
};

/** 上传结束处理 */
const uploadedSuccessfully = () => {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter((f) => f.url !== undefined).concat(uploadList.value);
    uploadList.value = [];
    number.value = 0;

    // 修改点：先触发更新，然后延迟设置锁
    emit('update:modelValue', listToString(fileList.value));

    // 使用 nextTick 确保父组件的 watch 先执行
    nextTick(() => {
      isInnerChange.value = true;
    });

    proxy?.$modal.closeLoading();
  }
};

/** 确认选择已有图片 */
const handleConfirmSelection = () => {
  if (selectedSenseIndex.value === undefined) return;

  const selectedSense = remoteSenseList.value[selectedSenseIndex.value];

  if (fileList.value.some((file) => file.fourId === selectedSense.fourId)) {
    ElMessage.warning('此图像集已被选择');
    return;
  }

  const newFile = {
    name: `遥感图像-${selectedSense.fourId}`,
    url: selectedSense.previewImage || '',
    fourId: selectedSense.fourId,
    ossId: selectedSense.fourId,
    uid: new Date().getTime()
  };

  fileList.value.push(newFile);

  // 修改点：先触发更新，然后延迟设置锁
  emit('update:modelValue', listToString(fileList.value));
  emit('select', selectedSense);

  nextTick(() => {
    isInnerChange.value = true;
  });

  dialogVisible.value = false;
  selectedSenseIndex.value = undefined;
  ElMessage.success('图片选择成功');
};

/** 删除文件 */
const handleDelete = (index: number) => {
  let ossId = fileList.value[index].ossId;
  if (!fileList.value[index].fourId) {
    delSystemOss(ossId);
  }
  fileList.value.splice(index, 1);

  // 修改点：先触发更新，然后延迟设置锁
  emit('update:modelValue', listToString(fileList.value));

  nextTick(() => {
    isInnerChange.value = true;
  });
};

// 上传前校检格式和大小
const handleBeforeUpload = (file: any) => {
  // 校检文件类型
  if (props.fileType.length) {
    const fileName = file.name.split('.');
    const fileExt = fileName[fileName.length - 1];
    const isTypeOk = props.fileType.indexOf(fileExt) >= 0;
    if (!isTypeOk) {
      proxy?.$modal.msgError(`文件格式不正确, 请上传${props.fileType.join('/')}格式文件!`);
      return false;
    }
  }
  // 校检文件大小
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy?.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`);
      return false;
    }
  }
  proxy?.$modal.loading('正在上传文件，请稍候...');
  number.value++;
  return true;
};

// 文件个数超出
const handleExceed = () => {
  proxy?.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`);
};

// 上传失败
const handleUploadError = () => {
  proxy?.$modal.msgError('上传文件失败');
};

// 上传成功回调
const handleUploadSuccess = (res: any, file: UploadFile) => {
  if (res.code === 200) {
    uploadList.value.push({
      name: res.data.fileName,
      url: res.data.url,
      ossId: res.data.ossId
    });
    uploadedSuccessfully();
  } else {
    number.value--;
    proxy?.$modal.closeLoading();
    proxy?.$modal.msgError(res.msg);
    fileUploadRef.value?.handleRemove(file);
    uploadedSuccessfully();
  }
};

// 获取文件名称
const getFileName = (name: string) => {
  // 如果是url那么取最后的名字 如果不是直接返回
  if (name.lastIndexOf('/') > -1) {
    return name.slice(name.lastIndexOf('/') + 1);
  } else {
    return name;
  }
};

// 对象转成指定字符串分隔
const listToString = (list: any[], separator?: string) => {
  let strs = '';
  separator = separator || ',';
  list.forEach((item) => {
    if (item.ossId) {
      strs += item.ossId + separator;
    }
  });
  return strs != '' ? strs.substring(0, strs.length - 1) : '';
};
</script>

<style scoped lang="scss">
.upload-buttons {
  display: flex;
  align-items: center; // 核心：强制垂直居中对齐
  gap: 8px;
  margin-bottom: 5px;
}

.upload-file-uploader {
  display: flex; // 修改为 flex 消除 inline-block 的间距
  align-items: center;
}

.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}

.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}

.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}

.sense-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
    border-color: #409eff;
  }

  &.active {
    border: 2px solid #409eff;
    background-color: #f0f7ff;
  }
}

.sense-image-wrapper {
  position: relative;
  width: 100%;
  border-bottom: 1px solid #f3f4f6;

  .selected-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: #409eff;
    color: white;
    padding: 4px;
    border-bottom-left-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
  }
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-700 {
  color: #374151;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.font-medium {
  font-weight: 500;
}

.h-40 {
  height: 10rem;
}

.flex-1 {
  flex: 1 1 0%;
}

@media (min-width: 640px) {
  .sm\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
