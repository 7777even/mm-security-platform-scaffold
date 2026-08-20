// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PanelCard from './PanelCard.vue';

describe('PanelCard', () => {
  it('渲染标题与插槽内容', () => {
    const wrapper = mount(PanelCard, {
      props: { title: '实时告警' },
      slots: { default: '<p class="slot-body">内容</p>' },
    });
    expect(wrapper.text()).toContain('实时告警');
    expect(wrapper.find('.slot-body').exists()).toBe(true);
  });

  it('点击更多触发 more 事件', async () => {
    const wrapper = mount(PanelCard, {
      props: { title: '实时告警', more: '更多' },
    });
    await wrapper.find('.panel-more').trigger('click');
    expect(wrapper.emitted('more')).toBeTruthy();
  });

  it('无 more 时不渲染更多链接', () => {
    const wrapper = mount(PanelCard, { props: { title: '标题' } });
    expect(wrapper.find('.panel-more').exists()).toBe(false);
  });
});
