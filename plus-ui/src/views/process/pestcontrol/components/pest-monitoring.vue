<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Monitor, VideoCamera, Warning, SuccessFilled, Connection, Tools, Clock, Location } from '@element-plus/icons-vue';

// 定义props
const props = defineProps<{
  selectedBase: string;
}>();

// 监测设备信息类型
interface MonitoringDevice {
  id: string;
  name: string;
  type: 'camera' | 'sensor' | 'trap' | 'weather';
  location: string;
  plotCode: string;
  status: 'online' | 'offline' | 'maintenance' | 'fault';
  lastUpdate: string;
  batteryLevel?: number;
  dataCount: number;
  pestCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  coordinates: [number, number];
}

// 所有基地的监测设备数据
const allDevicesData = ref<Record<string, MonitoringDevice[]>>({
  '侯家沟数字化种植基地': [
    {
      id: 'hjg_cam_001',
      name: '智能识别相机01',
      type: 'camera',
      location: '004号地块东北角',
      plotCode: '004',
      status: 'online',
      lastUpdate: '2025-09-25 14:25',
      batteryLevel: 85,
      dataCount: 156,
      pestCount: 23,
      riskLevel: 'medium',
      coordinates: [112.5532, 37.8574]
    },
    {
      id: 'hjg_cam_002',
      name: '智能识别相机02',
      type: 'camera',
      location: '007号地块中央',
      plotCode: '007',
      status: 'online',
      lastUpdate: '2025-09-25 14:20',
      batteryLevel: 92,
      dataCount: 203,
      pestCount: 15,
      riskLevel: 'low',
      coordinates: [112.5545, 37.858]
    },
    {
      id: 'hjg_trap_001',
      name: '虫情测报灯01',
      type: 'trap',
      location: '004号地块西侧',
      plotCode: '004',
      status: 'online',
      lastUpdate: '2025-09-25 14:30',
      batteryLevel: 78,
      dataCount: 89,
      pestCount: 67,
      riskLevel: 'high',
      coordinates: [112.5528, 37.8572]
    },
    {
      id: 'hjg_sensor_001',
      name: '环境传感器01',
      type: 'sensor',
      location: '004号地块中央',
      plotCode: '004',
      status: 'online',
      lastUpdate: '2025-09-25 14:28',
      dataCount: 1440,
      pestCount: 0,
      riskLevel: 'medium',
      coordinates: [112.5535, 37.8576]
    },
    {
      id: 'hjg_weather_001',
      name: '气象监测站01',
      type: 'weather',
      location: '基地气象站',
      plotCode: '中心区域',
      status: 'online',
      lastUpdate: '2025-09-25 14:30',
      dataCount: 720,
      pestCount: 0,
      riskLevel: 'low',
      coordinates: [112.554, 37.8578]
    }
  ],
  '姜兴庄智慧引领种植基地': [
    {
      id: 'jxz_cam_001',
      name: '智能识别相机01',
      type: 'camera',
      location: '009号地块南侧',
      plotCode: '009',
      status: 'online',
      lastUpdate: '2025-09-25 13:45',
      batteryLevel: 88,
      dataCount: 142,
      pestCount: 8,
      riskLevel: 'low',
      coordinates: [112.6532, 37.9574]
    },
    {
      id: 'jxz_trap_001',
      name: '虫情测报灯01',
      type: 'trap',
      location: '009号地块东侧',
      plotCode: '009',
      status: 'maintenance',
      lastUpdate: '2025-09-25 10:30',
      batteryLevel: 45,
      dataCount: 62,
      pestCount: 34,
      riskLevel: 'medium',
      coordinates: [112.6545, 37.958]
    }
  ],
  '冯渠现代农业基地': [
    {
      id: 'fq_cam_001',
      name: '智能识别相机01',
      type: 'camera',
      location: '021号地块北侧',
      plotCode: '021',
      status: 'fault',
      lastUpdate: '2025-09-25 08:15',
      batteryLevel: 12,
      dataCount: 89,
      pestCount: 45,
      riskLevel: 'high',
      coordinates: [112.7532, 37.8574]
    }
  ]
});

// 当前基地的设备数据
const currentDevices = computed(() => {
  return allDevicesData.value[props.selectedBase] || [];
});

// 表格样式配置
const headerCellStyle = {
  background: 'var(--el-fill-color-light)',
  fontSize: '12px',
  fontWeight: '600'
};

// 格式化设备名称
const formatDeviceName = (name: string) => {
  return name.replace('智能识别', '').replace('01', '1').replace('02', '2');
};

// 获取设备类型图标
const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'camera':
      return VideoCamera;
    case 'sensor':
      return Monitor;
    case 'trap':
      return Connection;
    case 'weather':
      return Tools;
    default:
      return Monitor;
  }
};

// 获取设备类型名称
const getDeviceTypeName = (type: string) => {
  switch (type) {
    case 'camera':
      return '智能相机';
    case 'sensor':
      return '环境传感器';
    case 'trap':
      return '虫情测报灯';
    case 'weather':
      return '气象站';
    default:
      return '未知设备';
  }
};

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'success';
    case 'offline':
      return 'info';
    case 'maintenance':
      return 'warning';
    case 'fault':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'online':
      return '在线';
    case 'offline':
      return '离线';
    case 'maintenance':
      return '维护中';
    case 'fault':
      return '故障';
    default:
      return '未知';
  }
};

