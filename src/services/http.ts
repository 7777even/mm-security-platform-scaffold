import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { logger } from '@/utils/logger';
import type { ApiResponse } from '@/types';
import { getAccessToken } from '@/services/token';
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

http.interceptors.response.use(
  (resp: AxiosResponse) => resp,
  (error) => {
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
