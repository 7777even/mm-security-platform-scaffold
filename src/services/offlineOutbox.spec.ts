import { describe, it, expect, vi } from 'vitest';
import { OfflineOutbox } from '@/services/offlineOutbox';

function memStore() {
  const m = new Map<string, string>();
  return {
    get: (k: string) => Promise.resolve(m.get(k) ?? null),
    set: (k: string, v: string) => {
      m.set(k, v);
      return Promise.resolve();
    },
  };
}

describe('offlineOutbox 离线优先回传（D1 §9.4/§2.14）', () => {
  it('在线 enqueue 后 flush 成功置 done', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const ob = new OfflineOutbox({ storage: memStore(), submit, onlineCheck: () => true });
    const item = await ob.enqueue({ kind: 'field-report', title: 't' });
    const r = await ob.flush();
    expect(r.synced).toBe(1);
    const list = await ob.list();
    expect(list[0].id).toBe(item.id);
    expect(list[0].status).toBe('done');
  });

  it('离线 enqueue 不丢，在线后补传', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    let online = false;
    const ob = new OfflineOutbox({ storage: memStore(), submit, onlineCheck: () => online });
    await ob.enqueue({ kind: 'field-report', title: 't' });
    expect((await ob.flush()).synced).toBe(0);
    online = true;
    expect((await ob.flush()).synced).toBe(1);
  });

  it('提交失败置 failed 不阻塞其他项', async () => {
    const submit = vi.fn().mockRejectedValue(new Error('boom'));
    const ob = new OfflineOutbox({
      storage: memStore(),
      submit,
      onlineCheck: () => true,
      maxRetries: 1,
    });
    await ob.enqueue({ kind: 'field-report', title: 't' });
    const r = await ob.flush();
    expect(r.failed).toBe(1);
    const list = await ob.list();
    expect(list[0].status).toBe('failed');
  });
});
