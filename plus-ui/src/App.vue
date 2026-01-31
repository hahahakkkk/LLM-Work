<template>
  <el-config-provider :locale="appStore.locale" :size="appStore.size">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import useSettingsStore from '@/store/modules/settings';
import { handleThemeStyle } from '@/utils/theme';
import useAppStore from '@/store/modules/app';
import { useUserStore } from '@/store/modules/user';
import { useRoute } from 'vue-router';
import { onMounted, nextTick, watch, onUnmounted, computed } from 'vue';
import { DifyManager } from '@/utils/dify-manager';
import { DEFAULT_DIFY_CONFIG } from '@/config/dify';
import { shouldShowDify } from '@/config/routes';

// Store
const appStore = useAppStore();
const userStore = useUserStore();
const route = useRoute();

// 创建 Dify 管理器实例
const difyManager = DifyManager.getInstance({
  ...DEFAULT_DIFY_CONFIG,
  tools: {
    authentication: {
      ...DEFAULT_DIFY_CONFIG.tools!.authentication,
      content: `Bearer ${userStore.token}`
    }
  }
});

// 计算属性：是否应该显示 Dify
const shouldShowDifyChat = computed(() => shouldShowDify(route.path));

// 处理 Dify 显示/隐藏
const handleDifyVisibility = () => {
  if (shouldShowDifyChat.value) {
    // 当前路由需要显示 Dify
    if (!difyManager.isDifyInitialized()) {
      difyManager.initDifyChat(userStore.token);
    }
  } else {
    // 当前路由需要隐藏 Dify
    difyManager.removeDifyElements();
  }
};

// 监听用户令牌变化
watch(
  () => userStore.token,
  (newToken) => {
    if (newToken && shouldShowDifyChat.value) {
      difyManager.updateAuthToken(newToken);
    }
  }
);

// 监听路由变化
watch(
  () => route.path,
  () => {
    handleDifyVisibility();
  },
  { immediate: true }
);

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme);
  });
});

// 组件卸载时清理
onUnmounted(() => {
  difyManager.removeDifyElements();
});
</script>
