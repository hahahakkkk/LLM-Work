<template>
  <div class="growth">
    <!-- 综合监测视图 -->
    <div class="content">
      <SinglePanel class="alert-panel" caption="冰雹预警">
        <div class="alert-scroll-wrapper">
          <AlertCard
            v-for="item in alertInfos"
            :key="item.id"
            :alert-title="regionDict[item.region] || '未知区域'"
            :time-ago="item.issueTime"
            :alert-message="item.warningContent"
            :card-id="item.id"
            @delete="handleDelete"
            @measure="handleMeasure"
          />
        </div>
      </SinglePanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

import AlertCard from './AlertInfoCard.vue';

import request from '@/utils/request';

const startDate = null;
const endDate = null;

const historyDialog = ref();

const handleHistory = async () => {
  historyDialog.value?.open();
};
// 定义预警数据类型
interface Warning {
  location: string;
  time: string;
  level: '红色' | '橙色' | '正常';
  content: string;
}

// 查看预警详情
// const handleViewAlert = (alert: any) => {
//   ElMessageBox.alert(`
//     <div class="alert-detail">
//       <p><strong>预警地点：</strong>${alert.location}</p>
//       <p><strong>预警时间：</strong>${alert.time}</p>
//       <p><strong>预警等级：</strong><span class="level-${alert.level}">${alert.level}</span></p>
//       <p><strong>注意事项：</strong>${alert.message}</p>
//     </div>
//   `, '预警详情', {
//     dangerouslyUseHTMLString: true,
//     customClass: 'alert-detail-modal'
//   })
// }

// 忽略预警
const handleIgnoreAlert = (index: number) => {
  alerts.value.splice(index, 1);
};

// 定义组件属性
interface Props {
  warnings: Warning[];
}

// 定义组件事件
interface Emits {
  (e: 'view', warning: Warning): void;
  (e: 'ignore', warning: Warning): void;
}

// // 查看预警详情
// const handleViewAlert = (alert: any) => {
//   // 这里可以添加查看预警详情的逻辑
//   console.log('查看预警:', alert);
//   proxy?.$modal.msgSuccess(`查看 ${alert.location} 的预警详情`);
// }

// // 忽略预警
// const handleIgnoreAlert = (alert: any) => {
//   // 这里可以添加忽略预警的逻辑
//   console.log('忽略预警:', alert);
//   proxy?.$modal.msgSuccess(`已忽略 ${alert.location} 的预警`);
// }
// 声明属性和事件
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// const alertInfos = reactive([
//   { alertName: '温度', alertCount: '17℃',},
//   { alertName: '风向', alertCount: '17°',},
//   { alertName: '风向', alertCount: '17°',},
// ]);
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
interface CameraConfig {
  id: string;
  name: string;
  url: string;
  type: 'mp4' | 'rtmp';
}

const cameraList = ref<CameraConfig[]>([
  {
    id: 'cam1',
    name: '摄像头1',
    url: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507101120081.mp4',
    type: 'mp4'
  },
  {
    id: 'cam2',
    name: '摄像头2',
    url: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507101112949.mp4',
    type: 'mp4'
  }
]);

const videoMonitorRef = ref(null);
const currentCameraId = ref('');

const handleCameraChange = (camera: CameraConfig) => {
  currentCameraId.value = camera.id;
  console.log('切换至摄像头:', camera.name);
};

const weatherInfos = reactive([
  { iconSrc: '/index/01.png', weatherName: '温度', weatherCount: '17℃' },
  { iconSrc: '/index/02.png', weatherName: '风向', weatherCount: '17°' },
  { iconSrc: '/index/03.png', weatherName: '雨量', weatherCount: '4mm/m' },
  { iconSrc: '/index/04.png', weatherName: '湿度', weatherCount: '88%' },
  { iconSrc: '/index/03.png', weatherName: '风速', weatherCount: '15m/s' },
  { iconSrc: '/index/04.png', weatherName: '光强', weatherCount: '1000Lux' }
]);

// const alerts = [
//   {
//     location: '侯家沟010号冰雹预警',
//     time: '5小时前',
//     level: '红色',
//     message: '冰雹预警等级已达到红色，请及时采取防御措施，避免造成严重损失。'
//   },
//   {
//     location: '侯家沟012号冰雹预警',
//     time: '12小时前',
//     level: '橙色',
//     message: '冰雹预警等级已达到橙色，请及时采取防御措施，避免造成严重损失。'
//   },
//   {
//     location: '侯家沟009号解除冰雹预警',
//     time: '1天前',
//     level: '正常',
//     message: '当前冰雹预警信息解除，可以进行正常生产活动。'
//   },
//   {
//     location: '侯家沟006号解除冰雹预警',
//     time: '2天前',
//     level: '正常',
//     message: '当前冰雹预警信息解除，可以进行正常生产活动。'
//   }
// ];

const alerts = ref([
  {
    location: '侯家沟010号冰雹预警',
    time: '5小时前',
    level: '红色',
    message: '冰雹预警等级已达到红色，请及时采取防御措施，避免造成严重损失。'
  },
  {
    location: '侯家沟012号冰雹预警',
    time: '12小时前',
    level: '橙色',
    message: '冰雹预警等级已达到橙色，请及时采取防御措施，避免造成严重损失。'
  },
  {
    location: '侯家沟009号解除冰雹预警',
    time: '1天前',
    level: '正常',
    message: '当前冰雹预警信息解除，可以进行正常生产活动。'
  },
  {
    location: '侯家沟006号解除冰雹预警',
    time: '2天前',
    level: '正常',
    message: '当前冰雹预警信息解除，可以进行正常生产活动。'
  }
]);

