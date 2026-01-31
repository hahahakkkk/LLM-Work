<template>
  <div class="data-management">
    <el-card>
      <div class="header">
        <el-select v-model="sourceType" placeholder="来源类型" class="mr-2">
          <el-option label="农田气象站" value="auto" />
          <el-option label="管式土壤墒情监测站" value="remote" />
        </el-select>
        <el-input v-model="searchKeyword" placeholder="设备编号、设备名称" class="mr-2" />
        <el-button type="primary" @click="fetchDeviceList">查询</el-button>
      </div>

      <el-table :data="deviceList" style="width: 100%" class="mt-3">
        <el-table-column prop="source" label="来源类型" width="100" />
        <el-table-column prop="deviceId" label="设备编号" width="120" />
        <el-table-column prop="deviceName" label="设备名称" width="120" />
        <el-table-column prop="location" label="地理位置" />
        <el-table-column prop="status" label="接入状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '在线' ? 'success' : 'info'">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdated" label="数据更新时间" width="180" />
      </el-table>

      <div class="pagination mt-3">
        <el-pagination background layout="prev, pager, next" :total="deviceList.length" :page-size="10" :current-page="1" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface Device {
  source: string;
  deviceId: string;
  deviceName: string;
  location: string;
  status: string;
  lastUpdated: string;
}

const sourceType = ref('');
const searchKeyword = ref('');

const deviceList = ref<Device[]>([
  { source: '农田气象站', deviceId: '001', deviceName: '设备1', location: '30.67,104.06', status: '在线', lastUpdated: '2025-05-21 10:36' },
  { source: '农田气象站', deviceId: '002', deviceName: '设备2', location: '30.67,104.06', status: '离线', lastUpdated: '2025-05-21 10:36' },
  { source: '管式土壤墒情监测站', deviceId: '003', deviceName: '设备3', location: '30.67,104.06', status: '在线', lastUpdated: '2025-05-21 10:36' },
  { source: '管式土壤墒情监测站', deviceId: '004', deviceName: '设备4', location: '30.67,104.06', status: '在线', lastUpdated: '2025-05-21 10:36' }
]);

function fetchDeviceList() {
  // 模拟筛选，实际应调用接口
  console.log('筛选条件:', sourceType.value, searchKeyword.value);
}
</script>

<style scoped>
.data-management .header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.mr-2 {
  margin-right: 10px;
}
.mt-3 {
  margin-top: 15px;
}
</style>
