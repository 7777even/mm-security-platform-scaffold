// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

// jsdom 无 canvas，mock echarts 避免 renderChart 抛错
vi.mock('echarts/core', () => ({
  use: vi.fn(),
  init: vi.fn(() => ({ setOption: vi.fn(), dispose: vi.fn(), resize: vi.fn() })),
  graphic: { LinearGradient: class {} },
}));

// 避免真实网络请求，mock 数据服务走成功分支（渲染真实面板/告警列表）
vi.mock('@/services/alarm', () => ({
  fetchDashboardOverview: vi.fn(async () => ({
    deviceOnline: 1200,
    activeAlarm: 8,
    riskIndex: 3.4,
    onlineWorkstation: 42,
  })),
  fetchAlarmTrend: vi.fn(async () => Array.from({ length: 24 }, (_, i) => ({ count: i }))),
  fetchAlarmPage: vi.fn(async () => ({
    list: [
      {
        alarmId: 'a1',
        level: 3,
        type: 'FIRE',
        status: 'ACTIVE',
        deviceCode: 'DEV0001',
        location: 'B1 消防泵房',
        ts: '2026-08-20T01:00:00.000Z',
        description: '烟雾阈值越限',
      },
    ],
    total: 1,
  })),
}));

vi.mock('@/services/map', () => ({
  fetchAlarmPoints: vi.fn(async () => []),
  fetchDevicePoints: vi.fn(async () => []),
  fetchRiskZones: vi.fn(async () => []),
  FALLBACK_ALARM_POINTS: [],
  FALLBACK_DEVICE_POINTS: [],
  FALLBACK_RISK_ZONES: [],
}));

import Dashboard from './index.vue';

describe('dashboard 大屏首页', () => {
  const mountDash = () => mount(Dashboard, { global: { stubs: { BaseMap: true } } });

  it('渲染左/右面板与中央地图三栏', async () => {
    const wrapper = mountDash();
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.dash-left').exists()).toBe(true);
    expect(wrapper.find('.dash-right').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'BaseMap' }).exists()).toBe(true);
  });

  it('统计卡位于左侧面板', async () => {
    const wrapper = mountDash();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const left = wrapper.find('.dash-left');
    expect(left.find('.stat-grid').exists()).toBe(true);
  });

  it('右侧面板为实时告警列表', async () => {
    const wrapper = mountDash();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const right = wrapper.find('.dash-right');
    expect(right.find('.alarm-list').exists()).toBe(true);
  });
});
