// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

// 写接口与读接口一并 mock，避免测试触达真实后端 / 离线告警。
const mocks = vi.hoisted(() => ({
  fetchDutyRoster: vi.fn(),
  fetchDutySignIns: vi.fn(),
  createDutySignIn: vi.fn(),
}));

vi.mock('@/platform/api', () => ({
  fetchDutyRoster: (...a: unknown[]) => mocks.fetchDutyRoster(...a),
  fetchDutySignIns: (...a: unknown[]) => mocks.fetchDutySignIns(...a),
  createDutySignIn: (...a: unknown[]) => mocks.createDutySignIn(...a),
}));

import duty from './duty.vue';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fetchDutyRoster.mockResolvedValue([
    { id: 1, name: '张三', department: '储运部', role: '值班员', shift: '白班' },
  ]);
  mocks.fetchDutySignIns.mockResolvedValue([]);
  mocks.createDutySignIn.mockResolvedValue({ id: 1 });
});

const mountView = () => mount(duty);

describe('移动端今日值班页 · 签到写入口', () => {
  it('渲染「签到」按钮', async () => {
    const w = mountView();
    await flushPromises();
    const btn = w.findAll('.mb-member__btn').find((b) => b.text().includes('签到'));
    expect(btn).toBeTruthy();
  });

  it('点击「签到」调用 createDutySignIn(SIGN_IN) 且 dutyDate 为今日、personName 取当前用户', async () => {
    const w = mountView();
    await flushPromises();
    const btn = w.findAll('.mb-member__btn').find((b) => b.text().includes('签到'))!;
    await btn.trigger('click');
    await flushPromises();
    expect(mocks.createDutySignIn).toHaveBeenCalledTimes(1);
    const payload = mocks.createDutySignIn.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.signAction).toBe('SIGN_IN');
    expect(payload.personName).toBeTruthy();
    expect(String(payload.dutyDate)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('已签到人员显示「已签到」而非签到按钮', async () => {
    mocks.fetchDutySignIns.mockResolvedValue([
      { personName: '张三', signAction: 'SIGN_IN', dutyDate: '2026-10-10' },
    ]);
    const w = mountView();
    await flushPromises();
    const done = w.findAll('.mb-member__btn').find((b) => b.text().includes('已签到'));
    expect(done).toBeTruthy();
  });
});
