// 令牌启动：dev 环境下用环境变量换取后端令牌（与原 mobile/main.ts 的 ensureMobileToken 同口径）。
// 生产由 IDP SSO / 原生壳注入，此处仅做 dev 兜底。
import { login } from './api';
import { setAccessToken } from './token';
import { logger } from './logger';

export async function ensureToken(): Promise<void> {
  if (!import.meta.env.VITE_API_BASE) return;

  const username = import.meta.env.VITE_DEV_USERNAME;
  const password = import.meta.env.VITE_DEV_PASSWORD;
  if (username && password) {
    try {
      const token = await login({ username, password });
      setAccessToken(token.accessToken);
    } catch {
      logger.warn('[bootstrap] 后端登录失败，业务页将走空态（请确认后端 :8787 已启动）');
    }
  }
}
