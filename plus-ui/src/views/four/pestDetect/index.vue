<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地" prop="baseId" v-has-roles="['superadmin', 'sysadmin', 'govadmin']">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable>
                <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="设备编号" prop="facilityId">
              <el-input v-model="queryParams.facilityId" placeholder="请输入设备编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="生育期" prop="growthPeriod" label-width="90px">
              <el-select v-model="queryParams.growthPeriod" placeholder="请选择谷子生育期" clearable>
                <el-option v-for="dict in four_growth_period" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="采集时间" style="width: 308px">
              <el-date-picker
                v-model="dateRangeCollectTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              />
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
            <el-button v-hasPermi="['four:pestDetect:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:pestDetect:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:pestDetect:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:pestDetect:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="pestDetectList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!--<el-table-column label="虫情测报数据ID" align="center" prop="fourId" v-if="true" />-->
        <el-table-column label="基地" align="center" prop="baseId" width="95">
          <template #default="scope">
            <dict-tag :options="four_base_name" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="设备编号" align="center" prop="facilityId" />
        <el-table-column label="昆虫种类" align="center" prop="pestType" />
        <el-table-column label="昆虫数量" align="center" prop="pestAmount" />
        <el-table-column label="昆虫详情" align="center" prop="pestInfo" width="200" />
        <el-table-column label="昆虫图像" align="center" prop="fileLocation" width="150">
          <template #default="scope">
            <imagePreview :width="100" :height="100" :src="scope.row.fileLocation" />
          </template>
        </el-table-column>
        <el-table-column label="环境温度（℃）" align="center" prop="envTemperature" />
        <el-table-column label="环境湿度（%）" align="center" prop="envHumidity" />
        <el-table-column label="生育期" align="center" prop="growthPeriod">
          <template #default="scope">
            <dict-tag :options="four_growth_period" :value="scope.row.growthPeriod" />
          </template>
        </el-table-column>
        <el-table-column label="采集时间" align="center" prop="collectTime" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.collectTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <!--<el-table-column label="备注" align="center" prop="remark" />-->
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="110">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['four:pestDetect:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip :content="downloadLoading[scope.row.fourId] ? '下载中' : '下载'" placement="top">
              <el-button
                v-hasPermi="['four:pestDetect:download']"
                link
                type="primary"
                :icon="downloadLoading[scope.row.fourId] ? 'Loading' : 'Download'"
                :loading="downloadLoading[scope.row.fourId]"
                @click="handleDownload(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['four:pestDetect:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改智能虫情测报仪数据对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="pestDetectFormRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地">
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号" prop="facilityId">
          <el-input v-model="form.facilityId" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="昆虫种类" prop="pestType">
          <el-input v-model="form.pestType" placeholder="请输入昆虫种类" />
        </el-form-item>
        <el-form-item label="昆虫数量" prop="pestAmount">
          <el-input v-model="form.pestAmount" placeholder="请输入昆虫数量" />
        </el-form-item>
        <el-form-item label="昆虫详情" prop="pestInfo">
          <el-input v-model="form.pestInfo" placeholder="请输入昆虫详情" />
        </el-form-item>
        <el-form-item label="昆虫图像" prop="fileLocation">
          <el-button type="primary" plain icon="Upload" style="width: 50%" @click="openUploadDialog">{{
            form.fileLocation ? '已上传' : '上传昆虫图像'
          }}</el-button>
        </el-form-item>
        <el-form-item label="环境温度（℃）" prop="envTemperature">
          <el-input v-model="form.envTemperature" placeholder="请输入环境温度" />
        </el-form-item>
        <el-form-item label="环境湿度（%）" prop="envHumidity">
          <el-input v-model="form.envHumidity" placeholder="请输入环境湿度" />
        </el-form-item>
        <el-form-item label="生育期" prop="growthPeriod">
          <el-select v-model="form.growthPeriod" placeholder="请选择谷子生育期">
            <el-option v-for="dict in four_growth_period" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采集时间" prop="collectTime">
          <el-date-picker v-model="form.collectTime" clearable type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择采集时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 昆虫图像上传OSS对话框 -->
    <el-dialog v-model="uploadDialog.visible" :title="uploadDialog.title" width="500px" append-to-body>
      <el-form ref="ossFormRef" :model="form" label-width="80px">
        <el-form-item label="文件名">
          <fileUpload v-model="form.fileLocation" :file-size="10" :file-type="['tiff', 'raw', 'jpg']" :config-key="'preview'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitUploadForm">确 定</el-button>
          <el-button @click="closeUploadDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PestDetect" lang="ts">
import { listPestDetect, getPestDetect, delPestDetect, addPestDetect, updatePestDetect } from '../api/pestDetect';
import { deleteOss } from '../api/oss';
import { downloadOss } from '@/views/four/plugins/download';
import { PestDetectVO, PestDetectQuery, PestDetectForm } from '../api/pestDetect/types';
import fileUpload from '@/views/four/components/fileUpload/index.vue';
import imagePreview from '@/views/four/components/imagePreview/index.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_growth_period, four_base_name } = toRefs<any>(proxy?.useDict('four_growth_period', 'four_base_name'));

const pestDetectList = ref<PestDetectVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const fileLocations = ref<Array<string | number>>([]); // 多选时获取所有选中的 fileLocation
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCollectTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const pestDetectFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PestDetectForm = {
  fourId: undefined,
  baseId: undefined,
  facilityId: undefined,
  pestType: undefined,
  pestAmount: undefined,
  pestInfo: undefined,
  fileLocation: undefined,
  envTemperature: undefined,
  envHumidity: undefined,
  growthPeriod: undefined,
  collectTime: undefined,
  remark: undefined
};

const data = reactive<PageData<PestDetectForm, PestDetectQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    facilityId: undefined,
    growthPeriod: undefined,
    params: {
      collectTime: undefined
    }
  },
  rules: {
    fourId: [{ required: true, message: '主键不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询智能虫情测报仪数据列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCollectTime.value, 'CollectTime');
  const res = await listPestDetect(queryParams.value);
  pestDetectList.value = res.rows;
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
  pestDetectFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangeCollectTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: PestDetectVO[]) => {
  ids.value = selection.map((item) => item.fourId);
  fileLocations.value = selection.map((item) => item.fileLocation);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加智能虫情测报仪数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: PestDetectVO) => {
  reset();
  const _fourId = row?.fourId || ids.value[0];
  const res = await getPestDetect(_fourId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改智能虫情测报仪数据';
};

/** 提交按钮 */
const submitForm = () => {
  pestDetectFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.fourId) {
        await updatePestDetect(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPestDetect(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: PestDetectVO) => {
  const _fourIds = row?.fourId || ids.value;
  const _fileLocations = row?.fileLocation || fileLocations.value;
  await proxy?.$modal.confirm('是否确认删除智能虫情测报仪数据编号为"' + _fourIds + '"的数据项？').finally(() => (loading.value = false));
  await deleteOss(_fileLocations); // 先删除文件
  await delPestDetect(_fourIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'four/pestDetect/export',
    {
      ...queryParams.value
    },
    `pestDetect_${new Date().getTime()}.xlsx`
  );
};

/** 上传图像 */

/** 上传图片对话框 */
const uploadDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

/** 打开上传图片对话框 */
const openUploadDialog = () => {
  uploadDialog.visible = true;
  uploadDialog.title = '上传文件';
};

/** 取消按钮-关闭上传文件对话框 */
const closeUploadDialog = async () => {
  uploadDialog.visible = false;
};

/** 确定按钮-关闭上传文件对话框 */
const submitUploadForm = () => {
  uploadDialog.visible = false;
};

// 用于控制每个下载按钮的加载状态
const downloadLoading = ref<Record<string | number, boolean>>({});

/** 下载按钮操作 */
const handleDownload = async (row?: PestDetectVO) => {
  if (!row || !row.fileLocation) {
    proxy?.$modal.msgError('无有效下载链接');
    return;
  }

  const fourId = row.fourId;
  downloadLoading.value[fourId] = true; // 显示加载状态

  try {
    proxy?.$modal.msgSuccess('下载开始，文件将自动保存');
    await downloadOss(row.fileLocation); // 调用你原来的下载方法
    // 下载成功后，延迟一小会儿恢复图标（视觉更自然）
    setTimeout(() => {
      downloadLoading.value[fourId] = false;
    }, 500);
  } catch (error) {
    console.error('下载失败:', error);
    proxy?.$modal.msgError('下载失败，请重试');
    downloadLoading.value[fourId] = false; // 立即恢复图标
  }
};

onMounted(() => {
  getList();
});
</script>
