// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';

// 隔离 @/platform/storage：useAccessibilityModes 是模块级单例 ref，状态会经 setItem 持久化到
// storage 的内存 Map，若不在每个测试重置会跨用例泄漏（前一个用例把 elder 写为 '1'，导致后续用例
// initAccessibilityModes 从 storage 恢复成 true，破坏独立性）。此处 mock 为独立、默认返回 null。
vi.mock('@/platform/storage', () => ({
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}));

import { initAccessibilityModes } from '@/composables/useAccessibilityModes';
import Profile from './profile.vue';

/** 9 条功能菜单（对齐 profile.vue 的 menuItems） */
const MENUS = [
  { label: '通讯录', to: '/contacts' },
  { label: '今日值班', to: '/duty' },
  { label: '应急预案', to: '/plans' },
  { label: '化学品知识（MSDS）', to: '/msds' },
  { label: '应急资源', to: '/resources' },
  { label: '辅助资料库', to: '/library' },
  { label: '演练信息', to: '/drills' },
  { label: '运维监测看板', to: '/ops' },
  { label: '系统设置', to: '/settings' },
];

describe('移动端「我的」页', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.skin;
    delete document.documentElement.dataset.elder;
    initAccessibilityModes();
  });

  const mountProfile = () => mount(Profile);

  it('渲染用户信息（姓名/角色）', () => {
    const w = mountProfile();
    expect(w.text()).toContain('张工');
    expect(w.text()).toContain('消防业务管理员 · 储运部 · MM-2018');
  });

  it('用户卡复用共享类 .mb-usercard（实色主蓝底 + 主色上的头像）', () => {
    const w = mountProfile();
    const card = w.find('.mb-usercard');
    expect(card.exists()).toBe(true);
    expect(w.find('.mb-user-card').exists()).toBe(false);
    expect(card.find('.mb-avatar--on-primary').text()).toBe('张');
  });

  it('渲染 9 个功能菜单项', () => {
    const w = mountProfile();
    const items = w.findAll('.mb-menu-group .mb-menu__item');
    expect(items.length).toBe(9);
    expect(items.map((i) => i.find('.mb-menu__label').text())).toEqual(MENUS.map((m) => m.label));
  });

  it('功能菜单项图标统一使用 IconTile（.mb-tile）', () => {
    const w = mountProfile();
    w.findAll('.mb-menu-group .mb-menu__item').forEach((i) =>
      expect(i.find('.mb-tile').exists()).toBe(true),
    );
  });

  it('渲染 2 个设置项（适老/户外，.mb-menu__item--btn）', () => {
    const w = mountProfile();
    const items = w.findAll('.mb-menu__item--btn');
    expect(items.length).toBe(2);
    const labels = items.map((i) => i.find('.mb-menu__label').text());
    expect(labels).toEqual(['适老模式', '户外模式']);
  });

  it('设置项渲染为开关（默认关闭）', () => {
    const w = mountProfile();
    const item = w
      .findAll('.mb-menu__item--btn')
      .find((i) => i.find('.mb-menu__label').text() === '适老模式')!;
    expect(item.attributes('role')).toBe('switch');
    expect(item.attributes('aria-checked')).toBe('false');
    expect(item.find('.mb-switch').exists()).toBe(true);
  });

  it('点击适老开关设置根节点 data-elder=on', async () => {
    const w = mountProfile();
    const item = w
      .findAll('.mb-menu__item--btn')
      .find((i) => i.find('.mb-menu__label').text() === '适老模式')!;
    await item.trigger('click');
    expect(document.documentElement.dataset.elder).toBe('on');
  });

  it('再次点击适老开关清空根节点 data-elder', async () => {
    const w = mountProfile();
    const item = w
      .findAll('.mb-menu__item--btn')
      .find((i) => i.find('.mb-menu__label').text() === '适老模式')!;
    await item.trigger('click');
    expect(document.documentElement.dataset.elder).toBe('on');
    await item.trigger('click');
    expect(document.documentElement.dataset.elder).toBeUndefined();
  });

  it('切换户外模式设置根节点 data-skin', async () => {
    const w = mountProfile();
    const item = w
      .findAll('.mb-menu__item--btn')
      .find((i) => i.find('.mb-menu__label').text() === '户外模式')!;
    await item.trigger('click');
    expect(document.documentElement.dataset.skin).toBe('outdoor');
    await item.trigger('click');
    expect(document.documentElement.dataset.skin).toBeUndefined();
  });

  it('顶栏使用统一 MobileHeader 组件（品牌头）', () => {
    const w = mountProfile();
    expect(w.find('.mb-header').exists()).toBe(true);
    expect(w.find('.profile-header').exists()).toBe(false);
  });
});
