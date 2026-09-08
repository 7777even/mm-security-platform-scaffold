import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { logger } from '@/utils/logger';
import type { ApiResponse } from '@/types';
import { getAccessToken, clearAccessToken } from '@/services/token';
import { guardHardControl } from '@/services/hardControlGuard';
import {
  SIGN_HEADER_NONCE,
  SIGN_HEADER_SIGNATURE,
  SIGN_HEADER_TIMESTAMP,
  buildSignature,
  createNonce,
  isSigningEnabled,
} from '@/services/requestSigner';
import { isPlainRequestBody, strictSanitizeDeep } from '@/utils/sanitize';

// 统一 HTTP 客户端（S1 §2.1/§3.3）；网关强制 OAuth2.0 签名拦截（详细设计 §3.3）。
// 令牌走 HttpOnly Cookie / 内存态，禁止 localStorage 明文（S1 §5.3）。getAccessToken 由 token.ts 内存态提供。
// 详设 V1.5 补充约定：
// - i18n：所有请求携带 Accept-Language，报文文案由后端按语言头翻译（§4.2.7）；
// - Strict-XSS：出站 JSON 字符串字段统一转义（§5.2.7）；
// - 防重放签名：生产（gateway-bypass=false）强制 HMAC-SHA256 签名头（§3.3）。
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '/api/v1',
  timeout: 15000,
});

const ACCEPT_LANGUAGE_KEY = 'app-language';

function resolveAcceptLanguage(): string {
  try {
    return localStorage.getItem(ACCEPT_LANGUAGE_KEY) ?? navigator.language ?? 'zh-CN';
  } catch {
    return 'zh-CN';
  }
}

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // 零下行控制红线（D1 C-3 只监不控）：任何出站请求命中硬控路径一律拦截
  guardHardControl(config.url ?? '');

  const token = getAccessToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);

  // i18n：后端按语言头返回翻译报文（详设 V1.5 §4.2.7）
  config.headers.set('Accept-Language', resolveAcceptLanguage());

  // Strict-XSS 前端过滤（详设 V1.5 §5.2.7）：仅处理纯 JSON 请求体
  if (isPlainRequestBody(config.data)) {
    config.data = strictSanitizeDeep(config.data);
  }

  // 防重放动态签名（详设 V1.5 §3.3）：生产强制启用，Dev 可经 gateway-bypass 挂起
  if (token && isSigningEnabled()) {
    const timestamp = String(Date.now());
    const nonce = createNonce();
    const signature = await buildSignature({
      timestamp,
      nonce,
      token,
      method: config.method ?? 'get',
      path: config.url ?? '/',
    });
    config.headers.set(SIGN_HEADER_TIMESTAMP, timestamp);
    config.headers.set(SIGN_HEADER_NONCE, nonce);
    config.headers.set(SIGN_HEADER_SIGNATURE, signature);
  }

  return config;
});

// 401 处理器由应用入口（main.ts / 子应用入口）注册；services 层不反向依赖 router 或 store，
// 否则子应用（可能无独立路由实例）会引入循环依赖。
type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** 注册未授权处理器：令牌失效/缺失时触发（跳登录页或提示重新登录） */
export function onUnauthorized(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

http.interceptors.response.use(
  (resp: AxiosResponse) => resp,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // 后端已将 401/403 业务码映射为真实 HTTP 状态码（后端改动 #14），此处按 HTTP 状态判定。
      // 清除内存态令牌，避免后续请求继续携带死令牌反复 401。
      clearAccessToken();
      logger.warn('[http] 401 未授权，已清除内存态令牌');
      unauthorizedHandler?.();
    } else if (status === 403) {
      logger.warn('[http] 403 无权限访问该资源');
    }
    logger.error('[http] request failed', error?.message);
    return Promise.reject(error);
  },
);

/** 解包 B3 统一响应包络：code=0 返回 data，非 0 抛业务错误（B3 Mock 契约） */
export function unwrapBody<T>(body: ApiResponse<T>): T {
  if (body.code !== 0) {
    throw new Error(`[http] 业务错误 ${body.code}: ${body.message}`);
  }
  return body.data;
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const resp = await http.request<ApiResponse<T>>(config);
  return unwrapBody(resp.data);
}

export default http;
