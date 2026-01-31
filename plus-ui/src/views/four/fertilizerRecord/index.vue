<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="施肥日期" prop="useTimes">
              <el-date-picker
                clearable
                v-model="queryParams.useTimes"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
            <!-- <el-form-item label="使用日期" prop="useTime">
              <el-date-picker
                clearable
                v-model="queryParams.useTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择使用日期"
                @change="handleDateChange"
              />
            </el-form-item> -->
            <!--<el-form-item label="化肥名称" prop="fertilizerId">
              <el-select v-model="queryParams.fertilizerId" placeholder="请选择肥料名称" clearable>
                <el-option v-for="dict in fertilizerDict" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>-->
            <el-form-item label="化肥名称" prop="fertilizerId">
              <el-select v-model="queryParams.fertilizerId" placeholder="请选择肥料名称" clearable>
                <el-option v-for="dict in filteredFertilizerDict.filter((it) => it.isValid === 1)" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="用途" prop="useFor">
              <el-input v-model="queryParams.useFor" placeholder="请输入用途" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="使用量" prop="useAmount">
              <el-input v-model="queryParams.useAmount" placeholder="请输入使用量" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!--<el-form-item label="操作人" prop="farmerId">
              <el-select v-model="queryParams.farmerId" placeholder="请选择操作人" clearable @keyup.enter="handleQuery">
                <el-option v-for="dict in farmerDict" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>-->
            <!--<el-form-item label="操作人" prop="farmerId">
              <el-select
                v-model="queryParams.farmerId"
                placeholder="请选择操作人"
                clearable
                filterable
                @keyup.enter="handleQuery"
              >
                <el-option
                  v-for="dict in getSortedFarmerOptions()"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>-->
            <!--<el-form-item label="使用地块" prop="landId">
              <el-select v-model="queryParams.landId" placeholder="请选择使用地块" clearable>
                <el-option v-for="dict in landDict" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>-->
            <el-form-item label="使用地块" prop="landId">
              <el-select v-model="queryParams.landId" placeholder="请选择使用地块" clearable filterable>
                <el-option v-for="dict in landDict.filter((it) => it.isValid === 1)" :key="dict.value" :label="dict.label" :value="dict.value" />
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
      <!--<template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:fertilizerUse:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:fertilizerUse:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:fertilizerUse:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['mz_base:fertilizerUse:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:fertilizerUse:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" :columns="columns" :search="true" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>-->

      <el-table v-loading="loading" :data="fertilizerUseList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="70" align="center" />
        <el-table-column v-if="columns[0].visible" key="useId" label="使用记录ID" align="center" prop="useId" />
        <el-table-column v-if="columns[1].visible" key="useTime" label="使用日期" align="center" prop="useTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.useTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[2].visible" key="fertilizerId" label="化肥名称" align="center" prop="fertilizerId">
          <template #default="scope">
            <dict-tag :options="fertilizerDict" :value="scope.row.fertilizerId" />
          </template>
        </el-table-column>
        <el-table-column v-if="columns[3].visible" key="useFor" label="用途" align="center" prop="useFor" />
        <el-table-column label="施肥方式" align="center" prop="useMethod">
          <template #default="scope">
            <dict-tag :options="use_method" :value="scope.row.useMethod" />
          </template>
        </el-table-column>
        <el-table-column v-if="columns[4].visible" key="useAmount" label="使用量(公斤)" align="center" prop="useAmount" />
        <el-table-column v-if="columns[5].visible" key="useBy" label="使用人" align="center" prop="useBy" />
        <el-table-column label="操作人类型" align="center" prop="buyerType" v-if="false">
          <template #default="scope">
            <dict-tag :options="user_type" :value="scope.row.buyerType" />
          </template>
        </el-table-column>
        <!-- 新增合并后的采购人列 -->
        <el-table-column label="操作人" align="center" prop="mergedBuyer" v-if="true">
          <template #default="scope">
            <div v-if="scope.row.buyerType === '0'">
              <!-- 农户信息显示 -->
              <template v-if="scope.row.farmerId">
                <el-tag style="color: #409eff; font-weight: 500">
                  {{ getFarmerName(scope.row.farmerId) ? getFarmerName(scope.row.farmerId) : `无效农户(ID：${scope.row.farmerId})` }}
                </el-tag>
              </template>
              <span v-else style="color: #f56c6c"></span>
            </div>
            <!-- 非农户信息显示 -->
            <div v-else-if="scope.row.buyerType === '1'" class="non-farmer">
              <el-tag type="info">
                {{ scope.row.nonFarmer || '未命名操作人' }}
              </el-tag>
            </div>

            <span v-else style="color: #909399">N/A</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="操作人" align="center" prop="farmerId">
          <template #default="scope">
            <dict-tag :options="farmerDict" :value="scope.row.farmerId" />
          </template>
        </el-table-column> -->
        <el-table-column v-if="columns[6].visible" key="landId" label="使用地块" align="center" prop="landId">
          <template #default="scope">
            <dict-tag :options="landDict" :value="scope.row.landId" />
          </template>
        </el-table-column>
        <el-table-column v-if="columns[7].visible" key="remark" label="备注" align="center" prop="remark" />
        <el-table-column v-if="columns[8].visible" key="isValid" label="是否有效" align="center" prop="isValid">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <!--<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:fertilizerUse:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:fertilizerUse:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>-->
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改肥料使用记录对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="fertilizerUseFormRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="使用日期" prop="useTime">
          <el-date-picker clearable v-model="form.useTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择使用日期"> </el-date-picker>
        </el-form-item>
        <!--<el-form-item label="化肥名称" prop="fertilizerId">
          <el-select v-model="form.fertilizerId" placeholder="请选择肥料名称" clearable>
            <el-option v-for="dict in fertilizerDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>-->
        <el-form-item label="化肥名称" prop="fertilizerId">
          <el-select v-model="form.fertilizerId" placeholder="请选择肥料名称" clearable>
            <el-option v-for="dict in filteredFertilizerDict.filter((it) => it.isValid === 1)" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="施肥方式" prop="useMethod">
          <el-select v-model="form.useMethod" placeholder="请选择施肥方式">
            <el-option v-for="dict in use_method" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="使用量(公斤)" prop="useAmount">
          <el-input v-model="form.useAmount" placeholder="请输入使用量" />
        </el-form-item>
        <el-form-item label="操作人类型" prop="buyerType">
          <el-radio-group v-model="form.buyerType">
            <el-radio v-for="dict in user_type" :key="dict.value" :label="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 农户下拉选择（当buyerType=0时显示） -->
        <!--<el-form-item v-if="form.buyerType === '0'" label="操作人" prop="farmerId" key="farmer-select">
          <el-select v-model="form.farmerId" placeholder="请输入操作人" clearable>
            <el-option v-for="dict in farmerLandDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>-->
        <!-- 农户下拉选择（当buyerType=0时显示） -->
        <!--<el-form-item v-if="form.buyerType === '0'" label="操作人" prop="farmerId" key="farmer-select">
          <el-select
            v-model="queryParams.farmerId"
            placeholder="请输入操作人"
            clearable
            filterable
          >
            <el-option
              v-for="dict in getSortedFarmerLandOptions()"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>-->
        <!-- 修改农户下拉选择（当buyerType=0时显示） -->
        <el-form-item v-if="form.buyerType === '0'" label="操作人" prop="farmerId" key="farmer-select">
          <el-select v-model="queryParams.farmerId" placeholder="请输入操作人" clearable filterable>
            <el-option v-for="dict in getSortedFarmerBaseOptions()" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <!-- 非农户输入（当buyerType=1时显示） -->
        <el-form-item v-if="form.buyerType === '1'" label="操作人" prop="nonFarmer" key="non-farmer-input">
          <el-input v-model="form.nonFarmer" placeholder="请输入非农户名称" />
        </el-form-item>
        <!-- <el-form-item label="操作人" prop="farmerId">
          <el-select v-model="form.farmerId" placeholder="请输入操作人" clearable>
            <el-option v-for="dict in farmerDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item> -->
        <!--<el-form-item label="使用地块" prop="landId" v-if="display1">
          <el-select v-model="form.landId" placeholder="请选择使用地块" clearable>
            <el-option v-for="dict in landDict" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>-->
        <el-form-item label="使用地块" prop="landId" v-if="display1">
          <el-select v-model="form.landId" placeholder="请选择使用地块" clearable filterable :filter-method="filterLandMethod">
            <el-option v-for="dict in landDict.filter((it) => it.isValid === 1)" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <!--<el-form-item label="使用地块" prop="landIds" v-if="display2">
          <el-select v-model="form.landIds" placeholder="请选择使用地块(可多选)" clearable multiple collapse-tags :collapse-tags-tooltip="true">
            <el-option v-for="dict in landDict" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>-->
        <el-form-item label="使用地块" prop="landIds" v-if="display2">
          <el-select
            v-model="form.landIds"
            placeholder="请选择使用地块(可多选)"
            clearable
            multiple
            collapse-tags
            :collapse-tags-tooltip="true"
            filterable
          >
            <el-option v-for="dict in landDict.filter((it) => it.isValid === 1)" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
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
    <!-- 施肥导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
        ref="fertilizerUseimport"
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的肥料使用记录数据</div>
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
  </div>
</template>

<script setup name="FertilizerRecord" lang="ts">
import {
  listFertilizerUse,
  getFertilizerUse,
  delFertilizerUse,
  addFertilizerUse,
  updateFertilizerUse
} from '@/views/mz_base/api/fertilizerUse/index';
import { FertilizerUseVO, FertilizerUseQuery, FertilizerUseForm } from '@/views/mz_base/api/fertilizerUse/types';
import { globalHeaders } from '@/utils/request';
import { fertilizerDictQuery, landDictQuery, farmerDictQuery, farmerBaseDictQuery } from '@/views/mz_base/api/tableDict';

// import { fertilizerDictQuery, landDictQuery, farmerDictQuery } from '../api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { is_valid, use_method } = toRefs<any>(proxy?.useDict('is_valid', 'use_method'));

const fertilizerUseList = ref<FertilizerUseVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const fertilizerDict = ref<DictDataOption[]>([]);
const landDict = ref<DictDataOption[]>([]);
const landDict2 = ref<DictDataOption[]>([]);
const baseDict2 = ref<DictDataOption[]>([]);
const farmerDict = ref<DictDataOption[]>([]);
const farmerBaseDict = ref<DictDataOption[]>([]);
const farmerLandDict = ref<DictDataOption[]>([]);
const queryFormRef = ref<ElFormInstance>();
const fertilizerUseFormRef = ref<ElFormInstance>();
const fertilizerUseimport = ref<ElUploadInstance>();

const display1 = ref(false);
const display2 = ref(false);
const { user_type } = toRefs<any>(proxy?.useDict('user_type'));

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FertilizerUseForm = {
  useId: undefined,
  useTime: undefined,
  fertilizerId: undefined,
  useFor: undefined,
  useMethod: '0',
  useAmount: undefined,
  useBy: undefined,
  landId: undefined,
  remark: undefined,
  isValid: '1',
  farmerId: undefined,
  nonFarmer: undefined,
  buyerType: '0'
};

const columns = ref<FieldOption[]>([
  { key: 0, label: `使用记录ID`, visible: false, children: [] },
  { key: 1, label: `使用日期`, visible: true, children: [] },
  { key: 2, label: `肥料名称`, visible: true, children: [] },
  { key: 3, label: `用途`, visible: false, children: [] },
  { key: 4, label: `使用量`, visible: true, children: [] },
  { key: 5, label: `操作人`, visible: false, children: [] },
  { key: 6, label: `使用地块`, visible: true, children: [] },
  { key: 7, label: `备注`, visible: false, children: [] },
  { key: 8, label: `是否有效（0无效 1有效）`, visible: false, children: [] }
]);
const upload = reactive<ImportOption>({
  open: false,
  title: '',
  isUploading: false,
  updateSupport: 0,
  headers: globalHeaders(),
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/fertilizerUse/importData'
});

// 使用 Map 提高查询效率
const farmerMap = computed(() => {
  return new Map(farmerDict.value.map((item) => [item.value, item.label]));
});

const getFarmerName = (farmerId) => {
  return farmerMap.value.get(farmerId);
};
// 显示农户-地块字典
const getFarmerBaseDict = async () => {
  // 获取农户和地块的名称
  const newMap = new Map<string, string>();
  for (const value1 of farmerDict.value) {
    for (const value2 of baseDict2.value) {
      if (value2.label === value1.value) {
        newMap.set(value1.value, `${value1.label}-${value2.value}`);
      }
    }
  }

  // 将 Map 转换为数组，并赋值给 farmerBaseDict
  farmerBaseDict.value = Array.from(newMap, ([key, value]) => ({
    label: value,
    value: key
  }));
  return newMap;
};

const data = reactive<PageData<FertilizerUseForm, FertilizerUseQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    useTime: undefined,
    fertilizerId: undefined,
    useFor: undefined,
    useMethod: '0',
    useAmount: undefined,
    useBy: undefined,
    landId: undefined,
    landIds: undefined,
    isValid: '1',
    farmerId: undefined,
    nonFarmer: undefined,
    buyerType: undefined,
    params: {},
    orderByColumn: 'useTime,fertilizerId', // 排序字段
    isAsc: 'desc,asc' // 排序方式
  },
  rules: {
    useId: [{ required: true, message: '使用记录ID不能为空', trigger: 'blur' }],
    useTime: [{ required: true, message: '使用日期不能为空', trigger: 'blur' }],
    fertilizerId: [{ required: true, message: '肥料名称不能为空', trigger: 'blur' }],
    useAmount: [{ required: true, message: '使用量不能为空', trigger: 'blur' }],
    landIds: [
      { required: true, message: '地块不能为空', trigger: 'blur', type: 'array' },
      { type: 'array', min: 1, message: '至少选择一个地块' }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 添加一个计算属性
const filteredFertilizerDict = computed(() => {
  // 用于检查是否有重复
  const seen = new Set();

  return fertilizerDict.value.filter((item) => {
    // 过滤掉值为"1"的选项
    if (item.value === '1' || item.value === 1) return false;

    // 检查是否是重复的label
    if (seen.has(item.label)) return false;

    // 将label添加到seen集合中
    seen.add(item.label);
    return true;
  });
});

// 添加这个辅助函数，它不使用响应式API
function getSortedLandOptions() {
  // 创建普通数组，不是响应式的
  const options = [];

  // 避免响应式依赖，使用普通for循环
  if (landDict.value && landDict.value.length) {
    // 首先去重
    const uniqueValues = new Set();

    for (let i = 0; i < landDict.value.length; i++) {
      const item = landDict.value[i];
      if (!item || !item.value || !item.label) continue;

      // 去重处理
      if (uniqueValues.has(item.value)) continue;
      uniqueValues.add(item.value);

      // 添加到结果数组
      options.push({
        label: item.label,
        value: item.value
      });
    }
  }

  // 在返回前进行排序
  options.sort((a, b) => {
    return String(a.label).localeCompare(String(b.label), 'zh-CN', { sensitivity: 'accent' });
  });

  return options;
}

// 添加地块过滤方法
// 优化地块过滤方法
// 简化过滤方法，避免触发响应式更新
const filterLandMethod = (query, item) => {
  if (!query) return true;

  // 使用原始值而不是响应式引用
  const label = String(item.label || '');
  const searchText = String(query || '');

  return label.toLowerCase().includes(searchText.toLowerCase());
};

// 添加这个辅助函数，用于获取排序后的操作人选项
/*function getSortedFarmerOptions() {
  // 创建普通数组，不是响应式的
  const options = [];

  // 处理农户数据
  if (farmerDict.value && farmerDict.value.length) {
    // 首先去重
    const uniqueValues = new Set();

    for (let i = 0; i < farmerDict.value.length; i++) {
      const item = farmerDict.value[i];
      if (!item || !item.value || !item.label) continue;

      // 去重处理
      if (uniqueValues.has(item.value)) continue;
      uniqueValues.add(item.value);

      // 添加到结果数组
      options.push({
        label: item.label,
        value: item.value
      });
    }
  }

  // 按照中文拼音排序
  options.sort((a, b) => {
    return String(a.label).localeCompare(String(b.label), 'zh-CN', { sensitivity: 'accent' });
  });

  return options;
}*/

// 添加这个辅助函数，用于获取排序后的农户-基地组合选项
function getSortedFarmerBaseOptions() {
  // 创建普通数组，不是响应式的
  const options = [];

  // 避免响应式依赖，使用普通for循环
  if (farmerBaseDict.value && farmerBaseDict.value.length) {
    // 首先去重
    const uniqueValues = new Set();

    for (let i = 0; i < farmerBaseDict.value.length; i++) {
      const item = farmerBaseDict.value[i];
      if (!item || !item.value || !item.label) continue;

      // 去重处理
      if (uniqueValues.has(item.value)) continue;
      uniqueValues.add(item.value);

      // 添加到结果数组
      options.push({
        label: item.label,
        value: item.value
      });
    }
  }

  // 按照中文拼音排序（按人名的首字母排序）
  options.sort((a, b) => {
    // 提取人名部分（假设格式为"名字-地块"）
    const nameA = a.label.split('-')[0] || '';
    const nameB = b.label.split('-')[0] || '';

    // 按人名排序
    return nameA.localeCompare(nameB, 'zh-CN', { sensitivity: 'accent' });
  });

  return options;
}
// 修改原有的 getSortedFarmerLandOptions 函数为:
// 添加这个辅助函数，用于获取排序后的农户-基地组合选项
/*function getSortedFarmerBaseOptions() {
  // 使用浅拷贝避免直接操作响应式数据
  const sourceData = farmerBaseDict.value ? [...farmerBaseDict.value] : [];

  // 去重处理
  const uniqueMap = new Map();
  for (const item of sourceData) {
    if (item && item.value && item.label && !uniqueMap.has(item.value)) {
      uniqueMap.set(item.value, item);
    }
  }

  // 转换为数组并排序
  return Array.from(uniqueMap.values())
    .sort((a, b) => {
      const nameA = String(a.label).split('-')[0] || '';
      const nameB = String(b.label).split('-')[0] || '';
      return nameA.localeCompare(nameB, 'zh-CN');
    });
}*/

/** 查询肥料使用记录列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.orderByColumn = 'useTime,fertilizerId';
  queryParams.value.isAsc = 'desc,asc';
  console.log(queryParams);
  const res = await listFertilizerUse(queryParams.value);
  console.log(res);
  fertilizerUseList.value = res.rows;
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
  fertilizerUseFormRef.value?.resetFields();
};

const handleDateChange = (date) => {
  if (date) {
    // 在选择日期后，附加时间信息（例如：00:00:00）
    queryParams.value.useTime = `${date} 00:00:00`;
  } else {
    // 如果日期为空，可以根据需求处理
    queryParams.value.useTime = '';
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
  queryParams.value.orderByColumn = 'useTime,fertilizerId';
  queryParams.value.isAsc = 'desc,asc';
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: FertilizerUseVO[]) => {
  ids.value = selection.map((item) => item.useId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
/*const handleAdd = () => {
  reset();
  display1.value = false;
  display2.value = true;
  dialog.visible = true;
  dialog.title = '添加施肥记录';
};*/
/** 新增按钮操作 */
const handleAdd = () => {
  // 重置表单
  form.value = JSON.parse(JSON.stringify(initFormData)); // 深拷贝，切断响应式连接
  fertilizerUseFormRef.value?.resetFields();

  // 设置显示状态
  display1.value = false;
  display2.value = true;

  // 延迟显示对话框，避免立即触发响应式更新
  setTimeout(() => {
    dialog.visible = true;
    dialog.title = '添加施肥记录';
  }, 0);
};

/** 修改按钮操作 */
const handleUpdate = async (row?: FertilizerUseVO) => {
  reset();
  display1.value = true;
  display2.value = false;
  const _useId = row?.useId || ids.value[0];
  const res = await getFertilizerUse(_useId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改施肥记录';
};

/** 提交按钮 */
const submitForm = () => {
  fertilizerUseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.useId) {
        await updateFertilizerUse(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFertilizerUse(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作（施肥记录） */
const handleDelete = async (row?: FertilizerUseVO) => {
  const _keys = row?.useId || ids.value;
  const _ids = row?.useId || ids.value;
  const keyArray = Array.isArray(_keys) ? _keys : [_keys];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除施肥记录已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delFertilizerUse(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'mz-base/fertilizerUse/export',
    {
      ...queryParams.value
    },
    `fertilizerUse_${new Date().getTime()}.xlsx`
  );
};
/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '导入施肥信息';
};

/** 下载模板操作 */
const importTemplate = () => {
  proxy?.download('mz-base/fertilizerUse/importTemplate', 1, `fertilizerUseTemplate.xlsx`);
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
  fertilizerUseimport.value?.handleRemove(file);
  // upload.open = false;
  // upload.isUploading = false;
  // upload.$refs.upload.clearFiles();
  // upload.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true });
  getList();
};
// 提交上传文件
const submitFileForm = () => {
  fertilizerUseimport.value?.submit();
};
/**
 * 肥料字典
 */
const getDicts = async () => {
  let res = await fertilizerDictQuery();
  fertilizerDict.value = res.rows;

  res = await landDictQuery();
  landDict.value = res.rows;

  res = await farmerDictQuery();
  farmerDict.value = res.rows;

  res = await farmerBaseDictQuery();
  baseDict2.value = res.rows;

  getFarmerBaseDict();
};
onMounted(() => {
  queryParams.value.orderByColumn = 'useTime,fertilizerId';
  queryParams.value.isAsc = 'desc,asc';
  getDicts();
  getList();
});
</script>
