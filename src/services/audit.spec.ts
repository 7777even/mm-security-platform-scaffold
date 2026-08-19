import { describe, it, expect, beforeEach } from 'vitest';
import { reportAudit, flushAudit, __setAuditSubmit, __resetAudit } from '@/services/audit';

describe('audit 审计埋点（D1 C-2）', () => {
  beforeEach(() => __resetAudit());

  it('reportAudit 后 flush 经提交函数落库，缓冲清空', async () => {
    const submitted: AuditEvent[] = [];
    __setAuditSubmit(async (events) => {
      submitted.push(...events);
    });
    reportAudit({ action: 'login' });
    const res = await flushAudit();
    expect(res.synced).toBe(1);
    expect(res.pending).toBe(0);
    expect(submitted[0].action).toBe('login');
    expect(typeof submitted[0].at).toBe('number');
  });

  it('提交失败时保留缓冲（离线优先，不丢事件）', async () => {
    __setAuditSubmit(async () => {
      throw new Error('offline');
    });
    reportAudit({ action: 'login' });
    const res = await flushAudit();
    expect(res.synced).toBe(0);
    expect(res.pending).toBe(1);
  });

  it('多条事件合并为单次批量提交', async () => {
    const batches: AuditEvent[][] = [];
    __setAuditSubmit(async (events) => {
      batches.push(events);
    });
    reportAudit({ action: 'a' });
    reportAudit({ action: 'b' });
    const res = await flushAudit();
    expect(res.synced).toBe(2);
    expect(batches).toHaveLength(1);
    expect(batches[0]).toHaveLength(2);
  });
});

interface AuditEvent {
  action: string;
  module?: string;
  detail?: Record<string, unknown>;
  at?: number;
}
