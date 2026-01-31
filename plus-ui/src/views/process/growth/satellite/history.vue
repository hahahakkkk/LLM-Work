<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="诊断时间" prop="diagnosisTime">
              <el-date-picker clearable v-model="queryParams.diagnosisTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择诊断时间" />
            </el-form-item>
            <el-form-item label="生育期" prop="period">
              <el-select v-model="queryParams.period" placeholder="请选择生育期" clearable>
                <el-option v-for="dict in growth_diagnose_period" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['growth:satellite:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['growth:satellite:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['growth:satellite:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['growth:satellite:export']">导出</el-button>
          </el-col>
          <!-- 添加模型预测按钮 -->
          <!-- 隐藏模型预测按钮和健康检查按钮 -->
          <!--
          <el-col :span="1.5">
            <el-button type="info" plain icon="MagicStick" @click="handleModelPredict" v-hasPermi="['growth:satellite:predict']"
              >模型预测</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Check" @click="handleHealthCheck">健康检查</el-button>
          </el-col>
          -->
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="satelliteList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
        <el-table-column label="诊断时间" align="center" prop="diagnosisTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.diagnosisTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="生育期" align="center" prop="period">
          <template #default="scope">
            <dict-tag :options="growth_diagnose_period" :value="scope.row.period" />
          </template>
        </el-table-column>
        <el-table-column label="卫星图像" align="center" prop="inputImageUrl" />
        <el-table-column label="GJSON结果" align="center" prop="predictGjsonUrl" />
        <el-table-column label="JSON结果" align="center" prop="predictResultJsonUrl" />
        <!-- 进度条列 -->
        <el-table-column label="预测进度" align="center" width="200">
          <template #default="scope">
            <div v-if="shouldShowProgress(scope.row)">
              <el-progress
                :percentage="getProgressPercentage(scope.row.id)"
                :duration="360"
                :show-text="true"
                :stroke-width="6"
                :status="undefined"
              ></el-progress>
              <span style="font-size: 12px">预计剩余时间: {{ getRemainingTime(scope.row.id) }}</span>
            </div>
            <div v-else>
              <span>{{ scope.row.taskStatus }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['growth:satellite:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['growth:satellite:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 添加或修改卫星监测数据对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body>
      <el-form ref="satelliteFormRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="诊断时间" prop="diagnosisTime">
          <el-date-picker clearable v-model="form.diagnosisTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择诊断时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="生育期" prop="period">
          <el-select v-model="form.period" placeholder="请选择生育期">
            <el-option v-for="dict in growth_diagnose_period" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="图像OSS" prop="inputImageOss">
          <file-upload
            v-model="form.inputImageOss"
            :file-size="1024"
            :file-type="['png', 'jpg', 'jpeg', 'tif', 'tiff']"
            @update:modelValue="handleImageOssChange"
          />
        </el-form-item>
        <el-form-item label="图像URL" prop="inputImageUrl">
          <el-input v-model="form.inputImageUrl" placeholder="请上传图像" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 模型预测对话框 -->
    <el-dialog title="卫星模型预测" v-model="predictDialog.visible" width="600px" append-to-body>
      <el-form ref="predictFormRef" :model="predictForm" :rules="predictRules" label-width="120px">
        <el-form-item label="NDVI图像" prop="ndviUrl">
          <file-upload
            v-model="predictForm.ndviUrl"
            :file-size="1024"
            :file-type="['png', 'jpg', 'jpeg', 'tif', 'tiff']"
            @update:modelValue="handleNdviImageChange"
          />
        </el-form-item>
        <el-form-item label="生育期" prop="periodName">
          <el-select v-model="predictForm.periodName" placeholder="请选择生育期">
            <el-option v-for="dict in growth_diagnose_period" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务ID" prop="taskId" v-if="predictResult.taskId">
          <el-input v-model="predictResult.taskId" readonly />
        </el-form-item>
        <el-form-item label="任务状态" prop="status" v-if="predictResult.status">
          <el-tag :type="predictResult.status === 'completed' ? 'success' : predictResult.status === 'failed' ? 'danger' : 'warning'">
            {{ predictResult.status }}
          </el-tag>
        </el-form-item>
        <el-form-item label="进度" prop="progress" v-if="predictResult.progress !== undefined">
          <el-progress :percentage="predictResult.progress" />
        </el-form-item>
        <!-- 添加更多任务信息展示 -->
        <el-form-item label="消息" prop="message" v-if="predictResult.message">
          <el-input v-model="predictResult.message" readonly type="textarea" />
        </el-form-item>
        <el-form-item label="预计完成时间" prop="etaFormatted" v-if="predictResult.etaFormatted">
          <el-input v-model="predictResult.etaFormatted" readonly />
        </el-form-item>
        <el-form-item label="剩余时间" prop="remainingTimeFormatted" v-if="predictResult.remainingTimeFormatted">
          <el-input v-model="predictResult.remainingTimeFormatted" readonly />
        </el-form-item>
        <el-form-item label="已用时间" prop="elapsedTimeFormatted" v-if="predictResult.elapsedTimeFormatted">
          <el-input v-model="predictResult.elapsedTimeFormatted" readonly />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTimeFormatted" v-if="predictResult.startTimeFormatted">
          <el-input v-model="predictResult.startTimeFormatted" readonly />
        </el-form-item>
        <!-- 结果信息 -->
        <el-form-item label="GeoJSON URL" prop="geojsonUrl" v-if="predictResult.result && predictResult.result.geojson_url">
          <el-input
            :value="typeof predictResult.result.geojson_url === 'object' ? predictResult.result.geojson_url.url : predictResult.result.geojson_url"
            readonly
          />
        </el-form-item>
        <el-form-item label="Final JSON URL" prop="finalJsonUrl" v-if="predictResult.result && predictResult.result.final_json_url">
          <el-input
            :value="
              typeof predictResult.result.final_json_url === 'object' ? predictResult.result.final_json_url.url : predictResult.result.final_json_url
            "
            readonly
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="predictButtonLoading" type="primary" @click="submitPredict" v-if="!predictResult.taskId">开始预测</el-button>
          <el-button :loading="predictButtonLoading" type="primary" @click="checkTaskStatus" v-else>刷新状态</el-button>
          <el-button @click="closePredictDialog">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Satellite" lang="ts">
import { listSatellite, getSatellite, delSatellite, addSatellite, updateSatellite, processNdvi, getTaskStatus, healthCheck } from './api';
import { SatelliteVO, SatelliteQuery, SatelliteForm, ProcessNdviRequest } from './api/types';
import FileUpload from '../components/fileUpload.vue';
import { listByIds } from '@/api/system/oss';
import { copyModel } from '@/api/workflow/model';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { growth_diagnose_period } = toRefs<any>(proxy?.useDict('growth_diagnose_period'));

// 定义进度跟踪对象的接口
interface ProgressTracker {
  id: string | number;
  showProgress: boolean;
  progressPercentage: number;
  remainingTime: number;
  intervalId: number | null;
}

// 进度跟踪器映射表
const progressTrackers = ref<Map<string | number, ProgressTracker>>(new Map());

const satelliteList = ref<SatelliteVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const satelliteFormRef = ref<ElFormInstance>();
const predictFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 模型预测对话框
const predictDialog = reactive({
  visible: false
});

const predictButtonLoading = ref(false);

// 模型预测表单
const predictForm = reactive({
  ndviUrl: '',
  periodName: ''
});

// 模型预测结果
const predictResult = reactive({
  taskId: '',
  status: '',
  progress: 0,
  result: null,
  message: '',
  etaFormatted: '',
  remainingTimeFormatted: '',
  elapsedTimeFormatted: '',
  startTimeFormatted: ''
});

const predictRules = {
  ndviUrl: [{ required: true, message: 'NDVI图像不能为空', trigger: 'change' }],
  periodName: [{ required: true, message: '生育期不能为空', trigger: 'change' }]
};

const initFormData: SatelliteForm = {
  id: undefined,
  diagnosisTime: undefined,
  period: undefined,
  inputImageOss: undefined,
  inputImageUrl: undefined,
  predictGjsonUrl: undefined,
  predictResultJsonUrl: undefined,
  taskStatus: undefined
};

const data = reactive<PageData<SatelliteForm, SatelliteQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    diagnosisTime: undefined,
    period: undefined,
    inputImageOss: undefined,
    inputImageUrl: undefined,
    predictGjsonUrl: undefined,
    predictResultJsonUrl: undefined,
    taskStatus: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    diagnosisTime: [{ required: true, message: '诊断时间不能为空', trigger: 'blur' }],
    period: [{ required: true, message: '生育期不能为空', trigger: 'change' }],
    inputImageOss: [{ required: true, message: '输入图像OSS路径不能为空', trigger: 'blur' }],
    inputImageUrl: [{ required: true, message: '输入图像URL不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询卫星监测数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listSatellite(queryParams.value);
  satelliteList.value = res.rows;
  total.value = res.total;
  loading.value = false;

  // 为新添加的记录初始化进度状态
  satelliteList.value.forEach((row) => {
    if (row.taskStatus === 'processing') {
      // 如果记录处于处理状态，根据诊断时间计算进度
      initializeOrUpdateProgressTracker(row);
    }
  });
};

// 初始化或更新进度跟踪器
const initializeOrUpdateProgressTracker = (row: SatelliteVO) => {
  const recordId = row.id;
  // 使用创建时间计算进度
  if (!row.createTime) return;

  const createTime = new Date(row.createTime).getTime();
  const now = new Date().getTime();
  const elapsedSeconds = Math.floor((now - createTime) / 1000);

  // 计算剩余时间（最多360秒），如果elapsedSeconds为负数，说明服务器时间比客户端时间晚
  // 在这种情况下，将elapsedSeconds视为0，剩余时间就是全部360秒
  const remainingTime = Math.max(0, 360 - Math.max(0, elapsedSeconds));

  if (!progressTrackers.value.has(recordId)) {
    // 如果尚未创建跟踪器，则创建一个新的
    const tracker: ProgressTracker = {
      id: recordId,
      showProgress: true,
      progressPercentage: Math.min(100, Math.round(((360 - remainingTime) / 360) * 100)),
      remainingTime: remainingTime,
      intervalId: null
    };
    progressTrackers.value.set(recordId, tracker);
    startProgressTimer(recordId);
  } else if (remainingTime <= 0) {
    // 如果时间已经到了但还有跟踪器，清理它并刷新数据
    const tracker = progressTrackers.value.get(recordId);
    if (tracker?.intervalId) {
      clearInterval(tracker.intervalId);
    }
    progressTrackers.value.delete(recordId);
    // 刷新列表以获取最新的预测结果
    getList();
  }
};

// 启动进度计时器
const startProgressTimer = (recordId: string | number) => {
  const tracker = progressTrackers.value.get(recordId);
  if (tracker && !tracker.intervalId) {
    const intervalId = setInterval(() => {
      const currentTracker = progressTrackers.value.get(recordId);
      if (currentTracker) {
        if (currentTracker.remainingTime > 0) {
          currentTracker.remainingTime -= 1;
          // 计算进度百分比 (0-100)
          currentTracker.progressPercentage = Math.min(99, Math.round(((360 - currentTracker.remainingTime) / 360) * 100));
        } else {
          // 倒计时结束，先尝试刷新数据查看任务状态
          clearInterval(currentTracker.intervalId!);
          currentTracker.intervalId = null;

          // 刷新列表以获取最新的预测结果
          getList().then(() => {
            // 检查刷新后的任务状态
            const updatedRow = satelliteList.value.find((item) => item.id === recordId);
            if (updatedRow && updatedRow.taskStatus === 'processing') {
              // 任务仍在处理中，但我们只需要进行一次刷新，不再继续倒计时
              // 设置进度为100%，表示已完成
              currentTracker.progressPercentage = 100;
              currentTracker.showProgress = false;
            } else {
              // 任务已完成或失败，停止进度显示
              currentTracker.showProgress = false;
            }
          });
        }
      }
    }, 1000) as unknown as number;

    tracker.intervalId = intervalId;
  }
};

// 判断是否应该显示进度条
const shouldShowProgress = (row: SatelliteVO) => {
  // 如果记录处于处理状态并且有对应的进度跟踪器，则显示进度条
  return (
    row.taskStatus === 'processing' &&
    progressTrackers.value.has(row.id) &&
    progressTrackers.value.get(row.id)?.showProgress &&
    row.createTime !== undefined
  );
};

// 获取进度百分比
const getProgressPercentage = (recordId: string | number) => {
  const tracker = progressTrackers.value.get(recordId);
  return tracker ? tracker.progressPercentage : 0;
};

// 获取剩余时间（格式化为分和秒）
const getRemainingTime = (recordId: string | number) => {
  const tracker = progressTrackers.value.get(recordId);
  if (!tracker) return '0分0秒';

  const totalSeconds = tracker.remainingTime;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}分${seconds}秒`;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  satelliteFormRef.value?.resetFields();
  // 重置预测表单和结果
  Object.assign(predictForm, {
    ndviUrl: '',
    periodName: ''
  });
  Object.assign(predictResult, {
    taskId: '',
    status: '',
    progress: 0,
    result: null
  });
};

/** 处理图像OSS变化 */
const handleImageOssChange = async (val) => {
  form.value.inputImageOss = val;
  form.value.inputImageUrl = val;

  // 如果值是一个ID，则需要查询对应的URL
  if (val && typeof val === 'string' && val.match(/^\d+$/)) {
    try {
      const res = await listByIds(val);
      if (res.data && res.data.length > 0) {
        form.value.inputImageUrl = res.data[0].url;
      }
    } catch (error) {
      console.error('获取图像URL失败:', error);
    }
  }
};

/** 处理NDVI图像变化 */
const handleNdviImageChange = async (val) => {
  predictForm.ndviUrl = val;

  // 如果值是一个ID，则需要查询对应的URL
  if (val && typeof val === 'string' && val.match(/^\d+$/)) {
    try {
      const res = await listByIds(val);
      if (res.data && res.data.length > 0) {
        predictForm.ndviUrl = res.data[0].url;
      }
    } catch (error) {
      console.error('获取NDVI图像URL失败:', error);
    }
  }
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
const handleSelectionChange = (selection: SatelliteVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  // 设置默认诊断时间为当前时间
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  form.value.diagnosisTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  dialog.visible = true;
  console.log(form.value.diagnosisTime);
  dialog.title = '添加卫星监测数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: SatelliteVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getSatellite(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改卫星监测数据';
};

/** 提交按钮 */
const submitForm = () => {
  satelliteFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      // 如果是新增数据且有图像和生育期，则先提交数据再进行后台预测
      if (!form.value.id && form.value.inputImageOss && form.value.period) {
        // 先设置默认值为预测中
        form.value.predictGjsonUrl = '预测中...';
        form.value.predictResultJsonUrl = '预测中...';
        form.value.taskStatus = 'processing';

        try {
          // 先提交数据
          let res = await addSatellite(form.value);
          const newRecordId = res.data;
          proxy?.$modal.msgSuccess('操作成功');
          dialog.visible = false;
          await getList();

          // 初始化并启动进度跟踪器
          if (newRecordId) {
            // 查找刚刚添加的新记录
            const newRecord = satelliteList.value.find((item) => item.id == newRecordId);
            if (newRecord) {
              // 对于新创建的记录，直接初始化进度跟踪器
              initializeOrUpdateProgressTracker(newRecord);
            }
          } else {
            console.error('未能获取到新增记录的ID');
          }
        } catch (error) {
          proxy?.$modal.msgError('提交数据失败: ');
          return;
        } finally {
          buttonLoading.value = false;
        }
      } else {
        // 不需要预测的情况或者修改数据的情况
        if (form.value.id) {
          await updateSatellite(form.value).finally(() => (buttonLoading.value = false));
        } else {
          let res = await addSatellite(form.value).finally(() => (buttonLoading.value = false));
          console.log(res);
        }
        proxy?.$modal.msgSuccess('操作成功');
        dialog.visible = false;
        await getList();
      }
    }
  });
};

/** 轮询检查任务状态并更新记录 */
const pollAndUpdateRecord = (recordId: string | number, taskId: string) => {
  // 这个函数现在不再需要，因为后端会自己处理任务状态更新
  // 保留此函数签名以避免其他地方调用报错，但不做任何操作
  console.log('任务状态由后端处理，无需前端轮询');
};

/** 使用预测结果更新记录 */
const updateRecordWithResult = async (recordId: string | number, result: any) => {
  // 这个函数现在不再需要，因为后端会自己处理任务状态更新
  // 保留此函数签名以避免其他地方调用报错，但不做任何操作
  console.log('任务状态由后端处理，无需前端更新');
};

/** 更新记录状态 */
const updateRecordStatus = async (recordId: string | number, status: string, message?: string) => {
  // 这个函数现在不再需要，因为后端会自己处理任务状态更新
  // 保留此函数签名以避免其他地方调用报错，但不做任何操作
  console.log('任务状态由后端处理，无需前端更新');
};

/** 后台执行预测任务并更新记录 */
const backgroundPrediction = async (recordId: string | number) => {
  // 这个函数现在不再需要，因为后端会自己处理任务状态更新
  // 保留此函数签名以避免其他地方调用报错，但不做任何操作
  console.log('任务由后端处理，无需前端干预');
};

/** 删除按钮操作 */
const handleDelete = async (row?: SatelliteVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除卫星监测数据编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delSatellite(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'process/growth/satellite/export',
    {
      ...queryParams.value
    },
    `satellite_${new Date().getTime()}.xlsx`
  );
};

/** 模型预测按钮操作 */
const handleModelPredict = () => {
  // 重置预测表单和结果
  Object.assign(predictForm, {
    ndviUrl: '',
    periodName: ''
  });
  Object.assign(predictResult, {
    taskId: '',
    status: '',
    progress: 0,
    result: null
  });
  predictDialog.visible = true;
};

/** 关闭预测对话框 */
const closePredictDialog = () => {
  predictDialog.visible = false;
};

/** 提交预测请求（用于独立预测对话框） */
const submitPredict = () => {
  predictFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      predictButtonLoading.value = true;
      try {
        const request: ProcessNdviRequest = {
          ndviUrl: predictForm.ndviUrl,
          periodName: predictForm.periodName
        };
        console.log('提交预测请求:', request);
        const res = await processNdvi(request);
        console.log('预测结果:', res.data);
        if (res.code === 200) {
          // 更新预测结果
          Object.assign(predictResult, {
            taskId: res.data.task_id || res.data.taskId || '',
            status: res.data.status || '',
            progress: res.data.progress || 0,
            result: res.data.result || null,
            message: res.data.message || '',
            etaFormatted: res.data.eta_formatted || '',
            remainingTimeFormatted: res.data.remaining_time_formatted || '',
            elapsedTimeFormatted: res.data.elapsed_time_formatted || '',
            startTimeFormatted: res.data.start_time_formatted || ''
          });

          console.log('更新预测结果:', predictResult);
          proxy?.$modal.msgSuccess('预测任务已提交');
        } else {
          proxy?.$modal.msgError(res.msg || '预测任务提交失败');
        }
      } catch (error) {
        proxy?.$modal.msgError('预测任务提交失败');
        console.error(error);
      } finally {
        predictButtonLoading.value = false;
      }
    }
  });
};

/** 检查任务状态（用于独立预测对话框） */
const checkTaskStatus = async () => {
  if (!predictResult.taskId) return;

  predictButtonLoading.value = true;
  try {
    const res = await getTaskStatus(predictResult.taskId);
    console.log('任务状态:', res);
    let result = res.data;
    if (res.code === 200) {
      // 正确映射后端返回的数据结构
      Object.assign(predictResult, {
        status: result.data.status,
        progress: result.data.progress || 0,
        result: result.data.result || null,
        message: result.data.message || '',
        etaFormatted: result.data.eta_formatted || '',
        remainingTimeFormatted: result.data.remaining_time_formatted || '',
        elapsedTimeFormatted: result.data.elapsed_time_formatted || '',
        startTimeFormatted: result.data.start_time_formatted || ''
      });

      console.log('更新任务状态:', predictResult);

      // 如果任务已完成，刷新列表
      if (result.data.status === 'completed') {
        await getList();
        proxy?.$modal.msgSuccess('预测任务已完成');
      } else if (result.data.status === 'failed') {
        proxy?.$modal.msgError('预测任务执行失败');
      } else if (result.data.status === 'processing' || result.data.status === 'success') {
        proxy?.$modal.msg('任务正在进行中: ' + (result.data.message || ''));
      }
    } else {
      proxy?.$modal.msgError(res.msg || '查询任务状态失败');
    }
  } catch (error) {
    proxy?.$modal.msgError('查询任务状态失败');
    console.error(error);
  } finally {
    predictButtonLoading.value = false;
  }
};

/** 健康检查按钮操作 */
const handleHealthCheck = async () => {
  try {
    const res = await healthCheck();
    if (res.code === 200) {
      proxy?.$modal.msgSuccess('服务健康状态正常');
    } else {
      proxy?.$modal.msgWarning('服务健康状态异常: ' + res.msg);
    }
  } catch (error) {
    proxy?.$modal.msgError('健康检查失败: ' + error);
    console.error(error);
  }
};

onMounted(() => {
  getList();
});

// 页面卸载时清理定时器
onUnmounted(() => {
  // 清理所有进行中的定时器
  progressTrackers.value.forEach((tracker) => {
    if (tracker.intervalId) {
      clearInterval(tracker.intervalId);
    }
  });
  progressTrackers.value.clear();
});
</script>
