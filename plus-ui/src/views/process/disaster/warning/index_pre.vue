<template>
  <div class="disaster-dashboard">
    <!-- 顶部标题和统计信息 -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="title">灾害预警信息总览</h1>
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-value">{{ total }}</div>
            <div class="stat-label">总预警数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ highLevelWarnings }}</div>
            <div class="stat-label">高级别预警</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ todayWarnings }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="dashboard-content">
      <!-- 左侧：表格 + 查询 -->
      <div class="left-panel">
        <el-card shadow="never" class="panel-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">预警信息列表</span>
              <div class="card-actions">
                <el-button-group>
                  <el-button v-hasPermi="['disaster:warning:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
                  <el-button v-hasPermi="['disaster:warning:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
                  <!-- <el-button v-hasPermi="['disaster:warning:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">修改</el-button> -->
                  <el-button v-hasPermi="['disaster:warning:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
                    >删除</el-button
                  >
                </el-button-group>
                <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
              </div>
            </div>
          </template>

          <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
            <!-- 改动1: 默认隐藏搜索栏 -> showSearch 初始值 false -->
            <div v-show="showSearch" class="search-container">
              <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="search-form">
                <el-form-item label="灾害类型" prop="disasterType">
                  <el-select v-model="queryParams.disasterType" placeholder="请选择灾害类型" clearable>
                    <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="预警等级" prop="warningLevel">
                  <el-select v-model="queryParams.warningLevel" placeholder="请选择预警等级" clearable>
                    <el-option v-for="dict in disaster_level" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="预警区域" prop="region">
                  <el-input v-model="queryParams.region" placeholder="请输入预警区域" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="发布时间" prop="issueTime">
                  <el-date-picker
                    v-model="queryParams.issueTime"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    clearable
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                  <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </transition>

          <el-table
            v-loading="loading"
            :data="warningList"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            class="warning-table"
            stripe
            border
            highlight-current-row
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="灾害类型" align="center" prop="disasterType" width="120">
              <template #default="scope">
                <dict-tag :options="sys_disaster_type" :value="scope.row.disasterType" />
              </template>
            </el-table-column>
            <el-table-column label="预警等级" align="center" prop="warningLevel" width="120">
              <template #default="scope">
                <el-tag :type="getWarningLevelTagType(scope.row.warningLevel)" effect="dark">
                  {{ getWarningLevelLabel(scope.row.warningLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <!-- <el-table-column label="预警内容" align="center" prop="warningContent" min-width="200" show-overflow-tooltip /> -->
            <el-table-column label="预警区域" align="center" prop="region" width="150">
              <template #default="{ row }">
                {{ getRegionDisplayName(row.region) }}
              </template>
            </el-table-column>
            <el-table-column label="发布时间" align="center" prop="issueTime" width="180">
              <template #default="scope">
                <span>{{ parseTime(scope.row.issueTime, '{y}-{m}-{d} {h}:{i}') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button-group>
                  <el-tooltip content="修改" placement="top">
                    <el-button
                      v-hasPermi="['disaster:warning:edit']"
                      link
                      type="primary"
                      icon="Edit"
                      @click.stop="handleUpdate(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button
                      v-hasPermi="['disaster:warning:remove']"
                      link
                      type="danger"
                      icon="Delete"
                      @click.stop="handleDelete(scope.row)"
                    ></el-button>
                  </el-tooltip>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="total > 0"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            :total="total"
            @pagination="getList"
          />
        </el-card>
      </div>

      <!-- 右侧：地图 -->
      <div class="right-panel">
        <el-card shadow="never" class="panel-card map-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">灾害分布地图</span>
              <div class="map-controls">
                <el-select v-model="selectedDisaster" placeholder="请选择灾害类型" class="disaster-select" @change="handleDisasterTypeChange">
                  <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
                <el-button type="primary" icon="Refresh" circle @click="refreshMap" />
              </div>
            </div>
          </template>

          <!-- 改动2: 统计改用 allWarnings（全部列表），并且放到地图上方（DOM 顺序改动），样式不变 -->
          <div class="map-stats-row">
            <el-card shadow="never" class="stats-card">
              <div class="stats-content">
                <div class="stats-icon" style="background-color: #f0f9eb">
                  <el-icon color="#67C23A"><Warning /></el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ minorWarnings }}</div>
                  <div class="stats-label">轻度预警</div>
                </div>
              </div>
            </el-card>
            <el-card shadow="never" class="stats-card">
              <div class="stats-content">
                <div class="stats-icon" style="background-color: #fdf6ec">
                  <el-icon color="#E6A23C"><Warning /></el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ mediumWarnings }}</div>
                  <div class="stats-label">中度预警</div>
                </div>
              </div>
            </el-card>
            <el-card shadow="never" class="stats-card">
              <div class="stats-content">
                <div class="stats-icon" style="background-color: #fef0f0">
                  <el-icon color="#F56C6C"><Warning /></el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ severeWarnings }}</div>
                  <div class="stats-label">重度预警</div>
                </div>
              </div>
            </el-card>
            <el-card shadow="never" class="stats-card">
              <div class="stats-content">
                <div class="stats-icon" style="background-color: #f0f0ff">
                  <el-icon color="#8A2BE2"><Warning /></el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ extremeWarnings }}</div>
                  <div class="stats-label">极度预警</div>
                </div>
              </div>
            </el-card>
          </div>

          <div class="map-container">
            <SoilFertilityMap
              :alert-data="filteredAlertData"
              base-stroke-color="rgba(0,123,255,0.5)"
              :level-labels="{
                minor: getDisasterLevelLabel('minor'),
                medium: getDisasterLevelLabel('medium'),
                severe: getDisasterLevelLabel('severe'),
                extreme: getDisasterLevelLabel('extreme')
              }"
              :click-labels="{
                levelLabel: '预警级别',
                contentLabel: '预警内容'
              }"
              debug-prefix="Disaster"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="600px" append-to-body class="warning-dialog">
      <el-form ref="warningFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="灾害类型" prop="disasterType">
              <el-select v-model="form.disasterType" placeholder="请选择灾害类型" class="full-width">
                <el-option v-for="dict in sys_disaster_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预警等级" prop="warningLevel">
              <el-select v-model="form.warningLevel" placeholder="请选择预警等级" class="full-width">
                <el-option v-for="dict in disaster_level" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="预警区域" prop="region">
          <el-input v-model="form.region" placeholder="请输入预警区域" />
        </el-form-item>

        <el-form-item label="发布时间" prop="issueTime">
          <el-date-picker
            v-model="form.issueTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择发布时间"
            clearable
            class="full-width"
          />
        </el-form-item>

        <el-form-item label="预警内容">
          <editor v-model="form.warningContent" :min-height="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, computed, reactive, toRefs, getCurrentInstance } from 'vue';
