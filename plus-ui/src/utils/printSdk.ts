import Socket from '@/utils/Socket';
import NMPrintSocket from '@/utils/Print';
import axios from 'axios';
import jsQR from 'jsqr';

// 打印配置类型
export interface PrintConfig {
  labelType?: number; // 纸张类型，默认1（间隙纸）
  printMode?: number; // 打印模式，默认1（热敏）
  autoShutDown?: number; // 自动关机时间，默认1
  dpiRatio?: number; // 毫米转像素系数，默认8（精臣标准）
  retryCount?: number; // 任务重试次数，默认2
  paperWidth?: number; // 纸张宽度(mm)，默认50（手枪纸）
  paperHeight?: number; // 纸张高度(mm)，默认30（手枪纸）
}

// 二维码打印参数
export interface QrCodePrintParams {
  content: string; // 二维码内容
  width?: number; // 二维码宽度(mm)，默认40（适配50mm纸）
  height?: number; // 二维码高度(mm)，默认25（适配30mm纸）
  x?: number; // 横坐标，默认5
  y?: number; // 纵坐标，默认5
}

// 工具函数：图片路径转Base64
const imagePathToBase64 = async (imagePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!imagePath || typeof imagePath !== 'string') {
      reject(new Error('图片路径为空或格式错误'));
      return;
    }

    let imgSrc = imagePath;
    const isLocalPath = imagePath.startsWith('/') && !imagePath.startsWith('//');
    const isHttpPath = imagePath.startsWith('http://') || imagePath.startsWith('https://');

    if (isLocalPath) {
      imgSrc = `${import.meta.env.VITE_APP_BASE_URL || window.location.origin}${imagePath}`;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeoutTimer = setTimeout(() => {
      reject(new Error(`图片加载超时（5秒）：${imgSrc}`));
    }, 5000);

    img.onload = () => {
      clearTimeout(timeoutTimer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('画布创建失败');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(new Error(`图片转Base64失败：${(err as Error).message}`));
      }
    };

    img.onerror = (err) => {
      clearTimeout(timeoutTimer);
      let errMsg = `图片加载失败：${imgSrc}`;
      if (isHttpPath) {
        errMsg += '\n请检查：1.图片路径是否正确 2.图片服务器是否启动 3.是否跨域（需后端配置CORS）';
      } else {
        errMsg += '\n请检查：1.本地图片是否存在 2.路径是否正确';
      }
      reject(new Error(errMsg));
    };

    img.src = `${imgSrc}?t=${new Date().getTime()}`;
  });
};

// 工具函数：解析Base64二维码图片为文本内容
const decodeQrCodeFromBase64 = async (base64Str: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      resolve(code ? code.data : null);
    };

    img.onerror = () => {
      resolve(null);
    };
  });
};

class PrintSdk {
  private socketData: Socket | null = null;
  private nMPrintSocket: NMPrintSocket | null = null;
  private printSocketOpen = false;
  private initBool = false;
  private onlineUsbBool = false;
  private onlineWifiBool = false;
  private defaultConfig: PrintConfig = {
    labelType: 1,
    printMode: 1,
    autoShutDown: 1,
    dpiRatio: 8,
    retryCount: 2,
    paperWidth: 50,
    paperHeight: 30
  };
  private connecting = false;

