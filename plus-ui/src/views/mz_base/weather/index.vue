<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="100px">
            <el-form-item label="日均气温区间">
              <el-input
                v-model="queryParams.temperAvgMin"
                placeholder="最低值"
                clearable
                style="width: 120px; margin-right: 8px"
                @keyup.enter="handleQuery"
              />
              <el-input v-model="queryParams.temperAvgMax" placeholder="最高值" clearable style="width: 120px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="降雨量区间">
              <el-input
                v-model="queryParams.rainfallMin"
                placeholder="最低值"
                clearable
                style="width: 120px; margin-right: 8px"
                @keyup.enter="handleQuery"
              />
              <el-input v-model="queryParams.rainfallMax" placeholder="最高值" clearable style="width: 120px" @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="日均气温" prop="temperAvg">
              <el-input v-model="queryParams.temperAvg" placeholder="请输入日均气温" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="日最高气温" prop="temperMax" label-width="100">
              <el-input v-model="queryParams.temperMax" placeholder="请输入日最高气温" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="日最低气温" prop="temperMin" label-width="100">
              <el-input v-model="queryParams.temperMin" placeholder="请输入日最低气温" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="日降雨量" prop="rainfall">
              <el-input v-model="queryParams.rainfall" placeholder="请输入日降雨量" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="气象灾害" prop="disaster">
              <el-select v-model="queryParams.disaster" placeholder="请选择气象灾害：冰雹、山洪、暴雨、极端高温" clearable>
                <el-option v-for="dict in disaster" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item> -->
            <el-form-item label="日期" prop="useTimes">
              <el-date-picker
                clearable
                v-model="queryParams.useTimes"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
            <!-- <el-form-item label="日期" prop="weatherDate">
              <el-date-picker clearable v-model="queryParams.weatherDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" />
            </el-form-item> -->
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
          <!-- <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:weather:add']">新增</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:weather:edit']"
              >修改</el-button
            >
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:weather:remove']"
              >删除</el-button
            >
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['mz_base:weather:import']">导入</el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:weather:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="weatherList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="气象ID" align="center" prop="weatherId" v-if="false" />
        <el-table-column label="日期" align="center" prop="weatherDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.weatherDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="日均气温(℃)" align="center" prop="temperAvg" />
        <el-table-column label="日最高气温(℃)" align="center" prop="temperMax" />
        <el-table-column label="日最低气温(℃)" align="center" prop="temperMin" />
        <el-table-column label="日降雨量(mm)" align="center" prop="rainfall" />
        <el-table-column label="相对湿度(%)" align="center" prop="humidity" />
        <el-table-column label="大气压(百帕)" align="center" prop="pressure" />
        <el-table-column label="气象灾害" align="center" prop="disaster" v-if="false">
          <template #default="scope">
            <dict-tag :options="disaster" :value="scope.row.disaster" />
          </template>
        </el-table-column>

        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="是否有效" align="center" prop="isValid" v-if="false">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-has-roles="['sysadmin', 'superadmin']">
          <template #default="scope">
            <!-- <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:weather:edit']"></el-button>
            </el-tooltip> -->
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:weather:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改气象历史数据对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="weatherFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="日均气温" prop="temperAvg">
          <el-input v-model="form.temperAvg" placeholder="请输入日均气温" />
        </el-form-item>
        <el-form-item label="日最高气温" prop="temperMax">
          <el-input v-model="form.temperMax" placeholder="请输入日最高气温" />
        </el-form-item>
        <el-form-item label="日最低气温" prop="temperMin">
          <el-input v-model="form.temperMin" placeholder="请输入日最低气温" />
        </el-form-item>
        <el-form-item label="日降雨量" prop="rainfall">
          <el-input v-model="form.rainfall" placeholder="请输入日降雨量" />
        </el-form-item>
        <el-form-item label="相对湿度">
          <el-input v-model="form.humidity" placeholder="请输入相对湿度" />
        </el-form-item>
        <el-form-item label="大气压">
          <el-input v-model="form.pressure" placeholder="请输入大气压" />
        </el-form-item>
        <el-form-item label="日期" prop="weatherDate">
          <el-date-picker clearable v-model="form.weatherDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择日期">
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

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div class="el-upload__tip" slot="tip">
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的气象数据</div>
        <span>仅允许导入xls、xlsx格式文件。</span>
        <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
      </div>
      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
        ref="weatherimport"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div class="el-upload__tip" slot="tip">
        <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
        <el-link type="info" style="font-size: 12px" @click="importTemplate">下载模板</el-link>
      </div>
      <div class="el-upload__tip" style="color: red" slot="tip">提示：仅允许导入"xls"或"xlsx"格式文件！</div>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="$refs.weatherimport.submit()">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog> -->
  </div>