import { listWarning, getWarning, delWarning, addWarning, updateWarning } from '@/api/disaster/warning';
import { WarningVO, WarningQuery, WarningForm } from '@/api/disaster/warning/types';
import SoilFertilityMap from './SoilFertilityMap.vue';
import { getRegionDisplayName } from '@/components/DisasterWarning/RegionProps';
import { Warning } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { alter_status, disaster_level, sys_disaster_type } = toRefs<any>(proxy?.useDict('alter_status', 'disaster_level', 'sys_disaster_type'));

const buttonLoading = ref(false);
const loading = ref(true);
// 改动1：默认隐藏搜索栏
const showSearch = ref(false);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const warningFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const selectedDisaster = ref('0');
const warningList = ref([]);

// 保留 allWarnings（用于全量统计）——必要改动
const allWarnings = ref<Array<any>>([]);

const initFormData: WarningForm = {
  id: undefined,
  disasterType: undefined,
  warningLevel: undefined,
  warningContent: undefined,
  region: undefined,
  issueTime: undefined,
  validUntil: undefined,
  status: undefined
};

const data = reactive<PageData<WarningForm, WarningQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    disasterType: undefined,
    warningLevel: undefined,
    warningContent: undefined,
    region: undefined,
    issueTime: undefined,
    validUntil: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    disasterType: [{ required: true, message: '灾害类型不能为空', trigger: 'change' }],
    warningLevel: [{ required: true, message: '预警等级不能为空', trigger: 'change' }],
    warningContent: [{ required: true, message: '预警内容不能为空', trigger: 'blur' }],
    region: [{ required: true, message: '预警区域不能为空', trigger: 'blur' }],
    issueTime: [{ required: true, message: '发布时间不能为空', trigger: 'blur' }],
    validUntil: [{ required: true, message: '有效期至不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 计算各种统计数据（highLevelWarnings 和 todayWarnings 基于 allWarnings，以下也改为 allWarnings）
const highLevelWarnings = computed(() => {
  const extremeCodes = new Set([3, 7, 11]);
  return (allWarnings.value || []).filter((w) => {
    const level = Number(w.warningLevel);
    const type = String(w.disasterType);
    return extremeCodes.has(level) && ['0', '1', '2'].includes(type);
  }).length;
});

const todayWarnings = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return (allWarnings.value || []).filter((w) => String(w.issueTime || '').startsWith(today)).length;
});

