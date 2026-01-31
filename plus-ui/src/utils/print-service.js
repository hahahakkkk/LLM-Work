import Socket from './Socket';
import NMPrintSocket from './Print';

class PrintService {
  constructor() {
    this.socketData = null;
    this.nMPrintSocket = null;
    this.printSocketOpen = false;
    this.initBool = false;
    this.onlineUsbBool = false;
    this.onlineWifiBool = false;
    this.usbPrinters = {};
    this.wifiPrinters = {};
    this.usbSelectPrinter = '';
    this.wifiSelectPrinter = '';

    // 默认配置
    this.density = 3;
    this.label_type = 1;
    this.print_mode = 1;
    this.auto_shut_down = 1;
  }

  /**
   * 初始化打印服务
   * @param {Object} config - 配置参数
   * @param {number} config.density - 打印浓度 (1-15)
   * @param {number} config.labelType - 纸张类型 (1:间隙纸, 2:黑标纸, 3:连续纸)
   * @param {number} config.printMode - 打印模式 (1:热敏, 2:热转印)
   * @param {number} config.autoShutDown - 自动关机时间
   * @param {string} config.connectionType - 连接类型 ('usb' 或 'wifi')
   */
  async init(config = {}) {
    try {
      console.log('开始初始化打印服务...');

      // 应用配置
      if (config.density) this.density = config.density;
      if (config.labelType) this.label_type = config.labelType;
      if (config.printMode) this.print_mode = config.printMode;
      if (config.autoShutDown) this.auto_shut_down = config.autoShutDown;

      // 创建socket实例
      this.socketData = new Socket('ws://127.0.0.1:37989');

      // 等待连接建立
      await new Promise((resolve, reject) => {
        this.socketData.open(
          (openBool) => {
            this.printSocketOpen = openBool;
            if (openBool) {
              console.log('打印服务连接成功');
              resolve();
            } else {
              reject(new Error('打印服务连接失败'));
            }
          },
          (msg) => {
            // 处理回调消息
            if (msg.resultAck?.callback) {
              console.log('打印服务回调:', msg.resultAck.callback.name);
            }
          },
          (error) => {
            reject(new Error(`打印服务连接错误: ${error}`));
          }
        );
      });

      // 创建打印实例
      this.nMPrintSocket = new NMPrintSocket(this.socketData);

      // 初始化SDK
      await this.initSdk();

      // 获取并连接打印机
      await this.getPrinters();

      const connectionType = config.connectionType || 'usb';
      if (connectionType === 'usb') {
        await this.connectUsbPrinter();
      } else if (connectionType === 'wifi') {
        await this.connectWifiPrinter();
      }

      console.log('打印服务初始化完成');
      return true;
    } catch (error) {
      console.error('打印服务初始化失败:', error);
      throw error;
    }
  }

  // 获取所有打印机
  async getPrinters() {
    if (!this.printSocketOpen) {
      throw new Error('打印服务未开启');
    }

    try {
      console.log('开始获取USB打印机列表...');
      const allPrintersRes = await this.nMPrintSocket.getAllPrinters();
      if (allPrintersRes.resultAck.errorCode === 0) {
        const allPrinters = JSON.parse(allPrintersRes.resultAck.info);
        this.usbPrinters = { ...allPrinters };
        this.usbSelectPrinter = Object.keys(this.usbPrinters)[0];
        console.log('USB打印机列表:', this.usbPrinters);
        return this.usbPrinters;
      } else {
        console.warn('没有找到USB打印机');
        this.usbPrinters = {};
        return {};
      }
    } catch (err) {
      console.error('获取打印机列表失败:', err);
      this.usbPrinters = {};
      throw err;
    }
  }

  // 扫描Wifi打印机
  async scanWifiPrinters() {
    try {
      console.log('开始扫描Wifi打印机...');
      const allPrintersRes = await this.nMPrintSocket.scanWifiPrinter();
      const errorCode = allPrintersRes.resultAck.errorCode;

      if (errorCode === 0) {
        const allPrinters = allPrintersRes.resultAck.info;
        this.wifiPrinters = {};
        allPrinters.forEach((item) => {
          this.wifiPrinters[item.deviceName] = item.tcpPort;
        });
        this.wifiSelectPrinter = Object.keys(this.wifiPrinters)[0];
        console.log('Wifi打印机列表:', this.wifiPrinters);
        return this.wifiPrinters;
      } else {
        console.warn('没有找到Wifi打印机');
        this.wifiPrinters = {};
        return {};
      }
    } catch (err) {
      console.error('扫描Wifi打印机失败:', err);
      this.wifiPrinters = {};
      throw err;
    }
  }

