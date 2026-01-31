<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import useUserStore from '@/store/modules/user';
import {
  useDisasterInsights,
  HAZARD_META,
  REGION_NAME_MAP,
  INDEX_NAME_TO_HAZARD,
  evaluateIndexLevel,
  normalizeAreaKey
} from '../hooks/useDisasterInsights';
import type { HazardKey } from '../hooks/useDisasterInsights';
import type { WarningVO } from '@/api/disaster/warning/types';
import type { IndexVO } from '@/api/disaster/index/types';

const { warnings, indexes, loadAll, loading } = useDisasterInsights();
const userStore = useUserStore();
const isAdminUser = computed(() => (userStore.name || userStore.nickname) === 'admin');

const normalizeHazard = (val: any): HazardKey => {
  const key = String(val ?? '').trim();
  if (key === '1') return '1';
  if (key === '2') return '2';
  return '0';
};

const formatDateTime = (input: any) => {
  if (input == null) return '';
  if (typeof input === 'number') {
    const ts = input > 1e12 ? input : input * 1000;
    return new Date(ts).toLocaleString('zh-CN', { hour12: false });
  }
  const normalized = String(input).replace(/-/g, '/');
  const ts = new Date(normalized).getTime();
  if (!ts || Number.isNaN(ts)) return String(input);
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
};

const hazardOptions = [
  { value: '', label: '全部灾害' },
  { value: '0', label: '旱灾' },
  { value: '1', label: '洪涝' },
  { value: '2', label: '冰雹' }
];

const BASE_COLORS = ['#409EFF', '#67C23A', '#00A22F', '#F56C6C', '#8E6DEB', '#00B8A9', '#FF9F43', '#FF90FF', '#0FccFF'];
const BASE_COLOR_MAP: Record<string, string> = Object.fromEntries(
  Object.keys(REGION_NAME_MAP).map((code, idx) => [code, BASE_COLORS[idx % BASE_COLORS.length]])
);
const baseColorFor = (code: string) => BASE_COLOR_MAP[code] || '#909399';
const indexColorFor = (hazard: HazardKey) => HAZARD_META[hazard]?.color || '#909399';

const WARNING_LEVELS_BY_HAZARD: Record<HazardKey, Array<{ value: number; label: string; color: string }>> = {
  '0': [
    { value: 4, label: '轻旱', color: '#409EFF' }, // 1级 灰
    { value: 5, label: '中旱', color: '#E6A23C' }, // 2级 黄
    { value: 6, label: '重旱', color: '#d46b08' }, // 3级 橙
    { value: 7, label: '特旱', color: '#d93025' } // 4级 红
  ],
  '1': [
    { value: 8, label: '一般洪涝', color: '#409EFF' },
    { value: 9, label: '较大洪涝', color: '#E6A23C' },
    { value: 10, label: '重大洪涝', color: '#d46b08' },
    { value: 11, label: '特别重大洪涝', color: '#d93025' }
  ],
  '2': [
    { value: 0, label: '轻度冰雹', color: '#409EFF' },
    { value: 1, label: '中度冰雹', color: '#E6A23C' },
    { value: 2, label: '重度冰雹', color: '#d46b08' },
    { value: 3, label: '特重冰雹', color: '#d93025' }
  ]
};

const hazardTagType = (hazard: HazardKey) => {
  if (hazard === '0') return 'warning';
  if (hazard === '1') return 'primary';
  return 'danger';
};

const mapWarningLevel = (hazard: HazardKey, level: any) => {
  const val = Number(level);
  if (!Number.isNaN(val)) {
    if (val === 99) return { label: '正常', color: '#67C23A', value: 99 };
    const defs = WARNING_LEVELS_BY_HAZARD[hazard] || [];
    const match = defs.find((item) => item.value === val);
    if (match) return { label: match.label, color: match.color, value: val };
    return { label: '正常', color: '#67C23A', value: 99 };
  }
  const text = String(level || '').trim();
  const defs = WARNING_LEVELS_BY_HAZARD[hazard] || [];
  const matchByLabel = defs.find((item) => item.label === text);
  if (matchByLabel) return { label: matchByLabel.label, color: matchByLabel.color, value: matchByLabel.value };
  if (/正常/.test(text)) return { label: '正常', color: '#67C23A', value: 99 };
  return { label: text || '-', color: '#909399', value: null };
};

