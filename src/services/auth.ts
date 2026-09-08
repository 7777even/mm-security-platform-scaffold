import { request } from '@/services/http';

// 真实凭证登录（契约 docs/api/auth.openapi.json）。
// 此前前端仅用 auth store 的 `mock-admin-<ts>` 假令牌，后端 JwtFilter 一律判无效 → 全站 401。
// 脚手架阶段凭据由 dev 环境变量注入（VITE_DEV_USERNAME / VITE_DEV_PASSWORD）；
// 生产环境改为 IDP SSO 下发令牌，前端不再持有任何口令。

export interface LoginPayload {
  username: string;
  password: string;
}

/** 登录/刷新返回（契约 TokenResponse）：access 存内存态，refresh 由后端种入 HttpOnly Cookie */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/** 当前登录用户（契约 CurrentUser） */
export interface CurrentUser {
  username: string;
  realName: string;
  role: string;
}

/** 凭证登录，返回 access/refresh 令牌 */
export function login(payload: LoginPayload): Promise<TokenResponse> {
  return request<TokenResponse>({ url: '/auth/login', method: 'POST', data: payload });
}

/** 凭 refreshToken 续期 */
export function refresh(refreshToken: string): Promise<TokenResponse> {
  return request<TokenResponse>({ url: '/auth/refresh', method: 'POST', data: { refreshToken } });
}

/** 取当前登录用户（username/realName/role） */
export function fetchCurrentUser(): Promise<CurrentUser> {
  return request<CurrentUser>({ url: '/auth/me', method: 'GET' });
}
