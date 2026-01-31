import { downloadAreaDetectionReport } from '@/views/process/pestcontrol/farmland/api';

export enum EmergenceStatus {
  NORMAL = '正常',
  SLIGHT_DEFICIENCY = '低度缺苗',
  MODERATE_DEFICIENCY = '中度缺苗',
  SEVERE_DEFICIENCY = '高度缺苗'
}

export const EmergenceStatusMap: Record<EmergenceStatus, { label: string; btnType: string }> = {
  [EmergenceStatus.NORMAL]: { label: EmergenceStatus.NORMAL, btnType: 'success' },
  [EmergenceStatus.SLIGHT_DEFICIENCY]: { label: EmergenceStatus.SLIGHT_DEFICIENCY, btnType: 'warning' },
  [EmergenceStatus.MODERATE_DEFICIENCY]: { label: EmergenceStatus.MODERATE_DEFICIENCY, btnType: 'danger' },
  [EmergenceStatus.SEVERE_DEFICIENCY]: { label: EmergenceStatus.SEVERE_DEFICIENCY, btnType: 'danger' }
};

export const TaskStageMap = {
  'queued': '排队中',
  'downloading': '下载文件中',
  'processing': '准备处理',
  'inferencing': 'AI 模型检测中',
  'mapping': '结果映射计算中',
  'packaging': '生成报告打包中',
  'done': '完成',
  'failed': '失败'
};
