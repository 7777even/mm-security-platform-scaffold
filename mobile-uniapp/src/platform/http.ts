// uni-app HTTP 适配层（替代原 src/services/http.ts 的 axios 实现）。
// 接口语义对齐原 request<T> / ApiError / 401 处理 / GET 去重，但底层走 uni.request。
// 与原实现的差异（P1 待补齐）：防重放签名、Strict-XSS 净化、硬控路径拦截、全局 toast 兜底——
// 这些安全件需在平台无关层重写后接入，PoC 先验证联调通路。
import { getItem } from './storage';
import { getAccessToken, clearAccessToken } from './token';
import { logger } from './logger';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
  traceId?: string;
}

/** B3 统一包络错误：业务码（code!=0）或鉴权失败（401/403）时抛出，页面统一 catch 消费。 */
export class ApiError extends Error {
  readonly code: number;
  readonly data?: unknown;
  readonly traceId?: string;
  /** HTTP 状态码（网络层失败时为 undefined）。 */
  readonly status?: number;
  constructor(code: number, message: string, data?: unknown, traceId?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
    this.traceId = traceId;
    this.status = status;
  }
}

export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  params?: Record<string, unknown>;
  header?: Record<string, string>;
  /** GET 并发去重开关，默认 true。 */
  dedupe?: boolean;
  signal?: AbortSignal;
}

const BASE_URL: string = import.meta.env.VITE_API_BASE ?? '/api/v1';
const LANG_KEY = 'app-language';

function buildUrl(url: string, params?: Record<string, unknown>): string {
  const base = BASE_URL.replace(/\/$/, '');
  if (!params) return base + url;
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return base + url + (qs ? `?${qs}` : '');
}

function resolveAcceptLanguage(): string {
  try {
    return getItem(LANG_KEY) ?? 'zh-CN';
  } catch {
    return 'zh-CN';
  }
}

function unwrapBody<T>(body: ApiResponse<T>): T {
  if (body.code !== 0) {
    throw new ApiError(body.code, body.message, body.data, body.traceId);
  }
  return body.data as T;
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** 注册未授权处理器：令牌失效/缺失时触发（跳登录页或提示重新登录）。 */
export function onUnauthorized(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

/** 触发未授权处理（令牌失效/缺失）。供非 request 路径复用（如二进制端点 401）。 */
export function emitUnauthorized(): void {
  unauthorizedHandler?.();
}

const inflightGet = new Map<string, Promise<unknown>>();

function dedupeKey(config: RequestConfig): string | null {
  const method = (config.method ?? 'GET').toUpperCase();
  if (method !== 'GET') return null;
  if (config.signal) return null;
  if (config.dedupe === false) return null;
  const params = config.params === undefined ? '' : JSON.stringify(config.params);
  return `${method} ${config.url} ${params}`;
}

function uniRequest<T>(config: RequestConfig): Promise<T> {
  const u = (globalThis as Record<string, any>).uni;
  if (!u || typeof u.request !== 'function') {
    return Promise.reject(new ApiError(-1, 'uni.request 不可用（当前环境非 uni-app）'));
  }
  const token = getAccessToken();
  const header: Record<string, string> = {
    'Accept-Language': resolveAcceptLanguage(),
    ...(config.header ?? {}),
  };
  if (token) header['Authorization'] = `Bearer ${token}`;

  return new Promise<T>((resolve, reject) => {
    u.request({
      url: buildUrl(config.url, config.params),
      method: (config.method ?? 'GET').toUpperCase(),
      data: config.data,
      header,
      // 刷新令牌经后端 HttpOnly Cookie 下发，需携带凭据（H5 平台生效；App 平台见 P1 说明）
      withCredentials: true,
      success: (resp: { statusCode: number; data: unknown }) => {
        const status = resp.statusCode;
        const body = resp.data as ApiResponse<unknown> | null;
        if (
          body &&
          typeof body === 'object' &&
          typeof body.code === 'number' &&
          'message' in body
        ) {
          if (body.code === 0) {
            try {
              resolve(unwrapBody<T>(body as unknown as ApiResponse<T>));
            } catch (e) {
              reject(e);
            }
            return;
          }
          if (status === 401) {
            clearAccessToken();
            unauthorizedHandler?.();
          }
          reject(new ApiError(body.code, String(body.message), body.data, body.traceId, status));
          return;
        }
        if (status >= 200 && status < 300) {
          resolve(body as T);
          return;
        }
        if (status === 401) {
          clearAccessToken();
          unauthorizedHandler?.();
        }
        reject(
          new ApiError(
            (body as any)?.code ?? status,
            (body as any)?.message ?? `HTTP ${status}`,
            body,
            undefined,
            status,
          ),
        );
      },
      fail: (err: { errMsg?: string; statusCode?: number }) => {
        logger.error('[http] request failed', err);
        reject(
          new ApiError(
            -1,
            err?.errMsg ?? '网络异常，请检查后端连接',
            undefined,
            undefined,
            err?.statusCode,
          ),
        );
      },
    });
  });
}

/** 统一请求入口：GET 去重 + B3 包络解包 + ApiError 透传。 */
export async function request<T>(config: RequestConfig): Promise<T> {
  const key = dedupeKey(config);
  if (key) {
    const pending = inflightGet.get(key);
    if (pending) return pending as Promise<T>;
  }

  const promise = (async () => {
    return uniRequest<T>(config);
  })();

  if (key) {
    inflightGet.set(key, promise);
    const clear = () => inflightGet.delete(key as string);
    promise.then(clear, clear);
  }
  return promise;
}
