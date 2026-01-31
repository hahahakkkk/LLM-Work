<template>
  <div class="p-2">
    <!-- <el-alert
      v-if="upload.errorMessage"
      :title="upload.errorMessage"
      type="error"
      closable
      @close="upload.errorMessage = ''"
      style="position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 9999"
    /> -->

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="肥料名称" prop="fertiName">
              <el-input v-model="queryParams.fertiName" placeholder="请输入肥料名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="肥料类型" prop="fertiType">
              <el-select v-model="queryParams.fertiType" placeholder="请选择肥料类型" clearable>
                <el-option v-for="dict in ferti_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="肥料含量" prop="fertiContent">
              <el-input v-model="queryParams.fertiContent" placeholder="请输入肥料含量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="氮含量" prop="contentN">
              <el-input v-model="queryParams.contentN" placeholder="请输入氮含量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="磷含量" prop="contentP">
              <el-input v-model="queryParams.contentP" placeholder="请输入磷含量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="钾含量" prop="contentK">
              <el-input v-model="queryParams.contentK" placeholder="请输入钾含量" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="生产厂家" prop="manufacturer">
              <el-input v-model="queryParams.manufacturer" placeholder="请输入生产厂家" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="供应商" prop="supplier">
              <el-input v-model="queryParams.supplier" placeholder="请输入供应商" clearable @keyup.enter="handleQuery" />
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
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:fertilizer:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:fertilizer:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:fertilizer:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['mz_base:fertilizer:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:fertilizer:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="fertilizerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="肥料ID" align="center" prop="fertilizerId" v-if="false" />
        <el-table-column label="肥料名称" align="center" prop="fertiName" />
        <el-table-column label="肥料类型" align="center" prop="fertiType">
          <template #default="scope">
            <dict-tag :options="ferti_type" :value="scope.row.fertiType" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="肥料含量" align="center" prop="fertiContent" /> -->
        <el-table-column label="氮含量(%)" align="center" prop="contentN" />
        <el-table-column label="磷含量(%)" align="center" prop="contentP" />
        <el-table-column label="钾含量(%)" align="center" prop="contentK" />
        <el-table-column label="生产厂家" align="center" prop="manufacturer" />
        <el-table-column label="供应商" align="center" prop="supplier" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="是否有效" align="center" prop="isValid" v-if="false">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:fertilizer:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:fertilizer:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 添加或修改肥料基本信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="fertilizerFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="肥料名称" prop="fertiName">
          <el-input v-model="form.fertiName" placeholder="请输入肥料名称" />
        </el-form-item>
        <el-form-item label="肥料类型" prop="fertiType">
          <el-select v-model="form.fertiType" placeholder="请选择肥料类型">
            <el-option v-for="dict in ferti_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="肥料含量" prop="fertiContent">
          <el-input v-model="form.fertiContent" type="textarea" placeholder="请输入内容" />
        </el-form-item> -->
        <el-form-item label="氮含量" prop="contentN">
          <el-input v-model="form.contentN" placeholder="请输入氮含量" />
        </el-form-item>
        <el-form-item label="磷含量" prop="contentP">
          <el-input v-model="form.contentP" placeholder="请输入磷含量" />
        </el-form-item>
        <el-form-item label="钾含量" prop="contentK">
          <el-input v-model="form.contentK" placeholder="请输入钾含量" />
        </el-form-item>
        <el-form-item label="生产厂家" prop="manufacturer">
          <el-input v-model="form.manufacturer" placeholder="请输入生产厂家" />
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="form.supplier" placeholder="请输入供应商" />
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
      <!-- 错误信息显示
      <el-alert v-if="upload.errorMessage" :title="upload.errorMessage" type="error" closable /> -->

      <el-upload
        ref="fertilizerimport"
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
      <div class="el-upload__tip" style="color: red" slot="tip">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="$refs.fertilizerimport.submit()">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Fertilizer" lang="ts">
import { globalHeaders } from '@/utils/request';
import { listFertilizer, getFertilizer, delFertilizer, addFertilizer, updateFertilizer } from '../api/fertilizer/index';
import { FertilizerVO, FertilizerQuery, FertilizerForm } from '../api/fertilizer/types';

import { getToken } from '@/utils/auth';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid, ferti_type } = toRefs<any>(proxy?.useDict('is_valid', 'ferti_type'));

const fertilizerList = ref<FertilizerVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const fertilizerFormRef = ref<ElFormInstance>();
const fertilizerimport = ref<ElUploadInstance>();

