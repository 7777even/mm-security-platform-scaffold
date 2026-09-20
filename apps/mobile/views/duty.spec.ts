// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

// 写接口与读接口一并 mock，避免触达真实后端 / 离线告警。
const mocks = vi.hoisted(() => ({
  createDutySignIn: vi.fn(),
  fetchDutySignIns: vi.fn(),
  fetchDutyRoster: vi.fn(),
}));

vi.mock('@/services/businessWrite', () => ({
  fetchDutySignIns: (...a: unknown[]) => mocks.fetchDutySignIns(...a),
  createDutySignIn: (...a: unknown[]) => mocks.createDutySignIn(...a),
}));

vi.mock('@/services/duty', () => ({
  fetchDutyRoster: (...a: unknown[]) => mocks.fetchDutyRoster(...a),
}));

vi.mock('element-plus', async () => {
  const actual = await vi.importActual<typeof import('element-plus')>('element-plus');
  return {
    ...actual,
    ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
  };
});

import duty from './duty.vue';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
  mocks.createDutySignIn.mockResolvedValue({ id: 1 });
  mocks.fetchDutySignIns.mockResolvedValue([]);
  mocks.fetchDutyRoster.mockResolvedValue({ departments: ['全部'], shift: '白班', members: [] });
});

const mountView = () =>
  mount(duty, {
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  });

describe('移动端今日值班页 · 签到写入口', () => {
  it('渲染「我要签到」按钮', async () => {
    const w = mountView();
    await flushPromises();
    const btn = w.findAll('button').find((b) => b.text().includes('我要签到'));
    expect(btn).toBeTruthy();
  });

  it('点击「我要签到」调用 createDutySignIn(SIGN_IN) 且 personName 取当前用户、dutyDate 为今日', async () => {
    const w = mountView();
    await flushPromises();
    const btn = w.findAll('button').find((b) => b.text().includes('我要签到'))!;
    await btn.trigger('click');
    await flushPromises();
    expect(mocks.createDutySignIn).toHaveBeenCalledTimes(1);
    const payload = mocks.createDutySignIn.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.signAction).toBe('SIGN_IN');
    expect(payload.personName).toBeTruthy();
    expect(String(payload.dutyDate)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
