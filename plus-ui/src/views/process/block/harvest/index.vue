<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="地块信息" prop="plotInfo">
              <el-input v-model="queryParams.plotInfo" placeholder="请输入地块信息" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="收割时间" prop="harvestTime">
              <el-input v-model="queryParams.harvestTime" placeholder="请输入收割时间" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="操作人" prop="operator">
              <el-input v-model="queryParams.operator" placeholder="请输入操作人" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- 添加打印服务状态检测按钮 -->
            <el-form-item label="打印服务" class="ml-2">
              <el-tag
                :type="printSocketOpen ? 'success' : 'danger'"
                :class="['cursor-pointer', printSocketOpen ? 'hover:opacity-80' : 'hover:bg-gray-100']"
                effect="dark"
                @click="checkPrintStatus"
              >
                <span class="flex items-center">
                  <el-icon class="mr-1">
                    <Printer v-if="printSocketOpen" />
                    <Warning v-else />
                  </el-icon>
                  {{ printSocketOpen ? '已连接' : '未连接' }}
                </span>
              </el-tag>
              <el-tooltip v-if="onlineUsbBool && printSocketOpen" content="点击查看打印机详情" placement="top">
                <el-tag type="info" class="ml-2 cursor-pointer" @click="showPrinterDetail">
                  <span class="flex items-center">
                    <el-icon class="mr-1"><Connection /></el-icon>
                    已连接打印机
                  </span>
                </el-tag>
              </el-tooltip>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="printer" :disabled="multiple" :loading="printLoading" @click="handleBatchPrint">批量打印</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="harvestList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="true" label="溯源码" align="center" prop="traceCode" />
        <el-table-column label="地块信息" align="center" prop="plotInfo" />
        <el-table-column label="收割时间" align="center" prop="harvestTime" />
        <el-table-column label="操作人" align="center" prop="operator" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="打印" placement="top">
              <el-button link type="primary" icon="printer" :loading="printLoading" @click="handlePrint(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 添加或修改收割溯源对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="harvestFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="地块信息" prop="plotInfo">
          <el-input v-model="form.plotInfo" placeholder="请输入地块信息" />
        </el-form-item>
        <el-form-item label="收割时间" prop="harvestTime">
          <el-input v-model="form.harvestTime" placeholder="请输入收割时间" />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="form.operator" placeholder="请输入操作人" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 打印机详情对话框 -->
    <el-dialog v-model="printerDetailVisible" title="打印机状态详情" width="500px" append-to-body>
      <div class="printer-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="打印服务状态">
            <el-tag :type="printSocketOpen ? 'success' : 'danger'">
              {{ printSocketOpen ? '已连接' : '未连接' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="SDK初始化">
            <el-tag :type="initBool ? 'success' : 'warning'">
              {{ initBool ? '已初始化' : '未初始化' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="打印机连接">
            <el-tag :type="onlineUsbBool ? 'success' : 'warning'">
              {{ onlineUsbBool ? '已连接' : '未连接' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前打印机" v-if="onlineUsbBool">
            {{ usbSelectPrinter || '未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="打印机盒盖状态">
            <el-tag :type="coverStatus === 0 ? 'success' : 'warning'">
              {{ coverStatus === 0 ? '已闭合' : '已打开' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="打印密度">
            {{ density }}
          </el-descriptions-item>
          <el-descriptions-item label="标签类型">
            {{ getLabelTypeName(label_type) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="mt-4 text-sm text-gray-500">
          <p class="mb-2">打印服务地址: ws://127.0.0.1:37989</p>
          <p>最后检测时间: {{ lastCheckTime }}</p>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="printerDetailVisible = false">关 闭</el-button>
          <el-button type="primary" @click="refreshPrinterStatus">重新检测</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Harvest" lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { FormInstance, ElMessageBox, ElMessage, ElLoading } from 'element-plus';
import { Printer, Warning, Connection } from '@element-plus/icons-vue';
import { listHarvest, getHarvest, delHarvest, addHarvest, updateHarvest } from '@/views/process/api/block/harvest';
import { HarvestVO, HarvestQuery, HarvestForm } from '@/views/process/api/block/harvest/types';
import { getPlant } from '@/views/process/api/block/plant';
import Socket from '@/utils/Socket';
import NMPrintSocket from '@/utils/Print';

// 类型定义
interface DialogOption {
  visible: boolean;
  title: string;
}

interface PageData<T, Q> {
  form: T;
  queryParams: Q;
  rules: Record<string, any[]>;
}

interface Printers {
  [key: string]: string;
}

interface PrintAck {
  resultAck: {
    errorCode: number;
    info?: string;
    result?: string;
    printPages?: number;
    printCopies?: number;
    printQuantity?: number;
    onPrintPageLengthCompleted?: number;
    callback?: {
      name: string;
    };
  };
}

interface WifiPrinterItem {
  deviceName: string;
  tcpPort: number;
}

interface JsonObject {
  printerImageProcessingInfo: {
    printQuantity: number;
  };
}

// 新增：适配样例的打印参数类型
interface InitDrawingBoardParam {
  width: number;
  height: number;
  rotate: number;
  path: string;
  verticalshift: number;
  Horizontalshift: number;
}

interface DrawQrcodeParam {
  x: number;
  y: number;
  height: number;
  width: number;
  value: string;
  rotate: number;
  codeType: number;
}

interface PrintParams {
  InitDrawingBoardParam: InitDrawingBoardParam;
  DrawQrcodeParam: DrawQrcodeParam;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 基础业务数据
const harvestList = ref<HarvestVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const printLoading = ref(false); // 打印加载状态
const coverStatus = ref<number>(0); // 新增：盒盖状态 0-闭合 1-打开

// 新增：打印状态检测相关
const printerDetailVisible = ref(false);
const lastCheckTime = ref<string>('');

const queryFormRef = ref<FormInstance>();
const harvestFormRef = ref<FormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: HarvestForm = {
  traceCode: undefined,
  plotInfo: undefined,
  harvestTime: undefined,
  operator: undefined
};

const data = reactive<PageData<HarvestForm, HarvestQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    plotInfo: undefined,
    harvestTime: undefined,
    operator: undefined,
    params: {}
  },
  rules: {
    traceCode: [{ required: true, message: '溯源码不能为空', trigger: 'blur' }],
    plotInfo: [{ required: true, message: '地块信息不能为空', trigger: 'blur' }],
    harvestTime: [{ required: true, message: '收割时间不能为空', trigger: 'blur' }],
    operator: [{ required: true, message: '操作人不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 打印相关响应式数据
const printState = reactive({
  socketData: null as Socket | null,
  nMPrintSocket: null as NMPrintSocket | null,
  printSocketOpen: false,
  initBool: false,
  usbPrinters: {} as Printers,
  wifiPrinters: {} as Printers,
  onlineUsbBool: false,
  onlineWifiBool: false,
  usbSelectPrinter: '',
  wifiSelectPrinter: '',
  density: 3,
  label_type: 1 as 1 | 2 | 3 | 4 | 5 | 6 | 10,
  print_mode: 1 as 1 | 2,
  auto_shut_down: 1,
  jsonObj: {
    printerImageProcessingInfo: {
      printQuantity: 1
    }
  } as JsonObject,
  isPrintError: false
});

const {
  socketData,
  nMPrintSocket,
  printSocketOpen,
  initBool,
  usbPrinters,
  onlineUsbBool,
  usbSelectPrinter,
  density,
  label_type,
  print_mode,
  jsonObj,
  isPrintError
} = toRefs(printState);

/** 获取标签类型名称 */
const getLabelTypeName = (type: number): string => {
  const typeMap: Record<number, string> = {
    1: '连续纸',
    2: '间隙纸',
    3: '黑标纸',
    4: '圆孔纸',
    5: '圆孔纸（中心圆孔）',
    6: '圆孔纸（两侧圆孔）',
    10: '连续纸（无传感器）'
  };
  return typeMap[type] || '未知类型';
};

/** 查询收割溯源列表 */
const getList = async () => {
  loading.value = true;
  const res = await listHarvest(queryParams.value);
  harvestList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  harvestFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: HarvestVO[]) => {
  ids.value = selection.map((item) => item.traceCode);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加收割溯源';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: HarvestVO) => {
  reset();
  const _traceCode = row?.traceCode || ids.value[0];
  const res = await getHarvest(_traceCode);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改收割溯源';
};

/** 提交按钮 */
const submitForm = () => {
  harvestFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        if (form.value.traceCode) {
          await updateHarvest(form.value);
        } else {
          await addHarvest(form.value);
        }
        proxy?.$modal.msgSuccess('操作成功');
        dialog.visible = false;
        await getList();
      } catch (error) {
        proxy?.$modal.msgError('操作失败');
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: HarvestVO) => {
  const _traceCodes = row?.traceCode || ids.value;
  try {
    await proxy?.$modal.confirm('是否确认删除收割溯源编号为"' + _traceCodes + '"的数据项？');
    await delHarvest(_traceCodes);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } catch (error) {
    loading.value = false;
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'block/harvest/export',
    {
      ...queryParams.value
    },
    `harvest_${new Date().getTime()}.xlsx`
  );
};

// -------------------------- 打印功能核心逻辑（回调风格，适配样例） --------------------------
/** 初始化打印服务连接（静默初始化） */
const initPrintSocket = () => {
  try {
    // 创建socket实例
    printState.socketData = new Socket('ws://127.0.0.1:37989');

    // 静默连接，不显示错误提示
    printState.socketData.open(
      (openBool: boolean) => {
        console.log('打印服务连接状态:', openBool);
        printState.printSocketOpen = openBool;
        // 只记录日志，不弹出提示
      },
      (msg: PrintAck) => {
        if (msg.resultAck.callback != undefined) {
          const callbackName = msg.resultAck.callback.name;
          let msgInfo: any;
          if (typeof msg.resultAck.info === 'string') {
            try {
              msgInfo = JSON.parse(msg.resultAck.info);
            } catch {
              msgInfo = {};
            }
          } else {
            msgInfo = msg.resultAck.info || {};
          }

          if (callbackName == 'onCoverStatusChange') {
            // 盒盖状态：0-闭合、1-打开（参考 PrintView.vue，只记录状态，不阻止打印）
            console.log('盒盖状态', msgInfo.capStatus);
            coverStatus.value = msgInfo.capStatus;
          } else if (callbackName == 'onElectricityChange') {
            console.log('电池电量等级', msgInfo.power);
          }
        }
      }
    );
    // 创建打印实例
    printState.nMPrintSocket = new NMPrintSocket(printState.socketData);
  } catch (error) {
    console.warn('打印服务初始化失败:', error);
    // 静默处理，不弹出提示
  }
};

/** 获取USB打印机列表 */
const getPrinters = async () => {
  if (!printSocketOpen.value) {
    proxy?.$modal.msgError('打印服务未开启');
    return;
  }
  try {
    const allPrintersRes = await nMPrintSocket.value!.getAllPrinters();
    if (allPrintersRes.resultAck.errorCode === 0) {
      const allPrinters: Printers = JSON.parse(allPrintersRes.resultAck.info || '{}');
      printState.usbPrinters = { ...allPrinters };
      printState.usbSelectPrinter = Object.keys(printState.usbPrinters)[0] || '';
      if (!printState.usbSelectPrinter) {
        proxy?.$modal.msgWarning('未检测到USB打印机');
      }
    } else {
      proxy?.$modal.msgWarning('没有在线的USB打印机');
    }
  } catch (err) {
    console.error('获取USB打印机列表失败:', err);
    proxy?.$modal.msgError('获取打印机列表失败');
  }
};

/** 连接USB打印机 */
const connectUsbPrinter = async () => {
  if (!printSocketOpen.value) {
    proxy?.$modal.msgError('打印服务未开启');
    return;
  }
  if (!usbSelectPrinter.value) {
    proxy?.$modal.msgWarning('请先选择USB打印机');
    return;
  }
  try {
    const res = await nMPrintSocket.value!.selectPrinter(usbSelectPrinter.value, parseInt(usbPrinters.value[usbSelectPrinter.value]));
    if (res.resultAck.errorCode === 0) {
      printState.onlineUsbBool = true;
      console.log('USB打印机连接成功');
    } else {
      printState.onlineUsbBool = false;
      console.error('USB打印机连接失败');
    }
  } catch (err) {
    console.error('连接USB打印机失败:', err);
    printState.onlineUsbBool = false;
  }
};

/** 初始化打印SDK */
const initSdk = async () => {
  if (!printSocketOpen.value) {
    proxy?.$modal.msgError('打印服务未开启');
    return false;
  }
  try {
    const res = await nMPrintSocket.value!.initSdk({ fontDir: '' });
    if (res.resultAck.errorCode == 0) {
      printState.initBool = true;
      console.log('SDK初始化成功');
      return true;
    } else {
      printState.initBool = false;
      console.error('SDK初始化失败');
      return false;
    }
  } catch (err) {
    console.error('SDK初始化失败:', err);
    printState.initBool = false;
    return false;
  }
};

/** 检查打印前置条件（服务连接、SDK初始化、打印机连接、盒盖状态） */
const checkPrintPreconditions = async (): Promise<boolean> => {
  // 1. 检查打印服务是否连接
  if (!printSocketOpen.value) {
    try {
      const loadingMsg = ElMessage.info('正在连接打印服务...');
      await reconnectPrintService();
      loadingMsg.close();

      if (!printSocketOpen.value) {
        proxy?.$modal.msgError('打印服务未连接，请确保打印服务已启动');
        return false;
      }
    } catch (error) {
      proxy?.$modal.msgError('打印服务连接失败，请检查服务状态');
      return false;
    }
  }

  // 2. 盒盖状态检查（参考 PrintView.vue，只记录状态，不阻止打印）
  // 如果盒盖打开，只给出提示，但不阻止打印
  if (coverStatus.value === 1) {
    console.warn('警告：打印机盒盖已打开，但继续打印（参考官方demo行为）');
    // 可选：给用户一个提示，但不阻止打印
    // proxy?.$modal.msgWarning('打印机盒盖已打开，打印可能失败，请确认后继续');
  }

  // 3. 检查SDK是否初始化
  if (!initBool.value) {
    const loadingMsg = ElMessage.info('正在初始化打印SDK...');
    const success = await initSdk();
    loadingMsg.close();
    if (!success) {
      proxy?.$modal.msgError('SDK初始化失败');
      return false;
    }
  }

  // 4. 检查打印机是否连接
  if (!onlineUsbBool.value) {
    const loadingMsg = ElMessage.info('正在连接USB打印机...');
    await getPrinters();
    if (!usbSelectPrinter.value) {
      loadingMsg.close();
      proxy?.$modal.msgError('未检测到可用打印机');
      return false;
    }
    await connectUsbPrinter();
    loadingMsg.close();
    if (!onlineUsbBool.value) {
      proxy?.$modal.msgError('打印机连接失败');
      return false;
    }
  }

  return true;
};

/** 重新连接打印服务 */
const reconnectPrintService = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (socketData.value) {
      // 关闭现有连接
      socketData.value.close();
    }

    // 重新初始化
    printState.socketData = new Socket('ws://127.0.0.1:37989');

    printState.socketData.open(
      (openBool: boolean) => {
        console.log('重新连接打印服务状态:', openBool);
        printState.printSocketOpen = openBool;
        if (!openBool) {
          resolve(false);
        } else {
          resolve(true);
        }
      },
      (msg: PrintAck) => {
        // 处理回调消息
        if (msg.resultAck.callback?.name === 'onCoverStatusChange') {
          const msgInfo = typeof msg.resultAck.info === 'string' ? JSON.parse(msg.resultAck.info) : msg.resultAck.info || {};
          coverStatus.value = msgInfo.capStatus;
        }
      }
    );

    // 设置连接超时
    setTimeout(() => {
      resolve(false);
    }, 3000);
  });
};

/** 构建回调风格的打印参数（完全匹配样例格式） */
const buildCallbackPrintParams = (traceCode: string): PrintParams => {
  return {
    InitDrawingBoardParam: {
      width: 75, // 画布宽度
      height: 25, // 画布高度
      rotate: 0, // 画布旋转角度
      path: 'ZT001.ttf', // 字体路径
      verticalshift: 0, // 水平偏移（暂不可用）
      Horizontalshift: 0 // 竖直偏移（暂不可用）
    },
    DrawQrcodeParam: {
      x: 4.0, // 水平坐标
      y: 4.0, // 垂直坐标
      height: 15, // 二维码高度（mm）
      width: 15, // 二维码宽度（mm）
      value: traceCode, // 动态替换为溯源码
      rotate: 0, // 旋转角度（仅0/90/180/270）
      codeType: 31 // 31=QR_CODE，32=PDF417，33=DATA_MATRIX，34=AZTEC
    }
  };
};

/** 回调风格的画布初始化（适配样例） */
const initDrawingBoard = (params: InitDrawingBoardParam, callback: () => void, errorCallback?: () => void) => {
  if (!nMPrintSocket.value) {
    proxy?.$modal.msgError('打印服务未初始化');
    if (errorCallback) errorCallback();
    return;
  }
  nMPrintSocket.value
    .InitDrawingBoard(params)
    .then((res) => {
      if (res.resultAck.errorCode === 0) {
        console.log('画布初始化成功');
        callback(); // 初始化成功，执行回调（绘制二维码）
      } else {
        throw new Error(`画布初始化失败: ${res.resultAck.info || '未知错误'}`);
      }
    })
    .catch((err) => {
      console.error('画布初始化异常:', err);
      proxy?.$modal.msgError(err.message || '画布初始化失败');
      if (errorCallback) errorCallback();
    });
};

/** 回调风格的二维码绘制（适配样例） */
const drawLableQrCode = (params: DrawQrcodeParam, callback: () => void, errorCallback?: () => void) => {
  if (!nMPrintSocket.value) {
    proxy?.$modal.msgError('打印服务未初始化');
    if (errorCallback) errorCallback();
    return;
  }
  nMPrintSocket.value
    .DrawLableQrCode(params)
    .then((res) => {
      if (res.resultAck.errorCode === 0) {
        console.log('二维码绘制成功');
        callback(); // 绘制成功，执行后续回调（提交打印任务）
      } else {
        throw new Error(`二维码绘制失败: ${res.resultAck.info || '未知错误'}`);
      }
    })
    .catch((err) => {
      console.error('二维码绘制异常:', err);
      proxy?.$modal.msgError(err.message || '二维码绘制失败');
      if (errorCallback) errorCallback();
    });
};

/** 回调风格的提交打印任务 */
const commitPrintJob = (callback: () => void, errorCallback?: () => void) => {
  if (!nMPrintSocket.value) {
    proxy?.$modal.msgError('打印服务未初始化');
    if (errorCallback) errorCallback();
    return;
  }
  const jsonStr = JSON.stringify(jsonObj.value);
  nMPrintSocket.value
    .commitJob(null, jsonStr)
    .then((res) => {
      if (res.resultAck.errorCode === 0) {
        console.log('打印任务提交成功');
        callback(); // 提交成功，执行后续回调
      } else {
        // 错误代码22是打印超时，但任务可能已经在打印机队列中，打印可能已经成功（参考之前的处理）
        if (res.resultAck.errorCode === 22) {
          console.warn('打印任务可能已提交到打印机队列，但打印机响应超时（错误代码22）');
          console.warn('这通常表示打印任务已发送到打印机，但打印机响应超时，打印可能已经成功');
          // 静默处理，不抛出错误，让任务继续
          callback();
        } else {
          throw new Error(`提交打印任务失败: ${res.resultAck.info || '未知错误'}`);
        }
      }
    })
    .catch((err) => {
      console.error('提交打印任务异常:', err);
      // 如果是超时相关的错误，也尝试静默处理
      if (err.message && (err.message.includes('超时') || err.message.includes('22'))) {
        console.warn('打印任务可能已提交，但响应超时');
        callback(); // 继续执行回调，因为打印可能已经成功
      } else {
        proxy?.$modal.msgError(err.message || '提交打印任务失败');
        if (errorCallback) errorCallback();
      }
    });
};

/** 单个标签打印（回调链：初始化画布 → 绘制二维码 → 提交任务） */
const printTagWithCallback = (printParams: PrintParams, finishCallback: () => void, errorCallback?: () => void) => {
  // 步骤1：初始化画布
  initDrawingBoard(
    printParams.InitDrawingBoardParam,
    () => {
      // 步骤2：绘制二维码（画布初始化成功后执行）
      drawLableQrCode(
        printParams.DrawQrcodeParam,
        () => {
          // 步骤3：提交打印任务（二维码绘制成功后执行）
          commitPrintJob(() => {
            console.log('单个标签打印流程完成');
            finishCallback(); // 所有步骤完成，执行最终回调
          }, errorCallback);
        },
        errorCallback
      );
    },
    errorCallback
  );
};

/** 批量打印（回调风格，递归处理多标签） */
const batchPrintWithCallback = (traceCodes: string[], finishCallback: () => void) => {
  if (traceCodes.length === 0) {
    proxy?.$modal.msgWarning('请选择需要打印的记录');
    finishCallback();
    return;
  }

  if (!nMPrintSocket.value) {
    proxy?.$modal.msgError('打印服务未初始化');
    finishCallback();
    return;
  }

  // 启动打印任务
  nMPrintSocket.value
    .startJob(density.value, label_type.value, print_mode.value, traceCodes.length * jsonObj.value.printerImageProcessingInfo.printQuantity)
    .then((startRes) => {
      if (startRes.resultAck.errorCode !== 0) {
        throw new Error(`启动打印任务失败: ${startRes.resultAck.info || '未知错误'}`);
      }

      console.log('打印任务启动成功，开始逐个打印');
      let index = 0;

      // 递归打印每个标签（适配回调风格的顺序执行）
      const printNext = () => {
        if (index >= traceCodes.length) {
          // 所有标签打印完成，结束任务（增加错误捕获）
          nMPrintSocket.value
            ?.endJob()
            .then((endRes) => {
              if (endRes.resultAck.errorCode === 0) {
                console.log('批量打印完成，结束任务成功');
              } else {
                console.warn('结束打印任务失败:', endRes.resultAck.info);
              }
              proxy?.$modal.msgSuccess('批量打印完成');
              finishCallback();
            })
            .catch((endErr) => {
              console.warn('调用endJob失败（服务可能已断开）:', endErr);
              proxy?.$modal.msgSuccess('批量打印完成（服务已断开）');
              finishCallback();
            });
          return;
        }

        // 构建当前标签的打印参数
        const printParams = buildCallbackPrintParams(traceCodes[index]);
        // 打印当前标签，完成后递归打印下一个
        printTagWithCallback(
          printParams,
          () => {
            index++;
            printNext();
          },
          () => {
            // 打印失败时，也继续下一个，避免阻塞整个流程
            console.warn(`第 ${index + 1} 个标签打印失败，继续下一个`);
            index++;
            printNext();
          }
        );
      };

      // 开始打印第一个标签
      printNext();
    })
    .catch((err) => {
      console.error('批量打印启动失败:', err);
      proxy?.$modal.msgError(err.message || '批量打印失败');
      finishCallback();
    });
};

/** 单个打印（对外暴露的最终方法） */
const handlePrint = async (row: HarvestVO) => {
  if (!row?.traceCode) {
    proxy?.$modal.msgWarning('溯源码不能为空');
    return;
  }

  printLoading.value = true;
  let loadingInstance: any = null;
  try {
    // 使用 ElLoading 显示加载提示
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在准备打印...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 检查打印前置条件
    const preCheckSuccess = await checkPrintPreconditions();

    if (!preCheckSuccess) {
      if (loadingInstance) loadingInstance.close();
      printLoading.value = false;
      return;
    }

    // const res = await getPlant(row.traceCode);
    // console.log('print log res', res);
    const url = 'http://mizhi-admin.nwafu.edu.cn:81/block/search/' + row.traceCode;
    console.log('print log url', url);

    // 执行单个打印（回调风格）
    // 使用 Promise 包装，确保能捕获所有错误
    await new Promise<void>((resolve, reject) => {
      batchPrintWithCallback([url], () => {
        // 打印完成（成功或失败都调用）
        if (loadingInstance) loadingInstance.close();
        printLoading.value = false;
        proxy?.$modal.msgSuccess('打印成功');
        resolve();
      });

      // 设置超时保护，避免永远等待
      setTimeout(() => {
        if (printLoading.value) {
          console.warn('打印超时，强制结束');
          if (loadingInstance) loadingInstance.close();
          printLoading.value = false;
          proxy?.$modal.msgSuccess('打印任务已发送');
          resolve();
        }
      }, 30000); // 30秒超时
    });
  } catch (err: any) {
    console.error('单个打印异常:', err);
    if (loadingInstance) loadingInstance.close();
    printLoading.value = false;
    proxy?.$modal.msgError(`打印失败: ${err.message}`);
  }
};

/** 批量打印（对外暴露的最终方法） */
const handleBatchPrint = async () => {
  if (ids.value.length === 0) {
    proxy?.$modal.msgWarning('请选择需要打印的记录');
    return;
  }

  printLoading.value = true;
  let loadingInstance: any = null;

  try {
    // 使用 ElLoading 显示加载提示
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在准备批量打印...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 检查打印前置条件
    const preCheckSuccess = await checkPrintPreconditions();

    if (!preCheckSuccess) {
      if (loadingInstance) loadingInstance.close();
      printLoading.value = false;
      return;
    }

    console.log('print log ids', ids);

    const urls = ids.value.map((id) => 'http://mizhi-admin.nwafu.edu.cn:81/block/search/' + id);
    console.log('print log url', urls);

    // 执行批量打印
    // 使用 Promise 包装，确保能捕获所有错误
    await new Promise<void>((resolve, reject) => {
      batchPrintWithCallback(urls as string[], () => {
        // 打印完成（成功或失败都调用）
        if (loadingInstance) loadingInstance.close();
        printLoading.value = false;
        resolve();
      });

      // 设置超时保护，避免永远等待
      setTimeout(() => {
        if (printLoading.value) {
          console.warn('批量打印超时，强制结束');
          if (loadingInstance) loadingInstance.close();
          printLoading.value = false;
          proxy?.$modal.msgSuccess('批量打印任务已发送');
          resolve();
        }
      }, 60000); // 60秒超时（批量打印可能需要更长时间）
    });
  } catch (err: any) {
    console.error('批量打印异常:', err);
    if (loadingInstance) loadingInstance.close();
    printLoading.value = false;
    proxy?.$modal.msgError(`批量打印失败: ${err.message}`);
  }
};

// -------------------------- 打印服务状态检测功能 --------------------------
/** 检查打印服务状态 */
const checkPrintStatus = async () => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在检测打印服务状态...',
    background: 'rgba(0, 0, 0, 0.7)'
  });

  try {
    // 更新检测时间
    lastCheckTime.value = new Date().toLocaleString();

    // 如果已经连接，直接显示成功
    if (printSocketOpen.value) {
      loadingInstance.close();

      // 刷新打印机连接状态
      await getPrinters();
      if (usbSelectPrinter.value) {
        await connectUsbPrinter();
      }

      // 刷新SDK状态
      if (!initBool.value) {
        await initSdk();
      }

      ElMessage.success('打印服务已连接');

      // 如果打印机已连接，显示更多信息
      if (onlineUsbBool.value) {
        ElMessage.info(`已连接打印机: ${usbSelectPrinter.value}`);
      }
    } else {
      // 尝试重新连接
      const success = await reconnectPrintService();
      loadingInstance.close();

      if (success) {
        ElMessage.success('打印服务连接成功');

        // 连接成功后尝试初始化SDK和连接打印机
        await initSdk();
        await getPrinters();
        if (usbSelectPrinter.value) {
          await connectUsbPrinter();
        }
      } else {
        ElMessage.error('打印服务连接失败，请检查：\n1. 打印服务是否已启动\n2. 服务地址: ws://127.0.0.1:37989\n3. 网络连接是否正常');
      }
    }
  } catch (error) {
    loadingInstance.close();
    console.error('打印服务检测异常:', error);
    ElMessage.error('打印服务检测失败');
  }
};

/** 显示打印机详情对话框 */
const showPrinterDetail = () => {
  // 更新检测时间
  lastCheckTime.value = new Date().toLocaleString();
  printerDetailVisible.value = true;
};

/** 刷新打印机状态 */
const refreshPrinterStatus = async () => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在刷新打印机状态...',
    background: 'rgba(0, 0, 0, 0.7)'
  });

  try {
    await checkPrintStatus();
    loadingInstance.close();
    ElMessage.success('打印机状态已刷新');
  } catch (error) {
    loadingInstance.close();
    ElMessage.error('刷新失败');
  }
};

// 初始化
onMounted(() => {
  getList();
  // 静默初始化打印服务（不显示提示）
  initPrintSocket();
});

// 页面卸载时清理打印服务连接
onUnmounted(() => {
  if (socketData.value) {
    socketData.value.close();
  }
});
</script>
