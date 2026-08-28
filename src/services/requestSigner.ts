// 防重放动态签名（详细设计 V1.5 §3.3 安全接入与代理规范）
//
// 规则：`Timestamp + Nonce + Token` 以 Token 为密钥做 HMAC-SHA256 动态签名，
// 请求有效窗口严格 10 秒；网关侧对超窗 / Nonce 重复的请求一律丢弃。
// 开关 `sinopec.security.gateway-bypass`：Dev/Local 可挂起签名（IP 白名单 / 5G 专网直连），
// 生产强制启用（.env.production VITE_SECURITY_GATEWAY_BYPASS=false）。
//
// NOTE(详设 §3.3 待对齐)：签名头字段名（X-Timestamp/X-Nonce/X-Signature）与
// 签名串拼接格式为前端侧约定，需与智云能力开放中心（API 网关）联调时对齐。

/** 签名有效窗口：严格 10 秒（详设 V1.5 §3.3） */
export const SIGN_WINDOW_MS = 10_000;

export const SIGN_HEADER_TIMESTAMP = 'X-Timestamp';
export const SIGN_HEADER_NONCE = 'X-Nonce';
export const SIGN_HEADER_SIGNATURE = 'X-Signature';

/** HMAC-SHA256（hex 输出），密钥为访问令牌（详设：Token 参与签名） */
export async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export interface SignatureInput {
  /** 毫秒级时间戳字符串 */
  timestamp: string;
  /** 单次随机数（UUID），防重放 */
  nonce: string;
  /** 访问令牌（同时作为 HMAC 密钥） */
  token: string;
  method: string;
  path: string;
}

/** 组装签名串：METHOD\npath\ntimestamp\nnonce（格式待网关联调对齐） */
export async function buildSignature(input: SignatureInput): Promise<string> {
  const canonical = [input.method.toUpperCase(), input.path, input.timestamp, input.nonce].join(
    '\n',
  );
  return hmacSha256Hex(input.token, canonical);
}

export function createNonce(): string {
  return crypto.randomUUID();
}

/** 网关签名开关：bypass=true 时挂起（Dev/Local 专网直连场景） */
export function isSigningEnabled(): boolean {
  return import.meta.env.VITE_SECURITY_GATEWAY_BYPASS !== 'true';
}

/** 时间戳是否落在有效签名窗口内（网关侧同规则；前端供测试与预检用） */
export function isSignatureWindowValid(timestamp: string, now: number = Date.now()): boolean {
  const ts = Number(timestamp);
  return Number.isFinite(ts) && Math.abs(now - ts) <= SIGN_WINDOW_MS;
}
