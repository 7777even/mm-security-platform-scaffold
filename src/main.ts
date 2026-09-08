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
import type { WujieEventMap } from './shell/wujieBridge';
import { useAuthStore } from './stores/auth';
import { startRealtime } from './services/realtime';
import http, { onUnauthorized } from './services/http';
import { login } from './services/auth';
import { installDevMock } from './mocks/devMock';
import { logger } from './utils/logger';
import { mark, measure } from './utils/perf';
import { recordPerf } from './utils/perf-budget';
import './styles/tokens.css';
import './styles/global.css';
import './styles/element-dark.css';

// 渲染层埋点起点：入口 JS 开始执行（SLO 渲染层口径）
mark('app:start');

// 动态路由装配（B3 AUTH-05）：优先拉取后端菜单并由其驱动路由，不可达时降级内置菜单。
// 后端 /auth/menus 现已修正为返回 fm-* 字符串 id（与 MENU_ROUTE_SPECS 对齐），
// buildDynamicRoutes 能正确装配；DEFAULT_MENUS 仅作后端不可达时的兜底保证不白屏。
async function installMenus(): Promise<void> {
  try {
    const menus = await fetchMenus();
    installDynamicRoutes(router, menus);
  } catch {
    installDynamicRoutes(router, DEFAULT_MENUS);
    logger.warn('[app] 后端菜单不可达，已用内置 DEFAULT_MENUS 兜底装配');
  }
}

// 真实凭证登录：向后端 /auth/login 换取 JWT 并写入内存态（§5.3）。
// 此前使用 `mock-admin-<ts>` 假令牌，后端 JwtFilter 一律判无效，导致全站接口 401。
// 凭据取自 dev 环境变量；生产环境由 IDP SSO 下发，前端不再持有任何口令。
// 登录失败时降级为本地 mock 令牌：页面不白屏，但接口会批量 401（已打错误日志）。
async function ensureLogin(): Promise<void> {
  const username = import.meta.env.VITE_DEV_USERNAME;
  const password = import.meta.env.VITE_DEV_PASSWORD;
  if (username && password) {
    try {
      const token = await login({ username, password });
      useAuthStore().login(token.accessToken);
      return;
    } catch {
      logger.error('[app] 后端登录失败，接口将以未鉴权态访问（请确认后端 :8787 已启动）');
    }
  }
  useAuthStore().login();
}

// 令牌失效（401）：脚手架阶段无独立登录页，直接重新登录；生产改为跳转 SSO 登录页。
function handleUnauthorized(): void {
  logger.warn('[app] 收到 401 未授权，尝试重新登录');
  void ensureLogin();
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
  // 401 统一处理：令牌失效时自动重新登录（真实后端模式下生效）
  onUnauthorized(handleUnauthorized);

  // 启动监测预警实时中枢（仅只读监视流订阅，零下行控制）。
  // 开发期：显式 VITE_USE_DEV_MOCK=true 时启用自包含 mock（无需外部后端）；
  // 否则先向后端真实登录换取 JWT，再连真实 ws。
  if (import.meta.env.DEV && import.meta.env.VITE_USE_DEV_MOCK === 'true') {
    // Mock 登录：令牌仅写入内存态，请求由 devMock 适配器本地应答（§5.3）
    useAuthStore().login();
    installDevMock(http, pinia);
  } else {
    await ensureLogin();
    startRealtime();
  }

  // 关键：先装配动态路由，再挂载 router。
  // app.use(router) 会立即触发初始导航；若此时页面路由未装配，/dashboard 等路径
  // 会命中 catch-all 404（此前"全部 404"即由此产生）。
  await installMenus();

  app.use(router);

  // 子应用内路由跳转统一委托主壳路由（二级页由主壳 SECONDARY_ROUTES 承载）。
  // 子应用经 wujie 总线 emit('route-navigate')，主壳监听后执行 router.push。
  // 注意：wujie EventBus.$on 回调只接收 $emit 的负载参数（首个参数即 data），
  // 二参签名 (event, data) 会把 data 视为 undefined——此前跨应用跳转即因此静默失效。
  // query 透传：源项目使用 route.query 传递 eventId/from/autostart/tab/monitor 等参数。
  // replace 负载：消耗型一次性参数（?create=event）清理后，主壳用 router.replace
  // 更新 URL 且不留历史，避免浏览器后退重放该参数再次触发 UI。
  WujieVue.bus.$on('route-navigate', (data: WujieEventMap['route-navigate']) => {
    const navigate = data.replace ? router.replace : router.push;
    if (data.query) {
      void navigate({ path: data.path, query: data.query });
    } else {
      void navigate(data.path);
    }
  });

  await router.isReady();

  app.mount('#app');
  mark('app:ready');
  // 渲染层耗时 = 入口 JS 执行 → 首屏挂载完成（D1 P7 进入平台 ≤5s 基线）
  const renderMs = measure('render', 'app:start', 'app:ready');
  if (renderMs != null) recordPerf('enterPlatformMs', renderMs);
}

void bootstrap();
