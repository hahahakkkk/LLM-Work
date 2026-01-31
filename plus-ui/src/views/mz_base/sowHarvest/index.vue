<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="所属基地" prop="baseId" style="width: 220px" v-has-roles="['superadmin', 'sysadmin']">
              <el-select v-model="queryParams.baseId" placeholder="请选择基地" clearable @change="onQueryBaseChange">
                <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="种植地块" prop="landId" style="width: 220px">
              <el-select v-model="queryParams.landId" placeholder="请选择种植地块" clearable filterable>
                <el-option v-for="dict in queryFilteredLandDict" :key="dict.label" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="种植谷子品种" prop="cropVariety" label-width="100" style="width: 240px">
              <el-select v-model="queryParams.cropVariety" placeholder="请选择种植谷子品种" clearable>
                <el-option v-for="dict in crop_variety" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="年份" prop="shYear" label-width="50" style="width: 520px">
              <el-date-picker v-model="queryParams.minYear" type="year" value-format="YYYY" format="YYYY" placeholder="开始年份" clearable />
              <span style="margin: 0 8px">-</span>
              <el-date-picker v-model="queryParams.maxYear" type="year" value-format="YYYY" format="YYYY" placeholder="结束年份" clearable />
            </el-form-item>
            <el-form-item label="产量" prop="yieldRange" label-width="50">
              <el-input v-model="queryParams.minYield" placeholder="最小值" style="width: 60px" @keyup.enter="handleQuery" />
              <span style="margin: 0 8px">-</span>
              <el-input v-model="queryParams.maxYield" placeholder="最大值" style="width: 65px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['mz_base:sowHarvest:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['mz_base:sowHarvest:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['mz_base:sowHarvest:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="upload" @click="handleImport" v-hasPermi="['mz_base:sowHarvest:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['mz_base:sowHarvest:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="sowHarvestList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="播种与收割ID" align="center" prop="shId" v-if="false" />
        <el-table-column label="所属基地" align="center" prop="baseName" width="120" />
        <el-table-column label="种植地块" align="center" prop="landCode" />

        <el-table-column label="年份" align="center" prop="shYear" width="80" />
        <el-table-column label="种植作物" align="center" prop="plantCrop" v-if="false">
          <template #default="scope">
            <dict-tag :options="plant_crop" :value="scope.row.plantCrop" />
          </template>
        </el-table-column>
        <el-table-column label="种植谷子品种" align="center" prop="cropVariety" width="120">
          <template #default="scope">
            <dict-tag :options="crop_variety" :value="scope.row.cropVariety" />
          </template>
        </el-table-column>
        <el-table-column label="种子品质" align="center" prop="seedQuality">
          <template #default="scope">
            <dict-tag :options="seed_quality" :value="scope.row.seedQuality" />
          </template>
        </el-table-column>
        <el-table-column label="播种时间" align="center" prop="sowTime" width="120">
          <template #default="scope">
            <span>{{ parseTime(scope.row.sowTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <!-- 新增合并后的播种人列 -->
        <el-table-column label="播种人" align="center" prop="mergedSower" v-if="true">
          <template #default="scope">
            <div v-if="scope.row.seederType === '0'">
              <!-- 农户信息显示 -->
              <template v-if="getFarmerName(scope.row.farmerId)">
                <el-tag style="color: #409eff; font-weight: 500">
                  {{ getFarmerName(scope.row.farmerId) }}
                </el-tag>
              </template>
              <span v-else-if="scope.row.farmerId == null" style="color: #909399"></span>
              <span v-else style="color: #f56c6c">无效农户ID：{{ scope.row.farmerId }}</span>
            </div>
            <!-- 非农户信息显示 -->
            <div v-else-if="scope.row.seederType === '1'" class="seeder-ext">
              <el-tag type="info">
                {{ scope.row.seederExt || '未命名播种人' }}
              </el-tag>
            </div>
            <span v-else style="color: #909399">N/A</span>
          </template>
        </el-table-column>
        <el-table-column label="收割时间" align="center" prop="harvestTime" width="120">
          <template #default="scope">
            <span>{{ parseTime(scope.row.harvestTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收割方式" align="center" prop="harvestMethod" width="120">
          <template #default="scope">
            <dict-tag :options="harvest_method" :value="scope.row.harvestMethod" />
          </template>
        </el-table-column>
        <!-- 新增合并后的收割人列 -->
        <el-table-column label="收割人" align="center" prop="mergedHarvester" v-if="true">
          <template #default="scope">
            <!-- 农户信息显示 -->
            <template v-if="getHarvester(scope.row)">
              <el-tag style="color: #409eff; font-weight: 500">
                {{ getHarvester(scope.row) }}
              </el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="产量(公斤)" align="center" prop="yeild">
          <template #default="scope">
            {{ calculateTotalYield(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" v-if="false" />
        <el-table-column label="是否有效" align="center" prop="isValid" v-if="false">
          <template #default="scope">
            <dict-tag :options="is_valid" :value="scope.row.isValid" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['mz_base:sowHarvest:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="收割" placement="top">
              <el-button link type="warning" icon="MoonNight" @click="handleUpdate2(scope.row)" v-hasPermi="['mz_base:sowHarvest:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['mz_base:sowHarvest:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改播种与收割对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="sowHarvestFormRef" :model="form" :rules="rules" label-width="110px">
        <e-skeleton :loading="columnLoading" v-if="columnLoading">
          <el-form-item label="所属基地" prop="baseId">
            <el-select v-model="form.baseId" placeholder="请选择所属基地" clearable @change="onBaseChange">
              <el-option v-for="dict in baseDict" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="种植地块" prop="landId" v-if="display1">
            <el-select v-model="form.landId" placeholder="请选择种植地块" clearable filterable>
              <el-option v-for="dict in filteredLandDict" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="种植地块" prop="landIds" v-if="display2">
            <el-select
              v-model="form.landIds"
              placeholder="请选择种植地块(可多选)"
              clearable
              multiple
              collapse-tags
              :collapse-tags-tooltip="true"
              filterable
            >
              <el-option v-for="dict in filteredLandDict" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="年份" prop="shYear">
            <el-date-picker
              v-model="form.shYear"
              type="year"
              value-format="YYYY"
              format="YYYY"
              placeholder="请选择年份"
              clearable
              @change="handleQuery"
            />
          </el-form-item>
          <el-form-item label="种植谷子品种" prop="cropVariety">
            <el-select v-model="form.cropVariety" placeholder="请选择种植谷子品种">
              <el-option v-for="dict in crop_variety" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="种子品质" prop="seedQuality">
            <el-select v-model="form.seedQuality" placeholder="请选择种子品质">
              <el-option v-for="dict in seed_quality" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="播种时间" prop="sowTime">
            <el-date-picker clearable v-model="form.sowTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择播种时间"> </el-date-picker>
          </el-form-item>
          <el-form-item label="播种人类型" prop="seederType">
            <el-radio-group v-model="form.seederType">
              <el-radio v-for="dict in user_type" :key="dict.value" :label="dict.value">
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- 农户下拉选择（当seederType=0时显示） -->

          <el-form-item v-if="form.seederType === '0'" label="播种人" prop="farmerId" key="farmer-select">
            <el-select v-model="form.farmerId" placeholder="请输入播种人" clearable filterable>
              <el-option v-for="dict in sortedfarmerBaseDict" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <!-- 非农户输入（当seederType=1时显示） -->
          <el-form-item v-if="form.seederType === '1'" label="播种人" prop="seederExt" key="non-farmer-input">
            <el-input v-model="form.seederExt" placeholder="请输入非农户名称" />
          </el-form-item>
        </e-skeleton>
        <e-skeleton :loading="columnLoading2" v-if="columnLoading2">
          <el-form-item label="收割时间" prop="harvestTime">
            <el-date-picker clearable v-model="form.harvestTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择收割时间"> </el-date-picker>
          </el-form-item>
          <el-form-item label="收割方式" prop="harvestMethod">
            <el-select v-model="form.harvestMethod" placeholder="请选择收割方式">
              <el-option v-for="dict in harvest_method" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>

          <!-- <el-form-item label="收割人类型" prop="harvesterType">
            <el-radio-group v-model="form.harvesterType">
              <el-radio v-for="dict in user_type" :key="dict.value" :label="dict.value">
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item> -->

          <el-form-item v-if="form.harvestMethod === '1'" label="收割人" prop="harvesterFarmer" key="harvester-farmer-select">
            <el-select v-model="form.harvesterFarmer" placeholder="请选择收割人" clearable filterable>
              <el-option v-for="dict in sortedfarmerBaseDict" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <!-- 非农户输入（当harvesterType=1时显示） -->
          <el-form-item v-if="form.harvestMethod === '0'" label="收割人" prop="harvesterExt" key="harvester-ext-input">
            <el-input v-model="form.harvesterExt" placeholder="请输入非农户名称" />
          </el-form-item>
          <el-form-item label="亩产(公斤)" prop="yeild">
            <el-input v-model="form.yeild" placeholder="请输入产量" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
          </el-form-item>
        </e-skeleton>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 播种与收割记录导入对话框 -->
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
        <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的播种与收割记录数据</div>
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

<script setup name="SowHarvest" lang="ts">
import { globalHeaders } from '@/utils/request';
import { listSowHarvest, getSowHarvest, delSowHarvest, addSowHarvest, updateSowHarvest } from '../api/sowHarvest';
import { SowHarvestVO, SowHarvestQuery, SowHarvestForm } from '../api/sowHarvest/types';
import { landDictQuery, farmerDictQuery, baseDictQuery, farmerBaseDictQuery, landAreaDictQuery } from '../api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { crop_variety, is_valid, plant_crop, seed_quality, harvest_method, user_type } = toRefs<any>(
  proxy?.useDict('crop_variety', 'is_valid', 'plant_crop', 'seed_quality', 'harvest_method', 'user_type')
);

const sowHarvestList = ref<SowHarvestVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const landDict = ref<DictDataOption[]>([]);
const farmerDict = ref<DictDataOption[]>([]);
const baseDict = ref<DictDataOption[]>([]);
const baseDict2 = ref<DictDataOption[]>([]);
const landDict2 = ref<DictDataOption[]>([]);
const farmerLandDict = ref<DictDataOption[]>([]);
const farmerBaseDict = ref<DictDataOption[]>([]); // 新的命名
const landAreaDict = ref<DictDataOption[]>([]);

const queryFormRef = ref<ElFormInstance>();
const sowHarvestFormRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();

const display1 = ref(false);
const display2 = ref(false);

const columnLoading = ref(false);
const columnLoading2 = ref(false);

function getHarvester(rec) {
  if (rec.harvestTime) {
    if (rec.harvestMethod === '1') {
      return rec.farmerName;
    } else {
      return rec.harvesterExt;
    }
  }
}

// 播种与收割记录导入参数
const upload = reactive<ImportOption>({
  // 是否显示弹出层
  open: false,
  // 弹出层标题
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的播种与收割数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/mz-base/sowHarvest/importData'
});

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

/** 按 label 中文序排序（正序） */
const sortByLabel = <T extends { label: string }>(arr: T[]) =>
  [...arr].sort((a, b) => a.label.localeCompare(b.label, 'zh-CN', { sensitivity: 'accent' }));

/** 去重：按某个 key（默认按 label 去重；若你希望按 value 去重，把 key 改为 'value'） */
const uniqueBy = <T extends Record<string, any>>(arr: T[], key: keyof T = 'label') => {
  return arr.filter((it) => it.isValid === 1);
};

// 使用 Map 提高查询效率
const farmerMap = computed(() => {
  return new Map(farmerDict.value.map((item) => [item.value, item.label]));
});

const getFarmerName = (farmerId) => {
  return farmerMap.value.get(farmerId);
};

// 显示农户-基地字典 (之前是农户-地块)
const getFarmerBaseDict = async () => {
  // 获取农户和基地的名称
  const newMap = new Map<string, string>();
  for (const value1 of farmerDict.value) {
    for (const value2 of baseDict2.value) {
      // 使用baseDict替代landDict2
      if (value2.label === value1.value) {
        // 维持原有的关联逻辑
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

const sortedfarmerBaseDict = computed(() => {
  // 对农户和地块进行排序
  return [...farmerBaseDict.value].sort((a, b) => a.label.localeCompare(b.label));
});

const initFormData: SowHarvestForm = {
  shId: undefined,
  landId: undefined,
  landIds: undefined,
  shYear: undefined,
  plantCrop: '0',
  cropVariety: undefined,
  sowTime: undefined,
  farmerId: undefined,
  seederExt: undefined,
  harvestTime: undefined,
  harvestMethod: undefined,
  yeild: undefined,
  minYield: '',
  maxYield: '',
  remark: undefined,
  minYear: undefined,
  maxYear: undefined,
  seederType: '0',
  harvesterType: '0', // 默认选择农户类型
  harvesterFarmer: undefined,
  harvesterExt: undefined
};
const data = reactive<PageData<SowHarvestForm, SowHarvestQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    landId: undefined,
    landIds: undefined,
    shYear: undefined,
    cropVariety: undefined,
    sowTime: undefined,
    harvestMethod: undefined,
    harvestTime: undefined,
    yeild: undefined,
    minYield: '',
    maxYield: '',
    minYear: undefined,
    maxYear: undefined,
    params: {}
  },
  rules: {
    shId: [{ required: true, message: '播种与收割ID不能为空', trigger: 'blur' }],
    // landId: [
    //   { required: true, message: "地块ID不能为空", trigger: "blur" }
    // ],
    shYear: [{ required: true, message: '年份不能为空', trigger: 'blur' }],
    plantCrop: [{ required: true, message: '种植作物不能为空', trigger: 'change' }],
    cropVariety: [{ required: true, message: '种植谷子品种不能为空', trigger: 'change' }],
    yeild: [{ required: true, message: '产量不能为空', trigger: 'blur' }],
    landIds: [
      { required: true, message: '地块不能为空', trigger: 'blur', type: 'array' },
      { type: 'array', min: 1, message: '至少选择一个地块' }
    ]
  }
});

// 筛选后的地块列表
const filteredLandDict = ref([]);
// 当前选中的基地标签
const currentBaseLabel = ref('');

// 基地选择变化时的处理函数
const onBaseChange = (baseId) => {
  // 获取选中的基地标签
  const baseItem = baseDict.value.find((item) => item.value === baseId);
  if (!baseItem) return;

  // 保存当前基地标签
  currentBaseLabel.value = baseItem.label.replace(/基地$/, '');

  let filtered = [];
  if (currentBaseLabel.value === '侯家沟') {
    // 筛选仅包含"侯家沟"但不包含"南"的地块
    filtered = landDict.value.filter((land) => land.label.includes('侯家沟') && !land.label.includes('南'));
  } else {
    // 筛选地块：地块标签以基地标签开头
    filtered = landDict.value.filter((land) => land.label.startsWith(currentBaseLabel.value));
  }

  // 对筛选后的地块：去重 + 排序
  filteredLandDict.value = sortByLabel(uniqueBy(filtered, 'label'));
  // 提示用户
  if (filteredLandDict.value.length === 0) {
    ElMessage.warning(`未找到"${baseItem.label}"的地块`);
  }
};

// 查询表单使用的过滤后地块列表
const queryFilteredLandDict = ref([]);
// 查询表单中基地选择变化时的处理函数
const onQueryBaseChange = (baseId: any) => {
  queryFilteredLandDict.value = landDict.value.filter((item) => item.baseId === baseId);
  queryParams.value.landId = undefined;
};

const { queryParams, form, rules } = toRefs(data);

/** 查询播种与收割列表 */
const getList = async () => {
  loading.value = true;
  const res = await listSowHarvest(queryParams.value);
  sowHarvestList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

// 计算总产量（亩数 × 亩产）
const calculateTotalYield = (row) => {
  if (!row.yeild || !row.landId) return '';

  // 查找地块的亩数
  const landArea = landAreaDict.value.find((item) => item.value === row.landId);

  // 将字符串转换为数字进行计算
  const area = parseFloat(landArea.label) || 0;
  const yieldPerMu = parseFloat(row.yeild) || 0;

  return (area * yieldPerMu).toFixed(2); // 保留2位小数
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  sowHarvestFormRef.value?.resetFields();
  filteredLandDict.value = [];
  currentBaseLabel.value = '';
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const handleDateChange = (date) => {
  if (date) {
    // 在选择日期后，附加时间信息（例如：00:00:00）
    queryParams.value.sowTime = `${date} 00:00:00`;
  } else {
    // 如果日期为空，可以根据需求处理
    queryParams.value.sowTime = '';
  }
};

const handleDateChange1 = (date) => {
  if (date) {
    // 在选择日期后，附加时间信息（例如：00:00:00）
    queryParams.value.harvestTime = `${date} 00:00:00`;
  } else {
    // 如果日期为空，可以根据需求处理
    queryParams.value.harvestTime = '';
  }
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.minYield = '';
  queryParams.value.maxYield = '';
  queryParams.value.minYear = '';
  queryParams.value.maxYear = '';

  queryFilteredLandDict.value = [];
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: SowHarvestVO[]) => {
  ids.value = selection.map((item) => item.shId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  display1.value = false;
  display2.value = true;
  dialog.visible = true;
  dialog.title = '添加播种记录';
  columnLoading.value = true;
  columnLoading2.value = false;
};

/** 修改按钮操作 */
const handleUpdate = async (row?: SowHarvestVO) => {
  reset();
  display1.value = true;
  display2.value = false;
  const _shId = row?.shId || ids.value[0];
  const res = await getSowHarvest(_shId);
  Object.assign(form.value, res.data);
  onBaseChange(form.value.baseId);
  dialog.visible = true;
  dialog.title = '修改播种与收割记录';
  columnLoading.value = true;
  columnLoading2.value = true;
};

/** 收割按钮操作 */
const handleUpdate2 = async (row?: SowHarvestVO) => {
  reset();
  const _shId = row?.shId || ids.value[0];
  const res = await getSowHarvest(_shId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '添加收割记录';
  columnLoading.value = false;
  columnLoading2.value = true;
};

/** 提交按钮 */
const submitForm = () => {
  sowHarvestFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.shId) {
        await updateSowHarvest(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSowHarvest(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作（播种与收割） */
const handleDelete = async (row?: SowHarvestVO) => {
  const _keys = row?.shId || ids.value;
  const _ids = row?.shId || ids.value;
  const keyArray = Array.isArray(_keys) ? _keys : [_keys];
  const count = keyArray.length;
  let confirmMessage = `是否确认删除播种与收割已选中的${count}条数据？`;
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delSowHarvest(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导入按钮操作 */
const handleImport = () => {
  upload.open = true;
  upload.title = '播种与收割记录导入';
};

const importTemplate = () => {
  proxy?.download('mz-base/sowHarvest/importTemplate', {}, `sowHarvest_template_${new Date().getTime()}.xlsx`);
};

const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};

const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  alert(response.msg);
  uploadRef.value?.handleRemove(file);
  getList();
};

const submitFileForm = () => {
  uploadRef.value?.submit();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'mz-base/sowHarvest/export',
    {
      ...queryParams.value
    },
    `sowHarvest_${new Date().getTime()}.xlsx`
  );
};

/**
 * 基地、农户字典
 */
const getDicts = async () => {
  let res = await landDictQuery();
  // 对地块进行排序
  landDict.value = sortByLabel(res.rows);

  // 获取地块面积数据
  res = await landAreaDictQuery();
  landAreaDict.value = res.rows;

  // 其他代码保持不变
  res = await farmerDictQuery();
  farmerDict.value = res.rows;

  res = await baseDictQuery();
  baseDict.value = sortByLabel(res.rows);

  res = await farmerBaseDictQuery();
  baseDict2.value = res.rows;

  // 修改这里：调用getFarmerBaseDict而不是getFarmerLandDict
  getFarmerBaseDict();

  // 初始化查询面板的地块列表为全部地块（且有序、去重一次）
  queryFilteredLandDict.value = uniqueBy(sortByLabel(landDict.value), 'label');
};

onMounted(() => {
  getDicts();
  getList();
});
</script>
