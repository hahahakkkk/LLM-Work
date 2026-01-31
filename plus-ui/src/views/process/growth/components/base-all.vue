<script setup lang="ts">
import { ref } from 'vue';

// 定义基地数据类型
interface BaseData {
  id: number;
  label: string;
  value: string;
  lai: number;
  spad: number;
  growthLevel: string;
}

// 基地数据
const baseDataList = ref<BaseData[]>([
  { id: 3, label: '侯家沟', value: '侯家沟数字化种植基地', lai: 2.35, spad: 37.77, growthLevel: '良好' },
  { id: 5, label: '姜兴庄', value: '姜兴庄智慧引领种植基地', lai: 1.75, spad: 37.88, growthLevel: '正常' },
  { id: 1, label: '冯渠', value: '冯渠', lai: 1.48, spad: 47.32, growthLevel: '良好' },
  { id: 2, label: '高硷村', value: '高硷村', lai: 0.87, spad: 37.85, growthLevel: '正常' },
  { id: 4, label: '侯家沟南', value: '侯家沟南', lai: 1.98, spad: 37.75, growthLevel: '良好' },
  { id: 6, label: '李家寺', value: '李家寺', lai: 2.15, spad: 37.72, growthLevel: '较差' },
  { id: 7, label: '寺沟', value: '寺沟', lai: 1.85, spad: 37.74, growthLevel: '良好' },
  { id: 8, label: '杨家沟', value: '杨家沟', lai: 2.25, spad: 37.76, growthLevel: '良好' },
  { id: 9, label: '岳岔', value: '岳岔', lai: 2.25, spad: 37.76, growthLevel: '较差' }
]);

// 发送事件到父组件
const emit = defineEmits<{
  (e: 'base-selected', name: string): void;
}>();

// 处理基地点击事件
const handleBaseClick = (value: string) => {
  emit('base-selected', value);
  console.log('name', value);
};
</script>

<template>
  <div class="base-all-container">
    <div class="table-wrapper">
      <table class="base-data-table">
        <thead>
          <tr>
            <th>基地</th>
            <th>lai</th>
            <th>spad</th>
            <th>长势等级</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="base in baseDataList" :key="base.id" class="base-row" @click="handleBaseClick(base.value)">
            <td>{{ base.label }}</td>
            <td>{{ base.lai.toFixed(2) }}</td>
            <td>{{ base.spad.toFixed(2) }}</td>
            <td>
              <span
                :class="[
                  'growth-level',
                  {
                    'level-good': base.growthLevel === '良好',
                    'level-normal': base.growthLevel === '正常',
                    'level-poor': base.growthLevel === '较差'
                  }
                ]"
              >
                {{ base.growthLevel }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-all-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;

  .table-wrapper {
    flex: 1;
    overflow: auto;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .base-data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;

      thead {
        background-color: #f5f7fa;

        th {
          padding: 12px 10px;
          text-align: left;
          font-weight: bold;
          color: #606266;
          border-bottom: 1px solid #ebeef5;
        }
      }

      tbody {
        tr {
          &:hover {
            background-color: #f5f7fa;
            cursor: pointer;
          }

          &:nth-child(even) {
            background-color: #fafafa;
          }

          &.base-row {
            transition: background-color 0.2s;

            td {
              padding: 10px;
              color: #606266;
              border-bottom: 1px solid #ebeef5;
            }
          }
        }
      }
    }
  }
}

.growth-level {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;

  &.level-good {
    background-color: rgba(0, 202, 0, 0.2);
  }

  &.level-normal {
    background-color: rgba(130, 249, 2, 0.2);
  }

  &.level-poor {
    background-color: rgba(184, 224, 111, 0.2);
  }
}
</style>
