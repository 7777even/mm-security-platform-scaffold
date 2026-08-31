// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useAccessibilityModes, initAccessibilityModes } from './useAccessibilityModes';

describe('useAccessibilityModes', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.skin;
    delete document.documentElement.dataset.elder;
    initAccessibilityModes(); // 复位为默认（standard / 户外关）
  });

  it('init 从 localStorage 注入户外皮肤', () => {
    localStorage.setItem('mm-mb-outdoor', '1');
    initAccessibilityModes();
    expect(document.documentElement.dataset.skin).toBe('outdoor');
  });

  it('init 从 localStorage 注入适老档位', () => {
    localStorage.setItem('mm-mb-elder', 'xlarge');
    initAccessibilityModes();
    expect(document.documentElement.dataset.elder).toBe('xlarge');
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

  it('切到特大档写入 dataset.elder=xlarge 与 localStorage', () => {
    const { elderTier } = useAccessibilityModes();
    elderTier.value = 'xlarge';
    expect(document.documentElement.dataset.elder).toBe('xlarge');
    expect(localStorage.getItem('mm-mb-elder')).toBe('xlarge');
  });

  it('标准档清空 dataset.elder', () => {
    const { elderTier } = useAccessibilityModes();
    elderTier.value = 'large';
    expect(document.documentElement.dataset.elder).toBe('large');
    elderTier.value = 'standard';
    expect(document.documentElement.dataset.elder).toBeUndefined();
  });
});
