// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('element-plus', () => ({
  ElMessage: { info: vi.fn() },
}));

import { ElMessage } from 'element-plus';
import { initAccessibilityModes } from '../composables/useAccessibilityModes';
import Profile from './profile.vue';

describe('移动端「我的」页', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.skin;
    delete document.documentElement.dataset.elder;
    localStorage.clear();
    initAccessibilityModes();
    vi.mocked(ElMessage.info).mockClear();
  });
  afterEach(() => {
    delete document.documentElement.dataset.skin;
    delete document.documentElement.dataset.elder;
  });

  const mountProfile = () =>
    mount(Profile, {
      global: { stubs: { TabBar: true, RouterLink: true } },
    });

  it('渲染用户信息（姓名/角色）', () => {
    const w = mountProfile();
    expect(w.text()).toContain('张工');
    expect(w.text()).toContain('消防业务管理员 · 储运部 · MM-2018');
  });

  it('渲染 9 个功能菜单项', () => {
    const w = mountProfile();
    const items = w.findAll('.mb-menu-item');
    expect(items.length).toBe(9);
    const labels = items.map((i) => i.find('.mb-menu-label').text());
    expect(labels).toEqual([
      '通讯录',
      '今日值班',
      '应急预案',
      '化学品知识（MSDS）',
      '应急资源',
      '辅助资料库',
      '演练信息',
      '运维监测看板',
      '系统设置',
    ]);
  });

  it('渲染 2 个设置项', () => {
    const w = mountProfile();
    const items = w.findAll('.mb-setting-item');
    expect(items.length).toBe(2);
    const labels = items.map((i) => i.find('.mb-setting-label').text());
    expect(labels).toEqual(['适老模式', '户外模式']);
  });

  it('点击菜单项触发占位提示', async () => {
    const w = mountProfile();
    await w.findAll('.mb-menu-item')[0].trigger('click');
    expect(ElMessage.info).toHaveBeenCalled();
  });

  it('适老模式渲染为开关（默认关闭）', () => {
    const w = mountProfile();
    const item = w
      .findAll('.mb-setting-item')
      .find((i) => i.find('.mb-setting-label').text() === '适老模式')!;
    const sw = item.find('.mb-switch');
    expect(sw.exists()).toBe(true);
    expect(sw.attributes('aria-checked')).toBe('false');
  });

  it('点击适老开关设置根节点 data-elder=on', async () => {
    const w = mountProfile();
    const item = w
      .findAll('.mb-setting-item')
      .find((i) => i.find('.mb-setting-label').text() === '适老模式')!;
    await item.find('.mb-switch').trigger('click');
    expect(document.documentElement.dataset.elder).toBe('on');
  });

  it('再次点击适老开关清空根节点 data-elder', async () => {
    const w = mountProfile();
    const item = w
      .findAll('.mb-setting-item')
      .find((i) => i.find('.mb-setting-label').text() === '适老模式')!;
    await item.find('.mb-switch').trigger('click');
    await item.find('.mb-switch').trigger('click');
    expect(document.documentElement.dataset.elder).toBeUndefined();
  });

  it('切换户外模式设置根节点 data-skin', async () => {
    const w = mountProfile();
    const item = w
      .findAll('.mb-setting-item')
      .find((i) => i.find('.mb-setting-label').text() === '户外模式')!;
    const sw = item.find('.mb-switch');
    expect(sw.exists()).toBe(true);
    await sw.trigger('click');
    expect(document.documentElement.dataset.skin).toBe('outdoor');
    await sw.trigger('click');
    expect(document.documentElement.dataset.skin).toBeUndefined();
  });

  it('顶栏使用统一 MobileHeader 组件（品牌头，导航→/tasks）', () => {
    const w = mountProfile();
    expect(w.find('.mb-header').exists()).toBe(true);
    expect(w.find('.profile-header').exists()).toBe(false);
    const nav = w.find('.mb-header__nav');
    expect(nav.exists()).toBe(true);
    expect(nav.attributes('to')).toBe('/tasks');
  });
});
