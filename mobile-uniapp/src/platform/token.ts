// 访问令牌仅存 JS 内存（对齐 S1 §5.3 红线：禁止落 localStorage / sessionStorage 防 XSS）。
// 刷新令牌由后端经 HttpOnly Cookie 下发，前端 JS 不可读（见 platform/http.ts 的 withCredentials）。
let accessToken: string | null = null;

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
}
