/*
 * tokens.spec.ts — 大屏 token 真源守门测试
 * 对应 openspec/changes/screen-fire-monitoring-skin：
 * 断言 tokens.css `:root` 大屏块的关键值已迁移至 fire-monitoring 大屏视觉体系。
 * tokens.css 是唯一权威源，本测试防止关键 token 被意外回退或删除。
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// vitest node 环境下 ?raw 导入会被 css 处理器毙掉（返回空串），改用 fs 直读源文件
const tokenCss: string = readFileSync(new URL('./tokens.css', import.meta.url), 'utf-8');

/** 从 tokens.css 原文中提取 `:root` 块内指定 token 的值 */
function tokenValue(name: string): string {
  const match = tokenCss.match(new RegExp(`--${name}:\\s*([^;]+);`));
  expect(match, `token --${name} 应存在于 tokens.css`).toBeTruthy();
  return (match?.[1] ?? '').trim();
}

describe('tokens.css 大屏块（fire-monitoring 视觉迁移）', () => {
  it('基底色板对齐源项目', () => {
    expect(tokenValue('color-bg')).toBe('#001630');
    expect(tokenValue('glass-bg')).toBe('rgb(0 35 75 / 72%)');
    expect(tokenValue('glass-border')).toBe('rgb(0 140 220 / 25%)');
    expect(tokenValue('glass-blur')).toBe('0px');
  });

  it('强调色与语义色对齐源项目', () => {
    expect(tokenValue('color-accent')).toBe('#00b4ff');
    expect(tokenValue('color-danger')).toBe('#ff5a4a');
    expect(tokenValue('color-warning')).toBe('#f0b429');
    expect(tokenValue('color-success')).toBe('#3dd68c');
  });

  it('四级报警色阶对齐源项目（红/橙/黄/紫）', () => {
    expect(tokenValue('color-alarm-1')).toBe('#ff5a4a');
    expect(tokenValue('color-alarm-2')).toBe('#ff9a3c');
    expect(tokenValue('color-alarm-3')).toBe('#f0c429');
    expect(tokenValue('color-alarm-4')).toBe('#b07aff');
  });

  it('布局尺寸对齐源项目（头部 77 / 底部 67 / 圆角 2px）', () => {
    expect(tokenValue('layout-header-h')).toBe('77px');
    expect(tokenValue('layout-bottom-h')).toBe('67px');
    expect(tokenValue('radius-sm')).toBe('2px');
    expect(tokenValue('radius-md')).toBe('4px');
    expect(tokenValue('radius-lg')).toBe('10px');
  });

  it('源项目专属 token 存在（面板标题栏渐变 / 滚动条渐变 / 标题辉光 / 分类调性底）', () => {
    expect(tokenValue('panel-head-gradient')).toContain('rgb(0 80 160 / 45%)');
    expect(tokenValue('scrollbar-thumb')).toContain('linear-gradient');
    expect(tokenValue('header-title-glow')).toContain('20px');
    expect(tokenValue('tone-fire-bg')).toContain('linear-gradient');
    expect(tokenValue('tone-dcs-bg')).toContain('linear-gradient');
  });

  it('后台 / 移动端主题覆盖块不受迁移影响', () => {
    expect(tokenCss).toContain(":root[data-theme='mgmt']");
    expect(tokenCss).toContain(":root[data-theme='mobile']");
    expect(tokenCss).toContain('--primary-mgmt: #0b69d7');
    expect(tokenCss).toContain('--primary-mobile: #1677ff');
  });
});
