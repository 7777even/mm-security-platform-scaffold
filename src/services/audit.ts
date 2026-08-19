import http from '@/services/http';

// 统一前端操作审计埋点（D1 C-2 等保二级「安全审计」）。
// 设计：事件先入内存缓冲，随后异步落库；提交失败保留缓冲（离线优先，不丢事件）。
// 与 offlineOutbox 解耦：audit 关注「操作日志上行」，offlineOutbox 关注「现场采集数据上行」。

export interface AuditEvent {
  action: string;
  module?: string;
  detail?: Record<string, unknown>;
  at?: number;
}

export type AuditSubmit = (events: AuditEvent[]) => Promise<void>;

const ENDPOINT = '/audit/log';

let buffer: AuditEvent[] = [];
let inflight: Promise<{ synced: number; pending: number }> | null = null;

function defaultSubmit(events: AuditEvent[]): Promise<void> {
  return http.post(ENDPOINT, { events }).then(() => undefined);
}

let submitFn: AuditSubmit = defaultSubmit;

/** 测试注入提交函数，避免真实网络依赖。 */
export function __setAuditSubmit(fn: AuditSubmit): void {
  submitFn = fn;
}

/** 上报一条审计事件（登录/路由查看/指令查看等）。异步尽力落库，不阻断业务。 */
export function reportAudit(event: AuditEvent): void {
  buffer.push({ ...event, at: event.at ?? Date.now() });
  void flushAudit();
}

/** 落库缓冲：并发 flush 合并到同一 inflight；提交失败保留缓冲待下次 flush。 */
export async function flushAudit(): Promise<{ synced: number; pending: number }> {
  if (inflight) return inflight;
  if (buffer.length === 0) return { synced: 0, pending: 0 };
  const p = (async () => {
    // 让同 tick 内的后续 reportAudit 先入队，再快照批次，保证合并为单次批量
    await Promise.resolve();
    const batch = buffer.slice();
    try {
      await submitFn(batch);
      buffer = buffer.filter((e) => !batch.includes(e));
      return { synced: batch.length, pending: buffer.length };
    } catch {
      return { synced: 0, pending: buffer.length };
    }
  })();
  inflight = p;
  try {
    return await p;
  } finally {
    inflight = null;
  }
}

/** 测试辅助：清空缓冲与提交函数。 */
export function __resetAudit(): void {
  buffer = [];
  inflight = null;
  submitFn = defaultSubmit;
}
