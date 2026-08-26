// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExtremeWeather from './index.vue';
import StatCard from '@/components/common/StatCard.vue';
import AlarmCard from '@/components/common/AlarmCard.vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';

describe('极端天气风险应急 模块', () => {
  const mountView = () => mount(ExtremeWeather, { global: { stubs: { BaseMap: true } } });

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
