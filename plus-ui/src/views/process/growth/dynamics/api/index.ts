import request from '@/utils/request';
import { AxiosPromise } from 'axios';

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
};
