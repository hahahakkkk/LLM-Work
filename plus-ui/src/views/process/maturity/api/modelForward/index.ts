//成熟度评估接口
import request from '@/utils/request';

export function ripenessAssessment(data: { maturityLevel: string }) {
  return request({
    url: '/process/maturity/modelforward/ripeness',
    method: 'post',
    data
  });
}
