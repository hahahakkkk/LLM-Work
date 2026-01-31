<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item label="种植记录ID" prop="plantId">
              <el-input v-model="queryParams.plantId" placeholder="请输入种植记录ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="播种地块" prop="landId">
              <el-input v-model="queryParams.landId" placeholder="请输入播种地块" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="种植作物" prop="plantCrop">
              <el-select v-model="queryParams.plantCrop" placeholder="请选择种植作物" clearable >
                <el-option v-for="dict in plant_crop" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="作物品种" prop="cropVariety">
              <el-select v-model="queryParams.cropVariety" placeholder="请选择作物品种" clearable >
                <el-option v-for="dict in crop_variety" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="播种时间" prop="sowDate">
              <el-date-picker clearable
                v-model="queryParams.sowDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择播种时间"
              />
            </el-form-item>
            <el-form-item label="年份" prop="nf">
              <el-input v-model="queryParams.nf" placeholder="请输入年份" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:landPlant:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:landPlant:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:landPlant:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['mz_base:landPlant:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:landPlant:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="landPlantList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="种植记录ID" align="center" prop="plantId" v-if="false" />
        <el-table-column label="播种地块" align="center" prop="landId" v-if="false"/>
        <el-table-column label="播种地块名称" align="center" prop="landCode"/>
        <el-table-column label="种植作物" align="center" prop="plantCrop">
          <template #default="scope">
            <dict-tag :options="plant_crop" :value="scope.row.plantCrop"/>
          </template>
        </el-table-column>
        <el-table-column label="作物品种" align="center" prop="cropVariety">
          <template #default="scope">
            <dict-tag :options="crop_variety" :value="scope.row.cropVariety"/>
          </template>
        </el-table-column>
        <el-table-column label="播种时间" align="center" prop="sowDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.sowDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="历史产量" align="center" prop="historyYield" />
        <el-table-column label="年份" align="center" prop="nf" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="是否有效" align="center" prop="isValid" v-if="false">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:landPlant:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:landPlant:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改地块种植对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="landPlantFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="播种地块" prop="landId">
          <el-input v-model="form.landId" placeholder="请输入播种地块" />
        </el-form-item>
        <el-form-item label="种植作物" prop="plantCrop">
          <el-select v-model="form.plantCrop" placeholder="请选择种植作物">
            <el-option
                v-for="dict in plant_crop"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="作物品种" prop="cropVariety">
          <el-select v-model="form.cropVariety" placeholder="请选择作物品种">
            <el-option
                v-for="dict in crop_variety"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="播种时间" prop="sowDate">
          <el-date-picker clearable
            v-model="form.sowDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择播种时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="历史产量" prop="historyYield">
          <el-input v-model="form.historyYield" placeholder="请输入历史产量" />
        </el-form-item>
        <el-form-item label="年份" prop="nf">
          <el-input v-model="form.nf" placeholder="请输入年份" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="是否有效" prop="isValid" v-if="false"/>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 地块种植对话框 -->
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
          <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
          <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
      </div>
      <div class="el-upload__tip" style="color:red" slot="tip">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="LandPlant" lang="ts">
import { globalHeaders } from '@/utils/request';
import { listLandPlant, getLandPlant, delLandPlant, addLandPlant, updateLandPlant } from '../api/landPlant/index';
import { LandPlantVO, LandPlantQuery, LandPlantForm } from '../api/landPlant/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { crop_variety, is_valid, plant_crop } = toRefs<any>(proxy?.useDict('crop_variety', 'is_valid', 'plant_crop'));

const landPlantList = ref<LandPlantVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const landPlantFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 地块种植导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层（地块种植导入）
  open: false,
  // 弹出层标题（地块种植导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的地块种植数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/mz-base/landPlant/importData"
});

const uploadRef = ref<ElUploadInstance>();

const initFormData: LandPlantForm = {
  plantId: undefined,
  landId: undefined,
  landCode: undefined,
  plantCrop: undefined,
  cropVariety: undefined,
  sowDate: undefined,
  historyYield: undefined,
  nf: undefined,
  remark: undefined,
  isValid: 1,
}
const data = reactive<PageData<LandPlantForm, LandPlantQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    plantId: undefined,
    landId: undefined,
    landCode: undefined,
    plantCrop: undefined,
    cropVariety: undefined,
    sowDate: undefined,
    historyYield: undefined,
    nf: undefined,
    isValid: undefined,
    params: {
    }
  },
  rules: {
    landId: [
      { required: true, message: "播种地块不能为空", trigger: "blur" }
    ],
    plantCrop: [
      { required: true, message: "种植作物不能为空", trigger: "change" }
    ],
    cropVariety: [
      { required: true, message: "作物品种不能为空", trigger: "change" }
    ],
    sowDate: [
      { required: true, message: "播种时间不能为空", trigger: "blur" }
    ],
    historyYield: [
      { required: true, message: "历史产量不能为空", trigger: "blur" }
    ],
    nf: [
      { required: true, message: "年份不能为空", trigger: "blur" }
    ],
    isValid: [
      { required: true, message: "是否有效不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询地块种植列表 */
const getList = async () => {
  loading.value = true;
  const res = await listLandPlant(queryParams.value);
  landPlantList.value = res.rows;
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
  landPlantFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: LandPlantVO[]) => {
  ids.value = selection.map(item => item.plantId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加地块种植";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: LandPlantVO) => {
  reset();
  const _plantId = row?.plantId || ids.value[0]
  const res = await getLandPlant(_plantId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改地块种植";
}

/** 提交按钮 */
const submitForm = () => {
  landPlantFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.plantId) {
        await updateLandPlant(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addLandPlant(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: LandPlantVO) => {
  const _plantIds = row?.plantId || ids.value;
  await proxy?.$modal.confirm('是否确认删除地块种植编号为"' + _plantIds + '"的数据项？').finally(() => loading.value = false);
  await delLandPlant(_plantIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('mz-base/landPlant/export', {
    ...queryParams.value
  }, `landPlant_${new Date().getTime()}.xlsx`)
}

const handleImport = () => {
  upload.open = true;
  upload.title = "用户导入";
}

const importTemplate = () => {
  proxy?.download('mz-base/landPlant/importTemplate', {}, `landPlantImportTemplate.xlsx`)
}

const handleFileUploadProgress = () => {
  upload.isUploading = true;
}

const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>', '导入结果', {
    dangerouslyUseHTMLString: true
  });
  getList();
}

const submitFileForm = () => {
  uploadRef.value?.submit();
}

onMounted(() => {
  getList();
});
</script>
