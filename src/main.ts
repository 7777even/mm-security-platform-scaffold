import { createApp } from 'vue';
import { createPinia } from 'pinia';
// Element Plus 组件由 unplugin-vue-components 按需自动引入（B4 性能优化），此处仅保留基础样式
import 'element-plus/theme-chalk/base.css';
import { Odometer, Monitor, Bell } from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import { installDynamicRoutes, DEFAULT_MENUS } from './router/menu';
import { fetchMenus } from './services/menu';
import { vPermission } from './directives/permission';
import { useAuthStore } from './stores/auth';
import { mark, measure } from './utils/perf';
import './styles/tokens.css';
import './styles/global.css';

// 渲染层埋点起点：入口 JS 开始执行（SLO 渲染层口径）
mark('app:start');

// 动态路由装配（B3 AUTH-05）：优先拉取后端菜单，mock 不可达时降级内置菜单
async function installMenus(): Promise<void> {
  try {
    const menus = await fetchMenus();
    installDynamicRoutes(router, menus);
  } catch {
    installDynamicRoutes(router, DEFAULT_MENUS);
  }
}

async function bootstrap(): Promise<void> {
  const app = createApp(App);
  // 仅注册用到的图标（避免全量图标包 400KB+）
  for (const icon of [Odometer, Monitor, Bell]) {
    app.component(icon.name!, icon);
  }
  app.directive('permission', vPermission);
  app.use(createPinia());
  // Mock 登录：将访问令牌写入内存态，使请求拦截注入 Authorization（§5.3；正式环境由 IDP SSO 替换）
  useAuthStore().login();

  // 关键：先装配动态路由，再挂载 router。
  // app.use(router) 会立即触发初始导航；若此时页面路由未装配，/dashboard 等路径
  // 会命中 catch-all 404（此前"全部 404"即由此产生）。
  await installMenus();

  app.use(router);
  await router.isReady();

  app.mount('#app');
  mark('app:ready');
  // 渲染层耗时 = 入口 JS 执行 → 首屏挂载完成（真机复测对比 SLO ≤1000ms）
  measure('render', 'app:start', 'app:ready');
}

void bootstrap();
