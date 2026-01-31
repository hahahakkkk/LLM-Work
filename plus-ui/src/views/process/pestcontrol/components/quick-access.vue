<script setup lang="ts">
import { ref, markRaw } from 'vue';
import { Search, MapLocation } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

// 获取路由实例
const router = useRouter();

// 快捷操作按钮数据（针对病虫害监测模块）
const quickActions = ref([
  {
    id: 1,
    title: '病虫害识别',
    fullTitle: '进行植株级别的病虫害检测分析',
    icon: markRaw(Search),
    color: '#67c23a',
    action: 'plantDetection'
  },
  {
    id: 2,
    title: '病虫害区域检测',
    fullTitle: '进行区域级别的病虫害检测分析',
    icon: markRaw(MapLocation),
    color: '#e6a23c',
    action: 'areaDetection'
  }
]);

// 处理快捷操作点击事件
const handleQuickAction = (action: string) => {
  console.log('执行快捷操作:', action);
  switch (action) {
    case 'plantDetection':
      // 跳转到植株尺度检测页面
      router.push('/process/pestcontrol/identify');
      break;
    case 'areaDetection':
      // 跳转到区域尺度检测页面
      router.push('/process/pestcontrol/areaDetection');
      break;
    default:
      break;
  }
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
  </div>
</template>

<style scoped lang="scss">
.quick-access-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .quick-access-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .actions-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto;
      gap: 12px;
      width: 100%;

      .action-item-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;

        .quick-action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          justify-content: center;
          background-color: #fafafa;
          border: 1px solid #e8e8e8;

          &:hover {
            background-color: #f0f5ff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-color: #409eff;
          }

          .action-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            background-color: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            .icon {
              font-size: 28px;
              width: 28px;
              height: 28px;
            }
          }

          .action-title {
            font-size: 14px;
            color: #333;
            font-weight: 500;
            text-align: center;
            line-height: 1.4;
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
  display: none;
}

.quick-access-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
