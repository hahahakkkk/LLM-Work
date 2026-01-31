<template>
  <div class="p-2">
    <!-- <div class="mb-[10px]">
      <el-card shadow="hover">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div> -->
    <el-card shadow="hover">
      <el-table v-loading="loading" :data="chatRecordList" style="width: 100%">
        <el-table-column label="序号" width="50" type="index" align="center">
          <template #default="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发送者" align="center" prop="senderName" :show-overflow-tooltip="true" />
        <el-table-column label="接收者" align="center" prop="receiverName" :show-overflow-tooltip="true" />
        <el-table-column label="消息类型" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'text'">文本</el-tag>
            <el-tag v-else-if="scope.row.type === 'customImage'" type="success">图片</el-tag>
            <el-tag v-else-if="scope.row.type === 'customVideo'" type="warning">视频</el-tag>
            <el-tag v-else-if="scope.row.type === 'base'" type="info">基地</el-tag>
            <el-tag v-else type="info">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="消息内容" align="center" width="350">
          <template #default="scope">
            <!-- 文本消息 -->
            <span v-if="scope.row.type === 'text'">{{ getMessageContent(scope.row.payload, scope.row.type) }}</span>
            <!-- 图片消息 -->
            <div v-else-if="scope.row.type === 'customImage'" style="position: relative">
              <img
                :src="getMediaUrl(scope.row.payload)"
                alt="图片"
                style="width: 100px; height: 75px; object-fit: cover; border-radius: 4px; cursor: pointer"
                @click="openImageDialog(getMediaUrl(scope.row.payload))"
              />
            </div>
            <!-- 视频消息 -->
            <div v-else-if="scope.row.type === 'customVideo'" style="position: relative">
              <video
                :src="getMediaUrl(scope.row.payload)"
                style="width: 100px; height: 75px; object-fit: cover; border-radius: 4px; cursor: pointer"
                @click="openVideoDialog(getMediaUrl(scope.row.payload))"
              >
                您的浏览器不支持video标签。
              </video>
              <div
                style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  color: white;
                  font-size: 20px;
                  text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
                "
              >
                ▶
              </div>
            </div>
            <!-- 基地消息 -->
            <span v-else-if="scope.row.type === 'base'">{{ getMessageContent(scope.row.payload, scope.row.type) }}</span>
            <!-- 其他类型 -->
            <span v-else>{{ getMessageContent(scope.row.payload, scope.row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '0'" type="success">已发送</el-tag>
            <el-tag v-else type="info">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发送时间" align="center" prop="sendTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.sendTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"> </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :page="queryParams.pageNum"
        :limit="queryParams.pageSize"
        :total="total"
        @update:page="
          (val) => {
            queryParams.pageNum = val;
            getList();
          }
        "
        @update:limit="
          (val) => {
            queryParams.pageSize = val;
            queryParams.pageNum = 1;
            getList();
          }
        "
      />
    </el-card>

    <!-- 视频播放对话框 -->
    <el-dialog v-model="videoDialog.visible" title="视频播放" width="800px" append-to-body>
      <video v-if="videoDialog.url" :src="videoDialog.url" controls autoplay style="width: 100%; max-height: 600px">
        您的浏览器不支持video标签。
      </video>
      <template #footer>
        <el-button @click="videoDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 图片查看对话框 -->
    <el-dialog v-model="imageDialog.visible" title="图片查看" width="600px" append-to-body>
      <img v-if="imageDialog.url" :src="imageDialog.url" alt="图片" style="width: 100%; max-height: 500px; object-fit: contain" />
      <template #footer>
        <el-button @click="imageDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ExpertChatRecord" lang="ts">
import { listChatRecord, delChatRecord } from '@/views/knowledge/api/im/chatRecord';
import { ChatRecordQuery, ChatRecordVO } from '@/views/knowledge/api/im/chatRecord/types';
import { parseTime } from '@/utils/ruoyi';
import { getCurrentInstance, onMounted, ref, reactive } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import type { FormInstance } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const chatRecordList = ref<ChatRecordVO[]>([]);
const loading = ref(true);
const total = ref(0);

// 视频对话框
const videoDialog = reactive({
  visible: false,
  url: ''
});

// 图片对话框
const imageDialog = reactive({
  visible: false,
  url: ''
});

const queryFormRef = ref<FormInstance>();

const queryParams = ref<ChatRecordQuery>({
  pageNum: 1,
  pageSize: 10,
  senderName: '',
  receiverName: '',
  content: '',
  startTime: '',
  endTime: ''
});

/** 查询聊天记录列表 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await listChatRecord(queryParams.value);
    chatRecordList.value = res.rows;
    total.value = res.total;
  } catch (error) {
    console.error('获取聊天记录失败:', error);
    chatRecordList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
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
  handleQuery();
};

/** 处理消息内容 */
const getMessageContent = (payload: string, type: string) => {
  try {
    // 尝试解析JSON格式的内容
    const parsed = JSON.parse(payload);

    switch (type) {
      case 'text':
        return parsed.text || payload;
      case 'customImage':
        return parsed.url || '无图片链接';
      case 'customVideo':
        return parsed.url || '无视频链接';
      case 'base':
        return `基地: ${parsed.baseName || '未命名基地'} (面积: ${parsed.baseArea || '未知'}亩)`;
      default:
        return payload;
    }
  } catch {
    // 如果不是JSON格式，直接返回原内容
    return payload;
  }
};

/** 获取媒体文件URL */
const getMediaUrl = (payload: string) => {
  try {
    const parsed = JSON.parse(payload);
    return parsed.url || '';
  } catch {
    return '';
  }
};

/** 打开视频对话框 */
const openVideoDialog = (url: string) => {
  videoDialog.url = url;
  videoDialog.visible = true;
};

/** 打开图片对话框 */
const openImageDialog = (url: string) => {
  imageDialog.url = url;
  imageDialog.visible = true;
};

/** 删除聊天记录 */
const handleDelete = async (row: ChatRecordVO) => {
  try {
    await proxy?.$modal.confirm('是否确认删除这条聊天记录?');
    await delChatRecord(row.id);
    await getList();
    proxy?.$modal.msgSuccess('删除成功');
  } catch (error) {
    console.error('删除聊天记录失败:', error);
  }
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.p-2 {
  padding: 8px;
}

.mb-\[10px\] {
  margin-bottom: 10px;
}
</style>
