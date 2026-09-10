import { request } from '@/services/http';

// 真实凭证登录（契约 docs/api/auth.openapi.json）。
// 此前前端仅用 auth store 的 `mock-admin-<ts>` 假令牌，后端 JwtFilter 一律判无效 → 全站 401。
// 脚手架阶段凭据由 dev 环境变量注入（VITE_DEV_USERNAME / VITE_DEV_PASSWORD）；
// 生产环境改为 IDP SSO 下发令牌，前端不再持有任何口令。

export interface LoginPayload {
  username: string;
  password: string;
}

/**
 * 登录/刷新返回（契约 TokenResponse）：access 存内存态（token.ts）；
 * refresh 令牌由后端经 HttpOnly Cookie 下发，绝不进响应 body（防 XSS 窃取），故此处无 refreshToken 字段。
 */
export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * 当前登录用户（契约 MeResult）。
 * perms 由后端按 sys_role_menu 解析下发，是前端路由守卫与 v-permission 的**唯一权威来源**
 * （V32 起取代硬编码的 ROLE_PERMS）。
 */
export interface MeResult {
  username: string;
  realName: string;
  role: string;
  roles: string[];
  perms: string[];
  mustChangePwd: boolean;
}

/** 本人修改口令入参 */
export interface PasswordChangePayload {
  oldPassword: string;
  newPassword: string;
}

/** 本人资料修改入参 */
export interface ProfileUpdatePayload {
  realName: string;
}

/** 凭证登录，返回 access 令牌（refresh 经 Set-Cookie 下发） */
export function login(payload: LoginPayload): Promise<TokenResponse> {
  return request<TokenResponse>({ url: '/auth/login', method: 'POST', data: payload });
}

/**
 * 续期：浏览器自动携带 HttpOnly Cookie（rt）中的 refresh 令牌，无需请求体。
 * 返回新的 access 令牌；refresh 仍由 Set-Cookie 滚动下发。
 */
export function refresh(): Promise<TokenResponse> {
  return request<TokenResponse>({ url: '/auth/refresh', method: 'POST' });
}

/** 登出：通知后端清除 HttpOnly 刷新 Cookie（前端同步清内存态在 store 层处理） */
export function logout(): Promise<void> {
  return request<void>({ url: '/auth/logout', method: 'POST' });
}

/** 取当前登录用户（含 roles / perms / mustChangePwd） */
export function fetchCurrentUser(): Promise<MeResult> {
  return request<MeResult>({ url: '/auth/me', method: 'GET' });
}

/** 本人修改口令（须校验旧口令并满足复杂度策略） */
export function changePassword(payload: PasswordChangePayload): Promise<void> {
  return request<void>({ url: '/auth/password', method: 'POST', data: payload });
}

/** 本人资料修改（仅姓名；返回最新 MeResult） */
export function updateProfile(payload: ProfileUpdatePayload): Promise<MeResult> {
  return request<MeResult>({ url: '/auth/profile', method: 'PUT', data: payload });
}
