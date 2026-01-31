<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item, item.children) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !isNest }">
          <svg-icon :icon-class="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" />
          <template #title>
            <span class="menu-title" :title="hasTitle(onlyOneChild.meta.title)">{{ onlyOneChild.meta.title }}</span>
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)" teleported>
      <template v-if="item.meta" #title>
        <svg-icon :icon-class="item.meta ? item.meta.icon : ''" />
        <span class="menu-title" :title="hasTitle(item.meta?.title)" @click="handleDirectoryClick">{{ item.meta?.title }}</span>
      </template>

      <sidebar-item
        v-for="(child, index) in item.children"
        :key="child.path + index"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { isExternal } from '@/utils/validate';
import AppLink from './Link.vue';
import { getNormalPath } from '@/utils/ruoyi';
import { RouteRecordRaw, useRouter } from 'vue-router';

const props = defineProps({
  item: {
    type: Object as PropType<RouteRecordRaw>,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  }
});

const router = useRouter();
const onlyOneChild = ref<any>({});

const hasOneShowingChild = (parent: RouteRecordRaw, children?: RouteRecordRaw[]) => {
  if (!children) {
    children = [];
  }
  const showingChildren = children.filter((item) => {
    if (item.hidden) {
      return false;
    } else {
      // Temp set(will be used if only has one showing child)
      onlyOneChild.value = item;
      return true;
    }
  });

  // When there is only one child router, the child router is displayed by default
  if (showingChildren.length === 1) {
    return true;
  }

  // Show parent if there are no child router to display
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true };
    return true;
  }

  return false;
};

// 验证路由是否有效（是否有正确的组件定义）
const isValidRouteDefinition = (menuItem: RouteRecordRaw): boolean => {
  // 检查是否有组件定义
  if (menuItem.component && typeof menuItem.component === 'function') {
    return true;
  }

  // 检查是否有子路由定义
  if (menuItem.children && menuItem.children.length > 0) {
    return true;
  }

  // 检查是否是外部链接
  if (menuItem.path && isExternal(menuItem.path)) {
    return true;
  }

  return false;
};

// 处理目录类型菜单的点击事件
const handleDirectoryClick = () => {
  // 检查当前菜单项是否有子菜单（这通常意味着它是目录类型）
  if (props.item.children && props.item.children.length > 0) {
    // 在直接子级中查找路由地址为 'index' 的菜单项（不论是否隐藏）
    const findIndexMenuChild = (children: RouteRecordRaw[]): RouteRecordRaw | null => {
      for (const child of children) {
        // 如果路由路径是 'index'，检查是否有有效的路由定义
        if (child.path === 'index') {
          // 只返回有效的路由定义
          if (isValidRouteDefinition(child)) {
            return child;
          }
        }
      }
      return null;
    };

    const indexMenuChild = findIndexMenuChild(props.item.children);
    if (indexMenuChild) {
      try {
        // 确保路径是字符串类型
        const childPath = typeof indexMenuChild.path === 'string' ? indexMenuChild.path : '';
        if (!childPath) {
          console.warn('index 菜单项路径无效:', indexMenuChild.meta?.title || 'Unknown');
          return;
        }

        // 构建完整路径
        const queryParam = typeof indexMenuChild.meta?.query === 'string' ? indexMenuChild.meta.query : undefined;
        const fullPath = resolvePath(childPath, queryParam);
        // 确保路径有效
        if (fullPath && (typeof fullPath === 'string' ? fullPath.trim() !== '' : fullPath.path && fullPath.path.trim() !== '')) {
          // 检查路由是否有效（是否有组件定义）
          const targetPath = typeof fullPath === 'string' ? fullPath : fullPath.path;

          // 验证菜单项是否有有效的路由定义
          if (isValidRouteDefinition(indexMenuChild)) {
            router.push(fullPath);
          } else {
            console.warn('index 菜单项缺少有效的路由定义，跳过跳转:', targetPath, '菜单标题:', indexMenuChild.meta?.title || 'Unknown');
          }
        } else {
          console.warn('index 菜单项路径解析失败:', props.item.meta?.title);
        }
      } catch (error) {
        console.error('菜单路由跳转失败:', error, '菜单项:', indexMenuChild);
      }
    }
    // 如果没有找到 index 路由，不执行任何跳转操作，只展开菜单
  }
};

const resolvePath = (routePath: string, routeQuery?: string): any => {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath as string)) {
    return props.basePath;
  }
  if (routeQuery) {
    let query = JSON.parse(routeQuery);
    return { path: getNormalPath(props.basePath + '/' + routePath), query: query };
  }
  return getNormalPath(props.basePath + '/' + routePath);
};

const hasTitle = (title: string | undefined): string => {
  if (!title || title.length <= 5) {
    return '';
  }
  return title;
};
</script>
