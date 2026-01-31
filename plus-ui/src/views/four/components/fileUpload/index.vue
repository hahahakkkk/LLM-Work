<template>
  <div class="upload-file">
    <el-upload
      ref="fileUploadRef"
      multiple
      :action="uploadFileUrl + '?configKey=' + configKey"
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
      <el-button type="primary">选取文件</el-button>
    </el-upload>
    <!-- 上传提示 -->
    <div v-if="showTip" class="el-upload__tip">
      请上传
      <template v-if="fileSize">
        大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType && fileSize">、</template>
      <template v-if="fileType">
        格式为 <b style="color: #f56c6c">{{ fileType.join('/') }}</b>
      </template>
      的文件
      <template v-if="(fileSize || fileType) && limit">，</template>
      <template v-if="limit">
        最多可上传 <b style="color: #f56c6c">{{ limit }}个</b> 文件
      </template>
    </div>
    <!-- 文件列表 -->
    <transition-group v-if="props.showFileList" class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li v-for="(file, index) in fileList" :key="file.uid" class="el-upload-list__item ele-upload-list__item-content">
        <el-link :href="`${file.url}`" :underline="false" target="_blank">
          <span class="el-icon-document"> {{ file.name }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-button type="danger" link @click="handleDelete(index)">删除</el-button>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';
import { deleteOss, listByIds } from '../../api/oss';
import { globalHeaders } from '@/utils/request';

const props = defineProps({
  modelValue: {
    type: [String, Object, Array],
    default: () => []
  },
  // 数量限制
  limit: propTypes.number.def(20),
  // 大小限制(MB)
  fileSize: propTypes.number.def(10240),
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: propTypes.array.def(['tif', 'png', 'jpg', 'zip', 'rar', '7z']),
  // 是否显示提示
  isShowTip: propTypes.bool.def(true),
  // oss配置key
  configKey: propTypes.string.def('knowledge'),
  // 是否显示文件列表
  showFileList: propTypes.bool.def(true)
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits(['update:modelValue', 'file-all-size']);
const number = ref(0);
const uploadList = ref<any[]>([]);

const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadFileUrl = ref(baseUrl + '/four/oss/upload'); // 上传文件服务器地址
const headers = ref(globalHeaders());

const fileList = ref<any[]>([]);

const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize));

const fileUploadRef = ref<ElUploadInstance>();

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      let temp = 1;
      // 首先将值转为数组
      let list: any[] = [];
      if (Array.isArray(val)) {
        list = val;
      } else {
        const res = await listByIds(val);
        list = res.data.map((oss) => {
          return {
            name: oss.originalName,
            url: oss.url,
            ossId: oss.ossId,
            fileSize: oss.fileSize
          };
        });
      }
      // 然后将数组转为对象数组
      fileList.value = list.map((item) => {
        item = { name: item.name, url: item.url, ossId: item.ossId, fileSize: item.fileSize };
        item.uid = item.uid || new Date().getTime() + temp++;
        return item;
      });
    } else {
      fileList.value = [];
      return [];
    }
  },
  { deep: true, immediate: true }
);
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
    console.log('res after upload:', res.data); // ✅ 打印看看
    const fileItem = {
      name: res.data.fileName,
      url: res.data.url,
      ossId: res.data.ossId,
      fileSize: res.data.fileSize // 新增：保存文件大小
    };
    uploadList.value.push(fileItem);
    uploadedSuccessfully();
  } else {
    number.value--;
    proxy?.$modal.closeLoading();
    proxy?.$modal.msgError(res.msg);
    fileUploadRef.value?.handleRemove(file);
    uploadedSuccessfully();
  }
};

// 删除文件
const handleDelete = (index: number) => {
  if (fileList.value.length === 1) {
    proxy?.$modal.msgError('至少需要保留一张图片');
    return;
  }
  let ossId = fileList.value[index].ossId;
  deleteOss(ossId);
  fileList.value.splice(index, 1);
  emit('update:modelValue', listToString(fileList.value));
  emit('file-all-size', listFileSize(fileList.value));
};

// 上传结束处理
const uploadedSuccessfully = () => {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter((f) => f.url !== undefined).concat(uploadList.value);
    console.log('fileList after upload:', fileList.value); // ✅ 打印看看
    uploadList.value = [];
    number.value = 0;
    emit('update:modelValue', listToString(fileList.value));
    emit('file-all-size', listFileSize(fileList.value));
    proxy?.$modal.closeLoading();
  }
};

// 获取文件名称
const getFileName = (name: string) => {
  console.log('传进来的:', name); // ✅ 打印看看
  // 如果是url那么取最后的名字 如果不是直接返回
  if (name.lastIndexOf('/') > -1) {
    return name.slice(name.lastIndexOf('/') + 1);
  } else {
    console.log('FileName after upload11111:', name); // ✅ 打印看看
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

// 对象转成指定字符串分隔
const listFileSize = (list: any[]) => {
  let totalSize = 0; // 单位：Byte
  list.forEach((item) => {
    if (item.fileSize) {
      totalSize += item.fileSize;
    }
  });
  return totalSize;
};
</script>

<style scoped lang="scss">
.upload-file-uploader {
  margin-bottom: 5px;
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
</style>
