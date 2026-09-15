import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import '@/styles/tokens.css';
import './styles/mobile.css';
import { initAccessibilityModes } from './composables/useAccessibilityModes';
import { tokenSource } from './bridges';
import { setAccessToken } from '@/services/token';
import { login } from '@/services/auth';
import { onUnauthorized } from '@/services/http';
import { logger } from '@/utils/logger';

// 移动端 H5 独立应用入口（详设 V1.5 §5.3：Android 原生壳（hybrid）内嵌业务页，
// 集成方式待与设计方确认，见 docs/详细设计V1.5偏差分析.md §2.1）
// - 主题：data-theme="mobile" 由 index.html 静态挂载；
//   无障碍模式（户外高对比 / 适老三档）在挂载前从 localStorage 注入根节点，杜绝首屏闪烁。
// - 基座样式：./styles/mobile.css（勿引入 src/styles/global.css，其 body 为大屏深色底语言）
// - 原生能力（定位/离线落盘/推送/令牌注入）一律经 ./bridges/ 接口访问，页面禁止直调原生 API；
//   决策未定期间由 bridges 的 H5 降级实现垫底，决策落地只换适配器实现，业务页零改动
initAccessibilityModes();

/**
 * 令牌衔接（移动端接后端的前置）。
 * 设计指定通道：原生壳经 bridges/tokenSource 注入令牌（Hybrid 场景）；
 * dev / 纯 H5 无壳时用环境变量换取令牌（与主壳 ensureLogin 同口径，凭据取自 .env.development）。
 * 未连后端（无 VITE_API_BASE）时不发起登录：业务页走空态 + 全局离线告警，绝不回灌假数据。
 */
async function ensureMobileToken(): Promise<void> {
  if (!import.meta.env.VITE_API_BASE) return;

  try {
    const injected = await tokenSource.getToken();
    if (injected) {
      setAccessToken(injected);
      return;
    }
  } catch {
    // 桥接不可用时忽略，继续走 dev 兜底
  }

  const username = import.meta.env.VITE_DEV_USERNAME;
  const password = import.meta.env.VITE_DEV_PASSWORD;
  if (username && password) {
    try {
      const token = await login({ username, password });
      setAccessToken(token.accessToken);
    } catch {
      logger.warn('[mobile] 后端登录失败，业务页将走空态（请确认后端 :8787 已启动）');
    }
  }
}

async function bootstrap(): Promise<void> {
  const app = createApp(App);
  // 401 统一处理：令牌失效跳登录页（与主壳同策略；清内存态令牌由 http 拦截器负责）
  onUnauthorized(() => {
    void router.push('/login');
  });
  await ensureMobileToken();
  app.use(createPinia()).use(router).mount('#app');
}

void bootstrap();
