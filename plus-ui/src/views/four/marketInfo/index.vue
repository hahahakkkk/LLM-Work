<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="时间" style="width: 308px">
              <el-date-picker
                v-model="dateRangeDataTime"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              />
            </el-form-item>
            <el-form-item label="地区" prop="area">
              <el-select v-model="queryParams.area" placeholder="请选择或输入地区" clearable filterable>
                <el-option v-for="dict in market_area" :key="dict.value" :label="dict.label" :value="dict.label" />
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
            <el-button v-hasPermi="['four:marketInfo:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:marketInfo:import']" type="warning" plain icon="Top" @click="handleImport">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:marketInfo:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:marketInfo:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['four:marketInfo:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="marketInfoList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!--<el-table-column label="主键" align="center" prop="marketId" v-if="true" />-->
        <el-table-column label="时间" align="center" prop="dataTime" />
        <!--<el-table-column label="地区" align="center" prop="area">
          <template #default="scope">
            <dict-tag :options="market_area" :value="scope.row.area"/>
          </template>
        </el-table-column>-->
        <el-table-column label="地区" align="center" prop="area" width="200" />
        <el-table-column label="品类" align="center" prop="category" />
        "<el-table-column
          label="价格（元/斤）"
          align="center"
          prop="price"
          :formatter="
            (row) => {
              const value = parseFloat(row.price);
              return isNaN(value) ? '' : value.toFixed(2);
            }
          "
        />
        <el-table-column label="涨跌（元/斤）" align="center" prop="riseFall">
          <!-- 使用自定义模板渲染单元格内容 -->
          <template #default="scope">
            <span
              :class="{
                'text-red': scope.row.riseFall > 0, // 正值（涨）显示红色
                'text-green': scope.row.riseFall < 0 // 负值（跌）显示绿色
              }"
            >
              <!-- 正值拼接 "+"，负值和零直接显示 -->
              {{ scope.row.riseFall > 0 ? '+' + parseFloat(scope.row.riseFall).toFixed(2) : parseFloat(scope.row.riseFall).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <!--<el-table-column label="统计周期" align="center" prop="cycle" />-->
        <!--<el-table-column label="数据来源" align="center" prop="dataSource" />-->
        <!--<el-table-column label="扩展字段2" align="center" prop="ext2" />
        <el-table-column label="扩展字段3" align="center" prop="ext3" />
        <el-table-column label="扩展字段4" align="center" prop="ext4" />
        <el-table-column label="扩展字段5" align="center" prop="ext5" />
        <el-table-column label="扩展字段6" align="center" prop="ext6" />-->
        <el-table-column label="备注" align="center" prop="remark" width="100" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['four:marketInfo:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['four:marketInfo:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改市场信息对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="marketInfoFormRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="时间" prop="dataTime">
          <el-date-picker v-model="form.dataTime" clearable type="date" value-format="YYYY-MM-DD" placeholder="请选择时间"> </el-date-picker>
        </el-form-item>
        <el-form-item label="地区" prop="area">
          <!--<el-select v-model="form.area" placeholder="请选择地区">
            <el-option
                v-for="dict in market_area"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>-->
          <el-input v-model="form.area" placeholder="请输入地区" />
        </el-form-item>
        <el-form-item label="品类" prop="category">
          <el-input v-model="form.category" placeholder="请输入品类" />
        </el-form-item>
        <el-form-item label="价格（元/斤）" prop="price">
          <el-input v-model="form.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="涨跌（元/斤）" prop="riseFall">
          <el-input v-model="form.riseFall" placeholder="涨：输入带正号的数字，跌：输入带负号的数字" />
        </el-form-item>
        <!--<el-form-item label="统计周期" prop="cycle">
          <el-input v-model="form.cycle" placeholder="请输入统计周期" />
        </el-form-item>-->
        <el-form-item label="数据来源" prop="dataSource">
          <el-input v-model="form.dataSource" placeholder="请输入数据来源" />
        </el-form-item>
        <!--<el-form-item label="扩展字段2" prop="ext2">
          <el-input v-model="form.ext2" placeholder="请输入扩展字段2" />
        </el-form-item>
        <el-form-item label="扩展字段3" prop="ext3">
          <el-input v-model="form.ext3" placeholder="请输入扩展字段3" />
        </el-form-item>
        <el-form-item label="扩展字段4" prop="ext4">
          <el-input v-model="form.ext4" placeholder="请输入扩展字段4" />
        </el-form-item>
        <el-form-item label="扩展字段5" prop="ext5">
          <el-input v-model="form.ext5" placeholder="请输入扩展字段5" />
        </el-form-item>
        <el-form-item label="扩展字段6" prop="ext6">
          <el-input v-model="form.ext6" placeholder="请输入扩展字段6" />
        </el-form-item>-->
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

<script setup name="MarketInfo" lang="ts">
import { listMarketInfo, getMarketInfo, delMarketInfo, addMarketInfo, updateMarketInfo } from '../api/marketInfo'; //使用../api/marketInfo或@/views/four/api/marketInfo
import { MarketInfoVO, MarketInfoQuery, MarketInfoForm } from '../api/marketInfo/types';
import { globalHeaders } from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { market_index_name, market_index_unit, market_area } = toRefs<any>(proxy?.useDict('market_index_name', 'market_index_unit', 'market_area'));

const marketInfoList = ref<MarketInfoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeDataTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const marketInfoFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MarketInfoForm = {
  marketId: undefined,
  dataTime: undefined,
  area: undefined,
  category: undefined,
  price: undefined,
  riseFall: undefined,
  cycle: undefined,
  dataSource: undefined,
  ext2: undefined,
  ext3: undefined,
  ext4: undefined,
  ext5: undefined,
  ext6: undefined,
  remark: undefined
};
const data = reactive<PageData<MarketInfoForm, MarketInfoQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    area: undefined,
    params: {
      dataTime: undefined
    }
  },
  rules: {
    marketId: [{ required: true, message: '主键不能为空', trigger: 'blur' }],
    dataTime: [{ required: true, message: '时间不能为空', trigger: 'blur' }],
    area: [{ required: true, message: '地区不能为空', trigger: 'blur' }],
    category: [{ required: true, message: '品类不能为空', trigger: 'blur' }],
    price: [
      {
        required: true,
        pattern: /^([1-9]\d*(\.\d+)?|0\.(0*[1-9]\d*))$/, // 不允许正号，只能输入大于0的正数 0.01、100 等格式
        message: '请输入有效的数字',
        trigger: 'blur'
      }
    ],
    riseFall: [
      {
        required: true,
        pattern: /^[+-]?(\d+(\.\d*)?|\.\d+)$/, // 允许正负号、整数、小数
        message: '请输入有效的数字（可包含正负号）',
        trigger: 'blur'
      }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询市场信息列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeDataTime.value, 'DataTime');
  const res = await listMarketInfo(queryParams.value);
  marketInfoList.value = res.rows;
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
  marketInfoFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangeDataTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: MarketInfoVO[]) => {
  ids.value = selection.map((item) => item.marketId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加市场信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: MarketInfoVO) => {
  reset();
  const _marketId = row?.marketId || ids.value[0];
  const res = await getMarketInfo(_marketId);

  // 复制接口返回的数据
  const formData = { ...res.data };

  // 处理 riseFall 字段：正数添加正号
  if (formData.riseFall !== null && formData.riseFall !== undefined) {
    const num = Number(formData.riseFall);
    // 仅对正数添加正号，保持字符串类型显示
    if (num > 0) {
      formData.riseFall = '+' + num;
    } else {
      // 负数和0直接转为字符串（保留负号）
      formData.riseFall = num.toString();
    }
  }

  Object.assign(form.value, formData);
  dialog.visible = true;
  dialog.title = '修改市场信息';
};

/** 提交按钮 */
const submitForm = () => {
  marketInfoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.marketId) {
        await updateMarketInfo(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addMarketInfo(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: MarketInfoVO) => {
  const _marketIds = row?.marketId || ids.value;
  await proxy?.$modal.confirm('是否确认删除市场信息编号为"' + _marketIds + '"的数据项？').finally(() => (loading.value = false));
  await delMarketInfo(_marketIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'four/marketInfo/export',
    {
      ...queryParams.value
    },
    `marketInfo_${new Date().getTime()}.xlsx`
  );
};

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
  url: import.meta.env.VITE_APP_BASE_API + '/four/marketInfo/importData'
});

const uploadRef = ref<ElUploadInstance>(); //uploadRef 用于引用 el-upload 组件的实例,在 el-upload 组件上使用 ref 属性绑定 uploadRef

/** 导入按钮操作 */
const handleImport = () => {
  upload.title = '批量导入市场信息数据';
  upload.open = true;
};

/** 下载模板操作 */
const importTemplate = () => {
  proxy?.download('four/marketInfo/importTemplate', {}, `marketInfo_template_${new Date().getTime()}.xlsx`);
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

<style scoped>
.text-red {
  color: #f56c6c !important; /* !important 确保样式优先级 */
}
.text-green {
  color: #67c23a !important;
}
</style>