// 获取风险等级颜色
const getRiskColor = (level: string) => {
  switch (level) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取风险等级文本
const getRiskText = (level: string) => {
  switch (level) {
    case 'low':
      return '低风险';
    case 'medium':
      return '中风险';
    case 'high':
      return '高风险';
    default:
      return '未知';
  }
};

// 统计信息
const statistics = computed(() => {
  const devices = currentDevices.value;
  const total = devices.length;
  const online = devices.filter((d) => d.status === 'online').length;
  const offline = devices.filter((d) => d.status === 'offline').length;
  const maintenance = devices.filter((d) => d.status === 'maintenance').length;
  const fault = devices.filter((d) => d.status === 'fault').length;

  const totalPests = devices.reduce((sum, d) => sum + d.pestCount, 0);
  const highRisk = devices.filter((d) => d.riskLevel === 'high').length;

  return {
    total,
    online,
    offline,
    maintenance,
    fault,
    totalPests,
    highRisk,
    onlineRate: total > 0 ? Math.round((online / total) * 100) : 0
  };
});

// TODO: Replace mock data with API integration
// Mock data location: lines 27-144 (allDevicesData)
// This data should be fetched from backend API endpoints

let updateInterval: NodeJS.Timeout | null = null;

onMounted(() => {
  // 定时刷新设备状态
  updateInterval = setInterval(() => {
    // 模拟设备状态更新
    const devices = currentDevices.value;
    devices.forEach((device) => {
      // 随机更新最后更新时间
      if (device.status === 'online') {
        const now = new Date();
        device.lastUpdate = now
          .toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
          .replace(/\//g, '-')
          .replace(', ', ' ');
      }
    });
  }, 60000); // 每分钟更新一次
});

onUnmounted(() => {
  // 清理定时器，防止内存泄漏
  if (updateInterval !== null) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
});
</script>

<template>
  <div class="pest-monitoring-container">
    <div class="pest-monitoring-content">
      <!-- 简化统计概览 -->
      <div class="statistics-section">
        <div class="compact-stats-grid">
          <div class="compact-stat-card">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">设备总数</div>
          </div>
          <div class="compact-stat-card online">
            <div class="stat-value">{{ statistics.online }}</div>
            <div class="stat-label">在线设备</div>
          </div>
          <div class="compact-stat-card pests">
            <div class="stat-value">{{ statistics.totalPests }}</div>
            <div class="stat-label">检测虫数</div>
          </div>
          <div class="compact-stat-card risk">
            <div class="stat-value">{{ statistics.highRisk }}</div>
            <div class="stat-label">高风险点</div>
          </div>
        </div>
      </div>

      <!-- 精简设备列表 -->
      <div class="devices-section">
        <div v-if="currentDevices.length === 0" class="empty-state">
          <el-empty description="暂无设备数据" />
        </div>

        <div v-else class="compact-devices-table">
          <el-table :data="currentDevices" size="small" :header-cell-style="headerCellStyle" :cell-style="{ fontSize: '11px' }" max-height="200">
            <el-table-column prop="name" label="设备名称" width="100">
              <template #default="scope">
                <div class="compact-device-name">
                  <el-icon class="device-icon">
                    <component :is="getDeviceIcon(scope.row.type)" />
                  </el-icon>
                  <span>{{ formatDeviceName(scope.row.name) }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="location" label="位置" width="80">
              <template #default="scope">
                <span>{{ scope.row.plotCode }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="60">
              <template #default="scope">
                <el-tag :type="getStatusColor(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="pestCount" label="虫数" width="50">
              <template #default="scope">
                <span
                  class="pest-count"
                  :class="{
                    'high-count': scope.row.pestCount > 50,
                    'medium-count': scope.row.pestCount > 20 && scope.row.pestCount <= 50,
                    'low-count': scope.row.pestCount <= 20
                  }"
                >
                  {{ scope.row.pestCount }}
                </span>
              </template>
            </el-table-column>

            <el-table-column prop="riskLevel" label="风险" width="60">
              <template #default="scope">
                <el-tag :type="getRiskColor(scope.row.riskLevel)" size="small">
                  {{ getRiskText(scope.row.riskLevel).replace('风险', '') }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pest-monitoring-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .pest-monitoring-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;

    .statistics-section {
      margin-bottom: 6px;

      .compact-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;

        .compact-stat-card {
          background: var(--el-color-primary);
          border-radius: 6px;
          padding: 6px;
          text-align: center;
          color: white;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px var(--el-box-shadow-light);
          }

          &.online {
            background: var(--el-color-success);
          }

          &.pests {
            background: var(--el-color-warning);
          }

          &.risk {
            background: var(--el-color-danger);
          }

          .stat-value {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
          }

          .stat-label {
            font-size: 10px;
            opacity: 0.9;
          }
        }
      }
    }

    .devices-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .empty-state {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .compact-devices-table {
        flex: 1;
        overflow: hidden;

        .compact-device-name {
          display: flex;
          align-items: center;
          gap: 4px;

          .device-icon {
            color: var(--el-color-primary);
            font-size: 12px;
          }
        }

        .pest-count {
          font-weight: 600;

          &.high-count {
            color: var(--el-color-danger);
          }

          &.medium-count {
            color: var(--el-color-warning);
          }

          &.low-count {
            color: var(--el-color-success);
          }
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pest-monitoring-content {
    .statistics-section {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
