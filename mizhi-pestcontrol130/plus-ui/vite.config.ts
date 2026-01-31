import { UserConfig, ConfigEnv, loadEnv, defineConfig } from 'vite';

import createPlugins from './vite/plugins';

import path from 'path';
export default defineConfig(({ mode, command }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 baseUrl 为 /admin/。
    base: env.VITE_APP_CONTEXT_PATH,
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './'),
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    // https://cn.vitejs.dev/config/#resolve-extensions
    plugins: createPlugins(env, command === 'build'),
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_APP_PORT),
      open: true,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: 'http://172.25.23.186:8080',
          // target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), ''),
          // ========== 新增：配置代理响应头，修复SSE的Content-Type问题 ==========
          configure: (proxy, options) => {
            // 监听代理响应事件，修改SSE接口的响应头
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // 匹配Dify的SSE接口路径：/trace/dify/stream
              if (req.url?.includes('/trace/dify/stream')) {
                // 1. 删除代理自动添加的text/plain头
                delete proxyRes.headers['content-type'];
                // 2. 强制设置SSE规范的响应头
                proxyRes.headers['Content-Type'] = 'text/event-stream; charset=utf-8';
                // 3. 补充SSE必需的头，禁用缓存和缓冲
                proxyRes.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
                proxyRes.headers['Pragma'] = 'no-cache';
                proxyRes.headers['Expires'] = '0';
                proxyRes.headers['Connection'] = 'keep-alive';
                proxyRes.headers['X-Accel-Buffering'] = 'no'; // 禁用Nginx缓冲（部署时也需要）
              }
            });
          }
          // ========== 新增结束 ==========
        },
        '/geoserver': {
          target: 'http://10.105.10.105:4000',
          // target: 'http://127.0.0.1:8080',
          changeOrigin: true
        },
        [env.VITE_IMGPROXY_URL]: {
          target: 'http://172.25.23.190:8081',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_IMGPROXY_URL), '')
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true
        }
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
    // 预编译
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        '@vueuse/core',
        'echarts',
        'vue-i18n',
        '@vueup/vue-quill',
        'bpmn-js/lib/Viewer',
        'bpmn-js/lib/Modeler.js',
        'bpmn-js-properties-panel',
        'min-dash',
        'diagram-js/lib/navigation/movecanvas',
        'diagram-js/lib/navigation/zoomscroll',
        'bpmn-js/lib/features/palette/PaletteProvider',
        'bpmn-js/lib/features/context-pad/ContextPadProvider',
        'diagram-js/lib/draw/BaseRenderer',
        'tiny-svg',
        'image-conversion',
        'element-plus/es/components/**/css'
      ]
    }
  };
});
