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

import ExtremeWeather from './index.vue';
import StatCard from '@/components/common/StatCard.vue';
import AlarmCard from '@/components/common/AlarmCard.vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';

describe('极端天气风险应急 模块', () => {
  const mountView = () => mount(ExtremeWeather);

  it('渲染双栏面板骨架与 4 张气象预警 KPI 卡', () => {
    const wrapper = mountView();
    expect(wrapper.findComponent(ModuleLayout).exists()).toBe(true);
    expect(wrapper.findAllComponents(StatCard).length).toBe(4);
  });

  it('渲染极端天气风险点告警卡', () => {
    const wrapper = mountView();
    expect(wrapper.findAllComponents(AlarmCard).length).toBeGreaterThan(0);
  });
});
