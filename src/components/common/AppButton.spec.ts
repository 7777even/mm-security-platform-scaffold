// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppButton from './AppButton.vue';

describe('AppButton', () => {
  it('渲染默认变体与中等尺寸', () => {
    const w = mount(AppButton, { slots: { default: '按钮' } });
    const btn = w.find('button');
    expect(btn.classes()).toContain('btn');
    expect(btn.classes()).toContain('btn--default');
    expect(btn.classes()).toContain('btn--md');
    expect(btn.text()).toBe('按钮');
  });

  it('渲染 primary 大尺寸', () => {
    const w = mount(AppButton, {
      props: { variant: 'primary', size: 'lg' },
      slots: { default: '启动预案' },
    });
    expect(w.find('button').classes()).toEqual(
      expect.arrayContaining(['btn', 'btn--primary', 'btn--lg']),
    );
  });

  it('danger / ghost / default 都能正确绑定类名', () => {
    for (const v of ['danger', 'ghost', 'default'] as const) {
      const w = mount(AppButton, { props: { variant: v } });
      expect(w.find('button').classes()).toContain(`btn--${v}`);
    }
  });
});
