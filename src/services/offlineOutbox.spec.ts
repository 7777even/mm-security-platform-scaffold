import { describe, it, expect, vi } from 'vitest';
import { OfflineOutbox, LocalStorageStore, createHttpSubmit } from '@/services/offlineOutbox';

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

  it('retry 重置失败项后可在线下补传成功', async () => {
    const submit = vi.fn().mockRejectedValue(new Error('boom'));
    const ob = new OfflineOutbox({
      storage: memStore(),
      submit,
      onlineCheck: () => true,
      maxRetries: 1,
    });
    const item = await ob.enqueue({ kind: 'field-report', title: 't' });
    await ob.flush();
    expect((await ob.list())[0].status).toBe('failed');
    submit.mockResolvedValue(undefined);
    await ob.retry(item.id);
    const r = await ob.flush();
    expect(r.synced).toBe(1);
    expect((await ob.list())[0].status).toBe('done');
  });

  it('retry 不存在的 id 静默返回', async () => {
    const ob = new OfflineOutbox({ storage: memStore(), submit: vi.fn(), onlineCheck: () => true });
    await expect(ob.retry('nope')).resolves.toBeUndefined();
  });

  it('subscribe 立即推送快照且 enqueue 触发回调', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const ob = new OfflineOutbox({ storage: memStore(), submit, onlineCheck: () => true });
    const seen: string[][] = [];
    const unsub = ob.subscribe((items) => seen.push(items.map((i) => i.id)));
    await ob.enqueue({ kind: 'field-report', title: 'a' });
    expect(seen.length).toBeGreaterThanOrEqual(2);
    unsub();
    await ob.enqueue({ kind: 'field-report', title: 'b' });
    // 取消订阅后不再有新推送
    expect(seen[seen.length - 1].length).toBe(1);
  });

  it('startAutoFlush/stopAutoFlush 绑定与解绑 online 事件', async () => {
    const add = vi.fn();
    const remove = vi.fn();
    vi.stubGlobal('window', { addEventListener: add, removeEventListener: remove });
    const submit = vi.fn().mockResolvedValue(undefined);
    const ob = new OfflineOutbox({ storage: memStore(), submit, onlineCheck: () => true });
    ob.startAutoFlush();
    expect(add).toHaveBeenCalledWith('online', expect.any(Function));
    ob.stopAutoFlush();
    expect(remove).toHaveBeenCalledWith('online', expect.any(Function));
    vi.unstubAllGlobals();
  });

  it('read 解析损坏 JSON 时回退空数组', async () => {
    const broken = {
      get: () => Promise.resolve('not-json'),
      set: () => Promise.resolve(),
    };
    const ob = new OfflineOutbox({ storage: broken, submit: vi.fn(), onlineCheck: () => true });
    expect(await ob.list()).toEqual([]);
  });

  it('LocalStorageStore 在注入 localStorage 时读写、缺失时返回 null', async () => {
    const fake = new Map<string, string>();
    const ls = {
      getItem: (k: string): string | null => fake.get(k) ?? null,
      setItem: (k: string, v: string): void => {
        fake.set(k, v);
      },
      removeItem: (k: string): void => {
        fake.delete(k);
      },
    };
    vi.stubGlobal('localStorage', ls);
    const store = new LocalStorageStore('ut');
    await store.set('k', 'v');
    expect(await store.get('k')).toBe('v');
    vi.stubGlobal('localStorage', undefined);
    expect(await store.get('k')).toBeNull();
    vi.unstubAllGlobals();
  });

  it('createHttpSubmit 成功 POST、非 2xx 抛错', async () => {
    const submit = createHttpSubmit('/x');
    const ok = new Response('{}', { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok));
    await expect(
      submit({
        id: '1',
        kind: 'field-report',
        title: 't',
        createdAt: 0,
        status: 'pending',
        attempts: 0,
      }),
    ).resolves.toBeUndefined();
    const bad = new Response('', { status: 500 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(bad));
    await expect(
      submit({
        id: '1',
        kind: 'field-report',
        title: 't',
        createdAt: 0,
        status: 'pending',
        attempts: 0,
      }),
    ).rejects.toThrow(/回传失败/);
    vi.unstubAllGlobals();
  });
});