const vagetationData = reactive([
  { name: '1月', value: 0 },
  { name: '2月', value: 0 },
  { name: '3月', value: 0 },
  { name: '4月', value: 3 },
  { name: '5月', value: 4 },
  { name: '6月', value: 7 },
  { name: '7月', value: 9 },
  { name: '8月', value: 6 },
  { name: '9月', value: 2 },
  { name: '10月', value: 0 },
  { name: '11月', value: 0 },
  { name: '12月', value: 0 }
]);

const growthLevelData = reactive([
  { name: '红色', value: 0.3 },
  { name: '正常', value: 0.6 },
  { name: '橙色', value: 0.1 }
]);

const growthStages = ['2.25', '2.26', '2.27', '2.28', '3.1', '3.2', '3.3'];
// 监测数据

// 路由控制
const activeButton = ref(0);
const router = useRouter();

const navClick = (sender) => {
  activeButton.value = sender.index;
  router.push(sender.url);
};

import { parseTime } from '@/utils/ruoyi'; // 确保已安装时间处理工具
import { getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance();

// 新增API导入

import { ElMessageBox } from 'element-plus';
// 替换原有的静态数据

const switchCamera = (camera: CameraConfig) => {
  currentCameraId.value = camera.id;
  videoMonitorRef.value?.switchCamera(camera);
};

// ---------------------
// 🔔 警报数据逻辑部分
// ---------------------
const alertInfos = ref([]);

const loadAlerts = async () => {
  const res = await request.get('/disaster/warning/list');
  alertInfos.value = (res.rows || []).filter((item) => item.disasterType === '0' && item.warningLevel !== '99');
  //alertInfos.value = (res.rows || [])
};

onMounted(() => {
  loadAlerts();
  currentCameraId.value = cameraList.value[0]?.id || '';
});

const handleDelete = async (id: string | number) => {
  await request.delete(`/disaster/warning/${id}`);
  alertInfos.value = alertInfos.value.filter((item) => item.id !== id);
};

const handleMeasure = (id: string | number) => {
  console.log(`已确认预案 cardId: ${id}`);
  // 可扩展调用“标记为已处理”接口
};
</script>

<style lang="scss" scoped>
//@import "style.css";
.alert-scroll-wrapper {
  max-height: 800px; // 一张卡片90~100px，最多显示3条
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 6px;
  padding-left: 2px;

  background: rgba(147, 210, 243, 0.1); // 与卡片风格统一
  border-radius: 10px;

  // 滚动条样式（可选）
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
}
// .growth {
//   height: 100%;
//   display: flex;
//   flex-direction: row;
//   padding: 20px;
//   //display: grid;
//   //grid-template-columns: 160px 1fr;

//   .nav {
//     flex-basis: 150px;
//     background: var(--nav-bg);
//     //border-right: 1px solid var(--border-color);
//   }

//   flex-grow: 1;
//   background-color: var(--background-color);
//   .content {
//     height: 97%;
//     width: 100%;
//     display: grid;
//     grid-template-columns: 20% 44% 16% 18%;
//     grid-template-rows: 40% 35% 25%;
//     grid-template-areas:
//         "map map alert alert"
//         "map map video video"
//         "weather soil vegetation vegetation";
//     gap: 10px;
//     //padding: 20px;
//     //height: 97%;

//   }

// }

.camera-selector button {
  background-color: #037525;
  color: white;
  border: none;
  padding: 8px 16px;
  margin-right: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 10px;
  transition: background-color 0.3s;
}
.camera-selector button:hover {
  background-color: #9ca355;
}
.camera-selector button.active {
  background-color: #a8ad0f;
}

.history-btn {
  background-color: transparent;
  color: #52c41a;
  border: 1px solid #52c41a;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
}

.alert-item {
  display: flex;
  align-items: center;
  background-color: #4682b4;
  border-radius: 8px;
  padding: 5px;
}

.alert-icon {
  width: 30px;
  height: 30px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.exclamation {
  color: #0a1a35;
  font-weight: bold;
  font-size: 18px;
}

.alert-content {
  flex-grow: 1;
}

.alert-header {
  padding: 0px 10px;
  display: flex;
  justify-content: space-between;
}

.location {
  font-weight: bold;
  font-size: 16px;
}

.time {
  color: #adb5bd;
  font-size: 14px;
}

.alert-level span {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.红色 .alert-level span {
  background-color: #ff4d4f;
}

.橙色 .alert-level span {
  background-color: #faad14;
}

.正常 .alert-level span {
  background-color: #52c41a;
}

.alert-message {
  padding: 12px 10px;
  font-size: 14px;
  line-height: 1.5;
}

.alert-action {
  margin-left: 15px;
  flex-shrink: 0;
}

.action-btn {
  padding: 6px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: white;
}

.action-btn.view.红色 {
  background-color: #ff4d4f;
}

.action-btn.view.橙色 {
  background-color: #faad14;
}

.action-btn.ignore {
  background-color: #8c8c8c;
}

.alert-detail-modal {
  .el-message-box__content {
    padding: 20px;
  }

  .alert-detail {
    p {
      margin-bottom: 10px;
      line-height: 1.6;
    }

    .level-红色 {
      color: #ff4d4f;
      font-weight: bold;
    }

    .level-橙色 {
      color: #faad14;
      font-weight: bold;
    }

    .level-正常 {
      color: #52c41a;
      font-weight: bold;
    }
  }
}
// 区域定义
.map-panel {
  grid-area: map;
}
.alert-panel {
  grid-area: alert;
}
.video-panel {
  grid-area: video;
}
.weather-panel {
  grid-area: weather;
}
.soil-panel {
  grid-area: soil;
}
.vegetation-panel {
  grid-area: vegetation;
}
.growth-level-panel {
  grid-area: growth;
}
</style>