  // 初始化打印服务连接
  async connectService(): Promise<boolean> {
    if (this.printSocketOpen) return true;
    if (this.connecting) {
      await new Promise((resolve) => {
        const checkStatus = setInterval(() => {
          if (!this.connecting) {
            clearInterval(checkStatus);
            resolve(true);
          }
        }, 100);
      });
      return this.printSocketOpen;
    }

    this.connecting = true;
    try {
      if (this.socketData) {
        this.socketData.close();
        this.socketData = null;
      }

      this.socketData = new Socket('ws://127.0.0.1:37989');
      const connectTimeout = new Promise((_, reject) => {
        setTimeout(() => {
          this.connecting = false;
          reject(new Error('打印服务连接超时（10秒）\n请检查：\n1. 精臣打印服务是否已启动\n2. 端口37989是否被占用\n3. 本地防火墙是否拦截该端口'));
        }, 10000);
      });

      const connectResult = await Promise.race([
        new Promise<boolean>((resolve, reject) => {
          this.socketData!.open(
            (openBool) => {
              this.printSocketOpen = openBool;
              this.connecting = false;
              if (openBool) {
                console.log('[PrintSdk] WebSocket连接成功');
                resolve(true);
              } else {
                reject(new Error('打印服务连接失败\n请确认：\n1. 精臣打印SDK服务程序已启动\n2. 服务端口为37989（未被修改）'));
              }
            },
            (msg) => {
              if (msg.resultAck?.callback) {
                const callbackName = msg.resultAck.callback.name;
                if (callbackName === 'onCoverStatusChange') {
                  console.log('盒盖状态:', msg.resultAck.info.capStatus);
                } else if (callbackName === 'onElectricityChange') {
                  console.log('电池电量:', msg.resultAck.info.power);
                }
              }
            }
          );
        }),
        connectTimeout
      ]);

      this.nMPrintSocket = new NMPrintSocket(this.socketData);
      return connectResult;
    } catch (error) {
      this.connecting = false;
      this.printSocketOpen = false;
      console.error('[PrintSdk] WebSocket连接失败:', error);
      throw new Error(`打印服务连接失败：${(error as Error).message}`);
    }
  }

  // 初始化SDK
  async initSdk(config: PrintConfig = {}): Promise<boolean> {
    if (!this.printSocketOpen) {
      await this.connectService();
    }
    if (this.initBool) return true;

    const finalConfig = { ...this.defaultConfig, ...config };
    try {
      if (!this.nMPrintSocket) {
        throw new Error('打印实例未初始化，请检查Socket连接');
      }
      const res = await this.nMPrintSocket.initSdk({ fontDir: '' });
      if (res.resultAck.errorCode === 0) {
        this.initBool = true;
        await this.nMPrintSocket.setPrinterAutoShutDownTime(finalConfig.autoShutDown!);
        console.log('[PrintSdk] SDK初始化成功');
        return true;
      } else {
        throw new Error(`SDK初始化失败：${res.resultAck.info || '未知错误'}`);
      }
    } catch (error) {
      console.error('[PrintSdk] SDK初始化失败:', error);
      throw new Error(`SDK初始化失败：${(error as Error).message}`);
    }
  }

  // 连接打印机
  async connectPrinter(): Promise<boolean> {
    if (!this.printSocketOpen) {
      await this.connectService();
    }
    if (!this.nMPrintSocket) {
      throw new Error('打印实例未初始化');
    }
    if (this.onlineUsbBool || this.onlineWifiBool) return true;

    try {
      // USB打印机
      const usbPrintersRes = await this.nMPrintSocket.getAllPrinters();
      if (usbPrintersRes.resultAck.errorCode === 0) {
        const usbPrinters = JSON.parse(usbPrintersRes.resultAck.info);
        const firstUsbPrinter = Object.keys(usbPrinters)[0];
        if (firstUsbPrinter) {
          const res = await this.nMPrintSocket.selectPrinter(firstUsbPrinter, parseInt(usbPrinters[firstUsbPrinter]));
          if (res.resultAck.errorCode === 0) {
            this.onlineUsbBool = true;
            console.log('[PrintSdk] USB打印机连接成功');
            return true;
          } else {
            console.warn('[PrintSdk] USB打印机连接失败，错误码：', res.resultAck.errorCode);
          }
        }
      }

      // WiFi打印机
      const wifiPrintersRes = await this.nMPrintSocket.scanWifiPrinter();
      if (wifiPrintersRes.resultAck.errorCode === 0) {
        const wifiPrinters = wifiPrintersRes.resultAck.info;
        if (wifiPrinters.length > 0) {
          const firstWifiPrinter = wifiPrinters[0];
          const res = await this.nMPrintSocket.connectWifiPrinter(firstWifiPrinter.deviceName, firstWifiPrinter.tcpPort);
          const result = JSON.parse(res.resultAck.result);
          if (result) {
            this.onlineWifiBool = true;
            console.log('[PrintSdk] WiFi打印机连接成功');
            return true;
          }
        }
      }

      throw new Error('未找到可用的打印机\n请检查：\n1. 打印机已开机并连接电脑（USB/WiFi）\n2. 打印机驱动已安装\n3. WiFi打印机与电脑在同一网络');
    } catch (error) {
      console.error('[PrintSdk] 打印机连接失败:', error);
      throw new Error(`打印机连接失败：${(error as Error).message}`);
    }
  }

