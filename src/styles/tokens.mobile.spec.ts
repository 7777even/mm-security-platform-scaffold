/*
 * tokens.mobile.spec.ts — 移动端无障碍模式 token 守门测试
 * 断言 tokens.css 移动端块已包含「户外高对比 + 适老三档」令牌，防止被意外回退。
 * 直读源文件（?raw 在 vitest node 环境会被 css 处理器毙掉，返回空串）。
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tokenCss: string = readFileSync(new URL('./tokens.css', import.meta.url), 'utf-8');

/** 提取指定选择器块内的令牌文本 */
function blockTokens(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`);
  const m = tokenCss.match(re);
  return m ? m[1] : '';
}

describe('tokens.css 移动端无障碍模式', () => {
  it('基础块定义边框宽度单源 --mb-border-w:1px', () => {
    expect(tokenCss).toContain(":root[data-theme='mobile']");
    expect(tokenCss).toMatch(/--mb-border-w:\s*1px/);
  });

  it('户外高对比块补 2px 硬黑描边', () => {
    const blk = blockTokens("[data-theme='mobile'][data-skin='outdoor']");
    expect(blk).toContain('--color-border: #000');
    expect(blk).toContain('--mb-border-w: 2px');
  });

  it('适老 large 档：放大字号 + 热区 ≥56（--mb-row-h-elder）', () => {
    const blk = blockTokens("[data-theme='mobile'][data-elder='large']");
    expect(blk).toMatch(/--mb-fz-form-label:\s*17px/);
    expect(blk).toMatch(/--mb-fz-tip:\s*13px/);
    expect(blk).toContain('--mb-row-h: var(--mb-row-h-elder)');
  });

  it('适老 xlarge 档：字号比 large 更大', () => {
    const large = blockTokens("[data-theme='mobile'][data-elder='large']");
    const xlarge = blockTokens("[data-theme='mobile'][data-elder='xlarge']");
    const largeForm = Number(large.match(/--mb-fz-form-label:\s*(\d+)px/)?.[1] ?? '0');
    const xlargeForm = Number(xlarge.match(/--mb-fz-form-label:\s*(\d+)px/)?.[1] ?? '0');
    expect(xlargeForm).toBeGreaterThan(largeForm);
    expect(xlarge).toContain('--mb-row-h: var(--mb-row-h-elder)');
  });
});