  // 连接USB打印机
  async connectUsbPrinter() {
    if (!this.printSocketOpen) {
      throw new Error('打印服务未开启');
    }

    // 如果没有打印机列表，先获取
    if (Object.keys(this.usbPrinters).length === 0) {
      await this.getPrinters();
    }

    if (Object.keys(this.usbPrinters).length === 0) {
      throw new Error('没有可用的USB打印机，请确保打印机已连接');
    }

    try {
      console.log('开始连接USB打印机...', this.usbSelectPrinter);
      const res = await this.nMPrintSocket.selectPrinter(this.usbSelectPrinter, parseInt(this.usbPrinters[this.usbSelectPrinter]));

      if (res.resultAck.errorCode === 0) {
        this.onlineUsbBool = true;
        this.onlineWifiBool = false;
        console.log('USB打印机连接成功');
        return true;
      } else {
        this.onlineUsbBool = false;
        throw new Error('USB打印机连接失败');
      }
    } catch (err) {
      console.error(err);
      this.onlineUsbBool = false;
      throw err;
    }
  }

  // 连接Wifi打印机
  async connectWifiPrinter() {
    if (!this.printSocketOpen) {
      throw new Error('打印服务未开启');
    }

    // 如果没有Wifi打印机列表，先扫描
    if (Object.keys(this.wifiPrinters).length === 0) {
      await this.scanWifiPrinters();
    }

    if (Object.keys(this.wifiPrinters).length === 0) {
      throw new Error('没有可用的Wifi打印机');
    }

    try {
      console.log('开始连接Wifi打印机...', this.wifiSelectPrinter);
      const wifiConnectRes = await this.nMPrintSocket.connectWifiPrinter(this.wifiSelectPrinter, parseInt(this.wifiPrinters[this.wifiSelectPrinter]));

      const result = JSON.parse(wifiConnectRes.resultAck.result);
      if (result) {
        this.onlineWifiBool = true;
        this.onlineUsbBool = false;
        console.log('Wifi打印机连接成功');
        return true;
      } else {
        this.onlineWifiBool = false;
        throw new Error('Wifi打印机连接失败');
      }
    } catch (err) {
      console.error(err);
      this.onlineWifiBool = false;
      throw err;
    }
  }

  // 初始化SDK
  async initSdk() {
    if (!this.printSocketOpen) {
      throw new Error('打印服务未开启');
    }

    try {
      console.log('开始初始化SDK...');
      const res = await this.nMPrintSocket.initSdk({ fontDir: '' });
      if (res.resultAck.errorCode == 0) {
        this.initBool = true;
        console.log('SDK初始化成功');
        return true;
      } else {
        this.initBool = false;
        throw new Error('SDK初始化失败');
      }
    } catch (err) {
      console.error(err);
      this.initBool = false;
      throw err;
    }
  }

  /**
   * 打印图片（二维码/条形码）
   * @param {Object} config - 打印配置
   * @param {string} config.imagePath - 图片路径
   * @param {number} config.width - 图片宽度 (mm)
   * @param {number} config.height - 图片高度 (mm)
   * @param {number} config.x - X坐标 (mm)
   * @param {number} config.y - Y坐标 (mm)
   * @param {number} config.rotate - 旋转角度
   * @param {number} config.dpi - DPI值
   */
  async printImage(config) {
    try {
      console.log('开始打印图片...', config);

      // 准备打印数据
      const printData = this.createImagePrintData(config);

      // 执行打印
      await this.executePrintJob([printData]);

      console.log('图片打印完成');
      return true;
    } catch (error) {
      console.error('图片打印失败:', error);
      throw error;
    }
  }

