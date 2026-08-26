// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OpsMonitor from './index.vue';
import StatCard from '@/components/common/StatCard.vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';

describe('运维监测 模块', () => {
  const mountView = () => mount(OpsMonitor, { global: { stubs: { BaseMap: true } } });

  it('渲染双栏面板骨架与 4 张运维态势 KPI 卡', () => {
    const wrapper = mountView();
    expect(wrapper.findComponent(ModuleLayout).exists()).toBe(true);
    expect(wrapper.findAllComponents(StatCard).length).toBe(4);
  });

  it('渲染设备健康与 DCS/PLC 点位状态列表', () => {
    const wrapper = mountView();
    expect(wrapper.findAll('.row-list').length).toBeGreaterThanOrEqual(2);
  });
});
