// 需要隐藏 Dify 的路由路径配置
export const HIDE_DIFY_ROUTES = [
  '/block/search', // 隐藏 /block/search 及其所有子路由
  '/login' // 隐藏登录页面
  // 可以添加更多需要隐藏的路径
];

// 检查当前路由是否需要隐藏 Dify
export const shouldHideDify = (currentPath: string): boolean => {
  return HIDE_DIFY_ROUTES.some((hidePath) => currentPath.startsWith(hidePath));
};

// 检查当前路由是否需要显示 Dify
export const shouldShowDify = (currentPath: string): boolean => {
  return !shouldHideDify(currentPath);
};
