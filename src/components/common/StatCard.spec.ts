// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StatCard from './StatCard.vue';

describe('StatCard — §9.1', () => {
  it('渲染 title 与 value', () => {
    const w = mount(StatCard, { props: { title: '门禁通道', value: 596 } });
    expect(w.text()).toContain('门禁通道');
    expect(w.text()).toContain('596');
    expect(w.find('.stat-card').exists()).toBe(true);
    expect(w.find('.stat-card__value').exists()).toBe(true);
  });

  it('无 icon 时不渲染图标区域', () => {
    const w = mount(StatCard, { props: { title: 'A', value: '1' } });
    expect(w.find('.stat-card__icon').exists()).toBe(false);
  });

  it('icon 字符串匹配 ElementPlus 图标时渲染', () => {
    const w = mount(StatCard, { props: { title: 'A', value: '1', icon: 'Bell' } });
    expect(w.find('.stat-card__icon').exists()).toBe(true);
  });
});
