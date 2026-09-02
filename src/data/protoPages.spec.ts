import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { protoPageIds } from './protoPages';

/*
 * pc-admin 原型页清单一致性校验：
 * protoPages.ts 必须与 public/pc-admin/index.html 中实际注册的 data-page 完全一致，
 * 防止菜单路由指向不存在的原型页（iframe 空白）。
 */

function extractIndexPageIds(): string[] {
  const html = readFileSync(resolve(process.cwd(), 'public/pc-admin/index.html'), 'utf-8');
  return [...html.matchAll(/data-page="([^"]+)"/g)].map((m) => m[1]);
}

describe('protoPages 清单一致性', () => {
  it('与原型 index.html 的 data-page 集合完全一致', () => {
    const actual = extractIndexPageIds();
    const unique = [...new Set(actual)];
    expect([...protoPageIds].sort()).toEqual([...unique].sort());
  });

  it('清单自身无重复项', () => {
    expect(new Set(protoPageIds).size).toBe(protoPageIds.length);
  });

  it('默认页 alarm-record 存在（嵌入页回退目标）', () => {
    expect(protoPageIds).toContain('alarm-record');
  });
});
