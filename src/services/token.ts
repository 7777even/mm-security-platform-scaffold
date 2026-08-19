// S1 §5.3 合规红线：访问令牌仅存于 JS 内存，绝不落地 localStorage / sessionStorage（防 XSS 窃取）。
// 刷新令牌由后端种入 HttpOnly Cookie，浏览器自动随请求发送，前端 JS 不可读。
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
