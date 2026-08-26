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

  it('左侧面板不含「应急态势」卡组（已下线）', async () => {
    const wrapper = mountDash();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const left = wrapper.find('.dash-left');
    expect(left.find('.stat-grid').exists()).toBe(false);
  });

  it('左侧应急事件 CRUD + 右侧值班/力量/知识面板', async () => {
    const wrapper = mountDash();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const left = wrapper.find('.dash-left');
    // 应急事件 CRUD 工具栏 + 表格存在
    expect(left.find('[data-test="crud-toolbar"]').exists()).toBe(true);
    expect(left.find('[data-test="crud-table"]').exists()).toBe(true);
    const right = wrapper.find('.dash-right');
    // 右侧挂载 3 个 panel: 值班值守 + 应急力量数据 + 应急生产安全知识
    expect(right.find('[data-test="duty-toolbar"]').exists()).toBe(true);
    expect(right.find('[data-test="emergency-strength-grid"]').exists()).toBe(true);
    expect(right.find('[data-test="emergency-knowledge-grid"]').exists()).toBe(true);
  });

  it('加载完成后展示趋势图容器并隐藏骨架屏', async () => {
    const wrapper = mountDash();
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.chart').exists()).toBe(true);
    expect(wrapper.find('[data-test="dashboard-skeleton"]').exists()).toBe(false);
  });

  it('已移除顶部核心指标条（主界面级态势概览）', async () => {
    const wrapper = mountDash();
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="dashboard-kpi"]').exists()).toBe(false);
    expect(wrapper.find('.dash-kpi').exists()).toBe(false);
  });
});
