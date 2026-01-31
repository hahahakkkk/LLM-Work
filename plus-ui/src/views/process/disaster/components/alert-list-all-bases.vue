<template>
  <div class="growth">
    <div class="content">
      <SinglePanel class="alert-panel" caption="冰雹预警">
        <!-- 🔔 预警信息列表 -->
        <div class="alert-list-container">
          <!-- <div class="alert-list-header">
            <h3>预警信息列表</h3>
          </div> -->
          <div class="alert-scroll-wrapper">
            <AlertCard
              v-for="item in displayList"
              :key="item.id"
              :alert-title="regionDict[item.region] || '未知区域'"
              :time-ago="item.issueTime"
              :alert-message="item.warningContent"
              :card-id="item.id"
              :level="item.warningLevel"
            />
          </div>
        </div>
      </SinglePanel>
    </div>
  </div>
  <div class="alert-list-container">
    <div class="toolbar">
      <span class="hint">当前展示：{{ disasterName[props.disasterType] }}</span>
      <span class="count">共 {{ displayList.length }} 条</span>
    </div>

    <el-scrollbar class="list" view-class="list-view">
      <div v-if="!displayList.length" class="empty">暂无该灾害类型的预警</div>

      <el-card v-for="item in displayList" :key="item.id" class="alert-item" shadow="never" :body-style="{ padding: '10px 12px' }">
        <div class="row1">
          <div class="title">{{ item.title || '预警' }}</div>
          <el-tag :type="levelTagType[item.level]" size="small">{{ item.level.toUpperCase() }}</el-tag>
        </div>
        <div class="row2">
          <span class="meta">基地：{{ item.base || '未知' }}</span>
          <span class="meta">地块：{{ item.field || '-' }}</span>
          <span class="meta">时间：{{ item.time }}</span>
        </div>
        <div class="desc" v-if="item.description">{{ item.description }}</div>
      </el-card>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AlertCard from './AlertInfoCard.vue';
import request from '@/utils/request';

const regionDict: Record<string, string> = {
  '1': '姜兴庄基地',
  '2': '侯家沟基地',
  '4': '李家寺基地',
  '5': '高家硷基地',
  '6': '冯渠基地',
  '7': '寺沟基地',
  '8': '岳家岔基地',
  '9': '杨家沟基地'
};

const alertInfos = ref<any[]>([]);

const loadAlerts = async () => {
  const res = await request.get('/disaster/warning/list');
  alertInfos.value = res.rows || [];
};

// 🔽 按时间降序排序
const sortedAlerts = computed(() => {
  return [...alertInfos.value].sort((a, b) => {
    return new Date(b.issueTime).getTime() - new Date(a.issueTime).getTime();
  });
});
function isNormalItem(it: any): boolean {
  const lvl = String(it?.level ?? it?.warningLevel ?? it?.warningGrade ?? '')
    .trim()
    .toLowerCase();
  if (['normal', 'none', 'safe', 'green'].includes(lvl)) return true;
  const text = String(it?.warningContent ?? it?.title ?? '').toLowerCase();
  return /正常|解除|无预警|未达预警|无/.test(text);
}

const displayList = computed(() => {
  // 只在 props.alerts 未提供时回退；空数组也要尊重
  const src = Array.isArray(props.alerts) ? props.alerts : alertInfos.value || [];

  // 过滤当前灾害类型
  const byType = props.disasterType ? src.filter((a) => String(a.disasterType) === String(props.disasterType)) : src;

  // 去掉“正常/解除/无预警”等
  const onlyWarnings = byType.filter((a) => !isNormalItem(a));

  // 时间降序（兼容 issueTime / time / warningTime）
  return [...onlyWarnings].sort(
    (a, b) => new Date(b.issueTime || b.time || b.warningTime || 0).getTime() - new Date(a.issueTime || a.time || a.warningTime || 0).getTime()
  );
});

interface AlertItem {
  id: number;
  title: string;
  time: string;
  level: 'high' | 'medium' | 'low';
  status: 'unhandled' | 'handled';
  base: string;
  field: string;
  description: string;
  type: 'water' | 'fertilizer';
  disasterType: string;
}

const props = defineProps<{ alerts: AlertItem[]; disasterType: '0' | '1' | '2' }>();

const filtered = computed(() => (props.alerts || []).filter((a) => a.disasterType === props.disasterType));

const levelTagType: Record<'high' | 'medium' | 'low', 'danger' | 'warning' | 'info'> = {
  high: 'danger',
  medium: 'warning',
  low: 'info'
};

const disasterName: Record<'0' | '1' | '2', string> = {
  '0': '旱灾',
  '1': '洪涝',
  '2': '冰雹'
};

onMounted(() => {
  loadAlerts();
});
</script>

<style lang="scss" scoped>
.alert-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.alert-list-header {
  background: linear-gradient(90deg, #babbbc, #839bc3);
  color: #fff;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #ebeef5;
  h3 {
    margin: 0;
  }
}

/* 固定高度 + 滚动显示 */
.alert-scroll-wrapper {
  flex: 1;
  max-height: 600px; /* 根据页面布局调整 */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f9fbfd;
  border-radius: 0 0 10px 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(144, 147, 153, 0.3);
    border-radius: 4px;
  }
}

.alert-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-bottom: 1px solid #ebeef5;
    background: #fafafa;

    .hint {
      font-size: 12px;
      color: #606266;
    }
    .count {
      font-size: 12px;
      color: #909399;
    }
  }

  .list {
    flex: 1;
    min-height: 0;
  }
  .list-view {
    padding: 10px;
  }

  .empty {
    color: #909399;
    font-size: 13px;
    padding: 20px;
    text-align: center;
  }

  .alert-item {
    margin-bottom: 10px;
  }

  .row1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;

    .title {
      font-weight: 600;
      color: #303133;
    }
  }

  .row2 {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: #606266;
    margin-bottom: 6px;

    .meta {
      white-space: nowrap;
    }
  }

  .desc {
    font-size: 13px;
    color: #606266;
  }
}
</style>
