import axios from 'axios';
import FileSaver from 'file-saver';
import errorCode from '@/utils/errorCode';
import { blobValidate } from '@/utils/ruoyi';
// import { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
import { globalHeaders } from '@/utils/request';
import { ElLoading, ElMessage } from 'element-plus';

const baseURL = import.meta.env.VITE_APP_BASE_API;
// 移除全局遮罩，否则下载时导致页面不可操作
// let downloadLoadingInstance: LoadingInstance;

export async function downloadOss(ossIds: string | number | Array<string | number>) {
  let urlArray;
  if (typeof ossIds === 'string') {
    urlArray = ossIds.split(',');
  } else if (Array.isArray(ossIds)) {
    urlArray = ossIds.map((item) => item.toString());
  } else {
    urlArray = [ossIds.toString()];
  }
  const url = baseURL + '/four/oss/download';
  // 移除全局 loading
  // downloadLoadingInstance = ElLoading.service({ text: '正在下载数据，请稍候', background: 'rgba(0, 0, 0, 0.7)' });
  try {
    const res = await axios({
      method: 'post',
      url: url,
      responseType: 'blob',
      headers: globalHeaders(),
      data: urlArray // 将 ossUrl 放在请求体中
    });
    const isBlob = blobValidate(res.data);
    if (isBlob) {
      let fileName;
      if (urlArray.length === 1) {
        // 单个文件，从响应头获取文件名
        fileName = decodeURIComponent(res.headers['download-filename'] as string);
      } else {
        // 多个文件，使用默认的 ZIP 文件名
        fileName = 'batch_download.zip';
      }
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      FileSaver.saveAs(blob, fileName);
    } else {
      await printErrMsg(res.data);
    }
    // 不再关闭全局 loading
    // downloadLoadingInstance.close();
  } catch (r) {
    console.error(r);
    ElMessage.error('下载文件出现错误，请联系管理员！');
    // 不再关闭全局 loading
    // downloadLoadingInstance.close();
  }
}

async function printErrMsg(data: any) {
  const resText = await data.text();
  const rspObj = JSON.parse(resText);
  const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
  ElMessage.error(errMsg);
}
