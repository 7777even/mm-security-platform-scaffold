// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MobileHeader from './MobileHeader.vue';

describe('移动端统一顶栏 MobileHeader', () => {
  it('brand 变体：渲染标题、副标题与导航链接(/tasks)', () => {
    const w = mount(MobileHeader, {
      props: { variant: 'brand', title: '安全管控指挥系统', subtitle: '茂名石化' },
      global: { stubs: { RouterLink: true } },
    });
    expect(w.find('.mb-header').exists()).toBe(true);
    expect(w.find('.mb-header__title').text()).toBe('安全管控指挥系统');
    expect(w.find('.mb-header__sub').text()).toBe('茂名石化');
    const nav = w.find('.mb-header__nav');
    expect(nav.exists()).toBe(true);
    expect(nav.attributes('to')).toBe('/tasks');
    expect(nav.attributes('aria-label')).toBe('导航');
  });

  it('brand 变体：navTo 传空串时隐藏导航', () => {
    const w = mount(MobileHeader, {
      props: { variant: 'brand', title: '我的', navTo: '' },
      global: { stubs: { RouterLink: true } },
    });
    expect(w.find('.mb-header__nav').exists()).toBe(false);
  });

  it('back 变体：渲染返回链接(默认 /messages)与居中标题', () => {
    const w = mount(MobileHeader, {
      props: { variant: 'back', title: '通知历史' },
      global: { stubs: { RouterLink: true } },
    });
    expect(w.find('.mb-header--back').exists()).toBe(true);
    const back = w.find('.mb-header__back');
    expect(back.attributes('to')).toBe('/messages');
    expect(back.attributes('aria-label')).toBe('返回');
    expect(w.find('.mb-header__title--center').text()).toBe('通知历史');
  });

  it('back 变体：支持自定义 backTo', () => {
    const w = mount(MobileHeader, {
      props: { variant: 'back', title: '详情', backTo: '/home' },
      global: { stubs: { RouterLink: true } },
    });
    expect(w.find('.mb-header__back').attributes('to')).toBe('/home');
  });
});
