import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { logger } from '@/utils/logger'
import type { ApiResponse } from '@/types'

// 统一 HTTP 客户端（S1 §2.1/§3.3）；网关强制 OAuth2.0 签名拦截（详细设计 §3.3）。
// 令牌走 HttpOnly Cookie / 内存态，禁止 localStorage 明文（S1 §5.3）。Authorization 头由 IDP SSO 注入，此处占位。
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '/api/v1',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

http.interceptors.response.use(
  (resp: AxiosResponse) => resp,
  (error) => {
    logger.error('[http] request failed', error?.message)
    return Promise.reject(error)
  },
)

function getAccessToken(): string | null {
  // TODO: 接入 IDP SSO 后从内存态 / HttpOnly Cookie 取令牌
  return null
}

/** 解包 B3 统一响应包络：code=0 返回 data，非 0 抛业务错误（B3 Mock 契约） */
export function unwrapBody<T>(body: ApiResponse<T>): T {
  if (body.code !== 0) {
    throw new Error(`[http] 业务错误 ${body.code}: ${body.message}`)
  }
  return body.data
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const resp = await http.request<ApiResponse<T>>(config)
  return unwrapBody(resp.data)
}

export default http
