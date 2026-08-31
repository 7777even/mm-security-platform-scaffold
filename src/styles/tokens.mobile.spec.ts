/*
 * tokens.mobile.spec.ts — 移动端无障碍模式 token 守门测试
 * 断言 tokens.css 移动端块已包含「户外高对比 + 适老开关（开即最大字号）」令牌，防止被意外回退。
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tokenCss: string = readFileSync(new URL('./tokens.css', import.meta.url), 'utf-8');

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

  it('适老开启（data-elder=on）即最大字号 + 热区 ≥56', () => {
    expect(tokenCss).toContain("[data-theme='mobile'][data-elder='on']");
    const blk = blockTokens("[data-theme='mobile'][data-elder='on']");
    // 最大档（原“特大”19-22-17）正文 19 / 辅文 15
    expect(blk).toMatch(/--mb-fz-form-label:\s*19px/);
    expect(blk).toMatch(/--mb-fz-tip:\s*15px/);
    expect(blk).toMatch(/--mb-fz-help:\s*17px/);
    expect(blk).toContain('--mb-row-h: var(--mb-row-h-elder)');
    expect(blk).toContain('--mb-btn-h: var(--mb-btn-h-elder)');
  });

  it('适老仅为开关：不存在 large / xlarge 三选一档位', () => {
    expect(tokenCss).not.toContain("[data-theme='mobile'][data-elder='large']");
    expect(tokenCss).not.toContain("[data-theme='mobile'][data-elder='xlarge']");
  });
});
