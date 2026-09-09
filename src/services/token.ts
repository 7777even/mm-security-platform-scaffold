// S1 §5.3 合规红线：访问令牌仅存于 JS 内存，绝不落地 localStorage / sessionStorage（防 XSS 窃取）。
// 刷新令牌由后端种入 HttpOnly Cookie，浏览器自动随请求发送，前端 JS 不可读。
let accessToken: string | null = null;

/**
 * wujie 子应用令牌桥（只读）。
 * 子应用（fm-*）是独立打包的 bundle，各自持有一份本模块的 accessToken 实例，
 * 但子应用从不独立登录（subapps/fm-emergency/main.ts 不调用 ensureLogin），其本地令牌恒为空，
 * 导致子应用发起的 /emergency/* 等鉴权请求不带 Authorization 头 → 全站 401。
 * 修复：在子应用上下文中改读主壳经 window.$wujie.props.getAccessToken 下传的实时令牌
 * （主壳登录后持有，且随刷新更新）。主壳（window.$wujie 未定义）仍走本地 accessToken。
 * 仅桥接「读取」：子应用不持有/不清空主壳令牌，避免子应用一次瞬态 401 误登出整个主壳。
 */
function hostGetAccessToken(): string | null | undefined {
  const wj = (
    globalThis as unknown as { $wujie?: { props?: { getAccessToken?: () => string | null } } }
  ).$wujie;
  if (wj && wj.props && typeof wj.props.getAccessToken === 'function') {
    return wj.props.getAccessToken();
  }
  return undefined;
}

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  const fromHost = hostGetAccessToken();
  if (fromHost !== undefined) return fromHost;
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
}