// 改动2：把以下四个统计也改为基于 allWarnings（你要求：地图下面的统计改为 all list）
const minorWarnings = computed(() => {
  return (allWarnings.value || []).filter((warning) => ['0', '4', '8'].includes(String(warning.warningLevel))).length;
});

const mediumWarnings = computed(() => {
  return (allWarnings.value || []).filter((warning) => ['1', '5', '9'].includes(String(warning.warningLevel))).length;
});

const severeWarnings = computed(() => {
  return (allWarnings.value || []).filter((warning) => ['2', '6', '10'].includes(String(warning.warningLevel))).length;
});

const extremeWarnings = computed(() => {
  return (allWarnings.value || []).filter((warning) => ['3', '7', '11'].includes(String(warning.warningLevel))).length;
});

// 根据选择的灾害类型过滤预警数据（保持使用当前页数据，未改）
const filteredAlertData = computed(() => {
  const filtered = warningList.value.filter((warning) => warning.disasterType === selectedDisaster.value);
  console.log('父组件数据过滤:', {
    selectedDisaster: selectedDisaster.value,
    totalWarnings: warningList.value.length,
    filteredCount: filtered.length,
    filtered
  });
  return filtered;
});

// 根据灾害类型获取对应的预警级别标签
const getDisasterLevelLabel = (level: string) => {
  const levelMaps = {
    '0': {
      // 旱灾
      minor: '轻旱',
      medium: '中旱',
      severe: '重旱',
      extreme: '极旱'
    },
    '1': {
      // 洪涝
      minor: '一般洪涝',
      medium: '较大洪涝',
      severe: '重大洪涝',
      extreme: '特别重大洪涝'
    },
    '2': {
      // 冰雹
      minor: '轻度冰雹',
      medium: '中度冰雹',
      severe: '重度冰雹',
      extreme: '特重冰雹'
    }
  };

  return levelMaps[selectedDisaster.value]?.[level] || `${level}预警`;
};

/** 查询灾害预警信息列表
 *  - 获取当前页（用于表格），并尽量请求全部（pageSize=total）用于统计 allWarnings
 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await listWarning(queryParams.value);
    const rows = res?.rows || [];
    // 本地按时间降序展示
    rows.sort((a: any, b: any) => {
      const ta = a?.issueTime ? new Date(a.issueTime).getTime() : 0;
      const tb = b?.issueTime ? new Date(b.issueTime).getTime() : 0;
      return tb - ta;
    });
    warningList.value = rows;
    total.value = res?.total ?? rows.length;

    // 尝试拉取全部用于统计（容错）
    if (res && typeof res.total === 'number' && res.total > rows.length) {
      try {
        const allRes = await listWarning({ ...queryParams.value, pageNum: 1, pageSize: res.total });
        const allRows = allRes?.rows || [];
        allRows.sort((a: any, b: any) => {
          const ta = a?.issueTime ? new Date(a.issueTime).getTime() : 0;
          const tb = b?.issueTime ? new Date(b.issueTime).getTime() : 0;
          return tb - ta;
        });
        allWarnings.value = allRows;
      } catch (e) {
        // 后端不支持一次性获取所有数据，兜底使用当前页数据
        allWarnings.value = rows.slice();
      }
    } else {
      allWarnings.value = rows.slice();
    }
  } finally {
    loading.value = false;
  }
};

const handleDisasterTypeChange = async () => {
  // 更新查询参数
  queryParams.value.disasterType = selectedDisaster.value;
  await getList();
};

const refreshMap = () => {
  getList();
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  warningFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: WarningVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加灾害预警信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: WarningVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getWarning(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改灾害预警信息';
};

/** 提交按钮 */
const submitForm = () => {
  warningFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        if (form.value.id) {
          await updateWarning(form.value);
        } else {
          await addWarning(form.value);
        }
        proxy?.$modal.msgSuccess('操作成功');
        dialog.visible = false;
        await getList();
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: WarningVO) => {
  const _ids = row?.id || ids.value;
  try {
    await proxy?.$modal.confirm('是否确认删除灾害预警信息编号为"' + _ids + '"的数据项？');
    await delWarning(_ids);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } catch {
    // 用户取消删除
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'disaster/warning/export',
    {
      ...queryParams.value
    },
    `warning_${new Date().getTime()}.xlsx`
  );
};

