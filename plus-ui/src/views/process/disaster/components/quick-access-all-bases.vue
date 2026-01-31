<script setup lang="ts">
import { ref, markRaw } from 'vue';
import { ElMessage } from 'element-plus';
import { PieChart, Document, LocationInformation, UploadFilled } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const quickActions = ref([
  {
    id: 1,
    title: '灾情统计',
    fullTitle: '查看图表信息',
    icon: markRaw(PieChart),
    color: '#f68ca4',
    path: '/process/disaster/warning'
  },
  {
    id: 2,
    title: '灾情预警信息',
    fullTitle: '查看详细数据列表',
    icon: markRaw(Document),
    color: '#8ed585',
    path: '/process/disaster/index1'
  },
  {
    id: 4,
    title: '灾情地图可视化',
    fullTitle: '进入基地灾情地图可视化',
    icon: markRaw(LocationInformation),
    color: '#6ec1ff',
    path: '/process/disaster/map'
  },
  {
    id: 5,
    title: '干旱检测',
    fullTitle: '上传文件进行干旱检测',
    icon: markRaw(UploadFilled),
    color: '#ffb14a',
    path: '/process/disaster/raster'
  }
]);

const handleQuickAction = (path: string) => {
  if (path) {
    router.push(path);
  } else {
    ElMessage.warning('该功能暂未开放');
  }
};
</script>

<template>
  <div class="quick-access-container">
    <div class="quick-access-content">
      <div class="actions-wrapper">
        <div v-for="action in quickActions" :key="action.id" class="action-item-wrapper">
          <el-tooltip class="box-item" effect="dark" :content="action.fullTitle" placement="bottom">
            <div class="quick-action-item" @click="handleQuickAction(action.path)">
              <div class="action-icon" :style="{ color: action.color, boxShadow: `0 0 12px ${action.color}33` }">
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
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 400px;
  max-height: 400px;
  width: 100%;

  .quick-access-content {
    display: flex;
    flex-direction: column;
    height: 100%;

    .actions-wrapper {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: minmax(0, 1fr);
      gap: 12px;
      width: 100%;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding-right: 4px;

      .action-item-wrapper {
        display: flex;
        align-items: stretch;
        flex: 1 1 auto;
        min-width: 0;

        .quick-action-item {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          border-radius: 12px;
          // cursor: pointer;
          // transition: all 0.25s ease;
          // background:
          //   radial-gradient(circle at top, rgba(255, 255, 255, 0.85), rgba(248, 251, 255, 0.95)),
          //   linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(223, 232, 255, 0.6));
          border: 1px solid rgba(64, 158, 255, 0.08);
          // box-shadow:
          //   inset 0 1px 0 rgba(255, 255, 255, 0.7),
          //   0 10px 20px rgba(15, 34, 58, 0.08);
          min-height: 80px;

          &:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(235, 242, 255, 0.9));
            transform: translateY(-2px);
            box-shadow: 0 18px 28px rgba(15, 34, 58, 0.12);
          }

          .action-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;

            .icon {
              width: 30px;
              height: 30px;
            }
          }

          .action-title {
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
            color: #162447;
            text-align: center;
            padding: 0 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}

@media (max-width: 600px) {
  .quick-access-container {
    .quick-access-content {
      .actions-wrapper {
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
    }
  }
}
</style>
