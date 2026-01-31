import request from '@/utils/request';

export const listAlert = (param) => {
  const params = {
    ...param,
    isAsc: 'desc'
  };

  return request({
    url: '/process/growth/alert/list',
    method: 'get',
    params
  });
};
