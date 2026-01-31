<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item label="所属基地" prop="baseId" v-has-roles="['superadmin', 'sysadmin']">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable>
                <el-option v-for="dict in baseDict" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="姓名" prop="peopleName">
              <el-input v-model="queryParams.peopleName" placeholder="请输入姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="性别" prop="peopleSex">
              <el-select v-model="queryParams.peopleSex" placeholder="请选择性别" clearable >
                <el-option v-for="dict in base_people_sex" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="联系电话" prop="peoplePhone">
              <el-input v-model="queryParams.peoplePhone" placeholder="请输入联系电话" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="人员类型" prop="peopleType">
              <el-select v-model="queryParams.peopleType" placeholder="请选择人员类型" clearable>
                <el-option v-for="dict in people_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="人员状态" prop="peopleStatus">
              <el-select v-model="queryParams.peopleStatus" placeholder="请选择人员状态" clearable>
                <el-option v-for="dict in people_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:people:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:people:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:people:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['mz_base:people:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:people:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="peopleList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="所属基地" align="center" prop="baseId">
          <template #default="scope">
            <dict-tag :options="baseDict" :value="scope.row.baseId" />
          </template>
        </el-table-column>
        <el-table-column label="姓名" align="center" prop="peopleName" />
        <el-table-column label="性别" align="center" prop="peopleSex">
          <template #default="scope">
            <dict-tag :options="base_people_sex" :value="scope.row.peopleSex" />
          </template>
        </el-table-column>
        <el-table-column label="出生日期" align="center" prop="peopleBirth" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.peopleBirth, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" align="center" prop="peoplePhone" />
        <el-table-column label="人员类型" align="center" prop="peopleType">
          <template #default="scope">
            <dict-tag :options="people_type" :value="scope.row.peopleType" />
          </template>
        </el-table-column>
        <el-table-column label="人员状态" align="center" prop="peopleStatus">
          <template #default="scope">
            <dict-tag :options="people_status" :value="scope.row.peopleStatus" />
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:people:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:people:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改基地人员对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="peopleFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地" clearable>
            <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" prop="peopleName">
          <el-input v-model="form.peopleName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="peopleSex">
          <el-select v-model="form.peopleSex" placeholder="请选择性别">
            <el-option v-for="dict in base_people_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="测定时间">
          <el-date-picker type="date" v-model="form.testDate" value-format="YYYY-MM-DD" placeholder="请输入测定时间" clearable />
        </el-form-item>
        <el-form-item label="联系电话" prop="peoplePhone">
          <el-input v-model="form.peoplePhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="人员类型" prop="peopleType">
          <el-select v-model="form.peopleType" placeholder="请选择人员类型">
            <el-option v-for="dict in people_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="人员状态" prop="peopleStatus">
          <el-select v-model="form.peopleStatus" placeholder="请选择人员状态">
            <el-option v-for="dict in people_status" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="是否有效" prop="isValid" v-if="false" />
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 导入人员对话框 -->
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的人员数据</div>
        <span>仅允许导入xls、xlsx格式文件。</span>
        <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="People" lang="ts">
import { listPeople, getPeople, delPeople, addPeople, updatePeople } from '../api/people/index';
import { PeopleVO, PeopleQuery, PeopleForm } from '../api/people/types';
import { globalHeaders } from '@/utils/request';
import { baseDictQuery } from '../api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { base_people_sex, people_type, people_status } = toRefs<any>(proxy?.useDict('base_people_sex', 'people_type', 'people_status'));

const peopleList = ref<PeopleVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const peopleFormRef = ref<ElFormInstance>();

const baseDict = ref<DictDataOption[]>([]);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 人员导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层（人员导入）
  open: false,
  // 弹出层标题（人员导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的人员数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/people/importData'
});

const uploadRef = ref<ElUploadInstance>();

const initFormData: PeopleForm = {
  peopleId: undefined,
  baseId: undefined,
  peopleName: undefined,
  peopleSex: undefined,
  peopleBirth: undefined,
  peoplePhone: undefined,
  remark: undefined,
  isValid: undefined,
  peopleType: undefined,
  peopleStatus: undefined
};
const data = reactive<PageData<PeopleForm, PeopleQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    peopleName: undefined,
    peopleType: undefined,
    peopleStatus: undefined,
    params: {}
  },
  rules: {
    peopleType: [{ required: true, message: '人员类型不能为空', trigger: 'change' }],
    peopleStatus: [{ required: true, message: '人员状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询基地人员列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPeople(queryParams.value);

  // 排序：首先按基地名称排序，再按姓名排序
  peopleList.value = res.rows.sort((a, b) => {
    // 先按基地名称排序
    const baseNameA = baseDict.value.find((dict) => dict.value === a.baseId)?.label || '';
    const baseNameB = baseDict.value.find((dict) => dict.value === b.baseId)?.label || '';

    const baseCompare = baseNameA.localeCompare(baseNameB, 'zh'); // 按基地名称（中文）排序
    if (baseCompare !== 0) return baseCompare;

    // 然后按姓名排序
    return a.peopleName.localeCompare(b.peopleName, 'zh'); // 按姓名（中文）排序
  });

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
  peopleFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PeopleVO[]) => {
  ids.value = selection.map((item) => item.peopleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加基地人员';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: PeopleVO) => {
  reset();
  const _peopleId = row?.peopleId || ids.value[0];
  const res = await getPeople(_peopleId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改基地人员';
};

/** 提交按钮 */
const submitForm = () => {
  peopleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.peopleId) {
        await updatePeople(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPeople(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: PeopleVO) => {
  const _peopleIds = row?.peopleId || ids.value;
  const keyArray = Array.isArray(_peopleIds) ? _peopleIds : [_peopleIds];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除基地人员已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delPeople(_peopleIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'mz-base/people/export',
    {
      ...queryParams.value
    },
    `people_${new Date().getTime()}.xlsx`
  );
};

const handleImport = () => {
  upload.open = true;
  upload.title = '人员导入';
};

const importTemplate = () => {
  proxy?.download('mz-base/people/importTemplate', {}, `peopleImportTemplate.xlsx`);
};

const handleFileUploadProgress = () => {
  upload.isUploading = true;
};

const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>', '导入结果', {
    dangerouslyUseHTMLString: true
  });
  getList();
};

const submitFileForm = () => {
  uploadRef.value?.submit();
};

/**
 * 农户、基地字典
 */
const getDicts = async () => {
  const res = await baseDictQuery();
  baseDict.value = res.rows.sort((a, b) => a.label.localeCompare(b.label, 'zh'));
  console.log('baseDict:', baseDict.value);
};

onMounted(() => {
  getList();
  getDicts();
});
</script>
