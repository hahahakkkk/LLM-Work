<template>
  <el-image :src="`${realSrc}`" fit="cover" :style="`width:${realWidth};height:${realHeight};`" :preview-src-list="realSrcList" preview-teleported>
    <template #error>
      <div class="image-slot">
        <el-icon><picture-filled /></el-icon>
      </div>
    </template>
  </el-image>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';
import { selectUrlByIds } from '@/views/four/api/oss';

const props = defineProps({
  src: propTypes.string.def(''),
  width: {
    type: [Number, String],
    default: ''
  },
  height: {
    type: [Number, String],
    default: ''
  }
});

const urls = ref<string>('');

// 1. 先把 loadUrls 定义出来
const loadUrls = async () => {
  if (!props.src) {
    urls.value = '';
    return;
  }
  try {
    // const res = await selectUrlByIds(props.src);
    // urls.value = res.data || '';
    if (props.src.startsWith('http')) {
      // 如果是 URL，直接赋值
      urls.value = props.src;
    } else {
      // 如果是 ID，请求 URL
      console.log('返回的预览图ids：' + props.src);
      const res = await selectUrlByIds(props.src);
      console.log('转换后的urls：' + res.data);
      urls.value = res.data || '';
    }
  } catch (e) {
    console.error(e);
    urls.value = '';
  }
};

// 2. 再写 watch
// 当 props.src 变化时重新获取url
watch(
  () => props.src,
  () => loadUrls(),
  { immediate: true }
);

const realSrc = computed(() => {
  if (!urls.value) {
    return;
  }
  // TODO: 不要在生产环境使用UNSAFE，应该计算签名
  return import.meta.env.VITE_IMGPROXY_URL + '/unsafe/resize:fill:100:100:1/plain/' + urls.value.split(',')[0];
});

const realSrcList = computed(() => {
  if (!urls.value) {
    return [];
  }
  let real_src_list = urls.value.split(',');
  let srcList: string[] = [];
  real_src_list.forEach((item: string) => {
    if (item.trim() === '') {
      return;
    }
    // TODO: 不要在生产环境使用UNSAFE，应该计算签名
    return srcList.push(import.meta.env.VITE_IMGPROXY_URL + '/unsafe/resize:fit:800:800:1/plain/' + item);
  });
  return srcList;
});

const realWidth = computed(() => (typeof props.width == 'string' ? props.width : `${props.width}px`));

const realHeight = computed(() => (typeof props.height == 'string' ? props.height : `${props.height}px`));
</script>

<style lang="scss" scoped>
.el-image {
  border-radius: 5px;
  background-color: #ebeef5;
  box-shadow: 0 0 5px 1px #ccc;

  :deep(.el-image__inner) {
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      transform: scale(1.2);
    }
  }

  :deep(.image-slot) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: #909399;
    font-size: 30px;
  }
}
</style>