  /**
   * 创建图片打印数据
   */
  createImagePrintData(config) {
    const { imagePath, width = 50, height = 30, x = 0, y = 0, rotate = 0, dpi = 203 } = config;

    if (!imagePath) {
      throw new Error('图片路径不能为空');
    }

    return {
      InitDrawingBoardParam: {
        x: 0,
        y: 0,
        width: width,
        height: height
      },
      elements: [
        {
          type: 'image',
          json: {
            x: x,
            y: y,
            width: width,
            height: height,
            rotate: rotate,
            dpi: dpi,
            path: imagePath
          }
        }
      ]
    };
  }

  /**
   * 批量打印图片
   * @param {Array} printItems - 打印项目数组
   */
  async batchPrintImages(printItems) {
    if (!printItems || printItems.length === 0) {
      throw new Error('打印项目不能为空');
    }

    try {
      console.log(`开始批量打印，共 ${printItems.length} 个项目`);

      // 准备所有打印数据
      const printDataList = printItems.map((item) => this.createImagePrintData(item));

      // 执行批量打印
      await this.executePrintJob(printDataList);

      console.log(`批量打印完成，共 ${printItems.length} 个项目`);
      return true;
    } catch (error) {
      console.error('批量打印失败:', error);
      throw error;
    }
  }

  /**
   * 执行打印任务
   * @param {Array} printDataList - 打印数据列表
   */
  async executePrintJob(printDataList) {
    if (!this.printSocketOpen) {
      throw new Error('打印服务未开启');
    }

    if (!this.initBool) {
      throw new Error('SDK未初始化');
    }

    if (!this.onlineUsbBool && !this.onlineWifiBool) {
      throw new Error('打印机未连接');
    }

    const jsonObj = {
      printerImageProcessingInfo: {
        printQuantity: 1
      }
    };

    let isPrintError = false;
    let printListener = null;

    const cleanupListener = () => {
      if (printListener) {
        this.nMPrintSocket.removePrintListener(printListener);
        printListener = null;
      }
    };

    try {
      cleanupListener();
      let pageIndex = 0;

      // 打印监听器
      printListener = this.nMPrintSocket.addPrintListener(async (msg) => {
        const resultAck = msg?.resultAck;

        // 提交成功，继续打印下一页
        if (resultAck?.errorCode === 0 && resultAck?.info === 'commitJob ok!') {
          if (isPrintError) return;
          if (pageIndex < printDataList.length) {
            try {
              await this.printSinglePage(printDataList[pageIndex]);
              pageIndex++;
            } catch (error) {
              isPrintError = true;
              cleanupListener();
              throw error;
            }
          }
        }

        // 打印进度更新
        if (resultAck?.printCopies != null && resultAck?.printPages != null) {
          console.log(`打印进度: 第${resultAck.printPages}页, 第${resultAck.printCopies}份`);
        }

        // 打印完成
        if (resultAck?.printCopies === jsonObj.printerImageProcessingInfo.printQuantity && resultAck?.printPages === printDataList.length) {
          try {
            const endRes = await this.nMPrintSocket.endJob();
            if (endRes.resultAck.errorCode === 0) {
              console.log('打印任务完成');
            }
          } finally {
            cleanupListener();
          }
        }

        // 打印错误
        if (resultAck?.errorCode !== 0 && resultAck?.info !== 'commitJob ok!') {
          isPrintError = true;
          cleanupListener();
          throw new Error(`打印错误: ${resultAck?.info || '未知错误'}`);
        }
      });

      // 开始打印任务
      const startRes = await this.nMPrintSocket.startJob(
        this.density,
        this.label_type,
        this.print_mode,
        printDataList.length * jsonObj.printerImageProcessingInfo.printQuantity
      );

      if (startRes.resultAck.errorCode !== 0) {
        cleanupListener();
        throw new Error(`打印任务启动失败: ${startRes.resultAck.info}`);
      }

      // 等待打印完成
      await new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (isPrintError) {
            clearInterval(checkInterval);
            reject(new Error('打印过程中发生错误'));
          }
          if (pageIndex >= printDataList.length) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    } catch (err) {
      console.error('执行打印任务失败:', err);
      cleanupListener();
      throw err;
    }
  }

  /**
   * 打印单页
   */
  async printSinglePage(printData) {
    try {
      // 初始化画布
      await this.initCanvas(printData.InitDrawingBoardParam);

      // 绘制元素
      await this.drawElements(printData.elements);

      // 提交打印任务
      await this.commitPrintJob();

      return true;
    } catch (error) {
      console.error('单页打印失败:', error);
      throw error;
    }
  }

