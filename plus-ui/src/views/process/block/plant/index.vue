<template>
  <!-- 模板部分无变化，保持原有代码 -->
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="种子信息" prop="seedInfo">
              <el-input v-model="queryParams.seedInfo" placeholder="请输入种子信息" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="地块信息" prop="plotInfo">
              <el-input v-model="queryParams.plotInfo" placeholder="请输入地块信息" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="播种时间" prop="sowingTime">
              <el-input v-model="queryParams.sowingTime" placeholder="请输入播种时间" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="操作人" prop="operator">
              <el-input v-model="queryParams.operator" placeholder="请输入操作人" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- 新增：打印机状态展示 -->
            <el-form-item label="打印服务" class="ml-2">
              <el-tag :type="printSocketOpen ? 'success' : 'danger'" class="cursor-pointer hover:opacity-80" effect="dark" @click="checkPrintStatus">
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
      <!-- 新增：批量打印按钮 -->
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="printer" :disabled="multiple" :loading="printLoading" @click="handleBatchPrint">
              批量打印二维码
            </el-button>
          </el-col>
          <!-- 核心修改1：新增批量打印条形码按钮 -->
          <el-col :span="1.5">
            <el-button type="primary" plain icon="printer" :disabled="multiple" :loading="printLoading" @click="handleBatchPrintBarcode">
              批量打印条形码
            </el-button>
          </el-col>
          <!-- 批量打印组合码（二维码+条形码）按钮 -->
          <!-- <el-col :span="1.8">
            <el-button 
              type="primary" 
              plain 
              icon="printer" 
              :disabled="multiple" 
              :loading="printLoading" 
              @click="handleBatchPrintCombination"
            >
              批量打印组合码
            </el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" :data="plantList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="溯源码" align="center" prop="traceCode" />
        <el-table-column label="种子信息" align="center" prop="seedInfo">
          <template #default="scope">
            <dict-tag :options="crop_variety" :value="scope.row.seedInfo" />
          </template>
        </el-table-column>
        <el-table-column label="地块信息" align="center" prop="plotInfo" />
        <el-table-column label="播种时间" align="center" prop="sowingTime" />
        <el-table-column label="操作人" align="center" prop="operator" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
            <!-- 原有：打印二维码按钮 -->
            <el-tooltip content="打印二维码" placement="top">
              <el-button link type="primary" icon="printer" :loading="printLoading" @click="handlePrint(scope.row)"> 打印二维码 </el-button>
            </el-tooltip>
            <!-- 核心修改2：新增打印条形码按钮 -->
            <el-tooltip content="打印条形码" placement="top">
              <el-button link type="primary" icon="printer" :loading="printLoading" @click="handlePrintBarcode(scope.row)"> 打印条形码 </el-button>
            </el-tooltip>
            <!-- 打印组合码（二维码+条形码）按钮 -->
            <!-- <el-tooltip content="打印组合码" placement="top">
              <el-button 
                link 
                type="primary" 
                icon="printer" 
                :loading="printLoading" 
                @click="handlePrintCombination(scope.row)"
              >
                打印组合码
              </el-button>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 原有对话框：添加/修改播种溯源 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="plantFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="种子信息" prop="seedInfo">
          <el-input v-model="form.seedInfo" placeholder="请输入种子信息" />
        </el-form-item>
        <el-form-item label="地块信息" prop="plotInfo">
          <el-input v-model="form.plotInfo" placeholder="请输入地块信息" />
        </el-form-item>
        <el-form-item label="播种时间" prop="sowingTime">
          <el-input v-model="form.sowingTime" placeholder="请输入播种时间" />
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

    <!-- 原有对话框：种子信息详情 -->
    <el-dialog :title="'种子信息'" v-model="open" width="900px">
      <el-descriptions class="margin-top custom-descriptions" :column="2" :size="'large'" border>
        <el-descriptions-item label="网格信息">{{ infoForm.plotInfo }}</el-descriptions-item>
        <el-descriptions-item label="种子信息">
          <template #default="scope">
            <dict-tag :options="crop_variety" :value="infoForm.seedInfo" />
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ infoForm.operator }}</el-descriptions-item>
        <el-descriptions-item label="播种时间">{{ infoForm.sowingTime }}</el-descriptions-item>
        <!-- <el-descriptions-item span="2" label="溯源码">{{ infoForm.traceCode }}</el-descriptions-item> -->
        <el-descriptions-item span="2" label="溯源码">
          <span @click="goToTraceabilityPage(infoForm.traceCode)">
            {{ infoForm.traceCode }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item span="2" label="溯源二维码">
          <image-preview v-if="infoForm.qrCode" :src="infoForm.qrCode" :width="150" :height="150" />
        </el-descriptions-item>
        <el-descriptions-item span="2" label="条形码">
          <image-preview v-if="infoForm.barcode" :src="infoForm.barcode" :width="300" :height="100" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 新增：打印机详情对话框 -->
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
            <el-tag :type="coverStatus === 1 ? 'success' : 'warning'">
              {{ coverStatus === 1 ? '已闭合' : '已打开' }}
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

<script setup name="Plant" lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted, getCurrentInstance, ComponentInternalInstance, computed } from 'vue';
import { FormInstance, ElMessageBox, ElMessage, ElLoading } from 'element-plus';
import { Printer, Warning, Connection } from '@element-plus/icons-vue';
import { listPlant, getPlant, delPlant, addPlant, updatePlant } from '@/views/process/api/block/plant';
import { PlantVO, PlantQuery, PlantForm } from '@/views/process/api/block/plant/types';
import { useRouter } from 'vue-router';

