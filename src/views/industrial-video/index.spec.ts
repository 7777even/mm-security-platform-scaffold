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

import IndustrialVideo from './index.vue';
import StatCard from '@/components/common/StatCard.vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';

describe('工业视频 模块', () => {
  const mountView = () => mount(IndustrialVideo);

  it('渲染双栏面板骨架与 4 张视频概览 KPI 卡', () => {
    const wrapper = mountView();
    expect(wrapper.findComponent(ModuleLayout).exists()).toBe(true);
    expect(wrapper.findAllComponents(StatCard).length).toBe(4);
  });

  it('渲染视频通道列表（含在线/故障状态）', () => {
    const wrapper = mountView();
    expect(wrapper.find('[data-test="channel-list"]').exists()).toBe(true);
    expect(wrapper.findAll('.channel-card').length).toBeGreaterThan(0);
    expect(wrapper.find('.channel-card.is-offline').exists()).toBe(true);
  });
});
