import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import '@/styles/tokens.css';
import './styles/mgmt.css';
import { vPermission } from '@/directives/permission';
import { useAuthStore } from '@/stores/auth';
import { refresh } from '@/services/auth';
import { setAccessToken } from '@/services/token';
import { onUnauthorized } from '@/services/http';
import { startRealtime } from '@/services/realtime';
import { reportAudit } from '@/services/audit';
import { logger } from '@/utils/logger';

// 后台管理端独立应用入口：共享主壳登录态（同 origin 共享 refresh HttpOnly Cookie = rt）。
// mgmt 不单独登录：启动静默 refresh 拿 access 令牌；无 rt Cookie 则跳主壳登录页（/login?redirect=...）。
// 与权限/实时流共用前端公共服务（src/services/*、src/stores/auth），仅 UI 壳独立。

function handleUnauthorized(): void {
  const redirect = router.currentRoute.value.fullPath;
  useAuthStore().clearMe();
  // 主壳登录页位于根路径，带 redirect 回到 mgmt 对应页
  window.location.href = `/login?redirect=${encodeURIComponent('/apps/mgmt' + redirect)}`;
}

async function bootstrap(): Promise<void> {
  const app = createApp(App);
  // 按钮级权限指令（与大屏壳同源）
  app.directive('permission', vPermission);
  const pinia = createPinia();
  app.use(pinia);
  // 401 统一处理：令牌失效跳主壳登录
  onUnauthorized(handleUnauthorized);

  // 静默续期（共享主壳 rt Cookie）→ 拉取后端身份与权限快照
  try {
    const token = await refresh();
    setAccessToken(token.accessToken);
    await useAuthStore().loadMe();
  } catch {
    logger.warn('[mgmt] 未检测到主壳登录态（无 rt Cookie），跳转主壳登录页');
    window.location.href = `/login?redirect=${encodeURIComponent('/apps/mgmt/')}`;
    return;
  }

  // 实时中枢：订阅 /ws/alarm 只读监视流（与大屏同源，双向联动的实时侧）
  startRealtime();

  // 进入后台管理端留痕（等保二级安全审计）
  reportAudit({ action: 'mgmt.enter', module: 'sys' });

  app.use(router);
  await router.isReady();
  app.mount('#app');
}

void bootstrap();