// 新增：引入打印相关依赖
import Socket from '@/utils/Socket';
import NMPrintSocket from '@/utils/Print';
import { imgPrintData } from '@/utils/printData/Img';
import { barcodePrintData } from '@/utils/printData/Barcode';
import { combinationPrintData } from '@/utils/printData/Combination';

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

interface PrintData {
  InitDrawingBoardParam: any;
  elements: Array<{
    type: string;
    json: any;
  }>;
}

// 扩展PlantVO类型，确保包含qrCode和barcode字段
interface ExtendedPlantVO extends PlantVO {
  qrCode: string;
  barcode: string;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { crop_variety } = toRefs<any>(proxy?.useDict('crop_variety'));
const router = useRouter();

// 原有业务数据
const plantList = ref<ExtendedPlantVO[]>([]); // 修改为扩展类型
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const open = ref(false);
const infoForm = reactive<{
  plotInfo: string;
  seedInfo: string;
  operator: string;
  sowingTime: string;
  traceCode: string;
  qrCode: string;
  barcode: string;
}>({
  plotInfo: '',
  seedInfo: '',
  operator: '',
  sowingTime: '',
  traceCode: '',
  qrCode: '',
  barcode: ''
});

const queryFormRef = ref<FormInstance>();
const plantFormRef = ref<FormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PlantForm = {
  traceCode: undefined,
  seedInfo: undefined,
  plotInfo: undefined,
  sowingTime: undefined,
  operator: undefined
};

const data = reactive<PageData<PlantForm, PlantQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    seedInfo: undefined,
    plotInfo: undefined,
    sowingTime: undefined,
    operator: undefined,
    params: {}
  },
  rules: {
    traceCode: [{ required: true, message: '溯源码不能为空', trigger: 'blur' }],
    seedInfo: [{ required: true, message: '种子信息不能为空', trigger: 'blur' }],
    plotInfo: [{ required: true, message: '地块信息不能为空', trigger: 'blur' }],
    sowingTime: [{ required: true, message: '播种时间不能为空', trigger: 'blur' }],
    operator: [{ required: true, message: '操作人不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 新增：打印相关响应式数据
const printLoading = ref(false); // 打印加载状态
const coverStatus = ref<number>(1); // 原始盒盖状态（1=闭合/0=打开）
const printerDetailVisible = ref(false);
const lastCheckTime = ref<string>('');

// 打印状态管理
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

/** 原有业务方法 */
const getList = async () => {
  loading.value = true;
  const res = await listPlant(queryParams.value);
  plantList.value = res.rows as ExtendedPlantVO[]; // 类型转换
  total.value = res.total;
  loading.value = false;
};

const cancel = () => {
  reset();
  dialog.visible = false;
};

const reset = () => {
  form.value = { ...initFormData };
  plantFormRef.value?.resetFields();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: ExtendedPlantVO[]) => {
  // 修改类型
  ids.value = selection.map((item) => item.traceCode);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加播种溯源';
};

const handleUpdate = async (row?: ExtendedPlantVO) => {
  // 修改类型
  reset();
  const _traceCode = row?.traceCode || ids.value[0];
  const res = await getPlant(_traceCode);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改播种溯源';
};

const submitForm = () => {
  plantFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.traceCode) {
        await updatePlant(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPlant(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

const handleDelete = async (row?: ExtendedPlantVO) => {
  // 修改类型
  const _traceCodes = row?.traceCode || ids.value;
  await proxy?.$modal.confirm('是否确认删除播种溯源编号为"' + _traceCodes + '"的数据项？').finally(() => (loading.value = false));
  await delPlant(_traceCodes);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const handleDetail = async (row: ExtendedPlantVO) => {
  // 修改类型
  open.value = true;
  const _traceCode = row?.traceCode || ids.value[0];
  const res = await getPlant(_traceCode);
  Object.assign(infoForm, row);
};

const goToTraceabilityPage = (traceCode: string) => {
  if (!traceCode) {
    proxy?.$modal.msgWarning('溯源码不能为空');
    return;
  }

  // 关闭当前详情弹窗
  open.value = false;

  router.push({
    path: '/process/traceability/info',
    query: {
      traceCode: traceCode
    }
  });
};

// -------------------------- 核心新增：图片URL转Base64工具函数（二维码打印用） --------------------------
/**
 * 图片URL转换为纯Base64字符串（去掉data:image/png;base64,前缀）
 * @param url 图片网络地址
 * @returns 纯Base64编码字符串
 */
const convertImageUrlToBase64 = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('图片地址不能为空'));
      return;
    }

    const img = new Image();
    // 处理跨域（图片服务器需配置CORS）
    img.crossOrigin = 'Anonymous';

    img.onload = function () {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('创建Canvas上下文失败'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        // 转换为PNG格式的base64，去掉前缀只保留纯编码
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        resolve(base64);
      } catch (e) {
        reject(new Error(`图片转Base64失败：${(e as Error).message}`));
      }
    };

    img.onerror = (err) => {
      reject(new Error(`加载图片失败：${(err as ErrorEvent).message || '未知错误'}`));
    };

    // 超时处理（5秒）
    setTimeout(() => {
      reject(new Error('图片加载超时'));
    }, 5000);

    img.src = url;
  });
};

// -------------------------- 打印功能核心逻辑 --------------------------
/** 初始化打印服务连接（静默初始化） */
const initPrintSocket = () => {
  try {
    // 创建socket实例
    printState.socketData = new Socket('ws://127.0.0.1:37989');

    printState.socketData.open(
      (openBool: boolean) => {
        console.log('打印服务连接状态:', openBool);
        printState.printSocketOpen = openBool;
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

          // 监听盒盖状态（原始状态：1=闭合/0=打开）
          if (callbackName == 'onCoverStatusChange') {
            console.log('原始盒盖状态', msgInfo.capStatus);
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

/** 检查打印前置条件 */
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

  // 2. 盒盖状态检查（反转后的状态提示）
  if (coverStatus.value === 0) {
    proxy?.$modal.msgWarning('打印机盒盖已打开，请关闭后再打印');
    return false;
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
      socketData.value.close();
    }

    printState.socketData = new Socket('ws://127.0.0.1:37989');

    printState.socketData.open(
      (openBool: boolean) => {
        console.log('重新连接打印服务状态:', openBool);
        printState.printSocketOpen = openBool;
        resolve(openBool);
      },
      (msg: PrintAck) => {
        if (msg.resultAck.callback?.name === 'onCoverStatusChange') {
          const msgInfo = typeof msg.resultAck.info === 'string' ? JSON.parse(msg.resultAck.info) : msg.resultAck.info || {};
          coverStatus.value = msgInfo.capStatus;
        }
      }
    );

    // 3秒超时
    setTimeout(() => {
      resolve(false);
    }, 3000);
  });
};

/** 批量打印逻辑 - 核心修复：添加printType参数区分打印类型，isBatch标记是否批量 */
const batchPrintJob = async (list: PrintData[], printType: 'qrcode' | 'barcode' | 'combination' = 'barcode', isBatch = false) => {
  if (!printSocketOpen.value) {
    proxy?.$modal.msgError('打印服务未开启');
    return false;
  }

  // 打印类型映射提示文案
  const typeMsgMap = {
    qrcode: '二维码',
    barcode: '条形码',
    combination: '组合码'
  };

  const printQuantity = jsonObj.value.printerImageProcessingInfo.printQuantity;
  printState.isPrintError = false;

  let printListener: ((msg: PrintAck) => Promise<void> | void) | null = null;
  const cleanupListener = () => {
    if (printListener && nMPrintSocket.value) {
      nMPrintSocket.value.removePrintListener(printListener);
      printListener = null;
    }
  };

  try {
    cleanupListener();
    let pageIndex = 0;

    // 打印监听策略
    const strategyFactory = {
      handleCommitSuccess: async (): Promise<void> => {
        if (printState.isPrintError) return;
        if (pageIndex < list.length) {
          await printTag(list, pageIndex);
          pageIndex++;
        }
      },
      handleProgressUpdate: (resultAck: any): void => {
        console.log('打印进度更新', {
          当前进度: `第${resultAck.printPages}页,第${resultAck.printCopies}份`,
          总页数: list.length,
          完成长度: resultAck.onPrintPageLengthCompleted
        });
      },
      handleCompletion: async (): Promise<void> => {
        if (nMPrintSocket.value) {
          const endRes = await nMPrintSocket.value.endJob();
          if (endRes.resultAck.errorCode === 0) {
            console.log(`${typeMsgMap[printType]}打印完成`);
            // 非批量打印才显示单个成功提示
            if (!isBatch) {
              proxy?.$modal.msgSuccess(`${typeMsgMap[printType]}打印成功`);
            }
          }
        }
        cleanupListener();
      },
      handleError: (msg: PrintAck): void => {
        printState.isPrintError = true;
        cleanupListener();
        // 非批量打印才显示错误提示（批量打印统一在外部处理）
        if (!isBatch) {
          proxy?.$modal.msgError(`${typeMsgMap[printType]}打印错误: ${msg.resultAck.info || '未知错误'}`);
        }
      }
    };

    // 添加打印监听
    printListener = nMPrintSocket.value!.addPrintListener(async (msg: PrintAck) => {
      const resultAck = msg?.resultAck;

      if (resultAck?.errorCode === 0 && resultAck?.info === 'commitJob ok!') {
        await strategyFactory.handleCommitSuccess();
      }

      if (resultAck?.printCopies != null && resultAck?.printPages != null) {
        strategyFactory.handleProgressUpdate(resultAck);
      }

      if (resultAck?.printCopies === printQuantity && resultAck?.printPages === list.length) {
        await strategyFactory.handleCompletion();
      }

      if (resultAck?.errorCode !== 0) {
        strategyFactory.handleError(msg);
      }
    });

    // 启动打印任务
    const startRes = await nMPrintSocket.value!.startJob(density.value, label_type.value, print_mode.value, list.length * printQuantity);

    if (startRes.resultAck.errorCode !== 0) {
      cleanupListener();
      throw new Error(`启动${typeMsgMap[printType]}打印任务失败: ${startRes.resultAck.info || '未知错误'}`);
    }

    return true;
  } catch (err) {
    console.error(`${typeMsgMap[printType]}打印异常:`, err);
    cleanupListener();
    // 非批量打印才显示错误提示
    if (!isBatch) {
      proxy?.$modal.msgError(`${typeMsgMap[printType]}打印失败: ${(err as Error).message || '未知错误'}`);
    }
    return false;
  }
};

/** 绘制打印标签 */
const printTag = async (list: PrintData[], x: number): Promise<void> => {
  try {
    // 初始化画布
    await initCanvas(list[x].InitDrawingBoardParam);
    // 绘制元素
    await drawElementItem(list[x].elements);
    // 提交打印任务
    commitPrintJob();
  } catch (err) {
    console.error('绘制打印标签失败:', err);
    throw err;
  }
};

/** 初始化画布 */
const initCanvas = async (params: any): Promise<boolean> => {
  console.log('初始化打印画布');
  try {
    if (!nMPrintSocket.value) throw new Error('打印服务未初始化');
    const res = await nMPrintSocket.value.InitDrawingBoard(params);
    if (res.resultAck.errorCode !== 0) {
      throw new Error('画布初始化失败');
    }
    return true;
  } catch (err) {
    console.error('画布初始化错误:', err);
    return false;
  }
};

/** 绘制打印元素（扩展支持条形码） */
const drawElementItem = async (items: Array<{ type: string; json: any }>): Promise<void> => {
  console.log('开始绘制元素');
  try {
    if (!nMPrintSocket.value) throw new Error('打印服务未初始化');

    for (const item of items) {
      let result: any;
      switch (item.type) {
        case 'image':
          result = await nMPrintSocket.value.DrawLableImage(item.json);
          break;
        case 'barCode': // 新增：支持条形码绘制
          result = await nMPrintSocket.value.DrawLableBarCode(item.json);
          break;
        default:
          throw new Error(`未知的打印元素类型: ${item.type}`);
      }

      if (result?.resultAck?.errorCode !== 0) {
        throw new Error(`绘制${item.type}失败: ${result.resultAck.info || '未知错误'}`);
      }
    }
  } catch (err) {
    console.error('绘制元素失败:', err);
    throw err;
  }
};

/** 提交打印任务 */
const commitPrintJob = async (): Promise<void> => {
  if (!nMPrintSocket.value) throw new Error('打印服务未初始化');
  const jsonStr = JSON.stringify(jsonObj.value);
  await nMPrintSocket.value.commitJob(null, jsonStr);
};

/** 打印图片 - 核心修复：添加printType参数区分打印类型 */
const printImage = async (printData: PrintData, printType: 'qrcode' | 'barcode' | 'combination' = 'qrcode', isBatch = false) => {
  if (!printSocketOpen.value) {
    proxy?.$modal.msgError('打印服务未开启');
    return false;
  }

  // 打印类型映射提示文案
  const typeMsgMap = {
    qrcode: '二维码',
    barcode: '条形码',
    combination: '组合码'
  };

  const printQuantity = jsonObj.value.printerImageProcessingInfo.printQuantity;
  printState.isPrintError = false;

  let printListener: ((msg: PrintAck) => Promise<void> | void) | null = null;
  const cleanupListener = () => {
    if (printListener && nMPrintSocket.value) {
      nMPrintSocket.value.removePrintListener(printListener);
      printListener = null;
    }
  };

  try {
    cleanupListener();
    let pageIndex = 0;
    const contentArr = [printData];

    // 打印监听策略
    const strategyFactory = {
      handleCommitSuccess: async (): Promise<void> => {
        if (printState.isPrintError) return;
        if (pageIndex < contentArr.length) {
          await printTag(contentArr, pageIndex);
          pageIndex++;
        }
      },
      handleProgressUpdate: (resultAck: any): void => {
        console.log('打印进度更新', {
          当前进度: `第${resultAck.printPages}页,第${resultAck.printCopies}份`,
          总页数: contentArr.length,
          完成长度: resultAck.onPrintPageLengthCompleted
        });
      },
      handleCompletion: async (): Promise<void> => {
        if (nMPrintSocket.value) {
          const endRes = await nMPrintSocket.value.endJob();
          if (endRes.resultAck.errorCode === 0) {
            console.log(`${typeMsgMap[printType]}打印完成`);
            // 非批量打印才显示单个成功提示
            if (!isBatch) {
              proxy?.$modal.msgSuccess(`${typeMsgMap[printType]}打印成功`);
            }
          }
        }
        cleanupListener();
      },
      handleError: (msg: PrintAck): void => {
        printState.isPrintError = true;
        cleanupListener();
        // 非批量打印才显示错误提示
        if (!isBatch) {
          proxy?.$modal.msgError(`${typeMsgMap[printType]}打印错误: ${msg.resultAck.info || '未知错误'}`);
        }
      }
    };

    // 添加打印监听
    printListener = nMPrintSocket.value!.addPrintListener(async (msg: PrintAck) => {
      const resultAck = msg?.resultAck;

      if (resultAck?.errorCode === 0 && resultAck?.info === 'commitJob ok!') {
        await strategyFactory.handleCommitSuccess();
      }

      if (resultAck?.printCopies != null && resultAck?.printPages != null) {
        strategyFactory.handleProgressUpdate(resultAck);
      }

      if (resultAck?.printCopies === printQuantity && resultAck?.printPages === contentArr.length) {
        await strategyFactory.handleCompletion();
      }

      if (resultAck?.errorCode !== 0) {
        strategyFactory.handleError(msg);
      }
    });

    // 启动打印任务
    const startRes = await nMPrintSocket.value!.startJob(density.value, label_type.value, print_mode.value, contentArr.length * printQuantity);

    if (startRes.resultAck.errorCode !== 0) {
      cleanupListener();
      throw new Error(`启动${typeMsgMap[printType]}打印任务失败: ${startRes.resultAck.info || '未知错误'}`);
    }

    return true;
  } catch (err) {
    console.error(`${typeMsgMap[printType]}打印异常:`, err);
    cleanupListener();
    // 非批量打印才显示错误提示
    if (!isBatch) {
      proxy?.$modal.msgError(`${typeMsgMap[printType]}打印失败: ${(err as Error).message || '未知错误'}`);
    }
    return false;
  }
};

/** 单个打印二维码（对外暴露） */
const handlePrint = async (row: ExtendedPlantVO) => {
  if (!row?.traceCode) {
    proxy?.$modal.msgWarning('溯源码不能为空');
    return;
  }

  // 检查qrCode是否存在
  if (!row.qrCode) {
    proxy?.$modal.msgWarning('该记录无二维码图片，无法打印');
    return;
  }

  console.log('打印二维码行数据:', row);
  printLoading.value = true;
  let loadingInstance: any = null;

  try {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在准备打印二维码...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 1. 检查打印前置条件
    const preCheckSuccess = await checkPrintPreconditions();
    if (!preCheckSuccess) return;

    // 2. 将qrCode转换为Base64
    const qrCodeBase64 = await convertImageUrlToBase64(row.qrCode);
    console.log('二维码Base64转换成功');

    // 3. 替换打印数据中的imageData
    const customImgPrintData = JSON.parse(JSON.stringify(imgPrintData));
    // 核心替换：将imageData改为转换后的Base64
    if (customImgPrintData.elements && customImgPrintData.elements.length > 0) {
      const imageElement = customImgPrintData.elements.find((item: any) => item.type === 'image');
      if (imageElement && imageElement.json) {
        imageElement.json.imageData = qrCodeBase64;
        // 二维码尺寸调整
        imageElement.json.width = 20;
        imageElement.json.height = 20;
      }
    }

    // 4. 执行图片打印 - 指定打印类型为二维码
    await printImage(customImgPrintData, 'qrcode');
  } catch (err: any) {
    console.error('单个打印二维码异常:', err);
    proxy?.$modal.msgError(`二维码打印失败: ${err.message}`);
  } finally {
    if (loadingInstance) loadingInstance.close();
    printLoading.value = false;
  }
};

/** 批量打印二维码（对外暴露）- 核心修复：批量构建打印数据，一次性打印 */
const handleBatchPrint = async () => {
  if (ids.value.length === 0) {
    proxy?.$modal.msgWarning('请选择需要打印的记录');
    return;
  }

  printLoading.value = true;
  let loadingInstance: any = null;

  try {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在准备批量打印二维码...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 1. 检查打印前置条件
    const preCheckSuccess = await checkPrintPreconditions();
    if (!preCheckSuccess) return;

    // 2. 批量构建打印数据列表
    const printDataList: PrintData[] = [];
    const failList: string[] = [];

    for (const traceCode of ids.value) {
      try {
        // 2.1 获取当前记录的详细信息（包含qrCode）
        const res = await getPlant(traceCode as string);
        const plantItem = res.data as ExtendedPlantVO;

        if (!plantItem.qrCode) {
          failList.push(`${traceCode}（无二维码图片）`);
          continue;
        }

        // 2.2 转换二维码为Base64
        const qrCodeBase64 = await convertImageUrlToBase64(plantItem.qrCode);

        // 2.3 替换打印数据
        const customImgPrintData = JSON.parse(JSON.stringify(imgPrintData));
        if (customImgPrintData.elements && customImgPrintData.elements.length > 0) {
          const imageElement = customImgPrintData.elements.find((item: any) => item.type === 'image');
          if (imageElement && imageElement.json) {
            imageElement.json.imageData = qrCodeBase64;
            imageElement.json.width = 20;
            imageElement.json.height = 20;
          }
        }

        printDataList.push(customImgPrintData);
      } catch (err: any) {
        console.error(`构建${traceCode}二维码打印数据失败:`, err);
        failList.push(`${traceCode}（${err.message}）`);
      }
    }

    // 3. 执行批量打印
    if (printDataList.length > 0) {
      const printSuccess = await batchPrintJob(printDataList, 'qrcode', true);
      if (!printSuccess) {
        failList.push('批量打印任务执行失败');
      }
    }

    // 4. 批量打印结果提示
    const successCount = printDataList.length;
    let msg = `批量打印二维码完成：成功${successCount}个，失败${failList.length}个`;
    if (failList.length > 0) {
      msg += `\n失败列表：${failList.join('；')}`;
    }
    proxy?.$modal.msgSuccess(msg);
  } catch (err: any) {
    console.error('批量打印二维码异常:', err);
    proxy?.$modal.msgError(`批量打印二维码失败: ${err.message}`);
  } finally {
    if (loadingInstance) loadingInstance.close();
    printLoading.value = false;
  }
};

/** 单个打印条形码函数 - 核心修复：指定打印类型为条形码 */
const handlePrintBarcode = async (row: ExtendedPlantVO) => {
  if (!row?.traceCode) {
    proxy?.$modal.msgWarning('溯源码不能为空');
    return;
  }

  console.log('打印条形码行数据:', row);
  printLoading.value = true;
  let loadingInstance: any = null;

  try {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在准备打印条形码...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 1. 检查打印前置条件
    const preCheckSuccess = await checkPrintPreconditions();
    if (!preCheckSuccess) return;

    // 2. 深拷贝固定的barcodePrintData对象，避免修改原对象
    const barcodePrintConfig = JSON.parse(JSON.stringify(barcodePrintData));
    // 3. 动态替换条形码的value为当前行的溯源码
    if (barcodePrintConfig.elements && barcodePrintConfig.elements.length > 0) {
      const barCodeElement = barcodePrintConfig.elements.find((item: any) => item.type === 'barCode');
      if (barCodeElement && barCodeElement.json) {
        barCodeElement.json.value = row.traceCode; // 替换为动态溯源码
        barCodeElement.json.width = 30;
        barCodeElement.json.height = 10;
      }
    }
    console.log('条形码打印数据:', barcodePrintConfig);

    // 4. 执行条形码打印 - 指定打印类型为条形码
    await batchPrintJob([barcodePrintConfig], 'barcode');
  } catch (err: any) {
    console.error('单个打印条形码异常:', err);
    proxy?.$modal.msgError(`条形码打印失败: ${err.message}`);
  } finally {
    if (loadingInstance) loadingInstance.close();
    printLoading.value = false;
  }
};

/** 批量打印条形码函数 - 核心修复：批量构建打印数据，一次性打印 */
const handleBatchPrintBarcode = async () => {
  if (ids.value.length === 0) {
    proxy?.$modal.msgWarning('请选择需要打印的记录');
    return;
  }

  printLoading.value = true;
  let loadingInstance: any = null;

  try {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在准备批量打印条形码...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 1. 检查打印前置条件
    const preCheckSuccess = await checkPrintPreconditions();
    if (!preCheckSuccess) return;

    // 2. 批量构建条形码打印数据列表
    const printDataList: PrintData[] = [];
    const failList: string[] = [];

    for (const traceCode of ids.value) {
      try {
        // 2.1 深拷贝固定的barcodePrintData对象
        const barcodePrintConfig = JSON.parse(JSON.stringify(barcodePrintData));
        // 2.2 动态替换条形码的value为当前溯源码
        if (barcodePrintConfig.elements && barcodePrintConfig.elements.length > 0) {
          const barCodeElement = barcodePrintConfig.elements.find((item: any) => item.type === 'barCode');
          if (barCodeElement && barCodeElement.json) {
            barCodeElement.json.value = traceCode as string; // 替换为动态溯源码
            barCodeElement.json.width = 30;
            barCodeElement.json.height = 10;
          }
        }

        printDataList.push(barcodePrintConfig);
      } catch (err: any) {
        console.error(`构建${traceCode}条形码打印数据失败:`, err);
        failList.push(`${traceCode}（${err.message}）`);
      }
    }

    // 3. 执行批量打印
    if (printDataList.length > 0) {
      const printSuccess = await batchPrintJob(printDataList, 'barcode', true);
      if (!printSuccess) {
        failList.push('批量打印任务执行失败');
      }
    }

    // 4. 批量打印结果提示
    const successCount = printDataList.length;
    let msg = `批量打印条形码完成：成功${successCount}个，失败${failList.length}个`;
    if (failList.length > 0) {
      msg += `\n失败列表：${failList.join('；')}`;
    }
    proxy?.$modal.msgSuccess(msg);
  } catch (err: any) {
    console.error('批量打印条形码异常:', err);
    proxy?.$modal.msgError(`批量打印条形码失败: ${err.message}`);
  } finally {
    if (loadingInstance) loadingInstance.close();
    printLoading.value = false;
  }
};

/** 单个打印组合码（二维码+条形码）函数 - 核心修复：指定打印类型为组合码 */
const handlePrintCombination = async (row: ExtendedPlantVO) => {
  if (!row?.traceCode) {
    proxy?.$modal.msgWarning('溯源码不能为空');
    return;
  }

  // 检查qrCode是否存在
  if (!row.qrCode) {
    proxy?.$modal.msgWarning('该记录无二维码图片，无法打印组合码');
    return;
  }

  console.log('打印组合码行数据:', row);
  printLoading.value = true;
  let loadingInstance: any = null;

  try {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在准备打印组合码...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 1. 检查打印前置条件
    const preCheckSuccess = await checkPrintPreconditions();
    if (!preCheckSuccess) return;

    // 2. 转换二维码为Base64
    const qrCodeBase64 = await convertImageUrlToBase64(row.qrCode);
    console.log('二维码Base64转换成功');

    // 3. 深拷贝引入的combinationPrintData，动态替换字段
    const combinationPrintConfig = JSON.parse(JSON.stringify(combinationPrintData));

    // 3.1 替换二维码的imageData
    if (combinationPrintConfig.elements && combinationPrintConfig.elements.length > 0) {
      const imageElement = combinationPrintConfig.elements.find((item: any) => item.type === 'image');
      if (imageElement && imageElement.json) {
        imageElement.json.imageData = qrCodeBase64;
        imageElement.json.width = 10;
        imageElement.json.height = 10;
        imageElement.json.x = 10;
      }

      // 3.2 替换条形码的value
      const barCodeElement = combinationPrintConfig.elements.find((item: any) => item.type === 'barCode');
      if (barCodeElement && barCodeElement.json) {
        barCodeElement.json.value = row.traceCode;
        barCodeElement.json.width = 30;
        barCodeElement.json.height = 10;
        barCodeElement.json.x = 0;
        barCodeElement.json.y = 15;
      }
    }
    console.log('组合打印数据:', combinationPrintConfig);

    // 4. 执行组合打印 - 指定打印类型为组合码
    await batchPrintJob([combinationPrintConfig], 'combination');
  } catch (err: any) {
    console.error('单个打印组合码异常:', err);
    proxy?.$modal.msgError(`组合码打印失败: ${err.message}`);
  } finally {
    if (loadingInstance) loadingInstance.close();
    printLoading.value = false;
  }
};

/** 批量打印组合码（二维码+条形码）函数 - 核心修复：批量构建打印数据，一次性打印 */
const handleBatchPrintCombination = async () => {
  if (ids.value.length === 0) {
    proxy?.$modal.msgWarning('请选择需要打印的记录');
    return;
  }

  printLoading.value = true;
  let loadingInstance: any = null;

  try {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在准备批量打印组合码...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 1. 检查打印前置条件
    const preCheckSuccess = await checkPrintPreconditions();
    if (!preCheckSuccess) return;

    // 2. 批量构建组合码打印数据列表
    const printDataList: PrintData[] = [];
    const failList: string[] = [];

    for (const traceCode of ids.value) {
      try {
        // 2.1 获取当前记录的详细信息（包含qrCode）
        const res = await getPlant(traceCode as string);
        const plantItem = res.data as ExtendedPlantVO;

        if (!plantItem.qrCode) {
          failList.push(`${traceCode}（无二维码图片）`);
          continue;
        }

        // 2.2 转换二维码为Base64
        const qrCodeBase64 = await convertImageUrlToBase64(plantItem.qrCode);

        // 2.3 深拷贝引入的combinationPrintData，动态替换字段
        const combinationPrintConfig = JSON.parse(JSON.stringify(combinationPrintData));

        // 2.3.1 替换二维码的imageData
        if (combinationPrintConfig.elements && combinationPrintConfig.elements.length > 0) {
          const imageElement = combinationPrintConfig.elements.find((item: any) => item.type === 'image');
          if (imageElement && imageElement.json) {
            imageElement.json.imageData = qrCodeBase64;
            imageElement.json.width = 10;
            imageElement.json.height = 10;
            imageElement.json.x = 10;
          }

          // 2.3.2 替换条形码的value
          const barCodeElement = combinationPrintConfig.elements.find((item: any) => item.type === 'barCode');
          if (barCodeElement && barCodeElement.json) {
            barCodeElement.json.value = traceCode as string;
            barCodeElement.json.width = 30;
            barCodeElement.json.height = 10;
            barCodeElement.json.x = 0;
            barCodeElement.json.y = 15;
          }
        }

        printDataList.push(combinationPrintConfig);
      } catch (err: any) {
        console.error(`构建${traceCode}组合码打印数据失败:`, err);
        failList.push(`${traceCode}（${err.message}）`);
      }
    }

    // 3. 执行批量打印
    if (printDataList.length > 0) {
      const printSuccess = await batchPrintJob(printDataList, 'combination', true);
      if (!printSuccess) {
        failList.push('批量打印任务执行失败');
      }
    }

    // 4. 批量打印结果提示
    const successCount = printDataList.length;
    let msg = `批量打印组合码完成：成功${successCount}个，失败${failList.length}个`;
    if (failList.length > 0) {
      msg += `\n失败列表：${failList.join('；')}`;
    }
    proxy?.$modal.msgSuccess(msg);
  } catch (err: any) {
    console.error('批量打印组合码异常:', err);
    proxy?.$modal.msgError(`批量打印组合码失败: ${err.message}`);
  } finally {
    if (loadingInstance) loadingInstance.close();
    printLoading.value = false;
  }
};

/** 检查打印服务状态 */
const checkPrintStatus = async () => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在检测打印服务状态...',
    background: 'rgba(0, 0, 0, 0.7)'
  });

  try {
    lastCheckTime.value = new Date().toLocaleString();

    if (printSocketOpen.value) {
      await getPrinters();
      if (usbSelectPrinter.value) {
        await connectUsbPrinter();
      }
      if (!initBool.value) {
        await initSdk();
      }
      ElMessage.success('打印服务已连接');
      if (onlineUsbBool.value) {
        ElMessage.info(`已连接打印机: ${usbSelectPrinter.value}`);
      }
    } else {
      const success = await reconnectPrintService();
      if (success) {
        ElMessage.success('打印服务连接成功');
        await initSdk();
        await getPrinters();
        if (usbSelectPrinter.value) {
          await connectUsbPrinter();
        }
      } else {
        ElMessage.error('打印服务连接失败，请检查服务是否启动');
      }
    }
  } catch (error) {
    console.error('打印服务检测异常:', error);
    ElMessage.error('打印服务检测失败');
  } finally {
    loadingInstance.close();
  }
};

/** 显示打印机详情对话框 */
const showPrinterDetail = () => {
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
    ElMessage.success('打印机状态已刷新');
  } catch (error) {
    ElMessage.error('刷新失败');
  } finally {
    loadingInstance.close();
  }
};

// 页面挂载时初始化
onMounted(() => {
  getList();
  // 静默初始化打印服务
  initPrintSocket();
});

// 页面卸载时清理打印服务连接
onUnmounted(() => {
  if (socketData.value) {
    socketData.value.close();
  }
});
</script>
