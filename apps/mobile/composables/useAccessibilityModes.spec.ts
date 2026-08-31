// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useAccessibilityModes, initAccessibilityModes } from './useAccessibilityModes';

describe('useAccessibilityModes', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.skin;
    delete document.documentElement.dataset.elder;
    initAccessibilityModes(); // 复位为默认（适老关 / 户外关）
  });

  it('init 从 localStorage 注入户外皮肤', () => {
    localStorage.setItem('mm-mb-outdoor', '1');
    initAccessibilityModes();
    expect(document.documentElement.dataset.skin).toBe('outdoor');
  });

  it('init 从 localStorage 注入适老模式', () => {
    localStorage.setItem('mm-mb-elder', '1');
    initAccessibilityModes();
    expect(document.documentElement.dataset.elder).toBe('on');
  });

  it('切换户外写回 dataset 与 localStorage', () => {
    const { outdoor } = useAccessibilityModes();
    outdoor.value = true;
    expect(document.documentElement.dataset.skin).toBe('outdoor');
    expect(localStorage.getItem('mm-mb-outdoor')).toBe('1');
    outdoor.value = false;
    expect(document.documentElement.dataset.skin).toBeUndefined();
    expect(localStorage.getItem('mm-mb-outdoor')).toBe('0');
  });

  it('开启适老写入 dataset.elder=on 与 localStorage', () => {
    const { elder } = useAccessibilityModes();
    elder.value = true;
    expect(document.documentElement.dataset.elder).toBe('on');
    expect(localStorage.getItem('mm-mb-elder')).toBe('1');
  });

  it('关闭适老清空 dataset.elder 并写回 0', () => {
    const { elder } = useAccessibilityModes();
    elder.value = true;
    expect(document.documentElement.dataset.elder).toBe('on');
    elder.value = false;
    expect(document.documentElement.dataset.elder).toBeUndefined();
    expect(localStorage.getItem('mm-mb-elder')).toBe('0');
  });
});
