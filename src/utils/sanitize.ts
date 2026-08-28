// Strict-XSS 前端过滤（详细设计 V1.5 §5.2.7：表单提交绑定 Strict-XSS 前端过滤）
//
// 出站 JSON 报文中所有字符串字段统一转义 HTML 敏感字符（& < > " '），
// 与后端防 SQL 注入拦截器形成纵深防御；FormData/Blob/Date 等非纯 JSON 结构不处理。

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch);
}

/** 深度转义：递归处理对象 / 数组中的所有字符串值（保持其余类型原样） */
export function strictSanitizeDeep<T>(value: T): T {
  if (typeof value === 'string') {
    return escapeHtml(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => strictSanitizeDeep(item)) as unknown as T;
  }
  if (
    value instanceof Date ||
    value instanceof FormData ||
    value instanceof Blob ||
    value === null
  ) {
    return value;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = strictSanitizeDeep(val);
    }
    return out as unknown as T;
  }
  return value;
}

/** 是否为可安全深拷贝的纯 JSON 请求体（拦截器用于决定是否过滤） */
export function isPlainRequestBody(data: unknown): data is Record<string, unknown> {
  if (data === null || typeof data !== 'object') return false;
  if (
    data instanceof FormData ||
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    data instanceof Date
  ) {
    return false;
  }
  if (ArrayBuffer.isView(data)) return false;
  return true;
}
