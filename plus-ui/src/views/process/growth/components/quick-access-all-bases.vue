<script setup lang="ts">
import { ref, markRaw } from 'vue';
import { ElMessage } from 'element-plus';
import { InfoFilled, DataAnalysis, Pouring, Bell } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import GrowthDiagnosis from './GrowthDiagnosis.vue';

// 获取路由实例
const router = useRouter();

// 长势诊断组件引用
const growthDiagnosisRef = ref<InstanceType<typeof GrowthDiagnosis> | null>(null);

// 快捷操作按钮数据
const quickActions = ref([
  {
    id: 3,
    title: '长势诊断',
    fullTitle: '上传图像数据进行谷子长势诊断',
    icon: markRaw(DataAnalysis),
    color: '#36a3f7',
    action: 'growthDiagnosis'
  },
  {
    id: 4,
    title: '水肥诊断',
    fullTitle: '上传长势数据进行水肥亏缺诊断',
    icon: markRaw(Pouring),
    color: '#f78836',
    action: 'waterFertilizerDiagnosis'
  }
]);

// 长势模块的生育期选项（只包含3个时期）
const growthPeriods = ref([
  { value: '拔节期', label: '拔节期' },
  { value: '抽穗期', label: '抽穗期' },
  { value: '灌浆期', label: '灌浆期' }
]);

// 获取当前生育期的方法（需要父组件传入）
const props = defineProps<{
  currentPeriod: string;
}>();

// 定义事件发射器
const emits = defineEmits(['periodChange', 'refreshMap']);

// 处理快捷操作点击事件
const handleQuickAction = (action: string) => {
  console.log('执行快捷操作:', action);
  // 这里可以添加具体的业务逻辑
  switch (action) {
    case 'baseDetail':
      // 跳转到single_base.vue页面
      router.push('/process/growth/single_base');
      break;
    case 'growthDiagnosis':
      // 跳转到长势诊断页面
      router.push('/process/growth/deficiency');
      break;
    case 'waterFertilizerDiagnosis':
      // 跳转到水肥诊断页面
      router.push('/process/growth/waf');
      break;
    case 'addAlert':
      // 预警信息添加逻辑
      break;
    default:
      break;
  }
};

// 更换生育期操作 - 实现循环切换功能
const handleChangePeriod = () => {
  // 获取当前生育期
  const currentPeriod = props.currentPeriod || '抽穗期'; // 默认为抽穗期

  // 查找当前生育期在数组中的索引
  const currentIndex = growthPeriods.value.findIndex((period) => period.value === currentPeriod);

  // 如果没找到当前生育期，默认使用第一个
  if (currentIndex === -1) {
    ElMessage.warning('当前生育期无效，将切换到第一个生育期');
    const nextPeriod = growthPeriods.value[0].value;
    emits('periodChange', nextPeriod);
    ElMessage.success(`已切换到${nextPeriod}`);
    return;
  }

  // 计算下一个生育期的索引（循环）
  const nextIndex = (currentIndex + 1) % growthPeriods.value.length;

  // 获取下一个生育期
  const nextPeriod = growthPeriods.value[nextIndex].value;

  // 触发自定义事件，通知父组件更新生育期
  emits('periodChange', nextPeriod);
  ElMessage.success(`已切换到${nextPeriod}`);
};

// 处理地图刷新事件
const handleRefreshMap = () => {
  console.log('执行地图刷新操作');
  emits('refreshMap');
};
</script>

<template>
  <div class="quick-access-container">
    <div class="section-title">快捷操作</div>
    <div class="quick-access-content">
      <div class="actions-wrapper">
        <div v-for="action in quickActions" :key="action.id" class="action-item-wrapper">
          <el-tooltip class="box-item" effect="dark" :content="action.fullTitle" placement="bottom">
            <div class="quick-action-item" @click="handleQuickAction(action.action)">
              <div class="action-icon" :style="{ color: action.color }">
                <component :is="action.icon" class="icon" />
              </div>
              <div class="action-title">{{ action.title }}</div>
            </div>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 长势诊断组件 -->
    <GrowthDiagnosis ref="growthDiagnosisRef" @completed="handleRefreshMap" />
  </div>
</template>

<style scoped lang="scss">
.quick-access-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 15px;
  }

  .quick-access-content {
    flex: 1;
    display: flex;
    align-items: center;

    .actions-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 8px;
      width: 100%;
      height: 100%;

      .action-item-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;

        .quick-action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          height: 100%;
          justify-content: center;

          &:hover {
            background-color: #f0f5ff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .action-icon {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 6px;
            background-color: #f8f8f8;

            .icon {
              font-size: 22px;
              width: 22px;
              height: 22px;
            }
          }

          .action-title {
            font-size: 14px;
            color: #333;
            font-weight: normal;
            text-align: center;
            line-height: 1.3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            padding: 0 4px;
          }
        }
      }
    }
  }
}

/* 隐藏滚动条但保持滚动功能 */
.quick-access-container::-webkit-scrollbar {
  display: none; /* 隐藏WebKit浏览器的滚动条 */
}

.quick-access-container {
  -ms-overflow-style: none; /* 隐藏IE/Edge的滚动条 */
  scrollbar-width: none; /* 隐藏Firefox的滚动条 */
}
</style>