const warningLevelTagStyle = (color: string) => ({
  fontSize: '14px',
  padding: '2px 12px',
  borderRadius: '8px',
  color,
  background: `${color}15`,
  borderColor: `${color}40`
});

const mapIndexLevel = (hazard: HazardKey, label: string) => {
  if (/正常|未定义/.test(label || '')) return { label: label || '正常', color: '#67C23A' };
  const defs = WARNING_LEVELS_BY_HAZARD[hazard] || [];
  const match = defs.find((item) => item.label === label);
  if (match) return { label: match.label, color: match.color };
  return { label: label || '-', color: '#909399' };
};

const mapRegionLabel = (region: any) => {
  const code = normalizeAreaKey(region);
  return REGION_NAME_MAP[code] || region || '-';
};

const regionTagStyle = (color: string) => ({
  fontSize: '14px',
  padding: '2px 12px',
  borderRadius: '8px',
  color,
  background: `${color}15`,
  borderColor: `${color}40`
});

const warningTableData = computed(() =>
  warnings.value.map((item: WarningVO) => {
    const hazard = normalizeHazard((item as any)?.disasterType);
    const levelInfo = mapWarningLevel(hazard, item.warningLevel);
    const regionCode = normalizeAreaKey(item.region);
    return {
      ...item,
      hazard,
      hazardLabel: HAZARD_META[hazard]?.label || item.disasterType,
      warningLevelLabel: levelInfo.label,
      warningLevelColor: levelInfo.color,
      warningLevelValue: levelInfo.value,
      regionLabel: mapRegionLabel(item.region),
      regionColor: baseColorFor(regionCode),
      statusLabel: Number(item.status) === 1 ? '生效中' : '已解除',
      issueTimeText: formatDateTime(item.issueTime),
      validUntilText: formatDateTime(item.validUntil)
    };
  })
);

const indexTableData = computed(() =>
  indexes.value.map((item: IndexVO) => {
    const hazard = INDEX_NAME_TO_HAZARD[String(item.indexName || '').toUpperCase()] ?? normalizeHazard((item as any)?.disasterType);
    const baseCode = normalizeAreaKey((item as any)?.detectionArea);
    const levelInfo = mapIndexLevel(hazard, evaluateIndexLevel(item));
    const idxName = String(item.indexName || '');
    return {
      ...item,
      hazard,
      hazardLabel: HAZARD_META[hazard]?.label || item.disasterType,
      baseCode,
      baseLabel: REGION_NAME_MAP[baseCode] || item.detectionArea || baseCode,
      baseColor: baseColorFor(baseCode),
      levelLabel: levelInfo.label,
      levelColor: levelInfo.color,
      indexColor: indexColorFor(hazard),
      createTimeText: formatDateTime((item as any)?.createTime)
    };
  })
);

const tableHeaderStyle = { background: '#f8fafc', color: '#303133', fontWeight: 600 };
const tableCellStyle = { color: '#303133' };
const indexRowClassName = () => '';

const activeTab = ref<'warning' | 'index'>('warning');

const warningFilters = ref({ hazard: '', level: '', keyword: '', dateRange: [] as string[] });
const indexFilters = ref({ hazard: '', base: '', indexName: '', dateRange: [] as string[] });
const warningPagination = ref({ page: 1, size: 10 });
const indexPagination = ref({ page: 1, size: 10 });