  /**
   * 初始化画布
   */
  async initCanvas(params) {
    try {
      const res = await this.nMPrintSocket.InitDrawingBoard(params);
      if (res.resultAck.errorCode !== 0) {
        throw new Error('画布初始化失败');
      }
      return true;
    } catch (err) {
      console.error('画布初始化错误:', err);
      throw err;
    }
  }

  /**
   * 绘制元素
   */
  async drawElements(elements) {
    try {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        let result;

        switch (element.type) {
          case 'text':
            result = await this.nMPrintSocket.DrawLableText(element.json);
            break;
          case 'qrCode':
            result = await this.nMPrintSocket.DrawLableQrCode(element.json);
            break;
          case 'barCode':
            result = await this.nMPrintSocket.DrawLableBarCode(element.json);
            break;
          case 'line':
            result = await this.nMPrintSocket.DrawLableLine(element.json);
            break;
          case 'graph':
            result = await this.nMPrintSocket.DrawLableGraph(element.json);
            break;
          case 'image':
            result = await this.nMPrintSocket.DrawLableImage(element.json);
            break;
          default:
            throw new Error(`未知的打印元素类型: ${element.type}`);
        }

        if (result?.resultAck?.errorCode !== 0) {
          throw new Error(`元素绘制失败: ${element.type}`);
        }
      }
      return true;
    } catch (err) {
      console.error('绘制元素失败:', err);
      throw err;
    }
  }

  /**
   * 提交打印任务
   */
  async commitPrintJob() {
    const jsonObj = {
      printerImageProcessingInfo: {
        printQuantity: 1
      }
    };
    return this.nMPrintSocket.commitJob(null, JSON.stringify(jsonObj));
  }

  /**
   * 设置自动关机时间
   */
  async setAutoShutDownTime(level) {
    try {
      const res = await this.nMPrintSocket.setPrinterAutoShutDownTime(parseInt(level));
      if (res.resultAck.errorCode === 0) {
        console.log('自动关机时间设置成功');
        this.auto_shut_down = level;
        return true;
      } else if (res.resultAck.errorCode === -3) {
        console.log('打印机不支持设置自动关机时间');
        return false;
      } else {
        throw new Error('设置自动关机时间失败');
      }
    } catch (err) {
      console.error('设置自动关机时间失败:', err);
      throw err;
    }
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      isConnected: this.printSocketOpen,
      isInitialized: this.initBool,
      isUsbPrinterConnected: this.onlineUsbBool,
      isWifiPrinterConnected: this.onlineWifiBool,
      usbPrinters: this.usbPrinters,
      wifiPrinters: this.wifiPrinters,
      selectedUsbPrinter: this.usbSelectPrinter,
      selectedWifiPrinter: this.wifiSelectPrinter,
      density: this.density,
      labelType: this.label_type,
      printMode: this.print_mode,
      autoShutDown: this.auto_shut_down
    };
  }

  /**
   * 关闭连接
   */
  close() {
    try {
      if (this.socketData) {
        this.socketData.close();
      }
      this.printSocketOpen = false;
      this.initBool = false;
      this.onlineUsbBool = false;
      this.onlineWifiBool = false;
      console.log('打印服务连接已关闭');
    } catch (error) {
      console.error('关闭打印服务连接失败:', error);
    }
  }

  /**
   * 生成预览图片
   */
  async generatePreview(printData) {
    try {
      await this.initCanvas(printData.InitDrawingBoardParam);
      await this.drawElements(printData.elements);

      const res = await this.nMPrintSocket.generateImagePreviewImage(8);

      if (res.resultAck.errorCode == 0) {
        const imageData = JSON.parse(res.resultAck.info).ImageData;
        return `data:image/png;base64,${imageData}`;
      } else {
        throw new Error('生成预览失败');
      }
    } catch (error) {
      console.error('生成预览失败:', error);
      throw error;
    }
  }
}

// 单例模式导出
let printServiceInstance = null;

export const getPrintService = () => {
  if (!printServiceInstance) {
    printServiceInstance = new PrintService();
  }
  return printServiceInstance;
};

export const resetPrintService = () => {
  if (printServiceInstance) {
    printServiceInstance.close();
    printServiceInstance = null;
  }
};

export default PrintService;
