// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OpsMonitor from './index.vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import ProductionFacilityOverviewPanel from '@/components/ops-monitor/ProductionFacilityOverviewPanel.vue';
import EquipmentOverviewPanel from '@/components/ops-monitor/EquipmentOverviewPanel.vue';
import ProductionAlarmPanel from '@/components/ops-monitor/ProductionAlarmPanel.vue';
import MajorRiskPanel from '@/components/ops-monitor/MajorRiskPanel.vue';
import AlarmStatsBar from '@/components/ops-monitor/AlarmStatsBar.vue';

describe('生产应急 模块', () => {
  const mountView = () =>
    mount(OpsMonitor, {
      global: { stubs: { BaseMap: true } },
    });

  it('使用 ModuleLayout 骨架并装配 5 块面板', () => {
    const wrapper = mountView();
    expect(wrapper.findComponent(ModuleLayout).exists()).toBe(true);
    expect(wrapper.findComponent(ProductionFacilityOverviewPanel).exists()).toBe(true);
    expect(wrapper.findComponent(EquipmentOverviewPanel).exists()).toBe(true);
    expect(wrapper.findComponent(ProductionAlarmPanel).exists()).toBe(true);
    expect(wrapper.findComponent(MajorRiskPanel).exists()).toBe(true);
    expect(wrapper.findComponent(AlarmStatsBar).exists()).toBe(true);
  });

  it('生产区域安全告警渲染 4 条', () => {
    const wrapper = mount(ProductionAlarmPanel, {
      global: { stubs: { PanelCard: true } },
    });
    expect(wrapper.findAll('.alarm').length).toBe(4);
  });

  it('告警统计条渲染 5 项指标', () => {
    const wrapper = mount(AlarmStatsBar);
    expect(wrapper.findAll('.bar > .stat').length).toBe(5);
  });

  it('重大风险管控展示 3 色预警', () => {
    const wrapper = mount(MajorRiskPanel, {
      global: { stubs: { PanelCard: true } },
    });
    expect(wrapper.findAll('.stat').length).toBe(3);
  });
});