  // 初始化打印画布
  private async initCanvas(finalConfig: PrintConfig): Promise<boolean> {
    if (!this.nMPrintSocket) {
      throw new Error('打印实例未初始化');
    }
    try {
      const canvasWidth = Math.floor((finalConfig.paperWidth! - 10) * finalConfig.dpiRatio!);
      const canvasHeight = Math.floor((finalConfig.paperHeight! - 5) * finalConfig.dpiRatio!);
      const canvasParams = {
        width: canvasWidth,
        height: canvasHeight
      };
      console.log('[PrintSdk] 画布初始化参数（适配手枪纸）:', canvasParams);
      const res = await this.nMPrintSocket.InitDrawingBoard(canvasParams);
      if (res.resultAck.errorCode !== 0) {
        throw new Error(`画布初始化失败：${res.resultAck.info || '错误码：' + res.resultAck.errorCode}`);
      }
      return true;
    } catch (error) {
      console.error('[PrintSdk] 画布初始化失败:', error);
      throw error;
    }
  }

  // 绘制二维码
  private async drawQrCode(params: QrCodePrintParams, finalConfig: PrintConfig): Promise<boolean> {
    if (!this.nMPrintSocket) {
      throw new Error('打印实例未初始化');
    }
    try {
      const qrWidth = params.width || 40;
      const qrHeight = params.height || 25;
      const qrCodeJson = {
        x: Math.floor((params.x || 5) * finalConfig.dpiRatio!),
        y: Math.floor((params.y || 2) * finalConfig.dpiRatio!),
        width: Math.floor(qrWidth * finalConfig.dpiRatio!),
        height: Math.floor(qrHeight * finalConfig.dpiRatio!),
        content: params.content,
        errorLevel: 'M',
        moduleSize: 1.5
      };
      console.log('[PrintSdk] 二维码绘制参数（手枪纸）:', qrCodeJson);
      const res = await this.nMPrintSocket.DrawLableQrCode(qrCodeJson);
      if (res.resultAck.errorCode !== 0) {
        throw new Error(`二维码绘制失败：${res.resultAck.info || '错误码：' + res.resultAck.errorCode}`);
      }
      console.log('[PrintSdk] 二维码绘制成功');
      return true;
    } catch (error) {
      console.error('[PrintSdk] 二维码绘制失败:', error);
      throw error;
    }
  }

  // 解析图片路径的二维码内容
  async getQrCodeContentFromPath(imagePath: string): Promise<string> {
    try {
      const base64Str = await imagePathToBase64(imagePath);
      const qrContent = await decodeQrCodeFromBase64(base64Str);
      if (!qrContent) {
        throw new Error('二维码解析失败，图片中未识别到二维码');
      }
      return qrContent;
    } catch (error) {
      console.error('[PrintSdk] 解析二维码失败:', error);
      throw new Error(`解析二维码失败：${(error as Error).message}`);
    }
  }