const handleRowClick = (row: any) => {
  // 设置灾害类型并刷新数据
  selectedDisaster.value = row.disasterType;
  queryParams.value.disasterType = row.disasterType;
  getList();
};

// 监听selectedDisaster变化，确保地图数据更新
watch(
  selectedDisaster,
  (newType, oldType) => {
    console.log('灾害类型切换:', { oldType, newType });
  },
  { immediate: true }
);

onMounted(async () => {
  await getList();
});

// 获取预警等级标签颜色类型 - 修复语义问题
const getWarningLevelTagType = (warningLevel: string | number) => {
  // 将预警等级转换为数字进行比较
  const level = typeof warningLevel === 'string' ? parseInt(warningLevel) : warningLevel;

  // 根据预警等级返回对应的ElTag类型
  // 99 = 正常/无灾情 -> success(绿色)
  // 0,4,8 = 轻度预警 -> info(蓝色)
  // 1,5,9 = 中度预警 -> warning(黄色)
  // 2,6,10 = 重度预警 -> danger(红色)
  // 3,7,11 = 极度预警 -> danger(红色)
  switch (level) {
    case 99:
      return 'success'; // 绿色 - 正常/无灾情
    case 0:
    case 4:
    case 8:
      return 'primary'; // 蓝色 - 轻度预警
    case 1:
    case 5:
    case 9:
      return 'warning'; // 黄色 - 中度预警
    case 2:
    case 6:
    case 10:
      return 'danger';
    case 3:
    case 7:
    case 11:
      return 'danger'; // 红色 - 重度/极度预警
    default:
      return 'success'; // 默认绿色
  }
};

// 获取预警等级标签文本
const getWarningLevelLabel = (warningLevel: string | number) => {
  // 首先尝试从原始字典中获取标签
  const dictItem = disaster_level.value?.find((item) => item.value == warningLevel);
  if (dictItem) {
    return dictItem.label;
  }

  // 如果字典中没有找到，使用默认映射
  const level = typeof warningLevel === 'string' ? parseInt(warningLevel) : warningLevel;

  switch (level) {
    case 99:
      return '正常';
    case 0:
    case 4:
    case 8:
      return '轻度预警';
    case 1:
    case 5:
    case 9:
      return '中度预警';
    case 2:
    case 6:
    case 10:
      return '重度预警';
    case 3:
    case 7:
    case 11:
      return '极度预警';
    default:
      return '未知等级';
  }
};
</script>

<style scoped lang="scss">
.disaster-dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.dashboard-header {
  /* -> 只改了这里：背景改为白色（你说只要白色），其它没动 */
  background-color: #ffffff;
  color: #fff; /* 显示数值的颜色在子元素里会覆盖为深色，保留整体样式 */
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
      color: #2d3a4b; /* 标题采用深色，确保在白底上可读 */
    }

    .stats-container {
      display: flex;
      gap: 20px;

      .stat-card {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px 20px;
        text-align: center;
        min-width: 100px;

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 4px;
          color: #2d3a4b; /* 数值也用深色展示 */
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.9;
          color: #6b7280;
        }
      }
    }
  }
}

.dashboard-content {
  display: flex;
  flex: 1;
  gap: 20px;
  min-height: 0;
}

