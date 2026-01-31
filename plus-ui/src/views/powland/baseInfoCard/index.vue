<template>
  <div class="p-2 base-card-page">
    <!-- 搜索区 -->
    <transition v-has-roles="['superadmin', 'sysadmin']">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="基地名称" prop="baseName">
              <el-select v-model="queryParams.baseName" placeholder="请选择基地名称" clearable>
                <el-option v-for="item in baseNameOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="基地类型" prop="baseType">
              <el-select v-model="queryParams.baseType" placeholder="请选择基地类型" clearable>
                <el-option v-for="dict in base_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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

    <!-- 卡片列表 -->
    <el-card shadow="never">
      <template #header>
        <div class="toolbar">
          <div class="left">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['powland:baseInfo:add']">新增</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['powland:baseInfo:edit']"
              >修改</el-button
            >
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['powland:baseInfo:remove']"
              >删除</el-button
            >
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['powland:baseInfo:export']">导出</el-button>
          </div>
          <div class="right">
            <el-button circle text title="放大" icon="ZoomIn" />
            <el-button circle text title="刷新" icon="RefreshRight" @click="resetQuery" />
          </div>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col v-for="item in baseInfoList" :key="item.baseId" :xs="24" :sm="24" :md="12" :lg="12" :xl="8" class="mb-4">
          <el-card shadow="hover" class="base-card">
            <div class="cover">
              <el-image :src="item.basePhoto" fit="cover" :preview-src-list="[item.basePhoto]" />
              <el-tag class="type-tag" type="success" effect="dark">
                {{ getBaseTypeLabel(item.baseType) }}
              </el-tag>
            </div>

            <div class="content">
              <div class="title">{{ item.baseName }}</div>
              <div class="meta">
                <div class="line">
                  <span class="label">所在村</span>
                  <span class="value">{{ item.baseLocation }}</span>
                </div>
                <div class="line">
                  <span class="label">基地面积</span>
                  <span class="value">{{ item.baseArea }} 亩</span>
                </div>
                <div class="line">
                  <span class="label">经纬度</span>
                  <span class="value">{{ item.lng }}，{{ item.lat }}</span>
                </div>
                <div class="line" v-if="item.remark">
                  <span class="label">基地简介</span>
                  <span class="value" v-html="item.remark"></span>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="actions">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(item)" v-hasPermi="['powland:baseInfo:edit']">修改</el-button>
                <el-button link type="danger" icon="Delete" @click="handleDelete(item)" v-hasPermi="['powland:baseInfo:remove']">删除</el-button>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <pagination v-show="total > 10" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 添加或修改基地信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="baseInfoCardFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="基地名称" prop="baseName">
          <el-input v-model="form.baseName" placeholder="请输入基地名称" />
        </el-form-item>
        <el-form-item label="基地所在村" prop="baseLocation">
          <el-input v-model="form.baseLocation" placeholder="请输入基地所在村" />
        </el-form-item>
        <el-form-item label="基地类型" prop="baseType">
          <el-select v-model="form.baseType" placeholder="请选择基地类型">
            <el-option v-for="dict in base_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="基地面积" prop="baseArea">
          <el-input v-model.number="form.baseArea" placeholder="请输入基地面积" />
        </el-form-item>
        <el-form-item label="基地图片">
          <el-input v-model="form.basePhoto" placeholder="请输入基地图片" />
        </el-form-item>
        <el-form-item label="经度" prop="lng">
          <el-input v-model.number="form.lng" placeholder="请输入经度" />
        </el-form-item>
        <el-form-item label="纬度" prop="lat">
          <el-input v-model.number="form.lat" placeholder="请输入纬度" />
        </el-form-item>
        <el-form-item label="基地简介">
          <el-input v-model="form.remark" :rows="6" type="textarea" placeholder="请输入基地简介" />
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

<script setup name="BaseInfoCard" lang="ts">
import { listBaseInfo, getBaseInfo, delBaseInfo, addBaseInfo, updateBaseInfo } from '../api/baseInfoCard';
import { BaseInfoCardVO, BaseInfoCardQuery, BaseInfoCardForm } from '../api/baseInfoCard/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { base_type, is_valid } = toRefs<any>(proxy?.useDict('base_type', 'is_valid'));
const baseNameOptions = ref<string[]>([]);

const baseInfoList = ref<BaseInfoCardVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const imageKey = ref(0);

const queryFormRef = ref<ElFormInstance>();
const baseInfoCardFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: BaseInfoCardForm = {
  baseId: undefined,
  baseName: undefined,
  basePhoto: undefined,
  baseLocation: undefined,
  baseType: undefined,
  baseArea: undefined,
  isValid: undefined,
  remark: undefined,
  lng: undefined,
  lat: undefined
};