  // 提交打印任务（核心修复：移除null参数，适配低版本SDK）
  private async commitPrintJob(retryCount: number): Promise<boolean> {
    if (!this.nMPrintSocket) {
      throw new Error('打印实例未初始化');
    }

    try {
      // 修复：低版本SDK不支持第一个参数传null，直接调用commitJob（无参数/仅传空字符串）
      // 适配不同SDK版本的兼容写法
      let res;
      if (this.nMPrintSocket.commitJob.length === 0) {
        // 无参数版本
        res = await this.nMPrintSocket.commitJob();
      } else if (this.nMPrintSocket.commitJob.length === 1) {
        // 单参数版本
        res = await this.nMPrintSocket.commitJob('');
      } else {
        // 双参数版本（传空对象替代null）
        res = await this.nMPrintSocket.commitJob({}, '');
      }

      console.log('[PrintSdk] 提交打印任务结果:', res);
      if (res?.resultAck?.errorCode === 0) {
        return true;
      } else if (retryCount > 0) {
        console.warn(`[PrintSdk] 打印任务提交失败，剩余重试次数：${retryCount - 1}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.commitPrintJob(retryCount - 1);
      } else {
        throw new Error(`打印任务提交失败：${res?.resultAck?.info || '未知错误'}`);
      }
    } catch (error) {
      console.error('[PrintSdk] 提交打印任务失败:', error);
      // 兼容无返回值的情况
      if (retryCount > 0) {
        console.warn(`[PrintSdk] 打印任务语法错误，重试(${retryCount - 1})`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.commitPrintJob(retryCount - 1);
      }
      throw error;
    }
  }

  // 单条打印二维码
  async printQrCode(params: QrCodePrintParams, config: PrintConfig = {}): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };
    if (!params.content) {
      throw new Error('二维码打印内容不能为空');
    }

    // 重置打印状态
    if (this.nMPrintSocket) {
      try {
        await this.nMPrintSocket.endJob();
      } catch (e) {
        /* 忽略 */
      }
    }

    try {
      // 1. 初始化
      await this.initSdk(finalConfig);
      await this.connectPrinter();

      if (!this.nMPrintSocket) {
        throw new Error('打印实例未初始化，无法执行打印');
      }

      // 2. 启动打印任务（浓度传0）
      console.log('[PrintSdk] 启动打印任务（适配无浓度设置机型）:', {
        labelType: finalConfig.labelType,
        printMode: finalConfig.printMode,
        copies: 1
      });
      const resStart = await this.nMPrintSocket.startJob(
        0, // 默认浓度
        finalConfig.labelType!,
        finalConfig.printMode!,
        1
      );
      if (resStart.resultAck.errorCode !== 0) {
        throw new Error(`打印任务启动失败：${resStart.resultAck.info || '错误码：' + resStart.resultAck.errorCode}`);
      }

      // 3. 初始化画布+绘制二维码
      await this.initCanvas(finalConfig);
      await this.drawQrCode(params, finalConfig);

      // 4. 提交任务
      console.log('[PrintSdk] 提交打印任务（适配手枪纸）');
      await this.commitPrintJob(finalConfig.retryCount!);

      // 5. 延迟关闭任务
      setTimeout(async () => {
        try {
          await this.nMPrintSocket!.endJob();
        } catch (e) {
          /* 忽略 */
        }
      }, 2000);

      console.log('[PrintSdk] 打印任务提交成功，打印机执行中');
    } catch (error) {
      console.error('[PrintSdk] 二维码打印失败:', error);
      if (this.nMPrintSocket) {
        try {
          await this.nMPrintSocket.endJob();
        } catch (e) {
          /* 忽略 */
        }
      }
      throw error;
    }
  }

  // 销毁连接
  destroy() {
    this.connecting = false;
    this.printSocketOpen = false;
    this.initBool = false;
    this.onlineUsbBool = false;
    this.onlineWifiBool = false;
    if (this.socketData) {
      this.socketData.close();
      this.socketData = null;
    }
    this.nMPrintSocket = null;
    console.log('[PrintSdk] 打印服务连接已销毁');
  }
}

// 导出单例实例
export const printSdk = new PrintSdk();
// 导出工具函数
export { imagePathToBase64, decodeQrCodeFromBase64 };