.left-panel {
  flex: 1 1 54%; /* 修改这里，增加左侧占比 */
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.right-panel {
  flex: 1 1 46%; /* 修改这里，减少右侧占比 */
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.panel-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #e6ebf5;
  }

  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    min-height: 0;
  }
}

.map-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #2d3a4b;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .map-controls {
    display: flex;
    align-items: center;
    gap: 10px;

    .disaster-select {
      width: 200px;
    }
  }
}

.search-container {
  padding: 16px 20px;
  background-color: #f9fafc;
  border-bottom: 1px solid #e6ebf5;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.warning-table {
  flex: 1;
  width: 100%;
  border: none;

  :deep(.el-table__header) {
    th {
      background-color: #f5f7fa;
      font-weight: 600;
      color: #2d3a4b;
    }
  }

  :deep(.el-table__row) {
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

/* map-stats-row 样式保持不变（我们只是移动了它的 DOM 顺序） */
.map-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 12px;
  background: transparent;
}
.stats-card {
  border-radius: 8px;
  overflow: hidden;
}
.stats-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}
.stats-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stats-info .stats-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 2px;
}
.stats-info .stats-label {
  font-size: 12px;
  color: #909399;
}

.map-container {
  flex: 1;
  min-height: 400px;
  position: relative;
}

.warning-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #e6ebf5;
    padding: 16px 20px;
    margin: 0;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid #e6ebf5;
    padding: 16px 20px;
  }

  .full-width {
    width: 100%;
  }
}

@media (max-width: 1200px) {
  .dashboard-content {
    flex-direction: column;
  }

  .map-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      .stats-container {
        width: 100%;
        justify-content: space-between;
      }
    }
  }

  .map-stats-row {
    grid-template-columns: 1fr;
  }
}
/* === 紧凑型统计卡片：把四个小格子变短 === */
.map-stats-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)); /* 保持四列但允许收缩 */
  gap: 12px;
  padding: 8px 12px; /* 减少外边距 */
  align-items: start; /* 让卡片靠上排列，避免垂直拉伸 */
}

/* 限制单格最大宽度，避免在超宽屏幕被拉得太长 */
.map-stats-row .stats-card {
  min-height: 64px; /* 卡片最小高度，变短 */
  max-height: 80px; /* 可选：强制最大高度 */
  max-width: 220px; /* 防止超宽显示（可根据需要调整） */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px; /* 缩小内边距 */
  box-sizing: border-box;
}

/* 卡片内部内容更紧凑 */
.stats-content {
  display: flex;
  align-items: center;
  gap: 8px; /* 缩小图标与文字间距 */
  width: 100%;
}

/* 图标微缩 */
.stats-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 32px;
}

/* 数字与标签字号微调 */
.stats-info .stats-value {
  font-size: 16px; /* 原来 18 -> 16 */
  font-weight: 700;
  line-height: 1;
}
.stats-info .stats-label {
  font-size: 12px;
  color: #909399;
  line-height: 1;
}

/* 响应式：窄屏时改为两列或一列 */
@media (max-width: 1200px) {
  .map-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .map-stats-row {
    grid-template-columns: 1fr;
  }
}
/* ===== 把统计卡片里的 label 固定到卡片底部，水平居中 ===== */
.map-stats-row .stats-card {
  position: relative; /* 让内部 label 能绝对定位到底部 */
  padding: 0px 8px 8px; /* 底部留出空间给 label */
  min-height: 64px;
  max-height: 88px;
  display: flex;
  align-items: flex-start; /* 顶部对齐图标/数字 */
  box-sizing: border-box;
}

/* 保持上方内容水平排列（图标 + 数字） */
.map-stats-row .stats-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  /* 让上方内容尽量靠上，label 在底部 */
}

/* 数字样式微调，垂直居中上方区域 */
.map-stats-row .stats-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

/* 关键：把 label 绝对定位到卡片底部中央 */
.map-stats-row .stats-info .stats-label {
  position: absolute;
  left: 50%;
  bottom: 8px; /* 距离卡片底部 8px，可根据喜好调整 */
  transform: translateX(-50%);
  margin: 0;
  white-space: nowrap; /* 标签横向显示，不换行 */
  font-size: 12px;
  color: #909399;
  line-height: 1;
  background: transparent;
  padding: 0 6px; /* 轻微内边距，避免紧贴边缘 */
  pointer-events: none; /* 避免对 label 的鼠标事件干扰 */
}

