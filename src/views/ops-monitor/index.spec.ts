// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
// jsdom 无 WebGL/Cesium，mock 源项目地图底座与覆盖层
vi.mock('@/components/map/SharedCesiumMap.vue', () => ({
  default: { name: 'SharedCesiumMap', template: '<div class="shared-cesium-map-stub" />' },
}));
vi.mock('@/components/map/AccidentRescueMarkersOverlay.vue', () => ({
  default: { name: 'AccidentRescueMarkersOverlay', template: '<div class="map-overlay-stub" />' },
}));

import OpsMonitor from './index.vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import ProductionFacilityOverviewPanel from '@/components/ops-monitor/ProductionFacilityOverviewPanel.vue';
import EquipmentOverviewPanel from '@/components/ops-monitor/EquipmentOverviewPanel.vue';
import ProductionAlarmPanel from '@/components/ops-monitor/ProductionAlarmPanel.vue';
import MajorRiskPanel from '@/components/ops-monitor/MajorRiskPanel.vue';
import AlarmStatsBar from '@/components/ops-monitor/AlarmStatsBar.vue';

describe('生产应急 模块', () => {
  const mountView = () => mount(OpsMonitor);

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