const data = reactive<PageData<BaseInfoCardForm, BaseInfoCardQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseName: undefined,
    baseLocation: undefined,
    baseType: undefined,
    params: {
      isValid: 1
    }
  },
  rules: {
    baseName: [{ required: true, message: '基地名称不能为空', trigger: 'blur' }],
    baseLocation: [{ required: true, message: '基地所在村不能为空', trigger: 'blur' }],
    baseType: [{ required: true, message: '基地类型不能为空', trigger: 'change' }],
    baseArea: [{ type: 'number', message: '必须为数值' }],
    lng: [
      { type: 'number', message: '必须为数值' },
      { required: true, message: '经度不能为空', trigger: 'blur' }
    ],
    lat: [
      { type: 'number', message: '必须为数值' },
      { required: true, message: '纬度不能为空', trigger: 'blur' }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询基地信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listBaseInfo(queryParams.value);
  baseNameOptions.value = [...new Set(res.rows.map((item) => item.baseName).filter((name) => name))];

  const typeOrder: Record<string, number> = {
    '智慧引领种植基地': 1,
    '数字化种植基地': 2
  };

  baseInfoList.value = res.rows.sort((a, b) => {
    const labelA = getBaseTypeLabel(a.baseType);
    const labelB = getBaseTypeLabel(b.baseType);

    const orderA = typeOrder[labelA] ?? 3;
    const orderB = typeOrder[labelB] ?? 3;

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.baseName.localeCompare(b.baseName, 'zh-CN');
  });

  total.value = res.total;
  setTimeout(() => {
    loading.value = false;
    imageKey.value++;
  }, 100);
};

/** 提交按钮 */
const submitForm = () => {
  baseInfoCardFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.baseId) {
        await updateBaseInfo(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addBaseInfo(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  baseInfoCardFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.params.isValid = 1; // 保持有效记录筛选
  handleQuery();
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加基地信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: BaseInfoCardVO) => {
  reset();
  const _baseId = (row?.baseId || ids.value[0]) as string | number;
  const res = await getBaseInfo(_baseId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改基地信息';
};

/** 删除按钮操作 */
const handleDelete = async (row?: BaseInfoCardVO) => {
  const _baseIds = row?.baseId || ids.value;
  // 构建确认消息
  let confirmMessage = '';
  if (row) {
    // 单条删除：显示完整编号
    confirmMessage = '是否确认基地编号为"' + _baseIds + '"的数据项？';
  } else {
    // 批量删除：显示第一个编号+数量
    const keyArray = Array.isArray(_baseIds) ? _baseIds : [_baseIds];
    const firstKey = keyArray[0] || '';
    const count = keyArray.length;
    if (count === 1) {
      // 单条删除：直接使用_baseIds（可能是字符串或数字）
      confirmMessage = '是否确认删除地块管理编号为"' + _baseIds + '"的数据项？';
    } else {
      // 批量删除：显示第一个编号+数量
      confirmMessage = `是否确认删除地块管理编号为"${firstKey}"等的${count}条数据？`;
    }
  }
  await proxy?.$modal.confirm(confirmMessage).finally(() => (loading.value = false));
  await delBaseInfo(_baseIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  // 创建导出参数的副本，避免修改原始查询参数
  const exportParams = {
    ...queryParams.value,
    params: {
      ...queryParams.value.params,
      // 移除 isValid 参数，这样后端就不会包含有效状态列
      isValid: undefined
    }
  };
  proxy?.download('powland/baseInfo/export', exportParams, `baseInfo_${new Date().getTime()}.xlsx`);
};

/** 获取基地类型标签 */
const getBaseTypeLabel = (value: string | number | undefined) => {
  if (!value) return '';
  const dict = base_type.value.find((item: any) => item.value === value.toString());
  return dict ? dict.label : value;
};

/**
 * 将字符中的换行转换为<br />
 * @param str
 */
function rnToBR(str) {
  if (str) {
    return str.replace(/\n|\r\n/g, '<br>').replace(/ /g, '&nbsp;');
  }
  return '';
}

onMounted(() => {
  queryParams.value.params.isValid = 1; // 确保只查询有效记录
  getList();
});
</script>

<style scoped>
.base-card-page {
  /* 防止 100vw 溢出侧边栏 */
  width: 100%;
  max-width: 100%;
}

/* 顶部工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.toolbar .left > * {
  margin-right: 8px;
}

/* 卡片 */
.base-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.base-card :deep(.el-card__footer) {
  padding-top: 8px;
}

/* 封面图区域 */
.cover {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
}
.cover .el-image {
  width: 100%;
  height: 100%;
}
.type-tag {
  position: absolute;
  left: 8px;
  top: 8px;
}

/* 内容区 */
.content {
  margin-top: 12px;
}
.title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}
.meta .line {
  display: flex;
  margin: 4px 0;
  font-size: 13px;
  color: #666;
}
.meta .label {
  width: 64px;
  color: #909399;
}
.meta .value {
  flex: 1;
  word-break: break-all;
}

/* 底部操作 */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 间距 */
.mb-4 {
  margin-bottom: 16px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}
</style>
