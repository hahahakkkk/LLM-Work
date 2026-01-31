// 水肥一体化评估接口
import request from '@/utils/request';

export function waterFertilizerAssessment(data: { lai: number; growthLevel: string; spadValue: number }) {
  return request({
    url: '/process/maturity/modelforward/water-fertilizer',
    method: 'post',
    data
  });
}

// 成熟度预测接口
export function ripenessPrediction(data: { image: string }) {
  console.log(data);
  return request({
    url: '/process/maturity/modelforward/ripeness',
    method: 'post',
    data
  });
}

// 健康检查接口
export function healthCheck() {
  return request({
    url: '/process/maturity/modelforward/health',
    method: 'get'
  });
}
