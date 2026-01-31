import { DifyConfig } from '@/utils/dify-manager';

export const DEFAULT_DIFY_CONFIG: DifyConfig = {
  token: 'LXWYrIxgfJPil2Gb',
  baseUrl: 'http://8.222.198.201',
  systemVariables: {},
  tools: {
    authentication: {
      enabled: true,
      type: 'bearer',
      content: 'Bearer ' // 初始为空，会在运行时填充
    }
  }
};
