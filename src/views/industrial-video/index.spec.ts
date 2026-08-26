// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import IndustrialVideo from './index.vue';
import StatCard from '@/components/common/StatCard.vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';

describe('工业视频 模块', () => {
  const mountView = () => mount(IndustrialVideo, { global: { stubs: { BaseMap: true } } });

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
