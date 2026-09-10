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
// 后端 /auth/menus 仅返回顶部导航的 5 个 fm-* 主模块（与 MENU_ROUTE_SPECS 顶部项对齐）；
// 其余子应用（fm-rescue 等）走前端 SECONDARY_ROUTES 二级隐藏路由，不进顶部菜单。
// DEFAULT_MENUS 仅作后端不可达时的兜底保证不白屏。
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
// 登录失败时跳转登录页（不再种假令牌，避免假令牌被 JwtFilter 拒 → 全站 401 风暴）。
async function ensureLogin(): Promise<void> {
  const username = import.meta.env.VITE_DEV_USERNAME;
  const password = import.meta.env.VITE_DEV_PASSWORD;
  if (username && password) {
    try {
      const token = await login({ username, password });
      useAuthStore().login(token.accessToken);
      return;
    } catch {
      logger.error('[app] 后端登录失败，跳转登录页（请确认后端 :8787 已启动）');
    }
  }
  // 无凭据或登录失败：交给定向登录页处理（dev 自动重试 / 生产跳 SSO）
  router.push({ path: '/login', query: { redirect: '/' } });
}

// 令牌失效（401）：统一跳登录页重新鉴权（dev 自动登录 / 生产跳 SSO）。
// 清空内存态令牌由 http 拦截器负责；此处仅做路由跳转，杜绝静默重登循环。
function handleUnauthorized(): void {
  const redirect = router.currentRoute.value.fullPath;
  logger.warn('[app] 收到 401 未授权，跳转登录页');
  // 同步清空身份/权限快照，避免旧权限集在重新登录前继续放行路由
  useAuthStore().clearMe();
  router.push({ path: '/login', query: { redirect } });
}

// 自包含演示（VITE_USE_DEV_MOCK=true，无后端）用的兜底权限码。
// 真实后端模式下权限一律以 GET /auth/me 下发的 perms 为准，此常量不参与。
// 覆盖：五个 fm-* 路由的 meta.perm + 系统管理二级页 + v-permission 演示码。
const DEV_MOCK_PERMS = [
  'dashboard:view',
  'fire-alarm:view',
  'fire-alarm:ack',
  'security:view',
  'video:view',
  'ops:view',
  'system:user:view',
  'system:role:view',
  'system:menu:view',
  'system:dict:view',
  'system:device-code:view',
  'mobile:field-report:view',
];

/** 拉取后端下发的身份与权限快照（路由守卫判定 meta.perm 前必须完成）。 */
async function hydrateUser(): Promise<void> {
  try {
    await useAuthStore().loadMe();
  } catch {
    logger.warn('[app] /auth/me 不可达，权限集为空——受权限保护的路由将被守卫拦截');
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
  // 401 统一处理：令牌失效时自动重新登录（真实后端模式下生效）
  onUnauthorized(handleUnauthorized);

  // 启动监测预警实时中枢（仅只读监视流订阅，零下行控制）。
  // 开发期：显式 VITE_USE_DEV_MOCK=true 时启用自包含 mock（无需外部后端）；
  // 否则先向后端真实登录换取 JWT，再连真实 ws。
  if (import.meta.env.DEV && import.meta.env.VITE_USE_DEV_MOCK === 'true') {
    // Mock 登录：令牌仅写入内存态，请求由 devMock 适配器本地应答（§5.3）
    useAuthStore().login();
    useAuthStore().setMe({
      username: 'admin',
      realName: '系统管理员',
      role: 'ADMIN',
      roles: ['ADMIN'],
      perms: DEV_MOCK_PERMS,
      mustChangePwd: false,
    });
    installDevMock(http, pinia);
  } else {
    await ensureLogin();
    // 关键时序：先取 /auth/me（填充 perms），再装配动态路由；
    // 否则路由守卫在 meta.perm 判定时拿到空权限集，受保护页面会被误判为 404。
    await hydrateUser();
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
