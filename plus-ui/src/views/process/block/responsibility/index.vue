<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="searchFormRef" :model="searchParams" :inline="true" @submit.native.prevent>
            <el-form-item label="溯源码" prop="traceCode">
              <el-autocomplete
                v-model="searchParams.traceCode"
                value-key="traceCode"
                placeholder="请输入溯源码"
                clearable
                :fetch-suggestions="querySearch"
                :trigger-on-focus="false"
                @keyup.enter.native="handleSearch"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <h2>责任追溯</h2>

      <!-- 地块信息卡片 -->
      <div v-if="traceInfo" class="mt-4 mb-6">
        <el-card>
          <div class="flex items-center">
            <el-icon class="mr-2"><Location /></el-icon>
            <span class="font-bold text-lg">地块信息：</span>
            <span class="ml-2 text-base">{{ plotInfo }}</span>
          </div>
        </el-card>
      </div>

      <!-- 搜索结果 -->
      <div v-if="traceInfo" class="mt-4">
        <el-timeline style="max-width: 600px">
          <!-- 动态渲染排序后的时间链 -->
          <el-timeline-item v-for="(event, index) in sortedEvents" :key="`event-${index}`" :timestamp="event.time" placement="top">
            <el-card>
              <h4>{{ event.typeName }}</h4>
              <p v-html="event.content"></p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 未找到内容的提示 -->
      <div v-else-if="searched" class="text-center mt-4">
        <el-empty description="未找到相关内容" />
      </div>
    </el-card>
  </div>
</template>

<script setup name="TraceabilityInfo" lang="ts">
import { getTraceInfo, getAllTraceCodes } from '@/views/process/api/block/info/index';
import { TraceInfo, TraceabilityInfoForm, TraceabilityInfoQuery } from '@/views/process/api/block/info/types';
import { Location } from '@element-plus/icons-vue';
import { debounce } from 'lodash-es';

const showSearch = ref(true);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { crop_variety } = toRefs<any>(proxy?.useDict('crop_variety'));
const { irrigation_method } = toRefs<any>(proxy?.useDict('irrigation_method'));
const { use_method } = toRefs<any>(proxy?.useDict('use_method')); // 新增施肥方式字典
const traceCodeList = ref<string[]>([]); // 存储所有溯源码列表
const loading = ref(false); // 加载状态

const searchParams = reactive({
  traceCode: ''
});

const traceInfo = ref<TraceInfo | null>(null);
const plotInfo = ref(''); // 单独存储地块信息
const searched = ref(false);

// 在组件挂载时获取所有溯源码
onMounted(async () => {
  await loadAllTraceCodes();
});

/**
 * 加载所有溯源码
 */
const loadAllTraceCodes = async () => {
  try {
    loading.value = true;
    const res = await getAllTraceCodes();
    if (res && res.code === 200) {
      traceCodeList.value = res.data || [];
      console.log('加载溯源码列表成功，共', traceCodeList.value.length, '个');
    } else {
      console.warn('获取溯源码列表失败:', res?.msg);
      traceCodeList.value = [];
    }
  } catch (error) {
    console.error('加载溯源码列表异常:', error);
    traceCodeList.value = [];
  } finally {
    loading.value = false;
  }
};

/**
 * 搜索建议方法 - 使用防抖优化性能
 */
const querySearch = debounce(async (queryString: string, cb: any) => {
  if (!queryString || queryString.trim() === '') {
    // 如果输入为空，不显示建议或显示部分常用建议
    cb([]);
    return;
  }

  try {
    // 在前端进行过滤，减少服务器请求
    const filteredCodes = traceCodeList.value.filter((code) => code.toLowerCase().includes(queryString.toLowerCase()));

    // 转换为 el-autocomplete 需要的格式
    const suggestions = filteredCodes.map((code) => ({
      value: code,
      traceCode: code
    }));

    console.log(`搜索建议: "${queryString}" -> 找到 ${suggestions.length} 个结果`);
    cb(suggestions);
  } catch (error) {
    console.error('搜索建议异常:', error);
    cb([]);
  }
}, 300); // 300ms 防抖

