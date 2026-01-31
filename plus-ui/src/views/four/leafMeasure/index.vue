<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地" prop="baseId">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable >
                <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="谷子生育期" prop="growthPeriod" label-width="100px">
              <el-select v-model="queryParams.growthPeriod" placeholder="请选择谷子生育期" clearable >
                <el-option v-for="dict in four_growth_period" :key="dict.value" :label="dict.label" :value="dict.value"/>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['four:leafMeasure:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Top" @click="handleImport" v-hasPermi="['four:leafMeasure:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['four:leafMeasure:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['four:leafMeasure:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['four:leafMeasure:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="leafMeasureList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!--<el-table-column label="叶面积测量数据ID" align="center" prop="fourId" v-if="true" />-->
        <el-table-column label="基地" align="center" prop="baseId">
          <template #default="scope">
            <dict-tag :options="four_base_name" :value="scope.row.baseId"/>
          </template>
        </el-table-column>
        <!--<el-table-column label="叶片序号" align="center" prop="leafId" />-->
        <el-table-column label="叶面积" align="center" prop="leafArea" />
        <el-table-column label="叶长" align="center" prop="leafLength" />
        <el-table-column label="叶宽" align="center" prop="leafWidth" />
        <el-table-column label="长宽比" align="center" prop="aspectRatio" />
        <el-table-column label="谷子生育期" align="center" prop="growthPeriod">
          <template #default="scope">
            <dict-tag :options="four_growth_period" :value="scope.row.growthPeriod"/>
          </template>
        </el-table-column>
        <el-table-column label="采集时间" align="center" prop="collectTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.collectTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['four:leafMeasure:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['four:leafMeasure:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改手持叶面积测量仪数据对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="leafMeasureFormRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地">
            <el-option
                v-for="dict in four_base_name"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <!--<el-form-item label="叶片序号" prop="leafId">
          <el-input v-model="form.leafId" placeholder="请输入叶片序号" />
        </el-form-item>-->
        <el-form-item label="叶面积" prop="leafArea">
          <el-input v-model="form.leafArea" placeholder="请输入叶面积" />
        </el-form-item>
        <el-form-item label="叶长" prop="leafLength">
          <el-input v-model="form.leafLength" placeholder="请输入叶长" />
        </el-form-item>
        <el-form-item label="叶宽" prop="leafWidth">
          <el-input v-model="form.leafWidth" placeholder="请输入叶宽" />
        </el-form-item>
        <el-form-item label="长宽比" prop="aspectRatio">
          <el-input v-model="form.aspectRatio" placeholder="请输入长宽比" />
        </el-form-item>
        <el-form-item label="谷子生育期" prop="growthPeriod">
          <el-select v-model="form.growthPeriod" placeholder="请选择谷子生育期">
            <el-option
                v-for="dict in four_growth_period"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采集时间" prop="collectTime">
          <el-date-picker clearable
            v-model="form.collectTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择采集时间">
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

    <!-- 文件导入对话框 -->
    <el-dialog v-model="upload.open" :title="upload.title" width="500px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :before-upload="beforeImportUpload"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload">
          <i-ep-upload-filled />
        </el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="text-center el-upload__tip">
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size: 15px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="LeafMeasure" lang="ts">
import { listLeafMeasure, getLeafMeasure, delLeafMeasure, addLeafMeasure, updateLeafMeasure } from '../api/leafMeasure';
import { LeafMeasureVO, LeafMeasureQuery, LeafMeasureForm } from '../api/leafMeasure/types';
import { globalHeaders } from "@/utils/request";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_base_name, four_growth_period } = toRefs<any>(proxy?.useDict('four_base_name', 'four_growth_period'));

const leafMeasureList = ref<LeafMeasureVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCollectTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const leafMeasureFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: LeafMeasureForm = {
  fourId: undefined,
  baseId: undefined,
  leafId: undefined,
  leafArea: undefined,
  leafLength: undefined,
  leafWidth: undefined,
  aspectRatio: undefined,
  growthPeriod: undefined,
  collectTime: undefined,
  remark: undefined,
}
const data = reactive<PageData<LeafMeasureForm, LeafMeasureQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    growthPeriod: undefined,
    params: {
      collectTime: undefined,
    }
  },
  rules: {
    fourId: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询手持叶面积测量仪数据列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCollectTime.value, 'CollectTime');
  const res = await listLeafMeasure(queryParams.value);
  leafMeasureList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  leafMeasureFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangeCollectTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: LeafMeasureVO[]) => {
  ids.value = selection.map(item => item.fourId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加手持叶面积测量仪数据";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: LeafMeasureVO) => {
  reset();
  const _fourId = row?.fourId || ids.value[0]
  const res = await getLeafMeasure(_fourId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改手持叶面积测量仪数据";
}

/** 提交按钮 */
const submitForm = () => {
  leafMeasureFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.fourId) {
        await updateLeafMeasure(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addLeafMeasure(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: LeafMeasureVO) => {
  const _fourIds = row?.fourId || ids.value;
  await proxy?.$modal.confirm('是否确认删除手持叶面积测量仪数据编号为"' + _fourIds + '"的数据项？').finally(() => loading.value = false);
  await delLeafMeasure(_fourIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('four/leafMeasure/export', {
    ...queryParams.value
  }, `leafMeasure_${new Date().getTime()}.xlsx`)
}

/*** 以下为数据导入按钮-ltq */
/*** 文件导入参数 */
const upload = reactive<ImportOption>({
  // 是否显示弹出框
  open: false,
  // 弹出框标题
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/four/leafMeasure/importData'
});

const uploadRef = ref<ElUploadInstance>(); //uploadRef 用于引用 el-upload 组件的实例,在 el-upload 组件上使用 ref 属性绑定 uploadRef

/** 导入按钮操作 */
const handleImport = () => {
  upload.title = '批量导入手持叶面积测量仪数据';
  upload.open = true;
};

/** 下载模板操作 */
const importTemplate = () => {
  proxy?.download('four/leafMeasure/importTemplate', {}, `leafMeasure_template_${new Date().getTime()}.xlsx`);
};

/**文件上传前处理 */
const beforeImportUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
  if (!isExcel) {
    proxy?.$modal.msgError('上传文件格式不正确');
  }
  const isLt800K = file.size / 1024 < 800;
  if (!isLt800K) {
    proxy?.$modal.msgError('上传文件大小不能超过 800KB!');
  }
  return isExcel && isLt800K;
};

/**文件上传中处理 */
const handleFileUploadProgress = () => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>', '导入结果', {
    dangerouslyUseHTMLString: true
  });
  getList();
};

/** 提交上传文件 */
function submitFileForm() {
  uploadRef.value?.submit();
}

onMounted(() => {
  getList();
});
</script>
