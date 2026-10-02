// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import SafetyAlarmPanel from './SafetyAlarmPanel.vue';

/**
 * 三端实时联通（ fire-alarm.alarm 域）接线回归：
 * 本面板「进行中报警」只取 status=ACTIVE，且自分取自 GET /fire-alarms（不走 screenFireAlarms），
 * 因此若未订阅 fire-alarm.alarm.changed，管理后台新增/删除/流转后的报警不会在大屏自动出现/消失。
 * 本用例锁定「挂载时订阅该域 + 变更到达即重拉列表」，防止该接线被后续重构摘掉。
 */

const { alarmList, mockFetchFireAlarmPage, subscribeCalls } = vi.hoisted(() => {
  const list: Array<{ alarmId: string; status: string; title: string }> = [];
  return {
    alarmList: list,
    mockFetchFireAlarmPage: vi.fn(() =>
      Promise.resolve({ list, total: list.length, page: 1, size: 1000 }),
    ),
    subscribeCalls: [] as Array<{ domain: string; handler: () => void }>,
  };
});

vi.mock('@/services/alarm', () => ({
  fetchFireAlarmPage: mockFetchFireAlarmPage,
}));

vi.mock('@/services/realtime', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    subscribeDomainChange: (domain: string, handler: () => void) => {
      subscribeCalls.push({ domain, handler });
      return () => {};
    },
  };
});

vi.mock('@/services/fireSituation', () => ({
  fetchFireMonitorAreas: () => Promise.resolve([]),
}));

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));

async function mountPanel() {
  const wrapper = mount(SafetyAlarmPanel, { shallow: true });
  await flushPromises();
  return wrapper;
}

describe('SafetyAlarmPanel 消防报警实时订阅', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscribeCalls.length = 0;
    alarmList.length = 0;
    alarmList.push({ alarmId: 'FA-1', status: 'ACTIVE', title: '初始报警' });
  });

  it('挂载时订阅 fire-alarm.alarm 域变更', async () => {
    await mountPanel();

    expect(subscribeCalls.map((c) => c.domain)).toContain('fire-alarm.alarm');
  });

  it('域变更到达后重拉消防报警列表（后台新增可即时出现）', async () => {
    const initialCalls = mockFetchFireAlarmPage.mock.calls.length;
    const wrapper = await mountPanel();
    // 挂载自身先拉一次
    expect(mockFetchFireAlarmPage.mock.calls.length).toBeGreaterThan(initialCalls);

    // 模拟后端广播（管理后台新增一条报警）
    alarmList.push({ alarmId: 'FA-2', status: 'ACTIVE', title: '后台新增报警' });
    const sub = subscribeCalls.find((c) => c.domain === 'fire-alarm.alarm');
    expect(sub).toBeTruthy();
    const before = mockFetchFireAlarmPage.mock.calls.length;
    sub!.handler();
    await flushPromises();

    expect(mockFetchFireAlarmPage.mock.calls.length).toBe(before + 1);
    wrapper.unmount();
  });
});