// 根据字典值和字典类型获取标签
const getDictLabel = (dictType: any, value: any) => {
  if (!dictType || !value) return value;

  // 处理 Ref 对象类型
  if (dictType.value !== undefined) {
    const dictArray = dictType.value;
    if (Array.isArray(dictArray)) {
      const item = dictArray.find((item: any) => String(item.value) === String(value));
      return item ? item.label : value;
    }
    return value;
  }

  // 处理数组类型
  if (Array.isArray(dictType)) {
    const item = dictType.find((item: any) => String(item.value) === String(value));
    return item ? item.label : value;
  }

  // 其他情况直接返回值
  return value;
};
/** 搜索方法 */
const handleSearch = async () => {
  if (!searchParams.traceCode) {
    ElMessage.warning('请输入溯源码');
    return;
  }

  try {
    const res = await getTraceInfo(searchParams.traceCode);
    console.log(res);

    if (res && res.code === 200) {
      traceInfo.value = res.data;

      // 提取地块信息
      plotInfo.value =
        traceInfo.value.plantingBo?.plotInfo ||
        traceInfo.value.fertilizationBoList?.[0]?.plotInfo ||
        traceInfo.value.pesticideBoList?.[0]?.plotInfo ||
        traceInfo.value.irrigationBoList?.[0]?.plotInfo ||
        traceInfo.value.harvestBo?.plotInfo ||
        '未知地块';

      searched.value = true;
    } else {
      traceInfo.value = null;
      plotInfo.value = '';
      ElMessage.warning('未找到相关溯源信息');
    }
  } catch (error) {
    traceInfo.value = null;
    plotInfo.value = '';
    ElMessage.error('查询失败');
  }
};
// 时间轴数据处理
const sortedEvents = computed(() => {
  if (!traceInfo.value) return [];

  const events: {
    time: string;
    typeName: string;
    content: string;
  }[] = [];

  // 处理种植信息
  if (traceInfo.value.plantingBo) {
    const planting = traceInfo.value.plantingBo;
    events.push({
      time: planting.sowingTime,
      typeName: '播种作业',
      content: `品种名称：${getDictLabel(crop_variety, planting.seedInfo)}<br/>
               <span style="color: #409EFF; font-weight: 500;">操作人员：${planting.operator}</span>`
    });
  }

  // 处理施肥信息
  if (traceInfo.value.fertilizationBoList?.length) {
    traceInfo.value.fertilizationBoList.forEach((item) => {
      events.push({
        time: item.fertilizationTime,
        typeName: '施肥作业',
        content: `肥料名称：${item.fertilizerName}<br/>
                 施肥量：${item.fertilizerDosage || '无'} kg/亩<br/>
                 施肥方式：${getDictLabel(use_method, item.fertilizationMethod) || '未知方式'}<br/>
                 操作时间：${item.fertilizationTime}<br/>
               <span style="color: #409EFF; font-weight: 500;">操作人员：${item.operator}</span>`
      });
    });
  }

  // 处理农药信息
  if (traceInfo.value.pesticideBoList?.length) {
    traceInfo.value.pesticideBoList.forEach((item) => {
      events.push({
        time: item.pesticideTime,
        typeName: '农药作业',
        content: `农药名称：${item.pesticideName}<br/>
                 地块信息：${item.plotInfo}<br/>
                 打药计量：${item.pesticideDosage || '无'} ml/亩<br/>
                 操作时间：${item.pesticideTime}<br/>
               <span style="color: #409EFF; font-weight: 500;">操作人员：${item.operator}</span>`
      });
    });
  }

  // 处理灌溉信息
  if (traceInfo.value.irrigationBoList?.length) {
    traceInfo.value.irrigationBoList.forEach((item) => {
      events.push({
        time: item.irrigationDate,
        typeName: '灌溉作业',
        content: `灌溉方式：${getDictLabel(irrigation_method, item.irrigationMethod) === '穴灌' ? '沟灌' : getDictLabel(irrigation_method, item.irrigationMethod)}<br/>
                 操作时间：${item.irrigationDate}<br/>
               <span style="color: #409EFF; font-weight: 500;">操作人员：${item.operator}</span>`
      });
    });
  }

  // 处理收获信息
  if (traceInfo.value.harvestBo) {
    const harvest = traceInfo.value.harvestBo;
    events.push({
      time: harvest.harvestTime,
      typeName: '收获作业',
      content: `收获时间：${harvest.harvestTime}<br/>
               <span style="color: #409EFF; font-weight: 500;">操作人员：${harvest.operator}</span>`
    });
  }

  // 按时间倒序排序
  return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
});

/** 重置搜索 */
const resetQuery = () => {
  searchParams.traceCode = '';
  traceInfo.value = null;
  searched.value = false;
};
</script>