/* 确保数值在上方不会被 label 遮挡 */
.map-stats-row .stats-info .stats-value {
  margin-bottom: 0;
  font-size: 16px;
  font-weight: 700;
}

/* 增加“新增 / 导出 / 删除”按钮组的间距（只改样式） */
.card-header .card-actions {
  display: flex;
  align-items: center;
  gap: 12px; /* 整体动作区间距，加大一点 */
}

/* 如果你使用了按钮组 (<el-button-group>)，为按钮内部增加右边距 */
.card-header .card-actions .el-button-group .el-button {
  margin-right: 10px; /* 单个按钮的右侧间距（视觉上更宽松） */
}

/* 如果你使用了自定义 .btn-row / .action-btn 的类（兼容之前不同版本），也覆盖 */
.card-header .card-actions .btn-row {
  display: flex;
  gap: 10px;
}
.card-header .card-actions .btn-row .action-btn {
  margin-right: 0; /* 已用 gap 管理间距，避免重复边距 */
}

/* 响应式：窄屏时减小间距 */
@media (max-width: 600px) {
  .card-header .card-actions {
    gap: 8px;
  }
  .card-header .card-actions .el-button-group .el-button {
    margin-right: 6px;
  }
}
/* ===== 给顶部操作按钮（新增/导出/删除 等）加边框 ===== */
/* 覆盖 element-plus plain 按钮，让它们有统一边框样式 */
.card-header .card-actions .el-button,
.card-header .card-actions .el-button-group .el-button,
.card-header .card-actions .btn-row .action-btn {
  border: 1px solid rgba(0, 0, 0, 0.08); /* 可见浅色边框 */
  box-shadow: none;
  background: transparent; /* 保持 plain 风格 */
  color: inherit;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

/* 更明显的边框用于强调（例如浅主题）——可选：鼠标悬停时高亮边框 */
.card-header .card-actions .el-button:hover,
.card-header .card-actions .el-button-group .el-button:hover,
.card-header .card-actions .btn-row .action-btn:hover {
  border-color: rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}

/* 针对不同类型按钮（primary / warning / danger）做轻微颜色区分的边框 */
.card-header .card-actions .el-button[type='primary'],
.card-header .card-actions .el-button-group .el-button[type='primary'],
.card-header .card-actions .btn-row .action-btn[type='primary'] {
  border-color: rgba(30, 136, 229, 0.18);
}
.card-header .card-actions .el-button[type='warning'],
.card-header .card-actions .el-button-group .el-button[type='warning'],
.card-header .card-actions .btn-row .action-btn[type='warning'] {
  border-color: rgba(240, 205, 46, 0.18);
}
.card-header .card-actions .el-button[type='danger'],
.card-header .card-actions .el-button-group .el-button[type='danger'],
.card-header .card-actions .btn-row .action-btn[type='danger'] {
  border-color: rgba(245, 108, 108, 0.18);
}

/* 保证在深色/主题下也能看到（增加优先级，必要时可用 !important） */
.card-header .card-actions .el-button,
.card-header .card-actions .el-button-group .el-button,
.card-header .card-actions .btn-row .action-btn {
  -webkit-appearance: none;
}

/* 响应式：窄屏减小 padding */
@media (max-width: 600px) {
  .card-header .card-actions .el-button,
  .card-header .card-actions .el-button-group .el-button,
  .card-header .card-actions .btn-row .action-btn {
    padding: 6px 8px;
  }
}
/* 稍微矮一点（建议） */
.dashboard-header {
  background-color: #ecf7ff; /* 保持白色或你想要的背景 */
  border-radius: 8px;
  height: 80px; /* 固定高度 72px */
  padding: 0 20px; /* 左右留白，垂直用 height 控制 */
  margin-bottom: 16px;
  display: flex;
  align-items: center; /* 垂直居中 header 内容 */
  box-shadow: 0 2px 8px rgba(238, 107, 107, 0.06);
  overflow: hidden;
}

.dashboard-header .header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center; /* 确保左右两边垂直居中 */
}

.dashboard-header .title {
  font-size: 18px;
  margin: 0;
  line-height: 1;
}
</style>
