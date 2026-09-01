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

import SecurityAntiTerror from './index.vue';
import StatCard from '@/components/common/StatCard.vue';
import AlarmCard from '@/components/common/AlarmCard.vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';

// records.vue 引入 element-plus 表格样式，测试环境 stub 掉以免 .css 转换失败
vi.mock('./records.vue', () => ({
  default: { name: 'RecordsView', template: '<div class="records-view" />' },
}));

describe('治安防恐 模块', () => {
  const mountView = () =>
    mount(SecurityAntiTerror, {
      global: { stubs: { SecondaryPageOverlay: true } },
    });

  it('渲染双栏面板骨架与 4 张治安态势 KPI 卡', () => {
    const wrapper = mountView();
    expect(wrapper.findComponent(ModuleLayout).exists()).toBe(true);
    expect(wrapper.findAllComponents(StatCard).length).toBe(4);
  });

  it('渲染周界防恐告警卡列表', () => {
    const wrapper = mountView();
    expect(wrapper.findAllComponents(AlarmCard).length).toBeGreaterThan(0);
  });
});