const parseToMs = (input: any) => {
  if (!input) return 0;
  if (typeof input === 'number') return input > 1e12 ? input : input * 1000;
  const normalized = String(input).replace(/-/g, '/');
  const ts = new Date(normalized).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

const filteredWarnings = computed(() => {
  return warningTableData.value.filter((row) => {
    if (warningFilters.value.hazard && row.hazard !== warningFilters.value.hazard) return false;
    const hasLevelFilter = warningFilters.value.level !== null && warningFilters.value.level !== undefined && warningFilters.value.level !== '';
    if (hasLevelFilter && String(row.warningLevelValue ?? row.warningLevel) !== String(warningFilters.value.level)) return false;
    if (warningFilters.value.dateRange?.length === 2) {
      const [start, end] = warningFilters.value.dateRange;
      const ts = parseToMs((row as any)?.issueTime || row.issueTimeText);
      const startMs = parseToMs(`${start} 00:00:00`);
      const endMs = parseToMs(`${end} 23:59:59`);
      if (!ts || ts < startMs || ts > endMs) return false;
    }
    if (warningFilters.value.keyword) {
      const kw = warningFilters.value.keyword.trim();
      if (!`${row.warningContent || ''}${row.regionLabel || ''}`.includes(kw)) return false;
    }
    return true;
  });
});

const filteredIndexes = computed(() => {
  return indexTableData.value.filter((row) => {
    if (indexFilters.value.hazard && row.hazard !== indexFilters.value.hazard) return false;
    if (indexFilters.value.base && row.baseCode !== indexFilters.value.base) return false;
    if (indexFilters.value.indexName && String(row.indexName || '').toUpperCase() !== String(indexFilters.value.indexName).toUpperCase())
      return false;
    if (indexFilters.value.dateRange?.length === 2) {
      const [start, end] = indexFilters.value.dateRange;
      const ts = parseToMs((row as any)?.createTime || row.createTimeText);
      const startMs = parseToMs(`${start} 00:00:00`);
      const endMs = parseToMs(`${end} 23:59:59`);
      if (!ts || ts < startMs || ts > endMs) return false;
    }
    return true;
  });
});

const warningPaged = computed(() => {
  const start = (warningPagination.value.page - 1) * warningPagination.value.size;
  return filteredWarnings.value.slice(start, start + warningPagination.value.size);
});

const indexPaged = computed(() => {
  const start = (indexPagination.value.page - 1) * indexPagination.value.size;
  return filteredIndexes.value.slice(start, start + indexPagination.value.size);
});

const indexBaseOptions = computed(() => {
  const set = new Set<string>();
  indexTableData.value.forEach((row) => {
    if (row.baseCode) set.add(row.baseCode);
  });
  return Array.from(set).map((code) => ({
    value: code,
    label: REGION_NAME_MAP[code] || code
  }));
});

const resetWarningFilters = () => {
  warningFilters.value = { hazard: '', level: '', keyword: '', dateRange: [] };
  warningPagination.value.page = 1;
};

const resetIndexFilters = () => {
  indexFilters.value = { hazard: '', base: '', indexName: '', dateRange: [] };
  indexPagination.value.page = 1;
};

const warningLevelOptions = computed(() => {
  const hazard = warningFilters.value.hazard as HazardKey | '';
  const list: Array<{ value: number; label: string }> = [];
  if (hazard && WARNING_LEVELS_BY_HAZARD[hazard]) {
    list.push(...WARNING_LEVELS_BY_HAZARD[hazard].map((item) => ({ value: item.value, label: item.label })));
  } else {
    // 未选择灾害类型时，合并所有并去重
    const set = new Map<number, string>();
    (['0', '1', '2'] as HazardKey[]).forEach((key) => {
      (WARNING_LEVELS_BY_HAZARD[key] || []).forEach((item) => set.set(item.value, item.label));
    });
    list.push(...Array.from(set.entries()).map(([value, label]) => ({ value, label })));
  }
  list.sort((a, b) => a.value - b.value);
  // 永远追加“正常”
  list.unshift({ value: 99, label: '正常' });
  return list;
});

const indexNameOptions = computed(() => {
  const set = new Set<string>();
  indexTableData.value.forEach((row) => {
    if (row.indexName) set.add(String(row.indexName).toUpperCase());
  });
  return Array.from(set).map((name) => ({ value: name, label: name }));
});

onMounted(() => {
  loadAll(true);
});
</script>

<template>
  <div class="table-page">
    <div class="filter-bar">
      <template v-if="activeTab === 'warning'">
        灾害类型：<el-select
          v-model="warningFilters.hazard"
          clearable
          placeholder="请选择灾害类型"
          size="small"
          style="width: 160px"
          @change="warningPagination.page = 1"
        >
          <el-option v-for="opt in hazardOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;预警等级：<el-select
          v-model="warningFilters.level"
          clearable
          placeholder="请选择预警等级"
          size="small"
          style="width: 200px"
          @change="warningPagination.page = 1"
        >
          <el-option v-for="opt in warningLevelOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;预警内容/区域：<el-input
          v-model="warningFilters.keyword"
          placeholder="请输入预警内容/区域"
          size="small"
          clearable
          style="width: 220px"
          @input="warningPagination.page = 1"
        />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;灾害时间：<el-date-picker
          v-model="warningFilters.dateRange"
          type="daterange"
          size="small"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="warningPagination.page = 1"
        />

        <el-button size="small" icon="Refresh" @click="resetWarningFilters">重置</el-button>
      </template>
      <template v-else>
        灾害类型：<el-select
          v-model="indexFilters.hazard"
          clearable
          placeholder="请选择灾害类型"
          size="small"
          style="width: 160px"
          @change="indexPagination.page = 1"
        >
          <el-option v-for="opt in hazardOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;基地名称：<el-select
          v-if="isAdminUser"
          v-model="indexFilters.base"
          clearable
          placeholder="请选择基地名称"
          size="small"
          style="width: 200px"
          @change="indexPagination.page = 1"
        >
          <el-option v-for="opt in indexBaseOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;指数名称：<el-select
          v-model="indexFilters.indexName"
          clearable
          placeholder="请选择指数名称"
          size="small"
          style="width: 180px"
          @change="indexPagination.page = 1"
        >
          <el-option v-for="opt in indexNameOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;指数时间：<el-date-picker
          v-model="indexFilters.dateRange"
          type="daterange"
          size="small"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="indexPagination.page = 1"
        />
        <el-button size="small" icon="Refresh" @click="resetIndexFilters">重置</el-button>
      </template>
    </div>

    <div class="single-card">
      <el-card v-if="activeTab === 'warning'" class="table-card" shadow="hover" :body-style="{ padding: '0 0 16px 0' }" v-loading="loading">
        <template #header>
          <div class="card-header header-with-pager">
            <div class="title-area">
              <el-radio-group v-model="activeTab" size="small" class="inline-switch">
                <el-radio-button label="warning">预警信息</el-radio-button>
                <el-radio-button label="index">指数信息</el-radio-button>
              </el-radio-group>
              <!-- <span>预警数据</span>
              <span class="count-pill">共 {{ warningTableData.length }} 条</span> -->
            </div>
          </div>
        </template>
        <el-table
          :data="warningPaged"
          height="calc(100vh - 300px)"
          border
          stripe
          size="small"
          class="pretty-table"
          header-align="center"
          align="center"
          :header-cell-style="tableHeaderStyle"
          :cell-style="tableCellStyle"
          empty-text="暂无预警数据"
        >
          <el-table-column prop="hazardLabel" label="灾害类型" width="150">
            <template #default="scope">
              <el-tag :type="hazardTagType(scope.row.hazard)" effect="plain" disable-transitions>{{ scope.row.hazardLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="warningLevelLabel" label="预警等级" width="300">
            <template #default="scope">
              <el-tag :style="warningLevelTagStyle(scope.row.warningLevelColor)" effect="plain" disable-transitions>
                {{ scope.row.warningLevelLabel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="warningContent" label="预警内容" min-width="180" />
          <el-table-column prop="regionLabel" label="预警区域" width="300">
            <template #default="scope">
              <el-tag :style="regionTagStyle(scope.row.regionColor)" effect="plain" disable-transitions>
                {{ scope.row.regionLabel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="issueTimeText" label="发布时间" width="300" />
        </el-table>
        <div class="pager">
          <el-pagination
            v-model:current-page="warningPagination.page"
            v-model:page-size="warningPagination.size"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            :total="filteredWarnings.length"
            background
          />
        </div>
      </el-card>

      <el-card v-else class="table-card" shadow="hover" :body-style="{ padding: '0 0 16px 0' }" v-loading="loading">
        <template #header>
          <div class="card-header header-with-pager">
            <div class="title-area">
              <el-radio-group v-model="activeTab" size="small" class="inline-switch">
                <el-radio-button label="warning">预警信息</el-radio-button>
                <el-radio-button label="index">指数信息</el-radio-button>
              </el-radio-group>
              <!-- <span>指数数据</span>
              <span class="count-pill">共 {{ indexTableData.length }} 条</span> -->
            </div>
          </div>
        </template>
        <el-table
          :data="indexPaged"
          height="calc(100vh - 300px)"
          border
          stripe
          size="small"
          class="pretty-table"
          header-align="center"
          align="center"
          :header-cell-style="tableHeaderStyle"
          :cell-style="tableCellStyle"
          :row-class-name="indexRowClassName"
          empty-text="暂无指数数据"
        >
          <el-table-column prop="hazardLabel" label="灾害类型" width="150">
            <template #default="scope">
              <el-tag :type="hazardTagType(scope.row.hazard)" effect="plain" disable-transitions>{{ scope.row.hazardLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="baseLabel" label="检测区域" min-width="200">
            <template #default="scope">
              <el-tag :style="regionTagStyle(scope.row.baseColor)" effect="plain" disable-transitions>
                {{ scope.row.baseLabel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="indexName" label="指数名称" width="220">
            <template #default="scope">
              <el-tag :style="regionTagStyle(scope.row.indexColor)" effect="plain" disable-transitions>
                {{ scope.row.indexName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="indexValue" label="指数值" width="180" />
          <!-- <el-table-column prop="indexUnit" label="单位" width="105" /> -->
          <el-table-column prop="levelLabel" label="指数等级" width="220">
            <template #default="scope">
              <el-tag :style="warningLevelTagStyle(scope.row.levelColor)" effect="plain" disable-transitions>
                {{ scope.row.levelLabel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTimeText" label="创建时间" width="300" />
        </el-table>
        <div class="pager">
          <el-pagination
            v-model:current-page="indexPagination.page"
            v-model:page-size="indexPagination.size"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            :total="filteredIndexes.length"
            background
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-page {
  padding: 16px;
  background: #f5f7fb;
  min-height: calc(100vh - 84px);
  box-sizing: border-box;
}

.tab-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .counts {
    font-size: 13px;
    color: #606266;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .count-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    background: #eef2ff;
    border: 1px solid #dce2ff;
    color: #4a5bdc;
    font-weight: 600;
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e6eaf1;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(31, 45, 61, 0.05);
}

.single-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(31, 45, 61, 0.08);
  border: 1px solid #e6eaf1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #303133;
  font-size: 16px;

  .sub {
    margin-left: 8px;
    font-size: 12px;
    font-weight: 400;
    color: #909399;
  }
}

.header-with-pager {
  gap: 12px;
  flex-wrap: wrap;

  .title-area {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .inline-switch {
    :deep(.el-radio-button__inner) {
      padding: 6px 12px;
    }
  }

  :deep(.el-pagination) {
    padding: 0;

    .el-pagination__total {
      font-size: 13px;
    }

    .el-select .el-input__inner {
      font-size: 13px;
    }
  }
}

.count-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #eef2ff;
  border: 1px solid #dce2ff;
  color: #4a5bdc;
  font-weight: 600;
  font-size: 13px;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-input__inner),
:deep(.el-select__selected-item),
:deep(.el-select__placeholder),
:deep(.el-radio-button__inner),
:deep(.el-button--small) {
  font-size: 16px;
}

:deep(.el-range-editor .el-range-input),
:deep(.el-range-editor .el-range-separator) {
  font-size: 14px;
}

:deep(.pretty-table) {
  border-radius: 10px;
  overflow: hidden;

  .el-table__header-wrapper th {
    background: linear-gradient(90deg, #f5f7fb, #eef3fb);
    color: #303133;
    font-weight: 600;
    font-size: 16px;
    text-align: center;
  }

  .el-table__body-wrapper td {
    padding: 12px 12px;
    font-size: 14px;
    text-align: center;
  }

  tr.el-table__row:nth-child(2n) > td {
    background: #fbfcff;
  }

  tr.el-table__row:hover > td {
    background: #f0f5ff !important;
  }

  .el-tag {
    border-radius: 6px;
    font-weight: 600;
  }
}

:deep(.row-high-risk) {
  background: linear-gradient(90deg, rgba(255, 111, 97, 0.08), rgba(255, 193, 7, 0.08));
}

:deep(.el-table__body tr:hover > td) {
  background-color: #f7f9fc !important;
}
</style>
