import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchEmergencyStrength } from './emergency';

vi.mock('@/services/http', () => ({
  request: vi.fn(),
}));

import { request } from '@/services/http';

describe('fetchEmergencyStrength', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('dev 无 VITE_API_BASE 时回退内置 fixture（不白屏）', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    const res = await fetchEmergencyStrength();
    expect(res.resources).toHaveLength(8);
    expect(res.resources.map((r) => r.kind)).toEqual([
      '应急专家',
      '应急物资',
      '救援队伍',
      '装备车辆',
      '应急场所',
      '医疗机构',
      '应急车辆',
      '消防设施',
    ]);
    expect(res.resources[0]!.count).toBe(47);
  });

  it('有 VITE_API_BASE 时走 request 真实调用（B3 包络）', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const fake = { resources: [{ kind: '应急专家', count: 12, icon: 'UserFilled' }] };
    (request as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(fake);
    const res = await fetchEmergencyStrength();
    expect(request).toHaveBeenCalledWith({ url: '/emergency/strength', method: 'GET' });
    expect(res).toBe(fake);
  });

  it('真实接口返回非法结构时返回空态并告警（不再用假数据冒充后端）', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (request as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ foo: 1 });

    const res = await fetchEmergencyStrength();

    // 配了后端地址却拿到不符契约的响应 → 必须暴露为空态，否则缺口会被 fixture 掩盖
    expect(res.resources).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/emergency/strength'));
    warn.mockRestore();
  });

  it('真实接口抛错时返回空态并告警', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (request as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));

    const res = await fetchEmergencyStrength();

    expect(res.resources).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('emergencyEventStore CRUD（dev mock 兜底，无后端时保持演示态）', () => {
  let store: typeof import('./emergencyEventStore');

  beforeEach(async () => {
    vi.resetModules();
    store = await import('./emergencyEventStore');
  });

  it('mockPage 分页返回切片与总数（seed=9）', () => {
    const r1 = store.mockPage(1, 3);
    expect(r1.total).toBe(9);
    expect(r1.list).toHaveLength(3);
    expect(r1.list[0]!.alarmId).toBe('AE-2026-001');
    expect(store.mockPage(4, 3).list).toHaveLength(0);
  });

  it('mockCreate 在头部插入并推导 category/warned/title', () => {
    const before = store.mockPage(1, 100).total;
    const created = store.mockCreate({
      level: 2,
      type: 'FIRE',
      deviceCode: 'DT-X',
      location: '测试点',
      description: '测试',
    });
    expect(created.alarmId).toMatch(/^AE-/);
    expect(created.category).toBe('FIRE_PHONE');
    expect(created.warned).toBe(true);
    expect(created.title).toContain('测试点');
    expect(store.mockPage(1, 100).total).toBe(before + 1);
  });

  it('mockUpdate 更新字段并重新推导派生项', () => {
    const updated = store.mockUpdate('AE-2026-002', {
      level: 1,
      type: 'GAS',
      deviceCode: 'GS-X',
      location: '储罐Y',
      description: '泄漏',
    });
    expect(updated).not.toBeNull();
    expect(updated!.category).toBe('STORAGE_FIRE');
    expect(updated!.warned).toBe(true);
    expect(updated!.title).toContain('储罐Y');
  });

  it('mockDelete 删除存在项返回 true，重复删除返回 false', () => {
    const before = store.mockPage(1, 100).total;
    expect(store.mockDelete('AE-2026-003')).toBe(true);
    expect(store.mockPage(1, 100).total).toBe(before - 1);
    expect(store.mockDelete('AE-2026-003')).toBe(false);
  });
});
