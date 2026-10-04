// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';
import FacilityLedgerOverviewPanel from './FacilityLedgerOverviewPanel.vue';

// 用 hoisted 保证 mock 工厂与测试断言引用的是同一个 unsub spy 实例，
// 否则 composable 实际持有的退订函数与断言追踪的函数不是同一引用（历史失败根因）。
const { subscribeDomainChange, unsubSpy } = vi.hoisted(() => {
  const unsubSpy = vi.fn();
  const subscribeDomainChange = vi.fn((_domain: string, _cb: () => void) => {
    // 每次订阅都返回同一个被追踪的退订函数（composable 实际持有它）
    return unsubSpy;
  });
  return { subscribeDomainChange, unsubSpy };
});

vi.mock('@/services/realtime', () => ({
  subscribeDomainChange,
}));

vi.mock('@/services/mgmtLedger', () => ({
  fetchMgmtLedgerList: vi.fn(() =>
    Promise.resolve({
      columns: ['编号', '名称'],
      filters: [],
      rows: [[{ text: 'T-101' }, { text: '储罐A' }]],
      rowIds: [1],
      total: 1,
      page: 1,
      size: 200,
    }),
  ),
}));

import { fetchMgmtLedgerList } from '@/services/mgmtLedger';

afterEach(() => {
  vi.clearAllMocks();
});

describe('FacilityLedgerOverviewPanel 大屏设施台账联动', () => {
  it('挂载即拉取 5 个设施台账域并订阅 mgmt-ledger', async () => {
    const wrapper = mount(FacilityLedgerOverviewPanel);
    await flushPromises();
    expect(subscribeDomainChange).toHaveBeenCalledWith('mgmt-ledger', expect.any(Function));
    // 5 个设施域（储罐/罐区/装置/仓库/库区）各拉取一次
    expect(fetchMgmtLedgerList).toHaveBeenCalledTimes(5);
    expect(wrapper.text()).toContain('设施台账总览');
    wrapper.unmount();
  });

  it('mgmt-ledger 变更回调触发重拉（与管理端编辑实时联动）', async () => {
    const wrapper = mount(FacilityLedgerOverviewPanel);
    await flushPromises();
    const before = (fetchMgmtLedgerList as unknown as { mock: { calls: unknown[] } }).mock.calls
      .length;
    const cb = subscribeDomainChange.mock.calls.find(
      (c) => c[0] === 'mgmt-ledger',
    )![1] as () => void;
    cb();
    await flushPromises();
    const after = (fetchMgmtLedgerList as unknown as { mock: { calls: unknown[] } }).mock.calls
      .length;
    expect(after).toBeGreaterThan(before);
    wrapper.unmount();
  });

  it('卸载时退订', async () => {
    const wrapper = mount(FacilityLedgerOverviewPanel);
    await flushPromises();
    // 挂载期间仅订阅（返回 unsub），尚未调用退订
    expect(unsubSpy).not.toHaveBeenCalled();
    wrapper.unmount();
    // onUnmounted 应调用 composable 实际持有的退订函数
    expect(unsubSpy).toHaveBeenCalled();
  });
});