</template>

<script setup name="Weather" lang="ts">
import { listWeather, getWeather, delWeather, addWeather, updateWeather } from '../api/weather/index';
import { WeatherVO, WeatherQuery, WeatherForm } from '../api/weather//types';
import { globalHeaders } from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid, disaster } = toRefs<any>(proxy?.useDict('is_valid', 'disaster'));

const weatherList = ref<WeatherVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const weatherFormRef = ref<ElFormInstance>();

const weatherimport = ref<ElUploadInstance>();
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const upload = reactive<ImportOption>({
  open: false,
  title: '',
  isUploading: false,
  updateSupport: 0,
  headers: globalHeaders(),
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/weather/importData'
});

const initFormData: WeatherForm = {
  weatherId: undefined,
  temperAvg: undefined,
  temperMax: undefined,
  temperMin: undefined,
  rainfall: undefined,
  weatherDate: undefined,
  disaster: '0',
  isValid: '1',
  remark: undefined
};

// 初始化查询参数
const initQueryParams: WeatherQuery = {
  pageNum: 1,
  pageSize: 10,
  temperAvg: undefined,
  temperAvgMin: undefined,
  temperAvgMax: undefined,
  temperMax: undefined,
  temperMin: undefined,
  rainfall: undefined,
  rainfallMin: undefined,
  rainfallMax: undefined,
  weatherDate: undefined,
  useTimes: undefined,
  disaster: undefined,
  params: {}
};

const data = reactive<PageData<WeatherForm, WeatherQuery>>({
  form: { ...initFormData },
  queryParams: { ...initQueryParams },
  rules: {
    weatherId: [{ required: true, message: '气象ID不能为空', trigger: 'blur' }],
    temperAvg: [{ required: true, message: '日均气温不能为空', trigger: 'blur' }],
    temperMax: [{ required: true, message: '日最高气温不能为空', trigger: 'blur' }],
    temperMin: [{ required: true, message: '日最低气温不能为空', trigger: 'blur' }],
    rainfall: [{ required: true, message: '日降雨量不能为空', trigger: 'blur' }],
    weatherDate: [{ required: true, message: '日期不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询气象历史数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listWeather(queryParams.value);
  weatherList.value = res.rows;
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
  weatherFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  // 重置查询参数到初始状态
  Object.assign(queryParams.value, initQueryParams);
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: WeatherVO[]) => {
  ids.value = selection.map((item) => item.weatherId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加气象历史数据';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: WeatherVO) => {
  reset();
  const _weatherId = row?.weatherId || ids.value[0];
  const res = await getWeather(_weatherId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改气象历史数据';
};

/** 提交按钮 */
const submitForm = () => {
  weatherFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.weatherId) {
        await updateWeather(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWeather(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: WeatherVO) => {
  const _weatherIds = row?.weatherId || ids.value;
  const keyArray = Array.isArray(_weatherIds) ? _weatherIds : [_weatherIds];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除历史气象数据已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delWeather(_weatherIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'mz-base/weather/export',
    {
      ...queryParams.value
    },
    `weather_${new Date().getTime()}.xlsx`
  );
};

/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '导入米脂县历史气象数据信息';
};

/** 下载模板操作 */
const importTemplate = () => {
  proxy?.download('mz-base/weather/importTemplate', 1, `weatherTemplate.xlsx`);
};

// 文件上传中处理
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
// 文件上传成功处理
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  alert(response.msg);
  weatherimport.value?.handleRemove(file);
  // upload.open = false;
  // upload.isUploading = false;
  // upload.$refs.upload.clearFiles();
  // upload.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true });
  upload.getList();
};
// 提交上传文件
const submitFileForm = () => {
  upload.$refs.upload.submit();
};

onMounted(() => {
  getList();
});
</script>
