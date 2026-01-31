import type { TaskResultData, MeasureItem, DownloadReportRequest } from '../api/identify';
import { downloadAreaDetectionReport } from '../api/identify';
import { blobValidate } from '@/utils/ruoyi';

export interface ResultDisplayInfo {
  fieldName: string;
  baseName: string;
  plotName: string;
  detectionTime: string;
  longitude: number;
  latitude: number;
  taskId: string;
  incidence: number;
  level: string;
  conclusion: string;
  resultImageUrl: string;
  originImageUrl: string;
  downloadUrl: string;
  measures: MeasureItem;
}

export interface DetectionStats {
  incidenceRate: number;
  healthyRate: number;
  levelTag: string;
  levelType: 'success' | 'warning' | 'danger';
}

export const useResultDisplay = () => {
  const resultData = ref<TaskResultData | null>(null);
  const showResult = ref(false);

  const detectionStats = computed<DetectionStats>(() => {
    if (!resultData.value) {
      return {
        incidenceRate: 0,
        healthyRate: 100,
        levelTag: '健康',
        levelType: 'success'
      };
    }

    const incidence = resultData.value.incidence || 0;
    const healthyRate = 100 - incidence;

    let levelTag = '健康';
    let levelType: 'success' | 'warning' | 'danger' = 'success';

    if (incidence >= 25) {
      levelTag = '重度';
      levelType = 'danger';
    } else if (incidence >= 5) {
      levelTag = '中度';
      levelType = 'warning';
    } else if (incidence > 0) {
      levelTag = '轻度';
      levelType = 'warning';
    }

    return {
      incidenceRate: incidence,
      healthyRate,
      levelTag,
      levelType
    };
  });

  const displayInfo = computed<ResultDisplayInfo | null>(() => {
    if (!resultData.value) return null;

    return {
      fieldName: resultData.value.plotName || '未知地块',
      baseName: resultData.value.baseName || '未知基地',
      plotName: resultData.value.plotName || '未知地块',
      detectionTime: formatDateTime(resultData.value.createTime),
      longitude: resultData.value.longitude || 0,
      latitude: resultData.value.latitude || 0,
      taskId: resultData.value.taskId || '',
      incidence: resultData.value.incidence || 0,
      level: resultData.value.level || '健康',
      conclusion: resultData.value.conclusion || '暂无结论',
      resultImageUrl: resultData.value.resultImageUrl || '',
      originImageUrl: resultData.value.originImageUrl || '',
      downloadUrl: resultData.value.downloadUrl || '',
      measures: resultData.value.measure || {}
    };
  });

  const formattedMeasures = computed(() => {
    if (!resultData.value?.measure) return [];

    const measures: Array<{ type: string; items: string[] }> = [];

    const measureMap = resultData.value.measure;

    if (measureMap.化学防治 && measureMap.化学防治.length > 0) {
      measures.push({
        type: '化学防治',
        items: measureMap.化学防治
      });
    }

    if (measureMap.田间管理 && measureMap.田间管理.length > 0) {
      measures.push({
        type: '田间管理',
        items: measureMap.田间管理
      });
    }

    if (measureMap.抗病性管理 && measureMap.抗病性管理.length > 0) {
      measures.push({
        type: '抗病性管理',
        items: measureMap.抗病性管理
      });
    }

    return measures;
  });

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      const second = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    } catch (error) {
      return dateString;
    }
  };

  const getLevelTagType = (level: string): 'success' | 'warning' | 'danger' | 'info' => {
    const levelLower = level.toLowerCase();

    if (levelLower.includes('重度') || levelLower.includes('严重')) {
      return 'danger';
    } else if (levelLower.includes('中度')) {
      return 'warning';
    } else if (levelLower.includes('轻度')) {
      return 'warning';
    } else {
      return 'success';
    }
  };

  const setResultData = (data: TaskResultData) => {
    resultData.value = data;
    showResult.value = true;
  };

  const clearResult = () => {
    resultData.value = null;
    showResult.value = false;
  };

  const downloadReport = async () => {
    if (!resultData.value) {
      ElMessage({
        message: '暂无可下载的检测结果',
        type: 'warning'
      });
      return;
    }

    const payload = buildReportPayload(resultData.value);

    if (!payload) {
      return;
    }

    const loadingInstance = ElLoading.service({
      text: '正在生成报告...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    try {
      // axios 封装在 responseType=blob 时直接返回 Blob，而不是 { data }
      const respBlob = (await downloadAreaDetectionReport(payload)) as unknown as Blob;

      // 如果后端返回的是错误JSON而非PDF，这里进行校验并提示
      if (!blobValidate(respBlob)) {
        const text = await (respBlob as Blob).text();
        try {
          const err = JSON.parse(text);
          ElMessage({ message: err.msg || '报告生成失败', type: 'error' });
        } catch (_) {
          ElMessage({ message: '报告生成失败', type: 'error' });
        }
        return;
      }

      const blob = new Blob([respBlob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `病虫害检测报告_${payload.plotName}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      ElMessage({
        message: '报告下载成功',
        type: 'success'
      });
    } catch (error) {
      console.error('Download report error:', error);
      ElMessage({
        message: '报告下载失败',
        type: 'error'
      });
    } finally {
      loadingInstance.close();
    }
  };

  const buildReportPayload = (data: TaskResultData): DownloadReportRequest | null => {
    if (!data.baseId || !data.plotId) {
      ElMessage({
        message: '缺少基地或地块信息，无法生成报告',
        type: 'warning'
      });
      return null;
    }

    const description = buildDescriptionFromMeasures(data.measure, data.conclusion);

    return {
      baseName: data.baseName || '未知基地',
      plotName: data.plotName || '未知地块',
      longitude: data.longitude || 0,
      latitude: data.latitude || 0,
      diseaseType: data.level || '未知',
      incidenceRate: data.incidence || 0,
      rgbOriginalImage: data.rgbUrl || data.originImageUrl || '',
      tifOriginalImage: data.tifUrl || data.originImageUrl || '',
      rgbResultImage: data.resultImageUrl || '',
      description,
      baseId: data.baseId,
      plotId: data.plotId
    };
  };

  const buildDescriptionFromMeasures = (measure: MeasureItem, fallback: string): string => {
    const parts: string[] = [];

    if (measure?.化学防治?.length) {
      parts.push(`化学防治: ${measure.化学防治.join('；')}`);
    }

    if (measure?.田间管理?.length) {
      parts.push(`田间管理: ${measure.田间管理.join('；')}`);
    }

    if (measure?.抗病性管理?.length) {
      parts.push(`抗病性管理: ${measure.抗病性管理.join('；')}`);
    }

    if (parts.length === 0 && fallback) {
      parts.push(fallback);
    }

    return parts.join('；');
  };

  return {
    resultData,
    showResult,
    detectionStats,
    displayInfo,
    formattedMeasures,
    setResultData,
    clearResult,
    downloadReport,
    getLevelTagType,
    formatDateTime,
    buildDescriptionFromMeasures
  };
};