// import { reactive } from 'vue';
// import { ElMessageBox } from 'element-plus';

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
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/fertilizer/importData'
});

const initFormData: FertilizerForm = {
  fertilizerId: undefined,
  fertiName: undefined,
  fertiType: undefined,
  fertiContent: undefined,
  contentN: undefined,
  contentP: undefined,
  contentK: undefined,
  manufacturer: undefined,
  supplier: undefined
};

const data = reactive<PageData<FertilizerForm, FertilizerQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fertiName: undefined,
    fertiType: undefined,
    fertiContent: undefined,
    contentN: undefined,
    contentP: undefined,
    contentK: undefined,
    manufacturer: undefined,
    supplier: undefined,
    params: {}
  },

  rules: {
    fertilizerId: [{ required: true, message: '肥料ID不能为空', trigger: 'blur' }],
    fertiName: [{ required: true, message: '肥料名称不能为空', trigger: 'blur' }],
    fertiType: [{ required: true, message: '肥料类型不能为空', trigger: 'change' }],
    // fertiContent: [{ required: true, message: '肥料含量不能为空', trigger: 'blur' }],
    contentN: [{ required: true, message: '氮含量不能为空', trigger: 'blur' }],
    contentP: [{ required: true, message: '磷含量不能为空', trigger: 'blur' }],
    contentK: [{ required: true, message: '钾含量不能为空', trigger: 'blur' }],
    manufacturer: [{ required: true, message: '生产厂家不能为空', trigger: 'blur' }],
    supplier: [{ required: true, message: '供应商不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询肥料基本信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listFertilizer(queryParams.value);
  fertilizerList.value = res.rows;
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
  fertilizerFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: FertilizerVO[]) => {
  ids.value = selection.map((item) => item.fertilizerId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
  // single.value = selection.length === 1;  // 如果选中了且仅有一个项目
  // multiple.value = selection.length > 1;  // 如果选中了多个项目
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加肥料基本信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: FertilizerVO) => {
  reset();
  const _fertilizerId = row?.fertilizerId || ids.value[0];
  const res = await getFertilizer(_fertilizerId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改肥料基本信息';
};

/** 提交按钮 */
const submitForm = () => {
  fertilizerFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.fertilizerId) {
        await updateFertilizer(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFertilizer(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作（化肥） */
const handleDelete = async (row?: FertilizerVO) => {
  const _keys = row?.fertilizerId || ids.value;
  const _ids = row?.fertilizerId || ids.value;
  const keyArray = Array.isArray(_keys) ? _keys : [_keys];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除化肥基本信息已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delFertilizer(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

// const handleSelectionChange = (selection: FertilizerVO[]) => {
//   ids.value = selection.map(item => item.fertilizerId);
// };

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'mz-base/fertilizer/export',
    {
      ...queryParams.value
    },
    `fertilizer_${new Date().getTime()}.xlsx`
  );
};

/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '导入肥料信息';
};

/** 下载模板操作 */
const importTemplate = () => {
  proxy?.download('mz-base/fertilizer/importTemplate', 1, `fertilizerTemplate.xlsx`);
};

// 文件上传中处理
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
// 文件上传成功处理
// const handleFileSuccess = (response, file, fileList) => {
//   upload.open = false;
//   upload.isUploading = false;
//   upload.$refs.upload.clearFiles();

//   console.log('后端返回的响应数据:', response);

//   if (response.code === 200) {
//     ElMessageBox.alert(response.msg, '导入成功', { type: 'success' });
//   } else {
//     ElMessageBox.alert(response.msg, '导入失败', {
//       type: 'error',
//       dangerouslyUseHTMLString: true
//     });
//   }

//   upload.getList();
// };
const handleFileSuccess = (response, file, fileList) => {
  // if (upload) {
  //   upload.$alert('消息', '提示', { type: 'success' });
  // }
  upload.open = false;
  upload.isUploading = false;
  alert(response.msg);
  fertilizerimport.value?.handleRemove(file);
  // upload.$refs.upload.clearFiles();
  // ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>', '导入结果', {
  //   dangerouslyUseHTMLString: true
  // });
  // upload.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true });

  // if (response.code !== 200) {
  //   upload.$alert(response.msg, '导入结果', { type: 'error' });
  // } else {
  //   upload.$alert(response.msg, '导入成功', { type: 'success' });
  // }

  getList();
};
// 提交上传文件
const submitFileForm = () => {
  upload.$refs.upload.submit();
};

onMounted(() => {
  getList();
});
</script>
