import { createApp } from 'vue';
import { createPinia } from 'pinia';
import WujieVue from 'wujie-vue3';
// Element Plus 组件由 unplugin-vue-components 按需自动引入（B4 性能优化），此处仅保留基础样式
import 'element-plus/theme-chalk/base.css';
import {
  Odometer,
  Monitor,
  Bell,
  Avatar,
  UserFilled,
  Box,
  Tools,
  OfficeBuilding,
  FirstAidKit,
  Van,
  Warning,
  WarningFilled,
  Document,
  Guide,
  TrendCharts,
  Notebook,
  WarnTriangleFilled,
  CaretTop,
  CaretBottom,
  Search,
} from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import { installDynamicRoutes, DEFAULT_MENUS } from './router/menu';
import { fetchMenus } from './services/menu';
import { vPermission } from './directives/permission';
import { useAuthStore } from './stores/auth';
import { startRealtime } from './services/realtime';
import http from './services/http';
import { installDevMock } from './mocks/devMock';
import { mark, measure } from './utils/perf';
import { recordPerf } from './utils/perf-budget';
import './styles/tokens.css';
import './styles/global.css';
import './styles/element-dark.css';

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
  for (const icon of [
    Odometer,
    Monitor,
    Bell,
    Avatar,
    UserFilled,
    Box,
    Tools,
    OfficeBuilding,
    FirstAidKit,
    Van,
    Warning,
    WarningFilled,
    Document,
    Guide,
    TrendCharts,
    Notebook,
    WarnTriangleFilled,
    CaretTop,
    CaretBottom,
    Search,
  ]) {
    app.component(icon.name!, icon);
  }
  app.directive('permission', vPermission);
  // 注册 wujie 全局组件（wujie-shell 主壳）：<WujieVue> 经路由 meta.subappUrl 挂载子应用
  app.use(WujieVue);
  const pinia = createPinia();
  app.use(pinia);
  // Mock 登录：将访问令牌写入内存态，使请求拦截注入 Authorization（§5.3；正式环境由 IDP SSO 替换）
  useAuthStore().login();

  // 启动监测预警实时中枢（仅只读监视流订阅，零下行控制）。
  // 开发期：显式 VITE_USE_DEV_MOCK=true 时启用自包含 mock（无需外部后端）；否则走真实 ws。
  if (import.meta.env.DEV && import.meta.env.VITE_USE_DEV_MOCK === 'true') {
    installDevMock(http, pinia);
  } else {
    startRealtime();
  }

  // 关键：先装配动态路由，再挂载 router。
  // app.use(router) 会立即触发初始导航；若此时页面路由未装配，/dashboard 等路径
  // 会命中 catch-all 404（此前"全部 404"即由此产生）。
  await installMenus();

  app.use(router);

  // 子应用内路由跳转统一委托主壳路由（二级页由主壳 SECONDARY_ROUTES 承载）。
  // 子应用经 wujie 总线 emit('route-navigate')，主壳监听后执行 router.push。
  WujieVue.bus.$on('route-navigate', (event: string, data: { path: string }) => {
    void event;
    void router.push(data.path);
  });

  await router.isReady();

  app.mount('#app');
  mark('app:ready');
  // 渲染层耗时 = 入口 JS 执行 → 首屏挂载完成（D1 P7 进入平台 ≤5s 基线）
  const renderMs = measure('render', 'app:start', 'app:ready');
  if (renderMs != null) recordPerf('enterPlatformMs', renderMs);
}

void bootstrap();
